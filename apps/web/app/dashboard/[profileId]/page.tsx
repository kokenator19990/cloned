'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfileStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RadarChart } from '@/components/ui/RadarChart';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MessageSquare, Mic, Palette, Brain, ArrowLeft, Share2, Copy, EyeOff } from 'lucide-react';
import api from '@/lib/api';

export default function ProfilePage() {
  const params = useParams();
  const profileId = params.profileId as string;
  const { currentProfile, fetchProfile } = useProfileStore();
  const router = useRouter();

  const [shareCode, setShareCode] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProfile(profileId);
  }, [profileId, fetchProfile]);

  useEffect(() => {
    if (currentProfile) {
      const p = currentProfile as any;
      setIsPublic(p.isPublic ?? false);
      setShareCode(p.shareCode ?? null);
    }
  }, [currentProfile]);

  const handleShare = async () => {
    setSharing(true);
    try {
      const { data } = await api.post(`/profiles/${profileId}/share`);
      setShareCode(data.shareCode);
      setIsPublic(true);
    } finally {
      setSharing(false);
    }
  };

  const handleUnshare = async () => {
    setSharing(true);
    try {
      await api.delete(`/profiles/${profileId}/share`);
      setIsPublic(false);
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = () => {
    const url = `${window.location.origin}/clones/public/${shareCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-cloned-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progress = Math.round(
    (currentProfile.currentInteractions / currentProfile.minInteractions) * 100,
  );

  return (
    <div>
      <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-cloned-muted hover:text-cloned-text mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a perfiles
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-cloned-accent flex items-center justify-center text-2xl font-bold text-white">
          {currentProfile.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{currentProfile.name}</h1>
          <Badge status={currentProfile.status} />
        </div>
      </div>

      {/* Share section */}
      <Card className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-semibold mb-1">Compartir perfil</h3>
            <p className="text-sm text-cloned-muted">
              {isPublic
                ? 'Este perfil es público. Cualquiera con el link puede chatear con él.'
                : 'Haz público este perfil para compartirlo con amigos.'}
            </p>
            {isPublic && shareCode && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <code className="text-xs bg-cloned-soft px-2 py-1 rounded font-mono text-cloned-accent">
                  /clones/public/{shareCode}
                </code>
                <button
                  onClick={handleCopy}
                  className="text-xs text-cloned-muted hover:text-cloned-accent transition-colors flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? '¡Copiado!' : 'Copiar link'}
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {isPublic ? (
              <Button variant="ghost" onClick={handleUnshare} loading={sharing}>
                <EyeOff className="w-4 h-4 mr-1" /> Hacer privado
              </Button>
            ) : (
              <Button onClick={handleShare} loading={sharing}>
                <Share2 className="w-4 h-4 mr-1" /> Compartir
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="font-semibold mb-4">Mapa de Cobertura</h3>
          <div className="flex justify-center">
            <RadarChart data={currentProfile.coverageMap} />
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Estadísticas del Perfil</h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-cloned-muted mb-1">Progreso del Enrollment</div>
              <ProgressBar value={Math.min(progress, 100)} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cloned-muted">Interacciones</span>
              <span>{currentProfile.currentInteractions} / {currentProfile.minInteractions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cloned-muted">Consistencia</span>
              <span>{(currentProfile.consistencyScore * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cloned-muted">Estado</span>
              <Badge status={currentProfile.status} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href={`/dashboard/${profileId}/enrollment`}>
          <Card className="text-center hover:border-cloned-accent/40 transition-colors cursor-pointer">
            <Brain className="w-8 h-8 mx-auto mb-2 text-cloned-accent" />
            <span className="text-sm font-medium">Enrollment</span>
          </Card>
        </Link>
        <Link href={`/dashboard/${profileId}/chat`}>
          <Card className="text-center hover:border-cloned-accent/40 transition-colors cursor-pointer">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-cloned-accent" />
            <span className="text-sm font-medium">Chat</span>
          </Card>
        </Link>
        <Link href={`/dashboard/${profileId}/voice`}>
          <Card className="text-center hover:border-cloned-accent/40 transition-colors cursor-pointer">
            <Mic className="w-8 h-8 mx-auto mb-2 text-cloned-accent" />
            <span className="text-sm font-medium">Voz</span>
          </Card>
        </Link>
        <Link href={`/dashboard/${profileId}/avatar`}>
          <Card className="text-center hover:border-cloned-accent/40 transition-colors cursor-pointer">
            <Palette className="w-8 h-8 mx-auto mb-2 text-cloned-accent" />
            <span className="text-sm font-medium">Avatar</span>
          </Card>
        </Link>
      </div>
    </div>
  );
}
