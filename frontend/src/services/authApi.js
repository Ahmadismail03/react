
import axios from 'axios';

export const authApi = {
  login: (credentials) => axios.post('/api/auth/login', credentials),
  
  register: (userData) => axios.post('/api/auth/register', userData),
  
  forgotPassword: (email) => axios.post('/api/auth/forgot-password', { email }),
  
  validateResetToken: (token) => axios.get(`/api/auth/validate-reset-token?token=${token}`),
  
  resetPassword: (token, password) => axios.post(`/api/auth/reset-password?token=${token}`, { newPassword: password }),
  
  refreshToken: (refreshToken) => axios.post('/api/auth/refresh', { refreshToken }),
  
  logout: () => axios.post('/api/auth/logout'),
  
  getCurrentUser: () => axios.get('/api/auth/me'),
  
  changePassword: (passwordData) => axios.post('/api/auth/change-password', passwordData),
};

export default authApi;