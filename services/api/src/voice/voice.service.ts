import { Injectable, Logger } from '@nestjs/common';
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

  constructor(private prisma: PrismaService) {
    this.s3 = new S3Client({
      endpoint: `http${process.env.MINIO_USE_SSL === 'true' ? 's' : ''}://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'deadbot',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'deadbot_dev_2024',
      },
      forcePathStyle: true,
    });
    // Pluggable provider URLs (defaults to OpenAI)
    this.sttUrl = process.env.STT_API_URL || 'https://api.openai.com/v1/audio/transcriptions';
    this.ttsUrl = process.env.TTS_API_URL || 'https://api.openai.com/v1/audio/speech';
    this.voiceCloningEnabled = process.env.VOICE_CLONING_ENABLED === 'true';
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

  async speechToText(audioBuffer: Buffer, mimetype = 'audio/wav'): Promise<string> {
    try {
      // Whisper-compatible API (OpenAI /v1/audio/transcriptions format)
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimetype });
      formData.append('file', blob, 'audio.wav');
      formData.append('model', 'whisper-1');

      const response = await fetch(this.sttUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.LLM_API_KEY || ''}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`STT provider returned ${response.status}`);
      }

      const result = (await response.json()) as { text?: string };
      return result.text || '[No transcription returned]';
    } catch (error) {
      this.logger.warn(`STT failed, returning placeholder: ${(error as Error).message}`);
      return '[STT provider unavailable - audio received successfully]';
    }
  }

  async textToSpeech(text: string, _profileId?: string): Promise<Buffer> {
    try {
      // OpenAI-compatible TTS API format
      const response = await fetch(this.ttsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.LLM_API_KEY || ''}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: 'alloy',
          response_format: 'wav',
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS provider returned ${response.status}`);
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
