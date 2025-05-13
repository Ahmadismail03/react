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

// Updated courseApi in api.js
export const courseApi = {
  getAllCourses: () => axios.get('/api/courses'),
  getInstructorCourses: () => axios.get('/api/courses/instructor'),
  getCourseById: (id) => axios.get(`/api/courses/${id}`),
  
  // Improved createCourse with proper data formatting
  createCourse: (courseData) => {
    // Ensure required fields are present
    if (!courseData.title && !courseData.name) {
      return Promise.reject(new Error('Course title/name is required'));
    }
    
    // Make sure name is always set if title is provided
    const formattedData = {
      ...courseData,
      name: courseData.name || courseData.title,
    };
    
    // Handle dates if they're not already provided
    if (!formattedData.startDate) {
      formattedData.startDate = new Date().toISOString().split('T')[0];
    }
    
    if (!formattedData.endDate) {
      // Default to 3 months from start date
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);
      formattedData.endDate = endDate.toISOString().split('T')[0];
    }
    
    console.log('Formatted course data for API:', formattedData);
    return axios.post('/api/courses', formattedData);
  },
  
  updateCourse: (id, courseData) => {
    if (!id) {
      console.error('Course ID is undefined');
      return Promise.reject(new Error('Course ID is required'));
    }
    
    // Make sure name is always set if title is provided
    const formattedData = {
      ...courseData,
      name: courseData.name || courseData.title,
    };
    
    console.log('Updating course with ID:', id, 'Data:', formattedData);
    return axios.put(`/api/courses/${id}`, formattedData);
  },
  
  deleteCourse: (id) => {
    if (!id) {
      return Promise.reject(new Error('Invalid course ID: ID is undefined or null'));
    }
    return axios.delete(`/api/courses/${id}`);
  },
  
  enrollInCourse: (courseId) => axios.post(`/api/courses/${courseId}/enroll`),
  getCourseStudents: (courseId) => axios.get(`/api/courses/${courseId}/students`),
  assignInstructor: (courseId, instructorId) => axios.put(`/api/courses/${courseId}/assignInstructor?instructorId=${instructorId}`),
};
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
    // Create a properly formatted FormData object
    const formData = new FormData();
    
    // Add required fields
    formData.append('title', contentData.title);
    formData.append('courseId', contentData.courseId);
    formData.append('type', contentData.type);
    
    // Add optional fields if they exist
    if (contentData.description) {
      formData.append('description', contentData.description);
    }
    
    if (contentData.moduleId) {
      formData.append('moduleId', contentData.moduleId);
    }
    
    // Handle file upload
    if (contentData.file) {
      formData.append('file', contentData.file);
    } else if (contentData.urlFileLocation) {
      formData.append('urlFileLocation', contentData.urlFileLocation);
      
      // When no file is uploaded but a URL is provided, we need these additional fields
      if (contentData.fileSize) {
        formData.append('fileSize', contentData.fileSize);
      } else {
        formData.append('fileSize', '1024'); // Default size for external URLs
      }
      
      if (contentData.fileType) {
        formData.append('fileType', contentData.fileType);
      } else {
        // Determine file type based on content type
        let fileType = 'text/plain';
        switch (contentData.type) {
          case 'PDF':
            fileType = 'application/pdf';
            break;
          case 'VIDEO':
            fileType = 'video/mp4';
            break;
          case 'LINK':
            fileType = 'text/html';
            break;
          case 'QUIZ':
            fileType = 'application/json';
            break;
        }
        formData.append('fileType', fileType);
      }
      
      if (contentData.fileName) {
        formData.append('fileName', contentData.fileName);
      } else {
        formData.append('fileName', contentData.title + getFileExtension(contentData.type));
      }
    }
    
    // Proper content type for multipart/form-data
    return axios.post('/api/content/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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
  // Get all enrollments for the current user
  getMyEnrollments: () => axios.get('/api/enrollments/my'),
  
  // Get enrollments for a specific student
  getEnrollmentsByStudent: (studentId) => axios.get(`/api/enrollments/student/${studentId}`),
  
  // Get all enrollments for a specific course
  getCourseEnrollments: (courseId) => axios.get(`/api/enrollments/course/${courseId}`),
  
  // Enroll a student in a course
  enrollStudent: (enrollmentData) => axios.post('/api/enrollments', enrollmentData),
  
  // Get enrollment progress
  getEnrollmentProgress: (enrollmentId) => axios.get(`/api/enrollments/${enrollmentId}/progress`),
  
  // Update enrollment progress
  updateProgress: (enrollmentId, progressData) => 
    axios.put(`/api/enrollments/${enrollmentId}/progress`, progressData),
  
  // Unenroll a student from a course
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
// Update in api.js - add a fallback method for notification creation
// src/services/api.js (update the notificationApi object)

export const notificationApi = {
  getAllNotifications: () => axios.get('/api/notifications'),
  getUnreadNotifications: () => axios.get('/api/notifications/unread'),
  getNotificationCount: () => axios.get('/api/notifications/count'),
  getNotificationsByStatus: (status) => axios.get(`/api/notifications/status/${status}`),
  
  // The key fix: Properly formatted notification creation method
  createNotification: (notificationData) => {
    // Always ensure recipient email is set correctly
    const formattedData = {
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'SYSTEM'
    };
    
    // Only include recipientEmail if it's provided and not empty
    if (notificationData.recipientEmail && notificationData.recipientEmail.trim() !== '') {
      formattedData.recipientEmail = notificationData.recipientEmail;
    } else {
      // If no recipient is specified, use the current user's email
      // This relies on the authentication context
      const token = localStorage.getItem('token');
      if (!token) {
        return Promise.reject(new Error('Not authenticated'));
      }
      
      // First get the current user's info if we don't have it
      return axios.get('/api/auth/me')
        .then(response => {
          formattedData.recipientEmail = response.data.email;
          return axios.post('/api/notifications/create', formattedData);
        });
    }
    
    return axios.post('/api/notifications/create', formattedData);
  },
  
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

function getFileExtension(contentType) {
  switch (contentType) {
    case 'PDF':
      return '.pdf';
    case 'VIDEO':
      return '.mp4';
    case 'LINK':
      return '.url';
    case 'QUIZ':
      return '.json';
    default:
      return '.txt';
  }
}

export default {
  authApi,
  userApi,
  courseApi,
  moduleApi,
  contentApi,
  assessmentApi,
  enrollmentApi,
  quizApi,
  notificationApi,
  adminApi,
};