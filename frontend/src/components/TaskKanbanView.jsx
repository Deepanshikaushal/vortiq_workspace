import React, { useState } from 'react';
import {
  Calendar,
  User,
  Tag,
  CheckCircle2,
  Plus,
  Paperclip,
  MessageSquare,
  Clock,
  MoreVertical,
  X,
  AlertCircle
} from 'lucide-react';
import {
  playClickSound,
  playDropSound,
  playTaskCompleteSound
} from '../utils/audioEffects';

const COLUMNS = [
  { id: 'TODO', title: 'To Do', dot: '#94a3b8', bg: 'rgba(100, 116, 139, 0.08)', border: '#1f2b42', accent: '#94a3b8' },
  { id: 'IN_PROGRESS', title: 'In Progress', dot: '#38bdf8', bg: 'rgba(56, 189, 248, 0.08)', border: '#1f2b42', accent: '#38bdf8' },
  { id: 'IN_REVIEW', title: 'In Review', dot: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: '#1f2b42', accent: '#f59e0b' },
  { id: 'COMPLETED', title: 'Completed', dot: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: '#1f2b42', accent: '#10b981' }
];

export default function TaskKanbanView({
  tasks = [],
  projects = [],
  workspaceMembers = [],
  onStatusChange,
  onOpenDetail,
  onOpenCreate
}) {
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverColId, setDragOverColId] = useState(null);
  const [inlineCreateColId, setInlineCreateColId] = useState(null);
  const [inlineCreateTitle, setInlineCreateTitle] = useState('');

  // Drag and Drop Handlers
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', String(task.id));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(task.id);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverColId(null);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDragLeave = (e, colId) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverColId === colId) {
      setDragOverColId(null);
    }
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData('text/plain');
    const taskId = Number(idStr) || idStr;
    if (taskId && onStatusChange) {
      if (colId === 'COMPLETED') {
        playTaskCompleteSound();
      } else {
        playDropSound();
      }
      onStatusChange(taskId, colId);
    }
    setDraggingTaskId(null);
    setDragOverColId(null);
  };

  const handleInlineCreateSubmit = (e, colId) => {
    e.preventDefault();
    if (!inlineCreateTitle.trim()) return;
    playClickSound();
    onOpenCreate?.(colId, inlineCreateTitle.trim());
    setInlineCreateTitle('');
    setInlineCreateColId(null);
  };

  const isOverdue = (dateStr, status) => {
    if (!dateStr || status === 'COMPLETED') return false;
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const priorityStripe = {
    URGENT: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#3b82f6',
    LOW: '#64748b'
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '1rem',
      alignItems: 'start',
      width: '100%'
    }}>
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const isTarget = dragOverColId === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
            style={{
              backgroundColor: '#0c101a',
              borderRadius: '8px',
              border: isTarget ? `1px solid ${col.accent}` : '1px solid #1a2336',
              boxShadow: isTarget ? `0 0 16px ${col.accent}30` : 'none',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '480px',
              transition: 'border-color 0.15s, box-shadow 0.15s'
            }}
          >
            {/* Column Header */}
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #1a2336',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#111726',
              borderTopLeftRadius: '7px',
              borderTopRightRadius: '7px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: col.dot
                }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                  {col.title}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  color: '#94a3b8',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {colTasks.length}
                </span>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  setInlineCreateColId(inlineCreateColId === col.id ? null : col.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '3px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={`Add task to ${col.title}`}
              >
                <Plus size={15} />
              </button>
            </div>

            {/* Inline Quick Add Form */}
            {inlineCreateColId === col.id && (
              <form
                onSubmit={(e) => handleInlineCreateSubmit(e, col.id)}
                style={{ padding: '0.65rem 0.85rem', borderBottom: '1px solid #1a2336', backgroundColor: '#111726' }}
              >
                <input
                  type="text"
                  autoFocus
                  value={inlineCreateTitle}
                  onChange={(e) => setInlineCreateTitle(e.target.value)}
                  placeholder="Task title (Enter to save)..."
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.785rem',
                    backgroundColor: '#0c101a',
                    color: '#f8fafc',
                    border: '1px solid #6366f1',
                    borderRadius: '5px',
                    outline: 'none',
                    marginBottom: '0.45rem'
                  }}
                />
                <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setInlineCreateColId(null)}
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.7rem',
                      backgroundColor: 'transparent',
                      border: '1px solid #1f2b42',
                      color: '#94a3b8',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '3px 10px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: '#6366f1',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Add Card
                  </button>
                </div>
              </form>
            )}

            {/* Cards Container */}
            <div style={{
              padding: '0.65rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              flex: 1,
              overflowY: 'auto'
            }}>
              {colTasks.length === 0 ? (
                <div style={{
                  padding: '2.5rem 1rem',
                  textAlign: 'center',
                  color: '#475569',
                  fontSize: '0.72rem',
                  border: '1px dashed #1a2336',
                  borderRadius: '6px',
                  margin: '0.25rem 0'
                }}>
                  Drop tasks here
                </div>
              ) : (
                colTasks.map((task) => {
                  const isDragging = draggingTaskId === task.id;
                  const project = projects.find((p) => String(p.id) === String(task.projectId)) || { name: 'Core Platform', colorCode: '#6366f1' };
                  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
                  const completedSubs = subtasks.filter((s) => s.completed).length;
                  const overdue = isOverdue(task.dueDate, task.status);

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onOpenDetail?.(task)}
                      style={{
                        padding: '0.75rem 0.85rem',
                        backgroundColor: '#111726',
                        borderRadius: '6px',
                        border: '1px solid #1f2b42',
                        borderLeft: `3px solid ${priorityStripe[task.priority] || '#3b82f6'}`,
                        cursor: 'grab',
                        opacity: isDragging ? 0.35 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.55rem',
                        transition: 'transform 0.12s ease, border-color 0.12s ease',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2e3d5c';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#1f2b42';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      {/* Top Row: Project & Priority Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.45rem' }}>
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          color: project.colorCode || '#818cf8',
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          border: `1px solid ${project.colorCode ? `${project.colorCode}30` : '#1f2b42'}`,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          whiteSpace: 'nowrap'
                        }}>
                          {project.name}
                        </span>

                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: priorityStripe[task.priority] || '#94a3b8'
                        }}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <div style={{
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        color: task.status === 'COMPLETED' ? '#64748b' : '#f8fafc',
                        textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
                        lineHeight: 1.35
                      }}>
                        {task.title}
                      </div>

                      {/* Checklist Progress Bar */}
                      {subtasks.length > 0 && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b', marginBottom: '2px' }}>
                            <span>Subtasks</span>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>{completedSubs}/{subtasks.length}</span>
                          </div>
                          <div style={{ height: '3px', backgroundColor: '#0c101a', borderRadius: '2px', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${(completedSubs / subtasks.length) * 100}%`,
                                backgroundColor: completedSubs === subtasks.length ? '#10b981' : '#6366f1'
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Bottom Meta Footer */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '0.45rem',
                        borderTop: '1px solid #1a2336',
                        fontSize: '0.68rem',
                        color: '#64748b'
                      }}>
                        {/* Due Date & Runway */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          {task.dueDate && (
                            <span style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              color: overdue ? '#f87171' : '#94a3b8',
                              fontWeight: overdue ? 700 : 500
                            }}>
                              <Calendar size={11} color={overdue ? '#ef4444' : '#64748b'} />
                              <span>{task.dueDate.split('T')[0].slice(5)}</span>
                            </span>
                          )}

                          <span style={{ color: '#818cf8', fontFamily: 'var(--font-mono)' }}>
                            {task.estimatedTime || '45m'}
                          </span>
                        </div>

                        {/* Assignee / Indicators */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {Array.isArray(task.attachments) && task.attachments.length > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                              <Paperclip size={10} />
                              <span>{task.attachments.length}</span>
                            </span>
                          )}

                          {Array.isArray(task.comments) && task.comments.length > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
                              <MessageSquare size={10} />
                              <span>{task.comments.length}</span>
                            </span>
                          )}

                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(99, 102, 241, 0.25)',
                              color: '#c7d2fe',
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title={task.assignee || 'Unassigned'}
                          >
                            {(task.assignee || 'U').charAt(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
