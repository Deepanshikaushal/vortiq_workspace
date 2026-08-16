import React, { useState, useEffect, useCallback, useMemo } from 'react';
import HomePage from './components/HomePage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MetricsOverview from './components/MetricsOverview';
import KanbanBoard from './components/KanbanBoard';
import TaskTable from './components/TaskTable';
import TaskModal from './components/TaskModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import WorkspaceModal from './components/WorkspaceModal';
import WorkspaceChatModal from './components/WorkspaceChatModal';
import TeamLounge from './components/TeamLounge';
import ShortcutsModal from './components/ShortcutsModal';
import Toast from './components/Toast';
import { Download, Plus, ArrowUpDown, Keyboard, HelpCircle, PanelLeftOpen, Maximize2, MessageSquare } from 'lucide-react';
import {
  fetchTasks,
  fetchTaskStats,
  fetchProjects,
  createProject,
  fetchWorkspaces,
  fetchWorkspaceMembers,
  fetchMessages,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  checkApiHealth,
  getCurrentUser,
  logout
} from './services/api';

const DEMO_PROJECTS = [
  { id: 1, name: 'Core Platform', description: 'Main web application', colorCode: '#06b6d4', workspaceId: 1 },
  { id: 2, name: 'Mobile Companion', description: 'iOS & Android app', colorCode: '#10b981', workspaceId: 1 },
  { id: 3, name: 'Cloud Infrastructure', description: 'K8s & deployment pipeline', colorCode: '#f59e0b', workspaceId: 1 }
];

const DEMO_WORKSPACES = [
  { id: 1, name: 'VortiQ Studio Workspace', description: 'Enterprise collaboration workspace', colorCode: '#e11d48', currentUserRole: 'OWNER' }
];

