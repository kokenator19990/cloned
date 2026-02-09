'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const SKINS = ['default', 'hoodie', 'suit', 'casual', 'dark', 'neon'];
const MOODS = ['neutral', 'happy', 'serious', 'angry', 'sad', 'excited'];
const ACCESSORIES = ['none', 'cap', 'hood', 'glasses', 'headphones'];

const SKIN_COLORS: Record<string, string> = {
  default: '#6B7280', hoodie: '#1F2937', suit: '#111827',
  casual: '#059669', dark: '#18181B', neon: '#7C3AED',
};

const MOOD_EMOJIS: Record<string, string> = {
  neutral: '😐', happy: '😊', serious: '😤',
  angry: '😠', sad: '😢', excited: '🤩',
};

export default function AvatarPage() {
  const params = useParams();
  const profileId = params.profileId as string;
  const [config, setConfig] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [profileId]);

  const loadConfig = async () => {
    const { data } = await api.get(`/avatar/${profileId}/config`);
    setConfig(data);
  };

  const updateConfig = async (updates: any) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    setSaving(true);
    await api.put(`/avatar/${profileId}/config`, {
      skin: newConfig.skin,
      mood: newConfig.mood,
      accessories: newConfig.accessories,
    });
    setSaving(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    await api.post(`/avatar/${profileId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    loadConfig();
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-cloned-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const accessories = Array.isArray(config.accessories) ? config.accessories : [];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Avatar Settings</h1>

      {/* Live preview */}
      <Card className="mb-6 flex flex-col items-center py-8">
        <Avatar
          name="Preview"
          skin={config.skin}
          mood={config.mood}
          accessories={accessories}
          size="xl"
        />
        <p className="mt-4 text-sm text-cloned-muted">
          {config.skin} / {config.mood}
          {accessories.filter((a: string) => a !== 'none').length > 0 &&
            ` / ${accessories.filter((a: string) => a !== 'none').join(', ')}`}
        </p>
        {saving && <p className="text-xs text-cloned-accent mt-1">Saving...</p>}
      </Card>

      {/* Photo upload */}
      <Card className="mb-6">
        <h3 className="font-semibold mb-3">Base Photo</h3>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="text-sm text-cloned-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cloned-accent file:text-white file:cursor-pointer"
        />
      </Card>

      {/* Skin selector */}
      <Card className="mb-6">
        <h3 className="font-semibold mb-3">Skin</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {SKINS.map((skin) => (
            <button
              key={skin}
              onClick={() => updateConfig({ skin })}
              className={cn(
                'rounded-xl p-4 text-center border-2 transition-colors',
                config.skin === skin
                  ? 'border-cloned-accent bg-cloned-accent/10'
                  : 'border-cloned-border hover:border-gray-600',
              )}
            >
              <div
                className="w-10 h-10 rounded-full mx-auto mb-2"
                style={{ backgroundColor: SKIN_COLORS[skin] }}
              />
              <span className="text-xs capitalize">{skin}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Mood selector */}
      <Card className="mb-6">
        <h3 className="font-semibold mb-3">Mood</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {MOODS.map((mood) => (
            <button
              key={mood}
              onClick={() => updateConfig({ mood })}
              className={cn(
                'rounded-xl p-4 text-center border-2 transition-colors',
                config.mood === mood
                  ? 'border-cloned-accent bg-cloned-accent/10'
                  : 'border-cloned-border hover:border-gray-600',
              )}
            >
              <span className="text-2xl block mb-1">{MOOD_EMOJIS[mood]}</span>
              <span className="text-xs capitalize">{mood}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Accessories */}
      <Card>
        <h3 className="font-semibold mb-3">Accessories</h3>
        <div className="flex flex-wrap gap-3">
          {ACCESSORIES.map((acc) => (
            <button
              key={acc}
              onClick={() => {
                if (acc === 'none') {
                  updateConfig({ accessories: [] });
                } else {
                  const current = accessories.filter((a: string) => a !== 'none');
                  const newAcc = current.includes(acc)
                    ? current.filter((a: string) => a !== acc)
                    : [...current, acc];
                  updateConfig({ accessories: newAcc.length === 0 ? ['none'] : newAcc });
                }
              }}
              className={cn(
                'px-4 py-2 rounded-lg border-2 text-sm transition-colors',
                accessories.includes(acc) || (acc === 'none' && accessories.length === 0)
                  ? 'border-cloned-accent bg-cloned-accent/10'
                  : 'border-cloned-border hover:border-gray-600',
              )}
            >
              {acc}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
