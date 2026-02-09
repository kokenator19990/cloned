'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2 } from 'lucide-react';

export default function DashboardPage() {
  const { profiles, fetchProfiles, createProfile, deleteProfile } = useProfileStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const profile = await createProfile(newName.trim());
      setNewName('');
      setShowCreate(false);
      router.push(`/dashboard/${profile.id}/enrollment`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-cloned-text">Tus Recuerdos</h1>
          <p className="text-cloned-muted mt-1">Perfiles de memoria que has creado</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Nuevo Perfil
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-6">
          <form onSubmit={handleCreate} className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                label="Profile Name"
                placeholder="e.g. Jorge, Mom, Best Friend..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit" loading={creating}>Create</Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          </form>
        </Card>
      )}

      {profiles.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-cloned-muted mb-4">Aún no tienes perfiles. Crea tu primer recuerdo.</p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> Crear Primer Perfil
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => {
            const progress = Math.round(
              (profile.currentInteractions / profile.minInteractions) * 100,
            );
            return (
              <Card
                key={profile.id}
                onClick={() =>
                  router.push(
                    `/dashboard/${profile.id}${profile.status === 'ENROLLING' ? '/enrollment' : '/chat'}`,
                  )
                }
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{profile.name}</h3>
                    <Badge status={profile.status} />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${profile.name}"? This cannot be undone.`)) {
                        deleteProfile(profile.id);
                      }
                    }}
                    className="text-cloned-muted hover:text-cloned-danger transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-cloned-muted">
                    {profile.currentInteractions} / {profile.minInteractions} interacciones
                  </div>
                  <ProgressBar value={Math.min(progress, 100)} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
