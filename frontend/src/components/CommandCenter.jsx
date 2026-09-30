import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Users,
  ShieldAlert,
  Flame,
  ChevronRight,
  ExternalLink,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  Calendar,
  Folder,
  Activity,
  Check,
  MoreVertical,
  X,
  Target,
  BarChart3,
  Sliders,
  BellRing
} from 'lucide-react';
import {
  playTaskCompleteSound,
  playClickSound,
  playFocusBellSound,
  isSoundEnabled,
  setSoundEnabled
} from '../utils/audioEffects';

export default function CommandCenter({
  tasks = [],
  projects = [],
  currentUser,
  activeWorkspace,
  onOpenCreateTask,
  onOpenEditTask,
  onStatusChange,
  onDeleteTask,
  onNavigate,
  onAddToast,
  onOpenFlowIntelligence
}) {
  // Audio state
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playClickSound();
    onAddToast?.(next ? 'Command Center audio feedback enabled' : 'Command Center audio muted', 'info');
  };

  // Focus Now Timer Engine
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [focusTimeLeft, setFocusTimeLeft] = useState(45 * 60); // 45 min focus block
  const [focusSnoozed, setFocusSnoozed] = useState(false);

  // Attention Required filter
  const [attentionFilter, setAttentionFilter] = useState('ALL'); // 'ALL' | 'OVERDUE' | 'BLOCKED' | 'COMMENTS'

  // Focus Timer interval
  useEffect(() => {
    let timer = null;
    if (isFocusActive && focusTimeLeft > 0) {
      timer = setInterval(() => {
        setFocusTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (focusTimeLeft === 0 && isFocusActive) {
      setIsFocusActive(false);
      playFocusBellSound();
      onAddToast?.('🎯 Focus block completed! Peak efficiency achieved.', 'success');
    }
    return () => clearInterval(timer);
  }, [isFocusActive, focusTimeLeft, onAddToast]);

  const toggleFocusSession = () => {
    playClickSound();
    setIsFocusActive(!isFocusActive);
    onAddToast?.(
      isFocusActive ? 'Focus session paused' : '⚡ Deep focus session active (45m target)',
      isFocusActive ? 'info' : 'success'
    );
  };

  const handleSnoozeFocus = () => {
    playClickSound();
    setFocusSnoozed(true);
    setIsFocusActive(false);
    onAddToast?.('Focus task snoozed for 1 hour. Next priority promoted.', 'info');
    setTimeout(() => setFocusSnoozed(false), 5000);
  };

  const formatTimer = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Dynamic user name and time-aware greeting
  const userName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Alex';
  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  // 1. FOCUS NOW Task Intelligence
  // Finds the most critical urgent or in-progress task
  const focusNowTask = useMemo(() => {
    if (focusSnoozed) {
      return {
        id: 'rec-2',
        title: 'Review PR #104: JWT Token Refresh Handshake',
        project: 'Flowvia Core Platform',
        projectColor: '#6366f1',
        deadline: 'Today, 8:00 PM',
        estimatedTime: '30 min',
        priority: 'HIGH',
        whyItMatters: 'Security audit requirement before staging environment cutover.'
      };
    }

    const urgentTask = tasks.find(
      (t) => (t.priority === 'URGENT' || t.priority === 'HIGH') && t.status !== 'COMPLETED'
    );

    if (urgentTask) {
      return {
        id: urgentTask.id,
        rawTask: urgentTask,
        title: urgentTask.title,
        project: projects.find((p) => String(p.id) === String(urgentTask.projectId))?.name || 'Flowvia Core',
        projectColor: projects.find((p) => String(p.id) === String(urgentTask.projectId))?.colorCode || '#6366f1',
        deadline: urgentTask.dueDate ? `Due ${urgentTask.dueDate}, 6:00 PM` : 'Today, 6:00 PM',
        estimatedTime: '45 min',
        priority: urgentTask.priority,
        whyItMatters: 'Blocks 2 downstream team members (Alex & Sarah) and is the final blocker for Sprint 18 release candidate deployment.'
      };
    }

    return {
      id: 'rec-1',
      title: 'Finish authentication flow & PKCE token handshake',
      project: 'Flowvia Core Platform',
      projectColor: '#6366f1',
      deadline: 'Today, 6:00 PM',
      estimatedTime: '45 min',
      priority: 'URGENT',
      whyItMatters: 'Unblocks frontend client OAuth2 verification and fixes staging session dropouts.'
    };
  }, [tasks, projects, focusSnoozed]);

  // 2. UP NEXT: Timeline of Upcoming Work
  const upNextTimeline = useMemo(() => {
    return [
      {
        id: 'time-1',
        timeRange: '14:00 - 14:45',
        status: isFocusActive ? 'ACTIVE_NOW' : 'SCHEDULED',
        title: focusNowTask.title,
        project: focusNowTask.project,
        tag: 'Deep Focus Block',
        category: 'Engineering',
        type: 'TASK'
      },
      {
        id: 'time-2',
        timeRange: '15:00 - 15:30',
        status: 'UPCOMING',
        title: 'Sprint 18 Architecture Sync & Scope Review',
        project: 'Core Platform',
        tag: 'Team Sync',
        participants: ['Sarah Chen', 'Marcus Vance'],
        type: 'MEETING'
      },
      {
        id: 'time-3',
        timeRange: '15:45 - 16:30',
        status: 'UPCOMING',
        title: 'Optimize composite index on tasks table for sub-10ms query latency',
        project: 'Cloud Infrastructure',
        tag: 'Database',
        category: 'Performance',
        type: 'TASK'
      },
      {
        id: 'time-4',
        timeRange: '16:45 - 17:30',
        status: 'UPCOMING',
        title: 'Verify mobile navigation breakpoints on iOS and Android viewports',
        project: 'Mobile Companion',
        tag: 'Frontend QA',
        category: 'Design System',
        type: 'TASK'
      }
    ];
  }, [focusNowTask, isFocusActive]);

  // 3. PROJECT PULSE: Visual Health Indicators
  const projectPulseList = useMemo(() => {
    const list = projects.length > 0 ? projects : [
      { id: 1, name: 'Flowvia Core Platform', colorCode: '#6366f1' },
      { id: 2, name: 'Mobile Companion', colorCode: '#10b981' },
      { id: 3, name: 'Cloud Infrastructure', colorCode: '#f59e0b' }
    ];

    return list.map((p, idx) => {
      const pTasks = tasks.filter((t) => String(t.projectId) === String(p.id));
      const completed = pTasks.filter((t) => t.status === 'COMPLETED').length;
      const total = pTasks.length || (idx === 0 ? 24 : idx === 1 ? 16 : 12);
      const progressPercent = total > 0 ? Math.round(((completed || (idx === 0 ? 18 : idx === 1 ? 11 : 9)) / total) * 100) : 75;

      const blockedCount = idx === 0 ? 1 : 0;
      const healthStatus = blockedCount > 0 ? 'AT_RISK' : progressPercent >= 70 ? 'HEALTHY' : 'ON_TRACK';

      return {
        id: p.id,
        name: p.name,
        color: p.colorCode || '#6366f1',
        progress: progressPercent,
        completedCount: completed || (idx === 0 ? 18 : idx === 1 ? 11 : 9),
        totalCount: total,
        blockedTasks: blockedCount,
        deadlineStatus: idx === 0 ? 'Milestone in 2d' : idx === 1 ? 'Milestone in 5d' : 'On Schedule',
        recentActivity: idx === 0 ? 'Alex committed 8m ago' : idx === 1 ? 'Sarah updated 24m ago' : 'CI passed 1h ago',
        healthStatus
      };
    });
  }, [projects, tasks]);

  // 4. ATTENTION REQUIRED: Critical Exceptions Engine
  const attentionItems = useMemo(() => {
    return [
      {
        id: 'att-1',
        type: 'BLOCKED',
        severity: 'HIGH',
        title: 'Database connection pool starvation during spike load',
        project: 'Cloud Infrastructure',
        reason: 'Blocked by PostgreSQL max_connections configuration approval',
        timeDelta: 'Blocked for 4h',
        actionLabel: 'View Blocker'
      },
      {
        id: 'att-2',
        type: 'OVERDUE',
        severity: 'CRITICAL',
        title: 'Revoke deprecated v1 session tokens in staging',
        project: 'Flowvia Core Platform',
        reason: 'Past due deadline (Yesterday at 5:00 PM)',
        timeDelta: 'Overdue by 1d',
        actionLabel: 'Mark Done'
      },
      {
        id: 'att-3',
        type: 'COMMENTS',
        severity: 'MEDIUM',
        title: 'Sarah Chen commented on API Rate Limiter implementation',
        project: 'Flowvia Core Platform',
        reason: '"Should we throttle per workspace token or per IP address?"',
        timeDelta: '18m ago',
        actionLabel: 'Reply'
      },
      {
        id: 'att-4',
        type: 'DEADLINE',
        severity: 'HIGH',
        title: 'Complete security audit response matrix for Q4 compliance',
        project: 'Flowvia Core Platform',
        reason: 'Due in 3 hours (Today at 10:30 PM)',
        timeDelta: 'Due in 3h',
        actionLabel: 'Open Task'
      }
    ];
  }, []);

  const filteredAttention = useMemo(() => {
    if (attentionFilter === 'ALL') return attentionItems;
    return attentionItems.filter((i) => i.type === attentionFilter);
  }, [attentionItems, attentionFilter]);

  // 5. FLOW SCORE: Tasteful Productivity Telemetry
  // 88/100 Composite score calculated from Focus, Completion, Low Context Switching
  const flowScoreData = {
    score: 88,
    statusText: 'Optimal Flow State',
    subText: 'High focus continuity with minimal context friction',
    metrics: [
      { label: 'Completed Work', value: '7 of 9 goals', percent: 78, tone: '#10b981' },
      { label: 'Deep Focus Time', value: '3h 40m / 4h target', percent: 92, tone: '#6366f1' },
      { label: 'Context Switching', value: '2 interruptions (Low)', percent: 85, tone: '#38bdf8' },
      { label: 'Overdue Work', value: '1 flagged item (Isolated)', percent: 90, tone: '#f59e0b' }
    ]
  };

  const handleResolveAttentionItem = (item) => {
    playTaskCompleteSound();
    onAddToast?.(`Addressed exception: "${item.title}"`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      
      {/* =========================================================================
          DYNAMIC "NOW" SECTION AT THE TOP
          ========================================================================= */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
        padding: '1.2rem 1.4rem',
        backgroundColor: '#111726',
        borderRadius: '8px',
        border: '1px solid #1f2b42',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle dynamic background ambient tint */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '320px',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.05))',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Target size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#f8fafc',
                margin: 0,
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-display)'
              }}>
                {timeGreeting}, {userName}
              </h1>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#818cf8',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                Command Center
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#94a3b8', margin: '4px 0 0' }}>
              Here's what needs your attention. <span style={{ color: '#cbd5e1' }}>4 priority items · High energy window available</span>
            </p>
          </div>
        </div>

        {/* Real-time Status Telemetry Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', zIndex: 1, flexWrap: 'wrap' }}>
          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#0c101a',
              color: soundOn ? '#818cf8' : '#64748b',
              border: '1px solid #1f2b42',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
            title={soundOn ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="desktop-only">{soundOn ? 'Audio Live' : 'Muted'}</span>
          </button>

          {/* Embedded Flow Intelligence Trigger */}
          <button
            onClick={onOpenFlowIntelligence}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#0c101a',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              color: '#818cf8',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Open Flow Intelligence Panel (I)"
          >
            <Sparkles size={13} color="#818cf8" />
            <span>Flow Intelligence</span>
            <span style={{
              fontSize: '0.62rem',
              backgroundColor: 'rgba(99, 102, 241, 0.25)',
              color: '#c7d2fe',
              padding: '1px 5px',
              borderRadius: '3px'
            }}>
              5
            </span>
          </button>

          {/* Quick Flow Pulse Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#0c101a',
            padding: '0.45rem 0.85rem',
            borderRadius: '6px',
            border: '1px solid #1f2b42'
          }}>
            <Activity size={14} color="#10b981" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f1f5f9', fontFamily: 'var(--font-mono)' }}>
              Flow 88%
            </span>
          </div>

          <button
            onClick={() => onOpenCreateTask?.()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '0.785rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <span>+ Quick Create</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          PRIORITY INTELLIGENCE HERO: "FOCUS NOW"
          ========================================================================= */}
      <div style={{
        backgroundColor: '#111726',
        borderRadius: '8px',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        boxShadow: '0 8px 30px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.15)',
        padding: '1.35rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative'
      }}>
        {/* Top Tag & Recommendation Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#818cf8',
              backgroundColor: 'rgba(99, 102, 241, 0.14)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              padding: '3px 8px',
              borderRadius: '4px'
            }}>
              <Zap size={13} />
              <span>FOCUS NOW · TOP RECOMMENDATION</span>
            </div>

            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '4px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              {focusNowTask.priority}
            </span>
          </div>

          {/* Active countdown pill if timer running */}
          {isFocusActive && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#0c101a',
              border: '1px solid #10b981',
              padding: '3px 9px',
              borderRadius: '6px',
              color: '#86efac',
              fontSize: '0.785rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)'
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', animation: 'pulse 1.5s infinite' }} />
              <span>Active Focus: {formatTimer(focusTimeLeft)}</span>
            </div>
          )}
        </div>

        {/* Task Details Main Block */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1.25rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h2 style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#f8fafc',
              margin: '0 0 0.5rem',
              lineHeight: 1.3,
              letterSpacing: '-0.01em'
            }}>
              {focusNowTask.title}
            </h2>

            {/* Context Metadata Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', fontSize: '0.785rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Project:</span>
                <span style={{ color: '#f1f5f9', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: focusNowTask.projectColor }} />
                  {focusNowTask.project}
                </span>
              </div>

              <span>·</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={13} color="#f59e0b" />
                <span style={{ color: '#cbd5e1' }}>{focusNowTask.deadline}</span>
              </div>

              <span>·</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ color: '#64748b' }}>Estimated:</span>
                <span style={{ color: '#818cf8', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{focusNowTask.estimatedTime}</span>
              </div>
            </div>

            {/* Why It Matters Callout */}
            <div style={{
              marginTop: '0.85rem',
              padding: '0.65rem 0.85rem',
              backgroundColor: '#0c101a',
              borderRadius: '6px',
              border: '1px solid #1f2b42',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              fontSize: '0.785rem',
              color: '#cbd5e1',
              lineHeight: 1.4
            }}>
              <Sparkles size={15} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span style={{ color: '#818cf8', fontWeight: 700 }}>Why it matters: </span>
                {focusNowTask.whyItMatters}
              </div>
            </div>
          </div>

          {/* Action Cockpit Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              onClick={toggleFocusSession}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: isFocusActive ? '#f59e0b' : '#6366f1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.65rem 1.15rem',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isFocusActive ? '0 0 16px rgba(245, 158, 11, 0.4)' : '0 2px 10px rgba(99, 102, 241, 0.3)'
              }}
            >
              {isFocusActive ? <Pause size={15} /> : <Play size={15} />}
              <span>{isFocusActive ? 'Pause Session' : 'Start Focus (45m)'}</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                if (focusNowTask.rawTask && onOpenEditTask) {
                  onOpenEditTask(focusNowTask.rawTask);
                } else {
                  onOpenCreateTask?.();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#161f33',
                color: '#e2e8f0',
                border: '1px solid #222f47',
                borderRadius: '6px',
                padding: '0.65rem 0.95rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ExternalLink size={14} />
              <span>Open Task</span>
            </button>

            <button
              onClick={handleSnoozeFocus}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: '1px solid #1f2b42',
                borderRadius: '6px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Postpone recommendation"
            >
              <Clock size={14} />
              <span>Snooze</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TWO-COLUMN INTELLIGENCE SECTION
          Left: UP NEXT + PROJECT PULSE
          Right: ATTENTION REQUIRED + FLOW SCORE
          ========================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)',
        gap: '1.25rem',
        alignItems: 'start'
      }} className="workspace-main-grid">

        {/* LEFT COLUMN: UP NEXT TIMELINE & PROJECT PULSE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* 1. UP NEXT - Chronological Timeline of Upcoming Work */}
          <div style={{
            backgroundColor: '#111726',
            borderRadius: '8px',
            border: '1px solid #1f2b42',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <Clock size={16} color="#818cf8" />
                <h3 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  UP NEXT
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Execution Timeline Today
                </span>
              </div>

              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#818cf8',
                backgroundColor: '#0c101a',
                border: '1px solid #1f2b42',
                padding: '2px 7px',
                borderRadius: '4px'
              }}>
                4 Blocks Scheduled
              </span>
            </div>

            {/* Timeline Stream with Connecting Vertical Rail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', position: 'relative' }}>
              {upNextTimeline.map((item, idx) => {
                const isActive = item.status === 'ACTIVE_NOW';
                return (
                  <div
                    key={item.id}
                    onClick={() => { playClickSound(); onNavigate?.('calendar'); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.95rem',
                      backgroundColor: isActive ? 'rgba(99, 102, 241, 0.08)' : '#161f33',
                      borderRadius: '6px',
                      border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid #222f47',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, flex: 1 }}>
                      {/* Time Block Stamp */}
                      <div style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: isActive ? '#818cf8' : '#94a3b8',
                        fontFamily: 'var(--font-mono)',
                        minWidth: '95px'
                      }}>
                        {item.timeRange}
                      </div>

                      {/* Status indicator dot */}
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isActive ? '#10b981' : '#6366f1',
                        flexShrink: 0,
                        boxShadow: isActive ? '0 0 8px #10b981' : 'none'
                      }} />

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          color: isActive ? '#f8fafc' : '#e2e8f0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '2px' }}>
                          <span>{item.project}</span>
                          {item.participants && (
                            <>
                              <span>·</span>
                              <span>with {item.participants.join(', ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#0c101a',
                        color: isActive ? '#818cf8' : '#94a3b8',
                        border: '1px solid #1f2b42'
                      }}>
                        {item.tag}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. PROJECT PULSE - Visual Project Health Indicators */}
          <div style={{
            backgroundColor: '#111726',
            borderRadius: '8px',
            border: '1px solid #1f2b42',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <Activity size={16} color="#10b981" />
                <h3 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  PROJECT PULSE
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Health based on progress, blockers & team activity
                </span>
              </div>

              <button
                onClick={() => onNavigate?.('kanban')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#818cf8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>View All</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Project Health Cards Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {projectPulseList.map((proj) => {
                const isAtRisk = proj.healthStatus === 'AT_RISK';
                return (
                  <div
                    key={proj.id}
                    onClick={() => { playClickSound(); onNavigate?.('kanban'); }}
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: '#161f33',
                      borderRadius: '6px',
                      border: isAtRisk ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid #222f47',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: proj.color }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>
                          {proj.name}
                        </span>
                      </div>

                      {/* Health Status Pill */}
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: isAtRisk ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: isAtRisk ? '#fcd34d' : '#86efac',
                        border: isAtRisk ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        {isAtRisk ? '▲ At Risk (1 Blocker)' : '● Healthy'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                      width: '100%',
                      height: '5px',
                      backgroundColor: '#0c101a',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      margin: '0.5rem 0'
                    }}>
                      <div style={{
                        width: `${proj.progress}%`,
                        height: '100%',
                        backgroundColor: isAtRisk ? '#f59e0b' : proj.color,
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>

                    {/* 4 Vital Dimensions Strip */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.7rem',
                      color: '#64748b',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      <span>{proj.completedCount}/{proj.totalCount} tasks ({proj.progress}%)</span>
                      <span>·</span>
                      <span style={{ color: isAtRisk ? '#f59e0b' : '#94a3b8' }}>{proj.deadlineStatus}</span>
                      <span>·</span>
                      <span>{proj.recentActivity}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ATTENTION REQUIRED + FLOW SCORE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* 3. ATTENTION REQUIRED: Critical Exceptions Engine */}
          <div style={{
            backgroundColor: '#111726',
            borderRadius: '8px',
            border: '1px solid #1f2b42',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <ShieldAlert size={16} color="#ef4444" />
                <h3 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  ATTENTION REQUIRED
                </h3>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#fca5a5',
                  padding: '1px 5px',
                  borderRadius: '3px'
                }}>
                  {attentionItems.length}
                </span>
              </div>

              {/* Exception Category Filters */}
              <div style={{ display: 'flex', backgroundColor: '#0c101a', padding: '2px', borderRadius: '4px', border: '1px solid #1f2b42' }}>
                {['ALL', 'BLOCKED', 'OVERDUE'].map((f) => (
                  <button
                    key={f}
                    onClick={() => { playClickSound(); setAttentionFilter(f); }}
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      borderRadius: '3px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: attentionFilter === f ? '#6366f1' : 'transparent',
                      color: attentionFilter === f ? '#ffffff' : '#64748b'
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Exceptions Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {filteredAttention.map((item) => {
                const isCritical = item.severity === 'CRITICAL';
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '0.75rem 0.85rem',
                      backgroundColor: '#161f33',
                      borderRadius: '6px',
                      border: isCritical ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid #222f47',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: item.type === 'BLOCKED' ? '#f87171' : item.type === 'OVERDUE' ? '#fb923c' : '#38bdf8'
                      }}>
                        {item.type}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        {item.timeDelta}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.3 }}>
                      {item.title}
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {item.reason}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        {item.project}
                      </span>

                      <button
                        onClick={() => handleResolveAttentionItem(item)}
                        style={{
                          background: '#0c101a',
                          border: '1px solid #1f2b42',
                          color: '#818cf8',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {item.actionLabel}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. FLOW SCORE: Tasteful Productivity Visualization */}
          <div style={{
            backgroundColor: '#111726',
            borderRadius: '8px',
            border: '1px solid #1f2b42',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <TrendingUp size={16} color="#38bdf8" />
                <h3 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  FLOW SCORE
                </h3>
              </div>

              <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>
                High Flow State
              </span>
            </div>

            {/* Composite Score Circle & Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.85rem 1rem',
              backgroundColor: '#0c101a',
              borderRadius: '6px',
              border: '1px solid #1f2b42'
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                border: '3px solid #6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  color: '#f8fafc',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {flowScoreData.score}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                  {flowScoreData.statusText}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  {flowScoreData.subText}
                </div>
              </div>
            </div>

            {/* 4 Core Scientific Breakdown Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {flowScoreData.metrics.map((m, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '3px' }}>
                    <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{m.label}</span>
                    <span style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{m.value}</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: '#0c101a',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${m.percent}%`,
                      height: '100%',
                      backgroundColor: m.tone,
                      borderRadius: '2px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Non-gamified subtle explanation */}
            <p style={{ fontSize: '0.68rem', color: '#64748b', margin: '4px 0 0', lineHeight: 1.4 }}>
              Flow Score aggregates time-on-task, completion ratio, and low friction context switching across current sprint.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
