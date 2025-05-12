// src/pages/common/NotificationCenter.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Badge,
  CircularProgress,
  Divider,
  Tooltip,
  Button,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as ActiveIcon,
  NotificationsOff as InactiveIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  ChatBubble as MessageIcon,
  Announcement as AnnouncementIcon,
  Event as EventIcon,
  School as CourseIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { notificationApi } from '../../services/api';

// Component to be used in Navbar.jsx
export const NotificationBadge = ({ onOpen }) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await notificationApi.getNotificationCount();
        setCount(response.data.unread);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notification count:', error);
        setLoading(false);
      }
    };

    fetchNotificationCount();
    
    // Poll for new notifications every 60 seconds
    const intervalId = setInterval(fetchNotificationCount, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <IconButton color="inherit" size="large">
        <NotificationsIcon />
      </IconButton>
    );
  }

  return (
    <IconButton color="inherit" size="large" onClick={onOpen}>
      <Badge badgeContent={count} color="error">
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

// Main notification center component
const NotificationCenter = ({ open, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  
  // Form state for creating notifications
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    recipientEmail: '',
    type: 'SYSTEM'
  });

  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === 'ADMIN');
      setIsInstructor(user.role === 'INSTRUCTOR');
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      
      switch (activeTab) {
        case 0: // All
          response = await notificationApi.getAllNotifications();
          break;
        case 1: // Unread
          response = await notificationApi.getUnreadNotifications();
          break;
        case 2: // By Status
          response = await notificationApi.getNotificationsByStatus('DELIVERED');
          break;
        default:
          response = await notificationApi.getAllNotifications();
      }
      
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMenuOpen = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async () => {
    try {
      await notificationApi.markAsRead(selectedNotification.notificationId);
      setNotifications(notifications.map(n => 
        n.notificationId === selectedNotification.notificationId ? { ...n, read: true } : n
      ));
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
    handleMenuClose();
  };

  const handleUpdateStatus = async (status) => {
    try {
      await notificationApi.updateStatus(selectedNotification.notificationId, status);
      setNotifications(notifications.map(n => 
        n.notificationId === selectedNotification.notificationId ? { ...n, status } : n
      ));
      toast.success(`Notification status updated to ${status}`);
    } catch (error) {
      console.error('Error updating notification status:', error);
      toast.error('Failed to update notification status');
    }
    handleMenuClose();
  };

  const handleOpenCreateDialog = () => {
    setNewNotification({
      title: '',
      message: '',
      recipientEmail: '',
      type: 'SYSTEM'
    });
    setCreateDialogOpen(true);
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleCreateNotification = async () => {
    try {
      // Validate required fields
      if (!newNotification.title || !newNotification.message) {
        toast.error('Title and message are required');
        return;
      }
      
      // If instructor or admin is creating for a specific user, validate email
      if ((isAdmin || isInstructor) && newNotification.recipientEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newNotification.recipientEmail)) {
          toast.error('Please enter a valid email address');
          return;
        }
      }
      
      // Create notification
      const response = await notificationApi.createNotification(newNotification);
      
      toast.success('Notification created successfully');
      setCreateDialogOpen(false);
      
      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Failed to create notification');
    }
  };

  const handleDeleteNotification = async () => {
    try {
      await notificationApi.deleteNotification(selectedNotification.notificationId);
      setNotifications(notifications.filter(n => n.notificationId !== selectedNotification.notificationId));
      toast.success('Notification deleted');
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'COURSE':
        return <CourseIcon color="primary" />;
      case 'ASSIGNMENT':
        return <AssignmentIcon color="secondary" />;
      case 'EVENT':
        return <EventIcon color="success" />;
      case 'ANNOUNCEMENT':
        return <AnnouncementIcon color="warning" />;
      default:
        return <MessageIcon color="info" />;
    }
  };

  const getTimeString = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than a day
    if (diff < 86400000) {
      // Less than an hour
      if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      }
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Less than a week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    // Format as date
    return date.toLocaleDateString();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Notifications</Typography>
          {(isAdmin || isInstructor) && (
            <Button 
              variant="contained" 
              size="small" 
              onClick={handleOpenCreateDialog}
              startIcon={<NotificationsIcon />}
            >
              Create
            </Button>
          )}
        </Box>
        
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="All" />
          <Tab label="Unread" />
          <Tab label="Active" />
        </Tabs>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
            <InactiveIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No notifications to display
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification) => (
              <React.Fragment key={notification.notificationId}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    borderRadius: 1 
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block' }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {getTimeString(notification.createdDate)}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Options">
                      <IconButton edge="end" onClick={(e) => handleMenuOpen(e, notification)}>
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
      
      {/* Notification Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem onClick={handleMarkAsRead}>
            <ListItemIcon>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Mark as read" />
          </MenuItem>
        )}
        {isAdmin && selectedNotification && (
          <>
            <MenuItem onClick={() => handleUpdateStatus('PENDING')}>
              <ListItemText primary="Set as Pending" />
            </MenuItem>
            <MenuItem onClick={() => handleUpdateStatus('DELIVERED')}>
              <ListItemText primary="Set as Delivered" />
            </MenuItem>
            <MenuItem onClick={() => handleUpdateStatus('READ')}>
              <ListItemText primary="Set as Read" />
            </MenuItem>
            <Divider />
          </>
        )}
        <MenuItem onClick={handleOpenDeleteDialog}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
      
      {/* Create Notification Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Notification</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="Title"
            fullWidth
            required
            value={newNotification.title}
            onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
          />
          <TextField
            margin="normal"
            label="Message"
            fullWidth
            required
            multiline
            rows={4}
            value={newNotification.message}
            onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
          />
          {(isAdmin || isInstructor) && (
            <TextField
              margin="normal"
              label="Recipient Email (optional)"
              fullWidth
              placeholder="Leave empty to send to all users"
              value={newNotification.recipientEmail}
              onChange={(e) => setNewNotification({ ...newNotification, recipientEmail: e.target.value })}
            />
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Notification Type</InputLabel>
            <Select
              value={newNotification.type}
              label="Notification Type"
              onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value })}
            >
              <MenuItem value="SYSTEM">System</MenuItem>
              <MenuItem value="COURSE">Course</MenuItem>
              <MenuItem value="ASSIGNMENT">Assignment</MenuItem>
              <MenuItem value="EVENT">Event</MenuItem>
              <MenuItem value="ANNOUNCEMENT">Announcement</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateNotification} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Notification Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Notification</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this notification?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteNotification} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

export default NotificationCenter;  