import React, { useState } from 'react';
import { Calendar, User, Tag, Edit2, Trash2, ArrowRight, ArrowLeft, CheckCircle2, Circle, Plus, AlertTriangle, GripVertical } from 'lucide-react';

const COLUMNS = [
  { id: 'TODO', title: 'To Do', dot: '#94a3b8', bg: 'rgba(100, 116, 139, 0.12)', borderHover: '#94a3b8' },
  { id: 'IN_PROGRESS', title: 'In Progress', dot: '#93c5fd', bg: 'rgba(99, 102, 241, 0.12)', borderHover: '#6366f1' },
  { id: 'IN_REVIEW', title: 'In Review', dot: '#fcd34d', bg: 'rgba(245, 158, 11, 0.12)', borderHover: '#f59e0b' },
  { id: 'COMPLETED', title: 'Completed', dot: '#86efac', bg: 'rgba(16, 185, 129, 0.12)', borderHover: '#10b981' }
];

export default function KanbanBoard({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  onOpenCreate,
  onReportInconvenience,
  workspaceMembers = []
}) {
  const [activeMobileCol, setActiveMobileCol] = useState('ALL');
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const getCategoryClass = (cat) => {
    const known = ['Frontend', 'Backend', 'DevOps', 'Design', 'Database', 'Security', 'Mobile'];
    return known.includes(cat) ? `tag-category-${cat}` : 'tag-category-Default';
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'URGENT': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#3b82f6';
      case 'LOW': return '#64748b';
      default: return '#64748b';
    }
  };

  const isOverdue = (dateStr, status) => {
    if (!dateStr || status === 'COMPLETED') return false;
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', String(taskId));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (e, colId) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverCol === colId) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData('text/plain');
    const taskId = Number(idStr) || idStr;
    if (taskId && onStatusChange) {
      onStatusChange(taskId, colId);
    }
    setDraggingTaskId(null);
    setDragOverCol(null);
  };

  const visibleColumns = activeMobileCol === 'ALL'
    ? COLUMNS
    : COLUMNS.filter(col => col.id === activeMobileCol);

  return (
    <div style={{ width: '100%' }}>
      {/* Mobile Column Selector Bar */}
      <div className="mobile-only" style={{ overflowX: 'auto', paddingBottom: '0.85rem', marginBottom: '1rem', gap: '0.5rem', width: '100%', scrollbarWidth: 'none' }}>
        <button
          onClick={() => setActiveMobileCol('ALL')}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: '700',
            border: activeMobileCol === 'ALL' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
            background: activeMobileCol === 'ALL' ? 'var(--primary)' : 'var(--bg-tertiary)',
            color: activeMobileCol === 'ALL' ? '#f8fafc' : 'var(--text-muted)',
            whiteSpace: 'nowrap',
            cursor: 'pointer'
          }}
        >
          All Stages ({tasks.length})
        </button>

        {COLUMNS.map((col) => {
          const count = tasks.filter(t => t.status === col.id).length;
          const isActive = activeMobileCol === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setActiveMobileCol(col.id)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '700',
                border: isActive ? `1px solid ${col.dot}` : '1px solid var(--border-color)',
                background: isActive ? col.bg : 'var(--bg-tertiary)',
                color: isActive ? col.dot : 'var(--text-muted)',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {col.title} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Kanban Columns Grid */}
      <div className="kanban-grid-fullscreen">
        {visibleColumns.map(col => {
          const columnTasks = tasks.filter(t => t.status === col.id);
          const isTarget = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              className={`glass-panel kanban-column-container ${isTarget ? 'kanban-column-drop-active' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{
                padding: '1rem',
                minHeight: '480px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '12px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                border: isTarget
                  ? `2px dashed ${col.borderHover}`
                  : '1px solid var(--border-color)',
                background: isTarget
                  ? `linear-gradient(180deg, ${col.bg} 0%, rgba(15, 23, 42, 0.7) 100%)`
                  : undefined,
                boxShadow: isTarget ? `0 0 20px ${col.borderHover}33` : undefined
              }}
            >
              
              {/* Column Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.85rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: col.dot, boxShadow: `0 0 10px ${col.dot}` }} />
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.98rem', fontWeight: '800', letterSpacing: '-0.01em' }}>{col.title}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    background: col.bg,
                    color: col.dot,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    border: `1px solid ${col.dot}33`
                  }}>
                    {columnTasks.length}
                  </span>
                  {onOpenCreate && (
                    <button
                      className="btn btn-secondary btn-icon"
                      style={{ padding: '0.25rem', width: '26px', height: '26px', borderRadius: '6px' }}
                      title={`Add task to ${col.title}`}
                      onClick={() => onOpenCreate(col.id)}
                    >
                      <Plus size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Tasks Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                {columnTasks.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '3rem 1rem',
                      color: isTarget ? col.dot : 'var(--text-dim)',
                      fontSize: '0.8125rem',
                      fontWeight: isTarget ? 700 : 500,
                      border: '1.5px dashed var(--border-color)',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isTarget ? `Drop card here to move to ${col.title}` : `No tasks in ${col.title}`}
                  </div>
                ) : (
                  columnTasks.map(task => {
                    const isDragging = draggingTaskId === task.id;
                    const overdue = isOverdue(task.dueDate, task.status);

                    return (
                      <div
                        key={task.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className="glass-card animate-fade-in"
                        style={{
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.65rem',
                          borderRadius: '10px',
                          cursor: 'grab',
                          borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
                          opacity: isDragging ? 0.35 : 1,
                          transform: isDragging ? 'scale(0.97)' : 'none',
                          boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.5)' : undefined,
                          transition: 'transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease'
                        }}
                      >
                        
                        {/* Category Tag, Priority & Drag Handle */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <span className={`badge ${getCategoryClass(task.category)}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                            <Tag size={10} />
                            {task.category || 'General'}
                          </span>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span className={`badge badge-priority-${task.priority}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                              {task.priority}
                            </span>
                            <span style={{ color: 'var(--text-dim)', opacity: 0.5 }} title="Drag card to move">
                              <GripVertical size={13} />
                            </span>
                          </div>
                        </div>

                        {/* Task Title & Description */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <button
                              onClick={() => onStatusChange(task.id, task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED')}
                              title={task.status === 'COMPLETED' ? 'Mark incomplete' : 'Mark completed'}
                              style={{ background: 'transparent', border: 'none', color: task.status === 'COMPLETED' ? '#10b981' : 'var(--text-dim)', cursor: 'pointer', marginTop: '2px', padding: 0 }}
                            >
                              {task.status === 'COMPLETED' ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                            </button>
                            <h4 style={{ fontSize: '0.885rem', fontWeight: '700', color: task.status === 'COMPLETED' ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none', lineHeight: 1.35 }}>
                              {task.title}
                            </h4>
                          </div>
                          
                          {task.description && (
                            <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: '-webkit-box', WebKitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Assignee & Due Date */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', paddingTop: '0.45rem', borderTop: '1px solid var(--border-color)' }}>
                          {task.assignee ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              {(workspaceMembers || []).find(m => m && (m.name === task.assignee || m.username === task.assignee))?.avatarUrl ? (
                                <img
                                  src={(workspaceMembers || []).find(m => m && (m.name === task.assignee || m.username === task.assignee)).avatarUrl}
                                  alt={task.assignee}
                                  style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #334155, #1e293b)',
                                  border: '1px solid var(--border-color)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.62rem',
                                  fontWeight: 'bold',
                                  color: '#f8fafc'
                                }}>
                                  {(task.assignee || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.78rem' }}>{task.assignee}</span>
                            </div>
                          ) : <span />}
                          
                          {task.dueDate && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.72rem',
                              color: overdue ? '#ef4444' : 'var(--text-muted)',
                              fontWeight: overdue ? 700 : 500
                            }}>
                              <Calendar size={12} />
                              <span>{task.dueDate}</span>
                              {overdue && <span style={{ fontSize: '0.65rem', background: 'rgba(239, 68, 68, 0.2)', padding: '0.05rem 0.25rem', borderRadius: '4px' }}>Overdue</span>}
                            </div>
                          )}
                        </div>

                        {/* Card Actions Footer */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.15rem' }}>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {col.id !== 'TODO' && (
                              <button
                                className="btn btn-secondary btn-icon"
                                style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem', borderRadius: '5px' }}
                                title="Move Previous Column"
                                onClick={() => {
                                  const prev = col.id === 'IN_PROGRESS' ? 'TODO' : col.id === 'IN_REVIEW' ? 'IN_PROGRESS' : 'IN_REVIEW';
                                  onStatusChange(task.id, prev);
                                }}
                              >
                                <ArrowLeft size={12} />
                              </button>
                            )}
                            {col.id !== 'COMPLETED' && (
                              <button
                                className="btn btn-secondary btn-icon"
                                style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem', borderRadius: '5px' }}
                                title="Move Next Column"
                                onClick={() => {
                                  const next = col.id === 'TODO' ? 'IN_PROGRESS' : col.id === 'IN_PROGRESS' ? 'IN_REVIEW' : 'COMPLETED';
                                  onStatusChange(task.id, next);
                                }}
                              >
                                <ArrowRight size={12} />
                              </button>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                            {onReportInconvenience && (
                              <button
                                className="btn btn-secondary btn-icon"
                                style={{ padding: '0.28rem', color: '#f59e0b', borderRadius: '5px' }}
                                title="Report Blocker / Task Chat"
                                onClick={() => onReportInconvenience(task)}
                              >
                                <AlertTriangle size={12} />
                              </button>
                            )}
                            <button
                              className="btn btn-secondary btn-icon"
                              style={{ padding: '0.28rem', borderRadius: '5px' }}
                              title="Edit Task"
                              onClick={() => onEdit(task)}
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              className="btn btn-secondary btn-icon"
                              style={{ padding: '0.28rem', color: 'var(--danger)', borderRadius: '5px' }}
                              title="Delete Task"
                              onClick={() => onDelete(task.id)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Add Button at bottom of column */}
              {onOpenCreate && (
                <button
                  className="kanban-quick-add-btn"
                  onClick={() => onOpenCreate(col.id)}
                  style={{ marginTop: '0.75rem', borderRadius: '8px' }}
                >
                  <Plus size={13} />
                  <span>Add Task</span>
                </button>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
