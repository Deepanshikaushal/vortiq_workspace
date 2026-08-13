import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Layers, TrendingUp, Zap, Sparkles } from 'lucide-react';

export default function MetricsOverview({ stats }) {
  const { total = 0, todo = 0, inProgress = 0, inReview = 0, completed = 0, completionRate = 0 } = stats || {};

  const cards = [
    {
      title: 'Total Backlog',
      value: total,
      sub: `${todo} pending tasks`,
      icon: Layers,
      color: '#06b6d4',
      bgGlow: 'rgba(6, 182, 212, 0.15)'
    },
    {
      title: 'In Progress',
      value: inProgress,
      sub: `${inReview} awaiting PR review`,
      icon: Clock,
      color: '#8b5cf6',
      bgGlow: 'rgba(139, 92, 246, 0.15)'
    },
    {
      title: 'Completed',
      value: completed,
      sub: `${completionRate}% velocity score`,
      icon: CheckCircle2,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)'
    },
    {
      title: 'Action Needed',
      value: inReview + todo,
      sub: 'Items requiring focus',
      icon: AlertCircle,
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.15)'
    }
  ];

  return (
    <div style={{ marginBottom: '2rem' }}>
      
      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-card animate-fade-in" style={{ padding: '1.35rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.785rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                    {card.title}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-0.03em' }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '0.785rem', fontWeight: '600', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                    {card.sub}
                  </div>
                </div>

                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '16px',
                  background: card.bgGlow,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color,
                  border: `1px solid ${card.color}44`,
                  boxShadow: `0 0 20px ${card.color}25`
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
      <div className="glass-card" style={{ marginTop: '1.25rem', padding: '1.2rem 1.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)' }}>
              <Zap size={18} />
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>Sprint Completion Velocity</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '0.6rem' }}>({completed} of {total} tasks completed)</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(16, 185, 129, 0.12)', padding: '0.3rem 0.85rem', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
            <Sparkles size={14} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#34d399' }}>
              {completionRate}% Velocity Score
            </span>
          </div>
        </div>

        {/* Multi-Gradient Progress Bar */}
        <div style={{ height: '10px', width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '9999px', overflow: 'hidden', padding: '2px' }}>
          <div style={{
            height: '100%',
            width: `${completionRate}%`,
            background: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #10b981)',
            borderRadius: '9999px',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.6)',
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>
      </div>

    </div>
  );
}
