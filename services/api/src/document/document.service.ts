import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);
  private s3: S3Client;
  private bucket = 'documents';

  constructor(
    private prisma: PrismaService,
    private embeddingService: EmbeddingService,
  ) {
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

  /**
   * Upload a document, chunk it, and generate embeddings.
   */
  async uploadDocument(profileId: string, file: Express.Multer.File) {
    const s3Key = `${profileId}/${uuid()}-${file.originalname}`;

    // Upload to MinIO
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    // Create document record
    const document = await this.prisma.document.create({
      data: {
        profileId,
        filename: file.originalname,
        mimeType: file.mimetype,
        s3Key,
        status: 'processing',
      },
    });

    // Process in background (non-blocking)
    this.processDocument(document.id, profileId, file.buffer.toString('utf-8')).catch(
      (error) => this.logger.error(`Document processing failed: ${error.message}`),
    );

    return document;
  }

  /**
   * Chunk text and generate embeddings for each chunk.
   */
  private async processDocument(
    documentId: string,
    profileId: string,
    text: string,
  ): Promise<void> {
    try {
      const chunks = this.chunkText(text, 500, 50); // 500 words per chunk, 50 overlap

      for (let i = 0; i < chunks.length; i++) {
        const chunk = await this.prisma.documentChunk.create({
          data: {
            documentId,
            profileId,
            content: chunks[i],
            chunkIndex: i,
          },
        });

        // Generate and store embedding
        const embedding = await this.embeddingService.generateEmbedding(chunks[i]);
        if (embedding) {
          await this.embeddingService.storeChunkEmbedding(chunk.id, embedding);
        }
      }

      await this.prisma.document.update({
        where: { id: documentId },
        data: { chunkCount: chunks.length, status: 'ready' },
      });

      this.logger.log(`Document ${documentId} processed: ${chunks.length} chunks`);
    } catch (error) {
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'error' },
      });
      throw error;
    }
  }

  /**
   * Simple word-based text chunking with overlap.
   */
  private chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= chunkSize) return [words.join(' ')];

    const chunks: string[] = [];
    let start = 0;

    while (start < words.length) {
      const end = Math.min(start + chunkSize, words.length);
      chunks.push(words.slice(start, end).join(' '));
      start += chunkSize - overlap;
    }

    return chunks;
  }

  /**
   * List documents for a profile.
   */
  async listDocuments(profileId: string) {
    return this.prisma.document.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        chunkCount: true,
        status: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get document detail with download URL.
   */
  async getDocument(documentId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { chunks: { select: { id: true, chunkIndex: true, content: true } } },
    });
    if (!doc) throw new NotFoundException('Document not found');

    const url = await getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.bucket, Key: doc.s3Key }),
      { expiresIn: 3600 },
    );

    return { ...doc, downloadUrl: url };
  }

  /**
   * Delete a document and all its chunks.
   */
  async deleteDocument(documentId: string) {
    return this.prisma.document.delete({ where: { id: documentId } });
  }

  /**
   * Find relevant document chunks for a query (RAG retrieval).
   */
  async findRelevantChunks(profileId: string, query: string, limit = 5) {
    // Try vector similarity first
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);
    if (queryEmbedding) {
      const results = await this.embeddingService.findSimilarChunks(
        profileId,
        queryEmbedding,
        limit,
      );
      if (results.length > 0) return results;
    }

    // Fallback: keyword search
    const keywords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    if (keywords.length === 0) return [];

    const allChunks = await this.prisma.documentChunk.findMany({
      where: { profileId },
      select: { id: true, content: true, documentId: true },
    });

    const scored = allChunks
      .map((c) => {
        const lower = c.content.toLowerCase();
        let score = 0;
        for (const kw of keywords) {
          if (lower.includes(kw)) score += 1;
        }
        return { ...c, similarity: score };
      })
      .filter((c) => c.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return scored;
  }
}
