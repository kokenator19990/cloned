'use client';

interface ClonedLogoProps {
  size?: number;
  className?: string;
}

/**
 * Inline SVG logo for Cloned — stylized head silhouette with cyan-to-purple gradient.
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
        <linearGradient id={`${id}-face`} x1="30" y1="15" x2="70" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="42" cy="18" r="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#67E8F9" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Background */}
      <rect width="100" height="100" rx="20" fill={`url(#${id}-bg)`} />
      {/* Face silhouette - stylized profile */}
      <path
        d="M58 16 C50 16, 42 20, 38 28 C34 36, 34 42, 36 48 C32 50, 28 54, 28 60 C28 66, 32 70, 36 72 C38 78, 42 84, 50 86 C56 88, 62 86, 66 82 C70 78, 72 72, 70 66 C72 62, 72 56, 68 50 C72 46, 74 40, 72 34 C70 26, 64 18, 58 16 Z"
        fill={`url(#${id}-face)`}
        opacity="0.9"
      />
      {/* Inner detail lines - flowing curves */}
      <path
        d="M50 24 C46 28, 42 36, 42 44 C42 52, 46 58, 48 62 C50 66, 50 72, 50 78"
        stroke={`url(#${id}-face)`}
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M56 22 C52 30, 48 40, 48 48 C48 56, 52 62, 54 66"
        stroke="#0F172A"
        strokeWidth="1.5"
        fill="none"
        opacity="0.3"
      />
      {/* Glow dot */}
      <circle cx="42" cy="18" r="4" fill={`url(#${id}-glow)`} />
      <circle cx="42" cy="18" r="2" fill="white" opacity="0.9" />
    </svg>
  );
}
