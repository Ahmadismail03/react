import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            p: 1,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
)

const CourseCard = ({ course }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BookIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">{course.title}</Typography>
        </Box>
        <IconButton size="small">
          <MoreVertIcon />
        </IconButton>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {course.description}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Progress
        </Typography>
        <LinearProgress
          variant="determinate"
          value={course.progress}
          sx={{ mt: 1, height: 8, borderRadius: 4 }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {course.progress}% Complete
        </Typography>
      </Box>
    </CardContent>
  </Card>
)

const AssignmentCard = ({ assignment }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AssignmentIcon sx={{ mr: 1, color: 'warning.main' }} />
          <Typography variant="h6">{assignment.title}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Due: {assignment.dueDate}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {assignment.description}
      </Typography>
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Course:
        </Typography>
        <Typography variant="body2">{assignment.course}</Typography>
      </Box>
    </CardContent>
  </Card>
)

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedAssignments: 0,
    averageGrade: 0,
    certificates: 0,
  })
  const [recentCourses, setRecentCourses] = useState([])
  const [upcomingAssignments, setUpcomingAssignments] = useState([])

  useEffect(() => {
    // TODO: Fetch real data from API
    setStats({
      enrolledCourses: 5,
      completedAssignments: 12,
      averageGrade: 85,
      certificates: 2,
    })

    setRecentCourses([
      {
        id: 1,
        title: 'Introduction to Programming',
        description: 'Learn the basics of programming with Python',
        progress: 75,
      },
      {
        id: 2,
        title: 'Web Development',
        description: 'Build modern web applications with React',
        progress: 45,
      },
      {
        id: 3,
        title: 'Database Design',
        description: 'Master database design and SQL',
        progress: 30,
      },
    ])

    setUpcomingAssignments([
      {
        id: 1,
        title: 'Final Project Submission',
        description: 'Submit your final project for review',
        dueDate: '2024-03-15',
        course: 'Web Development',
      },
      {
        id: 2,
        title: 'Database Quiz',
        description: 'Test your knowledge of SQL and database design',
        dueDate: '2024-03-10',
        course: 'Database Design',
      },
    ])
  }, [])

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Welcome back, {user?.name}!
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Enrolled Courses"
            value={stats.enrolledCourses}
            icon={<SchoolIcon sx={{ color: 'primary.main' }} />}
            color="#2563eb"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed Assignments"
            value={stats.completedAssignments}
            icon={<AssignmentIcon sx={{ color: 'success.main' }} />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Grade"
            value={`${stats.averageGrade}%`}
            icon={<StarIcon sx={{ color: 'warning.main' }} />}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Certificates"
            value={stats.certificates}
            icon={<BookIcon sx={{ color: 'secondary.main' }} />}
            color="#7c3aed"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Courses
              </Typography>
              {recentCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Upcoming Assignments
              </Typography>
              {upcomingAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard