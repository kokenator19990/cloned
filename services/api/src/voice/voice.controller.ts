import {
  Controller, Post, Get, Param, Body, UseGuards, Request,
  UploadedFile, UseInterceptors, Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
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

  @Post(':profileId/transcribe')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async transcribe(
    @Param('profileId') profileId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const text = await this.voiceService.speechToText(file.buffer, file.mimetype, profileId);
    return { text, profileId };
  }

  @Post(':profileId/synthesize')
  @ApiBody({ schema: { properties: { text: { type: 'string' } } } })
  async synthesize(
    @Param('profileId') profileId: string,
    @Body() body: { text: string },
    @Res() res: Response,
  ) {
    const audio = await this.voiceService.textToSpeech(body.text, profileId);
    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': audio.length,
    });
    res.send(audio);
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
