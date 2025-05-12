// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  LinearProgress,
  Link
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  MenuBook as MenuBookIcon,
  Notifications as NotificationsIcon,
  DashboardCustomize as DashboardIcon,
  MailOutline as MailIcon,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ArrowUpward as TrendUpIcon,
  ArrowDownward as TrendDownIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  SupervisorAccount as InstructorIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi, userApi, courseApi, notificationApi } from '../../services/api';
import { toast } from 'react-toastify';

// Custom stat card component
const StatCard = ({ title, value, icon, color, trend, trendValue, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
        <Box sx={{ 
          bgcolor: `${color}.light`, 
          p: 1, 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center' 
        }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h3" component="div" gutterBottom>
        {value}
      </Typography>
      
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {subtitle}
        </Typography>
      )}
      
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {trend === 'up' ? (
            <TrendUpIcon fontSize="small" color="success" />
          ) : (
            <TrendDownIcon fontSize="small" color="error" />
          )}
          <Typography 
            variant="body2" 
            color={trend === 'up' ? 'success.main' : 'error.main'}
            sx={{ ml: 0.5 }}
          >
            {trendValue}% since last month
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    usersByRole: {
      ADMIN: 0,
      INSTRUCTOR: 0,
      STUDENT: 0
    }
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'ADMIN') {
      navigate('/');
      toast.error('Access denied. Admin permissions required.');
      return;
    }
    
    // Fetch dashboard data
    fetchDashboardData();
  }, [user, navigate]);
  
