import React from 'react';
import { Calendar, User, Tag, Edit2, Trash2, AlertTriangle, MessageSquare } from 'lucide-react';

export default function TaskTable({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  onReportInconvenience,
  workspaceMembers = []
}) {
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
            {tasks.map((task) => {
              const member = (workspaceMembers || []).find(m => m && (m.name === task.assignee || m.username === task.assignee));

              return (
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {member?.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={task.assignee}
                          style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #334155, #1e293b)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          color: '#f8fafc'
                        }}>
                          {(task.assignee || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
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
                      {onReportInconvenience && (
                        <button
                          className="btn btn-secondary btn-icon"
                          onClick={() => onReportInconvenience(task)}
                          title="Report Inconvenience on this Task"
                          style={{ color: '#f59e0b' }}
                        >
                          <AlertTriangle size={14} />
                        </button>
                      )}
                      <button className="btn btn-secondary btn-icon" onClick={() => onEdit(task)} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-secondary btn-icon" onClick={() => onDelete(task.id)} title="Delete" style={{ color: 'var(--danger)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card-List Matrix View */}
      <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
        {tasks.map((task) => (
          <div key={task.id} className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>{task.title}</div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {onReportInconvenience && (
                  <button
                    className="btn btn-secondary btn-icon"
                    onClick={() => onReportInconvenience(task)}
                    title="Report Inconvenience"
                    style={{ padding: '0.3rem', color: '#f59e0b' }}
                  >
                    <AlertTriangle size={13} />
                  </button>
                )}
                <button className="btn btn-secondary btn-icon" onClick={() => onEdit(task)} style={{ padding: '0.3rem' }}>
                  <Edit2 size={13} />
                </button>
                <button className="btn btn-secondary btn-icon" onClick={() => onDelete(task.id)} style={{ padding: '0.3rem', color: 'var(--danger)' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {task.description && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                {task.description}
              </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span className={`badge badge-status-${task.status}`}>{task.status}</span>
                <span className={`badge badge-priority-${task.priority}`}>{task.priority}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {task.assignee || 'Unassigned'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
