import React from 'react';

export default function FlowviaLogo({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="flowviaGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="flowviaGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="flowviaGrad3" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c7d2fe" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>

      {/* Modern geometric Flowvia prism marks - symbolizing continuous workflow velocity */}
      {/* Top flow facet */}
      <path
        d="M6 8C6 6.89543 6.89543 6 8 6H20C21.1046 6 22 6.89543 22 8L16 14H6V8Z"
        fill="url(#flowviaGrad3)"
      />
      {/* Dynamic central velocity beam */}
      <path
        d="M6 14H16L26 24C26.7956 24.7956 26.2312 26 25.1056 26H13C12.4696 26 11.9609 25.7893 11.5858 25.4142L6 19.8284V14Z"
        fill="url(#flowviaGrad1)"
      />
      {/* Forward momentum arrow facet */}
      <path
        d="M16 14L22 8H24C25.1046 8 26 8.89543 26 10V18L16 14Z"
        fill="url(#flowviaGrad2)"
        opacity="0.85"
      />
    </svg>
  );
}
