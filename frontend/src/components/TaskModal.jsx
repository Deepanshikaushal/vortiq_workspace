import React, { useState, useEffect } from 'react';
import { X, Sparkles, Tag, Calendar, User, AlignLeft, Plus, Check, Loader2, Wand2 } from 'lucide-react';
import { enhanceTaskWithAi } from '../services/api';

const CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Design', 'Database', 'Security', 'Mobile'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  initialStatus = 'TODO',
  projects = [],
  workspaceMembers = [],
  onCreateProject,
  addToast
}) {
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

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

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
        status: initialStatus || 'TODO',
        priority: 'MEDIUM',
        category: 'Frontend',
        assignee: '',
        assignedToId: '',
        dueDate: new Date().toISOString().split('T')[0],
        projectId: projects[0]?.id || ''
      });
    }
  }, [taskToEdit, projects, isOpen, initialStatus]);

  if (!isOpen) return null;

  const handleAiEnhance = async () => {
    if (!formData.title.trim()) {
      if (addToast) addToast('Please enter a task title first to enhance with AI.', 'error');
      return;
    }
    setIsEnhancing(true);
    try {
      const result = await enhanceTaskWithAi(formData);
      setFormData((prev) => ({
        ...prev,
        description: result.enhancedDescription || prev.description,
        category: result.suggestedCategory || prev.category,
        priority: result.suggestedPriority || prev.priority
      }));
      if (addToast) addToast('✨ AI enhanced description & acceptance criteria!', 'success');
    } catch (err) {
      if (addToast) addToast('Could not enhance task. Try again.', 'error');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  const handleInlineCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim() || !onCreateProject) return;
    const created = await onCreateProject(newProjectName.trim());
    if (created && created.id) {
      setFormData({ ...formData, projectId: created.id });
    }
    setNewProjectName('');
    setIsCreatingProject(false);
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
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '580px', padding: '1.75rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #e11d48, #9f1239)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: '800' }}>
                {taskToEdit ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {taskToEdit ? 'Update task details, stage, or assignment' : 'Add a new work item to your active workspace'}
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

          {/* Description + AI Polish Button */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Description</label>
              <button
                type="button"
                onClick={handleAiEnhance}
                disabled={isEnhancing || !formData.title.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(225, 29, 72, 0.4)',
                  background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.15), rgba(147, 51, 234, 0.15))',
                  color: 'var(--primary)',
                  cursor: 'pointer'
                }}
              >
                {isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                <span>{isEnhancing ? 'Enhancing...' : '✨ AI Polish & Criteria'}</span>
              </button>
            </div>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Provide context, acceptance criteria, or click '✨ AI Polish & Criteria' above..."
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
                    background: formData.category === cat ? 'linear-gradient(135deg, #e11d48, #9f1239)' : 'var(--bg-tertiary)',
                    color: formData.category === cat ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-responsive">
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

          <div className="grid-responsive">
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Project Scope</label>
                {onCreateProject && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingProject(!isCreatingProject)}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.725rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + New Project
                  </button>
                )}
              </div>

              {isCreatingProject ? (
                <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Project name..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                    autoFocus
                  />
                  <button type="button" className="btn btn-primary" onClick={handleInlineCreateProject} style={{ padding: '0.4rem 0.75rem' }}>
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <select
                  className="form-select"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                >
                  <option value="">No Project</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
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
