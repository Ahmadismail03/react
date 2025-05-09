import axios from 'axios'

// User API endpoints for admin functionality
export const userApi = {
  // Get current user profile
  getCurrentUser: () => axios.get('/users/me'),
  
  // Update user profile
  updateProfile: (userData) => axios.put('/users/profile', userData),
  
  // Admin endpoints
  getAllUsers: () => axios.get('/admin/users'),
  getUserById: (id) => axios.get(`/admin/users/${id}`),
  createUser: (userData) => axios.post('/admin/users', userData),
  updateUser: (id, userData) => axios.put(`/admin/users/${id}`, userData),
  updateUserRole: (id, role) => axios.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => axios.delete(`/admin/users/${id}`),
  
  // Password management
  changePassword: (oldPassword, newPassword) => 
    axios.post('/users/change-password', { oldPassword, newPassword }),
  
  // Profile image upload
  uploadProfileImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return axios.post('/users/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}