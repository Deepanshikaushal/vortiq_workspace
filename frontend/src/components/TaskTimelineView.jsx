import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  ArrowRight,
  Plus
} from 'lucide-react';
import { playClickSound } from '../utils/audioEffects';

export default function TaskTimelineView({
  tasks = [],
  projects = [],
  onOpenDetail,
  onUpdateTask,
  onOpenCreate
}) {
  const [timelineOffsetDays, setTimelineOffsetDays] = useState(0); // Pan timeline
  const [groupBy, setGroupBy] = useState('PROJECT'); // 'PROJECT' | 'STATUS'

  // Generate 18 days centered around today + offset
  const timelineDays = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = -3; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i + timelineOffsetDays);
      const isToday = i + timelineOffsetDays === 0;
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      days.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        dayNum: d.getDate(),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday,
        isWeekend
      });
    }
    return days;
  }, [timelineOffsetDays]);

  const startDate = timelineDays[0].date;
  const endDate = timelineDays[timelineDays.length - 1].date;

  // Group tasks
  const groupedTasks = useMemo(() => {
    if (groupBy === 'STATUS') {
      const statuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'];
      return statuses.map((st) => ({
        id: st,
        name: st.replace('_', ' '),
        color: st === 'COMPLETED' ? '#10b981' : st === 'IN_PROGRESS' ? '#38bdf8' : st === 'IN_REVIEW' ? '#f59e0b' : '#94a3b8',
        tasks: tasks.filter((t) => t.status === st)
      }));
    }

    // Default: Group by Project
    return projects.map((p) => ({
      id: String(p.id),
      name: p.name,
      color: p.colorCode || '#6366f1',
      tasks: tasks.filter((t) => String(t.projectId) === String(p.id))
    }));
  }, [groupBy, projects, tasks]);

  // Shift task date by delta days
  const handleShiftTaskDate = (e, task, deltaDays) => {
    e.stopPropagation();
    playClickSound();
    const currentDue = task.dueDate ? new Date(task.dueDate) : new Date();
    currentDue.setDate(currentDue.getDate() + deltaDays);
    const nextDueStr = currentDue.toISOString().split('T')[0];
    onUpdateTask?.(task.id, { ...task, dueDate: nextDueStr });
  };

  // Calculate position of a task bar
  const getTaskBarCoords = (task) => {
    const due = task.dueDate ? new Date(task.dueDate) : new Date();
    due.setHours(0, 0, 0, 0);

    // Assume 2-day duration for visualization runway
    const durationDays = task.estimatedTime?.includes('h') || task.estimatedTime?.includes('d') ? 3 : 2;
    const taskStart = new Date(due);
    taskStart.setDate(due.getDate() - durationDays + 1);

    const msPerDay = 24 * 60 * 60 * 1000;
    const startOffsetDays = (taskStart - startDate) / msPerDay;
    const endOffsetDays = (due - startDate) / msPerDay;

    const totalDays = timelineDays.length;
    const leftPercent = Math.max(0, Math.min(100, (startOffsetDays / totalDays) * 100));
    const widthPercent = Math.max(4.5, Math.min(100 - leftPercent, ((durationDays) / totalDays) * 100));

    return { leftPercent, widthPercent };
  };

  return (
    <div style={{
      backgroundColor: '#0e1422',
      borderRadius: '6px',
      border: '1px solid #1a2336',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Top Timeline Controls */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid #1a2336',
        backgroundColor: '#0c101a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Navigation & Today Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => { playClickSound(); setTimelineOffsetDays((prev) => prev - 7); }}
            style={{
              padding: '0 8px',
              height: '28px',
              fontSize: '0.75rem',
              backgroundColor: '#131b2e',
              border: '1px solid #1a2336',
              color: '#cbd5e1',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Previous Week"
          >
            <ChevronLeft size={13} />
          </button>

          <button
            onClick={() => { playClickSound(); setTimelineOffsetDays(0); }}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: timelineOffsetDays === 0 ? 'rgba(99, 102, 241, 0.15)' : '#111726',
              border: timelineOffsetDays === 0 ? '1px solid #6366f1' : '1px solid #1f2b42',
              color: timelineOffsetDays === 0 ? '#818cf8' : '#cbd5e1',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Today
          </button>

          <button
            onClick={() => { playClickSound(); setTimelineOffsetDays((prev) => prev + 7); }}
            style={{
              padding: '0.35rem 0.6rem',
              fontSize: '0.75rem',
              backgroundColor: '#111726',
              border: '1px solid #1f2b42',
              color: '#cbd5e1',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Next Week"
          >
            <ChevronRight size={14} />
          </button>

          <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.35rem', fontWeight: 600 }}>
            {timelineDays[0].monthName} {timelineDays[0].dayNum} — {timelineDays[timelineDays.length - 1].monthName} {timelineDays[timelineDays.length - 1].dayNum}
          </span>
        </div>

        {/* Group By Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Group By:
          </span>
          <div style={{
            display: 'flex',
            backgroundColor: '#111726',
            borderRadius: '5px',
            border: '1px solid #1f2b42',
            padding: '2px'
          }}>
            <button
              onClick={() => { playClickSound(); setGroupBy('PROJECT'); }}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: groupBy === 'PROJECT' ? '#6366f1' : 'transparent',
                color: groupBy === 'PROJECT' ? '#ffffff' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              Project
            </button>
            <button
              onClick={() => { playClickSound(); setGroupBy('STATUS'); }}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: groupBy === 'STATUS' ? '#6366f1' : 'transparent',
                color: groupBy === 'STATUS' ? '#ffffff' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              Status
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Grid Container */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <div style={{ minWidth: '920px' }}>
          
          {/* Calendar Header Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `220px repeat(${timelineDays.length}, 1fr)`,
            borderBottom: '1px solid #1a2336',
            backgroundColor: '#0e1422'
          }}>
            <div style={{ padding: '0.65rem 1rem', fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Deliverable / Group
            </div>

            {timelineDays.map((d) => (
              <div
                key={d.dateStr}
                style={{
                  padding: '0.55rem 0.25rem',
                  textAlign: 'center',
                  borderLeft: '1px solid #1a2336',
                  backgroundColor: d.isToday ? 'rgba(99, 102, 241, 0.12)' : d.isWeekend ? 'rgba(0, 0, 0, 0.2)' : 'transparent'
                }}
              >
                <div style={{ fontSize: '0.62rem', color: d.isToday ? '#818cf8' : '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  {d.dayName}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: d.isToday ? '#f8fafc' : '#cbd5e1',
                  marginTop: '1px'
                }}>
                  {d.dayNum}
                </div>
              </div>
            ))}
          </div>

          {/* Grouped Rows */}
          {groupedTasks.map((group) => (
            <div key={group.id} style={{ borderBottom: '1px solid #1a2336' }}>
              {/* Group Title Bar */}
              <div style={{
                padding: '0.55rem 1rem',
                backgroundColor: '#0c101a',
                borderBottom: '1px solid #151d2f',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#f8fafc'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: group.color }} />
                <span>{group.name}</span>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                  ({group.tasks.length} items)
                </span>
              </div>

              {/* Task Items inside this group */}
              {group.tasks.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.72rem', color: '#475569' }}>
                  No active tasks in this track.
                </div>
              ) : (
                group.tasks.map((task) => {
                  const { leftPercent, widthPercent } = getTaskBarCoords(task);
                  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
                  const compCount = subtasks.filter((s) => s.completed).length;
                  const percentDone = subtasks.length > 0 ? (compCount / subtasks.length) * 100 : task.status === 'COMPLETED' ? 100 : 0;

                  return (
                    <div
                      key={task.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `220px repeat(${timelineDays.length}, 1fr)`,
                        height: '42px',
                        borderBottom: '1px solid #161f31',
                        position: 'relative',
                        transition: 'background-color 0.12s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.015)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Left Header Column */}
                      <div
                        onClick={() => onOpenDetail?.(task)}
                        style={{
                          padding: '0 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.45rem',
                          borderRight: '1px solid #1a2336',
                          backgroundColor: '#111726',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                          <span style={{ color: '#818cf8', fontFamily: 'var(--font-mono)', marginRight: '4px' }}>
                            #{task.id}
                          </span>
                          {task.title}
                        </div>

                        {/* Shift buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleShiftTaskDate(e, task, -1)}
                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '1px' }}
                            title="Shift -1 day"
                          >
                            <ChevronLeft size={12} />
                          </button>
                          <button
                            onClick={(e) => handleShiftTaskDate(e, task, 1)}
                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '1px' }}
                            title="Shift +1 day"
                          >
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Timeline Day Grid Columns background */}
                      {timelineDays.map((d) => (
                        <div
                          key={d.dateStr}
                          style={{
                            borderLeft: '1px solid #161f31',
                            backgroundColor: d.isToday ? 'rgba(99, 102, 241, 0.04)' : d.isWeekend ? 'rgba(0, 0, 0, 0.15)' : 'transparent'
                          }}
                        />
                      ))}

                      {/* Interactive Floating Task Bar */}
                      <div
                        onClick={() => onOpenDetail?.(task)}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          bottom: '6px',
                          left: `calc(220px + (100% - 220px) * ${leftPercent / 100})`,
                          width: `calc((100% - 220px) * ${widthPercent / 100})`,
                          backgroundColor: task.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.25)',
                          border: `1px solid ${task.status === 'COMPLETED' ? '#10b981' : '#6366f1'}`,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 8px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                          transition: 'all 0.15s ease',
                          zIndex: 2
                        }}
                        title={`TASK-${task.id}: ${task.title} (Due: ${task.dueDate ? task.dueDate.split('T')[0] : 'N/A'})`}
                      >
                        {/* Progress Fill inside bar */}
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${percentDone}%`,
                            backgroundColor: task.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(99, 102, 241, 0.45)',
                            zIndex: 1
                          }}
                        />

                        {/* Text Content */}
                        <div style={{
                          position: 'relative',
                          zIndex: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#f8fafc',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }}>
                          {task.status === 'COMPLETED' && <CheckCircle2 size={12} color="#10b981" />}
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {task.title}
                          </span>
                          <span style={{ color: '#818cf8', fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}>
                            {task.estimatedTime || '45m'}
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
