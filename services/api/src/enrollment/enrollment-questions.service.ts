import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';

interface CoverageEntry {
  count: number;
  minRequired: number;
  covered: boolean;
}

const FALLBACK_QUESTIONS: Record<string, string[]> = {
  LINGUISTIC: [
    'Describe something you love using exactly three sentences.',
    'What word or phrase do you catch yourself overusing?',
    'How would your closest friend describe the way you talk?',
    'If you had to write a one-paragraph autobiography, what would it say?',
    'Do you tend to be more formal or informal when communicating? Give me an example.',
    'What language or expression do you use when you are frustrated?',
    'How do you typically start a conversation with a stranger?',
    'Do you think in words, images, or something else entirely?',
    'What is a phrase your family always says that stuck with you?',
    'How would you explain your job to a five-year-old?',
    'When you write a message, do you edit it multiple times or send it immediately?',
    'What is the funniest expression you use regularly?',
  ],
  LOGICAL: [
    'You have to choose between two jobs: one pays double but you hate it, the other pays half but you love it. Walk me through your decision.',
    'Someone gives you a problem with incomplete information. Do you act on what you have or wait for more data?',
    'How do you typically weigh short-term benefits against long-term consequences?',
    'Describe a time you changed your mind about something important. What convinced you?',
    'If two close friends give you contradictory advice, how do you decide who to listen to?',
    'Do you trust your gut feeling or do you prefer to analyze everything step by step?',
    'How do you handle a situation where the logical answer conflicts with what feels right?',
    'If I gave you a complex project with a tight deadline, how would you approach prioritization?',
    'When you argue with someone, do you focus on being right or on understanding their point?',
    'Describe your process for making a big financial decision.',
    'How do you react when your initial plan fails and you need a backup?',
    'What is the most counterintuitive decision you have ever made that turned out well?',
  ],
  MORAL: [
    'Is it ever acceptable to lie to protect someone\'s feelings? Give me a specific example.',
    'Would you steal medicine to save someone you love if there was no other way?',
    'Do you believe the ends justify the means? Where do you draw the line?',
    'How do you define fairness? Is treating everyone equally always fair?',
    'Have you ever stayed silent about something wrong because speaking up felt too risky?',
    'What is a moral rule you would never break, no matter the circumstances?',
    'Do you judge people more by their intentions or by the outcomes of their actions?',
    'If you found out a close friend did something deeply unethical, what would you do?',
    'Is loyalty more important than honesty? When do they conflict?',
    'Do you believe people can genuinely change their moral character?',
    'What responsibility do we have toward strangers versus people we know personally?',
    'Describe an ethical dilemma you faced and how you resolved it.',
  ],
  VALUES: [
    'What would you fight for even if you knew you would lose?',
    'What three values define who you are?',
    'If you had to sacrifice one of your core values to protect another, which goes and which stays?',
    'What does success mean to you, completely separate from money?',
    'What value did your parents teach you that you still carry? What did you reject?',
    'Is freedom more important than security? Why?',
    'What do you think is the most undervalued quality in people?',
    'If the world reset tomorrow, what one principle would you want to rebuild society around?',
    'How do you decide what is truly important versus what just feels urgent?',
    'What do you value more in relationships: trust, honesty, or loyalty?',
    'Has there been a moment that shifted your core values? What happened?',
    'What would you want your children or future generations to learn from you?',
  ],
  ASPIRATIONS: [
    'If money did not exist, what would you do every day?',
    'Where do you see yourself in ten years, honestly, not the polished version?',
    'What dream have you quietly given up on? Do you regret it?',
    'If you could master one skill overnight, what would it be and why?',
    'What does the best version of your life look like?',
    'What scares you most about the future?',
    'Is there something you want to create or build before you die?',
    'What would you do differently if you knew nobody was watching or judging?',
    'What kind of legacy do you want to leave behind?',
    'If you could live anyone else\'s life for a year, whose would you choose?',
    'What goal have you been procrastinating on and why?',
    'Describe a moment when you felt you were exactly where you were supposed to be.',
  ],
  PREFERENCES: [
    'What is something most people enjoy that you genuinely dislike?',
    'Morning person or night owl? Why?',
    'What kind of music matches your current state of mind?',
    'Do you prefer deep conversations or lighthearted banter?',
    'What is your comfort food and what memory does it bring?',
    'Do you recharge alone or with people?',
    'What kind of environment makes you feel most creative?',
    'What topic could you talk about for hours without getting bored?',
    'Do you prefer routines or spontaneity? What happens when you are forced into the opposite?',
    'What is a deal-breaker in relationships for you?',
    'What is the last thing that made you genuinely laugh?',
    'If you could only watch one genre of movies for the rest of your life, what would it be?',
  ],
  AUTOBIOGRAPHICAL: [
    'Tell me about a moment that changed how you see the world.',
    'What is the hardest thing you have ever had to do?',
    'Describe a person who profoundly influenced who you are today.',
    'What is your earliest memory? How does it make you feel?',
    'What were you like as a teenager compared to now?',
    'Tell me about a failure that taught you more than any success.',
    'What was a turning point in your life that most people do not know about?',
    'What is a place you have lived or visited that became part of your identity?',
    'What was the best advice someone ever gave you?',
    'Describe a relationship that ended but still shapes who you are.',
    'What do you consider your greatest personal accomplishment?',
    'Tell me about a moment when you surprised yourself.',
  ],
  EMOTIONAL: [
    'When was the last time you cried? What triggered it?',
    'How do you typically handle anger? Do you express it or suppress it?',
    'What makes you feel truly safe?',
    'Describe a moment of pure joy. Where were you? Who was there?',
    'How do you cope when you feel overwhelmed?',
    'What are you most afraid of emotionally?',
    'Do you find it easy or difficult to be vulnerable with others?',
    'What triggers nostalgia for you?',
    'How do you comfort someone else when they are in pain?',
    'When you feel lonely, what do you do?',
    'What emotion do you struggle to express the most?',
    'Describe a time when your emotions completely surprised you.',
  ],
};

@Injectable()
export class EnrollmentQuestionsService {
  constructor(private llmService: LlmService) {}

  async generateQuestion(
    coverageMap: Record<string, CoverageEntry>,
    previousQuestions: string[],
  ): Promise<{ category: string; question: string }> {
    // Find least-covered category
    const entries = Object.entries(coverageMap).sort(
      ([, a], [, b]) => a.count - b.count,
    );
    const leastCovered = entries[0];
    const targetCategory = leastCovered[0];

    // Try LLM-generated question first
    try {
      const llmQuestion = await this.llmService.generateEnrollmentQuestion(
        coverageMap,
        previousQuestions,
        targetCategory,
      );
      if (llmQuestion) {
        return { category: targetCategory, question: llmQuestion };
      }
    } catch {
      // Fall through to fallback
    }

    // Fallback to pre-defined questions
    return this.getFallbackQuestion(targetCategory, previousQuestions);
  }

  getFallbackQuestion(
    category: string,
    previousQuestions: string[],
  ): { category: string; question: string } {
    const pool = FALLBACK_QUESTIONS[category] || FALLBACK_QUESTIONS['LINGUISTIC'];
    const available = pool.filter((q) => !previousQuestions.includes(q));

    if (available.length > 0) {
      const idx = Math.floor(Math.random() * available.length);
      return { category, question: available[idx] };
    }

    // If all questions in target category used, pick from any under-covered
    for (const [cat, questions] of Object.entries(FALLBACK_QUESTIONS)) {
      const unused = questions.filter((q) => !previousQuestions.includes(q));
      if (unused.length > 0) {
        const idx = Math.floor(Math.random() * unused.length);
        return { category: cat, question: unused[idx] };
      }
    }

    // Absolute fallback: re-ask with variation prefix
    const q = pool[Math.floor(Math.random() * pool.length)];
    return {
      category,
      question: `Let's go deeper on this: ${q}`,
    };
  }
}
