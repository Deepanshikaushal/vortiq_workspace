import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MetricsOverview from './components/MetricsOverview';
import KanbanBoard from './components/KanbanBoard';
import TaskTable from './components/TaskTable';
import TaskModal from './components/TaskModal';
import Toast from './components/Toast';
import {
  fetchTasks,
  fetchTaskStats,
  fetchProjects,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  checkApiHealth
} from './services/api';

const DEMO_TASKS = [
  { id: 1, title: 'Design Glassmorphic UI Components', description: 'Create modern, translucent card components and custom scrollbars.', status: 'IN_PROGRESS', priority: 'HIGH', category: 'Frontend', assignee: 'Deepanshi Kaushal', dueDate: '2026-08-15', projectId: 1 },
  { id: 2, title: 'Implement Spring Boot REST APIs', description: 'Build Java REST controllers, JPA repositories, and CORS config.', status: 'COMPLETED', priority: 'URGENT', category: 'Backend', assignee: 'Sarah Chen', dueDate: '2026-08-12', projectId: 1 },
  { id: 3, title: 'Configure H2 Database Auto-schema', description: 'Ensure in-memory entity tables are properly mapped with Hibernate.', status: 'COMPLETED', priority: 'MEDIUM', category: 'Database', assignee: 'Sarah Chen', dueDate: '2026-08-10', projectId: 1 },
  { id: 4, title: 'Integrate Real-Time Status Filter', description: 'Add debounced search input and status dropdown on React grid.', status: 'TODO', priority: 'MEDIUM', category: 'Frontend', assignee: 'Deepanshi Kaushal', dueDate: '2026-08-18', projectId: 1 },
  { id: 5, title: 'Setup Docker Pipeline', description: 'Write Dockerfiles for Spring Boot jar and Vite build.', status: 'IN_REVIEW', priority: 'HIGH', category: 'DevOps', assignee: 'Marcus Vance', dueDate: '2026-08-14', projectId: 3 }
];

const DEMO_PROJECTS = [
  { id: 1, name: 'Core Platform', description: 'Main web application', colorCode: '#06b6d4' },
  { id: 2, name: 'Mobile Companion', description: 'iOS & Android app', colorCode: '#10b981' },
  { id: 3, name: 'Cloud Infrastructure', description: 'K8s & deployment pipeline', colorCode: '#f59e0b' }
];

