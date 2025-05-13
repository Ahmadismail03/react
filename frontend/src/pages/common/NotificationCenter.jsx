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
  Alert,
  Snackbar
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
import axios from 'axios';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
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
    if (!open) return; // Don't fetch if drawer is closed
    
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
      
      console.log('Fetched notifications:', response.data);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      setErrorMessage('Failed to load notifications. Please try again.');
      toast.error('Failed to load notifications');
      // Set empty array to prevent rendering issues
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, open]);

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
    if (!selectedNotification) {
      handleMenuClose();
      return;
    }
    
    try {
      await notificationApi.markAsRead(selectedNotification.notificationId);
      setNotifications(notifications.map(n => 
        n.notificationId === selectedNotification.notificationId ? { ...n, read: true } : n
      ));
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      toast.error('Failed to mark notification as read');
    }
    handleMenuClose();
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedNotification) {
      handleMenuClose();
      return;
    }
    
    try {
      await notificationApi.updateStatus(selectedNotification.notificationId, status);
      setNotifications(notifications.map(n => 
        n.notificationId === selectedNotification.notificationId ? { ...n, status } : n
      ));
      toast.success(`Notification status updated to ${status}`);
    } catch (error) {
      console.error('Error updating notification status:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
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
    if (isSubmitting) return; // Prevent multiple submissions
    
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!newNotification.title || !newNotification.message) {
        toast.error('Title and message are required');
        setIsSubmitting(false);
        return;
      }
      
      // If instructor or admin is creating for a specific user, validate email
      if ((isAdmin || isInstructor) && newNotification.recipientEmail && newNotification.recipientEmail.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newNotification.recipientEmail)) {
          toast.error('Please enter a valid email address');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Create notification request object
      const notificationRequest = {
        title: newNotification.title.trim(),
        message: newNotification.message.trim(),
        // IMPORTANT: Always use the current user's email if no recipient is specified
        recipientEmail: newNotification.recipientEmail?.trim() || user.email,
        type: newNotification.type || 'SYSTEM'
      };
      
      console.log('Sending notification with data:', notificationRequest);
      
      // Use a direct axios call with proper headers
      const response = await axios.post('/api/notifications/create', notificationRequest, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Notification created successfully:', response.data);
      toast.success('Notification created successfully');
      setCreateDialogOpen(false);
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      
      // Extract the specific error message from the Spring Boot response
      let errorMsg = 'Failed to create notification';
      if (error.response?.data) {
        // The Spring error format often includes the message directly in the response data
        errorMsg = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || errorMsg;
      }
      
      // Look for specific backend error messages and provide user-friendly alternatives
      if (errorMsg.includes('Recipient user not found')) {
        errorMsg = 'The recipient email address is not registered in the system.';
      }
      
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotification = async () => {
    if (!selectedNotification) {
      setDeleteDialogOpen(false);
      return;
    }
    
    try {
      setIsSubmitting(true);
      await notificationApi.deleteNotification(selectedNotification.notificationId);
      setNotifications(notifications.filter(n => n.notificationId !== selectedNotification.notificationId));
      toast.success('Notification deleted');
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting notification:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      toast.error('Failed to delete notification');
    } finally {
      setIsSubmitting(false);
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
    if (!dateString) return 'Unknown time';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid date';
      
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
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };

  const handleCloseError = () => {
    setErrorMessage(null);
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
      <Snackbar 
        open={!!errorMessage} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Notifications</Typography>
          {(isAdmin || isInstructor) && (
            <Button 
              variant="contained" 
              size="small" 
              onClick={handleOpenCreateDialog}
              startIcon={<NotificationsIcon />}
              disabled={isSubmitting}
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
              <React.Fragment key={notification.notificationId || notification.id}>
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
                          {getTimeString(notification.createdAt || notification.createdDate)}
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
      <Dialog 
        open={createDialogOpen} 
        onClose={() => !isSubmitting && setCreateDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
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
            disabled={isSubmitting}
            error={!newNotification.title && newNotification.title !== undefined}
            helperText={!newNotification.title && newNotification.title !== undefined ? "Title is required" : ""}
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
            disabled={isSubmitting}
            error={!newNotification.message && newNotification.message !== undefined}
            helperText={!newNotification.message && newNotification.message !== undefined ? "Message is required" : ""}
          />
          {(isAdmin || isInstructor) && (
            <TextField
              margin="normal"
              label="Recipient Email"
              fullWidth
              placeholder="Must be a registered user's email. Leave empty to use your own email."
              value={newNotification.recipientEmail}
              onChange={(e) => setNewNotification({ ...newNotification, recipientEmail: e.target.value })}
              disabled={isSubmitting}
              helperText="Notification can only be sent to existing users in the system"
            />
          )}
          <FormControl fullWidth margin="normal" disabled={isSubmitting}>
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
          <Button onClick={() => setCreateDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateNotification} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Creating...
              </>
            ) : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Notification Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !isSubmitting && setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Notification</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this notification?
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}>
            {selectedNotification?.title}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteNotification} 
            variant="contained" 
            color="error"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                Deleting...
              </>
            ) : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

export default NotificationCenter;