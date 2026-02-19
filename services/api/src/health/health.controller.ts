import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) { }

  @Get()
  async check() {
    const checks: Record<string, string> = {};

    // Database check
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'ok';
    } catch {
      checks.database = 'error';
    }

    // pgvector check
    try {
      await this.prisma.$queryRaw`SELECT extversion FROM pg_extension WHERE extname = 'vector'`;
      checks.pgvector = 'ok';
    } catch {
      checks.pgvector = 'error';
    }

    // Redis check
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const redis = new Redis(redisUrl, { maxRetriesPerRequest: 1, lazyConnect: true });
      await redis.connect();
      await redis.ping();
      redis.disconnect();
      checks.redis = 'ok';
    } catch {
      checks.redis = 'unreachable';
    }

    // LLM check (Ollama or OpenAI)
    try {
      const llmBase = process.env.LLM_BASE_URL || 'http://localhost:11434/v1';
      const modelsUrl = llmBase.replace('/v1', '') + (llmBase.includes('localhost:11434') ? '/api/tags' : '/v1/models');
      const res = await fetch(modelsUrl, {
        headers: { Authorization: `Bearer ${process.env.LLM_API_KEY || ''}` },
        signal: AbortSignal.timeout(3000),
      });
      checks.llm = res.ok ? 'ok' : `error (${res.status})`;
    } catch {
      checks.llm = 'unreachable';
    }

    const allOk = Object.values(checks).every((v) => v === 'ok');

    return {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      checks,
    };
  }
}

