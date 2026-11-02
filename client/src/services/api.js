import axios from 'axios';

export const TOKEN_KEY = 'taskly_token';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Expired/invalid token on a protected call -> clear session and go to login.
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const isAuthCall = err.config?.url?.startsWith('/auth/login') || err.config?.url?.startsWith('/auth/register');
    if (err.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem(TOKEN_KEY);
      if (location.pathname !== '/login') location.assign('/login');
    }
    return Promise.reject(err);
  }
);

export const errorMessage = (err) =>
  err.response?.data?.message || (err.request ? 'Cannot reach the server. Check that the API is running.' : 'Something went wrong.');

export const authApi = {
  register: (d) => api.post('/auth/register', d).then((r) => r.data),
  login: (d) => api.post('/auth/login', d).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};
export const taskApi = {
  list: (params) => api.get('/tasks', { params }).then((r) => r.data.tasks),
  stats: () => api.get('/tasks/stats').then((r) => r.data),
  create: (d) => api.post('/tasks', d).then((r) => r.data.task),
  update: (id, d) => api.put(`/tasks/${id}`, d).then((r) => r.data.task),
  setStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }).then((r) => r.data.task),
  remove: (id) => api.delete(`/tasks/${id}`).then((r) => r.data),
};
