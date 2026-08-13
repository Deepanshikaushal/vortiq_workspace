import React from 'react';

export default function VortiqLogo({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.6))' }}
    >
      <defs>
        <linearGradient id="vortiqGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f2fe" />
          <stop offset="50%" stopColor="#4facfe" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        <linearGradient id="vortiqGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff007f" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        <linearGradient id="vortiqGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00f5a0" />
          <stop offset="100%" stopColor="#00d2ff" />
        </linearGradient>

        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Hexagonal Shield Frame */}
      <path
        d="M50 6 L88 28 V72 L50 94 L12 72 V28 Z"
        fill="url(#vortiqGrad1)"
        fillOpacity="0.15"
        stroke="url(#vortiqGrad1)"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Dynamic V Vortex Swirl Prism */}
      <path
        d="M26 30 L50 74 L74 30 L60 30 L50 52 L40 30 Z"
        fill="url(#vortiqGrad2)"
        filter="url(#neonGlow)"
      />

      {/* Floating Center Diamond Nucleus */}
      <polygon
        points="50,18 62,32 50,46 38,32"
        fill="url(#vortiqGrad3)"
        filter="url(#neonGlow)"
      />

      {/* Orbit Rings */}
      <circle cx="50" cy="32" r="4" fill="#ffffff" />
    </svg>
  );
}
