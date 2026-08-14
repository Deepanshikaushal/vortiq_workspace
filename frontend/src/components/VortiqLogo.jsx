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
      style={{ filter: 'drop-shadow(0 2px 10px rgba(225, 29, 72, 0.45))' }}
    >
      <defs>
        <linearGradient id="redGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>

        <linearGradient id="redGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff859b" />
          <stop offset="50%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#4c0519" />
        </linearGradient>

        <linearGradient id="redGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ff859b" />
        </linearGradient>
      </defs>

      {/* Outer Hexagonal Shield Frame */}
      <path
        d="M50 6 L88 28 V72 L50 94 L12 72 V28 Z"
        fill="url(#redGrad1)"
        fillOpacity="0.2"
        stroke="url(#redGrad1)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Dynamic V Vortex Swirl Prism */}
      <path
        d="M26 30 L50 74 L74 30 L60 30 L50 52 L40 30 Z"
        fill="url(#redGrad2)"
      />

      {/* Floating Center Diamond Nucleus */}
      <polygon
        points="50,18 62,32 50,46 38,32"
        fill="url(#redGrad3)"
      />

      {/* Orbit Rings */}
      <circle cx="50" cy="32" r="3.5" fill="#140507" />
    </svg>
  );
}
