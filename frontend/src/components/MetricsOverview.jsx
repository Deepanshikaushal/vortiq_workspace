import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Layers, Sparkles, Activity } from 'lucide-react';

export default function MetricsOverview({ stats }) {
  const { total = 0, todo = 0, inProgress = 0, inReview = 0, completed = 0, completionRate = 0 } = stats || {};

  const cards = [
    {
      title: 'Total Backlog',
      value: total,
      sub: `${todo} pending tasks`,
      icon: Layers,
      color: '#cbd5e1',
      borderGlow: 'rgba(148, 163, 184, 0.2)',
      bgGlow: 'rgba(100, 116, 139, 0.15)'
    },
    {
      title: 'In Progress',
      value: inProgress,
      sub: `${inReview} in review`,
      icon: Activity,
      color: '#93c5fd',
      borderGlow: 'rgba(99, 102, 241, 0.2)',
      bgGlow: 'rgba(99, 102, 241, 0.12)'
    },
    {
      title: 'Completed',
      value: completed,
      sub: `${completionRate}% velocity score`,
      icon: CheckCircle2,
      color: '#86efac',
      borderGlow: 'rgba(16, 185, 129, 0.2)',
      bgGlow: 'rgba(16, 185, 129, 0.12)'
    },
    {
      title: 'Action Needed',
      value: inReview + todo,
      sub: 'Tasks requiring focus',
      icon: AlertCircle,
      color: '#fde68a',
      borderGlow: 'rgba(245, 158, 11, 0.2)',
      bgGlow: 'rgba(245, 158, 11, 0.12)'
    }
  ];

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      
      {/* 4 Stat Cards */}
      <div className="metrics-grid">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-card animate-fade-in"
              style={{
                padding: '1rem 0.9rem',
                position: 'relative',
                overflow: 'hidden',
                borderColor: 'var(--border-color)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.725rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>
                    {card.title}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: '700', letterSpacing: '-0.02em', color: card.color }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '0.725rem', fontWeight: '500', color: 'var(--text-dim)', marginTop: '0.1rem' }}>
                    {card.sub}
                  </div>
                </div>

                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: card.bgGlow,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                  border: `1px solid ${card.borderGlow}`,
                  flexShrink: 0
                }}>
                  <Icon size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Velocity Meter */}
      <div className="glass-card" style={{ marginTop: '1rem', padding: '0.9rem 1.15rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(100, 116, 139, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
              <Activity size={15} />
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>Sprint Velocity & Completion Meter</span>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', display: 'inline-block', marginLeft: '0.4rem' }}>({completed} of {total} tasks)</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.25rem 0.65rem', borderRadius: '9999px', border: '1px solid var(--border-color)' }}>
            <Sparkles size={12} style={{ color: '#86efac' }} />
            <span style={{ fontSize: '0.785rem', fontWeight: '600', color: '#86efac' }}>
              {completionRate}% Velocity Score
            </span>
          </div>
        </div>

        {/* Muted Progress Bar */}
        <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '9999px', overflow: 'hidden', padding: '1px', border: '1px solid var(--border-color)' }}>
          <div style={{
            height: '100%',
            width: `${completionRate}%`,
            background: 'linear-gradient(90deg, #64748b, #10b981)',
            borderRadius: '9999px',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>
      </div>

    </div>
  );
}
