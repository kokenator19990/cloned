import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentQuestionsService } from './enrollment-questions.service';
import { MemoryService } from '../memory/memory.service';
import { LlmService } from '../llm/llm.service';
import { CognitiveCategory } from '@prisma/client';

export interface CoverageEntry {
  count: number;
  minRequired: number;
  covered: boolean;
}

@Injectable()
export class EnrollmentService {
  constructor(
    private prisma: PrismaService,
    private questionsService: EnrollmentQuestionsService,
    private memoryService: MemoryService,
    private llmService: LlmService,
  ) {}

  async startEnrollment(profileId: string, userId: string) {
    const profile = await this.prisma.personaProfile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found');
    if (profile.userId !== userId) throw new ForbiddenException();
    return this.getNextQuestion(profileId, userId);
  }

  async getNextQuestion(profileId: string, userId: string) {
    const profile = await this.prisma.personaProfile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found');
    if (profile.userId !== userId) throw new ForbiddenException();

    const previousQuestions = await this.prisma.enrollmentQuestion.findMany({
      where: { profileId },
      select: { question: true },
    });

    const coverageMap = profile.coverageMap as unknown as Record<string, CoverageEntry>;
    const { category, question } = await this.questionsService.generateQuestion(
      coverageMap,
      previousQuestions.map((q) => q.question),
    );

    const turnNumber = profile.currentInteractions + 1;
    const enrollmentQ = await this.prisma.enrollmentQuestion.create({
      data: {
        profileId,
        category: category as CognitiveCategory,
        question,
        turnNumber,
      },
    });

    return {
      id: enrollmentQ.id,
      profileId,
      category,
      question,
      turnNumber,
    };
  }

  async submitAnswer(profileId: string, userId: string, questionId: string, answer: string) {
    const profile = await this.prisma.personaProfile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found');
    if (profile.userId !== userId) throw new ForbiddenException();

    const question = await this.prisma.enrollmentQuestion.findUnique({
      where: { id: questionId },
    });
    if (!question || question.profileId !== profileId) {
      throw new NotFoundException('Question not found');
    }

    // Save the answer
    await this.prisma.enrollmentQuestion.update({
      where: { id: questionId },
      data: { answer, answeredAt: new Date() },
    });

    // Save as cognitive memory
    await this.memoryService.addMemory(
      profileId,
      `Q: ${question.question}\nA: ${answer}`,
      question.category,
      0.7,
    );

    // Update coverage map
    const coverageMap = profile.coverageMap as unknown as Record<string, CoverageEntry>;
    const cat = question.category;
    if (coverageMap[cat]) {
      coverageMap[cat].count += 1;
      coverageMap[cat].covered = coverageMap[cat].count >= coverageMap[cat].minRequired;
    }

    // Update profile
    const updatedProfile = await this.prisma.personaProfile.update({
      where: { id: profileId },
      data: {
        currentInteractions: { increment: 1 },
        coverageMap: coverageMap as unknown as any,
      },
    });

    // Auto-evaluate consistency and activate when ready
    const allCovered = Object.values(coverageMap).every((c) => c.covered);
    if (updatedProfile.currentInteractions >= updatedProfile.minInteractions && allCovered) {
      const memories = await this.memoryService.getAllMemories(profileId);
      const consistencyScore = await this.llmService.evaluateConsistency(
        memories.map((m) => ({ content: m.content, category: m.category })),
      );
      await this.prisma.personaProfile.update({
        where: { id: profileId },
        data: {
          consistencyScore,
          status: 'ACTIVE',
        },
      });
    }

    return this.getProgress(profileId, userId);
  }

  async getProgress(profileId: string, userId: string) {
    const profile = await this.prisma.personaProfile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found');
    if (profile.userId !== userId) throw new ForbiddenException();

    const coverageMap = profile.coverageMap as unknown as Record<string, CoverageEntry>;
    const totalCategories = Object.keys(coverageMap).length;
    const coveredCategories = Object.values(coverageMap).filter((c) => c.covered).length;

    const interactionProgress = Math.min(profile.currentInteractions / profile.minInteractions, 1);
    const coverageProgress = totalCategories > 0 ? coveredCategories / totalCategories : 0;
    const percentComplete = Math.round((interactionProgress * 0.6 + coverageProgress * 0.4) * 100);

    const isReady =
      profile.currentInteractions >= profile.minInteractions &&
      Object.values(coverageMap).every((c) => c.covered);

    return {
      profileId,
      totalInteractions: profile.currentInteractions,
      minRequired: profile.minInteractions,
      percentComplete,
      coverageMap,
      isReady,
    };
  }
}
