import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentService, CoverageEntry } from './enrollment.service';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentQuestionsService } from './enrollment-questions.service';
import { MemoryService } from '../memory/memory.service';
import { LlmService } from '../llm/llm.service';
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
            getAllMemories: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: LlmService,
          useValue: {
            evaluateConsistency: jest.fn().mockResolvedValue(0.85),
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

    it('should calculate percentComplete correctly with partial coverage', async () => {
      const partialCoverage: Record<string, CoverageEntry> = {
        ...defaultCoverage,
        LINGUISTIC: { count: 5, minRequired: 5, covered: true },
        LOGICAL: { count: 5, minRequired: 5, covered: true },
        MORAL: { count: 3, minRequired: 5, covered: false },
        VALUES: { count: 0, minRequired: 5, covered: false },
      };

      (prisma.personaProfile.findUnique as jest.Mock).mockResolvedValue({
        ...mockProfile,
        currentInteractions: 25,
        coverageMap: partialCoverage,
      });

      const result = await service.getProgress('profile-1', 'user-1');

      expect(result.percentComplete).toBeGreaterThan(0);
      expect(result.percentComplete).toBeLessThan(100);
    });

    it('should throw ForbiddenException if userId does not match', async () => {
      (prisma.personaProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);

      await expect(service.getProgress('profile-1', 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('coverage tracking across all 8 categories', () => {
    it('should properly track LINGUISTIC category', async () => {
      const profile = {
        ...mockProfile,
        coverageMap: { ...defaultCoverage },
      };
      (prisma.personaProfile.findUnique as jest.Mock).mockResolvedValue(profile);
      (prisma.enrollmentQuestion.findUnique as jest.Mock).mockResolvedValue({
        id: 'q-1',
        profileId: 'profile-1',
        category: 'LINGUISTIC',
        question: 'How do you express frustration?',
      });
      (prisma.personaProfile.update as jest.Mock).mockResolvedValue({
        ...profile,
        currentInteractions: 1,
        coverageMap: {
          ...defaultCoverage,
          LINGUISTIC: { count: 1, minRequired: 5, covered: false },
        },
      });

      await service.submitAnswer('profile-1', 'user-1', 'q-1', 'I say "hmm"');

      expect(prisma.personaProfile.update).toHaveBeenCalled();
    });

    it('should mark category as covered when reaching minRequired', async () => {
      const coverageWithFour: Record<string, CoverageEntry> = {
        ...defaultCoverage,
        LOGICAL: { count: 4, minRequired: 5, covered: false },
      };
      const profile = {
        ...mockProfile,
        coverageMap: coverageWithFour,
        currentInteractions: 4,
      };

      (prisma.personaProfile.findUnique as jest.Mock).mockResolvedValue(profile);
      (prisma.enrollmentQuestion.findUnique as jest.Mock).mockResolvedValue({
        id: 'q-2',
        profileId: 'profile-1',
        category: 'LOGICAL',
        question: 'How do you solve problems?',
      });

      let updatedCoverage: any;
      (prisma.personaProfile.update as jest.Mock).mockImplementation((args) => {
        updatedCoverage = args.data.coverageMap;
        return Promise.resolve({
          ...profile,
          currentInteractions: 5,
          coverageMap: updatedCoverage,
        });
      });

      await service.submitAnswer('profile-1', 'user-1', 'q-2', 'I think logically');

      expect(updatedCoverage.LOGICAL.count).toBe(5);
      expect(updatedCoverage.LOGICAL.covered).toBe(true);
    });

    it('should save memory with correct category', async () => {
      const memoryService = {
        addMemory: jest.fn().mockResolvedValue({ id: 'mem-1' }),
        getAllMemories: jest.fn().mockResolvedValue([]),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EnrollmentService,
          { provide: PrismaService, useValue: prisma },
          {
            provide: EnrollmentQuestionsService,
            useValue: { generateQuestion: jest.fn() },
          },
          { provide: MemoryService, useValue: memoryService },
          {
            provide: LlmService,
            useValue: { evaluateConsistency: jest.fn().mockResolvedValue(0.85) },
          },
        ],
      }).compile();

      const testService = module.get<EnrollmentService>(EnrollmentService);

      (prisma.personaProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);
      (prisma.enrollmentQuestion.findUnique as jest.Mock).mockResolvedValue({
        id: 'q-1',
        profileId: 'profile-1',
        category: 'MORAL',
        question: 'What are your values?',
      });
      (prisma.personaProfile.update as jest.Mock).mockResolvedValue(mockProfile);

      await testService.submitAnswer('profile-1', 'user-1', 'q-1', 'I value honesty');

      expect(memoryService.addMemory).toHaveBeenCalledWith(
        'profile-1',
        expect.stringContaining('What are your values?'),
        'MORAL',
        0.7,
      );
    });
  });

  describe('auto-activation when ready', () => {
    it('should auto-activate profile when reaching threshold', async () => {
      const fullCoverage: Record<string, CoverageEntry> = {};
      for (const cat of Object.keys(defaultCoverage)) {
        fullCoverage[cat] = { 
          count: defaultCoverage[cat].minRequired, 
          minRequired: defaultCoverage[cat].minRequired, 
          covered: true 
        };
      }

      const profile = {
        ...mockProfile,
        currentInteractions: 49,
        coverageMap: fullCoverage,
      };

      const llmService = {
        evaluateConsistency: jest.fn().mockResolvedValue(0.92),
      };
      const memoryService = {
        addMemory: jest.fn().mockResolvedValue({ id: 'mem-1' }),
        getAllMemories: jest.fn().mockResolvedValue([
          { id: 'mem-1', content: 'memory 1', category: 'LINGUISTIC' },
          { id: 'mem-2', content: 'memory 2', category: 'LOGICAL' },
        ]),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EnrollmentService,
          { provide: PrismaService, useValue: prisma },
          {
            provide: EnrollmentQuestionsService,
            useValue: { generateQuestion: jest.fn() },
          },
          { provide: MemoryService, useValue: memoryService },
          { provide: LlmService, useValue: llmService },
        ],
      }).compile();

      const testService = module.get<EnrollmentService>(EnrollmentService);

      (prisma.personaProfile.findUnique as jest.Mock).mockResolvedValue(profile);
      (prisma.enrollmentQuestion.findUnique as jest.Mock).mockResolvedValue({
        id: 'q-50',
        profileId: 'profile-1',
        category: 'EMOTIONAL',
        question: 'How do you feel?',
      });
      (prisma.enrollmentQuestion.update as jest.Mock).mockResolvedValue({});

      let activationCalled = false;
      let updateCallCount = 0;
      (prisma.personaProfile.update as jest.Mock).mockImplementation((args) => {
        updateCallCount++;
        
        // First call: update coverage and increment interactions
        if (updateCallCount === 1) {
          return Promise.resolve({
            ...profile,
            currentInteractions: 50,
            coverageMap: fullCoverage,
          });
        }
        
        // Second call: activation
        if (args.data.status === 'ACTIVE') {
          activationCalled = true;
          expect(args.data.consistencyScore).toBe(0.92);
        }
        
        return Promise.resolve({
          ...profile,
          currentInteractions: 50,
          coverageMap: fullCoverage,
          ...args.data,
        });
      });

      await testService.submitAnswer('profile-1', 'user-1', 'q-50', 'I feel good');

      expect(activationCalled).toBe(true);
      expect(llmService.evaluateConsistency).toHaveBeenCalled();
    });

    it('should not auto-activate if interactions below threshold', async () => {
      const fullCoverage: Record<string, CoverageEntry> = {};
      for (const cat of Object.keys(defaultCoverage)) {
        fullCoverage[cat] = { 
          count: defaultCoverage[cat].minRequired, 
          minRequired: defaultCoverage[cat].minRequired, 
          covered: true 
        };
      }

      const profile = {
        ...mockProfile,
        currentInteractions: 30,
        coverageMap: fullCoverage,
      };

      (prisma.personaProfile.findUnique as jest.Mock).mockResolvedValue(profile);
      (prisma.enrollmentQuestion.findUnique as jest.Mock).mockResolvedValue({
        id: 'q-1',
        profileId: 'profile-1',
        category: 'EMOTIONAL',
        question: 'How are you?',
      });

      let statusUpdate = null;
      (prisma.personaProfile.update as jest.Mock).mockImplementation((args) => {
        if (args.data.status) {
          statusUpdate = args.data.status;
        }
        return Promise.resolve({
          ...profile,
          currentInteractions: 31,
          ...args.data,
        });
      });

      await service.submitAnswer('profile-1', 'user-1', 'q-1', 'Good');

      expect(statusUpdate).toBeNull();
    });
  });

  describe('getNextQuestion', () => {
    it('should generate next question with coverage-aware logic', async () => {
      (prisma.personaProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);
      (prisma.enrollmentQuestion.findMany as jest.Mock).mockResolvedValue([
        { question: 'Previous question 1' },
        { question: 'Previous question 2' },
      ]);

      const result = await service.getNextQuestion('profile-1', 'user-1');

      expect(result.question).toBeDefined();
      expect(result.category).toBe('LINGUISTIC');
      expect(result.turnNumber).toBe(1);
    });

    it('should throw NotFoundException for missing profile', async () => {
      (prisma.personaProfile.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getNextQuestion('bad-id', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException for wrong user', async () => {
      (prisma.personaProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);

      await expect(service.getNextQuestion('profile-1', 'wrong-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
