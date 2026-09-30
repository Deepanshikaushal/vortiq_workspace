import React, { useState } from 'react';
import {
  Sparkles,
  X,
  AlertTriangle,
  Clock,
  Calendar,
  MessageSquare,
  Copy,
  ArrowRight,
  CheckCircle2,
  GitMerge,
  RotateCcw,
  Zap,
  HelpCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Layers,
  Users,
  Compass,
  CornerDownRight,
  TrendingUp,
  ShieldCheck,
  Check
} from 'lucide-react';
import { playClickSound, playTaskCompleteSound } from '../utils/audioEffects';

export default function FlowIntelligencePanel({
  isOpen,
  onClose,
  tasks = [],
  projects = [],
  currentUser,
  onOpenTask,
  onAddToast,
  onPromoteToFocus
}) {
  const [activeTab, setActiveTab] = useState('ATTENTION'); // 'ATTENTION' | 'SMART_BRIEF'
  const [expandedInsightId, setExpandedInsightId] = useState(null);
  const [resolvedInsightIds, setResolvedInsightIds] = useState(new Set());
  const [reschedulingId, setReschedulingId] = useState(null);

  // Observed workspace intelligence signals
  const initialObservations = [
    {
      id: 'sig-1',
      category: 'DEADLINES',
      severity: 'CRITICAL',
      title: '3 tasks are approaching their deadlines',
      subtitle: 'OAuth2 token handshake, DB partitioning, and OpenAPI schema need to be merged within the next 4 hours.',
      details: 'Based on your team velocity of ~45m per review, starting now gives sufficient runway before staging deploy window (18:00 UTC).',
      recommendation: 'Prioritize OAuth2 handshake first to unblock frontend auth team.',
      impact: 'Avoids staging release candidate regression.',
      actions: ['Reschedule', 'Open', 'Ask Flow']
    },
    {
      id: 'sig-2',
      category: 'INACTIVITY',
      severity: 'WARNING',
      title: "Project 'Cloud Infrastructure' has been inactive for 4 days",
      subtitle: 'No commits, task updates, or PR merges detected since Thursday.',
      details: 'Sprint burndown trajectory has flattened by 18%. 2 pending tasks remain in TODO without assignees.',
      recommendation: 'Schedule a 10m pulse check with Marcus Vance or assign tasks to active sprint backlog.',
      impact: 'Prevents sprint rollover delay.',
      actions: ['Resolve', 'Open', 'Ask Flow']
    },
    {
      id: 'sig-3',
      category: 'COMMUNICATION',
      severity: 'HIGH',
      title: 'Sarah is waiting for your response',
      subtitle: 'Comment in #team-architecture: "Should we throttle per workspace token or per IP address?"',
      details: 'Posted 24 minutes ago. Thread is holding up the rate limiting middleware PR submission.',
      recommendation: 'Recommend per-workspace token throttling with fallback to IP for unauthenticated routes.',
      impact: 'Unblocks PR #108 merge.',
      actions: ['Resolve', 'Open', 'Ask Flow']
    },
    {
      id: 'sig-4',
      category: 'DUPLICATE',
      severity: 'INFO',
      title: 'Two tasks appear to be duplicates',
      subtitle: '"Refactor login session" (#102) and "Implement OAuth2 PKCE Token Flow" (#109) have 84% scope overlap.',
      details: 'Both tasks specify token storage in secure cookies and redirect URL callback validation.',
      recommendation: 'Merge #102 into #109 and archive duplicate to consolidate acceptance criteria.',
      impact: 'Saves estimated 1.5 hours of redundant QA testing.',
      actions: ['Resolve', 'Open', 'Ask Flow']
    },
    {
      id: 'sig-5',
      category: 'SCHEDULE',
      severity: 'SCHEDULE',
      title: 'You have 2.5 hours of meetings tomorrow',
      subtitle: 'Design Review (10:00), Sprint Retrospective (14:00), and Client Architecture Demo (16:30).',
      details: 'Leaves only one unbroken 90-minute focus window tomorrow between 11:30 and 13:00.',
      recommendation: 'Reserve tomorrow 11:30 - 13:00 for deep code review before meetings begin.',
      impact: 'Protects deep work block from ad-hoc interruptions.',
      actions: ['Resolve', 'Ask Flow']
    }
  ];

  const [observations, setObservations] = useState(initialObservations);

  // Smart Brief Day Data
  const smartBriefData = {
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    whatChangedYesterday: [
      '7 tasks completed across Core Platform & Mobile Companion',
      'Marcus Vance merged PR #114 (PostgreSQL Index Optimization · 6.8ms latency achieved)',
      'Sprint 18 overall velocity increased by +12%'
    ],
    whatMattersToday: [
      'Deploy authentication token handshake to staging environment before 18:00',
      'Resolve PostgreSQL connection pool configuration blocker'
    ],
    deadlines: [
      'OAuth2 PKCE handshake (Due today 18:00 UTC)',
      'Swagger OpenAPI 3.0 specification update (Due tonight 20:00 UTC)'
    ],
    blockers: [
      '1 active blocker: DB schema migration approval pending Tech Lead sign-off'
    ],
    teamActivity: [
      'Alex Rivera, Sarah Chen, and Marcus Vance are active in workspace',
      '14 git commits pushed to main in the last 24h'
    ],
    suggestedFocusOrder: [
      { order: 1, title: 'Finish authentication flow & PKCE token handshake', time: '45m', reason: 'High impact · Unblocks staging deploy' },
      { order: 2, title: "Reply to Sarah's API rate limiting thread", time: '10m', reason: 'Unblocks middleware PR' },
      { order: 3, title: 'Review PR #104 from Marcus Vance', time: '30m', reason: 'Final database milestone' },
      { order: 4, title: 'Inspect PostgreSQL connection pool settings', time: '20m', reason: 'Prevents weekend bottleneck' }
    ]
  };

  const handleResolveAction = (obs) => {
    playTaskCompleteSound();
    setResolvedInsightIds((prev) => new Set([...prev, obs.id]));
    onAddToast?.(`Resolved: "${obs.title}"`, 'success');
  };

  const handleActionClick = (obs, actionType) => {
    playClickSound();
    if (actionType === 'Resolve') {
      handleResolveAction(obs);
    } else if (actionType === 'Open') {
      onOpenTask?.();
      onAddToast?.(`Opened context for: "${obs.title}"`, 'info');
    } else if (actionType === 'Reschedule') {
      setReschedulingId(reschedulingId === obs.id ? null : obs.id);
    } else if (actionType === 'Ask Flow') {
      setExpandedInsightId(expandedInsightId === obs.id ? null : obs.id);
    }
  };

  const confirmReschedule = (obs, days) => {
    playClickSound();
    setReschedulingId(null);
    setResolvedInsightIds((prev) => new Set([...prev, obs.id]));
    onAddToast?.(`Rescheduled items for "${obs.title}" by +${days} day(s)`, 'success');
  };

  if (!isOpen) return null;

  const activeObservations = observations.filter((o) => !resolvedInsightIds.has(o.id));

  return (
    <>
      {/* Semi-transparent backdrop for mobile / dismiss */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(8, 12, 20, 0.45)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: 95
        }}
      />

      {/* Right Intelligence Drawer Panel */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '430px',
          backgroundColor: '#0c101a',
          borderLeft: '1px solid #1a2336',
          boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.65)',
          zIndex: 96,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Top Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #1a2336',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#111726'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={16} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h2 style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: '#f8fafc',
                  margin: 0,
                  letterSpacing: '-0.01em'
                }}>
                  Flow Intelligence
                </h2>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 6px #10b981'
                }} />
              </div>
              <p style={{ fontSize: '0.68rem', color: '#64748b', margin: '2px 0 0' }}>
                Observing 3 active projects · Context engine active
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px'
            }}
            title="Close Panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* View Switcher Tabs: Real-Time Context vs Smart Brief */}
        <div style={{
          display: 'flex',
          padding: '0.5rem 1rem',
          backgroundColor: '#0e1422',
          borderBottom: '1px solid #1a2336',
          gap: '0.5rem'
        }}>
          <button
            onClick={() => { playClickSound(); setActiveTab('ATTENTION'); }}
            style={{
              flex: 1,
              padding: '0.45rem 0.65rem',
              borderRadius: '5px',
              border: activeTab === 'ATTENTION' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
              backgroundColor: activeTab === 'ATTENTION' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'ATTENTION' ? '#f8fafc' : '#94a3b8',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              transition: 'all 0.12s'
            }}
          >
            <AlertTriangle size={13} color={activeTab === 'ATTENTION' ? '#818cf8' : '#64748b'} />
            <span>Needs Attention ({activeObservations.length})</span>
          </button>

          <button
            onClick={() => { playClickSound(); setActiveTab('SMART_BRIEF'); }}
            style={{
              flex: 1,
              padding: '0.45rem 0.65rem',
              borderRadius: '5px',
              border: activeTab === 'SMART_BRIEF' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
              backgroundColor: activeTab === 'SMART_BRIEF' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'SMART_BRIEF' ? '#f8fafc' : '#94a3b8',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              transition: 'all 0.12s'
            }}
          >
            <Compass size={13} color={activeTab === 'SMART_BRIEF' ? '#818cf8' : '#64748b'} />
            <span>Smart Brief</span>
          </button>
        </div>

        {/* Panel Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          
          {/* =========================================================================
              TAB 1: "YOUR WORKSPACE NEEDS ATTENTION"
              ========================================================================= */}
          {activeTab === 'ATTENTION' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#94a3b8'
                }}>
                  Observed Friction & Opportunities
                </span>

                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  Auto-evaluates on task mutations
                </span>
              </div>

              {activeObservations.length === 0 ? (
                <div style={{
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  backgroundColor: '#111726',
                  borderRadius: '8px',
                  border: '1px solid #1f2b42',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}>
                  <ShieldCheck size={28} color="#10b981" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                    Zero Workspace Friction
                  </span>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, maxWidth: '240px' }}>
                    All deadlines are covered, communications answered, and sprint tracks are healthy.
                  </p>
                </div>
              ) : (
                activeObservations.map((obs) => {
                  const isExpanded = expandedInsightId === obs.id;
                  const isRescheduling = reschedulingId === obs.id;

                  const badgeColors = {
                    DEADLINES: { bg: 'rgba(239, 68, 68, 0.15)', text: '#fca5a5', border: 'rgba(239, 68, 68, 0.3)' },
                    INACTIVITY: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fcd34d', border: 'rgba(245, 158, 11, 0.3)' },
                    COMMUNICATION: { bg: 'rgba(56, 189, 248, 0.15)', text: '#7dd3fc', border: 'rgba(56, 189, 248, 0.3)' },
                    DUPLICATE: { bg: 'rgba(168, 85, 247, 0.15)', text: '#d8b4fe', border: 'rgba(168, 85, 247, 0.3)' },
                    SCHEDULE: { bg: 'rgba(99, 102, 241, 0.15)', text: '#a5b4fc', border: 'rgba(99, 102, 241, 0.3)' }
                  };

                  const currentBadge = badgeColors[obs.category] || badgeColors.SCHEDULE;

                  return (
                    <div
                      key={obs.id}
                      style={{
                        padding: '0.85rem 1rem',
                        backgroundColor: '#111726',
                        borderRadius: '8px',
                        border: '1px solid #1f2b42',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.55rem',
                        transition: 'border-color 0.15s ease'
                      }}
                    >
                      {/* Top Category Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          backgroundColor: currentBadge.bg,
                          color: currentBadge.text,
                          border: `1px solid ${currentBadge.border}`
                        }}>
                          {obs.category}
                        </span>

                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                          Real-time telemetry
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <div>
                        <h3 style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: '#f8fafc',
                          margin: '0 0 3px',
                          lineHeight: 1.3
                        }}>
                          {obs.title}
                        </h3>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#94a3b8',
                          margin: 0,
                          lineHeight: 1.4
                        }}>
                          {obs.subtitle}
                        </p>
                      </div>

                      {/* Contextual Action Buttons */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        flexWrap: 'wrap',
                        marginTop: '2px',
                        paddingTop: '0.45rem',
                        borderTop: '1px solid #1a2336'
                      }}>
                        {obs.actions.map((act) => (
                          <button
                            key={act}
                            onClick={() => handleActionClick(obs, act)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '4px',
                              border: act === 'Resolve' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #1f2b42',
                              backgroundColor: act === 'Resolve' ? 'rgba(16, 185, 129, 0.1)' : '#0c101a',
                              color: act === 'Resolve' ? '#86efac' : act === 'Ask Flow' ? '#818cf8' : '#cbd5e1',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.12s'
                            }}
                          >
                            {act === 'Resolve' && <Check size={12} />}
                            {act === 'Ask Flow' && <Sparkles size={12} />}
                            <span>{act}</span>
                          </button>
                        ))}
                      </div>

                      {/* Reschedule Inline Quick Selector */}
                      {isRescheduling && (
                        <div style={{
                          padding: '0.65rem',
                          backgroundColor: '#0c101a',
                          borderRadius: '6px',
                          border: '1px solid #24324f',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.45rem',
                          marginTop: '4px'
                        }}>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                            Select target runway extension:
                          </span>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => confirmReschedule(obs, 1)}
                              style={{ flex: 1, padding: '3px 6px', fontSize: '0.68rem', backgroundColor: '#161f33', border: '1px solid #222f47', color: '#cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              +1 Day
                            </button>
                            <button
                              onClick={() => confirmReschedule(obs, 3)}
                              style={{ flex: 1, padding: '3px 6px', fontSize: '0.68rem', backgroundColor: '#161f33', border: '1px solid #222f47', color: '#cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              +3 Days
                            </button>
                            <button
                              onClick={() => confirmReschedule(obs, 7)}
                              style={{ flex: 1, padding: '3px 6px', fontSize: '0.68rem', backgroundColor: '#161f33', border: '1px solid #222f47', color: '#cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Next Sprint
                            </button>
                          </div>
                        </div>
                      )}

                      {/* [Ask Flow] Expanded Intelligence Reasoning */}
                      {isExpanded && (
                        <div style={{
                          padding: '0.75rem',
                          backgroundColor: '#090d16',
                          borderRadius: '6px',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.45rem',
                          fontSize: '0.72rem',
                          color: '#cbd5e1',
                          lineHeight: 1.45
                        }}>
                          <div>
                            <span style={{ color: '#818cf8', fontWeight: 700 }}>Telemetry Analysis: </span>
                            {obs.details}
                          </div>
                          <div>
                            <span style={{ color: '#38bdf8', fontWeight: 700 }}>Suggested Path: </span>
                            {obs.recommendation}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                            Impact: {obs.impact}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          ) : (
            /* =========================================================================
                TAB 2: "SMART BRIEF" - YOUR FLOW BRIEF
                ========================================================================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '0.9rem',
                backgroundColor: '#111726',
                borderRadius: '8px',
                border: '1px solid #1f2b42'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                  <Compass size={15} color="#818cf8" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#f8fafc' }}>
                    Your Flow Brief
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {smartBriefData.date} · Morning Executive Workspace Summary
                </div>
              </div>

              {/* What Changed Yesterday */}
              <div style={{
                padding: '0.85rem',
                backgroundColor: '#111726',
                borderRadius: '8px',
                border: '1px solid #1f2b42',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem'
              }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
                  What Changed Yesterday
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {smartBriefData.whatChangedYesterday.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                      <CheckCircle2 size={13} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What Matters Today */}
              <div style={{
                padding: '0.85rem',
                backgroundColor: '#111726',
                borderRadius: '8px',
                border: '1px solid #1f2b42',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem'
              }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
                  What Matters Today
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {smartBriefData.whatMattersToday.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                      <Zap size={13} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deadlines & Blockers Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: '#111726', borderRadius: '6px', border: '1px solid #1f2b42' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Deadlines
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.3 }}>
                    2 deliverables due today by 18:00
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#111726', borderRadius: '6px', border: '1px solid #1f2b42' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Active Blockers
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.3 }}>
                    1 schema approval pending
                  </div>
                </div>
              </div>

              {/* Suggested Focus Order */}
              <div style={{
                padding: '0.85rem',
                backgroundColor: '#111726',
                borderRadius: '8px',
                border: '1px solid #1f2b42',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
                    Suggested Focus Order
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#818cf8' }}>
                    Optimal energy sequencing
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {smartBriefData.suggestedFocusOrder.map((step) => (
                    <div
                      key={step.order}
                      style={{
                        padding: '0.55rem 0.75rem',
                        backgroundColor: '#0c101a',
                        borderRadius: '6px',
                        border: '1px solid #1f2b42',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.55rem'
                      }}
                    >
                      <span style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        color: '#818cf8',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {step.order}
                      </span>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                          {step.title}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                          <span style={{ color: '#818cf8', fontFamily: 'var(--font-mono)' }}>{step.time}</span>
                          <span>·</span>
                          <span>{step.reason}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Panel Footer */}
        <div style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid #1a2336',
          backgroundColor: '#0c101a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.7rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={13} color="#818cf8" />
            <span>Flow Intelligence Engine</span>
          </div>

          <span>Press ESC or I to toggle</span>
        </div>
      </aside>
    </>
  );
}
