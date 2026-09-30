import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  User,
  Tag,
  CheckCircle2,
  Circle,
  Clock,
  MoreVertical,
  Paperclip,
  MessageSquare,
  GitBranch,
  Edit2,
  Trash2,
  AlertTriangle,
  ChevronRight,
  Plus
} from 'lucide-react';
import {
  playClickSound,
  playTaskCompleteSound
} from '../utils/audioEffects';

export default function TaskListView({
  tasks = [],
  projects = [],
  workspaceMembers = [],
  onStatusChange,
  onUpdateTask,
  onDeleteTask,
  onOpenDetail,
  onOpenCreate
}) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitleText, setEditingTitleText] = useState('');
  const editInputRef = useRef(null);

  // Keyboard navigation across tasks
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, tasks.length - 1));
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (tasks[focusedIndex]) {
          onOpenDetail?.(tasks[focusedIndex]);
        }
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        if (tasks[focusedIndex]) {
          startInlineEdit(tasks[focusedIndex]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tasks, focusedIndex, onOpenDetail]);

  const startInlineEdit = (task) => {
    setEditingTaskId(task.id);
    setEditingTitleText(task.title || '');
    setTimeout(() => editInputRef.current?.focus(), 30);
  };

  const commitInlineEdit = (task) => {
    if (editingTaskId === task.id) {
      if (editingTitleText.trim() && editingTitleText !== task.title) {
        onUpdateTask?.(task.id, { ...task, title: editingTitleText.trim() });
      }
      setEditingTaskId(null);
    }
  };

  const isOverdue = (dateStr, status) => {
    if (!dateStr || status === 'COMPLETED') return false;
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const priorityColors = {
    URGENT: { bg: 'rgba(239, 68, 68, 0.15)', text: '#fca5a5', border: 'rgba(239, 68, 68, 0.3)' },
    HIGH: { bg: 'rgba(249, 115, 22, 0.15)', text: '#fdba74', border: 'rgba(249, 115, 22, 0.3)' },
    MEDIUM: { bg: 'rgba(59, 130, 246, 0.15)', text: '#93c5fd', border: 'rgba(59, 130, 246, 0.3)' },
    LOW: { bg: 'rgba(100, 116, 139, 0.15)', text: '#cbd5e1', border: 'rgba(100, 116, 139, 0.3)' }
  };

  if (tasks.length === 0) {
    return (
      <div style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        backgroundColor: '#111726',
        borderRadius: '8px',
        border: '1px solid #1f2b42',
        color: '#64748b'
      }}>
        <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
          No tasks found matching your filter criteria.
        </p>
        <button
          onClick={() => onOpenCreate?.('TODO')}
          style={{
            padding: '0.45rem 0.85rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: '#6366f1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Create First Task
        </button>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#111726',
      borderRadius: '8px',
      border: '1px solid #1f2b42',
      overflowX: 'auto',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '880px' }}>
        <thead>
          <tr style={{
            borderBottom: '1px solid #1f2b42',
            backgroundColor: '#0c101a',
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#64748b'
          }}>
            <th style={{ padding: '0.75rem 1rem', width: '38px' }}>Status</th>
            <th style={{ padding: '0.75rem 1rem' }}>Task Deliverable</th>
            <th style={{ padding: '0.75rem 0.75rem' }}>Project</th>
            <th style={{ padding: '0.75rem 0.75rem' }}>Checklist</th>
            <th style={{ padding: '0.75rem 0.75rem' }}>Priority</th>
            <th style={{ padding: '0.75rem 0.75rem' }}>Assignee</th>
            <th style={{ padding: '0.75rem 0.75rem' }}>Due Date</th>
            <th style={{ padding: '0.75rem 0.75rem' }}>Runway</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => {
            const isFocused = focusedIndex === index;
            const project = projects.find((p) => String(p.id) === String(task.projectId)) || { name: 'Core Platform', colorCode: '#6366f1' };
            const subtasksList = Array.isArray(task.subtasks) ? task.subtasks : [];
            const completedSubCount = subtasksList.filter((s) => s.completed).length;
            const overdue = isOverdue(task.dueDate, task.status);
            const pStyle = priorityColors[task.priority] || priorityColors.MEDIUM;

            return (
              <tr
                key={task.id}
                onClick={() => {
                  setFocusedIndex(index);
                  onOpenDetail?.(task);
                }}
                style={{
                  borderBottom: '1px solid #1a2336',
                  backgroundColor: isFocused ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  transition: 'background-color 0.12s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isFocused) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                }}
                onMouseLeave={(e) => {
                  if (!isFocused) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* 1. Status Dropdown / Checkbox */}
                <td
                  style={{ padding: '0.65rem 1rem' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <select
                    value={task.status}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (next === 'COMPLETED') playTaskCompleteSound();
                      else playClickSound();
                      onStatusChange?.(task.id, next);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: task.status === 'COMPLETED' ? '#10b981' : task.status === 'IN_PROGRESS' ? '#38bdf8' : task.status === 'IN_REVIEW' ? '#f59e0b' : '#94a3b8',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="TODO" style={{ background: '#0c101a', color: '#f8fafc' }}>To Do</option>
                    <option value="IN_PROGRESS" style={{ background: '#0c101a', color: '#f8fafc' }}>In Progress</option>
                    <option value="IN_REVIEW" style={{ background: '#0c101a', color: '#f8fafc' }}>In Review</option>
                    <option value="COMPLETED" style={{ background: '#0c101a', color: '#f8fafc' }}>Completed</option>
                  </select>
                </td>

                {/* 2. Title with Inline Edit */}
                <td style={{ padding: '0.65rem 1rem', maxWidth: '340px' }}>
                  {editingTaskId === task.id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingTitleText}
                      onChange={(e) => setEditingTitleText(e.target.value)}
                      onBlur={() => commitInlineEdit(task)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitInlineEdit(task);
                        else if (e.key === 'Escape') setEditingTaskId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '100%',
                        padding: '3px 6px',
                        fontSize: '0.8rem',
                        backgroundColor: '#0c101a',
                        color: '#f8fafc',
                        border: '1px solid #6366f1',
                        borderRadius: '4px',
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        color: task.status === 'COMPLETED' ? '#64748b' : '#f8fafc',
                        textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem'
                      }}>
                        <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#818cf8', flexShrink: 0 }}>
                          #{task.id}
                        </span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.title}
                        </span>
                      </div>

                      {/* Tags & indicators */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {(task.tags || []).slice(0, 2).map((t) => (
                          <span
                            key={t}
                            style={{
                              fontSize: '0.62rem',
                              color: '#94a3b8',
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                              padding: '1px 5px',
                              borderRadius: '3px'
                            }}
                          >
                            #{t}
                          </span>
                        ))}
                        {Array.isArray(task.attachments) && task.attachments.length > 0 && (
                          <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Paperclip size={10} />
                            {task.attachments.length}
                          </span>
                        )}
                        {Array.isArray(task.comments) && task.comments.length > 0 && (
                          <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <MessageSquare size={10} />
                            {task.comments.length}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </td>

                {/* 3. Project Pill */}
                <td style={{ padding: '0.65rem 0.75rem', fontSize: '0.75rem' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: project.colorCode || '#818cf8',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    border: `1px solid ${project.colorCode ? `${project.colorCode}40` : '#1f2b42'}`,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap'
                  }}>
                    {project.name}
                  </span>
                </td>

                {/* 4. Subtasks Progress */}
                <td style={{ padding: '0.65rem 0.75rem' }}>
                  {subtasksList.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        {completedSubCount}/{subtasksList.length}
                      </span>
                      <div style={{ width: '40px', height: '4px', backgroundColor: '#1f2b42', borderRadius: '2px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${(completedSubCount / subtasksList.length) * 100}%`,
                            backgroundColor: completedSubCount === subtasksList.length ? '#10b981' : '#6366f1'
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.68rem', color: '#475569' }}>—</span>
                  )}
                </td>

                {/* 5. Priority Dropdown */}
                <td
                  style={{ padding: '0.65rem 0.75rem' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <select
                    value={task.priority}
                    onChange={(e) => {
                      playClickSound();
                      onUpdateTask?.(task.id, { ...task, priority: e.target.value });
                    }}
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: pStyle.bg,
                      color: pStyle.text,
                      border: `1px solid ${pStyle.border}`,
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="LOW" style={{ background: '#0c101a', color: '#f8fafc' }}>LOW</option>
                    <option value="MEDIUM" style={{ background: '#0c101a', color: '#f8fafc' }}>MEDIUM</option>
                    <option value="HIGH" style={{ background: '#0c101a', color: '#f8fafc' }}>HIGH</option>
                    <option value="URGENT" style={{ background: '#0c101a', color: '#f8fafc' }}>URGENT</option>
                  </select>
                </td>

                {/* 6. Assignee */}
                <td
                  style={{ padding: '0.65rem 0.75rem' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <select
                    value={task.assignee || ''}
                    onChange={(e) => {
                      playClickSound();
                      onUpdateTask?.(task.id, { ...task, assignee: e.target.value });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.75rem',
                      color: task.assignee ? '#cbd5e1' : '#64748b',
                      cursor: 'pointer',
                      outline: 'none',
                      fontWeight: 600
                    }}
                  >
                    <option value="" style={{ background: '#0c101a', color: '#64748b' }}>Unassigned</option>
                    <option value="Deepanshi Kaushal" style={{ background: '#0c101a', color: '#f8fafc' }}>Deepanshi Kaushal</option>
                    <option value="Sarah Chen" style={{ background: '#0c101a', color: '#f8fafc' }}>Sarah Chen</option>
                    <option value="Marcus Vance" style={{ background: '#0c101a', color: '#f8fafc' }}>Marcus Vance</option>
                    <option value="Alex Rivera" style={{ background: '#0c101a', color: '#f8fafc' }}>Alex Rivera</option>
                    <option value="Standard Member" style={{ background: '#0c101a', color: '#f8fafc' }}>Standard Member</option>
                  </select>
                </td>

                {/* 7. Due Date */}
                <td style={{ padding: '0.65rem 0.75rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.72rem',
                    color: overdue ? '#f87171' : '#94a3b8',
                    fontWeight: overdue ? 700 : 500
                  }}>
                    <Calendar size={12} color={overdue ? '#ef4444' : '#64748b'} />
                    <span>{task.dueDate ? task.dueDate.split('T')[0] : 'No date'}</span>
                  </div>
                </td>

                {/* 8. Runway / Estimated Time */}
                <td style={{ padding: '0.65rem 0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#818cf8', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {task.estimatedTime || '45m'}
                  </span>
                </td>

                {/* 9. Actions */}
                <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                    <button
                      onClick={() => startInlineEdit(task)}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '3px' }}
                      title="Edit Title (E)"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${task.title}"?`)) {
                          onDeleteTask?.(task.id);
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '3px' }}
                      title="Delete task"
                    >
                      <Trash2 size={13} />
                    </button>
                    <button
                      onClick={() => onOpenDetail?.(task)}
                      style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', padding: '3px' }}
                      title="Open details"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
