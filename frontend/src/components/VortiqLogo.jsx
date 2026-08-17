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
      style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4))' }}
    >
      <defs>
        <linearGradient id="slateGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        <linearGradient id="slateGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        <linearGradient id="slateGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>

      {/* Outer Hexagonal Shield Frame */}
      <path
        d="M50 6 L88 28 V72 L50 94 L12 72 V28 Z"
        fill="url(#slateGrad1)"
        fillOpacity="0.2"
        stroke="url(#slateGrad1)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Dynamic V Vortex Swirl Prism */}
      <path
        d="M26 30 L50 74 L74 30 L60 30 L50 52 L40 30 Z"
        fill="url(#slateGrad2)"
      />

      {/* Floating Center Diamond Nucleus */}
      <polygon
        points="50,18 62,32 50,46 38,32"
        fill="url(#slateGrad3)"
      />

      {/* Orbit Rings */}
      <circle cx="50" cy="32" r="3.5" fill="#0b0f17" />
    </svg>
  );
}
