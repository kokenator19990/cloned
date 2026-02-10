import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as bcrypt from 'bcrypt';
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

    const token = this.jwtService.sign({ sub: user.id, email: user.email, name: user.displayName });

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
    const token = this.jwtService.sign({ sub: user.id, email: user.email, name: user.displayName });

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

  async createGuestSession() {
    const guestId = `guest-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes

    const user = await this.prisma.user.create({
      data: {
        email: `${guestId}@guest.cloned.local`,
        passwordHash: await bcrypt.hash(Math.random().toString(36), 10),
        displayName: `Invitado ${new Date().toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
        isGuest: true,
        expiresAt,
      },
    });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.displayName,
      isGuest: true,
      expiresAt: expiresAt.toISOString(),
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isGuest: true,
        expiresAt: expiresAt.toISOString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async cleanupExpiredGuests() {
    const now = new Date();
    const expiredGuests = await this.prisma.user.findMany({
      where: {
        isGuest: true,
        expiresAt: { lte: now },
      },
    });

    for (const guest of expiredGuests) {
      await this.prisma.personaProfile.deleteMany({ where: { userId: guest.id } });
      await this.prisma.user.delete({ where: { id: guest.id } });
    }

    return { deletedCount: expiredGuests.length };
  }
}
