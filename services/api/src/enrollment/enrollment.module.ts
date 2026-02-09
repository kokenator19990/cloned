import { Module } from '@nestjs/common';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentQuestionsService } from './enrollment-questions.service';
import { LlmModule } from '../llm/llm.module';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [LlmModule, MemoryModule],
  controllers: [EnrollmentController],
  providers: [EnrollmentService, EnrollmentQuestionsService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
