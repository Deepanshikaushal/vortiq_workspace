import React, { useState, useMemo } from 'react';
import {
  Folder,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  Zap,
  TrendingUp,
  Flame,
  GitBranch,
  FileText,
  FileCode,
  Download,
  Plus,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Layers,
  Activity,
  Play,
  Share2,
  Lock,
  Compass,
  ArrowUpRight,
  MoreVertical,
  GitFork
} from 'lucide-react';
import {
  playClickSound,
  playTaskCompleteSound,
  playFocusBellSound
} from '../utils/audioEffects';

export default function ProjectWorkspaceView({
  projectId,
  projects = [],
  tasks = [],
  workspaceMembers = [],
  currentUser,
  onOpenTaskDetail,
  onOpenCreateTask,
  onNavigateView,
  onAddToast,
  onStatusChange
}) {
  const [activeTab, setActiveTab] = useState('COMMAND_CENTER'); // 'COMMAND_CENTER' | 'TIMELINE' | 'DOCS' | 'TEAM'
  const [timelineFilter, setTimelineFilter] = useState('ALL');

  // Selected Project Object
  const project = useMemo(() => {
    return projects.find((p) => String(p.id) === String(projectId)) || projects[0] || {
      id: 1,
      name: 'Core Platform',
      description: 'Main enterprise web application & distributed services',
      colorCode: '#6366f1'
    };
  }, [projects, projectId]);

  // Tasks belonging to this project
  const projectTasks = useMemo(() => {
    return tasks.filter((t) => String(t.projectId) === String(project.id));
  }, [tasks, project.id]);

  // Metrics Calculations
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgressTasks = projectTasks.filter((t) => t.status === 'IN_PROGRESS');
  const inReviewTasks = projectTasks.filter((t) => t.status === 'IN_REVIEW');
  const todoTasks = projectTasks.filter((t) => t.status === 'TODO');
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 68;

  // Blocked tasks (tasks marked as blocked or with critical blockers)
  const blockedTasks = useMemo(() => {
    return projectTasks.filter(
      (t) =>
        t.priority === 'URGENT' ||
        (Array.isArray(t.dependencies) && t.dependencies.some((d) => d.type === 'BLOCKED_BY')) ||
        t.id === 5 ||
        t.id === 1
    ).slice(0, 3);
  }, [projectTasks]);

  // Project Milestones Data
  const milestones = [
    {
      id: 'ms-1',
      title: 'Milestone 1: Architectural Foundations & Database Auto-schema',
      deadline: 'Sep 28, 2026',
      status: 'COMPLETED',
      progress: 100,
      tasksCount: 4,
      lead: 'Sarah Chen'
    },
    {
      id: 'ms-2',
      title: 'Milestone 2: OAuth2 PKCE Token Handshake & Session Resilience',
      deadline: 'Oct 03, 2026',
      status: 'IN_PROGRESS',
      progress: 75,
      tasksCount: 6,
      lead: 'Deepanshi Kaushal'
    },
    {
      id: 'ms-3',
      title: 'Milestone 3: End-to-End Stress Benchmarks & Staging RC Cutover',
      deadline: 'Oct 08, 2026',
      status: 'UPCOMING',
      progress: 20,
      tasksCount: 5,
      lead: 'Marcus Vance'
    },
    {
      id: 'ms-4',
      title: 'Milestone 4: Production Blue-Green Cluster Deployment',
      deadline: 'Oct 15, 2026',
      status: 'UPCOMING',
      progress: 0,
      tasksCount: 7,
      lead: 'Marcus Vance'
    }
  ];

  // Project Documents Data
  const projectDocs = [
    {
      id: 'doc-1',
      title: 'Core Architecture & Service Topology Spec v2.4',
      type: 'PDF',
      size: '2.4 MB',
      updatedAt: 'Yesterday 18:20',
      author: 'Deepanshi Kaushal',
      badge: 'Architecture'
    },
    {
      id: 'doc-2',
      title: 'OAuth2 Token Handshake & Session Storage Guidelines',
      type: 'MD',
      size: '48 KB',
      updatedAt: '2 days ago',
      author: 'Sarah Chen',
      badge: 'Security'
    },
    {
      id: 'doc-3',
      title: 'OpenAPI 3.0 REST Specification & Swagger Contracts',
      type: 'JSON',
      size: '92 KB',
      updatedAt: 'Today 10:15',
      author: 'Alex Rivera',
      badge: 'API Contract'
    },
    {
      id: 'doc-4',
      title: 'HikariCP Connection Pool Benchmarks & Latency Profiling',
      type: 'PDF',
      size: '1.1 MB',
      updatedAt: 'Sep 27, 2026',
      author: 'Marcus Vance',
      badge: 'Performance'
    }
  ];

  // Team Workload Data
  const teamWorkload = [
    {
      id: 'tm-1',
      name: 'Deepanshi Kaushal',
      role: 'Engineering Lead & Owner',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140&auto=format&fit=crop&q=80',
      activeTasksCount: 3,
      runwayHours: '4.5h',
      capacityPercent: 82,
      status: 'ACTIVE_FOCUS',
      focusTask: 'Design Glassmorphic UI Components & Design Tokens'
    },
    {
      id: 'tm-2',
      name: 'Sarah Chen',
      role: 'Senior Product Architect',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=140&auto=format&fit=crop&q=80',
      activeTasksCount: 2,
      runwayHours: '3.0h',
      capacityPercent: 65,
      status: 'ON_TRACK',
      focusTask: 'Review PR #108: JWT Token Refresh Handshake'
    },
    {
      id: 'tm-3',
      name: 'Marcus Vance',
      role: 'Site Reliability Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=140&auto=format&fit=crop&q=80',
      activeTasksCount: 4,
      runwayHours: '6.5h',
      capacityPercent: 92,
      status: 'HIGH_LOAD',
      focusTask: 'Audit Backend API Latency & JVM Memory Caps'
    },
    {
      id: 'tm-4',
      name: 'Alex Rivera',
      role: 'UI/UX Systems Specialist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=140&auto=format&fit=crop&q=80',
      activeTasksCount: 2,
      runwayHours: '2.5h',
      capacityPercent: 55,
      status: 'AVAILABLE',
      focusTask: 'Mobile Feedback Survey Widget Haptics'
    }
  ];

  // Recent Live Activity Stream
  const recentActivities = [
    {
      id: 'act-1',
      user: 'Sarah Chen',
      action: "merged PR #114 (PostgreSQL Index Optimization · 6.8ms latency achieved)",
      time: '24 min ago',
      type: 'MERGE'
    },
    {
      id: 'act-2',
      user: 'Deepanshi Kaushal',
      action: "transitioned 'Design Glassmorphic UI Components' to IN PROGRESS",
      time: '1 hour ago',
      type: 'TASK'
    },
    {
      id: 'act-3',
      user: 'Flow Intelligence Engine',
      action: 'verified dependency path for OAuth2 token handshake (0 blocking conflicts)',
      time: '3 hours ago',
      type: 'AI'
    },
    {
      id: 'act-4',
      user: 'Marcus Vance',
      action: "uploaded 'docker-compose.prod.yml' and verified Temurin-21 Alpine container",
      time: '5 hours ago',
      type: 'DEPLOY'
    }
  ];

  const handleResolveBlocked = (task) => {
    playTaskCompleteSound();
    onStatusChange?.(task.id, 'IN_PROGRESS');
    onAddToast?.(`Unblocked deliverable: "${task.title}"`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', paddingBottom: '3rem' }}>
      
      {/* =========================================================================
          1. PROJECT HEADER
          ========================================================================= */}
      <div style={{
        backgroundColor: '#111726',
        borderRadius: '8px',
        border: '1px solid #1f2b42',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Crisp solid color indicator line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          backgroundColor: project.colorCode || '#6366f1'
        }} />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Project Title & Metadata */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: `1px solid ${project.colorCode ? `${project.colorCode}40` : '#1f2b42'}`,
              color: project.colorCode || '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Folder size={22} />
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
                  {project.name}
                </h1>

                {/* Status Badge */}
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#86efac',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  ON TRACK
                </span>
              </div>

              <p style={{ fontSize: '0.785rem', color: '#94a3b8', margin: '4px 0 0' }}>
                {project.description || 'Enterprise collaboration & high-velocity sprint deliverable track.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                playClickSound();
                onNavigateView?.('tasks');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#0c101a',
                border: '1px solid #1f2b42',
                color: '#cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <Layers size={13} />
              <span>Open Tasks View</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                onNavigateView?.('flow-map');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: '#131b2e',
                border: '1px solid #263552',
                color: '#a5b4fc',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="Open Flow Map dependency graph for this project"
            >
              <GitFork size={13} color="#818cf8" />
              <span>Flow Map</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                onOpenCreateTask?.('TODO');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#6366f1',
                border: 'none',
                color: '#ffffff',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)'
              }}
            >
              <Plus size={13} />
              <span>New Deliverable</span>
            </button>
          </div>
        </div>

        {/* Header Meta Strip: Owner, Team, Deadline, Progress */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid #1a2336',
          fontSize: '0.75rem'
        }}>
          {/* Owner */}
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Project Owner
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '4px' }}>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140&auto=format&fit=crop&q=80"
                alt="Owner"
                style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontWeight: 700, color: '#f8fafc' }}>Deepanshi Kaushal</span>
            </div>
          </div>

          {/* Team Avatars */}
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Assigned Team
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              {teamWorkload.map((m) => (
                <img
                  key={m.id}
                  src={m.avatar}
                  alt={m.name}
                  title={`${m.name} (${m.role})`}
                  style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #1f2b42' }}
                />
              ))}
              <span style={{ fontSize: '0.68rem', color: '#64748b', marginLeft: '4px' }}>4 contributors</span>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Target Milestone Cutoff
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '4px', color: '#f8fafc', fontWeight: 700 }}>
              <Calendar size={13} color="#818cf8" />
              <span>Oct 15, 2026</span>
              <span style={{ fontSize: '0.68rem', color: '#818cf8', fontWeight: 600 }}>(15 days remaining)</span>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              <span>Sprint Progress</span>
              <span style={{ color: '#86efac', fontFamily: 'var(--font-mono)' }}>{progressPercent}%</span>
            </div>
            <div style={{ height: '4px', backgroundColor: '#090d16', borderRadius: '2px', overflow: 'hidden', marginTop: '6px', border: '1px solid #1a2336' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  backgroundColor: '#10b981',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. PROJECT HEALTH (Three Dimensions: TIME, WORK, RISK)
          ========================================================================= */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8' }}>
            Project Health Telemetry
          </span>
          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
            Continuous real-time synthesis
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          
          {/* Dimension 1: TIME (Are we on schedule?) */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: '#0e1422',
            borderRadius: '6px',
            border: '1px solid #1a2336',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="#38bdf8" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>TIME DIMENSION</span>
              </div>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '1px 6px', borderRadius: '3px' }}>
                ON SCHEDULE
              </span>
            </div>

            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              4 Days Left in Sprint
            </div>

            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
              Current team review velocity is <strong style={{ color: '#f8fafc' }}>1.1x baseline pace</strong>. 92% statistical confidence of landing Oct 15 cutoff without crunch.
            </p>

            <div style={{ fontSize: '0.6875rem', color: '#64748b', borderTop: '1px solid #141c2c', paddingTop: '6px', marginTop: '2px' }}>
              Trajectory: Staging deployment window locked for Oct 03 18:00 UTC
            </div>
          </div>

          {/* Dimension 2: WORK (How much work is completed?) */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: '#0e1422',
            borderRadius: '6px',
            border: '1px solid #1a2336',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>WORK DIMENSION</span>
              </div>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '1px 6px', borderRadius: '3px' }}>
                64% RESOLVED
              </span>
            </div>

            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              14 of 22 Deliverables Landed
            </div>

            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
              <strong style={{ color: '#f8fafc' }}>18.5 hours</strong> of estimated runway remaining. Active breakdown: 3 in progress, 1 in review, 4 in backlog.
            </p>

            <div style={{ fontSize: '0.6875rem', color: '#64748b', borderTop: '1px solid #141c2c', paddingTop: '6px', marginTop: '2px' }}>
              Velocity: +12% sprint throughput compared to prior cycle
            </div>
          </div>

          {/* Dimension 3: RISK (What could delay the project?) */}
          <div style={{
            padding: '12px 14px',
            backgroundColor: '#0e1422',
            borderRadius: '6px',
            border: '1px solid #1a2336',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} color="#f59e0b" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>RISK DIMENSION</span>
              </div>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#fcd34d', backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '1px 6px', borderRadius: '3px' }}>
                1 ACTIVE BLOCKER
              </span>
            </div>

            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              DB Connection Saturation
            </div>

            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
              Staging stress test identified potential HikariCP connection starvation during burst sync. Mitigation assigned to Marcus Vance.
            </p>

            <div style={{ fontSize: '0.6875rem', color: '#64748b', borderTop: '1px solid #141c2c', paddingTop: '6px', marginTop: '2px' }}>
              Downstream exposure: 1 task waiting on connection pool PR sign-off
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          3. OPERATIONAL SPLIT: CURRENT FOCUS + BLOCKED DELIVERABLES
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
        
        {/* CURRENT FOCUS (What the team is working on right now) */}
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
              <Zap size={14} color="#818cf8" />
              <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#f8fafc' }}>
                CURRENT FOCUS
              </span>
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#10b981', fontWeight: 600 }}>
              ● Live Engineering
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {inProgressTasks.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                No active in-progress items. Promote items from backlog.
              </div>
            ) : (
              inProgressTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onOpenTaskDetail?.(t)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#0c101a',
                    borderRadius: '4px',
                    border: '1px solid #1a2336',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'border-color 0.12s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1a2336')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.785rem', fontWeight: 600, color: '#f8fafc' }}>
                      TASK-{t.id}: {t.title}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: '#818cf8', fontFamily: 'var(--font-mono)' }}>
                      {t.estimatedTime || '45m'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748b' }}>
                    <span>Assignee: {t.assignee || 'Alex Rivera'}</span>
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>In Review Window</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BLOCKED (Tasks preventing progress) */}
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
              <AlertTriangle size={14} color="#ef4444" />
              <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#f8fafc' }}>
                BLOCKED DELIVERABLES
              </span>
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#fca5a5', fontWeight: 600 }}>
              Needs Intervention
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {blockedTasks.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#0c101a',
                  borderRadius: '4px',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.785rem', fontWeight: 600, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    TASK-{t.id}: {t.title}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#fca5a5', marginTop: '1px' }}>
                    Blocked by PR #108 approval & schema lock
                  </div>
                </div>

                <button
                  onClick={() => handleResolveBlocked(t)}
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#86efac',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* =========================================================================
          4. PROJECT TIMELINE & MILESTONES (Interactive roadmap)
          ========================================================================= */}
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
          <div>
            <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#f8fafc' }}>
              PROJECT TIMELINE & MILESTONES
            </span>
            <p style={{ fontSize: '0.6875rem', color: '#64748b', margin: '1px 0 0' }}>
              Sequential release candidate progression and dependency trajectory.
            </p>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onNavigateView?.('timeline');
            }}
            style={{
              padding: '2px 8px',
              fontSize: '0.72rem',
              fontWeight: 600,
              backgroundColor: '#0c101a',
              border: '1px solid #1a2336',
              color: '#818cf8',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Full Gantt Matrix
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {milestones.map((ms, idx) => (
            <div
              key={ms.id}
              style={{
                padding: '8px 12px',
                backgroundColor: '#0c101a',
                borderRadius: '4px',
                border: '1px solid #1a2336',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
                <span style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: ms.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : ms.status === 'IN_PROGRESS' ? 'rgba(56, 189, 248, 0.15)' : '#161f31',
                  color: ms.status === 'COMPLETED' ? '#10b981' : ms.status === 'IN_PROGRESS' ? '#38bdf8' : '#64748b',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {idx + 1}
                </span>

                <div>
                  <div style={{ fontSize: '0.785rem', fontWeight: 600, color: '#f8fafc' }}>
                    {ms.title}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '1px' }}>
                    Lead: {ms.lead} · Due: {ms.deadline} · {ms.tasksCount} deliverables
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: '#64748b', marginBottom: '2px' }}>
                  <span>{ms.status.replace('_', ' ')}</span>
                  <span style={{ fontWeight: 600, color: ms.progress === 100 ? '#10b981' : '#cbd5e1', fontFamily: 'var(--font-mono)' }}>{ms.progress}%</span>
                </div>
                <div style={{ height: '3px', backgroundColor: '#161f31', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${ms.progress}%`,
                      backgroundColor: ms.progress === 100 ? '#10b981' : '#6366f1'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          5. LOWER SECTION: TEAM WORKLOAD + PROJECT DOCUMENTS + LIVE ACTIVITY
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
        
        {/* TEAM & WORKLOAD */}
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
              <Users size={14} color="#818cf8" />
              <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#f8fafc' }}>
                TEAM ALLOCATION & WORKLOAD
              </span>
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
              Balanced
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {teamWorkload.map((member) => (
              <div
                key={member.id}
                style={{
                  padding: '8px 10px',
                  backgroundColor: '#0c101a',
                  borderRadius: '4px',
                  border: '1px solid #1a2336',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img
                      src={member.avatar}
                      alt={member.name}
                      style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>{member.name}</div>
                      <div style={{ fontSize: '0.625rem', color: '#64748b' }}>{member.role}</div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    padding: '1px 5px',
                    borderRadius: '3px',
                    backgroundColor: member.capacityPercent > 90 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                    color: member.capacityPercent > 90 ? '#fca5a5' : '#818cf8'
                  }}>
                    {member.capacityPercent}% capacity
                  </span>
                </div>

                <div style={{ fontSize: '0.6875rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{member.activeTasksCount} active tasks · {member.runwayHours} runway</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PROJECT DOCUMENTS */}
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
              <FileText size={14} color="#818cf8" />
              <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#f8fafc' }}>
                PROJECT DOCUMENTS & SPECS
              </span>
            </div>
            <button
              onClick={() => onAddToast?.('Document uploader launched', 'info')}
              style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '0.6875rem', fontWeight: 600 }}
            >
              + Add Doc
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {projectDocs.map((doc) => (
              <div
                key={doc.id}
                style={{
                  padding: '8px 10px',
                  backgroundColor: '#0c101a',
                  borderRadius: '4px',
                  border: '1px solid #1a2336',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    color: '#818cf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.625rem',
                    fontWeight: 700
                  }}>
                    {doc.type}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>{doc.title}</div>
                    <div style={{ fontSize: '0.625rem', color: '#64748b' }}>
                      {doc.size} · Updated {doc.updatedAt}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onAddToast?.(`Downloading "${doc.title}"`, 'info')}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '3px' }}
                  title="Download document"
                >
                  <Download size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* LIVE RECENT ACTIVITY */}
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
              <Activity size={14} color="#818cf8" />
              <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#f8fafc' }}>
                LIVE RECENT ACTIVITY
              </span>
            </div>
            <span style={{ fontSize: '0.625rem', color: '#10b981' }}>
              Sync active
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentActivities.map((act) => (
              <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.72rem' }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: act.type === 'MERGE' ? '#10b981' : act.type === 'AI' ? '#818cf8' : '#38bdf8',
                  marginTop: '5px',
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{act.user} </span>
                  <span style={{ color: '#cbd5e1' }}>{act.action}</span>
                  <div style={{ fontSize: '0.625rem', color: '#64748b', marginTop: '1px' }}>{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
