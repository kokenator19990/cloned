'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChatStore, useProfileStore } from '@/lib/store';
import { ChatBubble } from '@/components/ui/ChatBubble';
import { Avatar } from '@/components/ui/Avatar';
import { SimulationBanner } from '@/components/ui/SimulationBanner';
import { Button } from '@/components/ui/Button';
import { Send, Mic, MicOff, PhoneOff, MessageSquare, X, Volume2, VolumeX } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const profileId = params.profileId as string;
  const router = useRouter();
  const { currentProfile, fetchProfile } = useProfileStore();
  const {
    currentSessionId,
    messages,
    streaming,
    createSession,
    sendMessage,
    fetchMessages,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [showMessages, setShowMessages] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const prevMessagesLenRef = useRef(0);

  useEffect(() => {
    fetchProfile(profileId);
  }, [profileId, fetchProfile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  // Auto-read persona responses aloud
  useEffect(() => {
    if (!ttsEnabled || messages.length === 0) return;
    if (messages.length > prevMessagesLenRef.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'PERSONA') {
        speakText(lastMsg.content);
      }
    }
    prevMessagesLenRef.current = messages.length;
  }, [messages, ttsEnabled]);

  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    // Try to find a Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es'));
    if (spanishVoice) utterance.voice = spanishVoice;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

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
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening]);

  const handleStartSession = async () => {
    await createSession(profileId);
    setSessionReady(true);
    // Load voices for TTS
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentSessionId || streaming) return;
    const msg = input;
    setInput('');
    await sendMessage(currentSessionId, msg);
  };

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="w-8 h-8 border-2 border-cloned-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (currentProfile.status !== 'ACTIVE') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <p className="text-cloned-muted mb-4">This profile needs to complete enrollment first.</p>
        <Button onClick={() => router.push(`/dashboard/${profileId}/enrollment`)}>
          Go to Enrollment
        </Button>
      </div>
    );
  }

  const avatarConfig = currentProfile.avatarConfig;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -mx-4 -mt-8">
      {/* Simulation banner */}
      <SimulationBanner personaName={currentProfile.name} />

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 border-b border-cloned-border">
        <div className="flex items-center gap-3">
          <Avatar
            name={currentProfile.name}
            skin={avatarConfig?.skin}
            mood={avatarConfig?.mood}
            size="sm"
          />
          <div>
            <span className="font-medium">{currentProfile.name}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-cloned-muted">Active Profile</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-2 rounded-lg hover:bg-cloned-soft transition-colors ${ttsEnabled ? 'text-cloned-accent' : 'text-cloned-muted'}`}
            title={ttsEnabled ? 'Disable voice responses' : 'Enable voice responses'}
          >
            {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowMessages(!showMessages)}
            className="p-2 rounded-lg hover:bg-cloned-soft text-cloned-muted transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
              router.push('/dashboard');
            }}
            className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-colors"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Avatar display (main area) */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-cloned-bg to-cloned-soft">
          {!sessionReady ? (
            <div className="text-center">
              <Avatar
                name={currentProfile.name}
                skin={avatarConfig?.skin}
                mood={avatarConfig?.mood}
                accessories={avatarConfig?.accessories || []}
                size="xl"
                className="mx-auto mb-6"
              />
              <h2 className="text-xl font-semibold mb-2">{currentProfile.name}</h2>
              <p className="text-cloned-muted mb-6">Ready to connect?</p>
              <Button onClick={handleStartSession}>Start Conversation</Button>
            </div>
          ) : (
            <div className="text-center">
              <Avatar
                name={currentProfile.name}
                skin={avatarConfig?.skin}
                mood={avatarConfig?.mood}
                accessories={avatarConfig?.accessories || []}
                size="xl"
                speaking={streaming || speaking}
                className="mx-auto mb-4"
              />
              <h2 className="text-lg font-semibold">{currentProfile.name}</h2>
              {(streaming || speaking) && (
                <p className="text-sm text-cloned-accent-light mt-1 animate-pulse">Speaking...</p>
              )}
            </div>
          )}

          {/* Selfie placeholder (small corner) */}
          {sessionReady && (
            <div className="absolute bottom-24 right-4 w-24 h-32 bg-cloned-soft border border-cloned-border rounded-xl flex items-center justify-center">
              <span className="text-xs text-cloned-muted">You</span>
            </div>
          )}
        </div>

        {/* Messages sidebar (togglable) */}
        {showMessages && (
          <div className="w-96 border-l border-cloned-border bg-cloned-bg flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-cloned-border">
              <span className="text-sm font-medium">Messages</span>
              <button onClick={() => setShowMessages(false)} className="text-cloned-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      {sessionReady && (
        <div className="px-4 py-3 bg-white/80 border-t border-cloned-border">
          <form onSubmit={handleSend} className="flex gap-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl border transition-colors ${listening
                  ? 'bg-red-500/20 border-red-400 text-red-400 animate-pulse'
                  : 'bg-white border-cloned-border text-cloned-muted hover:text-cloned-accent'
                }`}
              title={listening ? 'Stop listening' : 'Voice input'}
            >
              {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? 'Listening...' : `Talk to ${currentProfile.name}...`}
              className="flex-1 bg-white border border-cloned-border rounded-xl px-4 py-3 text-cloned-text outline-none focus:border-cloned-accent transition-colors"
              disabled={streaming || listening}
            />
            <Button type="submit" disabled={!input.trim() || streaming}>
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

