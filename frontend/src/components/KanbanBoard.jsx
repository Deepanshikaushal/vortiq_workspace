import React, { useState } from 'react';
import { Calendar, User, Tag, Edit2, Trash2, ArrowRight, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';

const COLUMNS = [
  { id: 'TODO', title: 'To Do', dot: '#e2a8b3', bg: 'rgba(226, 168, 179, 0.12)' },
  { id: 'IN_PROGRESS', title: 'In Progress', dot: '#ff859b', bg: 'rgba(225, 29, 72, 0.2)' },
  { id: 'IN_REVIEW', title: 'In Review', dot: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)' },
  { id: 'COMPLETED', title: 'Completed', dot: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' }
];

export default function KanbanBoard({ tasks, onStatusChange, onEdit, onDelete }) {
  const [activeMobileCol, setActiveMobileCol] = useState('ALL');

  const getCategoryClass = (cat) => {
    const known = ['Frontend', 'Backend', 'DevOps', 'Design', 'Database', 'Security', 'Mobile'];
    return known.includes(cat) ? `tag-category-${cat}` : 'tag-category-Default';
  };

  const visibleColumns = activeMobileCol === 'ALL'
    ? COLUMNS
    : COLUMNS.filter(col => col.id === activeMobileCol);

  return (
    <div>
      {/* Mobile Column Selector Bar */}
      <div className="mobile-only" style={{ overflowX: 'auto', paddingBottom: '0.85rem', marginBottom: '1rem', gap: '0.5rem', width: '100%', scrollbarWidth: 'none' }}>
        <button
          onClick={() => setActiveMobileCol('ALL')}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: '700',
            border: activeMobileCol === 'ALL' ? '1px solid #e11d48' : '1px solid var(--border-color)',
            background: activeMobileCol === 'ALL' ? 'rgba(225, 29, 72, 0.3)' : 'var(--bg-tertiary)',
            color: activeMobileCol === 'ALL' ? '#ff859b' : 'var(--text-muted)',
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
        {visibleColumns.map(col => {
        const columnTasks = tasks.filter(t => t.status === col.id);

        return (
          <div key={col.id} className="glass-panel" style={{ padding: '1.15rem', minHeight: '540px', display: 'flex', flexDirection: 'column' }}>
            
            {/* Column Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.85rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: col.dot, boxShadow: `0 0 14px ${col.dot}` }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: '800' }}>{col.title}</h3>
              </div>
              <span style={{
                background: col.bg,
                color: col.dot,
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '800',
                border: `1px solid ${col.dot}44`
              }}>
                {columnTasks.length}
              </span>
            </div>

            {/* Tasks Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
              {columnTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-dim)', fontSize: '0.8125rem', border: '1.5px dashed var(--border-color)', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.1)' }}>
                  No tasks in {col.title}
                </div>
              ) : (
                columnTasks.map(task => (
                  <div key={task.id} className="glass-card animate-fade-in" style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    
                    {/* Category Tag & Priority */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span className={`badge ${getCategoryClass(task.category)}`}>
                        <Tag size={10} />
                        {task.category || 'General'}
                      </span>
                      <span className={`badge badge-priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Task Title & Description */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <button
                          onClick={() => onStatusChange(task.id, task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED')}
                          title={task.status === 'COMPLETED' ? 'Mark incomplete' : 'Mark completed'}
                          style={{ background: 'transparent', border: 'none', color: task.status === 'COMPLETED' ? '#10b981' : 'var(--text-dim)', cursor: 'pointer', marginTop: '2px' }}
                        >
                          {task.status === 'COMPLETED' ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                        </button>
                        <h4 style={{ fontSize: '0.925rem', fontWeight: '700', color: task.status === 'COMPLETED' ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                          {task.title}
                        </h4>
                      </div>
                      
                      {task.description && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* User & Date Details */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                      {task.assignee ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--cyan), var(--violet))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontWeight: 'bold',
                            color: '#fff'
                          }}>
                            {task.assignee.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{task.assignee}</span>
                        </div>
                      ) : <span />}
                      
                      {task.dueDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={12} />
                          <span>{task.dueDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Toolbar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.2rem' }}>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {col.id !== 'TODO' && (
                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                            title="Move Previous"
                            onClick={() => {
                              const prev = col.id === 'IN_PROGRESS' ? 'TODO' : col.id === 'IN_REVIEW' ? 'IN_PROGRESS' : 'IN_REVIEW';
                              onStatusChange(task.id, prev);
                            }}
                          >
                            <ArrowLeft size={13} />
                          </button>
                        )}
                        {col.id !== 'COMPLETED' && (
                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                            title="Move Next"
                            onClick={() => {
                              const next = col.id === 'TODO' ? 'IN_PROGRESS' : col.id === 'IN_PROGRESS' ? 'IN_REVIEW' : 'COMPLETED';
                              onStatusChange(task.id, next);
                            }}
                          >
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          style={{ padding: '0.35rem' }}
                          title="Edit Task"
                          onClick={() => onEdit(task)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-icon"
                          style={{ padding: '0.35rem', color: '#f43f5e' }}
                          title="Delete Task"
                          onClick={() => onDelete(task.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        );
      })}
    </div>
    </div>
  );
}
