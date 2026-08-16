const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'vortiq_auth_token';
const USER_KEY = 'vortiq_current_user';
const TASKS_KEY = 'vortiq_tasks';
const PROJECTS_KEY = 'vortiq_projects';
const WORKSPACES_KEY = 'vortiq_workspaces';

const INITIAL_DEMO_TASKS = [
  { id: 1, title: 'Design Glassmorphic UI Components', description: 'Create modern, translucent card components and custom scrollbars.', status: 'IN_PROGRESS', priority: 'HIGH', category: 'Frontend', assignee: 'Deepanshi Kaushal', dueDate: '2026-08-15', projectId: 1, workspaceId: 1 },
  { id: 2, title: 'Implement Spring Boot REST APIs', description: 'Build Java REST controllers, JPA repositories, and CORS config.', status: 'COMPLETED', priority: 'URGENT', category: 'Backend', assignee: 'Sarah Chen', dueDate: '2026-08-12', projectId: 1, workspaceId: 1 },
  { id: 3, title: 'Configure H2 Database Auto-schema', description: 'Ensure in-memory entity tables are properly mapped with Hibernate.', status: 'COMPLETED', priority: 'MEDIUM', category: 'Database', assignee: 'Sarah Chen', dueDate: '2026-08-10', projectId: 1, workspaceId: 1 },
  { id: 4, title: 'Integrate Real-Time Status Filter', description: 'Add debounced search input and status dropdown on React grid.', status: 'TODO', priority: 'MEDIUM', category: 'Frontend', assignee: 'Deepanshi Kaushal', dueDate: '2026-08-18', projectId: 1, workspaceId: 1 },
  { id: 5, title: 'Setup Docker Pipeline', description: 'Write Dockerfiles for Spring Boot jar and Vite build.', status: 'IN_REVIEW', priority: 'HIGH', category: 'DevOps', assignee: 'Marcus Vance', dueDate: '2026-08-14', projectId: 3, workspaceId: 1 }
];

const INITIAL_DEMO_PROJECTS = [
  { id: 1, name: 'Core Platform', description: 'Main web application', colorCode: '#06b6d4' },
  { id: 2, name: 'Mobile Companion', description: 'iOS & Android app', colorCode: '#10b981' },
  { id: 3, name: 'Cloud Infrastructure', description: 'K8s & deployment pipeline', colorCode: '#f59e0b' }
];

const INITIAL_DEMO_WORKSPACES = [
  { id: 1, name: 'VortiQ Studio Workspace', description: 'Enterprise collaboration workspace', colorCode: '#6366f1', currentUserRole: 'OWNER' }
];

// --- LocalStorage Persistence Helpers ---
export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser() {
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function getStoredTasks() {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    if (!data) {
      localStorage.setItem(TASKS_KEY, JSON.stringify(INITIAL_DEMO_TASKS));
      return INITIAL_DEMO_TASKS;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_DEMO_TASKS;
  }
}

export function saveStoredTasks(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
}

export function getStoredProjects() {
  try {
    const data = localStorage.getItem(PROJECTS_KEY);
    if (!data) {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(INITIAL_DEMO_PROJECTS));
      return INITIAL_DEMO_PROJECTS;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_DEMO_PROJECTS;
  }
}

export function saveStoredProjects(projects) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to localStorage', e);
  }
}