const fetchDashboardData = async () => {
  try {
    setLoading(true);
    
    // Try to fetch system stats, but fallback to mock data if endpoint doesn't exist
    let systemStats;
    try {
      const statsResponse = await adminApi.getSystemStats();
      systemStats = statsResponse.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('System stats endpoint not found, using mock data');
        systemStats = {
          totalUsers: 0,
          activeUsers: 0,
          totalCourses: 0,
          totalEnrollments: 0,
          usersByRole: {
            ADMIN: 0,
            INSTRUCTOR: 0,
            STUDENT: 0
          }
        };
      } else {
        throw error;
      }
    }
    
    setStats(systemStats);
    
    // Fetch real data for users, courses, and notifications
    try {
      const [usersResponse, coursesResponse] = await Promise.all([
        userApi.getAllUsers(),
        courseApi.getAllCourses()
      ]);
      
      // Process users data
      const users = usersResponse.data || [];
      const sortedUsers = users
        .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
        .slice(0, 5);
      setRecentUsers(sortedUsers);
      
      // Calculate stats from actual data
      const userStats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive !== false).length,
        usersByRole: {
          ADMIN: users.filter(u => u.role === 'ADMIN').length,
          INSTRUCTOR: users.filter(u => u.role === 'INSTRUCTOR').length,
          STUDENT: users.filter(u => u.role === 'STUDENT').length
        }
      };
      
      // Process courses data
      const courses = coursesResponse.data || [];
      const sortedCourses = courses
        .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
        .slice(0, 5);
      setRecentCourses(sortedCourses);
      
      // Update stats with calculated values
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: userStats.totalUsers,
        activeUsers: userStats.activeUsers,
        totalCourses: courses.length,
        usersByRole: userStats.usersByRole
      }));
      
    } catch (error) {
      console.error('Error fetching data:', error);
      // Still show the dashboard with whatever data we have
      setRecentUsers([]);
      setRecentCourses([]);
    }
    
    // Fetch notifications
    try {
      const notificationsResponse = await notificationApi.getAllNotifications();
      setNotifications(notificationsResponse.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
    
    setLoading(false);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    toast.error('Failed to load some dashboard data');
    setLoading(false);
  }
};
  
  const handleNavigate = (path) => {
    navigate(path);
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.name}. Here's an overview of your learning management system.
        </Typography>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={<PeopleIcon sx={{ color: 'primary.main' }} />}
            color="primary"
            trend="up"
            trendValue={8}
            subtitle="Active Users: 75%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Courses" 
            value={stats.totalCourses} 
            icon={<SchoolIcon sx={{ color: 'secondary.main' }} />}
            color="secondary"
            trend="up"
            trendValue={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Enrollments" 
            value={stats.totalEnrollments} 
            icon={<AssignmentIcon sx={{ color: 'success.main' }} />}
            color="success"
            trend="up"
            trendValue={5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="System Alerts" 
            value={notifications.length} 
            icon={<NotificationsIcon sx={{ color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
      </Grid>
      
      {/* User distribution */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          User Distribution
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                bgcolor: 'primary.light', 
                p: 1, 
                borderRadius: '50%',
                display: 'flex',
                mr: 2
              }}>
                <GroupIcon sx={{ color: 'primary.main' }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Students
                </Typography>
                <Typography variant="h6">
                  {stats.usersByRole.STUDENT}
                </Typography>
              </Box>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(stats.usersByRole.STUDENT / stats.totalUsers) * 100}
              sx={{ height: 8, borderRadius: 5 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                bgcolor: 'secondary.light', 
                p: 1, 
                borderRadius: '50%',
                display: 'flex',
                mr: 2
              }}>
                <InstructorIcon sx={{ color: 'secondary.main' }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Instructors
                </Typography>
                <Typography variant="h6">
                  {stats.usersByRole.INSTRUCTOR}
                </Typography>
              </Box>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(stats.usersByRole.INSTRUCTOR / stats.totalUsers) * 100}
              color="secondary"
              sx={{ height: 8, borderRadius: 5 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ 
                bgcolor: 'error.light', 
                p: 1, 
                borderRadius: '50%',
                display: 'flex',
                mr: 2
              }}>
                <PersonIcon sx={{ color: 'error.main' }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Administrators
                </Typography>
                <Typography variant="h6">
                  {stats.usersByRole.ADMIN}
                </Typography>
              </Box>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(stats.usersByRole.ADMIN / stats.totalUsers) * 100}
              color="error"
              sx={{ height: 8, borderRadius: 5 }}
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Button 
              variant="outlined" 
              color="primary" 
              fullWidth
              startIcon={<PersonAddIcon />}
              onClick={() => handleNavigate('/admin/users')}
              sx={{ p: 2 }}
            >
              Add User
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button 
              variant="outlined" 
              color="secondary" 
              fullWidth
              startIcon={<MenuBookIcon />}
              onClick={() => handleNavigate('/admin/courses')}
              sx={{ p: 2 }}
            >
              Manage Courses
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button 
              variant="outlined" 
              color="info" 
              fullWidth
              startIcon={<MailIcon />}
              onClick={() => handleNavigate('/admin/notifications')}
              sx={{ p: 2 }}
            >
              Send Notification
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button 
              variant="outlined" 
              color="warning" 
              fullWidth
              startIcon={<SettingsIcon />}
              onClick={() => handleNavigate('/admin/settings')}
              sx={{ p: 2 }}
            >
              System Settings
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Users
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={
                            user.role === 'ADMIN' ? 'error' : 
                            user.role === 'INSTRUCTOR' ? 'secondary' : 'primary'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small"
                            onClick={() => handleNavigate(`/admin/users/edit/${user.userId}`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="text" 
                onClick={() => handleNavigate('/admin/users')}
              >
                View All Users
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Courses
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Instructor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentCourses.map((course) => (
                    <TableRow key={course.courseId || course.id}>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>{course.instructor?.name || 'Not assigned'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={course.isActive ? 'Active' : 'Inactive'} 
                          color={course.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small"
                            onClick={() => handleNavigate(`/admin/courses/edit/${course.courseId || course.id}`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="text" 
                onClick={() => handleNavigate('/admin/courses')}
              >
                View All Courses
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent System Alerts & Notifications
            </Typography>
            <List>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <React.Fragment key={notification.notificationId}>
                    <ListItem>
                      <ListItemIcon>
                        {notification.status === 'PENDING' ? (
                          <WarningIcon color="warning" />
                        ) : notification.status === 'DELIVERED' ? (
                          <InfoIcon color="info" />
                        ) : (
                          <CheckIcon color="success" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.title}
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {notification.message}
                            </Typography>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              sx={{ display: 'block' }}
                            >
                              {new Date(notification.createdDate).toLocaleString()}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No recent notifications" />
                </ListItem>
              )}
            </List>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="text" 
                onClick={() => handleNavigate('/admin/notifications')}
              >
                View All Notifications
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;