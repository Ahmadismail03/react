// src/pages/admin/SystemSettings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Snackbar,
  Badge,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';

const SystemSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Learning Management System',
      siteDescription: 'A comprehensive learning platform',
      contactEmail: 'admin@example.com',
      allowRegistration: true,
      maintenanceMode: false,
    },
    email: {
      smtpHost: 'smtp.example.com',
      smtpPort: '587',
      smtpUsername: 'notifications@example.com',
      smtpPassword: '',
      fromEmail: 'no-reply@example.com',
      fromName: 'LMS Notifications',
      enableEmailNotifications: true,
    },
    security: {
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireNumbers: true,
      passwordRequireSymbols: true,
      maxLoginAttempts: 5,
      tokenExpiryMinutes: 60,
      enableTwoFactorAuth: false,
    },
    storage: {
      maxUploadSize: 50,
      allowedFileTypes: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.mp3',
      storageProvider: 'local',
      s3Region: '',
      s3Bucket: '',
      s3AccessKey: '',
      s3SecretKey: '',
    },
    localization: {
      defaultLanguage: 'en',
      defaultTimezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12',
      availableLanguages: ['en', 'es', 'fr', 'de'],
    },
    notifications: {
      enableBrowserNotifications: true,
      enableInAppNotifications: true,
      notificationDisplayTime: 5,
      autoDeleteReadNotifications: false,
      defaultNotificationEvents: [
        { id: 1, name: 'course_enrollment', enabled: true },
        { id: 2, name: 'assignment_due', enabled: true },
        { id: 3, name: 'grade_posted', enabled: true },
        { id: 4, name: 'course_completion', enabled: true },
        { id: 5, name: 'new_announcement', enabled: true },
      ],
    },
  });
  
  const [systemStatus, setSystemStatus] = useState({
    databaseConnected: true,
    emailServiceRunning: true,
    storageServiceRunning: true,
    lastBackupDate: '2023-10-15 03:00:00',
    diskSpaceUsed: 65,
    totalUsers: 0,
    totalCourses: 0,
    systemVersion: '1.0.0',
  });
  
  const [editNotificationEvent, setEditNotificationEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  
  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'ADMIN') {
      navigate('/');
      toast.error('Access denied. Admin permissions required.');
      return;
    }
    
    // Fetch system settings
    fetchSystemSettings();
  }, [user, navigate]);
  
  const fetchSystemSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch settings from the API
      const response = await adminApi.getSystemSettings();
      setSettings(response.data);
      
      // Fetch system status
      const statusResponse = await adminApi.getSystemStatus();
      setSystemStatus(statusResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching system settings:', error);
      toast.error('Failed to load system settings');
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleGeneralSettingChange = (e) => {
    const { name, value, checked } = e.target;
    const updatedValue = e.target.type === 'checkbox' ? checked : value;
    
    setSettings({
      ...settings,
      general: {
        ...settings.general,
        [name]: updatedValue,
      },
    });
  };
  
  const handleEmailSettingChange = (e) => {
    const { name, value, checked } = e.target;
    const updatedValue = e.target.type === 'checkbox' ? checked : value;
    
    setSettings({
      ...settings,
      email: {
        ...settings.email,
        [name]: updatedValue,
      },
    });
  };
  
  const handleSecuritySettingChange = (e) => {
    const { name, value, checked } = e.target;
    const updatedValue = e.target.type === 'checkbox' ? checked : value;
    
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        [name]: name.startsWith('password') || name === 'maxLoginAttempts' || name === 'tokenExpiryMinutes'
          ? parseInt(value, 10)
          : updatedValue,
      },
    });
  };
  
  const handleStorageSettingChange = (e) => {
    const { name, value, checked } = e.target;
    const updatedValue = e.target.type === 'checkbox' ? checked : value;
    
    setSettings({
      ...settings,
      storage: {
        ...settings.storage,
        [name]: name === 'maxUploadSize' ? parseInt(value, 10) : updatedValue,
      },
    });
  };
  
  const handleLocalizationSettingChange = (e) => {
    const { name, value } = e.target;
    
    setSettings({
      ...settings,
      localization: {
        ...settings.localization,
        [name]: value,
      },
    });
  };
  
  const handleNotificationSettingChange = (e) => {
    const { name, value, checked } = e.target;
    const updatedValue = e.target.type === 'checkbox' ? checked : value;
    
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [name]: name === 'notificationDisplayTime' ? parseInt(value, 10) : updatedValue,
      },
    });
  };
  
  const handleNotificationEventToggle = (eventId) => {
    const updatedEvents = settings.notifications.defaultNotificationEvents.map(event => 
      event.id === eventId ? { ...event, enabled: !event.enabled } : event
    );
    
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        defaultNotificationEvents: updatedEvents,
      },
    });
  };
  
  const handleEditNotificationEvent = (event) => {
    setEditNotificationEvent(event);
    setDialogOpen(true);
  };
  
  const handleSaveNotificationEvent = () => {
    const updatedEvents = settings.notifications.defaultNotificationEvents.map(event => 
      event.id === editNotificationEvent.id ? editNotificationEvent : event
    );
    
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        defaultNotificationEvents: updatedEvents,
      },
    });
    
    setDialogOpen(false);
    setEditNotificationEvent(null);
  };
  
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Save settings to the API
      await adminApi.updateSystemSettings(settings);
      
      toast.success('System settings saved successfully');
      setShowSavedMessage(true);
    } catch (error) {
      console.error('Error saving system settings:', error);
      toast.error('Failed to save system settings');
    } finally {
      setSaving(false);
    }
  };
  
  const handleResetSettings = () => {
    // Reload settings from the server
    fetchSystemSettings();
    toast.info('Settings reset to last saved values');
  };
  
  const handleOpenTestEmailDialog = () => {
    setTestEmailAddress(settings.email.fromEmail);
    setTestEmailDialogOpen(true);
  };
  
  const handleCloseTestEmailDialog = () => {
    setTestEmailDialogOpen(false);
  };
  
  const handleSendTestEmail = async () => {
    if (!testEmailAddress) {
      toast.error('Please enter an email address');
      return;
    }
    
    try {
      setTestEmailSending(true);
      
      // Send test email
      await adminApi.sendTestEmail(testEmailAddress);
      
      toast.success('Test email sent successfully');
      handleCloseTestEmailDialog();
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setTestEmailSending(false);
    }
  };
  
  const renderGeneralSettings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          General Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Site Name"
              name="siteName"
              value={settings.general.siteName}
              onChange={handleGeneralSettingChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Site Description"
              name="siteDescription"
              value={settings.general.siteDescription}
              onChange={handleGeneralSettingChange}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Contact Email"
              name="contactEmail"
              type="email"
              value={settings.general.contactEmail}
              onChange={handleGeneralSettingChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.general.allowRegistration}
                  onChange={handleGeneralSettingChange}
                  name="allowRegistration"
                />
              }
              label="Allow User Registration"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.general.maintenanceMode}
                  onChange={handleGeneralSettingChange}
                  name="maintenanceMode"
                />
              }
              label="Maintenance Mode"
            />
            {settings.general.maintenanceMode && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                When maintenance mode is enabled, only administrators can access the site.
              </Alert>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  
  const renderEmailSettings = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Email Settings
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<EmailIcon />}
            onClick={handleOpenTestEmailDialog}
          >
            Send Test Email
          </Button>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="SMTP Host"
              name="smtpHost"
              value={settings.email.smtpHost}
              onChange={handleEmailSettingChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="SMTP Port"
              name="smtpPort"
              value={settings.email.smtpPort}
              onChange={handleEmailSettingChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="SMTP Username"
              name="smtpUsername"
              value={settings.email.smtpUsername}
              onChange={handleEmailSettingChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="SMTP Password"
              name="smtpPassword"
              type="password"
              value={settings.email.smtpPassword}
              onChange={handleEmailSettingChange}
              placeholder="••••••••"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="From Email"
              name="fromEmail"
              value={settings.email.fromEmail}
              onChange={handleEmailSettingChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="From Name"
              name="fromName"
              value={settings.email.fromName}
              onChange={handleEmailSettingChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.email.enableEmailNotifications}
                  onChange={handleEmailSettingChange}
                  name="enableEmailNotifications"
                />
              }
              label="Enable Email Notifications"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  
  const renderSecuritySettings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Security Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Minimum Password Length"
              name="passwordMinLength"
              type="number"
              value={settings.security.passwordMinLength}
              onChange={handleSecuritySettingChange}
              InputProps={{ inputProps: { min: 6, max: 32 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Max Login Attempts"
              name="maxLoginAttempts"
              type="number"
              value={settings.security.maxLoginAttempts}
              onChange={handleSecuritySettingChange}
              InputProps={{ inputProps: { min: 3, max: 10 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Token Expiry (minutes)"
              name="tokenExpiryMinutes"
              type="number"
              value={settings.security.tokenExpiryMinutes}
              onChange={handleSecuritySettingChange}
              InputProps={{ inputProps: { min: 15, max: 1440 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.security.enableTwoFactorAuth}
                  onChange={handleSecuritySettingChange}
                  name="enableTwoFactorAuth"
                />
              }
              label="Enable Two-Factor Authentication"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Password Requirements
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.passwordRequireUppercase}
                      onChange={handleSecuritySettingChange}
                      name="passwordRequireUppercase"
                    />
                  }
                  label="Require Uppercase"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.passwordRequireNumbers}
                      onChange={handleSecuritySettingChange}
                      name="passwordRequireNumbers"
                    />
                  }
                  label="Require Numbers"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.passwordRequireSymbols}
                      onChange={handleSecuritySettingChange}
                      name="passwordRequireSymbols"
                    />
                  }
                  label="Require Symbols"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  
  const renderStorageSettings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Storage Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Max Upload Size (MB)"
              name="maxUploadSize"
              type="number"
              value={settings.storage.maxUploadSize}
              onChange={handleStorageSettingChange}
              InputProps={{ inputProps: { min: 1, max: 1000 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Storage Provider</InputLabel>
              <Select
                name="storageProvider"
                value={settings.storage.storageProvider}
                onChange={handleStorageSettingChange}
                label="Storage Provider"
              >
                <MenuItem value="local">Local Storage</MenuItem>
                <MenuItem value="s3">Amazon S3</MenuItem>
                <MenuItem value="gcs">Google Cloud Storage</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Allowed File Types"
              name="allowedFileTypes"
              value={settings.storage.allowedFileTypes}
              onChange={handleStorageSettingChange}
              helperText="Comma-separated list of allowed file extensions (e.g., .pdf,.jpg)"
            />
          </Grid>
          
          {settings.storage.storageProvider === 's3' && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="S3 Region"
                  name="s3Region"
                  value={settings.storage.s3Region}
                  onChange={handleStorageSettingChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="S3 Bucket"
                  name="s3Bucket"
                  value={settings.storage.s3Bucket}
                  onChange={handleStorageSettingChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="S3 Access Key"
                  name="s3AccessKey"
                  value={settings.storage.s3AccessKey}
                  onChange={handleStorageSettingChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="S3 Secret Key"
                  name="s3SecretKey"
                  type="password"
                  value={settings.storage.s3SecretKey}
                  onChange={handleStorageSettingChange}
                  placeholder="••••••••"
                />
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
  
  const renderLocalizationSettings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Localization Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Default Language</InputLabel>
              <Select
                name="defaultLanguage"
                value={settings.localization.defaultLanguage}
                onChange={handleLocalizationSettingChange}
                label="Default Language"
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Default Timezone</InputLabel>
              <Select
                name="defaultTimezone"
                value={settings.localization.defaultTimezone}
                onChange={handleLocalizationSettingChange}
                label="Default Timezone"
              >
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                <MenuItem value="Europe/London">London (GMT)</MenuItem>
                <MenuItem value="Europe/Paris">Paris (CET)</MenuItem>
                <MenuItem value="Asia/Tokyo">Tokyo (JST)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Date Format</InputLabel>
              <Select
                name="dateFormat"
                value={settings.localization.dateFormat}
                onChange={handleLocalizationSettingChange}
                label="Date Format"
              >
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Time Format</InputLabel>
              <Select
                name="timeFormat"
                value={settings.localization.timeFormat}
                onChange={handleLocalizationSettingChange}
                label="Time Format"
              >
                <MenuItem value="12">12-hour (AM/PM)</MenuItem>
                <MenuItem value="24">24-hour</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Available Languages
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {settings.localization.availableLanguages.map((lang) => (
                <Chip
                  key={lang}
                  label={
                    lang === 'en' ? 'English' :
                    lang === 'es' ? 'Spanish' :
                    lang === 'fr' ? 'French' :
                    lang === 'de' ? 'German' : lang
                  }
                  variant={settings.localization.defaultLanguage === lang ? 'filled' : 'outlined'}
                  color={settings.localization.defaultLanguage === lang ? 'primary' : 'default'}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  
  const renderNotificationSettings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Notification Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.enableBrowserNotifications}
                  onChange={handleNotificationSettingChange}
                  name="enableBrowserNotifications"
                />
              }
              label="Enable Browser Notifications"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.enableInAppNotifications}
                  onChange={handleNotificationSettingChange}
                  name="enableInAppNotifications"
                />
              }
              label="Enable In-App Notifications"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Notification Display Time (seconds)"
              name="notificationDisplayTime"
              type="number"
              value={settings.notifications.notificationDisplayTime}
              onChange={handleNotificationSettingChange}
              InputProps={{ inputProps: { min: 1, max: 30 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.autoDeleteReadNotifications}
                  onChange={handleNotificationSettingChange}
                  name="autoDeleteReadNotifications"
                />
              }
              label="Auto-Delete Read Notifications"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Default Notification Events
            </Typography>
            <List>
              {settings.notifications.defaultNotificationEvents.map((event) => (
                <ListItem key={event.id}>
                  <ListItemText
                    primary={event.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleEditNotificationEvent(event)}
                    >
                      <EditIcon />
                    </IconButton>
                    <Switch
                      edge="end"
                      checked={event.enabled}
                      onChange={() => handleNotificationEventToggle(event.id)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  
  const renderSystemStatusCard = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          System Status
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: systemStatus.databaseConnected ? 'success.main' : 'error.main',
                    }}
                  />
                }
              >
                <Box
                  sx={{
                    bgcolor: 'background.default',
                    p: 1,
                    borderRadius: '50%',
                    display: 'flex',
                  }}
                >
                  <StorageIcon color="primary" />
                </Box>
              </Badge>
              <Box sx={{ ml: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Database
                </Typography>
                <Typography variant="body1">
                  {systemStatus.databaseConnected ? 'Connected' : 'Disconnected'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: systemStatus.emailServiceRunning ? 'success.main' : 'error.main',
                    }}
                  />
                }
              >
                <Box
                  sx={{
                    bgcolor: 'background.default',
                    p: 1,
                    borderRadius: '50%',
                    display: 'flex',
                  }}
                >
                  <EmailIcon color="primary" />
                </Box>
              </Badge>
              <Box sx={{ ml: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Email Service
                </Typography>
                <Typography variant="body1">
                  {systemStatus.emailServiceRunning ? 'Running' : 'Stopped'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: systemStatus.storageServiceRunning ? 'success.main' : 'error.main',
                    }}
                  />
                }
              >
                <Box
                  sx={{
                    bgcolor: 'background.default',
                    p: 1,
                    borderRadius: '50%',
                    display: 'flex',
                  }}
                >
                  <StorageIcon color="primary" />
                </Box>
              </Badge>
              <Box sx={{ ml: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Storage Service
                </Typography>
                <Typography variant="body1">
                  {systemStatus.storageServiceRunning ? 'Running' : 'Stopped'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  bgcolor: 'background.default',
                  p: 1,
                  borderRadius: '50%',
                  display: 'flex',
                }}
              >
                <InfoIcon color="primary" />
              </Box>
              <Box sx={{ ml: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  System Version
                </Typography>
                <Typography variant="body1">
                  {systemStatus.systemVersion}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Disk Space Usage
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={systemStatus.diskSpaceUsed} 
                  sx={{ height: 8, borderRadius: 5 }}
                  color={
                    systemStatus.diskSpaceUsed > 90 ? 'error' :
                    systemStatus.diskSpaceUsed > 70 ? 'warning' : 'success'
                  }
                />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">
                  {systemStatus.diskSpaceUsed}%
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Last Backup
            </Typography>
            <Typography variant="body1">
              {systemStatus.lastBackupDate}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Total Users
            </Typography>
            <Typography variant="body1">
              {systemStatus.totalUsers}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Total Courses
            </Typography>
            <Typography variant="body1">
              {systemStatus.totalCourses}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              System Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure system-wide settings for your learning management system.
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleResetSettings}
              sx={{ mr: 1 }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Box>
        
        {renderSystemStatusCard()}
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab icon={<SettingsIcon />} iconPosition="start" label="General" />
          <Tab icon={<EmailIcon />} iconPosition="start" label="Email" />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="Security" />
          <Tab icon={<StorageIcon />} iconPosition="start" label="Storage" />
          <Tab icon={<LanguageIcon />} iconPosition="start" label="Localization" />
          <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notifications" />
        </Tabs>
        
        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && renderGeneralSettings()}
          {activeTab === 1 && renderEmailSettings()}
          {activeTab === 2 && renderSecuritySettings()}
          {activeTab === 3 && renderStorageSettings()}
          {activeTab === 4 && renderLocalizationSettings()}
          {activeTab === 5 && renderNotificationSettings()}
        </Box>
      </Paper>
      
      {/* Edit Notification Event Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Edit Notification Event</DialogTitle>
        <DialogContent>
          {editNotificationEvent && (
            <TextField
              fullWidth
              label="Event Name"
              value={editNotificationEvent.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveNotificationEvent} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Test Email Dialog */}
      <Dialog open={testEmailDialogOpen} onClose={handleCloseTestEmailDialog}>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Send a test email to verify your email configuration.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Recipient Email"
            type="email"
            fullWidth
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTestEmailDialog}>Cancel</Button>
          <Button 
            onClick={handleSendTestEmail} 
            variant="contained" 
            color="primary"
            disabled={testEmailSending}
          >
            {testEmailSending ? 'Sending...' : 'Send Test Email'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Saved Message Snackbar */}
      <Snackbar
        open={showSavedMessage}
        autoHideDuration={3000}
        onClose={() => setShowSavedMessage(false)}
        message="Settings saved successfully"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setShowSavedMessage(false)}
          >
            <CheckIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default SystemSettings;