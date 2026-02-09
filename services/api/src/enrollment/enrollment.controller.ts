import {
  Controller, Post, Get, Param, Body, UseGuards, Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EnrollmentService } from './enrollment.service';
export { CoverageEntry } from './enrollment.service';

class SubmitAnswerDto {
  @IsString()
  questionId!: string;

  @IsString()
  @MinLength(1)
  answer!: string;
}

@ApiTags('enrollment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollment')
export class EnrollmentController {
  constructor(private enrollmentService: EnrollmentService) {}

  @Post(':profileId/start')
  async start(@Request() req: any, @Param('profileId') profileId: string) {
    return this.enrollmentService.startEnrollment(profileId, req.user.userId);
  }

  @Get(':profileId/next-question')
  async nextQuestion(@Request() req: any, @Param('profileId') profileId: string) {
    return this.enrollmentService.getNextQuestion(profileId, req.user.userId);
  }

  @Post(':profileId/answer')
  async submitAnswer(
    @Request() req: any,
    @Param('profileId') profileId: string,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.enrollmentService.submitAnswer(
      profileId,
      req.user.userId,
      dto.questionId,
      dto.answer,
    );
  }

  @Get(':profileId/progress')
  async progress(@Request() req: any, @Param('profileId') profileId: string) {
    return this.enrollmentService.getProgress(profileId, req.user.userId);
  }
}
