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
      color: '#84cc16',
      borderGlow: 'rgba(132, 204, 22, 0.3)',
      bgGlow: 'rgba(132, 204, 22, 0.12)'
    },
    {
      title: 'In Progress',
      value: inProgress,
      sub: `${inReview} in review`,
      icon: Activity,
      color: '#a3e635',
      borderGlow: 'rgba(163, 230, 53, 0.3)',
      bgGlow: 'rgba(163, 230, 53, 0.12)'
    },
    {
      title: 'Completed',
      value: completed,
      sub: `${completionRate}% velocity score`,
      icon: CheckCircle2,
      color: '#10b981',
      borderGlow: 'rgba(16, 185, 129, 0.3)',
      bgGlow: 'rgba(16, 185, 129, 0.12)'
    },
    {
      title: 'Action Needed',
      value: inReview + todo,
      sub: 'Tasks requiring focus',
      icon: AlertCircle,
      color: '#f59e0b',
      borderGlow: 'rgba(245, 158, 11, 0.3)',
      bgGlow: 'rgba(245, 158, 11, 0.12)'
    }
  ];

  return (
    <div style={{ marginBottom: '2rem' }}>
      
      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-card animate-fade-in"
              style={{
                padding: '1.35rem',
                position: 'relative',
                overflow: 'hidden',
                borderColor: card.borderGlow,
                boxShadow: `0 8px 25px -5px ${card.bgGlow}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.785rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                    {card.title}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.3rem', fontWeight: '800', letterSpacing: '-0.03em', color: card.color }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '0.785rem', fontWeight: '600', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                    {card.sub}
                  </div>
                </div>

                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  background: card.bgGlow,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                  border: `1px solid ${card.color}44`
                }}>
                  <Icon size={24} />
                </div>
              </div>

              {/* Bottom Accent Line */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${card.color}, transparent)` }} />
            </div>
          );
        })}
      </div>

      {/* Interactive Velocity Meter */}
      <div className="glass-card" style={{ marginTop: '1.25rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(132, 204, 22, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#84cc16' }}>
              <Activity size={20} />
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-main)' }}>Sprint Velocity & Completion Meter</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '0.6rem' }}>({completed} of {total} tasks completed)</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(132, 204, 22, 0.12)', padding: '0.35rem 0.9rem', borderRadius: '9999px', border: '1px solid rgba(132, 204, 22, 0.3)' }}>
            <Sparkles size={14} style={{ color: '#84cc16' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#a3e635' }}>
              {completionRate}% Velocity Score
            </span>
          </div>
        </div>

        {/* Muted Progress Bar */}
        <div style={{ height: '10px', width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '9999px', overflow: 'hidden', padding: '2px', border: '1px solid var(--border-color)' }}>
          <div style={{
            height: '100%',
            width: `${completionRate}%`,
            background: 'linear-gradient(90deg, #84cc16, #10b981)',
            borderRadius: '9999px',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>
      </div>

    </div>
  );
}
