// src/components/layout/NavbarWithNotifications.jsx
import { useState, useEffect } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  ListItemButton,
} from '@mui/material'
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Book as BookIcon,
  MenuBook as MenuBookIcon,
  AccountCircle as AccountCircleIcon,
  Assignment as AssignmentIcon,
  ExitToApp as LogoutIcon,
  People as PeopleIcon,
  Add as AddIcon,
  VideoLibrary as VideoLibraryIcon,
  Grade as GradeIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import NotificationCenter, { NotificationBadge } from '../../pages/common/NotificationCenter'

const Navbar = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [anchorElUser, setAnchorElUser] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [navItems, setNavItems] = useState([])
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false)
  
  // Set navigation items based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        setNavItems([
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
          { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users' },
          { text: 'Courses', icon: <MenuBookIcon />, path: '/courses' },
          { text: 'Profile', icon: <AccountCircleIcon />, path: '/profile' }
        ]);
      } else if (user.role === 'INSTRUCTOR') {
        setNavItems([
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/instructor' },
          { text: 'My Courses', icon: <MenuBookIcon />, path: '/instructor/courses' },
          { text: 'Profile', icon: <AccountCircleIcon />, path: '/profile' }
        ]);
      } else {
        setNavItems([
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/student' },
          { text: 'Browse Courses', icon: <MenuBookIcon />, path: '/courses' },
          { text: 'My Grades', icon: <GradeIcon />, path: '/student/grades' },
          { text: 'Profile', icon: <AccountCircleIcon />, path: '/profile' }
        ]);
      }
    }
  }, [user]);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const handleOpenNotifications = () => {
    setNotificationDrawerOpen(true)
  }

  const handleCloseNotifications = () => {
    setNotificationDrawerOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <SchoolIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            LMS
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={() => setDrawerOpen(true)}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>

          <SchoolIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            LMS
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                onClick={() => navigate(item.path)}
                sx={{ my: 2, color: 'text.primary', display: 'block' }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {user ? (
            <Box sx={{ flexGrow: 0 }}>
              <NotificationBadge onOpen={handleOpenNotifications} />
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user.name} src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={() => navigate('/profile')}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ flexGrow: 0 }}>
              <Button
                color="primary"
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ mr: 1 }}
              >
                Login
              </Button>
              <Button
                color="primary"
                variant="contained"
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setDrawerOpen(false)}
          onKeyDown={() => setDrawerOpen(false)}
        >
          <List>
            <ListItem>
              <Typography variant="h6" sx={{ my: 2 }}>
                LMS Platform
              </Typography>
            </ListItem>
            <Divider />
            {user && (
              <ListItem>
                <Box sx={{ py: 1.5, width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">{user.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.role}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            )}
            <Divider />
            {navItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={() => navigate(item.path)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={logout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      
      {/* Notification Drawer */}
      <NotificationCenter 
        open={notificationDrawerOpen} 
        onClose={handleCloseNotifications} 
      />
    </AppBar>
  )
}

export default Navbar