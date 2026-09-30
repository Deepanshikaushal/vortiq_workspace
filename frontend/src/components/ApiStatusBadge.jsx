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
        gap: '6px',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '0.72rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        background: isConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
        color: isConnected ? '#34d399' : '#f87171',
        border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: isConnected ? '#10b981' : '#ef4444',
          display: 'inline-block',
        }}
      />
      <Server size={12} />
      <span>{isConnected ? 'API Live' : 'API Offline'}</span>
    </div>
  );
}
