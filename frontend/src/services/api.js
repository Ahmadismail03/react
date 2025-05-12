import axios from 'axios'

// Remove explicit baseURL to use Vite proxy
// axios.defaults.baseURL = 'http://localhost:8081'

// Auth API endpoints
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
}

// User API endpoints
export const userApi = {
  getCurrentUser: () => axios.get('/api/users/me'),
  getUserById: (id) => axios.get(`/api/users/${id}`),
  updateProfile: (userData) => axios.put('/api/users/profile', userData),
  uploadProfilePicture: (formData) => axios.post('/api/users/profile/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  // Admin user management endpoints
  getAllUsers: () => axios.get('/api/users'),
  createUser: (userData) => axios.post('/api/users', userData),
  updateUser: (userId, userData) => axios.put(`/api/users/${userId}`, userData),
  deleteUser: (userId) => axios.delete(`/api/users/${userId}`),
  updateUserRole: (userId, role) => axios.put(`/api/users/${userId}/role?role=${role}`),
}

// Course API endpoints
export const courseApi = {
  getAllCourses: () => axios.get('/api/courses'),
  getInstructorCourses: () => axios.get('/api/courses/instructor'),
  getCourseById: (id) => axios.get(`/api/courses/${id}`),
  createCourse: (courseData) => axios.post('/api/courses', courseData),
  updateCourse: (id, courseData) => {
    // Ensure id is not undefined before making the request
    if (!id) {
      console.error('Course ID is undefined');
      return Promise.reject(new Error('Course ID is required'));
    }
    return axios.put(`/api/courses/${id}`, courseData);
  },
  deleteCourse: (id) => {
    // Validate the course ID before making the request
    if (!id) {
      return Promise.reject(new Error('Invalid course ID: ID is undefined or null'));
    }
    return axios.delete(`/api/courses/${id}`);
  },
  enrollInCourse: (courseId) => axios.post(`/api/courses/${courseId}/enroll`),
  getCourseStudents: (courseId) => axios.get(`/api/courses/${courseId}/students`),
  assignInstructor: (courseId, instructorId) => axios.put(`/api/courses/${courseId}/assignInstructor?instructorId=${instructorId}`),
}

// Module API endpoints
export const moduleApi = {
  getModulesByCourse: (courseId) => axios.get(`/api/module/course/${courseId}`),
  getModuleById: (moduleId) => axios.get(`/api/module/${moduleId}`),
};

// Content API endpoints
export const contentApi = {
  getContentByCourse: (courseId) => axios.get(`/api/content/course/${courseId}`),
  getContent: (contentId) => axios.get(`/api/content/${contentId}`),
  uploadContent: (contentData) => {
    const formData = new FormData()
    for (const [key, value] of Object.entries(contentData)) {
      formData.append(key, value)
    }
    return axios.post(`/api/content/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  uploadJsonContent: (contentData) => axios.post('/api/content/upload-json', contentData, {
    headers: { 'Content-Type': 'application/json' },
  }),
  deleteContent: (contentId) => axios.delete(`/api/content/${contentId}`),
}

// Assessment API endpoints
export const assessmentApi = {
  getAssessmentsByCourse: (courseId) => axios.get(`/api/assessment/course/${courseId}`),
  createAssessment: (assessmentData) =>
    axios.post(`/api/assessment/create`, assessmentData),
  getAssessment: (assessmentId) => axios.get(`/api/assessment/${assessmentId}`),
  submitAssessment: (assessmentId, submissionData) =>
    axios.post(`/api/assessment/${assessmentId}/submit`, submissionData),
  gradeAssessment: (submissionId, gradeData) =>
    axios.post(`/api/assessment/submissions/${submissionId}/grade`, gradeData),
}

// Enrollment API endpoints
export const enrollmentApi = {
  getMyEnrollments: () => axios.get('/api/enrollments/my'),
  getEnrollmentsByStudent: (studentId) => axios.get(`/api/enrollments/student/${studentId}`),
  enrollStudent: (enrollmentData) => axios.post('/api/enrollments', enrollmentData),
  getEnrollmentProgress: (enrollmentId) => axios.get(`/api/enrollments/${enrollmentId}/progress`),
  updateProgress: (enrollmentId, progressData) =>
    axios.put(`/api/enrollments/${enrollmentId}/progress`, progressData),
  unenrollStudent: (courseId, studentId) => 
    axios.delete(`/api/enrollments/course/${courseId}/student/${studentId}`),
}

// Quiz API endpoints
export const quizApi = {
  getAllQuizzes: () => axios.get('/api/quizzes'),
  getActiveQuizzes: () => axios.get('/api/quizzes?active=true'),
  getQuizById: (quizId) => axios.get(`/api/quizzes/${quizId}`),
  createQuiz: (quizData) => axios.post('/api/quizzes', quizData),
  updateQuiz: (quizId, quizData) => axios.put(`/api/quizzes/${quizId}`, quizData),
  deleteQuiz: (quizId) => axios.delete(`/api/quizzes/${quizId}`),
  submitQuiz: (quizId, answers, studentId, timeSpentInSeconds) => 
    axios.post(`/api/quizzes/${quizId}/submit?studentId=${studentId}&timeSpentInSeconds=${timeSpentInSeconds}`, answers),
  getQuizStatistics: (quizId) => axios.get(`/api/quizzes/${quizId}/statistics`),
}

// Notification API endpoints
export const notificationApi = {
  getAllNotifications: () => axios.get('/api/notifications'),
  getUnreadNotifications: () => axios.get('/api/notifications/unread'),
  getNotificationCount: () => axios.get('/api/notifications/count'),
  getNotificationsByStatus: (status) => axios.get(`/api/notifications/status/${status}`),
  createNotification: (notificationData) => axios.post('/api/notifications/create', notificationData),
  markAsRead: (notificationId) => axios.put(`/api/notifications/${notificationId}/read`),
  updateStatus: (notificationId, status) => axios.put(`/api/notifications/${notificationId}/status/${status}`),
  deleteNotification: (notificationId) => axios.delete(`/api/notifications/${notificationId}`),
}

// Admin API endpoints
export const adminApi = {
  getAllUsers: () => axios.get('/admin/users'),
  getUserById: (userId) => axios.get(`/admin/users/${userId}`),
  createUser: (userData) => axios.post('/admin/users', userData),
  updateUser: (userId, userData) => axios.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => axios.delete(`/admin/users/${userId}`),
  updateUserRole: (userId, role) => axios.put(`/admin/users/${userId}/role?role=${role}`),
  
  // Fixed getSystemStats method - use axios instead of axiosInstance
  getSystemStats: () => axios.get('/api/admin/system-stats'),
  
  // Additional admin methods you might need
  getUserAnalytics: () => axios.get('/api/admin/user-analytics'),
  getCourseAnalytics: () => axios.get('/api/admin/course-analytics'),
  getEnrollmentAnalytics: () => axios.get('/api/admin/enrollment-analytics'),
}

// Ensure Authorization header is set for all requests if token exists
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}