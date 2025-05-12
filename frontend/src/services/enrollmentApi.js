// src/services/enrollmentApi.js
import axios from 'axios';

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
  
  // Mark content as completed for a student
  markContentAsCompleted: (courseId, contentId) => 
    axios.post(`/api/enrollments/course/${courseId}/content/${contentId}/complete`),
  
  // Mark assessment as completed for a student
  markAssessmentAsCompleted: (courseId, assessmentId) => 
    axios.post(`/api/enrollments/course/${courseId}/assessment/${assessmentId}/complete`),
  
  // Get enrollment certificate
  getEnrollmentCertificate: (enrollmentId) => 
    axios.get(`/api/enrollments/${enrollmentId}/certificate`, { responseType: 'blob' }),
  
  // Get student performance report
  getStudentPerformanceReport: (studentId, courseId) => 
    axios.get(`/api/enrollments/reports/student/${studentId}/course/${courseId}`),
  
  // Get course completion report
  getCourseCompletionReport: (courseId) => 
    axios.get(`/api/enrollments/reports/course/${courseId}/completion`)
};

export default enrollmentApi;