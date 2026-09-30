import React, { useState, useEffect, useMemo } from 'react';
import {
  List,
  LayoutGrid,
  Calendar,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Download,
  CheckCircle2,
  Sparkles,
  Layers,
  X
} from 'lucide-react';
import TaskListView from './TaskListView';
import TaskKanbanView from './TaskKanbanView';
import TaskTimelineView from './TaskTimelineView';
import TaskDetailPanel from './TaskDetailPanel';
import { playClickSound } from '../utils/audioEffects';

export default function TaskWorkspace({
  tasks = [],
  projects = [],
  workspaceMembers = [],
  currentUser,
  activeWorkspace,
  onStatusChange,
  onUpdateTask,
  onDeleteTask,
  onCreateTask,
  onAddToast,
  onExportCSV
}) {
  // 1. Current View State: 'list' | 'kanban' | 'timeline'
  const [viewMode, setViewMode] = useState('kanban');

  // 2. Selected Task for Detail Panel
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 3. Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Global Keyboard Shortcuts (1: List, 2: Kanban, 3: Timeline, N/C: New Task, Esc: Close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === '1') {
        e.preventDefault();
        playClickSound();
        setViewMode('list');
      } else if (e.key === '2') {
        e.preventDefault();
        playClickSound();
        setViewMode('kanban');
      } else if (e.key === '3') {
        e.preventDefault();
        playClickSound();
        setViewMode('timeline');
      } else if ((e.key.toLowerCase() === 'n' || e.key.toLowerCase() === 'c') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleQuickCreate('TODO');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter & Sort Logic
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (Array.isArray(t.tags) && t.tags.some((tg) => tg.toLowerCase().includes(q)))
      );
    }

    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (priorityFilter) {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    if (projectFilter) {
      result = result.filter((t) => String(t.projectId) === String(projectFilter));
    }

    if (assigneeFilter) {
      result = result.filter((t) => t.assignee === assigneeFilter);
    }

    if (sortBy === 'dueDate') {
      result.sort((a, b) => new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31'));
    } else if (sortBy === 'priority') {
      const weights = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      result.sort((a, b) => (weights[b.priority] || 0) - (weights[a.priority] || 0));
    } else if (sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return result;
  }, [tasks, searchQuery, statusFilter, priorityFilter, projectFilter, assigneeFilter, sortBy]);

  // Open Detail Panel
  const handleOpenDetail = (task) => {
    playClickSound();
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  // Quick Create Task
  const handleQuickCreate = (initialStatus = 'TODO', initialTitle = '') => {
    playClickSound();
    const newTask = {
      title: initialTitle || 'New Deliverable',
      description: '',
      status: initialStatus,
      priority: 'MEDIUM',
      category: 'Frontend',
      assignee: currentUser?.name || 'Deepanshi Kaushal',
      dueDate: new Date().toISOString().split('T')[0],
      estimatedTime: '45m',
      projectId: projects[0]?.id || 1,
      workspaceId: activeWorkspace ? activeWorkspace.id : 1,
      tags: ['feature'],
      subtasks: [
        { id: `st-1-${Date.now()}`, title: 'Analyze requirements', completed: false }
      ],
      attachments: [],
      comments: [],
      activityHistory: [
        { id: `act-${Date.now()}`, user: currentUser?.name || 'Alex Rivera', action: 'created task', timestamp: 'Just now' }
      ]
    };

    onCreateTask?.(newTask);
    onAddToast?.('Created new task deliverable', 'success');
  };

  // Keep selectedTask updated if task state changes
  useEffect(() => {
    if (selectedTask) {
      const fresh = tasks.find((t) => String(t.id) === String(selectedTask.id));
      if (fresh) {
        setSelectedTask(fresh);
      }
    }
  }, [tasks, selectedTask]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      
      {/* Top Workspace Header & Views Switcher Toolbar */}
      <div style={{
        backgroundColor: '#111726',
        borderRadius: '8px',
        border: '1px solid #1f2b42',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Left: View Switcher Tabs (List, Kanban, Timeline) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            display: 'flex',
            backgroundColor: '#0c101a',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid #1f2b42'
          }}>
            {/* 1. LIST VIEW */}
            <button
              onClick={() => { playClickSound(); setViewMode('list'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'list' ? '#6366f1' : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : '#94a3b8',
                transition: 'all 0.12s'
              }}
              title="List View (Press 1)"
            >
              <List size={13} />
              <span>List</span>
              <kbd style={{ fontSize: '0.62rem', opacity: 0.6, marginLeft: '2px' }}>1</kbd>
            </button>

            {/* 2. KANBAN VIEW */}
            <button
              onClick={() => { playClickSound(); setViewMode('kanban'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'kanban' ? '#6366f1' : 'transparent',
                color: viewMode === 'kanban' ? '#ffffff' : '#94a3b8',
                transition: 'all 0.12s'
              }}
              title="Kanban Board (Press 2)"
            >
              <LayoutGrid size={13} />
              <span>Kanban</span>
              <kbd style={{ fontSize: '0.62rem', opacity: 0.6, marginLeft: '2px' }}>2</kbd>
            </button>

            {/* 3. TIMELINE VIEW */}
            <button
              onClick={() => { playClickSound(); setViewMode('timeline'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'timeline' ? '#6366f1' : 'transparent',
                color: viewMode === 'timeline' ? '#ffffff' : '#94a3b8',
                transition: 'all 0.12s'
              }}
              title="Roadmap Timeline (Press 3)"
            >
              <Calendar size={13} />
              <span>Timeline</span>
              <kbd style={{ fontSize: '0.62rem', opacity: 0.6, marginLeft: '2px' }}>3</kbd>
            </button>
          </div>

          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
            {filteredTasks.length} {filteredTasks.length === 1 ? 'deliverable' : 'deliverables'}
          </span>
        </div>

        {/* Right: Quick Search, Filters & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Quick Search */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={13} color="#64748b" style={{ position: 'absolute', left: '8px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              style={{
                padding: '0.35rem 0.65rem 0.35rem 1.75rem',
                fontSize: '0.75rem',
                backgroundColor: '#0c101a',
                color: '#f8fafc',
                border: '1px solid #1f2b42',
                borderRadius: '5px',
                outline: 'none',
                width: '140px',
                transition: 'width 0.15s, border-color 0.15s'
              }}
              onFocus={(e) => { e.target.style.width = '190px'; e.target.style.borderColor = '#6366f1'; }}
              onBlur={(e) => { if (!searchQuery) e.target.style.width = '140px'; e.target.style.borderColor = '#1f2b42'; }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '6px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.35rem 0.55rem',
              fontSize: '0.75rem',
              backgroundColor: '#0c101a',
              color: '#cbd5e1',
              border: '1px solid #1f2b42',
              borderRadius: '5px',
              outline: 'none'
            }}
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: '0.35rem 0.55rem',
              fontSize: '0.75rem',
              backgroundColor: '#0c101a',
              color: '#cbd5e1',
              border: '1px solid #1f2b42',
              borderRadius: '5px',
              outline: 'none'
            }}
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{
              padding: '0.35rem 0.55rem',
              fontSize: '0.75rem',
              backgroundColor: '#0c101a',
              color: '#cbd5e1',
              border: '1px solid #1f2b42',
              borderRadius: '5px',
              outline: 'none'
            }}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.35rem 0.55rem',
              fontSize: '0.75rem',
              backgroundColor: '#0c101a',
              color: '#cbd5e1',
              border: '1px solid #1f2b42',
              borderRadius: '5px',
              outline: 'none'
            }}
          >
            <option value="default">Default Order</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>

          {/* Export CSV */}
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                backgroundColor: '#0c101a',
                border: '1px solid #1f2b42',
                color: '#cbd5e1',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
              title="Export tasks to CSV"
            >
              <Download size={13} />
              <span className="desktop-only">CSV</span>
            </button>
          )}

          {/* New Task Button */}
          <button
            onClick={() => handleQuickCreate('TODO')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
            title="Create Task (C / N)"
          >
            <Plus size={13} />
            <span>New Task</span>
            <kbd style={{ fontSize: '0.62rem', opacity: 0.7, marginLeft: '2px' }}>N</kbd>
          </button>
        </div>
      </div>

      {/* Main Active View Presentation */}
      {viewMode === 'list' ? (
        <TaskListView
          tasks={filteredTasks}
          projects={projects}
          workspaceMembers={workspaceMembers}
          onStatusChange={onStatusChange}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onOpenDetail={handleOpenDetail}
          onOpenCreate={handleQuickCreate}
        />
      ) : viewMode === 'timeline' ? (
        <TaskTimelineView
          tasks={filteredTasks}
          projects={projects}
          onOpenDetail={handleOpenDetail}
          onUpdateTask={onUpdateTask}
          onOpenCreate={handleQuickCreate}
        />
      ) : (
        <TaskKanbanView
          tasks={filteredTasks}
          projects={projects}
          workspaceMembers={workspaceMembers}
          onStatusChange={onStatusChange}
          onOpenDetail={handleOpenDetail}
          onOpenCreate={handleQuickCreate}
        />
      )}

      {/* Slide-over Workspace Inside The Workspace Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onUpdateTask={(id, updated) => {
          onUpdateTask?.(id, updated);
          setSelectedTask(updated);
        }}
        onDeleteTask={onDeleteTask}
        projects={projects}
        workspaceMembers={workspaceMembers}
        allTasks={tasks}
        onAddToast={onAddToast}
        onSelectTask={(nextTask) => setSelectedTask(nextTask)}
      />

    </div>
  );
}
