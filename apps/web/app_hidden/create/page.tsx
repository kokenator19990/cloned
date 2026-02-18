'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStore } from '@/lib/localStore';
import { Camera, Upload, ArrowRight, User } from 'lucide-react';

export default function CreateClonePage() {
    const [step, setStep] = useState<'name' | 'photo'>('name');
    const [name, setName] = useState('');
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const router = useRouter();
    const { createClone, updateClonePhoto } = useLocalStore();

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraActive(true);
        } catch (err) {
            console.error('Camera error:', err);
            alert('No se pudo acceder a la cámara. Intenta subir una foto.');
        }
    }, []);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setCameraActive(false);
    }, []);

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setPhotoUrl(dataUrl);
            stopCamera();
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setPhotoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleContinue = () => {
        if (step === 'name') {
            if (!name.trim()) return;
            setStep('photo');
        } else {
            // Create clone and navigate to questions
            const clone = createClone(name.trim());
            if (photoUrl) {
                updateClonePhoto(clone.id, photoUrl);
            }
            router.push(`/create/questions?id=${clone.id}`);
        }
    };

    return (
        <div className="min-h-screen bg-background-light text-charcoal font-body">
            {/* Header */}
            <div className="px-6 py-6 flex items-center justify-between">
                <div className="text-2xl font-display font-semibold tracking-tight italic">Cloned</div>
                <div className="text-xs uppercase tracking-widest font-bold text-charcoal/40">
                    Paso {step === 'name' ? '1' : '2'} de 3
                </div>
            </div>

            <div className="max-w-lg mx-auto px-6 py-12">
                {step === 'name' ? (
                    /* ── Step 1: Name ── */
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-display font-medium leading-tight mb-3">
                                ¿Cómo se llama tu <span className="italic text-primary/80">clon</span>?
                            </h1>
                            <p className="text-charcoal/60 text-lg">
                                Dale un nombre al perfil que vas a crear. Puede ser tu propio nombre o el de alguien más.
                            </p>
                        </div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Jorge, Mamá, Daniel..."
                            autoFocus
                            className="w-full px-6 py-4 text-xl border-2 border-charcoal/10 rounded-2xl focus:border-primary/50 focus:outline-none transition-colors bg-white font-display"
                            onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                        />
                        <button
                            onClick={handleContinue}
                            disabled={!name.trim()}
                            className="w-full bg-gradient-to-br from-[#1313ec] to-[#6366f1] text-white px-8 py-4 rounded-full font-medium shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:hover:scale-100"
                        >
                            Continuar
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    /* ── Step 2: Photo ── */
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-display font-medium leading-tight mb-3">
                                Foto de <span className="italic text-primary/80">{name}</span>
                            </h1>
                            <p className="text-charcoal/60 text-lg">
                                Toma una foto o sube una imagen. Será el rostro de tu clon digital.
                            </p>
                        </div>

                        {/* Photo preview or camera */}
                        <div className="relative aspect-square max-w-sm mx-auto rounded-3xl overflow-hidden border-2 border-charcoal/10 bg-charcoal/5">
                            {photoUrl ? (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setPhotoUrl(null)}
                                        className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-charcoal px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                                    >
                                        Cambiar
                                    </button>
                                </>
                            ) : cameraActive ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={capturePhoto}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-primary shadow-xl hover:scale-110 transition-transform"
                                    />
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8">
                                    <div className="w-24 h-24 rounded-full bg-charcoal/10 flex items-center justify-center">
                                        <User className="w-12 h-12 text-charcoal/30" />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={startCamera}
                                            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                                        >
                                            <Camera className="w-4 h-4" />
                                            Cámara
                                        </button>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2 px-5 py-3 bg-charcoal/10 text-charcoal rounded-full text-sm font-medium hover:bg-charcoal/20 transition-colors"
                                        >
                                            <Upload className="w-4 h-4" />
                                            Subir
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Hidden inputs */}
                        <canvas ref={canvasRef} className="hidden" />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => { stopCamera(); setStep('name'); }}
                                className="px-6 py-4 rounded-full text-charcoal/60 font-medium hover:bg-charcoal/5 transition-colors"
                            >
                                Atrás
                            </button>
                            <button
                                onClick={handleContinue}
                                className="flex-1 bg-gradient-to-br from-[#1313ec] to-[#6366f1] text-white px-8 py-4 rounded-full font-medium shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
                            >
                                {photoUrl ? 'Continuar' : 'Omitir foto'}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
