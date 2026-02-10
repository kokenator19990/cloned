import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CognitiveCategory } from '@prisma/client';
import { EmbeddingService } from '../embedding/embedding.service';

@Injectable()
export class MemoryService {
  constructor(
    private prisma: PrismaService,
    private embeddingService: EmbeddingService,
  ) {}

  async addMemory(
    profileId: string,
    content: string,
    category: CognitiveCategory | string,
    importance = 0.5,
    metadata?: Record<string, unknown>,
  ) {
    const memory = await this.prisma.cognitiveMemory.create({
      data: {
        profileId,
        content,
        category: category as CognitiveCategory,
        importance,
        metadata: (metadata ?? undefined) as any,
      },
    });

    // Generate and store embedding asynchronously (non-blocking)
    this.embeddingService
      .generateEmbedding(content)
      .then((embedding) => {
        if (embedding) {
          return this.embeddingService.storeMemoryEmbedding(memory.id, embedding);
        }
      })
      .catch(() => {
        /* embedding is best-effort */
      });

    return memory;
  }

  async getRelevantMemories(profileId: string, query: string, limit = 10) {
    // Try vector similarity search first
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);
    if (queryEmbedding) {
      const vectorResults = await this.embeddingService.findSimilarMemories(
        profileId,
        queryEmbedding,
        limit,
      );
      if (vectorResults.length > 0) {
        return vectorResults.map((r) => ({
          ...r,
          relevanceScore: r.similarity,
        }));
      }
    }

    // Fallback: keyword scoring
    const keywords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);

    const allMemories = await this.prisma.cognitiveMemory.findMany({
      where: { profileId },
      orderBy: { importance: 'desc' },
    });

    if (keywords.length === 0) {
      return allMemories.slice(0, limit);
    }

    const scored = allMemories.map((m) => {
      const lower = m.content.toLowerCase();
      let score = m.importance;
      for (const kw of keywords) {
        if (lower.includes(kw)) score += 0.3;
      }
      return { ...m, relevanceScore: score };
    });

    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return scored.slice(0, limit);
  }

  /**
   * Get relevant memories using vector similarity when available.
   * Alias for getRelevantMemories with explicit vector search emphasis.
   */
  async getRelevantMemoriesWithVectors(profileId: string, query: string, limit = 10) {
    return this.getRelevantMemories(profileId, query, limit);
  }

  async getMemoriesByCategory(profileId: string, category: CognitiveCategory) {
    return this.prisma.cognitiveMemory.findMany({
      where: { profileId, category },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getAllMemories(profileId: string) {
    return this.prisma.cognitiveMemory.findMany({
      where: { profileId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getTimeline(profileId: string) {
    return this.prisma.personaTimeline.findMany({
      where: { profileId },
      orderBy: { detectedAt: 'desc' },
    });
  }

  async addTimelineEvent(
    profileId: string,
    event: string,
    category: string,
    newValue: string,
    previousValue?: string,
    source = 'conversation',
  ) {
    return this.prisma.personaTimeline.create({
      data: {
        profileId,
        event,
        category,
        newValue,
        previousValue,
        source,
      },
    });
  }

  async deleteMemory(id: string) {
    return this.prisma.cognitiveMemory.delete({ where: { id } });
  }
}
