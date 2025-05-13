// src/pages/instructor/ContentUpload.jsx - Fixed version
import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Alert,
  Snackbar
} from '@mui/material'
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PictureAsPdf as PdfIcon,
  VideoLibrary as VideoIcon,
  Link as LinkIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  TextFields as TextIcon
} from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { contentApi, courseApi, moduleApi } from '../../services/api'
import { toast } from 'react-toastify'

const ContentUpload = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { courseId } = useParams()
  
  const [course, setCourse] = useState(null)
  const [content, setContent] = useState([])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(false)
  const [modulesLoading, setModulesLoading] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showError, setShowError] = useState(false)
  
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    type: 'PDF',
    file: null,
    externalUrl: '',
    moduleId: '',
    content: ''
  })
  
  useEffect(() => {
    if (courseId) {
      fetchCourseDetails()
      fetchCourseContent()
      fetchModules()
    }
  }, [courseId])
  
  const fetchCourseDetails = async () => {
    try {
      setLoading(true)
      const response = await courseApi.getCourseById(courseId)
      setCourse(response.data)
    } catch (error) {
      console.error('Error fetching course details:', error)
      toast.error('Failed to load course details')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchCourseContent = async () => {
    try {
      setContentLoading(true)
      const response = await contentApi.getContentByCourse(courseId)
      setContent(response.data || [])
    } catch (error) {
      console.error('Error fetching course content:', error)
      toast.error('Failed to load course content')
    } finally {
      setContentLoading(false)
    }
  }
  
  const fetchModules = async () => {
    try {
      setModulesLoading(true)
      const response = await moduleApi.getModulesByCourse(courseId)
      setModules(response.data || [])
    } catch (error) {
      console.error('Error fetching modules:', error)
      toast.error('Failed to load modules')
    } finally {
      setModulesLoading(false)
    }
  }
  
  const handleOpenUploadDialog = () => {
    setUploadDialogOpen(true)
  }
  
  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false)
    setNewContent({
      title: '',
      description: '',
      type: 'PDF',
      file: null,
      externalUrl: '',
      moduleId: '',
      content: ''
    })
    setUploadProgress(0)
  }
  
  const handleOpenDeleteDialog = (content) => {
    setSelectedContent(content)
    setDeleteDialogOpen(true)
  }
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setSelectedContent(null)
  }
  
  const handleContentChange = (e) => {
    const { name, value } = e.target
    setNewContent({
      ...newContent,
      [name]: value,
    })
  }
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewContent({
        ...newContent,
        file: e.target.files[0],
      })
    }
  }
  
  const handleUploadContent = async () => {
    // Validate form
    if (!newContent.title) {
      setErrorMessage('Please enter a title')
      setShowError(true)
      return
    }
    
    if (!newContent.moduleId) {
      setErrorMessage('Please select a module')
      setShowError(true)
      return
    }
    
    if (newContent.type === 'VIDEO' || newContent.type === 'PDF') {
      if (!newContent.file && !newContent.externalUrl) {
        setErrorMessage('Please select a file to upload or provide a URL')
        setShowError(true)
        return
      }
    } else if (newContent.type === 'LINK') {
      if (!newContent.externalUrl) {
        setErrorMessage('Please enter a URL')
        setShowError(true)
        return
      }
    } else if (newContent.type === 'TEXT') {
      if (!newContent.content) {
        setErrorMessage('Please enter some text content')
        setShowError(true)
        return
      }
    }
    
    try {
      setUploading(true)
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)
      
      // Prepare content data
      let contentData = {
        title: newContent.title,
        description: newContent.description || '',
        type: newContent.type,
        moduleId: newContent.moduleId,
        courseId: courseId
      }
      
      let response;
      
      // Handle different content types
      if (newContent.type === 'LINK') {
        // For external links
        contentData.urlFileLocation = newContent.externalUrl
        contentData.fileSize = 1024
        contentData.fileType = 'text/html'
        contentData.fileName = newContent.title + '.url'
        
        response = await contentApi.uploadJsonContent(contentData)
      } else if (newContent.type === 'TEXT') {
        // For text content
        contentData.content = newContent.content
        contentData.urlFileLocation = 'text://' + Date.now()
        contentData.fileSize = newContent.content.length
        contentData.fileType = 'text/plain'
        contentData.fileName = newContent.title + '.txt'
        
        response = await contentApi.uploadJsonContent(contentData)
      } else {
        // For file uploads (PDF, VIDEO, etc.)
        if (newContent.file) {
          contentData.file = newContent.file
        } else if (newContent.externalUrl) {
          contentData.urlFileLocation = newContent.externalUrl
          contentData.fileSize = 1024
          contentData.fileType = newContent.type === 'PDF' ? 'application/pdf' : 'video/mp4'
          contentData.fileName = newContent.title + (newContent.type === 'PDF' ? '.pdf' : '.mp4')
        }
        
        response = await contentApi.uploadContent(contentData)
      }
      
      // Complete progress
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Update content list
      setContent([...content, response.data])
      
      toast.success('Content uploaded successfully')
      handleCloseUploadDialog()
    } catch (error) {
      console.error('Error uploading content:', error)
      setErrorMessage('Failed to upload content: ' + (error.response?.data?.message || error.message))
      setShowError(true)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }
  
  const handleDeleteContent = async () => {
    try {
      await contentApi.deleteContent(selectedContent.contentId)
      setContent(content.filter(item => item.contentId !== selectedContent.contentId))
      toast.success('Content deleted successfully')
      handleCloseDeleteDialog()
    } catch (error) {
      console.error('Error deleting content:', error)
      toast.error('Failed to delete content')
    }
  }
  
  const getContentIcon = (type) => {
    switch (type) {
      case 'VIDEO':
        return <VideoIcon color="primary" />
      case 'PDF':
        return <PdfIcon color="error" />
      case 'LINK':
        return <LinkIcon color="info" />
      case 'QUIZ':
        return <AssignmentIcon color="warning" />
      case 'TEXT':
        return <TextIcon color="success" />
      default:
        return <CloudUploadIcon />
    }
  }
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {course ? `Content Management: ${course.title}` : 'Content Management'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenUploadDialog}
        >
          Add Content
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Modules
            </Typography>
            {modulesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : modules.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                No modules have been created yet.
              </Alert>
            ) : (
              <List>
                {modules.map((module) => (
                  <ListItem key={module.moduleId} button>
                    <ListItemText 
                      primary={module.title} 
                      secondary={`${content.filter(c => c.moduleId === module.moduleId).length} items`} 
                    />
                  </ListItem>
                ))}
              </List>
            )}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/instructor/courses/${courseId}/modules`)}
              sx={{ mt: 2 }}
            >
              Manage Modules
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Course Content
            </Typography>
            
            {contentLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : content.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No content has been added to this course yet.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CloudUploadIcon />}
                  onClick={handleOpenUploadDialog}
                  sx={{ mt: 2 }}
                  disabled={modules.length === 0}
                >
                  Upload Your First Content
                </Button>
                
                {modules.length === 0 && (
                  <Alert severity="warning" sx={{ mt: 2, mx: 'auto', maxWidth: 450 }}>
                    You need to create at least one module before you can add content.
                  </Alert>
                )}
              </Box>
            ) : (
              <List>
                {content.map((item) => {
                  const moduleTitle = modules.find(m => m.moduleId === item.moduleId)?.title || 'No Module';
                  
                  return (
                    <React.Fragment key={item.contentId}>
                      <ListItem>
                        <ListItemIcon>
                          {getContentIcon(item.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.title}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {item.type} · Module: {moduleTitle}
                              </Typography>
                              {item.description && ` — ${item.description}`}
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" aria-label="edit">
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDeleteDialog(item)}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Upload Content Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Content</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Content Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newContent.title}
            onChange={handleContentChange}
            sx={{ mb: 2 }}
            required
          />
          
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newContent.description}
            onChange={handleContentChange}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }} required>
            <InputLabel id="content-type-label">Content Type</InputLabel>
            <Select
              labelId="content-type-label"
              name="type"
              value={newContent.type}
              onChange={handleContentChange}
              label="Content Type"
            >
              <MenuItem value="PDF">PDF Document</MenuItem>
              <MenuItem value="VIDEO">Video</MenuItem>
              <MenuItem value="LINK">External Link</MenuItem>
              <MenuItem value="TEXT">Text Content</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }} required>
            <InputLabel id="module-label">Module</InputLabel>
            <Select
              labelId="module-label"
              name="moduleId"
              value={newContent.moduleId}
              onChange={handleContentChange}
              label="Module"
            >
              {modules.map((module) => (
                <MenuItem key={module.moduleId} value={module.moduleId}>
                  {module.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {(newContent.type === 'VIDEO' || newContent.type === 'PDF') && (
            <>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mb: 1 }}
              >
                {newContent.file ? newContent.file.name : `Upload ${newContent.type === 'VIDEO' ? 'Video' : 'PDF'}`}
                <input
                  type="file"
                  hidden
                  accept={newContent.type === 'VIDEO' ? 'video/*' : 'application/pdf'}
                  onChange={handleFileChange}
                />
              </Button>
              
              <Divider sx={{ my: 2 }}>OR</Divider>
              
              <TextField
                margin="dense"
                name="externalUrl"
                label="External URL"
                type="url"
                fullWidth
                variant="outlined"
                value={newContent.externalUrl}
                onChange={handleContentChange}
                helperText={`Enter a direct URL to a ${newContent.type === 'VIDEO' ? 'video' : 'PDF'} file`}
                sx={{ mb: 2 }}
              />
            </>
          )}
          
          {newContent.type === 'LINK' && (
            <TextField
              margin="dense"
              name="externalUrl"
              label="External URL"
              type="url"
              fullWidth
              variant="outlined"
              value={newContent.externalUrl}
              onChange={handleContentChange}
              required
              sx={{ mb: 2 }}
            />
          )}
          
          {newContent.type === 'TEXT' && (
            <TextField
              margin="dense"
              name="content"
              label="Text Content"
              multiline
              rows={6}
              fullWidth
              variant="outlined"
              value={newContent.content}
              onChange={handleContentChange}
              required
              sx={{ mb: 2 }}
            />
          )}
          
          {uploading && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                {uploadProgress}%
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog} disabled={uploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUploadContent} 
            variant="contained" 
            color="primary"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Content Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Content</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedContent?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteContent} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ContentUpload