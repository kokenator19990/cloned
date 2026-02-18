'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Loader2, MessageCircle, ArrowLeft, Send } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface PublicProfile {
    id: string;
    name: string;
    relationship: string | null;
    description: string | null;
    shareCode: string;
    status: string;
}

export default function ExplorePage() {
    const router = useRouter();
    const [profiles, setProfiles] = useState<PublicProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/profiles/explore`)
            .then(r => r.json())
            .then(data => setProfiles(Array.isArray(data) ? data : []))
            .catch(() => setProfiles([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-background-light font-body">
            <div className="px-6 py-6 flex items-center gap-4 border-b border-charcoal/5">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-charcoal/5 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-charcoal/50" />
                </button>
                <div>
                    <h1 className="text-2xl font-display font-semibold">Explorar Clones</h1>
                    <p className="text-sm text-charcoal/40">Perfiles públicos compartidos por la comunidad</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-10">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="text-center py-20 text-charcoal/30">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-lg font-display">No hay perfiles públicos aún</p>
                        <p className="text-sm mt-1">Sé el primero en compartir un perfil desde tu dashboard.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {profiles.map(profile => (
                            <div
                                key={profile.id}
                                className="bg-white rounded-2xl border border-charcoal/5 p-5 flex items-center gap-5 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group"
                                onClick={() => router.push(`/clones/public/${profile.shareCode}`)}
                            >
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-[#6366f1]/20 flex items-center justify-center text-xl font-bold text-primary flex-shrink-0">
                                    {profile.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-display font-semibold text-lg">{profile.name}</h3>
                                    {profile.relationship && (
                                        <p className="text-sm text-charcoal/40">{profile.relationship}</p>
                                    )}
                                    {profile.description && (
                                        <p className="text-sm text-charcoal/50 truncate mt-0.5">{profile.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full text-sm font-medium group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
                                    <MessageCircle className="w-4 h-4" />
                                    Chatear
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
