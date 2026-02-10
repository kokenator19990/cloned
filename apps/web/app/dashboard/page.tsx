'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Heart, Filter, ArrowUpDown, MessageCircle, Users } from 'lucide-react';

const RELATIONSHIPS = [
  'Padre', 'Madre', 'Abuelo/a', 'Hermano/a',
  'Hijo/a', 'Pareja', 'Amigo/a', 'Mascota', 'Otro',
];

export default function DashboardPage() {
  const { profiles, fetchProfiles, createProfile, deleteProfile } = useProfileStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ENROLLING' | 'ACTIVE' | 'ARCHIVED'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const router = useRouter();

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Filtrado y ordenamiento
  const filteredAndSortedProfiles = useMemo(() => {
    let filtered = [...profiles];

    // Filtrar por estado
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }

    // Ordenar por nombre
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        // Ordenar por ID descendente (más reciente primero)
        return b.id.localeCompare(a.id);
      }
    });

    return filtered;
  }, [profiles, filterStatus, sortBy]);

  // Estadísticas
  const stats = useMemo(() => {
    const enrolling = profiles.filter((p) => p.status === 'ENROLLING').length;
    const active = profiles.filter((p) => p.status === 'ACTIVE').length;
    const archived = profiles.filter((p) => p.status === 'ARCHIVED').length;
    return { total: profiles.length, enrolling, active, archived };
  }, [profiles]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const profile = await createProfile(
        newName.trim(),
        newRelationship || undefined,
        newDescription.trim() || undefined,
      );
      setNewName('');
      setNewRelationship('');
      setNewDescription('');
      setShowCreate(false);
      router.push(`/dashboard/${profile.id}/enrollment`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cloned-text">Tus Recuerdos</h1>
          <p className="text-cloned-muted mt-1">Perfiles de memoria que has creado</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Nuevo Perfil
        </Button>
      </div>

      {/* Estadísticas */}
      {profiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="w-4 h-4 text-cloned-accent" />
              <span className="text-2xl font-bold text-cloned-text">{stats.total}</span>
            </div>
            <p className="text-xs text-cloned-muted">Total</p>
          </Card>
          <Card className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span className="text-2xl font-bold text-cloned-text">{stats.active}</span>
            </div>
            <p className="text-xs text-cloned-muted">Activos</p>
          </Card>
          <Card className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Filter className="w-4 h-4 text-amber-600" />
              <span className="text-2xl font-bold text-cloned-text">{stats.enrolling}</span>
            </div>
            <p className="text-xs text-cloned-muted">En Progreso</p>
          </Card>
          <Card className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-2xl font-bold text-cloned-text">{stats.archived}</span>
            </div>
            <p className="text-xs text-cloned-muted">Archivados</p>
          </Card>
        </div>
      )}

      {showCreate && (
        <Card className="mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Nombre del perfil"
              placeholder="ej. Jorge, Mamá, Mi mejor amigo..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <div>
              <label className="block text-sm font-medium text-cloned-text mb-1.5">Relación</label>
              <div className="flex flex-wrap gap-2">
                {RELATIONSHIPS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setNewRelationship(newRelationship === r ? '' : r)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      newRelationship === r
                        ? 'bg-cloned-accent text-white border-cloned-accent'
                        : 'border-cloned-border text-cloned-muted hover:border-cloned-accent'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="Descripción (opcional)"
              placeholder="Una breve descripción de quién era esta persona..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
              <Button type="submit" loading={creating}>Crear Perfil</Button>
            </div>
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
        <>
          {/* Filtros y Ordenamiento */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-cloned-muted" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="text-sm border border-cloned-border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-cloned-accent focus:border-transparent"
              >
                <option value="ALL">Todos</option>
                <option value="ENROLLING">En Progreso</option>
                <option value="ACTIVE">Activos</option>
                <option value="ARCHIVED">Archivados</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-cloned-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-cloned-border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-cloned-accent focus:border-transparent"
              >
                <option value="date">Más recientes</option>
                <option value="name">Nombre (A-Z)</option>
              </select>
            </div>
            <span className="text-sm text-cloned-muted ml-auto">
              {filteredAndSortedProfiles.length} de {profiles.length} perfiles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedProfiles.map((profile) => {
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
                      {profile.relationship && (
                        <span className="text-xs text-cloned-accent flex items-center gap-1 mt-0.5">
                          <Heart className="w-3 h-3" /> {profile.relationship}
                        </span>
                      )}
                      <Badge status={profile.status} />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar "${profile.name}"? Esta acción no se puede deshacer.`)) {
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
        </>
      )}
    </div>
  );
}
