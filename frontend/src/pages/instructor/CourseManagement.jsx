// src/pages/instructor/CourseManagement.jsx
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
  FormControlLabel,
  Switch,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { courseApi, userApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const CourseManagement = () => {
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
    // Check if user is admin or instructor, redirect if not
    if (user && user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      toast.error('Access denied. Instructor or Admin permissions required.');
      navigate('/');
      return;
    }

    // Fetch courses based on role
    if (user?.role === 'ADMIN') {
      fetchAllCourses();
    } else {
      // For instructors, only fetch their courses
      fetchInstructorCourses();
    }
    
    // Admin can fetch all instructors, instructor only needs their own info
    if (user?.role === 'ADMIN') {
      fetchInstructors();
    } else {
      setInstructorsLoading(false);
    }
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
      setApiError(`Failed to load courses: ${error.response?.data?.message || error.message}`);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      console.log('Fetching instructor courses...');
      const response = await courseApi.getInstructorCourses();
      console.log('Instructor courses fetched successfully:', response.data);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching instructor courses:', error);
      setApiError(`Failed to load courses: ${error.response?.data?.message || error.message}`);
      toast.error('Failed to load your courses');
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
      } else if (user.role === 'INSTRUCTOR') {
        // If instructor is creating course, set themselves as instructor
        courseData.instructorId = user.id || user.userId;
      }

      console.log('Creating course with data:', courseData);
      
      // Use the courseApi method
      const response = await courseApi.createCourse(courseData);
      
      console.log('Course created successfully:', response.data);
      toast.success('Course created successfully');
      setOpenCreateDialog(false);
      
      // Refresh course list based on user role
      if (user.role === 'ADMIN') {
        fetchAllCourses();
      } else {
        fetchInstructorCourses();
      }
      
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

      // Only add instructor if specified or if admin (instructors can't change instructor)
      if (user.role === 'ADMIN' && selectedCourse.instructorId) {
        courseData.instructorId = selectedCourse.instructorId;
      }

      console.log(`Updating course with ID: ${courseId}`);
      console.log('Update data:', courseData);
      
      // Use the courseApi method
      const response = await courseApi.updateCourse(courseId, courseData);
      
      console.log('Course updated successfully:', response.data);
      toast.success('Course updated successfully');
      setOpenEditDialog(false);
      
      // Refresh course list based on user role
      if (user.role === 'ADMIN') {
        fetchAllCourses();
      } else {
        fetchInstructorCourses();
      }
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
      const courseId = selectedCourse.courseId || selectedCourse.id;
      
      if (!courseId) {
        throw new Error('Course ID is missing');
      }
      
      console.log('Deleting course with ID:', courseId);
      await courseApi.deleteCourse(courseId);
      
      toast.success('Course deleted successfully');
      setOpenDeleteDialog(false);
      setCourses(courses.filter(course => {
        const id = course.courseId || course.id;
        return id !== courseId;
      }));
    } catch (error) {
      console.error('Error deleting course:', error);
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
      const courseId = selectedCourse.courseId || selectedCourse.id;
      
      if (!courseId) {
        throw new Error('Course ID is missing');
      }
      
      console.log('Assigning instructor:', selectedInstructorId, 'to course:', courseId);
      const response = await courseApi.assignInstructor(courseId, selectedInstructorId);
      
      console.log('Instructor assigned successfully:', response.data);
      toast.success('Instructor assigned successfully');
      setOpenAssignInstructorDialog(false);
      
      // Refresh course list based on user role
      if (user.role === 'ADMIN') {
        fetchAllCourses();
      } else {
        fetchInstructorCourses();
      }
    } catch (error) {
      console.error('Error assigning instructor:', error);
      setApiError(`Failed to assign instructor: ${error.response?.data?.message || error.message}`);
      toast.error('Failed to assign instructor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInstructorName = (instructorId) => {
    if (!instructorId) return 'Not assigned';
    const instructor = instructors.find(i => {
      return String(i.id) === String(instructorId) || 
             String(i.userId) === String(instructorId);
    });
    return instructor ? instructor.name : 'Not assigned';
  };

  const handleViewEnrollments = (courseId) => {
    const role = user?.role.toLowerCase();
    navigate(`/${role}/courses/${courseId}/enrollments`);
  };

  const isAdminUser = user?.role === 'ADMIN';

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
            {isAdminUser ? 'Course Management' : 'My Courses'}
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
            {courses.map((course) => {
              const courseId = course.id || course.courseId;
              return (
                <Grid item xs={12} sm={6} md={4} key={courseId}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {course.title || course.name}
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
                          <SchoolIcon fontSize="small" sx={{ mr: 1 }} />
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
                            {typeof course.tags === 'string' 
                              ? course.tags.split(',').map((tag, index) => (
                                  <Chip key={index} label={tag.trim()} size="small" />
                                ))
                              : Array.isArray(course.tags) && course.tags.map((tag, index) => (
                                  <Chip key={index} label={tag} size="small" />
                                ))
                            }
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          console.log('Edit course clicked for:', course);
                          setSelectedCourse({
                            ...course,
                            id: courseId
                          });
                          setOpenEditDialog(true);
                        }}
                      >
                        <Tooltip title="Edit Course">
                          <EditIcon />
                        </Tooltip>
                      </IconButton>
                      
                      {isAdminUser && (
                        <>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              console.log('Delete course clicked for:', course);
                              setSelectedCourse({
                                ...course,
                                id: courseId
                              });
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <Tooltip title="Delete Course">
                              <DeleteIcon />
                            </Tooltip>
                          </IconButton>
                          
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              console.log('Assign instructor clicked for:', course);
                              setSelectedCourse({
                                ...course,
                                id: courseId
                              });
                              setSelectedInstructorId(course.instructorId || '');
                              setOpenAssignInstructorDialog(true);
                            }}
                          >
                            <Tooltip title="Assign Instructor">
                              <PersonIcon />
                            </Tooltip>
                          </IconButton>
                        </>
                      )}
                      
                      <Button
                        size="small"
                        startIcon={<PeopleIcon />}
                        onClick={() => handleViewEnrollments(courseId)}
                      >
                        Enrollments
                      </Button>
                      
                      <Button
                        size="small"
                        startIcon={<AssignmentIcon />}
                        onClick={() => navigate(`/instructor/courses/${courseId}/content`)}
                      >
                        Content
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
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
            
            {isAdminUser && (
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
            )}
            
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
                value={selectedCourse.title || selectedCourse.name || ''}
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
                value={
                  Array.isArray(selectedCourse.tags)
                    ? selectedCourse.tags.join(', ')
                    : selectedCourse.tags || ''
                }
                onChange={(e) => setSelectedCourse({ ...selectedCourse, tags: e.target.value })}
                disabled={isSubmitting}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Prerequisites"
                type="text"
                fullWidth
                value={
                  Array.isArray(selectedCourse.prerequisites)
                    ? selectedCourse.prerequisites.join(', ')
                    : selectedCourse.prerequisites || ''
                }
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
              
              {isAdminUser && (
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
              )}
              
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

      {/* Delete Dialog (Admin Only) */}
      {isAdminUser && (
        <Dialog
          open={openDeleteDialog}
          onClose={() => !isSubmitting && setOpenDeleteDialog(false)}
        >
          <DialogTitle>Delete Course</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {selectedCourse?.title || selectedCourse?.name}? This action cannot be undone.
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
      )}

      {/* Assign Instructor Dialog (Admin Only) */}
      {isAdminUser && (
        <Dialog
          open={openAssignInstructorDialog}
          onClose={() => !isSubmitting && setOpenAssignInstructorDialog(false)}
        >
          <DialogTitle>Assign Instructor</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Select an instructor to assign to <strong>{selectedCourse?.title || selectedCourse?.name}</strong>
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
      )}
    </Box>
  );
};

export default CourseManagement;