// src/services/quizApi.js
import axios from 'axios';

export const quizApi = {
  // Get all quizzes
  getAllQuizzes: () => axios.get('/api/quizzes'),
  
  // Get active quizzes
  getActiveQuizzes: () => axios.get('/api/quizzes?active=true'),
  
  // Get a specific quiz by ID
  getQuizById: (quizId) => axios.get(`/api/quizzes/${quizId}`),
  
  // Create a new quiz
  createQuiz: (quizData) => axios.post('/api/quizzes', quizData),
  
  // Update an existing quiz
  updateQuiz: (quizId, quizData) => axios.put(`/api/quizzes/${quizId}`, quizData),
  
  // Delete a quiz
  deleteQuiz: (quizId) => axios.delete(`/api/quizzes/${quizId}`),
  
  // Submit a quiz
  submitQuiz: (quizId, answers, studentId, timeSpentInSeconds) => 
    axios.post(`/api/quizzes/${quizId}/submit?studentId=${studentId}&timeSpentInSeconds=${timeSpentInSeconds}`, answers),
  
  // Get quiz statistics
  getQuizStatistics: (quizId) => axios.get(`/api/quizzes/${quizId}/statistics`),
  
  // Get quiz submissions for an instructor
  getQuizSubmissions: (quizId) => axios.get(`/api/quizzes/${quizId}/submissions`),
  
  // Get a specific quiz submission
  getQuizSubmission: (submissionId) => axios.get(`/api/quizzes/submissions/${submissionId}`),
  
  // Get quiz results for a student
  getStudentQuizResults: (quizId, studentId) => 
    axios.get(`/api/quizzes/${quizId}/results?studentId=${studentId}`),
  
  // Get all quiz results for a course
  getCourseQuizResults: (courseId) => axios.get(`/api/quizzes/course/${courseId}/results`),
  
  // Export quiz results
  exportQuizResults: (quizId, format = 'csv') => 
    axios.get(`/api/quizzes/${quizId}/export?format=${format}`, { responseType: 'blob' }),
};

export default quizApi;