'use client';
import { useState, useEffect, useRef } from 'react';
import { User } from 'lucide-react';

interface TalkingAvatarProps {
    photoUrl: string | null;
    name: string;
    isSpeaking: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = {
    sm: { container: 'w-12 h-12', icon: 'w-6 h-6', ring: 'w-14 h-14', glow: '6px' },
    md: { container: 'w-20 h-20', icon: 'w-10 h-10', ring: 'w-24 h-24', glow: '10px' },
    lg: { container: 'w-32 h-32', icon: 'w-16 h-16', ring: 'w-36 h-36', glow: '15px' },
    xl: { container: 'w-44 h-44', icon: 'w-20 h-20', ring: 'w-52 h-52', glow: '25px' },
};

export function TalkingAvatar({ photoUrl, name, isSpeaking, size = 'lg' }: TalkingAvatarProps) {
    const s = SIZES[size];

    return (
        <div className="relative flex items-center justify-center">
            {/* Outer pulse rings (visible when speaking) */}
            {isSpeaking && (
                <>
                    <div
                        className={`absolute ${s.ring} rounded-full border-2 border-primary/30 animate-avatar-ring-1`}
                    />
                    <div
                        className={`absolute ${s.ring} rounded-full border-2 border-primary/20 animate-avatar-ring-2`}
                    />
                    <div
                        className={`absolute ${s.ring} rounded-full border border-primary/10 animate-avatar-ring-3`}
                    />
                </>
            )}

            {/* Glow effect when speaking */}
            <div
                className={`absolute ${s.container} rounded-full transition-all duration-300 ${isSpeaking
                        ? 'shadow-[0_0_30px_rgba(19,19,236,0.3),0_0_60px_rgba(19,19,236,0.15)]'
                        : ''
                    }`}
            />

            {/* Avatar container */}
            <div
                className={`relative ${s.container} rounded-full overflow-hidden border-3 transition-all duration-300 ${isSpeaking
                        ? 'border-primary scale-105'
                        : 'border-charcoal/10 scale-100'
                    }`}
                style={{
                    animation: isSpeaking ? 'avatar-breathe 2s ease-in-out infinite' : 'avatar-idle 4s ease-in-out infinite',
                }}
            >
                {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={photoUrl}
                        alt={name}
                        className={`w-full h-full object-cover transition-all duration-300 ${isSpeaking ? 'brightness-105 contrast-105' : ''
                            }`}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <User className={`${s.icon} text-charcoal/30`} />
                    </div>
                )}

                {/* Speaking mouth overlay effect */}
                {isSpeaking && (
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-primary/10 to-transparent animate-mouth-pulse" />
                )}
            </div>

            {/* Speaking indicator dot */}
            {isSpeaking && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            )}
        </div>
    );
}
