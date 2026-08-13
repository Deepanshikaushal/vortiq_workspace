import React from 'react';
import { Calendar, User, Tag, Edit2, Trash2 } from 'lucide-react';

export default function TaskTable({ tasks, onStatusChange, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '1rem', fontWeight: '600' }}>No tasks found matching your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
            <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Task</th>
            <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Category</th>
            <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
            <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Priority</th>
            <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assignee</th>
            <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Due Date</th>
            <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              style={{ borderBottom: '1px solid var(--border-color)', transition: 'background var(--transition-fast)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-glass-card)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {/* Title & Desc */}
              <td style={{ padding: '1rem 1.25rem', maxWidth: '320px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>{task.title}</div>
                {task.description && (
                  <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.description}
                  </div>
                )}
              </td>

              {/* Category */}
              <td style={{ padding: '1rem 1.25rem' }}>
                <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                  <Tag size={10} />
                  {task.category || 'General'}
                </span>
              </td>

              {/* Status Selector */}
              <td style={{ padding: '1rem 1.25rem' }}>
                <select
                  value={task.status}
                  onChange={(e) => onStatusChange(task.id, e.target.value)}
                  className={`badge badge-status-${task.status}`}
                  style={{ cursor: 'pointer', outline: 'none', border: 'none' }}
                >
                  <option value="TODO" style={{ background: '#111827', color: '#fff' }}>TO DO</option>
                  <option value="IN_PROGRESS" style={{ background: '#111827', color: '#fff' }}>IN PROGRESS</option>
                  <option value="IN_REVIEW" style={{ background: '#111827', color: '#fff' }}>IN REVIEW</option>
                  <option value="COMPLETED" style={{ background: '#111827', color: '#fff' }}>COMPLETED</option>
                </select>
              </td>

              {/* Priority */}
              <td style={{ padding: '1rem 1.25rem' }}>
                <span className={`badge badge-priority-${task.priority}`}>
                  {task.priority}
                </span>
              </td>

              {/* Assignee */}
              <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={13} />
                  <span>{task.assignee || 'Unassigned'}</span>
                </div>
              </td>

              {/* Due Date */}
              <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={13} />
                  <span>{task.dueDate || 'No Date'}</span>
                </div>
              </td>

              {/* Actions */}
              <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                  <button className="btn btn-secondary btn-icon" onClick={() => onEdit(task)} title="Edit">
                    <Edit2 size={14} />
                  </button>
                  <button className="btn btn-secondary btn-icon" onClick={() => onDelete(task.id)} title="Delete" style={{ color: '#f43f5e' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
