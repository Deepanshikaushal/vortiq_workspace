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
      {/* =========================================================================
          COMMAND CENTER HEADER & OPERATIONAL BAR
          ========================================================================= */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: '#0e1422',
        borderRadius: '6px',
        border: '1px solid #1a2336'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            backgroundColor: '#131b2e',
            border: '1px solid #1a2336',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Target size={17} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#f8fafc',
                margin: 0,
                letterSpacing: '-0.01em',
                fontFamily: 'var(--font-main)'
              }}>
                {timeGreeting}, {userName}
              </h1>
              <span style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#818cf8',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                padding: '1px 6px',
                borderRadius: '3px'
              }}>
                Command Center
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0' }}>
              Here's what needs your attention. <span style={{ color: '#cbd5e1' }}>4 priority items · Peak efficiency window</span>
            </p>
          </div>
        </div>

        {/* Real-time Status Telemetry Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#090d16',
              color: soundOn ? '#818cf8' : '#64748b',
              border: '1px solid #1a2336',
              height: '30px',
              padding: '0 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
            title={soundOn ? 'Mute audio feedback' : 'Enable audio feedback'}
          >
            {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span className="desktop-only">{soundOn ? 'Audio Live' : 'Muted'}</span>
          </button>

          {/* Embedded Flow Intelligence Trigger */}
          <button
            onClick={onOpenFlowIntelligence}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: '#090d16',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              height: '30px',
              padding: '0 10px',
              borderRadius: '4px',
              color: '#818cf8',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.12s ease'
            }}
            title="Open Flow Intelligence Panel (I)"
          >
            <Sparkles size={12} color="#818cf8" />
            <span>Flow Intelligence</span>
            <span style={{
              fontSize: '0.625rem',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              color: '#c7d2fe',
              padding: '1px 5px',
              borderRadius: '2px'
            }}>
              5
            </span>
          </button>

          {/* Quick Flow Pulse Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#090d16',
            height: '30px',
            padding: '0 10px',
            borderRadius: '4px',
            border: '1px solid #1a2336'
          }}>
            <Activity size={13} color="#10b981" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f1f5f9', fontFamily: 'var(--font-mono)' }}>
              Flow 88%
            </span>
          </div>

          <button
            onClick={() => onOpenCreateTask?.()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: '1px solid #4f46e5',
              borderRadius: '4px',
              height: '30px',
              padding: '0 12px',
              fontSize: '0.785rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <span>+ Quick Create</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          PRIORITY INTELLIGENCE: "FOCUS NOW"
          ========================================================================= */}
      <div style={{
        backgroundColor: '#0e1422',
        borderRadius: '6px',
        border: '1px solid #1f2b42',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Top Tag & Recommendation Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#818cf8',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              padding: '2px 7px',
              borderRadius: '3px'
            }}>
              <Zap size={12} />
              <span>FOCUS NOW · TOP RECOMMENDATION</span>
            </div>

            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '3px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.25)'
            }}>
              {focusNowTask.priority}
            </span>
          </div>

          {/* Active countdown pill if timer running */}
          {isFocusActive && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#090d16',
              border: '1px solid #10b981',
              padding: '2px 8px',
              borderRadius: '4px',
              color: '#86efac',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)'
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span>Active Focus: {formatTimer(focusTimeLeft)}</span>
            </div>
          )}
        </div>

        {/* Task Details Main Block */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h2 style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#f8fafc',
              margin: '0 0 6px',
              lineHeight: 1.35,
              letterSpacing: '-0.01em'
            }}>
              {focusNowTask.title}
            </h2>

            {/* Context Metadata Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '0.75rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: '#64748b' }}>Project:</span>
                <span style={{ color: '#f1f5f9', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: focusNowTask.projectColor }} />
                  {focusNowTask.project}
                </span>
              </div>

              <span>·</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} color="#f59e0b" />
                <span style={{ color: '#cbd5e1' }}>{focusNowTask.deadline}</span>
              </div>

              <span>·</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#64748b' }}>Estimated:</span>
                <span style={{ color: '#818cf8', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{focusNowTask.estimatedTime}</span>
              </div>
            </div>

            {/* Why It Matters Callout */}
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              backgroundColor: '#090d16',
              borderRadius: '4px',
              border: '1px solid #1a2336',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
              fontSize: '0.75rem',
              color: '#cbd5e1',
              lineHeight: 1.45
            }}>
              <Sparkles size={13} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span style={{ color: '#818cf8', fontWeight: 700 }}>Why it matters: </span>
                {focusNowTask.whyItMatters}
              </div>
            </div>
          </div>

          {/* Action Cockpit Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={toggleFocusSession}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: isFocusActive ? '#d97706' : '#6366f1',
                color: '#ffffff',
                border: `1px solid ${isFocusActive ? '#b45309' : '#4f46e5'}`,
                borderRadius: '4px',
                height: '32px',
                padding: '0 14px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {isFocusActive ? <Pause size={13} /> : <Play size={13} />}
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
                gap: '5px',
                backgroundColor: '#131b2e',
                color: '#e2e8f0',
                border: '1px solid #1a2336',
                borderRadius: '4px',
                height: '32px',
                padding: '0 12px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ExternalLink size={13} />
              <span>Open Task</span>
            </button>

            <button
              onClick={handleSnoozeFocus}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: '1px solid #1a2336',
                borderRadius: '4px',
                height: '32px',
                padding: '0 10px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
              title="Postpone recommendation"
            >
              <Clock size={13} />
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
        gap: '12px',
        alignItems: 'start'
      }} className="workspace-main-grid">

        {/* LEFT COLUMN: UP NEXT TIMELINE & PROJECT PULSE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* 1. UP NEXT - Chronological Timeline of Upcoming Work */}
          <div style={{
            backgroundColor: '#0e1422',
            borderRadius: '6px',
            border: '1px solid #1a2336',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} color="#818cf8" />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  UP NEXT
                </h3>
                <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                  Execution Timeline Today
                </span>
              </div>

              <span style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: '#818cf8',
                backgroundColor: '#090d16',
                border: '1px solid #1a2336',
                padding: '2px 6px',
                borderRadius: '3px'
              }}>
                4 Blocks Scheduled
              </span>
            </div>

            {/* Timeline Stream */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {upNextTimeline.map((item) => {
                const isActive = item.status === 'ACTIVE_NOW';
                return (
                  <div
                    key={item.id}
                    onClick={() => { playClickSound(); onNavigate?.('calendar'); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: isActive ? '#131b2e' : '#0c101a',
                      borderRadius: '4px',
                      border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid #1a2336',
                      cursor: 'pointer',
                      transition: 'border-color 0.12s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      {/* Time Block Stamp */}
                      <div style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: isActive ? '#818cf8' : '#94a3b8',
                        fontFamily: 'var(--font-mono)',
                        minWidth: '90px'
                      }}>
                        {item.timeRange}
                      </div>

                      {/* Status indicator dot (No glowing halo) */}
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isActive ? '#10b981' : '#6366f1',
                        flexShrink: 0
                      }} />

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: isActive ? '#f8fafc' : '#e2e8f0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1px' }}>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: '3px',
                        backgroundColor: '#090d16',
                        color: isActive ? '#818cf8' : '#94a3b8',
                        border: '1px solid #1a2336'
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
            backgroundColor: '#0e1422',
            borderRadius: '6px',
            border: '1px solid #1a2336',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} color="#10b981" />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  PROJECT PULSE
                </h3>
                <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                  Progress, blockers & team velocity
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
                  gap: '2px'
                }}
              >
                <span>View All</span>
                <ChevronRight size={12} />
              </button>
            </div>

            {/* Project Health Cards Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {projectPulseList.map((proj) => {
                const isAtRisk = proj.healthStatus === 'AT_RISK';
                return (
                  <div
                    key={proj.id}
                    onClick={() => { playClickSound(); onNavigate?.('kanban'); }}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#0c101a',
                      borderRadius: '4px',
                      border: isAtRisk ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #1a2336',
                      cursor: 'pointer',
                      transition: 'border-color 0.12s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: proj.color }} />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9' }}>
                          {proj.name}
                        </span>
                      </div>

                      {/* Health Status Pill */}
                      <span style={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '2px 5px',
                        borderRadius: '3px',
                        backgroundColor: isAtRisk ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                        color: isAtRisk ? '#fcd34d' : '#86efac',
                        border: isAtRisk ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)'
                      }}>
                        {isAtRisk ? '▲ At Risk (1 Blocker)' : '● Healthy'}
                      </span>
                    </div>

                    {/* Clean Progress Bar (No Glow) */}
                    <div style={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: '#131b2e',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      margin: '6px 0'
                    }}>
                      <div style={{
                        width: `${proj.progress}%`,
                        height: '100%',
                        backgroundColor: isAtRisk ? '#f59e0b' : proj.color,
                        borderRadius: '2px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>

                    {/* 4 Vital Dimensions Strip */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.6875rem',
                      color: '#64748b',
                      flexWrap: 'wrap',
                      gap: '4px'
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* 3. ATTENTION REQUIRED: Critical Exceptions Engine */}
          <div style={{
            backgroundColor: '#0e1422',
            borderRadius: '6px',
            border: '1px solid #1a2336',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={15} color="#ef4444" />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  ATTENTION REQUIRED
                </h3>
                <span style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  color: '#fca5a5',
                  padding: '1px 5px',
                  borderRadius: '3px'
                }}>
                  {attentionItems.length}
                </span>
              </div>

              {/* Exception Category Filters */}
              <div style={{ display: 'flex', backgroundColor: '#090d16', padding: '2px', borderRadius: '4px', border: '1px solid #1a2336' }}>
                {['ALL', 'BLOCKED', 'OVERDUE'].map((f) => (
                  <button
                    key={f}
                    onClick={() => { playClickSound(); setAttentionFilter(f); }}
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.625rem',
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filteredAttention.map((item) => {
                const isCritical = item.severity === 'CRITICAL';
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#0c101a',
                      borderRadius: '4px',
                      border: isCritical ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #1a2336',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <span style={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: item.type === 'BLOCKED' ? '#f87171' : item.type === 'OVERDUE' ? '#fb923c' : '#38bdf8'
                      }}>
                        {item.type}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                        {item.timeDelta}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.785rem', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.35 }}>
                      {item.title}
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {item.reason}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                        {item.project}
                      </span>

                      <button
                        onClick={() => handleResolveAttentionItem(item)}
                        style={{
                          background: '#131b2e',
                          border: '1px solid #1a2336',
                          color: '#818cf8',
                          borderRadius: '3px',
                          padding: '2px 7px',
                          fontSize: '0.6875rem',
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

          {/* 4. FLOW SCORE: Operational Productivity Index */}
          <div style={{
            backgroundColor: '#0e1422',
            borderRadius: '6px',
            border: '1px solid #1a2336',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={15} color="#38bdf8" />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  FLOW SCORE
                </h3>
              </div>

              <span style={{ fontSize: '0.6875rem', color: '#10b981', fontWeight: 700 }}>
                High Flow State
              </span>
            </div>

            {/* Composite Score Circle & Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              backgroundColor: '#090d16',
              borderRadius: '4px',
              border: '1px solid #1a2336'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '2px solid #6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#f8fafc',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {flowScoreData.score}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                  {flowScoreData.statusText}
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '1px' }}>
                  {flowScoreData.subText}
                </div>
              </div>
            </div>

            {/* 4 Core Breakdown Bars (Solid Flat Colors) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {flowScoreData.metrics.map((m, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', marginBottom: '2px' }}>
                    <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{m.label}</span>
                    <span style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{m.value}</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '3px',
                    backgroundColor: '#131b2e',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${m.percent}%`,
                      height: '100%',
                      backgroundColor: m.tone,
                      borderRadius: '2px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.6875rem', color: '#64748b', margin: '2px 0 0', lineHeight: 1.4 }}>
              Flow Score aggregates time-on-task, completion ratio, and low friction context switching across current sprint.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
