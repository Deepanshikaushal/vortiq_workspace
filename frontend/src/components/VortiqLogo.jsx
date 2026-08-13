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
      style={{ filter: 'drop-shadow(0 2px 8px rgba(132, 204, 22, 0.3))' }}
    >
      <defs>
        <linearGradient id="sageGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#4d7c0f" />
        </linearGradient>

        <linearGradient id="sageGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a3e635" />
          <stop offset="50%" stopColor="#65a30d" />
          <stop offset="100%" stopColor="#365314" />
        </linearGradient>

        <linearGradient id="sageGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#a3e635" />
        </linearGradient>
      </defs>

      {/* Outer Hexagonal Shield Frame */}
      <path
        d="M50 6 L88 28 V72 L50 94 L12 72 V28 Z"
        fill="url(#sageGrad1)"
        fillOpacity="0.15"
        stroke="url(#sageGrad1)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Dynamic V Vortex Swirl Prism */}
      <path
        d="M26 30 L50 74 L74 30 L60 30 L50 52 L40 30 Z"
        fill="url(#sageGrad2)"
      />

      {/* Floating Center Diamond Nucleus */}
      <polygon
        points="50,18 62,32 50,46 38,32"
        fill="url(#sageGrad3)"
      />

      {/* Orbit Rings */}
      <circle cx="50" cy="32" r="3.5" fill="#0f172a" />
    </svg>
  );
}
