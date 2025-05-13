// src/services/moduleApi.js
import axios from 'axios';

const moduleApi = {
  // Get all modules for a course
  getModulesByCourse: (courseId) => {
    console.log('Fetching modules for course:', courseId);
    return axios.get(`/api/module/course/${courseId}`);
  },
  
  // Get a specific module by ID
  getModuleById: (moduleId) => {
    return axios.get(`/api/module/${moduleId}`);
  },
  
  // Create a new module
  createModule: (moduleData) => {
    console.log('Creating module with data:', moduleData);
    if (!moduleData.title) {
      return Promise.reject(new Error('Module title is required'));
    }
    
    if (!moduleData.courseId) {
      return Promise.reject(new Error('Course ID is required'));
    }
    
    return axios.post('/api/module', moduleData);
  },
  
  // Update an existing module
  updateModule: (moduleId, moduleData) => {
    if (!moduleId) {
      return Promise.reject(new Error('Module ID is required'));
    }
    
    return axios.put(`/api/module/${moduleId}`, moduleData);
  },
  
  // Delete a module
  deleteModule: (moduleId) => {
    if (!moduleId) {
      return Promise.reject(new Error('Module ID is required'));
    }
    
    return axios.delete(`/api/module/${moduleId}`);
  },
  
  // Update module order within a course
  updateModuleOrder: (courseId, moduleOrderData) => {
    return axios.put(`/api/module/course/${courseId}/reorder`, moduleOrderData);
  },
  
  // Get content for a specific module
  getModuleContent: (moduleId) => {
    return axios.get(`/api/module/${moduleId}/content`);
  },
  
  // Add content to a module
  addContentToModule: (moduleId, contentId) => {
    return axios.post(`/api/module/${moduleId}/content/${contentId}`);
  },
  
  // Remove content from a module
  removeContentFromModule: (moduleId, contentId) => {
    return axios.delete(`/api/module/${moduleId}/content/${contentId}`);
  }
};

export default moduleApi;