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
      color: '#e11d48',
      borderGlow: 'rgba(225, 29, 72, 0.4)',
      bgGlow: 'rgba(225, 29, 72, 0.18)'
    },
    {
      title: 'In Progress',
      value: inProgress,
      sub: `${inReview} in review`,
      icon: Activity,
      color: '#f43f5e',
      borderGlow: 'rgba(244, 63, 94, 0.4)',
      bgGlow: 'rgba(244, 63, 94, 0.18)'
    },
    {
      title: 'Completed',
      value: completed,
      sub: `${completionRate}% velocity score`,
      icon: CheckCircle2,
      color: '#10b981',
      borderGlow: 'rgba(16, 185, 129, 0.4)',
      bgGlow: 'rgba(16, 185, 129, 0.18)'
    },
    {
      title: 'Action Needed',
      value: inReview + todo,
      sub: 'Tasks requiring focus',
      icon: AlertCircle,
      color: '#fb7185',
      borderGlow: 'rgba(251, 113, 133, 0.4)',
      bgGlow: 'rgba(251, 113, 133, 0.18)'
    }
  ];

  return (
    <div style={{ marginBottom: '2rem' }}>
      
      {/* 4 Stat Cards */}
      <div className="metrics-grid">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-card animate-fade-in"
              style={{
                padding: '1.15rem 1rem',
                position: 'relative',
                overflow: 'hidden',
                borderColor: card.borderGlow,
                boxShadow: `0 8px 25px -5px ${card.bgGlow}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.725rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                    {card.title}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.03em', color: card.color }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '0.725rem', fontWeight: '600', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                    {card.sub}
                  </div>
                </div>

                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: card.bgGlow,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                  border: `1px solid ${card.color}44`,
                  flexShrink: 0
                }}>
                  <Icon size={20} />
                </div>
              </div>

              {/* Bottom Accent Line */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${card.color}, transparent)` }} />
            </div>
          );
        })}
      </div>

      {/* Interactive Velocity Meter */}
      <div className="glass-card" style={{ marginTop: '1rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(225, 29, 72, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff859b' }}>
              <Activity size={18} />
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>Sprint Velocity & Completion Meter</span>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-dim)', display: 'inline-block', marginLeft: '0.5rem' }}>({completed} of {total} tasks)</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(225, 29, 72, 0.2)', padding: '0.3rem 0.75rem', borderRadius: '9999px', border: '1px solid rgba(225, 29, 72, 0.4)' }}>
            <Sparkles size={13} style={{ color: '#ff859b' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ff859b' }}>
              {completionRate}% Velocity Score
            </span>
          </div>
        </div>

        {/* Muted Progress Bar */}
        <div style={{ height: '10px', width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '9999px', overflow: 'hidden', padding: '2px', border: '1px solid var(--border-color)' }}>
          <div style={{
            height: '100%',
            width: `${completionRate}%`,
            background: 'linear-gradient(90deg, #e11d48, #10b981)',
            borderRadius: '9999px',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>
      </div>

    </div>
  );
}
