const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    if (res.ok) return true;
    const fallbackRes = await fetch(`${API_BASE_URL}/tasks/stats`, { method: 'GET' });
    return fallbackRes.ok;
  } catch (err) {
    return false;
  }
}

export async function fetchTasks(filters = {}) {
  const query = new URLSearchParams();
  if (filters.status) query.append('status', filters.status);
  if (filters.priority) query.append('priority', filters.priority);
  if (filters.search) query.append('search', filters.search);

  const url = `${API_BASE_URL}/tasks${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch tasks from Spring Boot backend');
  return res.json();
}

export async function fetchTaskStats() {
  const res = await fetch(`${API_BASE_URL}/tasks/stats`);
  if (!res.ok) throw new Error('Failed to fetch task stats');
  return res.json();
}

export async function fetchProjects() {
  const res = await fetch(`${API_BASE_URL}/projects`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function createTask(taskData) {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function updateTask(id, taskData) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function updateTaskStatus(id, newStatus) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  });
  if (!res.ok) throw new Error('Failed to update task status');
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete task');
  return true;
}
