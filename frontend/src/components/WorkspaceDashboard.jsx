import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Calendar,
  Folder,
  Users,
  Play,
  Pause,
  RotateCcw,
  Plus,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  FileText,
  UserPlus,
  MoreVertical,
  Check,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Flame,
  Zap,
  Tag,
  ExternalLink,
  Sparkles,
  GripVertical,
  Volume2,
  VolumeX,
  CornerDownLeft
} from 'lucide-react';
import {
  playTaskCompleteSound,
  playClickSound,
  playFocusBellSound,
  isSoundEnabled,
  setSoundEnabled
} from '../utils/audioEffects';

export default function WorkspaceDashboard({
  tasks = [],
  projects = [],
  currentUser,
  activeWorkspace,
  onOpenCreateTask,
  onOpenCreateProject,
  onOpenEditTask,
  onStatusChange,
  onDeleteTask,
  onNavigate,
  onAddToast
}) {
  // Audio state
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playClickSound();
    onAddToast?.(next ? 'Sound effects enabled' : 'Sound effects muted', 'info');
  };

  // Focus / Productivity Timer state
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState(25); // 25 or 50 minutes

  // Today's focus priority tasks state (with custom items support & drag-and-drop order)
  const [focusTasksList, setFocusTasksList] = useState([]);
  const [focusTasksCompleted, setFocusTasksCompleted] = useState({});
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverTaskId, setDragOverTaskId] = useState(null);

  // Inline Quick Task Adder in Today's Focus
  const [newFocusTitle, setNewFocusTitle] = useState('');
  const [newFocusPriority, setNewFocusPriority] = useState('HIGH');
  const [newFocusDeadline, setNewFocusDeadline] = useState('Today, 5:00 PM');
  const [isAddingFocus, setIsAddingFocus] = useState(false);

  // My Work tab & quick add
  const [myWorkTab, setMyWorkTab] = useState('IN_PROGRESS'); // 'IN_PROGRESS' | 'OVERDUE' | 'UPCOMING'
  const [newMyWorkTitle, setNewMyWorkTitle] = useState('');
  const [isAddingMyWork, setIsAddingMyWork] = useState(false);

  // Team Activity filter tab & comment input
  const [activityTab, setActivityTab] = useState('ALL'); // 'ALL' | 'COMMENTS' | 'ASSIGNMENTS' | 'COMPLETED'
  const [newCommentText, setNewCommentText] = useState('');

  // Expandable sections toggle
  const [expandedSections, setExpandedSections] = useState({
    focus: true,
    myWork: true,
    projects: true,
    activity: true,
    productivity: true,
    quickActions: true
  });

  // Context Menu State for tasks
  const [contextMenuTaskId, setContextMenuTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  // Initialize focus tasks from props if available
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const sorted = [...tasks].sort((a, b) => {
        const pMap = { URGENT: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
        return (pMap[a.priority] || 5) - (pMap[b.priority] || 5);
      });
      setFocusTasksList(
        sorted.slice(0, 5).map((t) => ({
          ...t,
          deadline: t.dueDate ? `Due ${t.dueDate}` : 'Today, 5:00 PM'
        }))
      );
    } else {
      setFocusTasksList([
        { id: 101, title: 'Finalize core workspace architecture and token polish', priority: 'URGENT', deadline: 'Today, 4:00 PM', category: 'Engineering' },
        { id: 102, title: 'Review pull request for JWT token rotation service', priority: 'HIGH', deadline: 'Today, 6:00 PM', category: 'Security' },
        { id: 103, title: 'Optimize query index on tasks database table', priority: 'MEDIUM', deadline: 'Today, 8:00 PM', category: 'Database' },
        { id: 104, title: 'Verify mobile responsive navigation breakpoints', priority: 'LOW', deadline: 'End of Day', category: 'Frontend' }
      ]);
    }
  }, [tasks]);

  // Pomodoro Interval Effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      playFocusBellSound();
      onAddToast?.('🎉 Focus session completed! Great work.', 'success');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, onAddToast]);

  const toggleTimer = () => {
    playClickSound();
    setIsTimerRunning(!isTimerRunning);
    onAddToast?.(isTimerRunning ? 'Focus session paused' : 'Focus session started', 'info');
  };

  const resetTimer = () => {
    playClickSound();
    setIsTimerRunning(false);
    setTimerSeconds(timerMode * 60);
  };

  const switchTimerMode = (mins) => {
    playClickSound();
    setIsTimerRunning(false);
    setTimerMode(mins);
    setTimerSeconds(mins * 60);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const toggleSection = (key) => {
    playClickSound();
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Team Activities state
  const [teamActivities, setTeamActivities] = useState([
    {
      id: 'act-1',
      actor: 'Alex Rivera',
      avatar: 'A',
      action: 'completed',
      target: 'Implement OAuth2 PKCE token exchange flow',
      time: '12m ago',
      type: 'COMPLETED'
    },
    {
      id: 'act-2',
      actor: 'Sarah Chen',
      avatar: 'S',
      action: 'commented on',
      target: 'API rate limiting and Redis backplane',
      time: '26m ago',
      type: 'COMMENTS',
      commentText: '"Benchmark shows under 4ms latency with local pipelining."'
    },
    {
      id: 'act-3',
      actor: 'Marcus Vance',
      avatar: 'M',
      action: 'assigned',
      target: 'Kubernetes cluster ingress SSL rotation',
      time: '1h ago',
      type: 'ASSIGNMENTS',
      assignee: 'Deepanshi Kaushal'
    },
    {
      id: 'act-4',
      actor: 'Elena Rostova',
      avatar: 'E',
      action: 'completed',
      target: 'Refactor Kanban drag and drop hitboxes',
      time: '2h ago',
      type: 'COMPLETED'
    }
  ]);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    playClickSound();
    const newAct = {
      id: `act-${Date.now()}`,
      actor: currentUser?.name || 'Deepanshi Kaushal',
      avatar: (currentUser?.name || 'D')[0].toUpperCase(),
      action: 'posted a workspace update',
      target: 'Engineering Sprint Feed',
      time: 'Just now',
      type: 'COMMENTS',
      commentText: `"${newCommentText.trim()}"`
    };
    setTeamActivities([newAct, ...teamActivities]);
    setNewCommentText('');
    onAddToast?.('Posted comment to workspace feed', 'success');
  };

  // Drag and drop task reordering handler
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, taskId) => {
    e.preventDefault();
    if (draggedTaskId && draggedTaskId !== taskId) {
      setDragOverTaskId(taskId);
    }
  };

  const handleDrop = (e, targetTaskId) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      setDraggedTaskId(null);
      setDragOverTaskId(null);
      return;
    }

    const currentList = [...focusTasksList];
    const fromIdx = currentList.findIndex((t) => t.id === draggedTaskId);
    const toIdx = currentList.findIndex((t) => t.id === targetTaskId);

    if (fromIdx !== -1 && toIdx !== -1) {
      const [movedItem] = currentList.splice(fromIdx, 1);
      currentList.splice(toIdx, 0, movedItem);
      setFocusTasksList(currentList);
      playClickSound();
      onAddToast?.('Reordered priority tasks', 'info');
    }

    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  // Add focus task inline
  const handleAddFocusTask = (e) => {
    e.preventDefault();
    if (!newFocusTitle.trim()) return;

    playClickSound();
    const newTask = {
      id: `focus-${Date.now()}`,
      title: newFocusTitle.trim(),
      priority: newFocusPriority,
      deadline: newFocusDeadline,
      category: 'Engineering',
      status: 'TODO'
    };

    setFocusTasksList([newTask, ...focusTasksList]);
    setNewFocusTitle('');
    setIsAddingFocus(false);
    onAddToast?.(`Added "${newTask.title}" to Today's Focus`, 'success');
  };

  // Toggle priority in place
  const handleCyclePriority = (task, e) => {
    e.stopPropagation();
    playClickSound();
    const cycle = { URGENT: 'HIGH', HIGH: 'MEDIUM', MEDIUM: 'LOW', LOW: 'URGENT' };
    const nextPriority = cycle[task.priority] || 'MEDIUM';

    setFocusTasksList((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, priority: nextPriority } : t))
    );
    onAddToast?.(`Priority set to ${nextPriority}`, 'info');
  };

  // Toggle completion with sound
  const handleToggleFocusTask = (task) => {
    const wasCompleted = focusTasksCompleted[task.id] || task.status === 'COMPLETED';
    const nextCompleted = !wasCompleted;

    if (nextCompleted) {
      playTaskCompleteSound();
    } else {
      playClickSound();
    }

    setFocusTasksCompleted((prev) => ({
      ...prev,
      [task.id]: nextCompleted
    }));

    if (onStatusChange && task.status) {
      onStatusChange(task.id, nextCompleted ? 'COMPLETED' : 'IN_PROGRESS');
    }

    onAddToast?.(
      nextCompleted ? `🎉 Completed "${task.title}"!` : `Reopened "${task.title}"`,
      nextCompleted ? 'success' : 'info'
    );
  };

  const focusCompletedCount = focusTasksList.filter(
    (t) => focusTasksCompleted[t.id] || t.status === 'COMPLETED'
  ).length;
  const focusTotalCount = focusTasksList.length;
  const focusProgressPercent = focusTotalCount > 0 ? Math.round((focusCompletedCount / focusTotalCount) * 100) : 0;
  const allFocusDone = focusTotalCount > 0 && focusCompletedCount === focusTotalCount;

  // 2. My Work Tasks
  const myWorkTasks = useMemo(() => {
    const nowStr = new Date().toISOString().split('T')[0];
    if (myWorkTab === 'IN_PROGRESS') {
      return tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW');
    }
    if (myWorkTab === 'OVERDUE') {
      return tasks.filter((t) => t.status !== 'COMPLETED' && t.dueDate && t.dueDate < nowStr);
    }
    if (myWorkTab === 'UPCOMING') {
      return tasks.filter((t) => t.status !== 'COMPLETED' && (!t.dueDate || t.dueDate >= nowStr));
    }
    return tasks;
  }, [tasks, myWorkTab]);

  // Inline editing task
  const handleStartInlineEdit = (task) => {
    playClickSound();
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
    setContextMenuTaskId(null);
  };

  const handleSaveInlineEdit = (taskId) => {
    if (!editingTaskTitle.trim()) return;
    playClickSound();
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      task.title = editingTaskTitle.trim();
      onAddToast?.('Updated task title', 'success');
    }
    setEditingTaskId(null);
  };

  // 7-day productivity sparkline
  const productivityDays = [
    { day: 'Thu', hours: 4.5, tasks: 5 },
    { day: 'Fri', hours: 6.2, tasks: 8 },
    { day: 'Sat', hours: 2.0, tasks: 2 },
    { day: 'Sun', hours: 1.5, tasks: 1 },
    { day: 'Mon', hours: 5.8, tasks: 7 },
    { day: 'Tue', hours: 7.1, tasks: 9 },
    { day: 'Today', hours: 3.5, tasks: focusCompletedCount || 4, isToday: true }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Workspace Header Overview Strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '1rem 1.25rem',
        backgroundColor: '#111726',
        borderRadius: '8px',
        border: '1px solid #1f2b42',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Zap size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.01em' }}>
                Good afternoon, {currentUser?.name?.split(' ')[0] || 'Deepanshi'}
              </h1>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#818cf8',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                Workspace Live
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} · {focusTotalCount - focusCompletedCount} priority items remaining today
            </p>
          </div>
        </div>

        {/* Quick Stat Highlights & Sound Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#0e1422',
              color: soundOn ? '#818cf8' : '#64748b',
              border: '1px solid #1f2b42',
              padding: '0.4rem 0.65rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
            title={soundOn ? 'Sound effects enabled (Click to mute)' : 'Sound effects muted (Click to enable)'}
          >
            {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="desktop-only">{soundOn ? 'Audio On' : 'Muted'}</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#0e1422',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #1f2b42'
          }}>
            <Flame size={15} color="#f59e0b" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0' }}>5 Day Streak</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: '#0e1422',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #1f2b42'
          }}>
            <Clock size={15} color="#38bdf8" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>
              {formatTimer(timerSeconds)} Focus
            </span>
          </div>

          <button
            onClick={() => onOpenCreateTask?.()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.45rem 0.95rem',
              fontSize: '0.785rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <Plus size={14} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Two Column Workspace Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)',
        gap: '1.25rem',
        alignItems: 'start'
      }} className="workspace-main-grid">

        {/* LEFT COLUMN: Focus, My Work, Active Projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* 1. TODAY'S FOCUS */}
          <div style={{
            backgroundColor: '#111726',
            borderRadius: '8px',
            border: '1px solid #1f2b42',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '5px',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <h2 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    Today's Focus
                  </h2>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {focusCompletedCount} of {focusTotalCount} completed ({focusProgressPercent}%) · Drag to reorder
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Segmented Micro Progress Bar */}
                <div style={{
                  width: '90px',
                  height: '6px',
                  backgroundColor: '#161f33',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${focusProgressPercent}%`,
                    height: '100%',
                    backgroundColor: allFocusDone ? '#10b981' : '#6366f1',
                    borderRadius: '3px',
                    transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }} />
                </div>

                <button
                  onClick={() => setIsAddingFocus(!isAddingFocus)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    background: 'none',
                    border: 'none',
                    color: '#818cf8',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                  title="Quick add focus item"
                >
                  <Plus size={13} />
                  <span>Add</span>
                </button>

                <button
                  onClick={() => toggleSection('focus')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={expandedSections.focus ? 'Collapse' : 'Expand'}
                >
                  {expandedSections.focus ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* All Tasks Completed Celebration Banner */}
            {allFocusDone && (
              <div style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.785rem',
                color: '#86efac'
              }}>
                <Sparkles size={16} color="#10b981" />
                <span>All focus goals achieved today! Fantastic sprint momentum.</span>
              </div>
            )}

            {/* Quick Add Inline Input Form */}
            {isAddingFocus && (
              <form onSubmit={handleAddFocusTask} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#0e1422',
                borderRadius: '6px',
                border: '1px solid #24324f'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Focus task title (e.g. Finish OAuth documentation)..."
                    value={newFocusTitle}
                    onChange={(e) => setNewFocusTitle(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#f8fafc',
                      fontSize: '0.825rem'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#6366f1',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <span>Add</span>
                    <CornerDownLeft size={12} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ color: '#64748b' }}>Priority:</span>
                    {['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setNewFocusPriority(p)}
                        style={{
                          background: 'none',
                          border: newFocusPriority === p ? '1px solid #6366f1' : '1px solid #1f2b42',
                          borderRadius: '3px',
                          color: newFocusPriority === p ? '#818cf8' : '#64748b',
                          padding: '1px 5px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: newFocusPriority === p ? 'rgba(99, 102, 241, 0.15)' : 'transparent'
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddingFocus(false)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.7rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Draggable Task Rows */}
            {expandedSections.focus && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {focusTasksList.map((task) => {
                  const isDone = focusTasksCompleted[task.id] || task.status === 'COMPLETED';
                  const isUrgent = task.priority === 'URGENT';
                  const isDragging = draggedTaskId === task.id;
                  const isTarget = dragOverTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragOver={(e) => handleDragOver(e, task.id)}
                      onDrop={(e) => handleDrop(e, task.id)}
                      onDragEnd={() => { setDraggedTaskId(null); setDragOverTaskId(null); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: isDone ? 'rgba(16, 185, 129, 0.04)' : '#161f33',
                        borderRadius: '6px',
                        border: isTarget
                          ? '2px dashed #6366f1'
                          : isDone
                          ? '1px solid rgba(16, 185, 129, 0.2)'
                          : '1px solid #222f47',
                        opacity: isDragging ? 0.4 : 1,
                        cursor: 'grab',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                        <div style={{ color: '#475569', cursor: 'grab' }} title="Drag to reorder">
                          <GripVertical size={14} />
                        </div>

                        <button
                          onClick={() => handleToggleFocusTask(task)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            color: isDone ? '#10b981' : '#64748b',
                            transition: 'color 0.15s ease'
                          }}
                          title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                        >
                          {isDone ? <CheckCircle2 size={17} /> : <Circle size={17} />}
                        </button>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{
                            fontSize: '0.825rem',
                            fontWeight: 600,
                            color: isDone ? '#64748b' : '#e2e8f0',
                            textDecoration: isDone ? 'line-through' : 'none',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {task.title}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '2px' }}>
                            <span style={{ color: isUrgent ? '#f87171' : '#94a3b8' }}>
                              {task.deadline}
                            </span>
                            <span>·</span>
                            <span>{task.category || 'General'}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        {/* Interactive Clickable Priority Tag */}
                        <span
                          onClick={(e) => handleCyclePriority(task, e)}
                          title="Click to cycle priority"
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                            color: isUrgent ? '#fca5a5' : '#a5b4fc',
                            border: isUrgent ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
                            cursor: 'pointer'
                          }}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. MY WORK */}
          <div style={{
            backgroundColor: '#111726',
            borderRadius: '8px',
            border: '1px solid #1f2b42',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  My Work
                </h2>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  backgroundColor: '#161f33',
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}>
                  {myWorkTasks.length}
                </span>
              </div>

              {/* Segmented Filter */}
              <div style={{
                display: 'flex',
                backgroundColor: '#0e1422',
                padding: '2px',
                borderRadius: '6px',
                border: '1px solid #1f2b42'
              }}>
                {[
                  { key: 'IN_PROGRESS', label: 'In Progress' },
                  { key: 'OVERDUE', label: 'Overdue' },
                  { key: 'UPCOMING', label: 'Upcoming' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => { playClickSound(); setMyWorkTab(tab.key); }}
                    style={{
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: myWorkTab === tab.key ? '#6366f1' : 'transparent',
                      color: myWorkTab === tab.key ? '#ffffff' : '#94a3b8',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {myWorkTasks.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                  No items in this category. You're completely up to date!
                </div>
              ) : (
                myWorkTasks.slice(0, 6).map((task) => {
                  const isEditing = editingTaskId === task.id;
                  const isMenuOpen = contextMenuTaskId === task.id;
                  return (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: '#161f33',
                        borderRadius: '6px',
                        border: '1px solid #222f47',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                        <select
                          value={task.status}
                          onChange={(e) => {
                            playClickSound();
                            onStatusChange?.(task.id, e.target.value);
                          }}
                          style={{
                            backgroundColor: '#111726',
                            color: task.status === 'COMPLETED' ? '#86efac' : task.status === 'IN_PROGRESS' ? '#93c5fd' : '#cbd5e1',
                            border: '1px solid #24324f',
                            borderRadius: '4px',
                            padding: '2px 5px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="TODO">TODO</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="IN_REVIEW">IN REVIEW</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>

                        {isEditing ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flex: 1 }}>
                            <input
                              type="text"
                              value={editingTaskTitle}
                              onChange={(e) => setEditingTaskTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveInlineEdit(task.id);
                                if (e.key === 'Escape') setEditingTaskId(null);
                              }}
                              autoFocus
                              style={{
                                backgroundColor: '#0e1422',
                                border: '1px solid #6366f1',
                                borderRadius: '4px',
                                color: '#f8fafc',
                                padding: '2px 6px',
                                fontSize: '0.8rem',
                                width: '100%',
                                outline: 'none'
                              }}
                            />
                            <button
                              onClick={() => handleSaveInlineEdit(task.id)}
                              style={{ background: '#6366f1', border: 'none', borderRadius: '4px', color: '#fff', padding: '3px 6px', cursor: 'pointer' }}
                            >
                              <Check size={12} />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartInlineEdit(task)}
                            style={{
                              fontSize: '0.825rem',
                              fontWeight: 600,
                              color: '#e2e8f0',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              cursor: 'text'
                            }}
                            title="Click to inline edit title"
                          >
                            {task.title}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        <span style={{
                          fontSize: '0.65rem',
                          color: task.dueDate ? '#94a3b8' : '#64748b'
                        }}>
                          {task.dueDate ? `Due ${task.dueDate}` : 'No date'}
                        </span>

                        {/* Context Menu Button */}
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={() => setContextMenuTaskId(isMenuOpen ? null : task.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#64748b',
                              cursor: 'pointer',
                              padding: '2px 4px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="More actions"
                          >
                            <MoreVertical size={14} />
                          </button>

                          {isMenuOpen && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              right: 0,
                              zIndex: 50,
                              backgroundColor: '#0e1422',
                              border: '1px solid #1f2b42',
                              borderRadius: '6px',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                              padding: '4px',
                              minWidth: '140px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px'
                            }}>
                              <button
                                onClick={() => { onOpenEditTask?.(task); setContextMenuTaskId(null); }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.4rem 0.6rem',
                                  background: 'none',
                                  border: 'none',
                                  color: '#cbd5e1',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  borderRadius: '4px',
                                  textAlign: 'left'
                                }}
                              >
                                <Edit2 size={13} />
                                <span>Edit details</span>
                              </button>
                              <button
                                onClick={() => {
                                  playTaskCompleteSound();
                                  onStatusChange?.(task.id, 'COMPLETED');
                                  setContextMenuTaskId(null);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.4rem 0.6rem',
                                  background: 'none',
                                  border: 'none',
                                  color: '#10b981',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  borderRadius: '4px',
                                  textAlign: 'left'
                                }}
                              >
                                <CheckCircle2 size={13} />
                                <span>Mark complete</span>
                              </button>
                              <button
                                onClick={() => { onDeleteTask?.(task.id); setContextMenuTaskId(null); }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.4rem 0.6rem',
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  borderRadius: '4px',
                                  textAlign: 'left'
                                }}
                              >
                                <Trash2 size={13} />
                                <span>Delete task</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. ACTIVE PROJECTS */}
          <div style={{
            backgroundColor: '#111726',
            borderRadius: '8px',
            border: '1px solid #1f2b42',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '5px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Folder size={14} />
                </div>
                <div>
                  <h2 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    Active Projects
                  </h2>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {projects.length} trackable projects in workspace
                  </span>
                </div>
              </div>

              <button
                onClick={() => onOpenCreateProject?.()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#818cf8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Plus size={13} />
                <span>New Project</span>
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem'
            }}>
              {projects.map((proj) => {
                const projTasks = tasks.filter((t) => String(t.projectId) === String(proj.id));
                const completedCount = projTasks.filter((t) => t.status === 'COMPLETED').length;
                const totalCount = projTasks.length || 6;
                const percent = Math.round((completedCount / totalCount) * 100) || 65;

                return (
                  <div
                    key={proj.id}
                    onClick={() => { playClickSound(); onNavigate?.('kanban'); }}
                    style={{
                      padding: '0.85rem',
                      backgroundColor: '#161f33',
                      borderRadius: '6px',
                      border: '1px solid #222f47',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: proj.colorCode || '#6366f1' }} />
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                          {proj.name}
                        </h3>
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                        {percent}%
                      </span>
                    </div>

                    <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0 0 0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {proj.description || 'Core development pipeline'}
                    </p>

                    <div style={{ width: '100%', height: '4px', backgroundColor: '#0e1422', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.65rem' }}>
                      <div style={{ width: `${percent}%`, height: '100%', backgroundColor: proj.colorCode || '#6366f1', borderRadius: '2px' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b' }}>
                      <span>{completedCount}/{totalCount} tasks done</span>
                      <span>Active 14m ago</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Focus / Productivity, Team Activity, Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* 4. FOCUS / PRODUCTIVITY WIDGET */}
          <div style={{
            backgroundColor: '#111726',
            borderRadius: '8px',
            border: '1px solid #1f2b42',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '5px',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={14} />
                </div>
                <div>
                  <h2 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    Focus & Productivity
                  </h2>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    Today's focused time: 2h 45m
                  </span>
                </div>
              </div>

              {/* Timer preset toggles */}
              <div style={{ display: 'flex', backgroundColor: '#0e1422', padding: '2px', borderRadius: '4px', border: '1px solid #1f2b42' }}>
                <button
                  onClick={() => switchTimerMode(25)}
                  style={{
                    padding: '2px 6px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    borderRadius: '3px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: timerMode === 25 ? '#6366f1' : 'transparent',
                    color: timerMode === 25 ? '#fff' : '#64748b'
                  }}
                >
                  25m
                </button>
                <button
                  onClick={() => switchTimerMode(50)}
                  style={{
                    padding: '2px 6px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    borderRadius: '3px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: timerMode === 50 ? '#6366f1' : 'transparent',
                    color: timerMode === 50 ? '#fff' : '#64748b'
                  }}
                >
                  50m
                </button>
              </div>
            </div>

            {/* Pomodoro Timer Centerpiece */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.15rem',
              backgroundColor: '#0e1422',
              borderRadius: '6px',
              border: '1px solid #1f2b42'
            }}>
              <div>
                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: '#f8fafc',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em'
                }}>
                  {formatTimer(timerSeconds)}
                </div>
                <div style={{ fontSize: '0.68rem', color: isTimerRunning ? '#10b981' : '#64748b' }}>
                  {isTimerRunning ? '● Focus Session Active' : 'Ready to start focus'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <button
                  onClick={toggleTimer}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backgroundColor: isTimerRunning ? '#f59e0b' : '#6366f1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.785rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
                </button>

                <button
                  onClick={resetTimer}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#161f33',
                    color: '#94a3b8',
                    border: '1px solid #222f47',
                    borderRadius: '6px',
                    padding: '0.45rem',
                    cursor: 'pointer'
                  }}
                  title="Reset Timer"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Productivity Trend Chart */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Weekly Velocity
                </span>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                  +18% vs last week
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '6px',
                alignItems: 'flex-end',
                height: '70px',
                padding: '0.35rem 0.5rem',
                backgroundColor: '#161f33',
                borderRadius: '6px',
                border: '1px solid #222f47'
              }}>
                {productivityDays.map((d, i) => {
                  const barHeight = Math.min(100, Math.round((d.hours / 8) * 100));
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <div
                        style={{
                          width: '100%',
                          height: `${barHeight}%`,
                          backgroundColor: d.isToday ? '#6366f1' : '#24324f',
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 0.3s ease'
                        }}
                        title={`${d.day}: ${d.hours}h (${d.tasks} tasks)`}
                      />
                      <span style={{ fontSize: '0.62rem', color: d.isToday ? '#818cf8' : '#64748b', marginTop: '4px' }}>
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. TEAM ACTIVITY FEED */}
          <div style={{
            backgroundColor: '#111726',
            borderRadius: '8px',
            border: '1px solid #1f2b42',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '5px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={14} />
                </div>
                <div>
                  <h2 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    Team Activity
                  </h2>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    Real-time workspace events
                  </span>
                </div>
              </div>

              {/* Feed filter */}
              <div style={{ display: 'flex', backgroundColor: '#0e1422', padding: '2px', borderRadius: '4px', border: '1px solid #1f2b42' }}>
                {['ALL', 'COMMENTS', 'COMPLETED'].map((f) => (
                  <button
                    key={f}
                    onClick={() => { playClickSound(); setActivityTab(f); }}
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      borderRadius: '3px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: activityTab === f ? '#6366f1' : 'transparent',
                      color: activityTab === f ? '#fff' : '#64748b'
                    }}
                  >
                    {f.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Feed items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {teamActivities
                .filter((a) => activityTab === 'ALL' || a.type === activityTab)
                .slice(0, 4)
                .map((act) => (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.785rem' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: '#1e293b',
                      color: '#cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {act.avatar}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div>
                        <span style={{ fontWeight: 700, color: '#f1f5f9' }}>{act.actor}</span>{' '}
                        <span style={{ color: '#94a3b8' }}>{act.action}</span>{' '}
                        <span style={{ color: '#818cf8', fontWeight: 600 }}>{act.target}</span>
                      </div>
                      {act.commentText && (
                        <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontStyle: 'italic', margin: '2px 0 0' }}>
                          {act.commentText}
                        </div>
                      )}
                      <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{act.time}</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Quick Comment Composer */}
            <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '0.35rem', marginTop: '0.25rem' }}>
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Post sprint update to team feed..."
                style={{
                  backgroundColor: '#0e1422',
                  border: '1px solid #1f2b42',
                  borderRadius: '5px',
                  color: '#e2e8f0',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  flex: 1,
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#161f33',
                  color: '#818cf8',
                  border: '1px solid #24324f',
                  borderRadius: '5px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Post
              </button>
            </form>
          </div>

          {/* 6. QUICK ACTIONS */}
          <div style={{
            backgroundColor: '#111726',
            borderRadius: '8px',
            border: '1px solid #1f2b42',
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Quick Actions
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                onClick={() => { playClickSound(); onOpenCreateTask?.(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: '#161f33',
                  border: '1px solid #222f47',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <Plus size={14} color="#6366f1" />
                <span>New Task</span>
              </button>

              <button
                onClick={() => { playClickSound(); onOpenCreateProject?.(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: '#161f33',
                  border: '1px solid #222f47',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <Folder size={14} color="#38bdf8" />
                <span>New Project</span>
              </button>

              <button
                onClick={() => { playClickSound(); onNavigate?.('notes'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: '#161f33',
                  border: '1px solid #222f47',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <FileText size={14} color="#a855f7" />
                <span>Create Note</span>
              </button>

              <button
                onClick={toggleTimer}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: '#161f33',
                  border: '1px solid #222f47',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <Play size={14} color="#10b981" />
                <span>Start Focus</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
