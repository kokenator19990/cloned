'use client';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useProfileStore } from '@/lib/store';
import api from '@/lib/api';
import { Mic, Square, Upload, CheckCircle, Volume2, MicOff } from 'lucide-react';

export default function VoicePage() {
  const params = useParams();
  const profileId = params.profileId as string;
  const { currentProfile, fetchProfile } = useProfileStore();
  const [recording, setRecording] = useState(false);
  const [samples, setSamples] = useState<any[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  // STT/TTS test state
  const [sttText, setSttText] = useState('');
  const [sttListening, setSttListening] = useState(false);
  const [ttsInput, setTtsInput] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchProfile(profileId);
    loadSamples();
  }, [profileId, fetchProfile]);

  const loadSamples = async () => {
    try {
      const { data } = await api.get(`/voice/${profileId}/samples`);
      setSamples(data);
    } catch { }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRecorder.current = recorder;
    chunks.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('file', blob, `sample-${Date.now()}.webm`);
      await api.post(`/voice/${profileId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      loadSamples();
      stream.getTracks().forEach((t) => t.stop());
    };

    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  const recordConsent = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    const consentChunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) consentChunks.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(consentChunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('file', blob, `consent-${Date.now()}.webm`);
      await api.post(`/voice/${profileId}/consent`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      loadSamples();
      fetchProfile(profileId);
      stream.getTracks().forEach((t) => t.stop());
    };

    recorder.start();
    setTimeout(() => recorder.stop(), 10000);
    alert('Recording consent phrase for 10 seconds. Please read the consent text aloud now.');
  };

  // Browser-based STT
  const toggleSTT = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
      return;
    }

    if (sttListening) {
      recognitionRef.current?.stop();
      setSttListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      setSttText(event.results[0][0].transcript);
      setSttListening(false);
    };
    recognition.onerror = () => setSttListening(false);
    recognition.onend = () => setSttListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setSttListening(true);
  };

  // Browser-based TTS
  const playTTS = () => {
    if (!ttsInput.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(ttsInput);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es'));
    if (spanishVoice) utterance.voice = spanishVoice;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Voice Settings - {currentProfile?.name}</h1>

      {/* Consent section */}
      <Card className="mb-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          Voice Consent
          {currentProfile?.voiceConsentGiven && (
            <CheckCircle className="w-4 h-4 text-green-400" />
          )}
        </h3>
        {currentProfile?.voiceConsentGiven ? (
          <p className="text-sm text-green-300">Consent recorded. You can record more samples.</p>
        ) : (
          <div>
            <p className="text-sm text-cloned-muted mb-3">
              Please read the following phrase aloud to consent to voice modeling:
            </p>
            <blockquote className="border-l-2 border-cloned-accent pl-4 italic text-sm mb-4">
              &quot;Consiento que mi voz sea modelada y utilizada por Cloned con el fin de
              crear una simulación de perfil cognitivo.&quot;
            </blockquote>
            <Button onClick={recordConsent}>Record Consent</Button>
          </div>
        )}
      </Card>

      {/* Recording section */}
      <Card className="mb-6">
        <h3 className="font-semibold mb-3">Record Voice Sample</h3>
        <p className="text-sm text-cloned-muted mb-4">
          Record voice samples to help build your voice profile. Speak naturally.
        </p>
        <div className="flex gap-3">
          {recording ? (
            <Button variant="danger" onClick={stopRecording}>
              <Square className="w-4 h-4" /> Stop Recording
            </Button>
          ) : (
            <Button onClick={startRecording}>
              <Mic className="w-4 h-4" /> Start Recording
            </Button>
          )}
        </div>
        {recording && (
          <div className="mt-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-red-300">Recording...</span>
          </div>
        )}
      </Card>

      {/* Voice Test Section */}
      <Card className="mb-6">
        <h3 className="font-semibold mb-3">Test Voice (Browser)</h3>
        <p className="text-sm text-cloned-muted mb-4">
          Test speech-to-text and text-to-speech using your browser&apos;s built-in capabilities.
        </p>

        {/* STT Test */}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-2">Speech → Text (STT)</label>
          <div className="flex gap-2">
            <Button onClick={toggleSTT} variant={sttListening ? 'danger' : 'primary'}>
              {sttListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {sttListening ? ' Listening...' : ' Start STT'}
            </Button>
          </div>
          {sttText && (
            <div className="mt-2 p-3 bg-cloned-soft rounded-lg text-sm">
              <span className="text-cloned-muted">Transcription:</span> {sttText}
            </div>
          )}
        </div>

        {/* TTS Test */}
        <div>
          <label className="text-sm font-medium block mb-2">Text → Speech (TTS)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={ttsInput}
              onChange={(e) => setTtsInput(e.target.value)}
              placeholder="Type text to speak..."
              className="flex-1 bg-white border border-cloned-border rounded-lg px-3 py-2 text-sm outline-none focus:border-cloned-accent"
            />
            <Button onClick={playTTS} disabled={!ttsInput.trim()}>
              <Volume2 className="w-4 h-4" /> Speak
            </Button>
          </div>
        </div>
      </Card>

      {/* Samples list */}
      <Card>
        <h3 className="font-semibold mb-3">Voice Samples ({samples.length})</h3>
        {samples.length === 0 ? (
          <p className="text-sm text-cloned-muted">No voice samples yet.</p>
        ) : (
          <div className="space-y-2">
            {samples.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between bg-cloned-soft rounded-lg p-3">
                <div className="text-sm">
                  <span>{s.consentPhrase ? 'Consent' : 'Sample'}</span>
                  <span className="text-cloned-muted ml-2">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-xs text-cloned-muted">{s.durationSeconds?.toFixed(1)}s</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
