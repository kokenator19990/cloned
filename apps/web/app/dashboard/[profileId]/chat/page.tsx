'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChatStore, useProfileStore } from '@/lib/store';
import { ChatBubble } from '@/components/ui/ChatBubble';
import { Avatar } from '@/components/ui/Avatar';
import { SimulationBanner } from '@/components/ui/SimulationBanner';
import { Button } from '@/components/ui/Button';
import { Send, Mic, PhoneOff, MessageSquare, X } from 'lucide-react';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProfile(profileId);
  }, [profileId, fetchProfile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  const handleStartSession = async () => {
    const sessionId = await createSession(profileId);
    setSessionReady(true);
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
        <div className="w-8 h-8 border-2 border-deadbot-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (currentProfile.status !== 'ACTIVE') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <p className="text-deadbot-muted mb-4">This profile needs to complete enrollment first.</p>
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
      <div className="flex items-center justify-between px-4 py-3 bg-deadbot-card/80 border-b border-deadbot-border">
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
              <span className="text-xs text-deadbot-muted">Active Profile</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMessages(!showMessages)}
            className="p-2 rounded-lg hover:bg-gray-800 text-deadbot-muted transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-colors"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Avatar display (main area) */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-deadbot-bg to-gray-900">
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
              <p className="text-deadbot-muted mb-6">Ready to connect?</p>
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
                speaking={streaming}
                className="mx-auto mb-4"
              />
              <h2 className="text-lg font-semibold">{currentProfile.name}</h2>
              {streaming && (
                <p className="text-sm text-deadbot-accent-light mt-1 animate-pulse">Speaking...</p>
              )}
            </div>
          )}

          {/* Selfie placeholder (small corner) */}
          {sessionReady && (
            <div className="absolute bottom-24 right-4 w-24 h-32 bg-gray-800 border border-deadbot-border rounded-xl flex items-center justify-center">
              <span className="text-xs text-deadbot-muted">You</span>
            </div>
          )}
        </div>

        {/* Messages sidebar (togglable) */}
        {showMessages && (
          <div className="w-96 border-l border-deadbot-border bg-deadbot-bg flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-deadbot-border">
              <span className="text-sm font-medium">Messages</span>
              <button onClick={() => setShowMessages(false)} className="text-deadbot-muted hover:text-white">
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
        <div className="px-4 py-3 bg-deadbot-card/80 border-t border-deadbot-border">
          <form onSubmit={handleSend} className="flex gap-2">
            <button
              type="button"
              className="p-3 rounded-xl bg-gray-800 border border-deadbot-border text-deadbot-muted hover:text-deadbot-accent transition-colors"
              title="Voice input (coming soon)"
            >
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Talk to ${currentProfile.name}...`}
              className="flex-1 bg-gray-800 border border-deadbot-border rounded-xl px-4 py-3 text-deadbot-text outline-none focus:border-deadbot-accent transition-colors"
              disabled={streaming}
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
