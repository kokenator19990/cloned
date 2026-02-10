'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEnrollmentStore, useProfileStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ChatBubble } from '@/components/ui/ChatBubble';
import { Send, Mic, MicOff, CheckCircle } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  LINGUISTIC: 'Lenguaje',
  LOGICAL: 'Lógica',
  MORAL: 'Moralidad',
  VALUES: 'Valores',
  ASPIRATIONS: 'Sueños',
  PREFERENCES: 'Preferencias',
  AUTOBIOGRAPHICAL: 'Historia',
  EMOTIONAL: 'Emociones',
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
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchProfile(profileId);
    fetchProgress(profileId);
  }, [profileId, fetchProfile, fetchProgress]);

  useEffect(() => {
    console.log('[Enrollment] Estado:', { loading, currentQuestion: currentQuestion?.id, started, progress });
  }, [loading, currentQuestion, started, progress]);

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
    if (!answer.trim() || !currentQuestion || loading) {
      console.log('[Enrollment] Submit bloqueado:', { answer: answer.trim(), currentQuestion, loading });
      return;
    }

    console.log('[Enrollment] Enviando respuesta:', { questionId: currentQuestion.id, answer: answer.substring(0, 50) });
    
    setConversation((prev) => [...prev, { role: 'USER', content: answer }]);
    const currentAnswer = answer;
    setAnswer('');

    try {
      await submitAnswer(profileId, currentQuestion.id, currentAnswer);
      console.log('[Enrollment] Respuesta enviada, buscando siguiente pregunta...');
      await fetchNextQuestion(profileId);
      console.log('[Enrollment] Siguiente pregunta obtenida');
    } catch (err) {
      console.error('[Enrollment] Error al enviar respuesta:', err);
      // Restore the answer so the user doesn't lose their input
      setAnswer(currentAnswer);
      setConversation((prev) => prev.filter((m) => m.content !== currentAnswer));
      alert('Error al enviar la respuesta. Por favor intenta de nuevo.');
    }
  };

  const handleActivate = async () => {
    await activateProfile(profileId);
    router.push(`/dashboard/${profileId}/chat`);
  };

  const toggleListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer(transcript);
    };

    recognition.onerror = (error: any) => {
      console.error('Speech recognition error:', error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening]);

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

      {/* Input area */}
      {started && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-xl border transition-colors ${
              listening
                ? 'bg-red-500/20 border-red-400 text-red-400 animate-pulse'
                : 'bg-cloned-card border-cloned-border text-cloned-muted hover:text-cloned-accent'
            }`}
            title={listening ? 'Dejar de grabar' : 'Entrada de voz'}
          >
            {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={listening ? 'Escuchando...' : 'Escribe o habla tu respuesta...'}
            className="flex-1 bg-cloned-card border border-cloned-border rounded-xl px-4 py-3 text-cloned-text outline-none focus:border-cloned-accent transition-colors"
            disabled={loading}
          />
          <Button type="submit" disabled={!answer.trim() || loading || !currentQuestion}>
            {loading ? 'Enviando...' : <Send className="w-5 h-5" />}
          </Button>
        </form>
      )}
    </div>
  );
}
