import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { ChatModule } from './chat/chat.module';
import { MemoryModule } from './memory/memory.module';
import { VoiceModule } from './voice/voice.module';
import { AvatarModule } from './avatar/avatar.module';
import { LlmModule } from './llm/llm.module';
import { EmbeddingModule } from './embedding/embedding.module';
import { DocumentModule } from './document/document.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    ProfileModule,
    EnrollmentModule,
    ChatModule,
    MemoryModule,
    VoiceModule,
    AvatarModule,
    LlmModule,
    EmbeddingModule,
    DocumentModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
