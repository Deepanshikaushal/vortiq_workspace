import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Layers, Activity, User, Keyboard } from 'lucide-react';

export default function MetricsOverview({ stats, currentUser, isMyTasksOnly = false }) {
  const { total = 0, todo = 0, inProgress = 0, inReview = 0, completed = 0, completionRate = 0 } = stats || {};

  const isMember = (currentUser?.role || '').toUpperCase().includes('MEMBER') || isMyTasksOnly;

  return (
    <div
      style={{
        backgroundColor: '#0c101a',
        border: '1px solid #1a2336',
        borderRadius: '5px',
        height: '38px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        marginBottom: '12px',
        fontSize: '0.75rem',
        userSelect: 'none'
      }}
    >
      {/* Left: Dense Telemetry Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
        {/* Scope Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f1f5f9', fontWeight: 600 }}>
          {isMember ? <User size={13} color="#818cf8" /> : <Layers size={13} color="#818cf8" />}
          <span>{isMember ? 'My Queue' : 'Workspace Queue'}</span>
          <span style={{
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            backgroundColor: '#161f33',
            color: '#cbd5e1',
            padding: '1px 6px',
            borderRadius: '3px',
            border: '1px solid #1f2b42'
          }}>
            {total}
          </span>
        </div>

        <div style={{ width: '1px', height: '14px', backgroundColor: '#1a2336' }} />

        {/* Status Counters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Todo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b' }} />
            <span>Todo</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#e2e8f0', fontWeight: 600 }}>{todo}</span>
          </div>

          {/* In Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
            <span>In Progress</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#818cf8', fontWeight: 700 }}>{inProgress}</span>
          </div>

          {/* In Review */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <span>Review</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#fcd34d', fontWeight: 600 }}>{inReview}</span>
          </div>

          {/* Completed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>Completed</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#86efac', fontWeight: 700 }}>{completed}</span>
          </div>
        </div>
      </div>

      {/* Right: Inline Velocity Meter & Keyboard Short-cut hints */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Compact Velocity Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#64748b', fontSize: '0.6875rem' }}>Velocity:</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#86efac', fontWeight: 700, fontSize: '0.72rem' }}>
            {completionRate}%
          </span>
          <div style={{
            width: '72px',
            height: '4px',
            backgroundColor: '#161f33',
            borderRadius: '2px',
            overflow: 'hidden',
            border: '1px solid #1a2336'
          }}>
            <div
              style={{
                width: `${completionRate}%`,
                height: '100%',
                backgroundColor: '#10b981',
                borderRadius: '2px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        <div style={{ width: '1px', height: '14px', backgroundColor: '#1a2336' }} className="desktop-only" />

        {/* Keyboard Shortcut Hints */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.6875rem' }} className="desktop-only">
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <kbd style={{ backgroundColor: '#161f33', border: '1px solid #222f47', padding: '1px 4px', borderRadius: '3px', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}>1</kbd>
            <kbd style={{ backgroundColor: '#161f33', border: '1px solid #222f47', padding: '1px 4px', borderRadius: '3px', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}>2</kbd>
            <kbd style={{ backgroundColor: '#161f33', border: '1px solid #222f47', padding: '1px 4px', borderRadius: '3px', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}>3</kbd>
            <span style={{ marginLeft: '2px' }}>Switch View</span>
          </div>
          <span>·</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <kbd style={{ backgroundColor: '#161f33', border: '1px solid #222f47', padding: '1px 4px', borderRadius: '3px', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}>C</kbd>
            <span>New</span>
          </div>
        </div>
      </div>
    </div>
  );
}
