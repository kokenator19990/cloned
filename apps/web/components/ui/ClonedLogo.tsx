'use client';

interface ClonedLogoProps {
  size?: number;
  className?: string;
}

/**
 * Inline SVG logo for Cloned — clean person silhouette with gradient.
 * Works everywhere without external image files.
 */
export function ClonedLogo({ size = 36, className = '' }: ClonedLogoProps) {
  const id = `cloned-grad-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cloned logo"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id={`${id}-person`} x1="30" y1="10" x2="70" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50" cy="30" r="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#67E8F9" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Background */}
      <rect width="100" height="100" rx="22" fill={`url(#${id}-bg)`} />
      {/* Subtle glow behind head */}
      <circle cx="50" cy="32" r="20" fill={`url(#${id}-glow)`} />
      {/* Head */}
      <circle cx="50" cy="34" r="16" fill={`url(#${id}-person)`} opacity="0.95" />
      {/* Shoulders/body */}
      <path
        d="M24 88 C24 68, 36 58, 50 58 C64 58, 76 68, 76 88"
        fill={`url(#${id}-person)`}
        opacity="0.85"
      />
      {/* Digital echo — slightly offset duplicate (the "clone" effect) */}
      <circle cx="54" cy="32" r="16" fill={`url(#${id}-person)`} opacity="0.2" />
      <path
        d="M28 88 C28 68, 40 58, 54 58 C68 58, 80 68, 80 88"
        fill={`url(#${id}-person)`}
        opacity="0.15"
      />
    </svg>
  );
}
