import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    passwordHash: '$2b$10$hashedpassword',
    displayName: 'Test User',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpassword');

      const result = await service.register('test@test.com', 'password123', 'Test User');

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@test.com');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        service.register('test@test.com', 'password123', 'Test User'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('test@test.com', 'password123');

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('test@test.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.login('no@user.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@test.com', 'password123');
      expect(result.id).toBe('user-1');
    });
  });

  describe('getUser', () => {
    it('should return user by id', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUser('user-1');
      expect(result.email).toBe('test@test.com');
    });

    it('should throw if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getUser('bad-id')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('deleteAccount', () => {
    it('should delete user and all profiles', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.personaProfile as any) = {
        deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
      };
      (prisma.user.delete as jest.Mock) = jest.fn().mockResolvedValue(mockUser);

      const result = await service.deleteAccount('user-1');

      expect(result.deleted).toBe(true);
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteAccount('bad-id')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('createGuestSession', () => {
    it('should create guest user with expiration', async () => {
      const guestUser = {
        ...mockUser,
        id: 'guest-123',
        email: 'guest-123@guest.cloned.local',
        displayName: 'Invitado 12:00',
        isGuest: true,
        expiresAt: new Date(Date.now() + 20 * 60 * 1000),
      };
      (prisma.user.create as jest.Mock).mockResolvedValue(guestUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpassword');

      const result = await service.createGuestSession();

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.isGuest).toBe(true);
      expect(result.user.expiresAt).toBeDefined();
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isGuest: true,
            expiresAt: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('cleanupExpiredGuests', () => {
    it('should delete expired guest users and their profiles', async () => {
      const expiredGuest1 = {
        ...mockUser,
        id: 'guest-1',
        isGuest: true,
        expiresAt: new Date(Date.now() - 10000),
      };
      const expiredGuest2 = {
        ...mockUser,
        id: 'guest-2',
        isGuest: true,
        expiresAt: new Date(Date.now() - 5000),
      };
      
      (prisma.user.findMany as jest.Mock) = jest.fn().mockResolvedValue([expiredGuest1, expiredGuest2]);
      (prisma.personaProfile as any) = {
        deleteMany: jest.fn().mockResolvedValue({ count: 3 }),
      };
      (prisma.user.delete as jest.Mock) = jest.fn().mockResolvedValue({});

      const result = await service.cleanupExpiredGuests();

      expect(result.deletedCount).toBe(2);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isGuest: true,
            expiresAt: expect.objectContaining({ lte: expect.any(Date) }),
          }),
        }),
      );
    });

    it('should return 0 when no expired guests', async () => {
      (prisma.user.findMany as jest.Mock) = jest.fn().mockResolvedValue([]);

      const result = await service.cleanupExpiredGuests();

      expect(result.deletedCount).toBe(0);
    });
  });
});
