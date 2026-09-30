import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import WorkspaceDashboard from './components/WorkspaceDashboard';
import CommandCenter from './components/CommandCenter';
import CommandPalette from './components/CommandPalette';
import FlowIntelligencePanel from './components/FlowIntelligencePanel';
import CalendarView from './components/CalendarView';
import NotesView from './components/NotesView';
import AutomationsView from './components/AutomationsView';
import InboxView from './components/InboxView';
import DocumentVaultView from './components/DocumentVaultView';
import MetricsOverview from './components/MetricsOverview';
import TaskWorkspace from './components/TaskWorkspace';
import ProjectWorkspaceView from './components/ProjectWorkspaceView';
import KanbanBoard from './components/KanbanBoard';
import TaskTable from './components/TaskTable';
import TaskModal from './components/TaskModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import WorkspaceModal from './components/WorkspaceModal';
import WorkspaceChatModal from './components/WorkspaceChatModal';
import TeamLounge from './components/TeamLounge';
import MembersDirectory from './components/MembersDirectory';
import ShortcutsModal from './components/ShortcutsModal';
import AiAssistantModal from './components/AiAssistantModal';
import AiBotWidget from './components/AiBotWidget';
import AiAnalyticsDashboard from './components/AiAnalyticsDashboard';
import NotificationsDrawer from './components/NotificationsDrawer';
import Toast from './components/Toast';
import BackendConsoleView from './components/BackendConsoleView';
import RoleGuard from './components/RoleGuard';
import { Download, Plus, ArrowUpDown, Keyboard, HelpCircle, PanelLeftOpen, Maximize2, MessageSquare, Sparkles } from 'lucide-react';
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
  { id: 1, name: 'Core Platform', description: 'Main web application', colorCode: '#6366f1', workspaceId: 1 },
  { id: 2, name: 'Mobile Companion', description: 'iOS & Android app', colorCode: '#10b981', workspaceId: 1 },
  { id: 3, name: 'Cloud Infrastructure', description: 'K8s & deployment pipeline', colorCode: '#f59e0b', workspaceId: 1 }
];

const DEMO_WORKSPACES = [
  { id: 1, name: 'Flowvia Studio Workspace', description: 'Enterprise collaboration workspace', colorCode: '#6366f1', currentUserRole: 'OWNER' }
];

