import {
  Controller, Post, Get, Param, Body, UseGuards, Request,
  UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VoiceService } from './voice.service';

@ApiTags('voice')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('voice')
export class VoiceController {
  constructor(private voiceService: VoiceService) {}

  @Post(':profileId/upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('profileId') profileId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.voiceService.uploadSample(profileId, file, false);
  }

  @Post(':profileId/consent')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async consent(
    @Param('profileId') profileId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.voiceService.uploadSample(profileId, file, true);
  }

  @Get(':profileId/samples')
  async listSamples(@Param('profileId') profileId: string) {
    return this.voiceService.listSamples(profileId);
  }

  @Post('stt')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async stt(@UploadedFile() file: Express.Multer.File) {
    const text = await this.voiceService.speechToText(file.buffer, file.mimetype);
    return { text };
  }

  @Post('tts')
  async tts(@Body() body: { text: string; profileId?: string }) {
    const audio = await this.voiceService.textToSpeech(body.text, body.profileId);
    return { audio: audio.toString('base64'), format: 'wav', size: audio.length };
  }

  @Get('config')
  async getConfig() {
    return {
      voiceCloningEnabled: this.voiceService.isVoiceCloningEnabled(),
      sttAvailable: true,
      ttsAvailable: true,
    };
  }
}