export default function App() {
  const [activeView, setActiveView] = useState('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [theme, setTheme] = useState('dark');

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, inReview: 0, completed: 0, completionRate: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Toast notification helper
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard shortcut Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector('input[placeholder*="Search"]');
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const calculateLocalStats = (taskList) => {
    const total = taskList.length;
    const todo = taskList.filter((t) => t.status === 'TODO').length;
    const inProgress = taskList.filter((t) => t.status === 'IN_PROGRESS').length;
    const inReview = taskList.filter((t) => t.status === 'IN_REVIEW').length;
    const completed = taskList.filter((t) => t.status === 'COMPLETED').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, todo, inProgress, inReview, completed, completionRate };
  };

  // Load API Data
  const loadData = useCallback(async () => {
    const isAlive = await checkApiHealth();
    setIsConnected(isAlive);

    if (isAlive) {
      try {
        const fetchedTasks = await fetchTasks({
          status: statusFilter || null,
          priority: priorityFilter || null,
          search: searchQuery || null
        });
        const fetchedStats = await fetchTaskStats();
        const fetchedProjects = await fetchProjects();

        let filtered = fetchedTasks;
        if (categoryFilter) filtered = filtered.filter((t) => t.category === categoryFilter);
        if (selectedProject) filtered = filtered.filter((t) => String(t.projectId) === String(selectedProject));

        setTasks(filtered);
        setStats(fetchedStats);
        setProjects(fetchedProjects.length > 0 ? fetchedProjects : DEMO_PROJECTS);
      } catch (err) {
        console.warn('API error, falling back to local state:', err);
      }
    } else {
      let filtered = [...DEMO_TASKS];
      if (statusFilter) filtered = filtered.filter((t) => t.status === statusFilter);
      if (priorityFilter) filtered = filtered.filter((t) => t.priority === priorityFilter);
      if (categoryFilter) filtered = filtered.filter((t) => t.category === categoryFilter);
      if (selectedProject) filtered = filtered.filter((t) => String(t.projectId) === String(selectedProject));
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.description && t.description.toLowerCase().includes(q)) ||
            (t.category && t.category.toLowerCase().includes(q))
        );
      }
      setTasks(filtered);
      setProjects(DEMO_PROJECTS);
      setStats(calculateLocalStats(filtered));
    }
  }, [statusFilter, priorityFilter, categoryFilter, selectedProject, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleOpenCreate = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (formData) => {
    setIsModalOpen(false);
    if (isConnected) {
      try {
        if (taskToEdit) {
          await updateTask(taskToEdit.id, formData);
          addToast(`Updated task "${formData.title}"`, 'success');
        } else {
          await createTask(formData);
          addToast(`Created task "${formData.title}"`, 'success');
        }
        await loadData();
      } catch (err) {
        addToast('Failed to save task to Spring Boot API', 'danger');
      }
    } else {
      if (taskToEdit) {
        setTasks((prev) => prev.map((t) => (t.id === taskToEdit.id ? { ...t, ...formData } : t)));
        addToast(`Updated task "${formData.title}"`, 'info');
      } else {
        const newTask = { ...formData, id: Date.now() };
        setTasks((prev) => [newTask, ...prev]);
        addToast(`Created task "${formData.title}"`, 'success');
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    if (isConnected) {
      try {
        await updateTaskStatus(taskId, newStatus);
        addToast(`Task status changed to ${newStatus.replace('_', ' ')}`, 'info');
        await loadData();
      } catch (err) {
        addToast('Failed to update task status', 'danger');
      }
    } else {
      setTasks((prev) => {
        const updated = prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
        setStats(calculateLocalStats(updated));
        return updated;
      });
      addToast(`Status updated`, 'info');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    if (isConnected) {
      try {
        await deleteTask(taskId);
        addToast('Task deleted successfully', 'danger');
        await loadData();
      } catch (err) {
        addToast('Failed to delete task', 'danger');
      }
    } else {
      setTasks((prev) => {
        const updated = prev.filter((t) => t.id !== taskId);
        setStats(calculateLocalStats(updated));
        return updated;
      });
      addToast('Task deleted', 'danger');
    }
  };

  return (
    <div className="vortiq-layout">
      {/* Toast Alert System */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Left Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        onOpenCreateModal={handleOpenCreate}
        taskCount={tasks.length}
      />

      {/* Main Content Area */}
      <div className="content-wrapper">
        
        {/* Top Navbar Header */}
        <Navbar
          activeView={activeView}
          setActiveView={setActiveView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
          setTheme={setTheme}
          isConnected={isConnected}
          onCheckApi={loadData}
          taskCount={tasks.length}
        />

        {/* Page Inner Container */}
        <main className="main-container">
          
          {/* Metrics Overview Top Bar */}
          <MetricsOverview stats={stats} />

          {/* Quick Filter Control Toolbar */}
          <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: '800', color: 'var(--text-muted)' }}>Filter View:</span>
              
              <select
                className="form-select"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select
                className="form-select"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>

              <select
                className="form-select"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="DevOps">DevOps</option>
                <option value="Design">Design</option>
                <option value="Database">Database</option>
              </select>

              {(statusFilter || priorityFilter || categoryFilter || selectedProject || searchQuery) && (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.785rem' }}
                  onClick={() => {
                    setStatusFilter('');
                    setPriorityFilter('');
                    setCategoryFilter('');
                    setSelectedProject('');
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', fontWeight: '700' }}>
              Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </div>
          </div>

          {/* View Components */}
          {activeView === 'kanban' ? (
            <KanbanBoard
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteTask}
            />
          ) : (
            <TaskTable
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteTask}
            />
          )}

        </main>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        projects={projects}
      />
    </div>
  );
}
