import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MetricsOverview from './components/MetricsOverview';
import KanbanBoard from './components/KanbanBoard';
import TaskTable from './components/TaskTable';
import TaskModal from './components/TaskModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import WorkspaceModal from './components/WorkspaceModal';
import ShortcutsModal from './components/ShortcutsModal';
import Toast from './components/Toast';
import { Download, Plus, ArrowUpDown, Keyboard, HelpCircle } from 'lucide-react';
import {
  fetchTasks,
  fetchTaskStats,
  fetchProjects,
  fetchWorkspaces,
  fetchWorkspaceMembers,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  checkApiHealth,
  getCurrentUser,
  logout
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

const DEMO_WORKSPACES = [
  { id: 1, name: 'VortiQ Studio Workspace', description: 'Enterprise collaboration workspace', colorCode: '#6366f1', currentUserRole: 'OWNER' }
];

export default function App() {
  const [activeView, setActiveView] = useState('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [theme, setTheme] = useState('dark');

  const [currentUser, setCurrentUser] = useState(null);
  const [workspaces, setWorkspaces] = useState(DEMO_WORKSPACES);
  const [activeWorkspace, setActiveWorkspace] = useState(DEMO_WORKSPACES[0]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, inReview: 0, completed: 0, completionRate: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.querySelector('input[placeholder*="Search"]');
        if (input) input.focus();
      } else if (e.key === '?' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        setIsShortcutsModalOpen(prev => !prev);
      } else if (e.key.toLowerCase() === 'n' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        setTaskToEdit(null);
        setIsModalOpen(true);
      } else if (e.key.toLowerCase() === 'v' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        setActiveView(prev => (prev === 'kanban' ? 'table' : 'kanban'));
      } else if (e.key.toLowerCase() === 'd' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!tasks || tasks.length === 0) {
      addToast('No tasks available to export', 'info');
      return;
    }
    const headers = ['ID', 'Title', 'Status', 'Priority', 'Category', 'Assignee', 'Due Date'];
    const rows = tasks.map(t => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.category || '',
      `"${(t.assignee || '').replace(/"/g, '""')}"`,
      t.dueDate || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VortiQ_Tasks_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Exported tasks to CSV file', 'success');
  };

  // Initial user authentication check
  useEffect(() => {
    async function initUser() {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    }
    initUser();
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
        let wsList = await fetchWorkspaces();
        if (wsList && wsList.length > 0) {
          setWorkspaces(wsList);
          if (!activeWorkspace || !wsList.some(w => w.id === activeWorkspace.id)) {
            setActiveWorkspace(wsList[0]);
          }
        }

        const wsId = activeWorkspace ? activeWorkspace.id : null;
        if (wsId) {
          fetchWorkspaceMembers(wsId).then(setWorkspaceMembers).catch(() => {});
        }

        const fetchedTasks = await fetchTasks({
          workspaceId: wsId,
          status: statusFilter || null,
          priority: priorityFilter || null,
          search: searchQuery || null
        });
        const fetchedStats = await fetchTaskStats(wsId);
        const fetchedProjects = await fetchProjects(wsId);

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
  }, [statusFilter, priorityFilter, categoryFilter, selectedProject, searchQuery, activeWorkspace]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auth Handlers
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    addToast(`Signed in as ${user.name || user.username}`, 'success');
    loadData();
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    addToast('Signed out successfully', 'info');
    loadData();
  };

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
    const payload = {
      ...formData,
      workspaceId: activeWorkspace ? activeWorkspace.id : null
    };

    if (isConnected) {
      try {
        if (taskToEdit) {
          await updateTask(taskToEdit.id, payload);
          addToast(`Updated task "${formData.title}"`, 'success');
        } else {
          await createTask(payload);
          addToast(`Created task "${formData.title}"`, 'success');
        }
        await loadData();
      } catch (err) {
        addToast('Failed to save task to Spring Boot API', 'danger');
      }
    } else {
      if (taskToEdit) {
        setTasks((prev) => prev.map((t) => (t.id === taskToEdit.id ? { ...t, ...payload } : t)));
        addToast(`Updated task "${formData.title}"`, 'info');
      } else {
        const newTask = { ...payload, id: Date.now() };
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

  const sortedTasks = useMemo(() => {
    let list = [...tasks];
    if (sortBy === 'dueDate') {
      list.sort((a, b) => new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31'));
    } else if (sortBy === 'priority') {
      const pOrder = { URGENT: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
      list.sort((a, b) => (pOrder[a.priority] || 5) - (pOrder[b.priority] || 5));
    } else if (sortBy === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    return list;
  }, [tasks, sortBy]);

  return (
    <div className="vortiq-layout">
      {/* Toast Alert System */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Left Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          setIsMobileMenuOpen(false);
        }}
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={(pId) => {
          setSelectedProject(pId);
          setIsMobileMenuOpen(false);
        }}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={(ws) => {
          setActiveWorkspace(ws);
          setIsMobileMenuOpen(false);
        }}
        onOpenWorkspaceModal={() => {
          setIsWorkspaceModalOpen(true);
          setIsMobileMenuOpen(false);
        }}
        onOpenProfileModal={() => {
          setIsProfileModalOpen(true);
          setIsMobileMenuOpen(false);
        }}
        onOpenCreateModal={() => {
          handleOpenCreate();
          setIsMobileMenuOpen(false);
        }}
        currentUser={currentUser}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
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
          currentUser={currentUser}
          activeWorkspace={activeWorkspace}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Page Inner Container */}
        <main className="main-container">
          
          {/* Metrics Overview Top Bar */}
          <MetricsOverview stats={stats} />

          {/* Quick Filter Control Toolbar */}
          <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: '800', color: 'var(--text-muted)' }}>Filter & Tools:</span>
              
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
                <option value="Security">Security</option>
                <option value="Mobile">Mobile</option>
              </select>

              <select
                className="form-select"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Sort: Default</option>
                <option value="dueDate">Sort: Due Date</option>
                <option value="priority">Sort: Priority</option>
                <option value="title">Sort: Title (A-Z)</option>
              </select>

              <button
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.785rem', gap: '0.35rem' }}
                onClick={handleExportCSV}
                title="Export tasks to CSV file"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>

              <button
                className="btn btn-secondary btn-icon"
                style={{ padding: '0.4rem' }}
                onClick={() => setIsShortcutsModalOpen(true)}
                title="Keyboard Shortcuts (?)"
              >
                <HelpCircle size={16} />
              </button>

              {(statusFilter || priorityFilter || categoryFilter || selectedProject || searchQuery || sortBy !== 'default') && (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.785rem' }}
                  onClick={() => {
                    setStatusFilter('');
                    setPriorityFilter('');
                    setCategoryFilter('');
                    setSelectedProject('');
                    setSearchQuery('');
                    setSortBy('default');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', fontWeight: '700' }}>
              Showing {sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'}
            </div>
          </div>

          {/* View Components */}
          {activeView === 'kanban' ? (
            <KanbanBoard
              tasks={sortedTasks}
              onStatusChange={handleStatusChange}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteTask}
            />
          ) : (
            <TaskTable
              tasks={sortedTasks}
              onStatusChange={handleStatusChange}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteTask}
            />
          )}

        </main>
      </div>

      {/* Mobile Floating Action Button */}
      <button
        className="btn btn-gradient mobile-only"
        onClick={handleOpenCreate}
        style={{
          position: 'fixed',
          bottom: '1.75rem',
          right: '1.5rem',
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          zIndex: 80,
          boxShadow: '0 8px 25px rgba(225, 29, 72, 0.6)',
          padding: 0,
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Create Task"
      >
        <Plus size={24} />
      </button>

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        projects={projects}
        workspaceMembers={workspaceMembers}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Profile Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={(updated) => {
          setCurrentUser(updated);
          addToast('Profile details updated', 'success');
        }}
      />

      {/* Workspace Collaboration Modal */}
      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        activeWorkspace={activeWorkspace}
        onWorkspaceCreated={(newWs) => {
          setWorkspaces((prev) => [...prev, newWs]);
          setActiveWorkspace(newWs);
          addToast(`Created workspace "${newWs.name}"`, 'success');
          loadData();
        }}
        onWorkspaceUpdated={(updatedWs) => {
          setWorkspaces((prev) => prev.map((w) => (w.id === updatedWs.id ? updatedWs : w)));
          setActiveWorkspace(updatedWs);
          addToast(`Updated workspace "${updatedWs.name}"`, 'success');
          loadData();
        }}
        onWorkspaceDeleted={(deletedId) => {
          setWorkspaces((prev) => prev.filter((w) => w.id !== deletedId));
          addToast('Workspace deleted', 'danger');
          loadData();
        }}
      />
    </div>
  );
}
