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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { courseApi, userApi } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const AdminCourseManagement = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [instructorsLoading, setInstructorsLoading] = useState(true)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openAssignInstructorDialog, setOpenAssignInstructorDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedInstructorId, setSelectedInstructorId] = useState('')
  const [newCourse, setNewCourse] = useState({
    name: '',
    title: '',
    description: '',
    tags: '',
    prerequisites: '',
    startDate: '',
    endDate: '',
    instructorId: '',
  })

  useEffect(() => {
    fetchAllCourses()
    fetchInstructors()
  }, [])

  const fetchAllCourses = async () => {
    try {
      setLoading(true)
      const response = await courseApi.getAllCourses()
      setCourses(response.data)
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const fetchInstructors = async () => {
    try {
      setInstructorsLoading(true)
      const response = await userApi.getAllUsers()
      const instructorsList = response.data.filter(user => user.role === 'INSTRUCTOR')
      setInstructors(instructorsList)
    } catch (error) {
      console.error('Error fetching instructors:', error)
      toast.error('Failed to load instructors')
    } finally {
      setInstructorsLoading(false)
    }
  }

  const handleCreateCourse = async () => {
    try {
      await courseApi.createCourse(newCourse)
      toast.success('Course created successfully')
      setOpenCreateDialog(false)
      fetchAllCourses()
      setNewCourse({
        name: '',
        title: '',
        description: '',
        tags: '',
        prerequisites: '',
        startDate: '',
        endDate: '',
        instructorId: '',
      })
    } catch (error) {
      console.error('Error creating course:', error)
      toast.error(error.response?.data?.message || 'Failed to create course')
    }
  }

  const handleUpdateCourse = async () => {
    try {
      await courseApi.updateCourse(selectedCourse.id, selectedCourse)
      toast.success('Course updated successfully')
      setOpenEditDialog(false)
      fetchAllCourses()
    } catch (error) {
      console.error('Error updating course:', error)
      toast.error('Failed to update course')
    }
  }

  const handleDeleteCourse = async () => {
    try {
      await courseApi.deleteCourse(selectedCourse.id)
      toast.success('Course deleted successfully')
      setOpenDeleteDialog(false)
      fetchAllCourses()
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('Failed to delete course')
    }
  }

  const getInstructorName = (instructorId) => {
    const instructor = instructors.find(i => i.id === instructorId)
    return instructor ? instructor.name : 'Not assigned'
  }

  return (
    <Box sx={{ p: 3 }}>
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
          <Typography variant="body1">No courses found. Create a new course to get started.</Typography>
        ) : (
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {course.description}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Instructor:</strong> {getInstructorName(course.instructorId)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Start Date:</strong> {course.startDate ? new Date(course.startDate).toLocaleDateString() : 'Not set'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>End Date:</strong> {course.endDate ? new Date(course.endDate).toLocaleDateString() : 'Not set'}
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
                        setSelectedCourse(course)
                        setOpenEditDialog(true)
                      }}
                      title="Edit Course"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedCourse(course)
                        setOpenDeleteDialog(true)
                      }}
                      title="Delete Course"
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setSelectedCourse(course)
                        setOpenAssignInstructorDialog(true)
                      }}
                      title="Assign Instructor"
                    >
                      <PersonIcon />
                    </IconButton>
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
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Course</DialogTitle>
        <form onSubmit={(e) => {
          e.preventDefault()
          handleCreateCourse()
        }}>
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
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Tags (comma separated)"
              type="text"
              fullWidth
              value={newCourse.tags}
              onChange={(e) => setNewCourse({ ...newCourse, tags: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Prerequisites"
              type="text"
              fullWidth
              value={newCourse.prerequisites}
              onChange={(e) => setNewCourse({ ...newCourse, prerequisites: e.target.value })}
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
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Instructor</InputLabel>
              <Select
                value={newCourse.instructorId}
                label="Instructor"
                onChange={(e) => setNewCourse({ ...newCourse, instructorId: e.target.value })}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {instructors.map((instructor) => (
                  <MenuItem key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Course</DialogTitle>
        <form onSubmit={(e) => {
          e.preventDefault()
          handleUpdateCourse()
        }}>
          <DialogContent>
            {selectedCourse && (
              <>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Title"
                  type="text"
                  fullWidth
                  value={selectedCourse.title}
                  onChange={(e) => setSelectedCourse({ ...selectedCourse, title: e.target.value })}
                  required
                  sx={{ mb: 2 }}
                />
                {/* Add other fields similar to create dialog */}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Update
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedCourse?.title}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteCourse} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Instructor Dialog */}
      <Dialog
        open={openAssignInstructorDialog}
        onClose={() => setOpenAssignInstructorDialog(false)}
      >
        <DialogTitle>Assign Instructor</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Instructor</InputLabel>
            <Select
              value={selectedInstructorId}
              label="Instructor"
              onChange={(e) => setSelectedInstructorId(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {instructors.map((instructor) => (
                <MenuItem key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignInstructorDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminCourseManagement