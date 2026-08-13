import React, { useState, useEffect } from 'react';
import { X, Sparkles, Tag, Calendar, User, AlignLeft } from 'lucide-react';

const CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Design', 'Database', 'Security', 'Mobile'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function TaskModal({ isOpen, onClose, onSave, taskToEdit, projects, workspaceMembers = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    category: 'Frontend',
    assignee: '',
    assignedToId: '',
    dueDate: '',
    projectId: ''
  });

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        status: taskToEdit.status || 'TODO',
        priority: taskToEdit.priority || 'MEDIUM',
        category: taskToEdit.category || 'Frontend',
        assignee: taskToEdit.assignee || '',
        assignedToId: taskToEdit.assignedToId || '',
        dueDate: taskToEdit.dueDate || '',
        projectId: taskToEdit.projectId || (projects[0]?.id || '')
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        category: 'Frontend',
        assignee: '',
        assignedToId: '',
        dueDate: new Date().toISOString().split('T')[0],
        projectId: projects[0]?.id || ''
      });
    }
  }, [taskToEdit, projects, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '580px', padding: '1.85rem', position: 'relative' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: '800' }}>
                {taskToEdit ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {taskToEdit ? 'Update task details, status, or assignee' : 'Add a new task to your project workspace'}
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit}>
          
          {/* Task Title */}
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Build JWT Authentication REST Controller"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Provide context, acceptance criteria, or design notes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Priority Button Selector */}
          <div className="form-group">
            <label className="form-label">Priority</label>
            <div className="priority-btn-group">
              {PRIORITIES.map((p) => (
                <button
                  type="button"
                  key={p}
                  className={`priority-btn ${formData.priority === p ? `active-${p}` : ''}`}
                  onClick={() => setFormData({ ...formData, priority: p })}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Category Pills Selector */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setFormData({ ...formData, category: cat })}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.785rem',
                    fontWeight: '700',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    border: formData.category === cat ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    background: formData.category === cat ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--bg-tertiary)',
                    color: formData.category === cat ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Status Stage</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assignee (Workspace Member)</label>
              {workspaceMembers.length > 0 ? (
                <select
                  className="form-select"
                  value={formData.assignedToId}
                  onChange={(e) => {
                    const memberId = e.target.value;
                    const member = workspaceMembers.find(m => String(m.userId) === String(memberId));
                    setFormData({
                      ...formData,
                      assignedToId: memberId,
                      assignee: member ? (member.name || member.username) : formData.assignee
                    });
                  }}
                >
                  <option value="">Unassigned</option>
                  {workspaceMembers.map((m) => (
                    <option key={m.id || m.userId} value={m.userId}>
                      {m.name || m.username} ({m.email})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sarah Chen"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                />
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Project Workspace</label>
              <select
                className="form-select"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