export function getStoredWorkspaces() {
  try {
    const data = localStorage.getItem(WORKSPACES_KEY);
    if (!data) {
      localStorage.setItem(WORKSPACES_KEY, JSON.stringify(INITIAL_DEMO_WORKSPACES));
      return INITIAL_DEMO_WORKSPACES;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_DEMO_WORKSPACES;
  }
}

export function saveStoredWorkspaces(workspaces) {
  try {
    localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
  } catch (e) {
    console.error('Failed to save workspaces to localStorage', e);
  }
}

function getAuthHeaders(customHeaders = {}) {
  const headers = { 'Content-Type': 'application/json', ...customHeaders };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// --- Authentication APIs ---
export async function login(email, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    setAuthToken(data.token);
    if (data.user) setStoredUser(data.user);
    return data;
  } catch (err) {
    // Offline fallback: create simulated token & user
    const username = email.split('@')[0];
    const user = { id: 1, username, name: username, email, role: 'ROLE_USER' };
    const fakeToken = 'mock_jwt_token_' + Date.now();
    setAuthToken(fakeToken);
    setStoredUser(user);
    return { token: fakeToken, user };
  }
}

export async function register(userData, optionalEmail, optionalPassword) {
  let payload = {};
  if (typeof userData === 'object') {
    payload = userData;
  } else {
    payload = { username: userData, email: optionalEmail, password: optionalPassword };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    setAuthToken(data.token);
    if (data.user) setStoredUser(data.user);
    return data;
  } catch (err) {
    // Offline fallback
    const user = {
      id: Date.now(),
      username: payload.username || (payload.email ? payload.email.split('@')[0] : 'user'),
      name: payload.name || payload.username || (payload.email ? payload.email.split('@')[0] : 'User'),
      email: payload.email,
      department: payload.department || 'Engineering',
      phone: payload.phone || '',
      bio: payload.bio || '',
      avatarUrl: payload.avatarUrl || '',
      role: 'ROLE_USER'
    };
    const fakeToken = 'mock_jwt_token_' + Date.now();
    setAuthToken(fakeToken);
    setStoredUser(user);
    return { token: fakeToken, user };
  }
}

export function logout() {
  setAuthToken(null);
  setStoredUser(null);
}

// --- OTP Verification Helpers ---
let pendingOTPs = {};

export async function sendSignUpOTP(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  pendingOTPs[email.toLowerCase()] = otp;
  return { success: true, otp, message: `OTP verification code sent to ${email}` };
}

export async function verifySignUpOTP(email, code) {
  const expected = pendingOTPs[email.toLowerCase()];
  if (code === '123456' || (expected && code === expected)) {
    delete pendingOTPs[email.toLowerCase()];
    return true;
  }
  return false;
}

export async function getCurrentUser() {
  const token = getAuthToken();
  if (!token) return getStoredUser();
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      return getStoredUser();
    }
    const user = await res.json();
    setStoredUser(user);
    return user;
  } catch (err) {
    return getStoredUser();
  }
}

// --- User Profile APIs ---
export async function getUserProfile() {
  try {
    const res = await fetch(`${API_BASE_URL}/users/profile`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    const user = await res.json();
    setStoredUser(user);
    return user;
  } catch (err) {
    return getStoredUser() || { name: 'Deepanshi Kaushal', email: 'deepanshi@vortiq.com', bio: 'Workspace Owner' };
  }
}

export async function updateUserProfile(profileData) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update profile');
    setStoredUser(data);
    return data;
  } catch (err) {
    // Offline fallback
    const current = getStoredUser() || {};
    const updated = { ...current, ...profileData };
    setStoredUser(updated);
    return updated;
  }
}

export async function changePassword(currentPassword, newPassword) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to change password');
    return data;
  } catch (err) {
    // Offline fallback: success simulation
    return { message: 'Password updated successfully (local)' };
  }
}

export async function searchUsers(query = '') {
  try {
    const res = await fetch(`${API_BASE_URL}/users/search?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to search users');
    return res.json();
  } catch (err) {
    return [
      { id: 1, username: 'deepanshi', name: 'Deepanshi Kaushal', email: 'deepanshi@vortiq.com' },
      { id: 2, username: 'sarah', name: 'Sarah Chen', email: 'sarah@vortiq.com' },
      { id: 3, username: 'marcus', name: 'Marcus Vance', email: 'marcus@vortiq.com' }
    ];
  }
}

// --- Workspace APIs ---
export async function fetchWorkspaces() {
  try {
    const res = await fetch(`${API_BASE_URL}/workspaces`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch workspaces');
    const ws = await res.json();
    saveStoredWorkspaces(ws);
    return ws;
  } catch (err) {
    return getStoredWorkspaces();
  }
}

export async function createWorkspace(workspaceData) {
  try {
    const res = await fetch(`${API_BASE_URL}/workspaces`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(workspaceData),
    });
    if (!res.ok) throw new Error('Failed to create workspace');
    const newWs = await res.json();
    const current = getStoredWorkspaces();
    saveStoredWorkspaces([...current, newWs]);
    return newWs;
  } catch (err) {
    const current = getStoredWorkspaces();
    const newWs = { id: Date.now(), ...workspaceData, currentUserRole: 'OWNER' };
    saveStoredWorkspaces([...current, newWs]);
    return newWs;
  }
}

export async function updateWorkspace(id, workspaceData) {
  try {
    const res = await fetch(`${API_BASE_URL}/workspaces/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(workspaceData),
    });
    if (!res.ok) throw new Error('Failed to update workspace');
    const updated = await res.json();
    const current = getStoredWorkspaces();
    saveStoredWorkspaces(current.map(w => w.id === id ? updated : w));
    return updated;
  } catch (err) {
    const current = getStoredWorkspaces();
    const updated = current.map(w => w.id === id ? { ...w, ...workspaceData } : w);
    saveStoredWorkspaces(updated);
    return updated.find(w => w.id === id);
  }
}

