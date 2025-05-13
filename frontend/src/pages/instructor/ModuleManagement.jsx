// src/pages/instructor/ModuleManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Card,
  CardContent,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon,
  Folder as FolderIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { courseApi } from '../../services/api';
// Import moduleApi directly from the file
import moduleApi from '../../services/moduleApi';
import { toast } from 'react-toastify';

// Simple implementation of DragDropContext for now
// If you're using react-beautiful-dnd, make sure to install and import it
const DragDropContext = ({ children, onDragEnd }) => {
  return <div>{children}</div>;
};

const Droppable = ({ children, droppableId }) => {
  return <div data-droppable-id={droppableId}>{children({ innerRef: () => {}, placeholder: null })}</div>;
};

const Draggable = ({ children, draggableId, index }) => {
  return <div data-draggable-id={draggableId} data-index={index}>{children({ innerRef: () => {}, dragHandleProps: {}, draggableProps: {} })}</div>;
};

const ModuleManagement = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  
  const [newModule, setNewModule] = useState({
    title: '',
    description: ''
  });
  
  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchModules();
    }
  }, [courseId]);
  
  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getCourseById(courseId);
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchModules = async () => {
    try {
      setModuleLoading(true);
      console.log('Fetching modules for course ID:', courseId);
      const response = await moduleApi.getModulesByCourse(courseId);
      console.log('Modules response:', response);
      setModules(response.data || []);
      
      // Initialize expanded state
      const expandedState = {};
      if (response.data && response.data.length > 0) {
        response.data.forEach(module => {
          expandedState[module.moduleId] = false;
        });
      }
      setExpandedModules(expandedState);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to load modules');
    } finally {
      setModuleLoading(false);
    }
  };
  
  const handleOpenDialog = () => {
    setEditMode(false);
    setNewModule({
      title: '',
      description: ''
    });
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  const handleOpenEditDialog = (module) => {
    setEditMode(true);
    setSelectedModule(module);
    setNewModule({
      title: module.title,
      description: module.description || ''
    });
    setDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (module) => {
    setSelectedModule(module);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleModuleChange = (e) => {
    const { name, value } = e.target;
    setNewModule({
      ...newModule,
      [name]: value
    });
  };
  
  const handleCreateModule = async () => {
    if (!newModule.title.trim()) {
      toast.error('Please enter a module title');
      return;
    }
    
    try {
      const moduleData = {
        title: newModule.title,
        description: newModule.description || '',
        courseId: parseInt(courseId)
      };
      
      console.log('Creating module with data:', moduleData);
      const response = await moduleApi.createModule(moduleData);
      console.log('Module created:', response.data);
      
      // Update modules list
      setModules([...modules, response.data]);
      
      // Update expanded state
      setExpandedModules({
        ...expandedModules,
        [response.data.moduleId]: false
      });
      
      toast.success('Module created successfully');
      handleCloseDialog();
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error('Failed to create module: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const handleUpdateModule = async () => {
    if (!newModule.title.trim()) {
      toast.error('Please enter a module title');
      return;
    }
    
    try {
      const moduleData = {
        title: newModule.title,
        description: newModule.description || ''
      };
      
      await moduleApi.updateModule(selectedModule.moduleId, moduleData);
      
      // Update modules list
      setModules(modules.map(m => 
        m.moduleId === selectedModule.moduleId 
          ? { ...m, ...moduleData } 
          : m
      ));
      
      toast.success('Module updated successfully');
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Failed to update module');
    }
  };
  
  const handleDeleteModule = async () => {
    try {
      await moduleApi.deleteModule(selectedModule.moduleId);
      
      // Update modules list
      setModules(modules.filter(m => m.moduleId !== selectedModule.moduleId));
      
      // Update expanded state
      const newExpandedState = { ...expandedModules };
      delete newExpandedState[selectedModule.moduleId];
      setExpandedModules(newExpandedState);
      
      toast.success('Module deleted successfully');
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    }
  };
  
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const reorderedModules = [...modules];
    const [movedModule] = reorderedModules.splice(result.source.index, 1);
    reorderedModules.splice(result.destination.index, 0, movedModule);
    
    // Update the order index of modules
    const updatedModules = reorderedModules.map((module, index) => ({
      ...module,
      orderIndex: index
    }));
    
    setModules(updatedModules);
    
    // Save the new order to the backend
    try {
      const moduleOrderData = updatedModules.map((module, index) => ({
        moduleId: module.moduleId,
        orderIndex: index
      }));
      
      await moduleApi.updateModuleOrder(courseId, moduleOrderData);
    } catch (error) {
      console.error('Error updating module order:', error);
      toast.error('Failed to update module order');
      // Revert to original order by refetching
      fetchModules();
    }
  };
  
  const toggleExpandModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {course ? `Module Management: ${course.title}` : 'Module Management'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Module
        </Button>
      </Box>
      
      {moduleLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : modules.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <FolderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Modules Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create modules to organize your course content.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Create Your First Module
          </Button>
        </Paper>
      ) : (
        <Paper sx={{ p: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Organize your modules to structure your course content.
          </Alert>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="moduleList">
              {(provided) => (
                <List
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{ width: '100%' }}
                >
                  {modules.map((module, index) => (
                    <Draggable 
                      key={module.moduleId.toString()} 
                      draggableId={module.moduleId.toString()} 
                      index={index}
                    >
                      {(provided) => (
                        <div 
                          ref={provided.innerRef} 
                          {...provided.draggableProps}
                        >
                          <Card sx={{ mb: 2 }}>
                            <CardContent sx={{ p: 0 }}>
                              <ListItem>
                                <div {...provided.dragHandleProps}>
                                  <ListItemIcon>
                                    <DragIcon />
                                  </ListItemIcon>
                                </div>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Typography variant="subtitle1">
                                        {module.title}
                                      </Typography>
                                      <IconButton 
                                        size="small" 
                                        onClick={() => toggleExpandModule(module.moduleId)}
                                      >
                                        {expandedModules[module.moduleId] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                      </IconButton>
                                    </Box>
                                  }
                                  secondary={module.description || 'No description'}
                                />
                                <ListItemSecondaryAction>
                                  <Tooltip title="Edit Module">
                                    <IconButton 
                                      edge="end" 
                                      aria-label="edit" 
                                      onClick={() => handleOpenEditDialog(module)}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Module">
                                    <IconButton 
                                      edge="end" 
                                      aria-label="delete" 
                                      color="error"
                                      onClick={() => handleOpenDeleteDialog(module)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </ListItemSecondaryAction>
                              </ListItem>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        </Paper>
      )}
      
      {/* Create/Edit Module Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Module' : 'Create Module'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Module Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newModule.title}
            onChange={handleModuleChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newModule.description}
            onChange={handleModuleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={editMode ? handleUpdateModule : handleCreateModule} 
            variant="contained" 
            color="primary"
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Module Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Module</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the module "{selectedModule?.title}"? 
            This will also delete all content within this module.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteModule} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModuleManagement;