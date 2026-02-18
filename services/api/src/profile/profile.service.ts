import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_COVERAGE_MAP = {
  LINGUISTIC: { count: 0, minRequired: 5, covered: false },
  LOGICAL: { count: 0, minRequired: 5, covered: false },
  MORAL: { count: 0, minRequired: 5, covered: false },
  VALUES: { count: 0, minRequired: 5, covered: false },
  ASPIRATIONS: { count: 0, minRequired: 5, covered: false },
  PREFERENCES: { count: 0, minRequired: 5, covered: false },
  AUTOBIOGRAPHICAL: { count: 0, minRequired: 5, covered: false },
  EMOTIONAL: { count: 0, minRequired: 5, covered: false },
};

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) { }

  async listProfiles(userId: string) {
    return this.prisma.personaProfile.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { avatarConfig: true },
    });
  }

  async getProfile(profileId: string, userId: string) {
    const profile = await this.prisma.personaProfile.findUnique({
      where: { id: profileId },
      include: { avatarConfig: true, timeline: { orderBy: { detectedAt: 'desc' }, take: 20 } },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    if (profile.userId !== userId) throw new ForbiddenException();
    return profile;
  }

  async createProfile(userId: string, name: string, relationship?: string, description?: string) {
    // Check if user is guest → reduced requirements
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const isGuest = user?.isGuest ?? false;
    const minInteractions = isGuest ? 20 : 50;
    const minPerCategory = isGuest ? 2 : 5;

    const coverageMap: Record<string, { count: number; minRequired: number; covered: boolean }> = {};
    for (const cat of Object.keys(DEFAULT_COVERAGE_MAP)) {
      coverageMap[cat] = { count: 0, minRequired: minPerCategory, covered: false };
    }

    return this.prisma.personaProfile.create({
      data: {
        userId,
        name,
        relationship: relationship || null,
        description: description || null,
        minInteractions,
        coverageMap,
      },
      include: { avatarConfig: true },
    });
  }

  async deleteProfile(profileId: string, userId: string) {
    const profile = await this.prisma.personaProfile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found');
    if (profile.userId !== userId) throw new ForbiddenException();
    await this.prisma.personaProfile.delete({ where: { id: profileId } });
    return { deleted: true };
  }

  async activateProfile(profileId: string, userId: string) {
    const profile = await this.getProfile(profileId, userId);
    if (profile.currentInteractions < profile.minInteractions) {
      throw new ForbiddenException(
        `Need at least ${profile.minInteractions} interactions. Current: ${profile.currentInteractions}`,
      );
    }
    return this.prisma.personaProfile.update({
      where: { id: profileId },
      data: { status: 'ACTIVE' },
    });
  }

  async exportProfile(profileId: string, userId: string) {
    const profile = await this.getProfile(profileId, userId);
    const memories = await this.prisma.cognitiveMemory.findMany({ where: { profileId } });
    const questions = await this.prisma.enrollmentQuestion.findMany({ where: { profileId } });
    const timeline = await this.prisma.personaTimeline.findMany({ where: { profileId } });
    const sessions = await this.prisma.chatSession.findMany({
      where: { profileId },
      include: { messages: true },
    });

    return {
      exportedAt: new Date().toISOString(),
      profile,
      memories,
      enrollmentQuestions: questions,
      timeline,
      chatSessions: sessions,
    };
  }
}
