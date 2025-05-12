import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  Alert,
  Card,
  CardContent,
  Collapse,
  Tooltip,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { moduleApi, courseApi, contentApi } from '../../services/api';

const ModuleManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isInstructor = user?.role === 'INSTRUCTOR';
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [contentByModule, setContentByModule] = useState({});
  
  // New module form state
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    orderIndex: 0
  });
  
  useEffect(() => {
    if (!isInstructor) {
      navigate('/');
      toast.error('Access denied. Instructor permissions required.');
      return;
    }
    
    fetchCourseData();
  }, [courseId, isInstructor, navigate]);
  
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await courseApi.getCourseById(courseId);
      setCourse(courseResponse.data);
      
      // Fetch modules for this course
      const modulesResponse = await moduleApi.getModulesByCourse(courseId);
      
      // Sort modules by orderIndex
      const sortedModules = modulesResponse.data.sort((a, b) => a.orderIndex - b.orderIndex);
      setModules(sortedModules);
      
      // Initialize expanded state for all modules
      const expandedState = {};
      sortedModules.forEach(module => {
        expandedState[module.moduleId] = false;
      });
      setExpandedModules(expandedState);
      
      // Fetch content for each module
      const contentData = {};
      await Promise.all(
        sortedModules.map(async (module) => {
          try {
            const contentResponse = await contentApi.getContentByCourse(courseId);
            // Filter content by moduleId
            contentData[module.moduleId] = contentResponse.data.filter(
              content => content.moduleId === module.moduleId
            );
          } catch (error) {
            console.error(`Error fetching content for module ${module.moduleId}:`, error);
            contentData[module.moduleId] = [];
          }
        })
      );
      
      setContentByModule(contentData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course data');
      setLoading(false);
    }
  };
  
  const handleCreateModule = () => {
    setNewModule({
      title: '',
      description: '',
      orderIndex: modules.length // Set as the last module by default
    });
    setCreateDialogOpen(true);
  };
  
  const handleEditModule = (module) => {
    setSelectedModule(module);
    setEditDialogOpen(true);
  };
  
  const handleDeleteModule = (module) => {
    setSelectedModule(module);
    setDeleteDialogOpen(true);
  };
  
  const handleToggleExpand = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };
  
  const handleSubmitNewModule = async () => {
    try {
      // Validate required fields
      if (!newModule.title) {
        toast.error('Module title is required');
        return;
      }
      
      // Prepare module data
      const moduleData = {
        ...newModule,
        courseId: Number(courseId)
      };
      
      // Create new module
      const response = await moduleApi.createModule(moduleData);
      
      // Update modules list with the new module
      setModules([...modules, response.data]);
      
      // Initialize expanded state and content for the new module
      setExpandedModules(prev => ({
        ...prev,
        [response.data.moduleId]: false
      }));
      
      setContentByModule(prev => ({
        ...prev,
        [response.data.moduleId]: []
      }));
      
      toast.success('Module created successfully');
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error('Failed to create module');
    }
  };
  
  const handleUpdateModule = async () => {
    try {
      // Validate required fields
      if (!selectedModule.title) {
        toast.error('Module title is required');
        return;
      }
      
      // Prepare module data
      const moduleData = {
        title: selectedModule.title,
        description: selectedModule.description,
        orderIndex: selectedModule.orderIndex
      };
      
      // Update module
      await moduleApi.updateModule(selectedModule.moduleId, moduleData);
      
      // Update modules list with the updated module
      setModules(modules.map(m => 
        m.moduleId === selectedModule.moduleId ? { ...m, ...moduleData } : m
      ));
      
      toast.success('Module updated successfully');
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Failed to update module');
    }
  };
  
  const handleConfirmDelete = async () => {
    try {
      // Check if module has content
      const moduleContent = contentByModule[selectedModule.moduleId] || [];
      if (moduleContent.length > 0) {
        toast.error('Cannot delete module with content. Please remove all content first.');
        setDeleteDialogOpen(false);
        return;
      }
      
      // Delete module
      await moduleApi.deleteModule(selectedModule.moduleId);
      
      // Update modules list
      setModules(modules.filter(m => m.moduleId !== selectedModule.moduleId));
      
      // Remove from expanded state and content mapping
      const updatedExpandedModules = { ...expandedModules };
      delete updatedExpandedModules[selectedModule.moduleId];
      setExpandedModules(updatedExpandedModules);
      
      const updatedContentByModule = { ...contentByModule };
      delete updatedContentByModule[selectedModule.moduleId];
      setContentByModule(updatedContentByModule);
      
      toast.success('Module deleted successfully');
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    }
  };
  
  const handleDragEnd = async (result) => {
    // Drop outside the list
    if (!result.destination) return;
    
    // Same position
    if (result.destination.index === result.source.index) return;
    
    // Reorder module list
    const reorderedModules = Array.from(modules);
    const [movedModule] = reorderedModules.splice(result.source.index, 1);
    reorderedModules.splice(result.destination.index, 0, movedModule);
    
    // Update orderIndex for all modules
    const updatedModules = reorderedModules.map((module, index) => ({
      ...module,
      orderIndex: index
    }));
    
    setModules(updatedModules);
    
    // Update order on the server
    try {
      await moduleApi.updateModuleOrder(courseId, 
        updatedModules.map(m => ({ 
          moduleId: m.moduleId, 
          orderIndex: m.orderIndex 
        }))
      );
      toast.success('Module order updated');
    } catch (error) {
      console.error('Error updating module order:', error);
      toast.error('Failed to update module order');
      // Revert to original order on error
      fetchCourseData();
    }
  };
  
  const handleAddContent = () => {
    navigate(`/instructor/courses/${courseId}/content`);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {course?.title || 'Course Modules'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Organize your course content into modules
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateModule}
          >
            Create Module
          </Button>
        </Box>
        
        {modules.length === 0 ? (
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <CardContent>
              <FolderIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Modules Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Start organizing your course by creating modules.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateModule}
              >
                Create Your First Module
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Paper sx={{ mt: 2 }}>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="modules">
                {(provided) => (
                  <List {...provided.droppableProps} ref={provided.innerRef}>
                    {modules.map((module, index) => (
                      <Draggable 
                        key={module.moduleId.toString()} 
                        draggableId={module.moduleId.toString()} 
                        index={index}
                      >
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps}>
                            <Paper sx={{ mb: 2, overflow: 'hidden' }}>
                              <ListItem 
                                sx={{ 
                                  bgcolor: 'background.paper',
                                  borderBottom: expandedModules[module.moduleId] ? 1 : 0,
                                  borderColor: 'divider'
                                }}
                              >
                                <ListItemIcon {...provided.dragHandleProps}>
                                  <DragIcon />
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography variant="h6">
                                      {index + 1}. {module.title}
                                    </Typography>
                                  }
                                  secondary={module.description}
                                />
                                <ListItemSecondaryAction>
                                  <IconButton edge="end" onClick={() => handleToggleExpand(module.moduleId)}>
                                    {expandedModules[module.moduleId] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                  </IconButton>
                                  <IconButton edge="end" onClick={() => handleEditModule(module)}>
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton edge="end" onClick={() => handleDeleteModule(module)}>
                                    <DeleteIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                              <Collapse in={expandedModules[module.moduleId]} timeout="auto" unmountOnExit>
                                <Box sx={{ p: 2 }}>
                                  <Typography variant="subtitle1" gutterBottom>
                                    Content in this module:
                                  </Typography>
                                  {(contentByModule[module.moduleId]?.length > 0) ? (
                                    <List dense>
                                      {contentByModule[module.moduleId].map((content) => (
                                        <ListItem key={content.contentId}>
                                          <ListItemText
                                            primary={content.title}
                                            secondary={`Type: ${content.type}`}
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      No content in this module yet.
                                    </Typography>
                                  )}
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddContent}
                                    sx={{ mt: 1 }}
                                  >
                                    Add Content
                                  </Button>
                                </Box>
                              </Collapse>
                            </Paper>
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
      </Paper>
      
      {/* Create Module Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Module</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="Module Title"
            fullWidth
            required
            value={newModule.title}
            onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
          />
          <TextField
            margin="normal"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newModule.description}
            onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
          />
          <TextField
            margin="normal"
            label="Order Index"
            type="number"
            fullWidth
            value={newModule.orderIndex}
            onChange={(e) => setNewModule({ ...newModule, orderIndex: parseInt(e.target.value) || 0 })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitNewModule} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Module Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Module</DialogTitle>
        <DialogContent>
          {selectedModule && (
            <>
              <TextField
                autoFocus
                margin="normal"
                label="Module Title"
                fullWidth
                required
                value={selectedModule.title}
                onChange={(e) => setSelectedModule({ ...selectedModule, title: e.target.value })}
              />
              <TextField
                margin="normal"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={selectedModule.description}
                onChange={(e) => setSelectedModule({ ...selectedModule, description: e.target.value })}
              />
              <TextField
                margin="normal"
                label="Order Index"
                type="number"
                fullWidth
                value={selectedModule.orderIndex}
                onChange={(e) => setSelectedModule({ ...selectedModule, orderIndex: parseInt(e.target.value) || 0 })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateModule} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Module Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Module</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete module "{selectedModule?.title}"?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. Modules with content cannot be deleted.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModuleManagement;