import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
} from '@mui/material'
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { courseApi, enrollmentApi } from '../../services/api'
import { toast } from 'react-toastify'

const StudentDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [availableCourses, setAvailableCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true)
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    completed: 0,
    inProgress: 0,
    averageProgress: 0,
  })

  useEffect(() => {
    fetchEnrollments()
    fetchAvailableCourses()
  }, [])

  const fetchEnrollments = async () => {
    try {
      setEnrollmentsLoading(true)
      const response = await enrollmentApi.getMyEnrollments()
      setEnrolledCourses(response.data)
      
      // Calculate stats
      const total = response.data.length
      const completed = response.data.filter(course => course.progress === 100).length
      const inProgress = total - completed
      const avgProgress = total > 0 
        ? response.data.reduce((sum, course) => sum + course.progress, 0) / total 
        : 0
      
      setStats({
        totalEnrolled: total,
        completed,
        inProgress,
        averageProgress: avgProgress,
      })
    } catch (error) {
      console.error('Error fetching enrollments:', error)
      toast.error('Failed to load your enrolled courses')
    } finally {
      setEnrollmentsLoading(false)
      setLoading(false)
    }
  }

  const fetchAvailableCourses = async () => {
    try {
      setCoursesLoading(true)
      const response = await courseApi.getAllCourses()
      setAvailableCourses(response.data)
    } catch (error) {
      console.error('Error fetching available courses:', error)
      toast.error('Failed to load available courses')
    } finally {
      setCoursesLoading(false)
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId) => {
    try {
      await courseApi.enrollInCourse(courseId)
      toast.success('Successfully enrolled in course')
      
      // Refresh enrollments
      fetchEnrollments()
      
      // Update available courses list
      setAvailableCourses(availableCourses.filter(course => course.id !== courseId))
    } catch (error) {
      console.error('Error enrolling in course:', error)
      toast.error('Failed to enroll in course')
    }
  }

  const handleContinueCourse = (courseId) => {
    navigate(`/courses/${courseId}`)
  }

  const handleViewAllCourses = () => {
    navigate('/courses')
  }

  const getProgressColor = (progress) => {
    if (progress < 30) return 'error'
    if (progress < 70) return 'warning'
    return 'success'
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Student Dashboard
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SchoolIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Enrolled Courses</Typography>
                </Box>
                <Typography variant="h3" align="center">
                  {stats.totalEnrolled}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Completed</Typography>
                </Box>
                <Typography variant="h3" align="center">
                  {stats.completed}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PlayArrowIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">In Progress</Typography>
                </Box>
                <Typography variant="h3" align="center">
                  {stats.inProgress}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AssignmentIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Average Progress</Typography>
                </Box>
                <Typography variant="h3" align="center">
                  {Math.round(stats.averageProgress)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* My Courses Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">My Courses</Typography>
                <Button variant="outlined" onClick={handleViewAllCourses}>
                  View All Courses
                </Button>
              </Box>
              
              {enrollmentsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : enrolledCourses.length === 0 ? (
                <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
                  You are not enrolled in any courses yet.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {enrolledCourses.map((course) => (
                    <Grid item xs={12} sm={6} md={4} key={course.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="h6" component="div">
                            {course.title}
                          </Typography>
                          <Box sx={{ mt: 2, mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                Progress: {course.progress}%
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {course.progress === 100 ? 'Completed' : 'In Progress'}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={course.progress} 
                              color={getProgressColor(course.progress)}
                              sx={{ mt: 1, height: 8, borderRadius: 5 }}
                            />
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button size="small" onClick={() => handleContinueCourse(course.id)}>
                            {course.progress === 0 ? 'Start Course' : 'Continue Learning'}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
          
          {/* Available Courses Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Recommended Courses
              </Typography>
              
              {coursesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : availableCourses.length === 0 ? (
                <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
                  No available courses to display.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {availableCourses
                    .filter(course => !enrolledCourses.some(ec => ec.id === course.id))
                    .slice(0, 3) // Show only 3 recommended courses
                    .map((course) => (
                      <Grid item xs={12} sm={6} md={4} key={course.id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography gutterBottom variant="h6" component="div">
                              {course.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {course.description}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {Array.isArray(course.tags) ? (
                                course.tags.map((tag, index) => (
                                  <Chip key={index} label={tag} size="small" />
                                ))
                              ) : (
                                course.tags?.split(',').map((tag, index) => (
                                  <Chip key={index} label={tag.trim()} size="small" />
                                ))
                              )}
                            </Box>
                          </CardContent>
                          <CardActions>
                            <Button size="small" onClick={() => handleEnroll(course.id)}>
                              Enroll Now
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              )}
              
              {availableCourses.filter(course => !enrolledCourses.some(ec => ec.id === course.id)).length > 3 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button variant="outlined" onClick={handleViewAllCourses}>
                    View More Courses
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default StudentDashboard