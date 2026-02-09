'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEnrollmentStore, useProfileStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ChatBubble } from '@/components/ui/ChatBubble';
import { Send, Mic, CheckCircle } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  LINGUISTIC: 'Language',
  LOGICAL: 'Logic',
  MORAL: 'Morality',
  VALUES: 'Values',
  ASPIRATIONS: 'Dreams',
  PREFERENCES: 'Preferences',
  AUTOBIOGRAPHICAL: 'Story',
  EMOTIONAL: 'Emotions',
};

interface ConversationItem {
  role: 'PERSONA' | 'USER';
  content: string;
  category?: string;
}

export default function EnrollmentPage() {
  const params = useParams();
  const profileId = params.profileId as string;
  const router = useRouter();
  const {
    currentQuestion,
    progress,
    loading,
    startEnrollment,
    fetchNextQuestion,
    submitAnswer,
    fetchProgress,
  } = useEnrollmentStore();
  const { currentProfile, fetchProfile, activateProfile } = useProfileStore();

  const [answer, setAnswer] = useState('');
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProfile(profileId);
    fetchProgress(profileId);
  }, [profileId, fetchProfile, fetchProgress]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  useEffect(() => {
    if (currentQuestion && started) {
      setConversation((prev) => {
        const lastQ = prev[prev.length - 1];
        if (lastQ?.content === currentQuestion.question) return prev;
        return [
          ...prev,
          { role: 'PERSONA', content: currentQuestion.question, category: currentQuestion.category },
        ];
      });
    }
  }, [currentQuestion, started]);

  const handleStart = async () => {
    setStarted(true);
    setConversation([
      {
        role: 'PERSONA',
        content:
          "Welcome! I'm going to ask you a series of questions to build your cognitive profile. Answer honestly and in detail - the more you share, the better the profile. Let's begin.",
      },
    ]);
    await startEnrollment(profileId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || !currentQuestion) return;

    setConversation((prev) => [...prev, { role: 'USER', content: answer }]);
    const currentAnswer = answer;
    setAnswer('');

    await submitAnswer(profileId, currentQuestion.id, currentAnswer);
    await fetchNextQuestion(profileId);
  };

  const handleActivate = async () => {
    await activateProfile(profileId);
    router.push(`/dashboard/${profileId}/chat`);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">
            Cognitive Enrollment {currentProfile ? `- ${currentProfile.name}` : ''}
          </h1>
          {progress && (
            <span className="text-sm text-cloned-accent-light font-medium">
              {progress.totalInteractions} / {progress.minRequired}
            </span>
          )}
        </div>

        {progress && <ProgressBar value={progress.percentComplete} />}

        {/* Category badges */}
        {progress && (
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(progress.coverageMap).map(([cat, data]) => (
              <span
                key={cat}
                className={`text-xs px-2.5 py-1 rounded-full border ${
                  data.covered
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-cloned-soft border-cloned-border text-cloned-muted'
                }`}
              >
                {data.covered && <CheckCircle className="w-3 h-3 inline mr-1" />}
                {CATEGORY_LABELS[cat] || cat} ({data.count}/{data.minRequired})
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Conversation area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {!started ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-cloned-accent/20 border-2 border-cloned-accent mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">🧠</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Ready to build your cognitive fingerprint?</h2>
              <p className="text-cloned-muted mb-6 max-w-md">
                I&apos;ll ask you questions about how you think, what you value, and how you express yourself.
                Minimum {progress?.minRequired || 50} interactions required.
              </p>
              <Button onClick={handleStart}>Begin Enrollment</Button>
            </div>
          </div>
        ) : (
          <>
            {conversation.map((item, i) => (
              <div key={i}>
                {item.category && (
                  <div className="text-xs text-cloned-muted mb-1 ml-1">
                    [{CATEGORY_LABELS[item.category] || item.category}]
                  </div>
                )}
                <ChatBubble role={item.role} content={item.content} />
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-cloned-border rounded-2xl px-4 py-3 rounded-bl-md">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-cloned-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-cloned-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-cloned-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Ready to activate */}
      {progress?.isReady && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 text-center">
          <p className="text-emerald-700 font-medium mb-2">
            Profile ready! You have enough data to activate.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleActivate}>Activate Profile & Start Chatting</Button>
            <Button variant="secondary" onClick={() => fetchNextQuestion(profileId)}>
              Keep Answering
            </Button>
          </div>
        </div>
      )}

      {/* Input area */}
      {started && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <button
            type="button"
            className="p-3 rounded-xl bg-cloned-card border border-cloned-border text-cloned-muted hover:text-cloned-accent transition-colors"
            title="Voice input (coming soon)"
          >
            <Mic className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 bg-cloned-card border border-cloned-border rounded-xl px-4 py-3 text-cloned-text outline-none focus:border-cloned-accent transition-colors"
            disabled={loading}
          />
          <Button type="submit" disabled={!answer.trim() || loading}>
            <Send className="w-5 h-5" />
          </Button>
        </form>
      )}
    </div>
  );
}
