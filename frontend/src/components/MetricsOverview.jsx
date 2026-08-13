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
      color: '#00f2fe',
      borderGlow: 'rgba(0, 242, 254, 0.4)',
      bgGlow: 'rgba(0, 242, 254, 0.15)'
    },
    {
      title: 'In Progress',
      value: inProgress,
      sub: `${inReview} in review`,
      icon: Activity,
      color: '#a855f7',
      borderGlow: 'rgba(168, 85, 247, 0.4)',
      bgGlow: 'rgba(168, 85, 247, 0.15)'
    },
    {
      title: 'Completed',
      value: completed,
      sub: `${completionRate}% velocity score`,
      icon: CheckCircle2,
      color: '#00f5a0',
      borderGlow: 'rgba(0, 245, 160, 0.4)',
      bgGlow: 'rgba(0, 245, 160, 0.15)'
    },
    {
      title: 'Action Needed',
      value: inReview + todo,
      sub: 'Tasks requiring focus',
      icon: AlertCircle,
      color: '#ffb703',
      borderGlow: 'rgba(255, 183, 3, 0.4)',
      bgGlow: 'rgba(255, 183, 3, 0.15)'
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
                boxShadow: `0 10px 30px -10px ${card.bgGlow}, 0 0 15px ${card.bgGlow}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.785rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                    {card.title}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.3rem', fontWeight: '900', letterSpacing: '-0.04em', color: card.color }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '0.785rem', fontWeight: '600', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                    {card.sub}
                  </div>
                </div>

                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: card.bgGlow,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                  border: `1px solid ${card.color}55`,
                  boxShadow: `0 0 25px ${card.color}35`
                }}>
                  <Icon size={26} />
                </div>
              </div>

              {/* Bottom Accent Line */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${card.color}, transparent)` }} />
            </div>
          );
        })}
      </div>

      {/* Interactive Velocity Meter */}
      <div className="glass-card" style={{ marginTop: '1.25rem', padding: '1.25rem 1.5rem', borderColor: 'var(--border-purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2fe' }}>
              <Activity size={20} />
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-main)' }}>Sprint Velocity & Completion Meter</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '0.6rem' }}>({completed} of {total} tasks completed)</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(0, 245, 160, 0.15)', padding: '0.35rem 0.9rem', borderRadius: '9999px', border: '1px solid rgba(0, 245, 160, 0.4)' }}>
            <Sparkles size={14} style={{ color: '#00f5a0' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#00f5a0' }}>
              {completionRate}% Velocity Score
            </span>
          </div>
        </div>

        {/* Multi-Gradient Progress Bar */}
        <div style={{ height: '12px', width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '9999px', overflow: 'hidden', padding: '2px', border: '1px solid var(--border-color)' }}>
          <div style={{
            height: '100%',
            width: `${completionRate}%`,
            background: 'linear-gradient(90deg, #00f2fe, #a855f7, #ff007f, #00f5a0)',
            borderRadius: '9999px',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.7)',
            transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>
      </div>

    </div>
  );
}
