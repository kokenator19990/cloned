'use client';
import { AlertTriangle } from 'lucide-react';

export function SimulationBanner({ personaName }: { personaName?: string }) {
  return (
    <div className="bg-amber-900/30 border border-amber-700/40 text-amber-200 px-4 py-2 flex items-center gap-2 text-sm">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span>
        This is a simulation. {personaName ? `This is not ${personaName}` : 'This is not a real person'}.
        Responses are AI-generated based on a cognitive profile.
      </span>
    </div>
  );
}
