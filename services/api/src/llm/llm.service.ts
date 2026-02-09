import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

interface CoverageEntry {
  count: number;
  minRequired: number;
  covered: boolean;
}

@Injectable()
export class LlmService {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      baseURL: process.env.LLM_BASE_URL || 'http://localhost:11434/v1',
      apiKey: process.env.LLM_API_KEY || 'ollama',
    });
    this.model = process.env.LLM_MODEL || 'llama3';
  }

  async generateResponse(
    systemPrompt: string,
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options?: { stream?: boolean; maxTokens?: number },
  ): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: options?.maxTokens ?? 1024,
      stream: false,
    });

    return completion.choices[0]?.message?.content ?? '';
  }

  async *generateResponseStream(
    systemPrompt: string,
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  ): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 1024,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield content;
    }
  }

  async generateEnrollmentQuestion(
    coverageMap: Record<string, CoverageEntry>,
    previousQuestions: string[],
    targetCategory: string,
  ): Promise<string | null> {
    try {
      const gaps = Object.entries(coverageMap)
        .filter(([, v]) => !v.covered)
        .map(([k, v]) => `${k}: ${v.count}/${v.minRequired}`)
        .join(', ');

      const recentQs = previousQuestions.slice(-5).join('\n- ');

      const prompt = `You are generating enrollment questions for a cognitive profile system.
Target category: ${targetCategory}
Coverage gaps: ${gaps}
Recent questions already asked:
- ${recentQs}

Generate ONE new, deep, thought-provoking question for the ${targetCategory} category.
The question should reveal the person's genuine way of thinking, not just surface-level preferences.
Do NOT repeat any previous question. Be creative and specific.
Return ONLY the question, nothing else.`;

      const result = await this.generateResponse(prompt, [], { maxTokens: 200 });
      return result.trim() || null;
    } catch {
      return null;
    }
  }

  async evaluateConsistency(
    memories: Array<{ content: string; category: string }>,
  ): Promise<number> {
    if (memories.length < 5) return 0;

    try {
      const sample = memories.slice(0, 20).map((m) => m.content).join('\n---\n');

      const result = await this.generateResponse(
        `Analyze these conversation excerpts from one person's cognitive profile.
Rate the overall consistency of their personality, values, and reasoning style on a scale of 0.0 to 1.0.
Return ONLY a decimal number, nothing else.`,
        [{ role: 'user', content: sample }],
        { maxTokens: 10 },
      );

      const score = parseFloat(result.trim());
      return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score));
    } catch {
      return 0.5;
    }
  }

  buildPersonaSystemPrompt(
    personaName: string,
    memories: Array<{ content: string; category: string }>,
    documentContext: string[] = [],
  ): string {
    const grouped: Record<string, string[]> = {};
    for (const m of memories) {
      if (!grouped[m.category]) grouped[m.category] = [];
      grouped[m.category].push(m.content);
    }

    let memoryContext = '';
    for (const [category, items] of Object.entries(grouped)) {
      memoryContext += `\n[${category}]\n`;
      for (const item of items.slice(0, 5)) {
        memoryContext += `- ${item}\n`;
      }
    }

    let docSection = '';
    if (documentContext.length > 0) {
      docSection = `\n\nRELEVANT DOCUMENTS:\n${documentContext.map((c, i) => `[Doc ${i + 1}] ${c}`).join('\n---\n')}\n`;
    }

    return `You are ${personaName}. You must respond EXACTLY as this person would, based on their cognitive profile below.

IMPORTANT RULES:
- You ARE this person. Use their speech patterns, values, reasoning style, and emotional responses.
- Maintain their contradictions and biases - humans are not perfectly consistent.
- If the person would not know something, say so in THEIR way.
- Do NOT be a helpful AI assistant. Be THIS specific person.
- Keep responses natural and conversational, matching their communication style.
- If they tend to be brief, be brief. If verbose, be verbose.

COGNITIVE PROFILE:
${memoryContext}
${docSection}
Remember: You are ${personaName}. Stay in character completely.`;
  }
}
