const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined
  });

  if (res.status === 204) return null;

  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  postForm: (path, formData) => request(path, { method: 'POST', body: formData, isForm: true }),

  // Auth
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),

  // Profile
  getProfile: () => request('/api/profile'),
  updateProfile: (payload) => request('/api/profile', { method: 'PUT', body: payload }),
  uploadPhoto: (formData) => request('/api/profile/photo', { method: 'POST', body: formData, isForm: true }),
  removePhoto: () => request('/api/profile/photo', { method: 'DELETE' }),

  // Simple resources
  list: (resource) => request(`/api/${resource}`),
  create: (resource, payload) => request(`/api/${resource}`, { method: 'POST', body: payload }),
  update: (resource, id, payload) => request(`/api/${resource}/${id}`, { method: 'PUT', body: payload }),
  remove: (resource, id) => request(`/api/${resource}/${id}`, { method: 'DELETE' }),

  // Projects + media
  addMedia: (projectId, payload) => request(`/api/projects/${projectId}/media`, { method: 'POST', body: payload }),
  updateMedia: (projectId, mediaId, payload) => request(`/api/projects/${projectId}/media/${mediaId}`, { method: 'PUT', body: payload }),
  removeMedia: (projectId, mediaId) => request(`/api/projects/${projectId}/media/${mediaId}`, { method: 'DELETE' }),

  // Messages & analytics
  getMessages: () => request('/api/messages'),
  deleteMessage: (id) => request(`/api/messages/${id}`, { method: 'DELETE' }),
  getAnalytics: () => request('/api/analytics'),

  // Public
  getPublicProfile: (profileId) => request(`/api/public/${profileId}`),
  sendContactMessage: (profileId, payload) => request(`/api/public/${profileId}/contact`, { method: 'POST', body: payload })
};

export { BASE_URL };