export default function App() {
  const [activeView, setActiveView] = useState('focus'); // 'focus' | 'inbox' | 'my-tasks' | 'tasks' | 'kanban' | 'table' | 'calendar' | 'notes' | 'files' | 'team' | 'lounge' | 'analytics' | 'automations' | 'backend-console'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [theme, setTheme] = useState('dark');

  const [currentUser, setCurrentUser] = useState(null);
  const [taskScopeFilter, setTaskScopeFilter] = useState('AUTO');

  const userRole = (currentUser?.role || 'ROLE_MEMBER').toUpperCase();
  const isAdmin = userRole.includes('ADMIN');
  const isOwner = userRole.includes('OWNER');
  const isMember = !isAdmin && !isOwner;

  const isScopingToMyTasks = taskScopeFilter === 'ASSIGNED_TO_ME' || (taskScopeFilter === 'AUTO' && isMember);
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

  // Command Palette State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Flow Intelligence Drawer State
  const [isFlowIntelligenceOpen, setIsFlowIntelligenceOpen] = useState(false);

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskInitialStatus, setTaskInitialStatus] = useState('TODO');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      } else if (e.key === '?' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'n' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        setTaskToEdit(null);
        setTaskInitialStatus('TODO');
        setIsModalOpen(true);
      } else if (e.key.toLowerCase() === 'p' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        setIsWorkspaceModalOpen(true);
      } else if (e.key.toLowerCase() === 'd' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') ||
        (e.key.toLowerCase() === 'i' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName))
      ) {
        e.preventDefault();
        setIsFlowIntelligenceOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsFlowIntelligenceOpen(false);
        setIsCommandPaletteOpen(false);
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
    const rows = tasks.map((t) => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.category || '',
      `"${(t.assignee || '').replace(/"/g, '""')}"`,
      t.dueDate || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(activeWorkspace?.name || 'Flowvia').replace(/\s+/g, '_')}_Tasks_${new Date().toISOString().split('T')[0]}.csv`);
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
      } else {
        setCurrentUser({
          id: 1,
          username: 'deepanshi',
          name: 'Deepanshi Kaushal',
          email: 'deepanshi@vortiq.com',
          role: 'OWNER',
          department: 'Engineering Lead'
        });
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
        if (!activeWorkspace || !wsList.some((w) => w?.id === activeWorkspace?.id)) {
          setActiveWorkspace(wsList[0]);
        }
      }

      const wsId = activeWorkspace?.id || 1;
      if (wsId) {
        fetchWorkspaceMembers(wsId).then((data) => {
          setWorkspaceMembers(Array.isArray(data) ? data : []);
        }).catch(() => {});

        fetchMessages(wsId).then((msgs) => {
          const safeMsgs = Array.isArray(msgs) ? msgs : [];
          setMessages(safeMsgs);
          const incCount = safeMsgs.filter((m) => m?.messageType === 'INCONVENIENCE' || m?.messageType === 'URGENT').length;
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
    const uRole = (user?.role || '').toUpperCase();
    if (uRole.includes('ADMIN')) {
      setActiveView('backend-console');
      setTaskScopeFilter('ALL_TASKS');
    } else {
      setActiveView('focus');
      setTaskScopeFilter('AUTO');
    }
    addToast(`Signed in as ${user.name || user.username}!`, 'success');
    loadData();
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setIsAuthModalOpen(true);
    addToast('Signed out of Flowvia', 'info');
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
        colorCode: '#6366f1'
      });
      addToast(`Created project "${projectName}"!`, 'success');
      await loadData();
      return newProj;
    } catch (err) {
      addToast('Failed to create project', 'danger');
      return null;
    }
  };

  const handleAddTasksBatch = async (batchTasks) => {
    try {
      for (const item of batchTasks) {
        const payload = {
          title: item.title,
          description: item.description || '',
          status: item.status || 'TODO',
          priority: item.priority || 'MEDIUM',
          category: item.category || 'Frontend',
          dueDate: item.dueDate || new Date().toISOString().split('T')[0],
          projectId: selectedProject || (projects[0]?.id || 1),
          workspaceId: activeWorkspace ? activeWorkspace.id : 1
        };
        await createTask(payload);
      }
      await loadData();
    } catch (e) {
      addToast('Error adding generated tasks', 'danger');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks((prev) => prev.map((t) => (String(t.id) === String(taskId) ? { ...t, status: newStatus } : t)));
    try {
      await updateTaskStatus(taskId, newStatus);
      addToast(`Task moved to ${newStatus.replace('_', ' ')}`, 'info');
      await loadData();
    } catch (err) {
      addToast('Failed to update task status', 'danger');
    }
  };

  const handleUpdateTaskDirect = async (taskId, updatedTask) => {
    setTasks((prev) => prev.map((t) => (String(t.id) === String(taskId) ? { ...t, ...updatedTask } : t)));
    try {
      await updateTask(taskId, updatedTask);
    } catch (err) {
      console.warn('Failed to save task update:', err);
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

  const scopedTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    if (!isScopingToMyTasks && activeView !== 'my-tasks') return tasks;

    const myName = (currentUser?.name || '').trim().toLowerCase();
    const myUsername = (currentUser?.username || '').trim().toLowerCase();
    const myEmail = (currentUser?.email || '').trim().toLowerCase();
    const myId = currentUser?.id;

    return tasks.filter((t) => {
      if (myId && t.assignedToId && String(t.assignedToId) === String(myId)) return true;
      if (t.assignee) {
        const a = t.assignee.trim().toLowerCase();
        if (myName && a === myName) return true;
        if (myUsername && a === myUsername) return true;
        if (myEmail && a === myEmail) return true;
      }
      return false;
    });
  }, [tasks, isScopingToMyTasks, activeView, currentUser]);

  const sortedTasks = useMemo(() => {
    let list = [...scopedTasks];
    if (sortBy === 'dueDate') {
      list.sort((a, b) => new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31'));
    } else if (sortBy === 'priority') {
      const pOrder = { URGENT: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
      list.sort((a, b) => (pOrder[a.priority] || 5) - (pOrder[b.priority] || 5));
    } else if (sortBy === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    return list;
  }, [scopedTasks, sortBy]);

  const displayStats = useMemo(() => {
    if (!isScopingToMyTasks && activeView !== 'my-tasks') return stats;
    const total = scopedTasks.length;
    const todo = scopedTasks.filter((t) => t.status === 'TODO').length;
    const inProgress = scopedTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const inReview = scopedTasks.filter((t) => t.status === 'IN_REVIEW').length;
    const completed = scopedTasks.filter((t) => t.status === 'COMPLETED').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, todo, inProgress, inReview, completed, completionRate };
  }, [scopedTasks, isScopingToMyTasks, activeView, stats]);

  return (
    <div className="vortiq-layout">
      {/* Toast Alert System */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        projects={projects}
        onNavigate={(view) => setActiveView(view)}
        onOpenCreateTask={() => handleOpenCreate('TODO')}
        onOpenCreateProject={() => setIsWorkspaceModalOpen(true)}
        onStartFocus={() => setActiveView('focus')}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />

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
        onExportCSV={handleExportCSV}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        taskCount={tasks.length}
        myTaskCount={scopedTasks.length}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenFlowIntelligence={() => setIsFlowIntelligenceOpen(true)}
      />

      {/* Main Content Area */}
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
          onOpenAiModal={() => setIsAiModalOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onExportCSV={handleExportCSV}
          onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenFlowIntelligence={() => setIsFlowIntelligenceOpen(true)}
        />

        {/* Page Inner Container */}
        <main className="main-container">

          {/* 1. Command Center / Priority Intelligence Workspace */}
          {activeView === 'focus' || activeView === 'command-center' ? (
            <CommandCenter
              tasks={tasks}
              projects={projects}
              currentUser={currentUser}
              activeWorkspace={activeWorkspace}
              onOpenCreateTask={() => handleOpenCreate('TODO')}
              onOpenEditTask={handleOpenEdit}
              onStatusChange={handleStatusChange}
              onDeleteTask={handleDeleteTask}
              onNavigate={(v) => setActiveView(v)}
              onAddToast={addToast}
              onOpenFlowIntelligence={() => setIsFlowIntelligenceOpen(true)}
            />
          ) : activeView === 'inbox' ? (
            <InboxView
              onNavigateTask={() => setActiveView('kanban')}
              onAddToast={addToast}
            />
          ) : activeView === 'calendar' ? (
            <CalendarView
              tasks={tasks}
              onOpenCreateTask={() => handleOpenCreate('TODO')}
              onOpenEditTask={handleOpenEdit}
            />
          ) : activeView === 'notes' ? (
            <NotesView onAddToast={addToast} />
          ) : activeView === 'automations' ? (
            <AutomationsView onAddToast={addToast} />
          ) : activeView === 'files' ? (
            <DocumentVaultView currentUser={currentUser} />
          ) : activeView === 'team' ? (
            <MembersDirectory
              activeWorkspace={activeWorkspace}
              tasks={tasks}
              currentUser={currentUser}
              onOpenCreateTaskWithAssignee={(assignee) => {
                setTaskToEdit({
                  title: '',
                  description: '',
                  status: 'TODO',
                  priority: 'MEDIUM',
                  category: 'Engineering',
                  assignee,
                  dueDate: new Date().toISOString().split('T')[0]
                });
                setIsModalOpen(true);
              }}
              onOpenChatWithMember={(member) => {
                setChatInitialTask({
                  title: `Sync with ${member.name || member.username}`,
                  assignee: member.name || member.username
                });
                setChatInitialType('GENERAL');
                setIsChatModalOpen(true);
              }}
              addToast={addToast}
            />
          ) : activeView === 'lounge' ? (
            <TeamLounge
              activeWorkspace={activeWorkspace}
              currentUser={currentUser}
              onAddToast={addToast}
            />
          ) : activeView === 'backend-console' ? (
            <RoleGuard
              currentUser={currentUser}
              allowedRoles={['ROLE_ADMIN']}
              moduleName="Backend System Console"
              onBackToAssigned={() => setActiveView('focus')}
            >
              <BackendConsoleView currentUser={currentUser} />
            </RoleGuard>
          ) : activeView === 'analytics' || activeView === 'ai-analytics' ? (
            <RoleGuard
              currentUser={currentUser}
              allowedRoles={['ROLE_ADMIN', 'ROLE_OWNER']}
              moduleName="AI Velocity & Risk Hub"
              onBackToAssigned={() => setActiveView('focus')}
            >
              <AiAnalyticsDashboard currentUser={currentUser} />
            </RoleGuard>
          ) : activeView === 'project' ? (
            <ProjectWorkspaceView
              projectId={selectedProject || projects[0]?.id || 1}
              projects={projects}
              tasks={tasks}
              workspaceMembers={workspaceMembers}
              currentUser={currentUser}
              onOpenTaskDetail={handleOpenEdit}
              onOpenCreateTask={(colId) => handleOpenCreate(colId)}
              onNavigateView={(v) => setActiveView(v)}
              onAddToast={addToast}
              onStatusChange={handleStatusChange}
            />
          ) : (
            /* Tasks View (Kanban / Table / My-Tasks) */
            <>
              {/* Metrics Overview Top Bar */}
              <MetricsOverview stats={displayStats} currentUser={currentUser} isMyTasksOnly={activeView === 'my-tasks' || isScopingToMyTasks} />

              {/* Flexible Task Workspace: List, Kanban, Timeline & Embedded Detail Panel */}
              <TaskWorkspace
                tasks={sortedTasks}
                projects={projects}
                workspaceMembers={workspaceMembers}
                currentUser={currentUser}
                activeWorkspace={activeWorkspace}
                onStatusChange={handleStatusChange}
                onUpdateTask={handleUpdateTaskDirect}
                onDeleteTask={handleDeleteTask}
                onCreateTask={handleSaveTask}
                onAddToast={addToast}
                onExportCSV={handleExportCSV}
              />
            </>
          )}

        </main>
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        className="btn btn-primary mobile-only"
        onClick={() => handleOpenCreate('TODO')}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          zIndex: 80,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          padding: 0,
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Create Task"
      >
        <Plus size={20} />
      </button>

      {/* VortiQ AI Neural Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        activeWorkspace={activeWorkspace}
        activeProject={projects.find((p) => String(p.id) === String(selectedProject)) || projects[0]}
        tasks={tasks}
        onAddTasksBatch={handleAddTasksBatch}
        addToast={addToast}
      />

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
        addToast={addToast}
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

      {/* Omnipresent Floating VortiQ AI Assistant Bot */}
      <AiBotWidget
        activeWorkspace={activeWorkspace}
        activeProject={projects.find((p) => String(p.id) === String(selectedProject)) || projects[0]}
        tasks={tasks}
        currentUser={currentUser}
        pageView="app"
        onAddTask={(taskData) => handleSaveTask(taskData)}
        onAddTasksBatch={handleAddTasksBatch}
        onSetStatusFilter={setStatusFilter}
        onSetPriorityFilter={setPriorityFilter}
        onSetSearchQuery={setSearchQuery}
        onSetTheme={setTheme}
        onNavigateView={setActiveView}
        onEnterApp={() => setActiveView('focus')}
        addToast={addToast}
      />

      {/* Real-Time In-App Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        currentUser={currentUser}
      />

      {/* Global Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        projects={projects}
        onNavigate={(view) => setActiveView(view)}
        onOpenCreateTask={() => handleOpenCreate('TODO')}
        onOpenCreateProject={() => setIsWorkspaceModalOpen(true)}
        onStartFocus={() => {
          setActiveView('focus');
          addToast('Focus session activated', 'info');
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onOpenFlowIntelligence={() => setIsFlowIntelligenceOpen(true)}
      />

      {/* Flow Intelligence Contextual Attention & Smart Brief Panel */}
      <FlowIntelligencePanel
        isOpen={isFlowIntelligenceOpen}
        onClose={() => setIsFlowIntelligenceOpen(false)}
        tasks={tasks}
        projects={projects}
        currentUser={currentUser}
        onOpenTask={() => {
          setIsFlowIntelligenceOpen(false);
          setActiveView('kanban');
        }}
        onAddToast={addToast}
        onPromoteToFocus={(task) => {
          setActiveView('focus');
          addToast(`Promoted "${task?.title || 'task'}" to Focus Now`, 'success');
        }}
      />
    </div>
  );
}
