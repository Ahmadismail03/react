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
  Card,
  CardContent,
  CardActions,
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
} from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { contentApi, courseApi } from '../../services/api'
import { toast } from 'react-toastify'

const ContentUpload = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { courseId } = useParams()
  
  const [course, setCourse] = useState(null)
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    type: 'VIDEO',
    file: null,
    externalUrl: '',
    moduleId: '',
  })
  
  const [modules, setModules] = useState([
    { id: 'module1', name: 'Module 1: Introduction' },
    { id: 'module2', name: 'Module 2: Core Concepts' },
    { id: 'module3', name: 'Module 3: Advanced Topics' },
  ])
  
  useEffect(() => {
    if (courseId) {
      fetchCourseDetails()
      fetchCourseContent()
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
  
  const handleOpenUploadDialog = () => {
    setUploadDialogOpen(true)
  }
  
  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false)
    setNewContent({
      title: '',
      description: '',
      type: 'VIDEO',
      file: null,
      externalUrl: '',
      moduleId: '',
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
      toast.error('Please enter a title')
      return
    }
    
    if (newContent.type === 'VIDEO' || newContent.type === 'PDF') {
      if (!newContent.file) {
        toast.error('Please select a file to upload')
        return
      }
    } else if (newContent.type === 'LINK') {
      if (!newContent.externalUrl) {
        toast.error('Please enter a URL')
        return
      }
    }
    
    if (!newContent.moduleId) {
      toast.error('Please select a module')
      return
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
      let contentData = {}
      if (newContent.type === 'LINK') {
        contentData = {
          title: newContent.title,
          description: newContent.description,
          type: newContent.type,
          moduleId: newContent.moduleId ? Number(newContent.moduleId) : undefined,
          courseId: courseId,
          urlFileLocation: newContent.externalUrl,
          fileSize: 1,
          fileType: 'link',
          fileName: newContent.title,
          fileUrl: newContent.externalUrl
        }
      } else {
        contentData = {
          title: newContent.title,
          description: newContent.description,
          type: newContent.type,
          moduleId: newContent.moduleId ? Number(newContent.moduleId) : undefined,
          courseId: courseId,
          file: newContent.file,
          urlFileLocation: newContent.file ? `https://example.com/files/${newContent.file.name}` : 'https://placeholder-url.com',
          fileSize: newContent.file ? newContent.file.size : 1024,
          fileType: newContent.file ? newContent.file.type : 'text/plain',
          fileName: newContent.file ? newContent.file.name : undefined,
          fileUrl: newContent.file ? `https://example.com/files/${newContent.file.name}` : undefined
        }
      }
      
      // Upload content
      const response = await contentApi.uploadContent(contentData)
      
      // Complete progress
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Update content list
      setContent([...content, response.data])
      
      toast.success('Content uploaded successfully')
      handleCloseUploadDialog()
    } catch (error) {
      console.error('Error uploading content:', error)
      toast.error('Failed to upload content')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }
  
  const handleDeleteContent = async () => {
    try {
      await contentApi.deleteContent(selectedContent.id)
      setContent(content.filter(item => item.id !== selectedContent.id))
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
            <List>
              {modules.map((module) => (
                <ListItem key={module.id} button>
                  <ListItemText primary={module.name} />
                </ListItem>
              ))}
              <ListItem button>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="Add Module" />
              </ListItem>
            </List>
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
                >
                  Upload Your First Content
                </Button>
              </Box>
            ) : (
              <List>
                {content.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemIcon>
                        {getContentIcon(item.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {item.type}
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
                ))}
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
          
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="content-type-label">Content Type</InputLabel>
            <Select
              labelId="content-type-label"
              name="type"
              value={newContent.type}
              onChange={handleContentChange}
              label="Content Type"
            >
              <MenuItem value="VIDEO">Video</MenuItem>
              <MenuItem value="PDF">PDF Document</MenuItem>
              <MenuItem value="LINK">External Link</MenuItem>
              <MenuItem value="QUIZ">Quiz</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="module-label">Module</InputLabel>
            <Select
              labelId="module-label"
              name="moduleId"
              value={newContent.moduleId}
              onChange={handleContentChange}
              label="Module"
            >
              {modules.map((module) => (
                <MenuItem key={module.id} value={module.id}>
                  {module.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {(newContent.type === 'VIDEO' || newContent.type === 'PDF') && (
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              {newContent.file ? newContent.file.name : `Upload ${newContent.type === 'VIDEO' ? 'Video' : 'PDF'}`}
              <input
                type="file"
                hidden
                accept={newContent.type === 'VIDEO' ? 'video/*' : 'application/pdf'}
                onChange={handleFileChange}
              />
            </Button>
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
    </Box>
  )
}

export default ContentUpload