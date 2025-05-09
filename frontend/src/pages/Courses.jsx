import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Container,
  CardActions,
  Button,
  Chip,
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { courseApi } from '../services/api'

export default function Courses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseApi.getAllCourses()
        setCourses(response.data)
      } catch (err) {
        setError('Failed to fetch courses')
        console.error('Error fetching courses:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const handleEnroll = async (courseId) => {
    try {
      await courseApi.enrollInCourse(courseId)
      // Update the course status in the UI
      setCourses(courses.map(course =>
        course.courseId === courseId
          ? { ...course, status: 'Enrolled' }
          : course
      ))
    } catch (err) {
      console.error('Error enrolling in course:', err)
    }
  }

  const handleDelete = async (courseId) => {
    try {
      await courseApi.deleteCourse(courseId)
      setCourses(courses.filter(course => course.courseId !== courseId))
    } catch (err) {
      console.error('Error deleting course:', err)
    }
  }

  const isInstructorOrAdmin = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN'

  if (loading) return <Typography>Loading courses...</Typography>
  if (error) return <Typography color="error">{error}</Typography>

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Available Courses
        </Typography>
        {isInstructorOrAdmin && (
          <Button
            variant="contained"
            color="primary"
            href="/courses/create"
          >
            Create New Course
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.courseId}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2">
                  {course.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Instructor: {course.instructor?.name || 'Not assigned'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {course.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={course.status || 'Available'}
                    color={course.status === 'Enrolled' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
              <CardActions>
                {!isInstructorOrAdmin && course.status !== 'Enrolled' && (
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleEnroll(course.courseId)}
                  >
                    Enroll
                  </Button>
                )}
                {isInstructorOrAdmin && (
                  <>
                    <Button
                      size="small"
                      color="primary"
                      href={`/courses/${course.courseId}/edit`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(course.courseId)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}