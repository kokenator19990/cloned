import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async register(email: string, password: string, displayName: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, displayName },
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  }

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    // Delete all profiles (cascades to memories, sessions, etc.)
    await this.prisma.personaProfile.deleteMany({ where: { userId } });
    // Delete the user
    await this.prisma.user.delete({ where: { id: userId } });

    return { deleted: true };
  }

  async createGuest() {
    const guestId = randomUUID();
    const guestEmail = `guest-${guestId}@guest.local`;
    const passwordHash = await bcrypt.hash(guestId, 4); // fast hash, not for real auth
    const guestExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const user = await this.prisma.user.create({
      data: {
        email: guestEmail,
        passwordHash,
        displayName: 'Invitado',
        isGuest: true,
        guestExpiresAt,
      },
    });

    const token = this.jwtService.sign(
      { sub: user.id, email: user.email, isGuest: true },
      { expiresIn: '30m' },
    );

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isGuest: true,
      },
      guestExpiresAt: guestExpiresAt.toISOString(),
    };
  }

  async cleanupExpiredGuests(): Promise<{ deleted: number }> {
    const logger = new Logger('GuestCleanup');
    const expired = await this.prisma.user.findMany({
      where: { isGuest: true, guestExpiresAt: { lt: new Date() } },
      select: { id: true },
    });

    if (expired.length === 0) return { deleted: 0 };

    const ids = expired.map((u) => u.id);

    // Delete profiles first (cascade handles memories, sessions, etc.)
    await this.prisma.personaProfile.deleteMany({ where: { userId: { in: ids } } });
    // Delete chat sessions owned by guest
    await this.prisma.chatSession.deleteMany({ where: { userId: { in: ids } } });
    // Delete guest users
    await this.prisma.user.deleteMany({ where: { id: { in: ids } } });

    logger.log(`Cleaned up ${ids.length} expired guest(s)`);
    return { deleted: ids.length };
  }
}
