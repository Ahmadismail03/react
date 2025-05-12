// src/services/adminApi.js
import axios from 'axios';

export const adminApi = {
  // User Management
  getAllUsers: () => axios.get('/admin/users'),
  getUserById: (userId) => axios.get(`/admin/users/${userId}`),
  createUser: (userData) => axios.post('/admin/users', userData),
  updateUser: (userId, userData) => axios.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => axios.delete(`/admin/users/${userId}`),
  updateUserRole: (userId, role) => axios.put(`/admin/users/${userId}/role?role=${role}`),
  
  // System Settings
  getSystemSettings: () => axios.get('/admin/settings'),
  updateSystemSettings: (settings) => axios.put('/admin/settings', settings),
  
  // System Status
  getSystemStatus: () => axios.get('/admin/status'),
  
  // Email Testing
  sendTestEmail: (email) => axios.post('/admin/settings/email/test', { email }),
  
  // Backup Management
  createBackup: () => axios.post('/admin/backup'),
  restoreBackup: (backupId) => axios.post(`/admin/backup/${backupId}/restore`),
  getBackups: () => axios.get('/admin/backups'),
  deleteBackup: (backupId) => axios.delete(`/admin/backup/${backupId}`),
  
  // System Statistics
  getSystemStats: () => axios.get('/admin/statistics'),
  
  // Logs
  getSystemLogs: (page = 1, limit = 100) => 
    axios.get(`/admin/logs?page=${page}&limit=${limit}`),
  
  // Maintenance
  enableMaintenanceMode: () => axios.post('/admin/maintenance/enable'),
  disableMaintenanceMode: () => axios.post('/admin/maintenance/disable'),
  
  // Cache Management
  clearCache: () => axios.post('/admin/cache/clear'),
  
  // User Sessions
  getActiveSessions: () => axios.get('/admin/sessions'),
  terminateSession: (sessionId) => axios.delete(`/admin/sessions/${sessionId}`),
  
  // Import/Export
  exportUsers: (format = 'csv') => 
    axios.get(`/admin/export/users?format=${format}`, { responseType: 'blob' }),
  exportCourses: (format = 'csv') => 
    axios.get(`/admin/export/courses?format=${format}`, { responseType: 'blob' }),
  importUsers: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post('/admin/import/users', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  importCourses: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post('/admin/import/courses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export default adminApi;