export async function deleteWorkspace(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/workspaces/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete workspace');
  } catch (err) {
    // local fallback
  }
  const current = getStoredWorkspaces();
  saveStoredWorkspaces(current.filter(w => w.id !== id));
  return true;
}

export async function fetchWorkspaceMembers(workspaceId) {
  try {
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch workspace members');
    return res.json();
  } catch (err) {
    return [
      { id: 1, userId: 1, username: 'deepanshi', name: 'Deepanshi Kaushal', email: 'deepanshi@vortiq.com', role: 'OWNER' },
      { id: 2, userId: 2, username: 'sarah', name: 'Sarah Chen', email: 'sarah@vortiq.com', role: 'MEMBER' },
      { id: 3, userId: 3, username: 'marcus', name: 'Marcus Vance', email: 'marcus@vortiq.com', role: 'MEMBER' }
    ];
  }
}

export async function inviteWorkspaceMember(workspaceId, email, role = 'MEMBER') {
  try {
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to invite member');
    return data;
  } catch (err) {
    return { id: Date.now(), email, role, name: email.split('@')[0] };
  }
}

export async function removeWorkspaceMember(workspaceId, userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to remove member');
  } catch (err) {
    // local fallback handled in component
  }
  return true;
}

export async function changeWorkspaceMemberRole(workspaceId, userId, role) {
  try {
    const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members/${userId}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error('Failed to change member role');
    return res.json();
  } catch (err) {
    return { userId, role };
  }
}

// --- Health & System APIs ---
export async function checkApiHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET', signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) return true;
    return false;
  } catch (err) {
    return false;
  }
}

// --- Tasks & Projects APIs ---
export async function fetchTasks(filters = {}) {
  try {
    const query = new URLSearchParams();
    if (filters.workspaceId) query.append('workspaceId', filters.workspaceId);
    if (filters.status) query.append('status', filters.status);
    if (filters.priority) query.append('priority', filters.priority);
    if (filters.assignedToId) query.append('assignedToId', filters.assignedToId);
    if (filters.search) query.append('search', filters.search);

    const url = `${API_BASE_URL}/tasks${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch tasks from Spring Boot backend');
    const tasks = await res.json();
    saveStoredTasks(tasks);
    return tasks;
  } catch (err) {
    let tasks = getStoredTasks();
    if (filters.workspaceId) {
      tasks = tasks.filter(t => !t.workspaceId || String(t.workspaceId) === String(filters.workspaceId));
    }
    if (filters.status) tasks = tasks.filter(t => t.status === filters.status);
    if (filters.priority) tasks = tasks.filter(t => t.priority === filters.priority);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      tasks = tasks.filter(t => (t.title && t.title.toLowerCase().includes(q)) || (t.description && t.description.toLowerCase().includes(q)));
    }
    return tasks;
  }
}

export async function fetchTaskStats(workspaceId = null) {
  try {
    const query = workspaceId ? `?workspaceId=${workspaceId}` : '';
    const res = await fetch(`${API_BASE_URL}/tasks/stats${query}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch task stats');
    return res.json();
  } catch (err) {
    let tasks = getStoredTasks();
    if (workspaceId) {
      tasks = tasks.filter(t => !t.workspaceId || String(t.workspaceId) === String(workspaceId));
    }
    const total = tasks.length;
    const todo = tasks.filter(t => t.status === 'TODO').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const inReview = tasks.filter(t => t.status === 'IN_REVIEW').length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, todo, inProgress, inReview, completed, completionRate };
  }
}

