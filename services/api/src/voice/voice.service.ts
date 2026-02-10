import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);
  private s3: S3Client;
  private bucket = 'voice-samples';
  private sttUrl: string;
  private ttsUrl: string;
  private voiceCloningEnabled: boolean;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.s3 = new S3Client({
      endpoint: `http${this.config.get('MINIO_USE_SSL') === 'true' ? 's' : ''}://${this.config.get('MINIO_ENDPOINT', 'localhost')}:${this.config.get('MINIO_PORT', '9000')}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.config.get('MINIO_ACCESS_KEY', 'deadbot'),
        secretAccessKey: this.config.get('MINIO_SECRET_KEY', 'deadbot_dev_2024'),
      },
      forcePathStyle: true,
    });
    // Pluggable STT/TTS provider URLs
    this.sttUrl = this.config.get('STT_API_URL', 'http://localhost:8000/v1/audio/transcriptions');
    this.ttsUrl = this.config.get('TTS_API_URL', 'http://localhost:8000/v1/audio/speech');
    this.voiceCloningEnabled = this.config.get('VOICE_CLONING_ENABLED') === 'true';
    
    this.logger.log(`Voice service initialized - STT: ${this.sttUrl}, TTS: ${this.ttsUrl}, Cloning: ${this.voiceCloningEnabled}`);
  }

  async uploadSample(profileId: string, file: Express.Multer.File, isConsent = false) {
    const key = `${profileId}/${uuid()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const durationSeconds = file.size / 16000; // rough estimate

    const sample = await this.prisma.voiceSample.create({
      data: {
        profileId,
        s3Key: key,
        durationSeconds,
        consentPhrase: isConsent,
      },
    });

    if (isConsent) {
      await this.prisma.personaProfile.update({
        where: { id: profileId },
        data: { voiceConsentGiven: true },
      });
    }

    return sample;
  }

  async listSamples(profileId: string) {
    return this.prisma.voiceSample.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSampleUrl(sampleId: string) {
    const sample = await this.prisma.voiceSample.findUnique({ where: { id: sampleId } });
    if (!sample) return null;

    const url = await getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.bucket, Key: sample.s3Key }),
      { expiresIn: 3600 },
    );

    return { ...sample, url };
  }

  async speechToText(audioBuffer: Buffer, mimetype = 'audio/wav', profileId?: string): Promise<string> {
    // Check if STT is configured
    if (!this.sttUrl || this.sttUrl === '') {
      this.logger.warn('STT_API_URL not configured');
      return 'Speech transcription not configured';
    }

    try {
      // Whisper-compatible API (OpenAI /v1/audio/transcriptions format)
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimetype });
      formData.append('file', blob, 'audio.wav');
      formData.append('model', 'whisper-1');
      
      // Add profileId if provided for voice-specific models
      if (profileId) {
        formData.append('profileId', profileId);
      }

      const response = await fetch(this.sttUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.get('LLM_API_KEY', '')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`STT provider returned ${response.status}: ${errorText}`);
      }

      const result = (await response.json()) as { text?: string };
      return result.text || '[No transcription returned]';
    } catch (error) {
      this.logger.warn(`STT failed: ${(error as Error).message}`);
      return '[STT provider unavailable - audio received successfully]';
    }
  }

  async textToSpeech(text: string, profileId?: string): Promise<Buffer> {
    // Check if TTS is configured
    if (!this.ttsUrl || this.ttsUrl === '') {
      this.logger.warn('TTS_API_URL not configured, returning silence');
      return this.generateSilenceWav(1);
    }

    try {
      // OpenAI-compatible TTS API format
      const requestBody: any = {
        model: 'tts-1',
        input: text,
        voice: 'alloy',
        response_format: 'wav',
      };

      // Add profileId if provided for voice cloning
      if (profileId && this.voiceCloningEnabled) {
        requestBody.profileId = profileId;
      }

      const response = await fetch(this.ttsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.get('LLM_API_KEY', '')}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`TTS provider returned ${response.status}: ${errorText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      this.logger.warn(`TTS failed, returning silence: ${(error as Error).message}`);
      return this.generateSilenceWav(1); // 1 second of silence as fallback
    }
  }

  /**
   * Generate a minimal valid WAV file with silence (fallback).
   */
  private generateSilenceWav(durationSeconds: number): Buffer {
    const sampleRate = 16000;
    const numSamples = sampleRate * durationSeconds;
    const dataSize = numSamples * 2; // 16-bit = 2 bytes per sample
    const buffer = Buffer.alloc(44 + dataSize);

    // WAV header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // chunk size
    buffer.writeUInt16LE(1, 20);  // PCM
    buffer.writeUInt16LE(1, 22);  // mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
    buffer.writeUInt16LE(2, 32);  // block align
    buffer.writeUInt16LE(16, 34); // bits per sample
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    // Data is already zeroed (silence)

    return buffer;
  }

  isVoiceCloningEnabled(): boolean {
    return this.voiceCloningEnabled;
  }
}
