import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) { }

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'All services healthy' })
  @ApiResponse({ status: 503, description: 'One or more services unhealthy' })
  async check(@Res() res: Response) {
    const checks: Record<string, string> = {};

    // Database check
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'ok';
    } catch (error) {
      checks.database = 'error';
    }

    // Redis check
    try {
      const Redis = (await import('ioredis')).default;
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const redis = new Redis(redisUrl, {
        lazyConnect: true,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
      });
      await redis.connect();
      await redis.ping();
      checks.redis = 'ok';
      await redis.quit();
    } catch (error) {
      checks.redis = 'unavailable';
    }

    // MinIO check
    try {
      const endpoint = process.env.MINIO_ENDPOINT || 'localhost:9000';
      const useSSL = process.env.MINIO_USE_SSL === 'true';
      const protocol = useSSL ? 'https' : 'http';
      const url = `${protocol}://${endpoint}/minio/health/live`;
      const response = await fetch(url, { 
        signal: AbortSignal.timeout(2000),
        method: 'GET',
      });
      checks.minio = response.ok ? 'ok' : 'error';
    } catch (error) {
      checks.minio = 'unavailable';
    }

    const criticalServices = ['database'];
    const allCriticalOk = criticalServices.every((service) => checks[service] === 'ok');
    const allOk = Object.values(checks).every((v) => v === 'ok');

    const statusCode = allCriticalOk ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    const status = allOk ? 'ok' : allCriticalOk ? 'degraded' : 'unhealthy';

    const response = {
      status,
      timestamp: new Date().toISOString(),
      checks,
    };

    return res.status(statusCode).json(response);
  }
}

