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
    <>
      {/* Desktop Matrix View */}
      <div className="glass-panel desktop-only" style={{ overflowX: 'auto' }}>
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
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
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

      {/* Mobile Touch Card List */}
      <div className="mobile-only" style={{ flexDirection: 'column', gap: '0.85rem' }}>
        {tasks.map((task) => (
          <div key={task.id} className="glass-card animate-fade-in" style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                <Tag size={10} />
                {task.category || 'General'}
              </span>
              <span className={`badge badge-priority-${task.priority}`}>
                {task.priority}
              </span>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>{task.title}</h4>
              {task.description && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {task.description}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value)}
                className={`badge badge-status-${task.status}`}
                style={{ cursor: 'pointer', outline: 'none', border: 'none', padding: '0.35rem 0.65rem' }}
              >
                <option value="TODO" style={{ background: '#111827', color: '#fff' }}>TO DO</option>
                <option value="IN_PROGRESS" style={{ background: '#111827', color: '#fff' }}>IN PROGRESS</option>
                <option value="IN_REVIEW" style={{ background: '#111827', color: '#fff' }}>IN REVIEW</option>
                <option value="COMPLETED" style={{ background: '#111827', color: '#fff' }}>COMPLETED</option>
              </select>

              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button className="btn btn-secondary btn-icon" onClick={() => onEdit(task)} title="Edit" style={{ padding: '0.4rem' }}>
                  <Edit2 size={14} />
                </button>
                <button className="btn btn-secondary btn-icon" onClick={() => onDelete(task.id)} title="Delete" style={{ padding: '0.4rem', color: '#f43f5e' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={12} />
                <span>{task.assignee || 'Unassigned'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={12} />
                <span>{task.dueDate || 'No Date'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