export default function App() {
  const [pageView, setPageView] = useState('home'); // 'home' | 'app'
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
  const [projects, setProjects] = useState(DEMO_PROJECTS);
  const [messages, setMessages] = useState([]);
  const [inconvenienceCount, setInconvenienceCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, inReview: 0, completed: 0, completionRate: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Sidebar & Layout Controls
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskInitialStatus, setTaskInitialStatus] = useState('TODO');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Team & Inconvenience Chat Modal State
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatInitialTask, setChatInitialTask] = useState(null);
  const [chatInitialType, setChatInitialType] = useState('INCONVENIENCE');

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
        setTaskInitialStatus('TODO');
        setIsModalOpen(true);
      } else if (e.key.toLowerCase() === 'm' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        handleOpenChat(null, 'INCONVENIENCE');
      } else if (e.key.toLowerCase() === 'w' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        setIsWorkspaceModalOpen(prev => !prev);
      } else if (e.key.toLowerCase() === 'v' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        setActiveView(prev => (prev === 'kanban' ? 'table' : prev === 'table' ? 'lounge' : 'kanban'));
      } else if (e.key.toLowerCase() === 'd' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
      } else if (e.key.toLowerCase() === 'b' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!tasks || tasks.length === 0) {
      addToast('No tasks available to export in current workspace', 'info');
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
    link.setAttribute('download', `${(activeWorkspace?.name || 'VortiQ').replace(/\s+/g, '_')}_Tasks_${new Date().toISOString().split('T')[0]}.csv`);
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
        setPageView('app');
      }
    }
    initUser();
  }, []);

  // Load API Data
  const loadData = useCallback(async () => {
    const isAlive = await checkApiHealth();
    setIsConnected(isAlive);

    try {
      let wsList = await fetchWorkspaces();
      if (Array.isArray(wsList) && wsList.length > 0) {
        setWorkspaces(wsList);
        if (!activeWorkspace || !wsList.some(w => w?.id === activeWorkspace?.id)) {
          setActiveWorkspace(wsList[0]);
        }
      }

      const wsId = activeWorkspace?.id || 1;
      if (wsId) {
        fetchWorkspaceMembers(wsId).then(data => {
          setWorkspaceMembers(Array.isArray(data) ? data : []);
        }).catch(() => {});

        fetchMessages(wsId).then(msgs => {
          const safeMsgs = Array.isArray(msgs) ? msgs : [];
          setMessages(safeMsgs);
          const incCount = safeMsgs.filter(m => m?.messageType === 'INCONVENIENCE' || m?.messageType === 'URGENT').length;
          setInconvenienceCount(incCount);
        }).catch(() => {});
      }

      const fetchedTasks = await fetchTasks({
        workspaceId: wsId,
        status: statusFilter || null,
        priority: priorityFilter || null,
        search: searchQuery || null
      });
      const safeTasks = Array.isArray(fetchedTasks) ? fetchedTasks : [];
      const fetchedStats = await fetchTaskStats(wsId);
      const fetchedProjects = await fetchProjects(wsId);

      let filtered = safeTasks;
      if (categoryFilter) filtered = filtered.filter((t) => t?.category === categoryFilter);
      if (selectedProject) filtered = filtered.filter((t) => String(t?.projectId) === String(selectedProject));

      setTasks(filtered);
      setStats(fetchedStats && typeof fetchedStats === 'object' ? fetchedStats : { total: 0, todo: 0, inProgress: 0, inReview: 0, completed: 0, completionRate: 0 });
      setProjects(Array.isArray(fetchedProjects) && fetchedProjects.length > 0 ? fetchedProjects : DEMO_PROJECTS);
    } catch (err) {
      console.warn('Error loading data:', err);
    }
  }, [statusFilter, priorityFilter, categoryFilter, selectedProject, searchQuery, activeWorkspace]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auth Handlers
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setPageView('app');
    addToast(`Signed in successfully as ${user.name || user.username}!`, 'success');
    loadData();
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setPageView('home');
    addToast('Signed out successfully', 'info');
    loadData();
  };

  // Task & Project Actions
  const handleOpenCreate = (initialStatus = 'TODO') => {
    setTaskToEdit(null);
    setTaskInitialStatus(initialStatus);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleOpenChat = (task = null, type = 'INCONVENIENCE') => {
    setChatInitialTask(task);
    setChatInitialType(type);
    setIsChatModalOpen(true);
  };

  const handleSaveTask = async (formData) => {
    setIsModalOpen(false);
    const payload = {
      ...formData,
      workspaceId: activeWorkspace ? activeWorkspace.id : 1
    };

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
      addToast('Failed to save task', 'danger');
    }
  };

  const handleCreateProject = async (projectName) => {
    try {
      const newProj = await createProject({
        name: projectName,
        workspaceId: activeWorkspace ? activeWorkspace.id : 1,
        colorCode: '#e11d48'
      });
      addToast(`Created project "${projectName}"!`, 'success');
      await loadData();
      return newProj;
    } catch (err) {
      addToast('Failed to create project', 'danger');
      return null;
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      addToast(`Task moved to ${newStatus.replace('_', ' ')}`, 'info');
      await loadData();
    } catch (err) {
      addToast('Failed to update task status', 'danger');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      addToast('Task deleted successfully', 'danger');
      await loadData();
    } catch (err) {
      addToast('Failed to delete task', 'danger');
    }
  };

  // Workspace Actions
  const handleWorkspaceCreated = (newWs) => {
    setWorkspaces((prev) => [...prev, newWs]);
    setActiveWorkspace(newWs);
    setSelectedProject('');
    addToast(`Launched workspace "${newWs.name}"!`, 'success');
    loadData();
  };

  const handleWorkspaceUpdated = (updatedWs) => {
    setWorkspaces((prev) => prev.map((w) => (w.id === updatedWs.id ? updatedWs : w)));
    setActiveWorkspace(updatedWs);
    addToast(`Updated workspace "${updatedWs.name}"`, 'success');
    loadData();
  };

  const handleWorkspaceDeleted = (deletedId) => {
    setWorkspaces((prev) => {
      const remaining = prev.filter((w) => w.id !== deletedId);
      if (remaining.length > 0) {
        setActiveWorkspace(remaining[0]);
      }
      return remaining;
    });
    addToast('Workspace deleted', 'danger');
    loadData();
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

      {/* Conditionally Render Home Landing Page or Main Workspace Dashboard */}
      {pageView === 'home' ? (
        <HomePage
          onOpenAuth={(mode = 'login') => {
            setAuthInitialMode(mode);
            setIsAuthModalOpen(true);
          }}
          onOpenSignUp={() => {
            setAuthInitialMode('register');
            setIsAuthModalOpen(true);
          }}
          onEnterApp={() => setPageView('app')}
          currentUser={currentUser}
        />
      ) : (
        <>
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
              setSelectedProject('');
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
            onOpenAuthModal={() => {
              setAuthInitialMode('login');
              setIsAuthModalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            onOpenCreateModal={() => {
              handleOpenCreate('TODO');
              setIsMobileMenuOpen(false);
            }}
            onCreateProject={handleCreateProject}
            onOpenChatModal={() => {
              handleOpenChat(null, 'INCONVENIENCE');
              setIsMobileMenuOpen(false);
            }}
            inconvenienceCount={inconvenienceCount}
            currentUser={currentUser}
            isMobileMenuOpen={isMobileMenuOpen}
            onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
            onGoHome={() => setPageView('home')}
            onExportCSV={handleExportCSV}
            onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />

          {/* Main Content Area (Full Screen Responsive Canvas) */}
          <div className={`content-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            
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
              workspaces={workspaces}
              activeWorkspace={activeWorkspace}
              onSelectWorkspace={(ws) => {
                setActiveWorkspace(ws);
                setSelectedProject('');
              }}
              onOpenAuthModal={() => {
                setAuthInitialMode('login');
                setIsAuthModalOpen(true);
              }}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
              onOpenCreateModal={() => handleOpenCreate('TODO')}
              onOpenChatModal={() => handleOpenChat(null, 'INCONVENIENCE')}
              inconvenienceCount={inconvenienceCount}
              onLogout={handleLogout}
              onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              onGoHome={() => setPageView('home')}
              onExportCSV={handleExportCSV}
              onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Page Inner Container (100% Full Viewport Width) */}
            <main className="main-container">
              
              {/* Metrics Overview Top Bar */}
              <MetricsOverview stats={stats} />

              {/* Quick Filter Control Toolbar (Only for Kanban & Matrix views) */}
              {activeView !== 'lounge' && (
                <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: '800', color: 'var(--text-muted)' }}>Filters:</span>
                    
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
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                    >
                      <option value="">All Projects</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', fontWeight: '700' }}>
                      Showing {sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'}
                    </div>

                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem', color: '#f59e0b' }}
                      onClick={() => handleOpenChat(null, 'INCONVENIENCE')}
                    >
                      <MessageSquare size={14} />
                      <span>Team Chat</span>
                    </button>

                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', gap: '0.35rem' }}
                      onClick={() => handleOpenCreate('TODO')}
                    >
                      <Plus size={14} />
                      <span>New Task</span>
                    </button>
                  </div>
                </div>
              )}

              {/* View Components (Kanban / Matrix / Team Lounge) */}
              {activeView === 'kanban' ? (
                <KanbanBoard
                  tasks={sortedTasks}
                  onStatusChange={handleStatusChange}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteTask}
                  onOpenCreate={handleOpenCreate}
                  onReportInconvenience={(task) => handleOpenChat(task, 'INCONVENIENCE')}
                  workspaceMembers={workspaceMembers}
                />
              ) : activeView === 'table' ? (
                <TaskTable
                  tasks={sortedTasks}
                  onStatusChange={handleStatusChange}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteTask}
                  onReportInconvenience={(task) => handleOpenChat(task, 'INCONVENIENCE')}
                  workspaceMembers={workspaceMembers}
                />
              ) : (
                <TeamLounge
                  activeWorkspace={activeWorkspace}
                  currentUser={currentUser}
                  onAddToast={addToast}
                />
              )}

            </main>
          </div>

          {/* Mobile Floating Action Button */}
          <button
            className="btn btn-gradient mobile-only"
            onClick={() => handleOpenCreate('TODO')}
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
        </>
      )}

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
        initialStatus={taskInitialStatus}
        projects={projects}
        workspaceMembers={workspaceMembers}
        onCreateProject={handleCreateProject}
      />

      {/* Team Messaging & Inconvenience Support Modal */}
      <WorkspaceChatModal
        isOpen={isChatModalOpen}
        onClose={() => {
          setIsChatModalOpen(false);
          setChatInitialTask(null);
        }}
        activeWorkspace={activeWorkspace}
        currentUser={currentUser}
        tasks={tasks}
        workspaceMembers={workspaceMembers}
        initialTask={chatInitialTask}
        initialType={chatInitialType}
      />

      {/* Authentication Modal with OTP Flow */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authInitialMode}
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
        workspaces={workspaces}
        onSelectWorkspace={(ws) => {
          setActiveWorkspace(ws);
          setSelectedProject('');
          addToast(`Switched to workspace "${ws.name}"`, 'info');
        }}
        onWorkspaceCreated={handleWorkspaceCreated}
        onWorkspaceUpdated={handleWorkspaceUpdated}
        onWorkspaceDeleted={handleWorkspaceDeleted}
      />
    </div>
  );
}
