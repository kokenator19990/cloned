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

  describe('createGuest', () => {
    it('should create a guest user and return a token', async () => {
      const guestUser = {
        id: 'guest-uuid',
        email: 'guest-xxx@guest.local',
        passwordHash: '$2b$04$hash',
        displayName: 'Invitado',
        isGuest: true,
        guestExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.user.create as jest.Mock).mockResolvedValue(guestUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$04$hash');

      const result = await service.createGuest();

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.isGuest).toBe(true);
      expect(result.user.displayName).toBe('Invitado');
      expect(result.guestExpiresAt).toBeDefined();
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isGuest: true }),
        }),
      );
    });
  });

  describe('cleanupExpiredGuests', () => {
    it('should delete expired guest users', async () => {
      const expiredGuests = [{ id: 'guest-1' }, { id: 'guest-2' }];
      (prisma.user.findMany as jest.Mock) = jest.fn().mockResolvedValue(expiredGuests);
      (prisma as any).personaProfile = { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) };
      (prisma as any).chatSession = { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) };
      (prisma.user as any).deleteMany = jest.fn().mockResolvedValue({ count: 2 });

      const result = await service.cleanupExpiredGuests();

      expect(result.deleted).toBe(2);
    });

    it('should return deleted:0 when no expired guests', async () => {
      (prisma.user.findMany as jest.Mock) = jest.fn().mockResolvedValue([]);

      const result = await service.cleanupExpiredGuests();

      expect(result.deleted).toBe(0);
    });
  });
});
