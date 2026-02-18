import {
  Controller, Post, Get, Param, Body, UseGuards, Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';

class SendMessageDto {
  @IsString()
  @MinLength(1)
  content!: string;

  @IsOptional()
  @IsBoolean()
  voiceUsed?: boolean;
}

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) { }

  /** Start a chat session with a public profile (any authenticated user, including guests) */
  @Post('public/:shareCode/sessions')
  async createPublicSession(@Request() req: any, @Param('shareCode') shareCode: string) {
    return this.chatService.createPublicSession(shareCode, req.user.userId);
  }

  @Post(':profileId/sessions')
  async createSession(@Request() req: any, @Param('profileId') profileId: string) {
    return this.chatService.createSession(profileId, req.user.userId);
  }

  @Get(':profileId/sessions')
  async listSessions(@Request() req: any, @Param('profileId') profileId: string) {
    return this.chatService.listSessions(profileId, req.user.userId);
  }

  @Get('sessions/:sessionId/messages')
  async getMessages(@Request() req: any, @Param('sessionId') sessionId: string) {
    return this.chatService.getMessages(sessionId, req.user.userId);
  }

  @Post('sessions/:sessionId/messages')
  async sendMessage(
    @Request() req: any,
    @Param('sessionId') sessionId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(
      sessionId,
      req.user.userId,
      dto.content,
      dto.voiceUsed,
    );
  }
}
