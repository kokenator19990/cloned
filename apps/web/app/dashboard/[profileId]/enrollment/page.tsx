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
  const [error, setError] = useState('');
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
          '¡Bienvenido! Voy a hacerte una serie de preguntas para construir tu perfil cognitivo. Responde con honestidad y detalle — mientras más compartas, mejor será el perfil. ¡Empecemos!',
      },
    ]);
    await startEnrollment(profileId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || !currentQuestion || loading) return;

    setError('');
    setConversation((prev) => [...prev, { role: 'USER', content: answer }]);
    const currentAnswer = answer;
    setAnswer('');

    try {
      await submitAnswer(profileId, currentQuestion.id, currentAnswer);
      await fetchNextQuestion(profileId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar respuesta. Intenta de nuevo.');
      // Remove the optimistic user message on error
      setConversation((prev) => prev.slice(0, -1));
    }
  };

  const handleActivate = async () => {
    try {
      await activateProfile(profileId);
      router.push(`/dashboard/${profileId}/chat`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al activar el perfil. Verifica que hayas completado el enrollment.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">
            Enrollment Cognitivo {currentProfile ? `- ${currentProfile.name}` : ''}
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
              <h2 className="text-xl font-semibold mb-2">¿Listo para construir tu huella cognitiva?</h2>
              <p className="text-cloned-muted mb-6 max-w-md">
                Te haré preguntas sobre cómo piensas, qué valoras y cómo te expresas.
                Se requieren mínimo {progress?.minRequired || 50} interacciones.
              </p>
              <Button onClick={handleStart}>Comenzar Enrollment</Button>
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
            ¡Perfil listo! Tienes suficientes datos para activarlo.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleActivate}>Activar Perfil y Empezar a Chatear</Button>
            <Button variant="secondary" onClick={() => fetchNextQuestion(profileId)}>
              Seguir Respondiendo
            </Button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm mb-4">
          {error}
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
            placeholder="Escribe tu respuesta..."
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
