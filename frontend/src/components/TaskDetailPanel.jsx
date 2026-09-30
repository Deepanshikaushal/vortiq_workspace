import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Calendar,
  Clock,
  Tag,
  User,
  Folder,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Paperclip,
  MessageSquare,
  Sparkles,
  GitBranch,
  ArrowRight,
  Send,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Layers,
  Activity,
  ThumbsUp,
  Flame,
  Heart,
  Eye,
  FileCode,
  FileText,
  Download,
  Link as LinkIcon,
  Copy,
  Zap,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import {
  playClickSound,
  playChecklistSound,
  playTaskCompleteSound
} from '../utils/audioEffects';

export default function TaskDetailPanel({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  projects = [],
  workspaceMembers = [],
  allTasks = [],
  onAddToast,
  onSelectTask
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('DETAILS'); // 'DETAILS' | 'CHECKLIST' | 'COMMENTS' | 'ACTIVITY' | 'AI'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [projectId, setProjectId] = useState(1);
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Subtasks
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Comments
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

  // Attachments
  const [attachments, setAttachments] = useState([]);

  // Dependencies
  const [dependencies, setDependencies] = useState([]);
  const [selectedDepTaskId, setSelectedDepTaskId] = useState('');
  const [depType, setDepType] = useState('BLOCKED_BY'); // 'BLOCKED_BY' | 'BLOCKS'

  // Activity History
  const [activityHistory, setActivityHistory] = useState([]);

  // AI Insights
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGeneratedOutput, setAiGeneratedOutput] = useState(null);

  // Sync state whenever selected task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'TODO');
      setPriority(task.priority || 'MEDIUM');
      setAssignee(task.assignee || '');
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setEstimatedTime(task.estimatedTime || '45m');
      setProjectId(task.projectId || 1);
      setTags(Array.isArray(task.tags) ? [...task.tags] : []);
      setSubtasks(Array.isArray(task.subtasks) ? [...task.subtasks] : []);
      setComments(Array.isArray(task.comments) ? [...task.comments] : []);
      setAttachments(Array.isArray(task.attachments) ? [...task.attachments] : []);
      setDependencies(Array.isArray(task.dependencies) ? [...task.dependencies] : []);
      setActivityHistory(Array.isArray(task.activityHistory) ? [...task.activityHistory] : []);
      setAiGeneratedOutput(null);
    }
  }, [task]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const currentProject = projects.find((p) => String(p.id) === String(projectId)) || projects[0] || { name: 'Core Platform', colorCode: '#6366f1' };

  // Save changes helper
  const handleSaveField = (updatedFields) => {
    const updated = {
      ...task,
      ...updatedFields
    };
    onUpdateTask?.(task.id, updated);
  };

  // Subtask Toggle
  const handleToggleSubtask = (subtaskId) => {
    playChecklistSound();
    const updated = subtasks.map((st) => {
      if (st.id === subtaskId) {
        const nextState = !st.completed;
        if (nextState) playChecklistSound();
        return { ...st, completed: nextState };
      }
      return st;
    });
    setSubtasks(updated);
    handleSaveField({ subtasks: updated });

    // If all subtasks completed, celebrate
    const allDone = updated.length > 0 && updated.every((s) => s.completed);
    if (allDone) {
      playTaskCompleteSound();
      onAddToast?.('All subtasks completed! Great velocity.', 'success');
    }
  };

  // Add Subtask
  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    playClickSound();
    const newSt = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };
    const updated = [...subtasks, newSt];
    setSubtasks(updated);
    setNewSubtaskTitle('');
    handleSaveField({ subtasks: updated });
    onAddToast?.('Subtask added', 'info');
  };

  // Delete Subtask
  const handleDeleteSubtask = (subtaskId) => {
    playClickSound();
    const updated = subtasks.filter((s) => s.id !== subtaskId);
    setSubtasks(updated);
    handleSaveField({ subtasks: updated });
  };

  // Tag Management
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (!newTagInput.trim()) return;
      const clean = newTagInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
      if (clean && !tags.includes(clean)) {
        const updated = [...tags, clean];
        setTags(updated);
        setNewTagInput('');
        setIsAddingTag(false);
        handleSaveField({ tags: updated });
        onAddToast?.(`Added tag #${clean}`, 'info');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    playClickSound();
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    handleSaveField({ tags: updated });
  };

  // Add Comment
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    playClickSound();
    const newComment = {
      id: `cm-${Date.now()}`,
      author: 'Deepanshi Kaushal',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140&auto=format&fit=crop&q=80',
      text: newCommentText.trim(),
      createdAt: 'Just now',
      reactions: []
    };
    const updatedComments = [...comments, newComment];
    const updatedHistory = [
      ...activityHistory,
      { id: `act-${Date.now()}`, user: 'Deepanshi Kaushal', action: 'posted a comment', timestamp: 'Just now' }
    ];
    setComments(updatedComments);
    setActivityHistory(updatedHistory);
    setNewCommentText('');
    handleSaveField({ comments: updatedComments, activityHistory: updatedHistory });
    onAddToast?.('Comment published', 'success');
  };

  // Add Reaction to Comment
  const handleToggleReaction = (commentId, emoji) => {
    playClickSound();
    const updated = comments.map((c) => {
      if (c.id === commentId) {
        const currentReactions = Array.isArray(c.reactions) ? [...c.reactions] : [];
        const hasReacted = currentReactions.includes(emoji);
        const nextReactions = hasReacted
          ? currentReactions.filter((r) => r !== emoji)
          : [...currentReactions, emoji];
        return { ...c, reactions: nextReactions };
      }
      return c;
    });
    setComments(updated);
    handleSaveField({ comments: updated });
  };

  // Add Mock Attachment
  const handleAddAttachment = () => {
    playClickSound();
    const mockFiles = [
      { name: 'staging_verification_log.txt', size: '14.2 KB', type: 'text' },
      { name: 'oauth2_handshake_diagram.png', size: '420 KB', type: 'image' },
      { name: 'postman_collection.json', size: '88 KB', type: 'code' }
    ];
    const chosen = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    const newAtt = {
      id: `att-${Date.now()}`,
      name: chosen.name,
      size: chosen.size,
      type: chosen.type,
      uploadedAt: 'Just now'
    };
    const updated = [...attachments, newAtt];
    const updatedHistory = [
      ...activityHistory,
      { id: `act-${Date.now()}`, user: 'Deepanshi Kaushal', action: `attached file ${chosen.name}`, timestamp: 'Just now' }
    ];
    setAttachments(updated);
    setActivityHistory(updatedHistory);
    handleSaveField({ attachments: updated, activityHistory: updatedHistory });
    onAddToast?.(`Attached ${chosen.name}`, 'success');
  };

  // Remove Attachment
  const handleRemoveAttachment = (attId) => {
    playClickSound();
    const updated = attachments.filter((a) => a.id !== attId);
    setAttachments(updated);
    handleSaveField({ attachments: updated });
    onAddToast?.('Attachment removed', 'info');
  };

  // Add Dependency
  const handleAddDependency = () => {
    if (!selectedDepTaskId) return;
    playClickSound();
    const target = allTasks.find((t) => String(t.id) === String(selectedDepTaskId));
    if (!target) return;
    const newDep = {
      id: `dep-${Date.now()}`,
      taskId: target.id,
      taskTitle: target.title,
      type: depType
    };
    const updated = [...dependencies, newDep];
    setDependencies(updated);
    setSelectedDepTaskId('');
    handleSaveField({ dependencies: updated });
    onAddToast?.(`Dependency linked with "${target.title}"`, 'success');
  };

  const handleRemoveDependency = (depId) => {
    playClickSound();
    const updated = dependencies.filter((d) => d.id !== depId);
    setDependencies(updated);
    handleSaveField({ dependencies: updated });
  };

  // AI Contextual Suggestions
  const handleRunAiAction = (actionKey) => {
    playClickSound();
    setIsGeneratingAi(true);

    setTimeout(() => {
      setIsGeneratingAi(false);
      if (actionKey === 'ACCEPTANCE_CRITERIA') {
        const criteria = `\n\n### Acceptance Criteria (Auto-Generated by Flow Intelligence)\n- [ ] Input payload validates schema format.\n- [ ] Returns HTTP 200 with JSON response on success.\n- [ ] Emits structured RFC-7807 error problem detail on 4xx/5xx.\n- [ ] Performance target: < 50ms p95 latency under normal load.`;
        const updatedDesc = (description || '') + criteria;
        setDescription(updatedDesc);
        handleSaveField({ description: updatedDesc });
        onAddToast?.('Generated and appended acceptance criteria', 'success');
      } else if (actionKey === 'BREAK_SUBTASKS') {
        const generated = [
          { id: `st-ai-1-${Date.now()}`, title: `Validate input boundary contracts for "${title.slice(0, 25)}..."`, completed: false },
          { id: `st-ai-2-${Date.now()}`, title: 'Implement integration handler & unit test coverage', completed: false },
          { id: `st-ai-3-${Date.now()}`, title: 'Deploy to staging and run automated health verification', completed: false }
        ];
        const updated = [...subtasks, ...generated];
        setSubtasks(updated);
        handleSaveField({ subtasks: updated });
        onAddToast?.('Auto-generated 3 granular subtasks', 'success');
      } else if (actionKey === 'RISK_ASSESSMENT') {
        setAiGeneratedOutput({
          type: 'RISK',
          headline: 'Delivery Health: 94% on-track trajectory',
          summary: 'Based on assignee velocity and task scope, this deliverable is projected to complete 1.5 hours before the staging code freeze.'
        });
        onAddToast?.('Analyzed delivery risk trajectory', 'info');
      } else if (actionKey === 'DRAFT_PR') {
        const prBody = `## Summary\nResolves TASK-${task.id}: ${title}\n\n### Changes\n- Implemented core requirement\n- Added automated test suites\n\n### Verification\n- [x] Staging build passed\n- [x] No regressions detected`;
        navigator.clipboard?.writeText?.(prBody);
        onAddToast?.('Draft PR description copied to clipboard!', 'success');
      }
    }, 450);
  };

  // Progress metrics
  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;
  const subtasksPercent = subtasks.length > 0 ? Math.round((completedSubtasksCount / subtasks.length) * 100) : 0;

  // Available tasks for dependencies (exclude self)
  const candidateDepTasks = allTasks.filter((t) => String(t.id) !== String(task.id));

  // Related tasks (same project)
  const relatedTasksList = allTasks.filter((t) => String(t.projectId) === String(projectId) && String(t.id) !== String(task.id)).slice(0, 3);

  return (
    <>
      {/* Backdrop for closing */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 8, 15, 0.55)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: 88
        }}
      />

      {/* Slide-over Workspace Panel */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: isExpanded ? '100%' : '100%',
          maxWidth: isExpanded ? '920px' : '620px',
          backgroundColor: '#0c101a',
          borderLeft: '1px solid #1a2336',
          boxShadow: '-16px 0 45px rgba(0, 0, 0, 0.75)',
          zIndex: 89,
          display: 'flex',
          flexDirection: 'column',
          transition: 'max-width 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          animation: 'slideInRight 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Top Sticky Header */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid #1a2336',
          backgroundColor: '#111726',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexShrink: 0
        }}>
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', color: '#64748b', minWidth: 0 }}>
            <span>Flowvia</span>
            <span>/</span>
            <span style={{ color: currentProject.colorCode, fontWeight: 600 }}>{currentProject.name}</span>
            <span>/</span>
            <span style={{ color: '#f8fafc', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>TASK-{task.id}</span>
          </div>

          {/* Quick Actions & Window Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            {/* Copy Task Link */}
            <button
              onClick={() => {
                navigator.clipboard?.writeText?.(window.location.href);
                onAddToast?.('Task link copied to clipboard', 'info');
              }}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
              title="Copy Task Link"
            >
              <LinkIcon size={15} />
            </button>

            {/* Expand / Minimize Width */}
            <button
              onClick={() => {
                playClickSound();
                setIsExpanded(!isExpanded);
              }}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
              title={isExpanded ? 'Collapse Panel' : 'Expand Panel Width'}
            >
              {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            {/* Delete Task */}
            <button
              onClick={() => {
                if (window.confirm(`Delete task "TASK-${task.id}: ${title}"?`)) {
                  onDeleteTask?.(task.id);
                  onClose();
                  onAddToast?.('Task deleted', 'info');
                }
              }}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
              title="Delete Task"
            >
              <Trash2 size={15} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
              title="Close Panel (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Main Detail Canvas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Title Area */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleSaveField({ title })}
              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
              placeholder="Task title..."
              style={{
                width: '100%',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#f8fafc',
                backgroundColor: 'transparent',
                border: '1px solid transparent',
                borderRadius: '6px',
                padding: '0.35rem 0.45rem',
                outline: 'none',
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.015em',
                transition: 'border-color 0.15s'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#1f2b42')}
            />
          </div>

          {/* Properties Meta Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
            gap: '0.65rem',
            padding: '0.85rem',
            backgroundColor: '#111726',
            borderRadius: '8px',
            border: '1px solid #1f2b42'
          }}>
            {/* Status */}
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Status
              </span>
              <select
                value={status}
                onChange={(e) => {
                  const next = e.target.value;
                  setStatus(next);
                  handleSaveField({ status: next });
                  if (next === 'COMPLETED') playTaskCompleteSound();
                  else playClickSound();
                }}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: '#0c101a',
                  color: status === 'COMPLETED' ? '#86efac' : status === 'IN_PROGRESS' ? '#93c5fd' : status === 'IN_REVIEW' ? '#fcd34d' : '#cbd5e1',
                  border: '1px solid #1f2b42',
                  borderRadius: '5px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Priority
              </span>
              <select
                value={priority}
                onChange={(e) => {
                  const next = e.target.value;
                  setPriority(next);
                  handleSaveField({ priority: next });
                  playClickSound();
                }}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: '#0c101a',
                  color: priority === 'URGENT' ? '#fca5a5' : priority === 'HIGH' ? '#fdba74' : priority === 'MEDIUM' ? '#93c5fd' : '#94a3b8',
                  border: '1px solid #1f2b42',
                  borderRadius: '5px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Assignee
              </span>
              <select
                value={assignee}
                onChange={(e) => {
                  const next = e.target.value;
                  setAssignee(next);
                  handleSaveField({ assignee: next });
                  playClickSound();
                }}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#0c101a',
                  color: '#cbd5e1',
                  border: '1px solid #1f2b42',
                  borderRadius: '5px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Unassigned</option>
                <option value="Deepanshi Kaushal">Deepanshi Kaushal</option>
                <option value="Sarah Chen">Sarah Chen</option>
                <option value="Marcus Vance">Marcus Vance</option>
                <option value="Alex Rivera">Alex Rivera</option>
                <option value="Standard Member">Standard Member</option>
                {workspaceMembers.map((m) => (
                  <option key={m.id || m.userId} value={m.name || m.username}>
                    {m.name || m.username}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Due Date
              </span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  const next = e.target.value;
                  setDueDate(next);
                  handleSaveField({ dueDate: next });
                }}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#0c101a',
                  color: '#cbd5e1',
                  border: '1px solid #1f2b42',
                  borderRadius: '5px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Estimated Time */}
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Est. Runway
              </span>
              <input
                type="text"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                onBlur={() => handleSaveField({ estimatedTime })}
                placeholder="e.g. 45m, 2h"
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#0c101a',
                  color: '#818cf8',
                  border: '1px solid #1f2b42',
                  borderRadius: '5px',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            {/* Project */}
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Project
              </span>
              <select
                value={projectId}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setProjectId(next);
                  handleSaveField({ projectId: next });
                  playClickSound();
                }}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#0c101a',
                  color: '#cbd5e1',
                  border: '1px solid #1f2b42',
                  borderRadius: '5px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags Chips Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              Tags:
            </span>
            {tags.map((tg) => (
              <span
                key={tg}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(99, 102, 241, 0.12)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                #{tg}
                <button
                  onClick={() => handleRemoveTag(tg)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                  title="Remove tag"
                >
                  <X size={11} />
                </button>
              </span>
            ))}

            {isAddingTag ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input
                  type="text"
                  autoFocus
                  placeholder="tag..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  onBlur={() => setIsAddingTag(false)}
                  style={{
                    padding: '2px 6px',
                    fontSize: '0.7rem',
                    backgroundColor: '#0c101a',
                    color: '#f8fafc',
                    border: '1px solid #24324f',
                    borderRadius: '4px',
                    width: '80px',
                    outline: 'none'
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  border: '1px dashed #1f2b42',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <Plus size={11} />
                <span>Add tag</span>
              </button>
            )}
          </div>

          {/* Section Navigation Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #1a2336',
            gap: '0.5rem',
            overflowX: 'auto'
          }}>
            {[
              { id: 'DETAILS', label: 'Description & Scope' },
              { id: 'CHECKLIST', label: `Checklist (${completedSubtasksCount}/${subtasks.length})` },
              { id: 'DEPENDENCIES', label: `Dependencies (${dependencies.length})` },
              { id: 'FILES', label: `Files (${attachments.length})` },
              { id: 'COMMENTS', label: `Comments & History (${comments.length})` },
              { id: 'AI', label: 'AI Assistance' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  playClickSound();
                  setActiveTab(tab.id);
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
                  color: activeTab === tab.id ? '#f8fafc' : '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: activeTab === tab.id ? 700 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.12s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: DESCRIPTION */}
          {activeTab === 'DETAILS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Technical Description & Acceptance Specs
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  Supports Markdown syntax
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleSaveField({ description })}
                placeholder="Provide detailed implementation notes, architectural boundaries, edge cases, and testing criteria..."
                rows={8}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  backgroundColor: '#111726',
                  color: '#cbd5e1',
                  border: '1px solid #1f2b42',
                  borderRadius: '6px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
              />

              {/* Related Tasks Preview */}
              {relatedTasksList.length > 0 && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#111726',
                  borderRadius: '6px',
                  border: '1px solid #1f2b42',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  marginTop: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Connected Project Deliverables
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {relatedTasksList.map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => onSelectTask?.(rel)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.4rem 0.6rem',
                          backgroundColor: '#0c101a',
                          borderRadius: '4px',
                          border: '1px solid #1a2336',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#818cf8' }}>
                            TASK-{rel.id}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>
                            {rel.title}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{rel.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHECKLIST & SUBTASKS */}
          {activeTab === 'CHECKLIST' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Progress bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Checklist Progress</span>
                  <span style={{ fontWeight: 700, color: subtasksPercent === 100 ? '#10b981' : '#818cf8' }}>
                    {completedSubtasksCount} of {subtasks.length} ({subtasksPercent}%)
                  </span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#111726', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${subtasksPercent}%`,
                      backgroundColor: subtasksPercent === 100 ? '#10b981' : '#6366f1',
                      transition: 'width 0.2s ease'
                    }}
                  />
                </div>
              </div>

              {/* Subtask list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {subtasks.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                    No subtasks yet. Break this task down into actionable steps.
                  </div>
                ) : (
                  subtasks.map((st) => (
                    <div
                      key={st.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.75rem',
                        backgroundColor: '#111726',
                        borderRadius: '6px',
                        border: '1px solid #1f2b42',
                        gap: '0.65rem',
                        transition: 'border-color 0.12s'
                      }}
                    >
                      <div
                        onClick={() => handleToggleSubtask(st.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flex: 1, minWidth: 0 }}
                      >
                        {st.completed ? (
                          <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
                        ) : (
                          <Square size={16} color="#64748b" style={{ flexShrink: 0 }} />
                        )}
                        <span style={{
                          fontSize: '0.785rem',
                          color: st.completed ? '#64748b' : '#f8fafc',
                          textDecoration: st.completed ? 'line-through' : 'none',
                          wordBreak: 'break-word'
                        }}>
                          {st.title}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteSubtask(st.id)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                        title="Remove subtask"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add subtask inline input */}
              <form onSubmit={handleAddSubtask} style={{ display: 'flex', gap: '0.45rem', marginTop: '4px' }}>
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a new subtask (press Enter)..."
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.785rem',
                    backgroundColor: '#111726',
                    color: '#f8fafc',
                    border: '1px solid #1f2b42',
                    borderRadius: '6px',
                    outline: 'none'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                  onBlur={(e) => (e.target.style.borderColor = '#1f2b42')}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0.5rem 0.85rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#6366f1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: DEPENDENCIES */}
          {activeTab === 'DEPENDENCIES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Manage directional blockers and sequence dependencies for sprint scheduling.
              </div>

              {/* Linked dependencies list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {dependencies.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                    No dependencies configured. This deliverable has an unblocked runway.
                  </div>
                ) : (
                  dependencies.map((dep) => (
                    <div
                      key={dep.id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        backgroundColor: '#111726',
                        borderRadius: '6px',
                        border: '1px solid #1f2b42',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '3px',
                          backgroundColor: dep.type === 'BLOCKED_BY' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                          color: dep.type === 'BLOCKED_BY' ? '#fca5a5' : '#7dd3fc',
                          border: dep.type === 'BLOCKED_BY' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)'
                        }}>
                          {dep.type === 'BLOCKED_BY' ? 'BLOCKED BY' : 'BLOCKS'}
                        </span>
                        <span style={{ fontSize: '0.785rem', color: '#f8fafc', fontWeight: 600 }}>
                          TASK-{dep.taskId}: {dep.taskTitle}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveDependency(dep.id)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Dependency Control */}
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#111726',
                borderRadius: '6px',
                border: '1px solid #1f2b42',
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <select
                  value={depType}
                  onChange={(e) => setDepType(e.target.value)}
                  style={{
                    padding: '0.45rem',
                    fontSize: '0.75rem',
                    backgroundColor: '#0c101a',
                    color: '#f8fafc',
                    border: '1px solid #1f2b42',
                    borderRadius: '4px'
                  }}
                >
                  <option value="BLOCKED_BY">Blocked By</option>
                  <option value="BLOCKS">Blocks</option>
                </select>

                <select
                  value={selectedDepTaskId}
                  onChange={(e) => setSelectedDepTaskId(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '0.45rem',
                    fontSize: '0.75rem',
                    backgroundColor: '#0c101a',
                    color: '#f8fafc',
                    border: '1px solid #1f2b42',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">Select target deliverable...</option>
                  {candidateDepTasks.map((cand) => (
                    <option key={cand.id} value={cand.id}>
                      TASK-{cand.id}: {cand.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddDependency}
                  disabled={!selectedDepTaskId}
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: selectedDepTaskId ? '#6366f1' : '#1e293b',
                    color: selectedDepTaskId ? '#ffffff' : '#64748b',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: selectedDepTaskId ? 'pointer' : 'not-allowed'
                  }}
                >
                  Link
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: FILES & ATTACHMENTS */}
          {activeTab === 'FILES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Artifacts, OpenAPI schemas, and design specification documents.
                </span>
                <button
                  onClick={handleAddAttachment}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: '#111726',
                    border: '1px solid #1f2b42',
                    borderRadius: '4px',
                    color: '#818cf8',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={13} />
                  <span>Attach File</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {attachments.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                    No attachments uploaded yet. Click "Attach File" to add documents.
                  </div>
                ) : (
                  attachments.map((file) => (
                    <div
                      key={file.id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        backgroundColor: '#111726',
                        borderRadius: '6px',
                        border: '1px solid #1f2b42',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(99, 102, 241, 0.15)',
                          color: '#818cf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {file.type === 'code' ? <FileCode size={15} /> : <FileText size={15} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.785rem', color: '#f8fafc', fontWeight: 600 }}>{file.name}</div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                            {file.size} · Uploaded {file.uploadedAt}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <button
                          onClick={() => onAddToast?.(`Downloading ${file.name}...`, 'info')}
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '3px' }}
                          title="Download file"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => handleRemoveAttachment(file.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '3px' }}
                          title="Remove file"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: COMMENTS & ACTIVITY HISTORY */}
          {activeTab === 'COMMENTS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Existing Comments Stream */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {comments.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                    No discussions yet. Leave a note or update for teammates.
                  </div>
                ) : (
                  comments.map((cm) => (
                    <div
                      key={cm.id}
                      style={{
                        padding: '0.75rem 0.85rem',
                        backgroundColor: '#111726',
                        borderRadius: '6px',
                        border: '1px solid #1f2b42',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <img
                            src={cm.avatar}
                            alt={cm.author}
                            style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#f8fafc' }}>
                            {cm.author}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                          {cm.createdAt}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.785rem', color: '#cbd5e1', margin: 0, lineHeight: 1.45 }}>
                        {cm.text}
                      </p>

                      {/* Emoji Reactions Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                        {['👍', '🚀', '✨', '❤️'].map((em) => {
                          const count = (cm.reactions || []).filter((r) => r === em).length;
                          const active = (cm.reactions || []).includes(em);
                          return (
                            <button
                              key={em}
                              onClick={() => handleToggleReaction(cm.id, em)}
                              style={{
                                background: active ? 'rgba(99, 102, 241, 0.2)' : '#0c101a',
                                border: active ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid #1a2336',
                                borderRadius: '4px',
                                padding: '2px 5px',
                                fontSize: '0.68rem',
                                cursor: 'pointer',
                                color: '#cbd5e1',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                            >
                              <span>{em}</span>
                              {count > 0 && <span style={{ fontSize: '0.62rem', fontWeight: 700 }}>{count}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input Form */}
              <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      handleAddComment(e);
                    }
                  }}
                  placeholder="Add a comment or @mention a teammate... (Cmd+Enter to send)"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    fontSize: '0.785rem',
                    backgroundColor: '#111726',
                    color: '#f8fafc',
                    border: '1px solid #1f2b42',
                    borderRadius: '6px',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                  onBlur={(e) => (e.target.style.borderColor = '#1f2b42')}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: newCommentText.trim() ? '#6366f1' : '#1e293b',
                      color: newCommentText.trim() ? '#ffffff' : '#64748b',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: newCommentText.trim() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Send size={13} />
                    <span>Send</span>
                  </button>
                </div>
              </form>

              {/* Audit Activity Stream */}
              {activityHistory.length > 0 && (
                <div style={{ marginTop: '0.75rem', borderTop: '1px solid #1a2336', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.45rem' }}>
                    Activity Audit Log
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {activityHistory.map((act) => (
                      <div key={act.id} style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
                        <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{act.user}</span>
                        <span>{act.action}</span>
                        <span style={{ color: '#475569', marginLeft: 'auto' }}>{act.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: AI SUGGESTIONS */}
          {activeTab === 'AI' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem'
              }}>
                <Sparkles size={16} color="#818cf8" />
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  Embedded workspace intelligence actions. Evaluates sprint context, specifications, and telemetry.
                </span>
              </div>

              {/* Actions Suite */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <button
                  onClick={() => handleRunAiAction('ACCEPTANCE_CRITERIA')}
                  disabled={isGeneratingAi}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#111726',
                    border: '1px solid #1f2b42',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#818cf8' }}>
                    Generate Acceptance Criteria
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Appends checklist to description based on title.
                  </span>
                </button>

                <button
                  onClick={() => handleRunAiAction('BREAK_SUBTASKS')}
                  disabled={isGeneratingAi}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#111726',
                    border: '1px solid #1f2b42',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#38bdf8' }}>
                    Auto-Break Into Subtasks
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Creates 3 sequential engineering checklist steps.
                  </span>
                </button>

                <button
                  onClick={() => handleRunAiAction('RISK_ASSESSMENT')}
                  disabled={isGeneratingAi}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#111726',
                    border: '1px solid #1f2b42',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#fcd34d' }}>
                    Predict Completion Risk
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Analyzes deadline runway and team review velocity.
                  </span>
                </button>

                <button
                  onClick={() => handleRunAiAction('DRAFT_PR')}
                  disabled={isGeneratingAi}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#111726',
                    border: '1px solid #1f2b42',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#10b981' }}>
                    Draft Git PR Description
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Copies markdown PR template with task references.
                  </span>
                </button>
              </div>

              {/* Dynamic AI Output Box */}
              {aiGeneratedOutput && (
                <div style={{
                  padding: '0.85rem',
                  backgroundColor: '#0c101a',
                  borderRadius: '6px',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem'
                }}>
                  <div style={{ fontSize: '0.785rem', fontWeight: 800, color: '#818cf8' }}>
                    {aiGeneratedOutput.headline}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0, lineHeight: 1.45 }}>
                    {aiGeneratedOutput.summary}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Panel Footer */}
        <div style={{
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid #1a2336',
          backgroundColor: '#0c101a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: '#64748b',
          flexShrink: 0
        }}>
          <span>Flowvia Task Engine · Auto-saved</span>
          <span>Press ESC to close</span>
        </div>
      </aside>
    </>
  );
}
