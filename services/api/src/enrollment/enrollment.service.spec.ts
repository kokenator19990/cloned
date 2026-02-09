import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentService, CoverageEntry } from './enrollment.service';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentQuestionsService } from './enrollment-questions.service';
import { MemoryService } from '../memory/memory.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  let prisma: PrismaService;

  const defaultCoverage: Record<string, CoverageEntry> = {
    LINGUISTIC: { count: 0, minRequired: 5, covered: false },
    LOGICAL: { count: 0, minRequired: 5, covered: false },
    MORAL: { count: 0, minRequired: 5, covered: false },
    VALUES: { count: 0, minRequired: 5, covered: false },
    ASPIRATIONS: { count: 0, minRequired: 5, covered: false },
    PREFERENCES: { count: 0, minRequired: 5, covered: false },
    AUTOBIOGRAPHICAL: { count: 0, minRequired: 10, covered: false },
    EMOTIONAL: { count: 0, minRequired: 5, covered: false },
  };

  const mockProfile = {
    id: 'profile-1',
    userId: 'user-1',
    name: 'Jorge',
    status: 'ENROLLING',
    minInteractions: 50,
    currentInteractions: 0,
    coverageMap: { ...defaultCoverage },
    voiceConsentGiven: false,
    consistencyScore: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentService,
        {
          provide: PrismaService,
          useValue: {
            personaProfile: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            enrollmentQuestion: {
              findMany: jest.fn().mockResolvedValue([]),
              findUnique: jest.fn(),
              create: jest.fn().mockResolvedValue({
                id: 'q-1',
                profileId: 'profile-1',
                category: 'LINGUISTIC',
                question: 'How do you express frustration?',
                turnNumber: 1,
              }),
              update: jest.fn(),
            },
          },
        },
        {
          provide: EnrollmentQuestionsService,
          useValue: {
            generateQuestion: jest.fn().mockResolvedValue({
              category: 'LINGUISTIC',
              question: 'How do you express frustration?',
            }),
          },
        },
        {
          provide: MemoryService,
          useValue: {
            addMemory: jest.fn().mockResolvedValue({ id: 'mem-1' }),
          },
        },
      ],
    }).compile();

    service = module.get<EnrollmentService>(EnrollmentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('startEnrollment', () => {
    it('should return first question for valid profile', async () => {
      (prisma.personaProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);

      const result = await service.startEnrollment('profile-1', 'user-1');

      expect(result.question).toBeDefined();
      expect(result.profileId).toBe('profile-1');
      expect(result.turnNumber).toBe(1);
    });

    it('should throw NotFoundException for missing profile', async () => {
      (prisma.personaProfile.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.startEnrollment('bad-id', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException for wrong user', async () => {
      (prisma.personaProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);

      await expect(service.startEnrollment('profile-1', 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('submitAnswer', () => {
    it('should save answer and update coverage', async () => {
      (prisma.personaProfile.findUnique as jest.Mock).mockResolvedValue({
        ...mockProfile,
        currentInteractions: 5,
      });
      (prisma.enrollmentQuestion.findUnique as jest.Mock).mockResolvedValue({
        id: 'q-1',
        profileId: 'profile-1',
        category: 'LINGUISTIC',
        question: 'How do you express frustration?',
      });
      (prisma.personaProfile.update as jest.Mock).mockResolvedValue(mockProfile);

      const result = await service.submitAnswer(
        'profile-1',
        'user-1',
        'q-1',
        'I usually go silent',
      );

      expect(prisma.enrollmentQuestion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'q-1' },
          data: expect.objectContaining({ answer: 'I usually go silent' }),
        }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('getProgress', () => {
    it('should return progress with coverage info', async () => {
      (prisma.personaProfile.findUnique as jest.Mock).mockResolvedValue({
        ...mockProfile,
        currentInteractions: 25,
      });

      const result = await service.getProgress('profile-1', 'user-1');

      expect(result.totalInteractions).toBe(25);
      expect(result.minRequired).toBe(50);
      expect(result.coverageMap).toBeDefined();
      expect(result.isReady).toBe(false);
    });

    it('should show isReady=true when fully covered and enough interactions', async () => {
      const fullCoverage: Record<string, CoverageEntry> = {};
      for (const cat of Object.keys(defaultCoverage)) {
        fullCoverage[cat] = { count: 10, minRequired: defaultCoverage[cat].minRequired, covered: true };
      }

      (prisma.personaProfile.findUnique as jest.Mock).mockResolvedValue({
        ...mockProfile,
        currentInteractions: 50,
        coverageMap: fullCoverage,
      });

      const result = await service.getProgress('profile-1', 'user-1');

      expect(result.isReady).toBe(true);
      expect(result.percentComplete).toBe(100);
    });
  });
});
