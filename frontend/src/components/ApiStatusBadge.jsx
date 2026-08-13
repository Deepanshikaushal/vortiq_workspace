import React from 'react';
import { Server, Wifi, WifiOff } from 'lucide-react';

export default function ApiStatusBadge({ isConnected, onRetry }) {
  return (
    <div
      onClick={onRetry}
      title={isConnected ? "Connected to Spring Boot API (Port 8080)" : "Click to reconnect to Spring Boot API"}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.35rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: isConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
        color: isConnected ? '#34d399' : '#f87171',
        border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: isConnected ? '#10b981' : '#ef4444',
          boxShadow: isConnected ? '0 0 8px #10b981' : '0 0 8px #ef4444',
          display: 'inline-block',
        }}
      />
      <Server size={13} />
      <span>{isConnected ? 'Spring Boot API Connected' : 'API Offline (Click to Retry)'}</span>
    </div>
  );
}