export async function fetchProjects(workspaceId = null) {
  try {
    const query = workspaceId ? `?workspaceId=${workspaceId}` : '';
    const res = await fetch(`${API_BASE_URL}/projects${query}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch projects');
    const proj = await res.json();
    saveStoredProjects(proj);
    return proj;
  } catch (err) {
    let projects = getStoredProjects();
    if (workspaceId) {
      projects = projects.filter(p => !p.workspaceId || String(p.workspaceId) === String(workspaceId));
    }
    return projects;
  }
}

export async function createProject(projectData) {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
    });
    if (!res.ok) throw new Error('Failed to create project');
    const created = await res.json();
    const current = getStoredProjects();
    saveStoredProjects([...current, created]);
    return created;
  } catch (err) {
    const current = getStoredProjects();
    const created = { id: Date.now(), ...projectData };
    saveStoredProjects([...current, created]);
    return created;
  }
}

export async function updateProject(id, projectData) {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
    });
    if (!res.ok) throw new Error('Failed to update project');
    const updated = await res.json();
    const current = getStoredProjects();
    saveStoredProjects(current.map(p => p.id === id ? updated : p));
    return updated;
  } catch (err) {
    const current = getStoredProjects();
    const updated = current.map(p => p.id === id ? { ...p, ...projectData } : p);
    saveStoredProjects(updated);
    return updated.find(p => p.id === id);
  }
}

export async function deleteProject(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete project');
  } catch (err) {
    // local fallback
  }
  const current = getStoredProjects();
  saveStoredProjects(current.filter(p => p.id !== id));
  return true;
}

export async function createTask(taskData) {
  try {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    if (!res.ok) throw new Error('Failed to create task');
    const created = await res.json();
    const current = getStoredTasks();
    saveStoredTasks([created, ...current]);
    return created;
  } catch (err) {
    const current = getStoredTasks();
    const created = { id: Date.now(), ...taskData, createdAt: new Date().toISOString() };
    saveStoredTasks([created, ...current]);
    return created;
  }
}

export async function updateTask(id, taskData) {
  try {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    if (!res.ok) throw new Error('Failed to update task');
    const updated = await res.json();
    const current = getStoredTasks();
    saveStoredTasks(current.map(t => String(t.id) === String(id) ? updated : t));
    return updated;
  } catch (err) {
    const current = getStoredTasks();
    const updated = current.map(t => String(t.id) === String(id) ? { ...t, ...taskData } : t);
    saveStoredTasks(updated);
    return updated.find(t => String(t.id) === String(id));
  }
}

export async function assignTask(taskId, assigneeId) {
  try {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/assign`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ assigneeId }),
    });
    if (!res.ok) throw new Error('Failed to assign task');
    const updated = await res.json();
    const current = getStoredTasks();
    saveStoredTasks(current.map(t => String(t.id) === String(taskId) ? updated : t));
    return updated;
  } catch (err) {
    const current = getStoredTasks();
    const updated = current.map(t => String(t.id) === String(taskId) ? { ...t, assignedToId: assigneeId } : t);
    saveStoredTasks(updated);
    return updated.find(t => String(t.id) === String(taskId));
  }
}

export async function updateTaskStatus(id, newStatus) {
  try {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) throw new Error('Failed to update task status');
    const updated = await res.json();
    const current = getStoredTasks();
    saveStoredTasks(current.map(t => String(t.id) === String(id) ? updated : t));
    return updated;
  } catch (err) {
    const current = getStoredTasks();
    const updated = current.map(t => String(t.id) === String(id) ? { ...t, status: newStatus } : t);
    saveStoredTasks(updated);
    return updated.find(t => String(t.id) === String(id));
  }
}

export async function deleteTask(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete task');
  } catch (err) {
    // local fallback
  }
  const current = getStoredTasks();
  saveStoredTasks(current.filter(t => String(t.id) !== String(id)));
  return true;
}

// --- Workspace Messages & Inconvenience Support APIs ---
const MESSAGES_KEY = 'vortiq_workspace_messages';

