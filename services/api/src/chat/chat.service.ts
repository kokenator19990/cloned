import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemoryService } from '../memory/memory.service';
import { LlmService } from '../llm/llm.service';
import { DocumentService } from '../document/document.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private memoryService: MemoryService,
    private llmService: LlmService,
    private documentService: DocumentService,
  ) { }

  async createSession(profileId: string, userId: string) {
    const profile = await this.prisma.personaProfile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found');
    if (profile.userId !== userId) throw new ForbiddenException();

    // Allow guests to chat even during enrollment
    if (profile.status !== 'ACTIVE') {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user?.isGuest) {
        throw new ForbiddenException('Profile must be ACTIVE to chat. Complete enrollment first.');
      }
    }

    return this.prisma.chatSession.create({
      data: { profileId, userId },
    });
  }

  /** Create a chat session with a public profile using its shareCode — any user can do this */
  async createPublicSession(shareCode: string, userId: string) {
    const profile = await this.prisma.personaProfile.findUnique({ where: { shareCode } });
    if (!profile || !profile.isPublic) throw new NotFoundException('Public profile not found');
    
    // Only allow chat with ACTIVE public profiles
    if (profile.status !== 'ACTIVE') {
      throw new ForbiddenException('This profile is not ready for chat yet. It needs to complete enrollment first.');
    }

    return this.prisma.chatSession.create({
      data: { profileId: profile.id, userId },
    });
  }

  async listSessions(profileId: string, userId: string) {
    const profile = await this.prisma.personaProfile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException();
    if (profile.userId !== userId) throw new ForbiddenException();

    return this.prisma.chatSession.findMany({
      where: { profileId },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getMessages(sessionId: string, userId: string) {
    const session = await this.prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException();
    if (session.userId !== userId) throw new ForbiddenException();

    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
    });
  }

  async sendMessage(sessionId: string, userId: string, content: string, voiceUsed = false) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { profile: true },
    });
    if (!session) throw new NotFoundException();
    if (session.userId !== userId) throw new ForbiddenException();

    // Save user message
    const userMessage = await this.prisma.chatMessage.create({
      data: { sessionId, role: 'USER', content, voiceUsed },
    });

    // Get recent messages for context
    const recentMessages = await this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
      take: 20,
    });

    // Get relevant memories
    const memories = await this.memoryService.getRelevantMemories(
      session.profileId,
      content,
      15,
    );

    // Get relevant document chunks (RAG)
    const docChunks = await this.documentService.findRelevantChunks(
      session.profileId,
      content,
      5,
    );

    // Build system prompt with memory + document context
    const memoryItems = memories.map((m) => ({ content: m.content, category: m.category }));
    const docContext = docChunks.map((c) => c.content);
    const systemPrompt = this.llmService.buildPersonaSystemPrompt(
      session.profile.name,
      memoryItems,
      docContext,
    );

    // Build message history for LLM
    const llmMessages = recentMessages.map((m) => ({
      role: (m.role === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    }));

    // Generate response
    const responseText = await this.llmService.generateResponse(systemPrompt, llmMessages);

    // Save persona message
    const personaMessage = await this.prisma.chatMessage.create({
      data: { sessionId, role: 'PERSONA', content: responseText },
    });

    // Update session message count
    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { messageCount: { increment: 2 } },
    });

    // Store the interaction as ongoing learning
    await this.memoryService.addMemory(
      session.profileId,
      `[Chat] User: ${content}\n${session.profile.name}: ${responseText}`,
      'LINGUISTIC',
      0.3,
    );

    return { userMessage, personaMessage };
  }

  async *sendMessageStream(sessionId: string, userId: string, content: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { profile: true },
    });
    if (!session) throw new NotFoundException();
    if (session.userId !== userId) throw new ForbiddenException();

    await this.prisma.chatMessage.create({
      data: { sessionId, role: 'USER', content },
    });

    const recentMessages = await this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
      take: 20,
    });

    const memories = await this.memoryService.getRelevantMemories(
      session.profileId,
      content,
      15,
    );

    const docChunks = await this.documentService.findRelevantChunks(
      session.profileId,
      content,
      5,
    );

    const memoryItems = memories.map((m) => ({ content: m.content, category: m.category }));
    const docContext = docChunks.map((c) => c.content);
    const systemPrompt = this.llmService.buildPersonaSystemPrompt(
      session.profile.name,
      memoryItems,
      docContext,
    );

    const llmMessages = recentMessages.map((m) => ({
      role: (m.role === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    }));

    let fullResponse = '';
    for await (const chunk of this.llmService.generateResponseStream(systemPrompt, llmMessages)) {
      fullResponse += chunk;
      yield chunk;
    }

    await this.prisma.chatMessage.create({
      data: { sessionId, role: 'PERSONA', content: fullResponse },
    });

    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { messageCount: { increment: 2 } },
    });
  }
}
