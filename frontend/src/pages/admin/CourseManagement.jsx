// src/pages/admin/CourseManagement.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { courseApi, userApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AdminCourseManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [instructorsLoading, setInstructorsLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAssignInstructorDialog, setOpenAssignInstructorDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    tags: '',
    prerequisites: '',
    startDate: '',
    endDate: '',
    instructorId: '',
    isActive: true
  });

  // Close error alert
  const handleCloseError = () => {
    setApiError(null);
  };

  useEffect(() => {
    // Check if user is admin, redirect if not
    if (user && user.role !== 'ADMIN') {
      toast.error('Access denied. Admin permissions required.');
      navigate('/');
      return;
    }

    fetchAllCourses();
    fetchInstructors();
  }, [user, navigate]);

  const fetchAllCourses = async () => {
    try {
      setLoading(true);
      console.log('Fetching all courses...');
      const response = await courseApi.getAllCourses();
      console.log('Courses fetched successfully:', response.data);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      setApiError(`Failed to load courses: ${error.response?.data?.message || error.message}`);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      setInstructorsLoading(true);
      console.log('Fetching instructors...');
      const response = await userApi.getAllUsers();
      console.log('Users fetched:', response.data);
      const instructorsList = response.data.filter(user => user.role === 'INSTRUCTOR');
      console.log('Filtered instructors:', instructorsList);
      setInstructors(instructorsList);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      setApiError(`Failed to load instructors: ${error.response?.data?.message || error.message}`);
      toast.error('Failed to load instructors');
    } finally {
      setInstructorsLoading(false);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Handle both ISO strings and date objects
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const handleCreateCourse = async (e) => {
  if (e) e.preventDefault();
  
  try {
    setIsSubmitting(true);
    
    // Format the data according to the API expectations
    const courseData = {
      // Ensure name is set equal to title (required for backend)
      name: newCourse.title,
      title: newCourse.title,
      description: newCourse.description,
      tags: newCourse.tags ? newCourse.tags.split(',').map(tag => tag.trim()) : [],
      prerequisites: newCourse.prerequisites ? newCourse.prerequisites.split(',').map(prereq => prereq.trim()) : [],
      startDate: newCourse.startDate || new Date().toISOString().split('T')[0],
      endDate: newCourse.endDate || new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0],
      isActive: newCourse.isActive
    };

    // Only add instructor if specified
    if (newCourse.instructorId) {
      courseData.instructorId = newCourse.instructorId;
    }

    console.log('Creating course with data:', courseData);
    
    // Use the courseApi method instead of direct axios call
    const response = await courseApi.createCourse(courseData);
    
    console.log('Course created successfully:', response.data);
    toast.success('Course created successfully');
    setOpenCreateDialog(false);
    fetchAllCourses();
    setNewCourse({
      title: '',
      description: '',
      tags: '',
      prerequisites: '',
      startDate: '',
      endDate: '',
      instructorId: '',
      isActive: true
    });
  } catch (error) {
    console.error('Error creating course:', error);
    
    // Better error handling
    let errorMessage = 'Failed to create course';
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.error) {
        errorMessage = error.response.data.error;
      }
    }
    
    setApiError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

const handleUpdateCourse = async (e) => {
  if (e) e.preventDefault();
  
  try {
    setIsSubmitting(true);
    
    // Get the correct course ID (may be courseId or id)
    const courseId = selectedCourse.courseId || selectedCourse.id;
    
    if (!courseId) {
      throw new Error('Course ID is missing');
    }
    
    // Format the data according to API expectations
    const courseData = {
      // Ensure name is set equal to title (required for backend)
      name: selectedCourse.title,
      title: selectedCourse.title,
      description: selectedCourse.description,
      startDate: selectedCourse.startDate || new Date().toISOString().split('T')[0],
      endDate: selectedCourse.endDate || new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0],
      isActive: selectedCourse.isActive ?? true
    };

    // Handle tags and prerequisites
    if (typeof selectedCourse.tags === 'string' && selectedCourse.tags.trim() !== '') {
      courseData.tags = selectedCourse.tags.split(',').map(tag => tag.trim());
    } else if (Array.isArray(selectedCourse.tags)) {
      courseData.tags = selectedCourse.tags;
    }
    
    if (typeof selectedCourse.prerequisites === 'string' && selectedCourse.prerequisites.trim() !== '') {
      courseData.prerequisites = selectedCourse.prerequisites.split(',').map(prereq => prereq.trim());
    } else if (Array.isArray(selectedCourse.prerequisites)) {
      courseData.prerequisites = selectedCourse.prerequisites;
    }

    // Only add instructor if specified
    if (selectedCourse.instructorId) {
      courseData.instructorId = selectedCourse.instructorId;
    }

    console.log(`Updating course with ID: ${courseId}`);
    console.log('Update data:', courseData);
    
    // Use the courseApi method instead of direct axios call
    const response = await courseApi.updateCourse(courseId, courseData);
    
    console.log('Course updated successfully:', response.data);
    toast.success('Course updated successfully');
    setOpenEditDialog(false);
    fetchAllCourses();
  } catch (error) {
    console.error('Error updating course:', error);
    
    // Better error handling
    let errorMessage = 'Failed to update course';
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.error) {
        errorMessage = error.response.data.error;
      }
    }
    
    setApiError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleDeleteCourse = async () => {
    try {
      setIsSubmitting(true);
      console.log('Deleting course with ID:', selectedCourse.id);
      await courseApi.deleteCourse(selectedCourse.id);
      toast.success('Course deleted successfully');
      setOpenDeleteDialog(false);
      fetchAllCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      setApiError(`Failed to delete course: ${error.response?.data?.message || error.message}`);
      toast.error('Failed to delete course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignInstructor = async () => {
    if (!selectedInstructorId) {
      toast.error('Please select an instructor');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Assigning instructor:', selectedInstructorId, 'to course:', selectedCourse.id);
      const response = await courseApi.assignInstructor(selectedCourse.id, selectedInstructorId);
      console.log('Instructor assigned successfully:', response.data);
      toast.success('Instructor assigned successfully');
      setOpenAssignInstructorDialog(false);
      fetchAllCourses();
    } catch (error) {
      console.error('Error assigning instructor:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      setApiError(`Failed to assign instructor: ${error.response?.data?.message || error.message}`);
      toast.error('Failed to assign instructor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInstructorName = (instructorId) => {
    if (!instructorId) return 'Not assigned';
    const instructor = instructors.find(i => i.id === instructorId || i.userId === instructorId);
    return instructor ? instructor.name : 'Not assigned';
  };

  const handleViewEnrollments = (courseId) => {
    navigate(`/admin/courses/${courseId}/enrollments`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Snackbar open={!!apiError} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {apiError}
        </Alert>
      </Snackbar>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Course Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Create Course
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : courses.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>No Courses Found</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No courses have been created yet. Click the "Create Course" button to add your first course.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Create Course
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id || course.courseId}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {course.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                        <strong>Instructor:</strong>&nbsp;
                        {getInstructorName(course.instructorId)}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EventIcon fontSize="small" sx={{ mr: 1 }} />
                        <strong>Start Date:</strong>&nbsp;
                        {course.startDate ? new Date(course.startDate).toLocaleDateString() : 'Not set'}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EventIcon fontSize="small" sx={{ mr: 1 }} />
                        <strong>End Date:</strong>&nbsp;
                        {course.endDate ? new Date(course.endDate).toLocaleDateString() : 'Not set'}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                        <strong>Status:</strong>&nbsp;
                        <Chip 
                          label={course.isActive ? 'Active' : 'Inactive'} 
                          color={course.isActive ? 'success' : 'default'} 
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      {course.tags && (
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {course.tags.split(',').map((tag, index) => (
                            <Chip key={index} label={tag.trim()} size="small" />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        console.log('Edit course clicked for:', course);
                        // Ensure we're using the correct ID field
                        const courseId = course.id || course.courseId;
                        setSelectedCourse({
                          ...course,
                          id: courseId  // Make sure the id field is set correctly
                        });
                        setOpenEditDialog(true);
                      }}
                      title="Edit Course"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        console.log('Delete course clicked for:', course);
                        // Ensure we're using the correct ID field
                        const courseId = course.id || course.courseId;
                        setSelectedCourse({
                          ...course,
                          id: courseId  // Make sure the id field is set correctly
                        });
                        setOpenDeleteDialog(true);
                      }}
                      title="Delete Course"
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        console.log('Assign instructor clicked for:', course);
                        // Ensure we're using the correct ID field
                        const courseId = course.id || course.courseId;
                        setSelectedCourse({
                          ...course,
                          id: courseId  // Make sure the id field is set correctly
                        });
                        setSelectedInstructorId(course.instructorId || '');
                        setOpenAssignInstructorDialog(true);
                      }}
                      title="Assign Instructor"
                    >
                      <PersonIcon />
                    </IconButton>
                    <Button
                      size="small"
                      onClick={() => handleViewEnrollments(course.id || course.courseId)}
                      title="View Enrollments"
                    >
                      Enrollments
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Create Course Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => !isSubmitting && setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Course</DialogTitle>
        <form onSubmit={handleCreateCourse}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              type="text"
              fullWidth
              value={newCourse.title}
              onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              required
              disabled={isSubmitting}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description"
              multiline
              rows={4}
              fullWidth
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              required
              disabled={isSubmitting}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Tags (comma separated)"
              type="text"
              fullWidth
              value={newCourse.tags}
              onChange={(e) => setNewCourse({ ...newCourse, tags: e.target.value })}
              disabled={isSubmitting}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Prerequisites"
              type="text"
              fullWidth
              value={newCourse.prerequisites}
              onChange={(e) => setNewCourse({ ...newCourse, prerequisites: e.target.value })}
              disabled={isSubmitting}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newCourse.startDate}
              onChange={(e) => setNewCourse({ ...newCourse, startDate: e.target.value })}
              disabled={isSubmitting}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newCourse.endDate}
              onChange={(e) => setNewCourse({ ...newCourse, endDate: e.target.value })}
              disabled={isSubmitting}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Instructor</InputLabel>
              <Select
                value={newCourse.instructorId}
                label="Instructor"
                onChange={(e) => setNewCourse({ ...newCourse, instructorId: e.target.value })}
                disabled={isSubmitting || instructorsLoading}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {instructors.map((instructor) => (
                  <MenuItem key={instructor.id || instructor.userId} value={instructor.id || instructor.userId}>
                    {instructor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={newCourse.isActive}
                  onChange={(e) => setNewCourse({ ...newCourse, isActive: e.target.checked })}
                  disabled={isSubmitting}
                />
              }
              label="Active"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => !isSubmitting && setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Course</DialogTitle>
        {selectedCourse && (
          <form onSubmit={handleUpdateCourse}>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Title"
                type="text"
                fullWidth
                value={selectedCourse.title || ''}
                onChange={(e) => setSelectedCourse({ ...selectedCourse, title: e.target.value })}
                required
                disabled={isSubmitting}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Description"
                multiline
                rows={4}
                fullWidth
                value={selectedCourse.description || ''}
                onChange={(e) => setSelectedCourse({ ...selectedCourse, description: e.target.value })}
                required
                disabled={isSubmitting}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Tags (comma separated)"
                type="text"
                fullWidth
                value={selectedCourse.tags || ''}
                onChange={(e) => setSelectedCourse({ ...selectedCourse, tags: e.target.value })}
                disabled={isSubmitting}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Prerequisites"
                type="text"
                fullWidth
                value={selectedCourse.prerequisites || ''}
                onChange={(e) => setSelectedCourse({ ...selectedCourse, prerequisites: e.target.value })}
                disabled={isSubmitting}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Start Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formatDateForInput(selectedCourse.startDate)}
                onChange={(e) => setSelectedCourse({ ...selectedCourse, startDate: e.target.value })}
                disabled={isSubmitting}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="End Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formatDateForInput(selectedCourse.endDate)}
                onChange={(e) => setSelectedCourse({ ...selectedCourse, endDate: e.target.value })}
                disabled={isSubmitting}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Instructor</InputLabel>
                <Select
                  value={selectedCourse.instructorId || ''}
                  label="Instructor"
                  onChange={(e) => setSelectedCourse({ ...selectedCourse, instructorId: e.target.value })}
                  disabled={isSubmitting || instructorsLoading}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {instructors.map((instructor) => (
                    <MenuItem key={instructor.id || instructor.userId} value={instructor.id || instructor.userId}>
                      {instructor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedCourse.isActive || false}
                    onChange={(e) => setSelectedCourse({ ...selectedCourse, isActive: e.target.checked })}
                    disabled={isSubmitting}
                  />
                }
                label="Active"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEditDialog(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Update'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => !isSubmitting && setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedCourse?.title}? This action cannot be undone.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            All associated course content, enrollments, and student data will be permanently deleted.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteCourse} 
            color="error" 
            variant="contained" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Instructor Dialog */}
      <Dialog
        open={openAssignInstructorDialog}
        onClose={() => !isSubmitting && setOpenAssignInstructorDialog(false)}
      >
        <DialogTitle>Assign Instructor</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Select an instructor to assign to <strong>{selectedCourse?.title}</strong>
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Instructor</InputLabel>
            <Select
              value={selectedInstructorId}
              label="Instructor"
              onChange={(e) => setSelectedInstructorId(e.target.value)}
              disabled={isSubmitting || instructorsLoading}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {instructors.map((instructor) => (
                <MenuItem key={instructor.id || instructor.userId} value={instructor.id || instructor.userId}>
                  {instructor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignInstructorDialog(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignInstructor} 
            variant="contained" 
            color="primary" 
            disabled={isSubmitting || !selectedInstructorId}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCourseManagement;