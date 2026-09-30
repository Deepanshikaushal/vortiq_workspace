import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag,
  Filter
} from 'lucide-react';

export default function CalendarView({ tasks = [], onOpenCreateTask, onOpenEditTask }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'agenda'
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Compute days in month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthDays - i,
        isCurrentMonth: false,
        dateStr: new Date(year, month - 1, prevMonthDays - i).toISOString().split('T')[0]
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        isCurrentMonth: true,
        dateStr: dStr,
        isToday: new Date().toISOString().split('T')[0] === dStr
      });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        dateStr: new Date(year, month + 1, i).toISOString().split('T')[0]
      });
    }

    return days;
  }, [currentDate]);

  // Tasks grouped by due date
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((task) => {
      if (filterPriority !== 'ALL' && task.priority !== filterPriority) return;
      const d = task.dueDate || new Date().toISOString().split('T')[0];
      if (!map[d]) map[d] = [];
      map[d].push(task);
    });
    return map;
  }, [tasks, filterPriority]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Calendar Header Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.9rem 1.25rem',
        backgroundColor: '#111726',
        borderRadius: '8px',
        border: '1px solid #1f2b42'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CalendarIcon size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              {currentMonthName}
            </h2>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
              Sprint roadmap, delivery milestones and task deadlines
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Month Steppers */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0e1422', borderRadius: '6px', border: '1px solid #1f2b42' }}>
            <button
              onClick={prevMonth}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                padding: '0.4rem 0.6rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              style={{
                background: 'none',
                border: 'none',
                color: '#e2e8f0',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.4rem 0.65rem',
                cursor: 'pointer'
              }}
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                padding: '0.4rem 0.6rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{
              backgroundColor: '#0e1422',
              color: '#e2e8f0',
              border: '1px solid #1f2b42',
              borderRadius: '6px',
              padding: '0.4rem 0.75rem',
              fontSize: '0.785rem',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent Only</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* View mode toggle */}
          <div style={{
            display: 'flex',
            backgroundColor: '#0e1422',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid #1f2b42'
          }}>
            <button
              onClick={() => setViewMode('month')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'month' ? '#6366f1' : 'transparent',
                color: viewMode === 'month' ? '#ffffff' : '#94a3b8'
              }}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'agenda' ? '#6366f1' : 'transparent',
                color: viewMode === 'agenda' ? '#ffffff' : '#94a3b8'
              }}
            >
              Agenda
            </button>
          </div>

          <button
            onClick={() => onOpenCreateTask?.()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.785rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={14} />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Month View Grid */}
      {viewMode === 'month' ? (
        <div style={{
          backgroundColor: '#111726',
          borderRadius: '8px',
          border: '1px solid #1f2b42',
          overflow: 'hidden'
        }}>
          {/* Day of Week Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: '1px solid #1f2b42',
            backgroundColor: '#0c121e'
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div
                key={d}
                style={{
                  padding: '0.65rem 0.5rem',
                  textAlign: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#64748b'
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days Cells */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1px',
            backgroundColor: '#1f2b42'
          }}>
            {calendarDays.map((cell, idx) => {
              const dayTasks = tasksByDate[cell.dateStr] || [];
              return (
                <div
                  key={idx}
                  style={{
                    minHeight: '110px',
                    padding: '0.5rem',
                    backgroundColor: cell.isToday
                      ? 'rgba(99, 102, 241, 0.06)'
                      : cell.isCurrentMonth
                      ? '#111726'
                      : '#0d131f',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: cell.isToday ? 800 : 600,
                      color: cell.isToday
                        ? '#818cf8'
                        : cell.isCurrentMonth
                        ? '#cbd5e1'
                        : '#475569',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: cell.isToday ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      border: cell.isToday ? '1px solid rgba(99, 102, 241, 0.4)' : 'none'
                    }}>
                      {cell.dayNumber}
                    </span>
                    {dayTasks.length > 0 && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: '#94a3b8',
                        backgroundColor: '#182236',
                        padding: '1px 5px',
                        borderRadius: '3px'
                      }}>
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto', maxHeight: '78px' }}>
                    {dayTasks.map((t) => {
                      const isCompleted = t.status === 'COMPLETED';
                      const isUrgent = t.priority === 'URGENT';
                      return (
                        <div
                          key={t.id}
                          onClick={() => onOpenEditTask?.(t)}
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '2px 5px',
                            borderRadius: '4px',
                            backgroundColor: isCompleted
                              ? 'rgba(16, 185, 129, 0.12)'
                              : isUrgent
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(99, 102, 241, 0.14)',
                            borderLeft: isCompleted
                              ? '2px solid #10b981'
                              : isUrgent
                              ? '2px solid #ef4444'
                              : '2px solid #6366f1',
                            color: isCompleted ? '#86efac' : isUrgent ? '#fca5a5' : '#c7d2fe',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            textDecoration: isCompleted ? 'line-through' : 'none'
                          }}
                          title={`${t.title} (${t.priority} - ${t.status})`}
                        >
                          {t.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda View */
        <div style={{
          backgroundColor: '#111726',
          borderRadius: '8px',
          border: '1px solid #1f2b42',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              No tasks scheduled in this period.
            </div>
          ) : (
            tasks.slice(0, 15).map((t) => (
              <div
                key={t.id}
                onClick={() => onOpenEditTask?.(t)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#161f33',
                  borderRadius: '6px',
                  border: '1px solid #222f47',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: t.status === 'COMPLETED' ? '#10b981' : t.priority === 'URGENT' ? '#ef4444' : '#6366f1'
                  }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>
                      {t.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                      <span>Due: {t.dueDate || 'Today'}</span>
                      <span>·</span>
                      <span>{t.category || 'General'}</span>
                      {t.assignee && (
                        <>
                          <span>·</span>
                          <span>Assignee: {t.assignee}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    backgroundColor: t.priority === 'URGENT' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                    color: t.priority === 'URGENT' ? '#fca5a5' : '#a5b4fc',
                    border: '1px solid rgba(99, 102, 241, 0.25)'
                  }}>
                    {t.priority}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    backgroundColor: '#111726',
                    color: '#94a3b8',
                    border: '1px solid #1f2b42'
                  }}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
