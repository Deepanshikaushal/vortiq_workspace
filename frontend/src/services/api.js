const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'vortiq_auth_token';

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

function getAuthHeaders(customHeaders = {}) {
  const headers = { 'Content-Type': 'application/json', ...customHeaders };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Authentication APIs
export async function login(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  setAuthToken(data.token);
  return data;
}

export async function register(username, email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  setAuthToken(data.token);
  return data;
}

export function logout() {
  setAuthToken(null);
}

export async function getCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      logout();
      return null;
    }
    return res.json();
  } catch (err) {
    return null;
  }
}

// User Profile APIs
export async function getUserProfile() {
  const res = await fetch(`${API_BASE_URL}/users/profile`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function updateUserProfile(profileData) {
  const res = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update profile');
  return data;
}

export async function changePassword(currentPassword, newPassword) {
  const res = await fetch(`${API_BASE_URL}/users/change-password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to change password');
  return data;
}

export async function searchUsers(query = '') {
  const res = await fetch(`${API_BASE_URL}/users/search?query=${encodeURIComponent(query)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to search users');
  return res.json();
}

// Workspace APIs
export async function fetchWorkspaces() {
  const res = await fetch(`${API_BASE_URL}/workspaces`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch workspaces');
  return res.json();
}

export async function createWorkspace(workspaceData) {
  const res = await fetch(`${API_BASE_URL}/workspaces`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(workspaceData),
  });
  if (!res.ok) throw new Error('Failed to create workspace');
  return res.json();
}

export async function updateWorkspace(id, workspaceData) {
  const res = await fetch(`${API_BASE_URL}/workspaces/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(workspaceData),
  });
  if (!res.ok) throw new Error('Failed to update workspace');
  return res.json();
}

export async function deleteWorkspace(id) {
  const res = await fetch(`${API_BASE_URL}/workspaces/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete workspace');
  return true;
}

export async function fetchWorkspaceMembers(workspaceId) {
  const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch workspace members');
  return res.json();
}

export async function inviteWorkspaceMember(workspaceId, email, role = 'MEMBER') {
  const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to invite member');
  return data;
}

export async function removeWorkspaceMember(workspaceId, userId) {
  const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to remove member');
  return true;
}

export async function changeWorkspaceMemberRole(workspaceId, userId, role) {
  const res = await fetch(`${API_BASE_URL}/workspaces/${workspaceId}/members/${userId}/role`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error('Failed to change member role');
  return res.json();
}

// Health & System APIs
export async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    if (res.ok) return true;
    const fallbackRes = await fetch(`${API_BASE_URL}/tasks/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return fallbackRes.ok;
  } catch (err) {
    return false;
  }
}

// Tasks & Projects APIs
export async function fetchTasks(filters = {}) {
  const query = new URLSearchParams();
  if (filters.workspaceId) query.append('workspaceId', filters.workspaceId);
  if (filters.status) query.append('status', filters.status);
  if (filters.priority) query.append('priority', filters.priority);
  if (filters.assignedToId) query.append('assignedToId', filters.assignedToId);
  if (filters.search) query.append('search', filters.search);

  const url = `${API_BASE_URL}/tasks${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch tasks from Spring Boot backend');
  return res.json();
}

export async function fetchTaskStats(workspaceId = null) {
  const query = workspaceId ? `?workspaceId=${workspaceId}` : '';
  const res = await fetch(`${API_BASE_URL}/tasks/stats${query}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch task stats');
  return res.json();
}

export async function fetchProjects(workspaceId = null) {
  const query = workspaceId ? `?workspaceId=${workspaceId}` : '';
  const res = await fetch(`${API_BASE_URL}/projects${query}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function createProject(projectData) {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(projectData),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function updateProject(id, projectData) {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(projectData),
  });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
}

export async function deleteProject(id) {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete project');
  return true;
}

export async function createTask(taskData) {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function updateTask(id, taskData) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function assignTask(taskId, assigneeId) {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/assign`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ assigneeId }),
  });
  if (!res.ok) throw new Error('Failed to assign task');
  return res.json();
}

export async function updateTaskStatus(id, newStatus) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: newStatus }),
  });
  if (!res.ok) throw new Error('Failed to update task status');
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete task');
  return true;
}
