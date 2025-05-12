// src/services/moduleApi.js
import axios from 'axios';

export const moduleApi = {
  // Get all modules for a course
  getModulesByCourse: (courseId) => axios.get(`/api/module/course/${courseId}`),
  
  // Get a specific module by ID
  getModuleById: (moduleId) => axios.get(`/api/module/${moduleId}`),
  
  // Create a new module
  createModule: (moduleData) => axios.post('/api/module', moduleData),
  
  // Update an existing module
  updateModule: (moduleId, moduleData) => axios.put(`/api/module/${moduleId}`, moduleData),
  
  // Delete a module
  deleteModule: (moduleId) => axios.delete(`/api/module/${moduleId}`),
  
  // Update module order within a course
  updateModuleOrder: (courseId, moduleOrderData) => 
    axios.put(`/api/module/course/${courseId}/reorder`, moduleOrderData),
  
  // Get content for a specific module
  getModuleContent: (moduleId) => axios.get(`/api/module/${moduleId}/content`),
  
  // Add content to a module
  addContentToModule: (moduleId, contentId) => 
    axios.post(`/api/module/${moduleId}/content/${contentId}`),
  
  // Remove content from a module
  removeContentFromModule: (moduleId, contentId) => 
    axios.delete(`/api/module/${moduleId}/content/${contentId}`),
};

export default moduleApi;