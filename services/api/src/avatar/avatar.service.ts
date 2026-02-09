import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AvatarService {
  private s3: S3Client;
  private bucket = 'avatars';

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
  }

  async getConfig(profileId: string) {
    let config = await this.prisma.avatarConfig.findUnique({ where: { profileId } });
    if (!config) {
      config = await this.prisma.avatarConfig.create({
        data: { profileId },
      });
    }
    return config;
  }

  async updateConfig(
    profileId: string,
    data: { skin?: string; mood?: string; accessories?: string[] },
  ) {
    const existing = await this.getConfig(profileId);
    return this.prisma.avatarConfig.update({
      where: { id: existing.id },
      data: {
        skin: data.skin ?? existing.skin,
        mood: data.mood ?? existing.mood,
        accessories: (data.accessories ?? existing.accessories) as any,
      },
    });
  }

  async uploadPhoto(profileId: string, file: Express.Multer.File) {
    const key = `${profileId}/${uuid()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const config = await this.getConfig(profileId);
    return this.prisma.avatarConfig.update({
      where: { id: config.id },
      data: { baseImageKey: key },
    });
  }
}
