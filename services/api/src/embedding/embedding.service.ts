import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private client: OpenAI;
  private embeddingModel: string;
  private enabled: boolean;

  constructor(private prisma: PrismaService) {
    const baseURL = process.env.LLM_BASE_URL || 'http://localhost:11434/v1';
    this.client = new OpenAI({
      baseURL,
      apiKey: process.env.LLM_API_KEY || 'ollama',
    });
    this.embeddingModel =
      process.env.EMBEDDING_MODEL || 'nomic-embed-text';
    this.enabled = process.env.EMBEDDINGS_ENABLED !== 'false';
  }

  /**
   * Generate embedding vector for a text string.
   * Returns null if embeddings are disabled or the provider is unavailable.
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.enabled) return null;

    try {
      const response = await this.client.embeddings.create({
        model: this.embeddingModel,
        input: text.slice(0, 8000), // truncate to safe length
      });
      return response.data[0]?.embedding ?? null;
    } catch (error) {
      this.logger.warn(
        `Embedding generation failed, falling back to keyword scoring: ${(error as Error).message}`,
      );
      return null;
    }
  }

  /**
   * Store embedding vector for a CognitiveMemory row via raw SQL (Prisma doesn't natively support vector writes).
   */
  async storeMemoryEmbedding(memoryId: string, embedding: number[]): Promise<void> {
    const vectorStr = `[${embedding.join(',')}]`;
    await this.prisma.$executeRawUnsafe(
      `UPDATE "CognitiveMemory" SET embedding = $1::vector WHERE id = $2`,
      vectorStr,
      memoryId,
    );
  }

  /**
   * Store embedding vector for a DocumentChunk row.
   */
  async storeChunkEmbedding(chunkId: string, embedding: number[]): Promise<void> {
    const vectorStr = `[${embedding.join(',')}]`;
    await this.prisma.$executeRawUnsafe(
      `UPDATE "DocumentChunk" SET embedding = $1::vector WHERE id = $2`,
      vectorStr,
      chunkId,
    );
  }

  /**
   * Find similar CognitiveMemory rows by cosine similarity.
   * Falls back to returning empty array if pgvector is not available.
   */
  async findSimilarMemories(
    profileId: string,
    queryEmbedding: number[],
    limit = 10,
    threshold = 0.3,
  ): Promise<Array<{ id: string; content: string; category: string; importance: number; similarity: number }>> {
    try {
      const vectorStr = `[${queryEmbedding.join(',')}]`;
      const results = await this.prisma.$queryRawUnsafe<
        Array<{ id: string; content: string; category: string; importance: number; similarity: number }>
      >(
        `SELECT id, content, category, importance,
                1 - (embedding <=> $1::vector) as similarity
         FROM "CognitiveMemory"
         WHERE "profileId" = $2
           AND embedding IS NOT NULL
           AND 1 - (embedding <=> $1::vector) > $3
         ORDER BY embedding <=> $1::vector
         LIMIT $4`,
        vectorStr,
        profileId,
        threshold,
        limit,
      );
      return results;
    } catch (error) {
      this.logger.warn(`Vector similarity search failed: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Find similar DocumentChunk rows by cosine similarity.
   */
  async findSimilarChunks(
    profileId: string,
    queryEmbedding: number[],
    limit = 5,
    threshold = 0.3,
  ): Promise<Array<{ id: string; content: string; documentId: string; similarity: number }>> {
    try {
      const vectorStr = `[${queryEmbedding.join(',')}]`;
      const results = await this.prisma.$queryRawUnsafe<
        Array<{ id: string; content: string; documentId: string; similarity: number }>
      >(
        `SELECT id, content, "documentId",
                1 - (embedding <=> $1::vector) as similarity
         FROM "DocumentChunk"
         WHERE "profileId" = $2
           AND embedding IS NOT NULL
           AND 1 - (embedding <=> $1::vector) > $3
         ORDER BY embedding <=> $1::vector
         LIMIT $4`,
        vectorStr,
        profileId,
        threshold,
        limit,
      );
      return results;
    } catch (error) {
      this.logger.warn(`Document chunk similarity search failed: ${(error as Error).message}`);
      return [];
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
