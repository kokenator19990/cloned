'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProfileStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RadarChart } from '@/components/ui/RadarChart';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MessageSquare, Mic, Palette, Brain, ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const profileId = params.profileId as string;
  const { currentProfile, fetchProfile } = useProfileStore();
  const router = useRouter();

  useEffect(() => {
    fetchProfile(profileId);
  }, [profileId, fetchProfile]);

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
          <Card className="text-center hover:border-cloned-accent/40 transition-colors">
            <Brain className="w-8 h-8 mx-auto mb-2 text-cloned-accent" />
            <span className="text-sm font-medium">Enrollment</span>
          </Card>
        </Link>
        <Link href={`/dashboard/${profileId}/chat`}>
          <Card className="text-center hover:border-cloned-accent/40 transition-colors">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-cloned-accent" />
            <span className="text-sm font-medium">Chat</span>
          </Card>
        </Link>
        <Link href={`/dashboard/${profileId}/voice`}>
          <Card className="text-center hover:border-cloned-accent/40 transition-colors">
            <Mic className="w-8 h-8 mx-auto mb-2 text-cloned-accent" />
            <span className="text-sm font-medium">Voz</span>
          </Card>
        </Link>
        <Link href={`/dashboard/${profileId}/avatar`}>
          <Card className="text-center hover:border-cloned-accent/40 transition-colors">
            <Palette className="w-8 h-8 mx-auto mb-2 text-cloned-accent" />
            <span className="text-sm font-medium">Avatar</span>
          </Card>
        </Link>
      </div>
    </div>
  );
}
