'use client';
import { AlertTriangle } from 'lucide-react';

export function SimulationBanner({ personaName }: { personaName?: string }) {
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-800 px-4 py-2 flex items-center gap-2 text-sm">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span>
        Esto es una simulación. {personaName ? `No es realmente ${personaName}` : 'No es una persona real'}.
        Las respuestas son generadas por IA basada en un perfil cognitivo.
      </span>
    </div>
  );
}