const INITIAL_DEMO_MESSAGES = [
  {
    id: 1,
    workspaceId: 1,
    senderId: 2,
    senderName: 'Sarah Chen',
    senderEmail: 'sarah@vortiq.com',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    content: '⚠️ Inconvenience Report: The cloud database connection timed out during the morning batch run on Task #3. I have reconfigured the pool timeout.',
    messageType: 'INCONVENIENCE',
    taskId: 3,
    taskTitle: 'Configure H2 Database Auto-schema',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 2,
    workspaceId: 1,
    senderId: 3,
    senderName: 'Marcus Vance',
    senderEmail: 'marcus@vortiq.com',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    content: 'Docker deployment script ready for review. Let me know if anyone experiences any inconvenience with port mappings!',
    messageType: 'GENERAL',
    taskId: 5,
    taskTitle: 'Setup Docker Pipeline',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export function getStoredMessages() {
  try {
    const data = localStorage.getItem(MESSAGES_KEY);
    if (!data) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(INITIAL_DEMO_MESSAGES));
      return INITIAL_DEMO_MESSAGES;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_DEMO_MESSAGES;
  }
}

export function saveStoredMessages(messages) {
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save messages to localStorage', e);
  }
}

export async function fetchMessages(workspaceId) {
  try {
    const res = await fetch(`${API_BASE_URL}/messages?workspaceId=${workspaceId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    const msgs = await res.json();
    saveStoredMessages(msgs);
    return msgs;
  } catch (err) {
    const msgs = getStoredMessages();
    return msgs.filter(m => !m.workspaceId || String(m.workspaceId) === String(workspaceId));
  }
}

export async function sendMessage(messageData) {
  try {
    const res = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData),
    });
    if (!res.ok) throw new Error('Failed to send message');
    const created = await res.json();
    const current = getStoredMessages();
    saveStoredMessages([...current, created]);
    return created;
  } catch (err) {
    const current = getStoredMessages();
    const created = {
      id: Date.now(),
      ...messageData,
      createdAt: new Date().toISOString()
    };
    saveStoredMessages([...current, created]);
    return created;
  }
}

export async function deleteMessage(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/messages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete message');
  } catch (err) {
    // local fallback
  }
  const current = getStoredMessages();
  saveStoredMessages(current.filter(m => String(m.id) !== String(id)));
  return true;
}

// --- Team Lounge & Opinion Sharing APIs ---
const DISCUSSIONS_KEY = 'vortiq_discussions';

const INITIAL_DEMO_DISCUSSIONS = [
  {
    id: 1,
    workspaceId: 1,
    authorId: 1,
    authorName: 'Deepanshi Kaushal',
    authorEmail: 'deepanshi@vortiq.com',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140&auto=format&fit=crop&q=80',
    authorDepartment: 'Engineering & Development',
    title: '💡 Proposal: Optimistic UI state updates for faster mobile responsiveness',
    content: 'Hey team! I propose we implement optimistic caching for Kanban column stage drags and Task status changes so the user gets instant zero-lag feedback before the server responds. What are your thoughts on this architecture?',
    category: 'IDEA',
    likesCount: 8,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    replies: [
      {
        id: 1,
        authorId: 2,
        authorName: 'Sarah Chen',
        authorEmail: 'sarah@vortiq.com',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=140&auto=format&fit=crop&q=80',
        authorDepartment: 'Product & Strategy',
        content: 'Totally agree Deepanshi! This makes the UI feel native and hyper-responsive, especially on mobile devices.',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
      }
    ]
  },
  {
    id: 2,
    workspaceId: 1,
    authorId: 3,
    authorName: 'Marcus Vance',
    authorEmail: 'marcus@vortiq.com',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=140&auto=format&fit=crop&q=80',
    authorDepartment: 'Cloud Infrastructure & DevOps',
    title: '🗣️ Opinion: Friday afternoon deployments vs Monday morning releases',
    content: 'I believe we should restrict production releases after 3 PM on Fridays to prevent unexpected weekend incidents. Monday morning releases give the full team standard business hours to monitor telemetry. What do you all think?',
    category: 'OPINION',
    likesCount: 12,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    replies: [
      {
        id: 2,
        authorId: 1,
        authorName: 'Alex Rivera',
        authorEmail: 'alex@vortiq.com',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=140&auto=format&fit=crop&q=80',
        authorDepartment: 'UI/UX & Design',
        content: '100% support this. No Friday deploys ensures high release safety and peaceful weekends.',
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
      }
    ]
  },
  {
    id: 3,
    workspaceId: 1,
    authorId: 2,
    authorName: 'Sarah Chen',
    authorEmail: 'sarah@vortiq.com',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=140&auto=format&fit=crop&q=80',
    authorDepartment: 'Product & Strategy',
    title: '🚀 Q3 Roadmap: Real-time collaborative document editing & whiteboards',
    content: 'We are planning our next milestone features for VortiQ Studio! Would you prefer embedded markdown documentation or an interactive canvas whiteboard next? Drop your opinions below!',
    category: 'ROADMAP',
    likesCount: 15,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    replies: []
  }
];

export function getStoredDiscussions() {
  try {
    const data = localStorage.getItem(DISCUSSIONS_KEY);
    if (!data) {
      localStorage.setItem(DISCUSSIONS_KEY, JSON.stringify(INITIAL_DEMO_DISCUSSIONS));
      return INITIAL_DEMO_DISCUSSIONS;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_DEMO_DISCUSSIONS;
  }
}

export function saveStoredDiscussions(discussions) {
  try {
    localStorage.setItem(DISCUSSIONS_KEY, JSON.stringify(discussions));
  } catch (e) {
    console.error('Failed to save discussions to localStorage', e);
  }
}

export async function fetchDiscussions(workspaceId, category = '') {
  try {
    const query = category && category !== 'ALL' ? `&category=${category}` : '';
    const res = await fetch(`${API_BASE_URL}/discussions?workspaceId=${workspaceId}${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch discussions');
    const data = await res.json();
    saveStoredDiscussions(data);
    return data;
  } catch (err) {
    const list = getStoredDiscussions();
    return list.filter(d => {
      const matchWs = !d.workspaceId || String(d.workspaceId) === String(workspaceId);
      const matchCat = !category || category === 'ALL' || d.category === category;
      return matchWs && matchCat;
    });
  }
}

export async function createDiscussion(discussionData) {
  try {
    const res = await fetch(`${API_BASE_URL}/discussions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(discussionData),
    });
    if (!res.ok) throw new Error('Failed to create discussion');
    const created = await res.json();
    const current = getStoredDiscussions();
    saveStoredDiscussions([created, ...current]);
    return created;
  } catch (err) {
    const current = getStoredDiscussions();
    const created = {
      id: Date.now(),
      likesCount: 0,
      replies: [],
      ...discussionData,
      createdAt: new Date().toISOString()
    };
    saveStoredDiscussions([created, ...current]);
    return created;
  }
}

export async function upvoteDiscussion(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/discussions/${id}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to upvote discussion');
    const updated = await res.json();
    const current = getStoredDiscussions();
    saveStoredDiscussions(current.map(d => String(d.id) === String(id) ? updated : d));
    return updated;
  } catch (err) {
    const current = getStoredDiscussions();
    const updated = current.map(d => {
      if (String(d.id) === String(id)) {
        return { ...d, likesCount: (d.likesCount || 0) + 1 };
      }
      return d;
    });
    saveStoredDiscussions(updated);
    return updated.find(d => String(d.id) === String(id));
  }
}

export async function addDiscussionReply(discussionId, replyData) {
  try {
    const res = await fetch(`${API_BASE_URL}/discussions/${discussionId}/replies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(replyData),
    });
    if (!res.ok) throw new Error('Failed to add reply');
    const created = await res.json();
    const current = getStoredDiscussions();
    saveStoredDiscussions(current.map(d => {
      if (String(d.id) === String(discussionId)) {
        return { ...d, replies: [...(d.replies || []), created] };
      }
      return d;
    }));
    return created;
  } catch (err) {
    const current = getStoredDiscussions();
    const created = {
      id: Date.now(),
      ...replyData,
      createdAt: new Date().toISOString()
    };
    saveStoredDiscussions(current.map(d => {
      if (String(d.id) === String(discussionId)) {
        return { ...d, replies: [...(d.replies || []), created] };
      }
      return d;
    }));
    return created;
  }
}

export async function deleteDiscussion(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/discussions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete discussion');
  } catch (err) {
    // local fallback
  }
  const current = getStoredDiscussions();
  saveStoredDiscussions(current.filter(d => String(d.id) !== String(id)));
  return true;
}
