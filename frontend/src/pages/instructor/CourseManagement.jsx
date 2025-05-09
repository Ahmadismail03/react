import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { courseApi, contentApi, assessmentApi } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const CourseManagement = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedTab, setSelectedTab] = useState(0)
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    tags: '',
    prerequisites: '',
    startDate: '',
    endDate: '',
  })
  const [courseContent, setCourseContent] = useState([])
  const [courseStudents, setCourseStudents] = useState([])
  const [contentLoading, setContentLoading] = useState(false)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchInstructorCourses()
  }, [])

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true)
      const response = await courseApi.getInstructorCourses()
      setCourses(response.data)
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourseContent = async (courseId) => {
    try {
      setContentLoading(true)
      const response = await contentApi.getContentByCourse(courseId)
      setCourseContent(response.data)
    } catch (error) {
      console.error('Error fetching course content:', error)
      toast.error('Failed to load course content')
    } finally {
      setContentLoading(false)
    }
  }

  const fetchCourseStudents = async (courseId) => {
    try {
      setStudentsLoading(true)
      const response = await courseApi.getCourseStudents(courseId)
      setCourseStudents(response.data)
    } catch (error) {
      console.error('Error fetching course students:', error)
      toast.error('Failed to load enrolled students')
    } finally {
      setStudentsLoading(false)
    }
  }

  const handleCreateCourse = () => {
    setOpenCreateDialog(true)
  }

  const handleEditCourse = (course) => {
    setSelectedCourse(course)
    setOpenEditDialog(true)
  }

  const handleDeleteCourse = (course) => {
    setSelectedCourse(course)
    setOpenDeleteDialog(true)
  }

  const handleViewCourseDetails = (course) => {
    console.log('Selected course:', course);
    setSelectedCourse(course)
    setSelectedTab(0)
    // Use courseId if available, otherwise fall back to id
    const courseIdToUse = course.courseId || course.id;
    console.log(`Fetching content for course ID: ${courseIdToUse}`);
    fetchCourseContent(courseIdToUse)
  }

  const handleViewStudents = (course) => {
    setSelectedCourse(course)
    setSelectedTab(1)
    // Use courseId if available, otherwise fall back to id
    const courseIdToUse = course.courseId || course.id;
    console.log(`Fetching students for course ID: ${courseIdToUse}`);
    fetchCourseStudents(courseIdToUse)
  }

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue)
    if (newValue === 0 && selectedCourse) {
      fetchCourseContent(selectedCourse.id)
    } else if (newValue === 1 && selectedCourse) {
      fetchCourseStudents(selectedCourse.id)
    }
  }

  const handleCreateDialogClose = () => {
    setOpenCreateDialog(false)
    setNewCourse({
      title: '',
      description: '',
      tags: '',
      prerequisites: '',
      startDate: '',
      endDate: '',
    })
  }

  const handleEditDialogClose = () => {
    setOpenEditDialog(false)
  }

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false)
  }

  const handleNewCourseChange = (event) => {
    setNewCourse({
      ...newCourse,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmitNewCourse = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return; // Prevent double submissions
    
    try {
      setIsSubmitting(true); // Set submitting state to true
      const courseData = {
        ...newCourse,
        tags: newCourse.tags.split(',').map(tag => tag.trim()),
        prerequisites: newCourse.prerequisites.split(',').map(prereq => prereq.trim()),
        // Convert string dates to LocalDate format if provided
        startDate: newCourse.startDate ? newCourse.startDate : null,
        endDate: newCourse.endDate ? newCourse.endDate : null
      }
      const response = await courseApi.createCourse(courseData)
      setCourses([...courses, response.data])
      toast.success('Course created successfully')
      handleCreateDialogClose()
    } catch (error) {
      console.error('Error creating course:', error)
      toast.error('Failed to create course')
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  }

  const handleUpdateCourse = async (e) => {
    if (e) e.preventDefault();
    try {
      // Ensure we're using the correct property for the course ID
      const courseIdToUse = selectedCourse.courseId || selectedCourse.id;
      
      if (!courseIdToUse) {
        console.error('Course ID is undefined');
        toast.error('Cannot update course: Missing course ID');
        return;
      }
      
      const courseData = {
        name: selectedCourse.title,
        title: selectedCourse.title,
        description: selectedCourse.description,
        tags: Array.isArray(selectedCourse.tags) 
          ? selectedCourse.tags 
          : (selectedCourse.tags ? selectedCourse.tags.split(',').map(tag => tag.trim()) : []),
        prerequisites: Array.isArray(selectedCourse.prerequisites) 
          ? selectedCourse.prerequisites 
          : (selectedCourse.prerequisites ? selectedCourse.prerequisites.split(',').map(prereq => prereq.trim()) : []),
      }
      
      await courseApi.updateCourse(courseIdToUse, courseData)
      
      // Update the courses list, checking for both possible ID properties
      setCourses(courses.map(c => {
        const cId = c.courseId || c.id;
        return cId === courseIdToUse ? { ...c, ...courseData } : c;
      }))
      
      toast.success('Course updated successfully')
      handleEditDialogClose()
    } catch (error) {
      console.error('Error updating course:', error)
      toast.error('Failed to update course')
    }
  }

  const handleConfirmDelete = async () => {
    try {
      // Ensure we're using the correct property for the course ID
      const courseIdToUse = selectedCourse.courseId || selectedCourse.id;
      
      // Check if we have a valid course ID before attempting to delete
      if (!courseIdToUse) {
        console.error('Cannot delete course: Invalid course ID');
        toast.error('Failed to delete course: Invalid course ID');
        handleDeleteDialogClose();
        return;
      }
      
      await courseApi.deleteCourse(courseIdToUse);
      // Update the courses list, checking for both ID properties
      setCourses(courses.filter(c => (c.id !== courseIdToUse && c.courseId !== courseIdToUse)));
      toast.success('Course deleted successfully');
      handleDeleteDialogClose();
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  }

  const handleAddContent = () => {
    // Navigate to content upload page
    if (selectedCourse) {
      // Ensure we're using the correct property for the course ID
      const courseIdToUse = selectedCourse.courseId || selectedCourse.id;
      navigate(`/instructor/courses/${courseIdToUse}/content`)
      console.log(`Navigating to content upload for course: ${courseIdToUse}`);
    } else {
      toast.error('Please select a course first')
    }
  }

  const handleAddAssessment = () => {
    // Navigate to assessment creation page
    if (selectedCourse) {
      // Ensure we're using the correct property for the course ID
      const courseIdToUse = selectedCourse.courseId || selectedCourse.id;
      navigate(`/instructor/courses/${courseIdToUse}/assessments`)
      console.log(`Navigating to assessment creation for course: ${courseIdToUse}`);
    } else {
      toast.error('Please select a course first')
    }
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Course Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateCourse}
        >
          Create Course
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {courses.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6">You haven't created any courses yet</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleCreateCourse}
                  sx={{ mt: 2 }}
                >
                  Create Your First Course
                </Button>
              </Paper>
            </Grid>
          ) : (
            <>
              <Grid item xs={12} md={selectedCourse ? 6 : 12}>
                <Grid container spacing={2}>
                  {courses.map((course, index) => (
                    <Grid item xs={12} sm={6} md={selectedCourse ? 12 : 4} key={course.id || course.courseId || index}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="h5" component="div">
                            {course.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {course.description}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                            {Array.isArray(course.tags) ? (
                              course.tags.map((tag, index) => (
                                <Chip key={index} label={tag} size="small" />
                              ))
                            ) : (
                              course.tags?.split(',').map((tag, index) => (
                                <Chip key={index} label={tag.trim()} size="small" />
                              ))
                            )}
                            {course.tags && Array.isArray(course.tags)
                              ? course.tags.map((tag, tagIndex) => (
                                <Chip key={`${course.id || course.courseId}-tag-${tagIndex}-${tag}`} label={tag} size="small" />
                              ))
                              : course.tags?.split(',').map((tag, tagIndex) => (
                                <Chip key={`${course.id || course.courseId}-tag-${tagIndex}-${tag.trim()}`} label={tag.trim()} size="small" />
                              ))}
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button size="small" onClick={() => handleViewCourseDetails(course)}>
                            Manage Content
                          </Button>
                          <Button size="small" onClick={() => handleViewStudents(course)}>
                            View Students
                          </Button>
                          <IconButton size="small" onClick={() => handleEditCourse(course)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteCourse(course)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {selectedCourse && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h5" gutterBottom>
                      {selectedCourse.title}
                    </Typography>
                    <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                      <Tab label="Course Content" icon={<CloudUploadIcon />} iconPosition="start" />
                      <Tab label="Enrolled Students" icon={<PeopleIcon />} iconPosition="start" />
                    </Tabs>

                    {selectedTab === 0 && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6">Content</Typography>
                          <Box>
                            <Button
                              variant="outlined"
                              startIcon={<CloudUploadIcon />}
                              onClick={handleAddContent}
                              sx={{ mr: 1 }}
                            >
                              Add Content
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<AssignmentIcon />}
                              onClick={handleAddAssessment}
                            >
                              Add Assessment
                            </Button>
                          </Box>
                        </Box>

                        {contentLoading ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                          </Box>
                        ) : courseContent.length === 0 ? (
                          <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
                            No content added yet
                          </Typography>
                        ) : (
                          <List>
                            {courseContent.map((content) => (
                              <React.Fragment key={content.id}>
                                <ListItem>
                                  <ListItemText
                                    primary={content.title}
                                    secondary={content.type}
                                  />
                                  <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label="edit">
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton edge="end" aria-label="delete">
                                      <DeleteIcon />
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                                <Divider />
                              </React.Fragment>
                            ))}
                          </List>
                        )}
                      </Box>
                    )}

                    {selectedTab === 1 && (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Enrolled Students
                        </Typography>

                        {studentsLoading ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                          </Box>
                        ) : courseStudents.length === 0 ? (
                          <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
                            No students enrolled yet
                          </Typography>
                        ) : (
                          <List>
                            {courseStudents.map((student) => (
                              <React.Fragment key={student.id}>
                                <ListItem>
                                  <ListItemText
                                    primary={student.name}
                                    secondary={student.email}
                                  />
                                </ListItem>
                                <Divider />
                              </React.Fragment>
                            ))}
                          </List>
                        )}
                      </Box>
                    )}
                  </Paper>
                </Grid>
              )}
            </>
          )}
        </Grid>
      )}

      {/* Create Course Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCreateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Course</DialogTitle>
        <form onSubmit={handleSubmitNewCourse}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="title"
              label="Course Title"
              type="text"
              fullWidth
              variant="outlined"
              value={newCourse.title}
              onChange={handleNewCourseChange}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              margin="dense"
              name="description"
              label="Course Description"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              value={newCourse.description}
              onChange={handleNewCourseChange}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              margin="dense"
              name="tags"
              label="Tags (comma separated)"
              type="text"
              fullWidth
              variant="outlined"
              value={newCourse.tags}
              onChange={handleNewCourseChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="prerequisites"
              label="Prerequisites (comma separated)"
              type="text"
              fullWidth
              variant="outlined"
              value={newCourse.prerequisites}
              onChange={handleNewCourseChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="startDate"
              label="Start Date"
              type="date"
              fullWidth
              variant="outlined"
              value={newCourse.startDate}
              onChange={handleNewCourseChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="endDate"
              label="End Date"
              type="date"
              fullWidth
              variant="outlined"
              value={newCourse.endDate}
              onChange={handleNewCourseChange}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateDialogClose} type="button" disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Course</DialogTitle>
        {selectedCourse && (
          <form onSubmit={handleUpdateCourse}>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Course Title"
                type="text"
                fullWidth
                variant="outlined"
                value={selectedCourse.title}
                onChange={(e) => setSelectedCourse({ ...selectedCourse, title: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                margin="dense"
                label="Course Description"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={selectedCourse.description}
                onChange={(e) =>
                  setSelectedCourse({ ...selectedCourse, description: e.target.value })
                }
                sx={{ mb: 2 }}
                required
              />
              <TextField
                margin="dense"
                label="Tags (comma separated)"
                type="text"
                fullWidth
                variant="outlined"
                value={
                  Array.isArray(selectedCourse.tags)
                    ? selectedCourse.tags.join(', ')
                    : selectedCourse.tags || ''
                }
                onChange={(e) => setSelectedCourse({ ...selectedCourse, tags: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Prerequisites (comma separated)"
                type="text"
                fullWidth
                variant="outlined"
                value={
                  Array.isArray(selectedCourse.prerequisites)
                    ? selectedCourse.prerequisites.join(', ')
                    : selectedCourse.prerequisites || ''
                }
                onChange={(e) =>
                  setSelectedCourse({ ...selectedCourse, prerequisites: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Start Date"
                type="date"
                fullWidth
                variant="outlined"
                value={selectedCourse.startDate ? selectedCourse.startDate.substring(0, 10) : ''}
                onChange={(e) => setSelectedCourse({ ...selectedCourse, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="End Date"
                type="date"
                fullWidth
                variant="outlined"
                value={selectedCourse.endDate ? selectedCourse.endDate.substring(0, 10) : ''}
                onChange={(e) => setSelectedCourse({ ...selectedCourse, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditDialogClose} type="button">Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                Update Course
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedCourse?.title}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CourseManagement