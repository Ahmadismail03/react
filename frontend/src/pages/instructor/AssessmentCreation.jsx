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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControlLabel,
  Switch,
  Radio,
  RadioGroup,
  Checkbox,
  FormGroup,
  FormLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  Timer as TimerIcon,
  Help as HelpIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { assessmentApi, courseApi } from '../../services/api'
import { toast } from 'react-toastify'

const AssessmentCreation = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { courseId } = useParams()
  
  const [course, setCourse] = useState(null)
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [assessmentsLoading, setAssessmentsLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [editMode, setEditMode] = useState(false)
  
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    description: '',
    timeLimit: 0,
    hasTimeLimit: false,
    passingScore: 70,
    showCorrectAnswers: true,
    questions: [
      {
        text: '',
        type: 'MULTIPLE_CHOICE',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      },
    ],
  })
  
  useEffect(() => {
    if (courseId) {
      fetchCourseDetails()
      fetchAssessments()
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
  
  const fetchAssessments = async () => {
    try {
      setAssessmentsLoading(true)
      const response = await assessmentApi.getAssessmentsByCourse(courseId)
      setAssessments(response.data || [])
    } catch (error) {
      console.error('Error fetching assessments:', error)
      toast.error('Failed to load assessments')
    } finally {
      setAssessmentsLoading(false)
    }
  }
  
  const handleOpenCreateDialog = () => {
    setEditMode(false)
    setNewAssessment({
      title: '',
      description: '',
      timeLimit: 0,
      hasTimeLimit: false,
      passingScore: 70,
      showCorrectAnswers: true,
      questions: [
        {
          text: '',
          type: 'MULTIPLE_CHOICE',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ],
        },
      ],
    })
    setCreateDialogOpen(true)
  }
  
  const handleOpenEditDialog = (assessment) => {
    setEditMode(true)
    setSelectedAssessment(assessment)
    setNewAssessment({
      ...assessment,
      hasTimeLimit: assessment.timeLimit > 0,
    })
    setCreateDialogOpen(true)
  }
  
  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false)
  }
  
  const handleOpenDeleteDialog = (assessment) => {
    setSelectedAssessment(assessment)
    setDeleteDialogOpen(true)
  }
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setSelectedAssessment(null)
  }
  
  const handleAssessmentChange = (e) => {
    const { name, value, checked } = e.target
    if (name === 'hasTimeLimit') {
      setNewAssessment({
        ...newAssessment,
        hasTimeLimit: checked,
        timeLimit: checked ? newAssessment.timeLimit : 0,
      })
    } else if (name === 'showCorrectAnswers') {
      setNewAssessment({
        ...newAssessment,
        [name]: checked,
      })
    } else {
      setNewAssessment({
        ...newAssessment,
        [name]: value,
      })
    }
  }
  
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newAssessment.questions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    }
    setNewAssessment({
      ...newAssessment,
      questions: updatedQuestions,
    })
  }
  
  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...newAssessment.questions]
    const updatedOptions = [...updatedQuestions[questionIndex].options]
    
    if (field === 'isCorrect' && updatedQuestions[questionIndex].type === 'MULTIPLE_CHOICE') {
      // For multiple choice, only one option can be correct
      updatedOptions.forEach((option, idx) => {
        option.isCorrect = idx === optionIndex
      })
    } else {
      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        [field]: value,
      }
    }
    
    updatedQuestions[questionIndex].options = updatedOptions
    
    setNewAssessment({
      ...newAssessment,
      questions: updatedQuestions,
    })
  }
  
  const addQuestion = () => {
    setNewAssessment({
      ...newAssessment,
      questions: [
        ...newAssessment.questions,
        {
          text: '',
          type: 'MULTIPLE_CHOICE',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ],
        },
      ],
    })
  }
  
  const removeQuestion = (index) => {
    if (newAssessment.questions.length <= 1) {
      toast.error('Assessment must have at least one question')
      return
    }
    
    const updatedQuestions = [...newAssessment.questions]
    updatedQuestions.splice(index, 1)
    
    setNewAssessment({
      ...newAssessment,
      questions: updatedQuestions,
    })
  }
  
  const addOption = (questionIndex) => {
    const updatedQuestions = [...newAssessment.questions]
    updatedQuestions[questionIndex].options.push({ text: '', isCorrect: false })
    
    setNewAssessment({
      ...newAssessment,
      questions: updatedQuestions,
    })
  }
  
  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...newAssessment.questions]
    if (updatedQuestions[questionIndex].options.length <= 2) {
      toast.error('Question must have at least two options')
      return
    }
    
    updatedQuestions[questionIndex].options.splice(optionIndex, 1)
    
    setNewAssessment({
      ...newAssessment,
      questions: updatedQuestions,
    })
  }
  
  const validateAssessment = () => {
    if (!newAssessment.title.trim()) {
      toast.error('Please enter an assessment title')
      return false
    }
    
    if (newAssessment.hasTimeLimit && (!newAssessment.timeLimit || newAssessment.timeLimit <= 0)) {
      toast.error('Please enter a valid time limit')
      return false
    }
    
    for (let i = 0; i < newAssessment.questions.length; i++) {
      const question = newAssessment.questions[i]
      
      if (!question.text.trim()) {
        toast.error(`Question ${i + 1} is missing text`)
        return false
      }
      
      let hasCorrectOption = false
      
      for (let j = 0; j < question.options.length; j++) {
        const option = question.options[j]
        
        if (!option.text.trim()) {
          toast.error(`Option ${j + 1} in Question ${i + 1} is missing text`)
          return false
        }
        
        if (option.isCorrect) {
          hasCorrectOption = true
        }
      }
      
      if (!hasCorrectOption) {
        toast.error(`Question ${i + 1} does not have a correct answer marked`)
        return false
      }
    }
    
    return true
  }
  
  const handleCreateAssessment = async () => {
    if (!validateAssessment()) return
    
    try {
      const assessmentData = {
        ...newAssessment,
        courseId,
        timeLimit: newAssessment.hasTimeLimit ? newAssessment.timeLimit : 0,
      }
      
      delete assessmentData.hasTimeLimit
      
      const response = await assessmentApi.createAssessment(assessmentData)
      setAssessments([...assessments, response.data])
      toast.success('Assessment created successfully')
      handleCloseCreateDialog()
    } catch (error) {
      console.error('Error creating assessment:', error)
      toast.error('Failed to create assessment')
    }
  }
  
  const handleUpdateAssessment = async () => {
    if (!validateAssessment()) return
    
    try {
      const assessmentData = {
        ...newAssessment,
        timeLimit: newAssessment.hasTimeLimit ? newAssessment.timeLimit : 0,
      }
      
      delete assessmentData.hasTimeLimit
      
      await assessmentApi.updateAssessment(selectedAssessment.id, assessmentData)
      setAssessments(assessments.map(a => a.id === selectedAssessment.id ? { ...a, ...assessmentData } : a))
      toast.success('Assessment updated successfully')
      handleCloseCreateDialog()
    } catch (error) {
      console.error('Error updating assessment:', error)
      toast.error('Failed to update assessment')
    }
  }
  
  const handleDeleteAssessment = async () => {
    try {
      await assessmentApi.deleteAssessment(selectedAssessment.id)
      setAssessments(assessments.filter(a => a.id !== selectedAssessment.id))
      toast.success('Assessment deleted successfully')
      handleCloseDeleteDialog()
    } catch (error) {
      console.error('Error deleting assessment:', error)
      toast.error('Failed to delete assessment')
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
          {course ? `Assessments: ${course.title}` : 'Assessments'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Create Assessment
        </Button>
      </Box>
      
      {assessmentsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : assessments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Assessments Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create quizzes and assignments to assess student learning.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Create Your First Assessment
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {assessments.map((assessment) => (
            <Grid item xs={12} sm={6} md={4} key={assessment.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {assessment.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {assessment.description || 'No description provided'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AssignmentIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      {assessment.questions.length} Questions
                    </Typography>
                  </Box>
                  {assessment.timeLimit > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimerIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="body2">
                        Time Limit: {assessment.timeLimit} minutes
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleOpenEditDialog(assessment)}>
                    Edit
                  </Button>
                  <Button size="small" color="error" onClick={() => handleOpenDeleteDialog(assessment)}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Create/Edit Assessment Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Assessment' : 'Create Assessment'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Assessment Title"
                name="title"
                value={newAssessment.title}
                onChange={handleAssessmentChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={newAssessment.description}
                onChange={handleAssessmentChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newAssessment.hasTimeLimit}
                    onChange={handleAssessmentChange}
                    name="hasTimeLimit"
                  />
                }
                label="Time Limit"
              />
              {newAssessment.hasTimeLimit && (
                <TextField
                  label="Minutes"
                  name="timeLimit"
                  type="number"
                  value={newAssessment.timeLimit}
                  onChange={handleAssessmentChange}
                  fullWidth
                  InputProps={{ inputProps: { min: 1 } }}
                  sx={{ mt: 2 }}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Passing Score (%)"
                name="passingScore"
                type="number"
                value={newAssessment.passingScore}
                onChange={handleAssessmentChange}
                fullWidth
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={newAssessment.showCorrectAnswers}
                    onChange={handleAssessmentChange}
                    name="showCorrectAnswers"
                  />
                }
                label="Show Correct Answers After Submission"
                sx={{ mt: 2 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Questions</Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addQuestion}
                >
                  Add Question
                </Button>
              </Box>
              
              {newAssessment.questions.map((question, questionIndex) => (
                <Accordion key={questionIndex} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      Question {questionIndex + 1}: {question.text || 'New Question'}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <TextField
                            label="Question Text"
                            value={question.text}
                            onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                            fullWidth
                            required
                          />
                          <IconButton 
                            color="error" 
                            onClick={() => removeQuestion(questionIndex)}
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Question Type</FormLabel>
                          <RadioGroup
                            row
                            value={question.type}
                            onChange={(e) => handleQuestionChange(questionIndex, 'type', e.target.value)}
                          >
                            <FormControlLabel value="MULTIPLE_CHOICE" control={<Radio />} label="Multiple Choice" />
                            <FormControlLabel value="TRUE_FALSE" control={<Radio />} label="True/False" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      
                      {question.type === 'TRUE_FALSE' ? (
                        <Grid item xs={12}>
                          <FormControl component="fieldset">
                            <FormLabel component="legend">Correct Answer</FormLabel>
                            <RadioGroup
                              row
                              value={question.options.findIndex(opt => opt.isCorrect) === 0 ? 'true' : 'false'}
                              onChange={(e) => {
                                const updatedOptions = [
                                  { text: 'True', isCorrect: e.target.value === 'true' },
                                  { text: 'False', isCorrect: e.target.value === 'false' }
                                ]
                                handleQuestionChange(questionIndex, 'options', updatedOptions)
                              }}
                            >
                              <FormControlLabel value="true" control={<Radio />} label="True" />
                              <FormControlLabel value="false" control={<Radio />} label="False" />
                            </RadioGroup>
                          </FormControl>
                        </Grid>
                      ) : (
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" gutterBottom>
                            Options (select the correct answer)
                          </Typography>
                          {question.options.map((option, optionIndex) => (
                            <Box 
                              key={optionIndex} 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 1,
                                p: 1,
                                borderRadius: 1,
                                bgcolor: option.isCorrect ? 'success.50' : 'transparent',
                                border: option.isCorrect ? '1px solid' : 'none',
                                borderColor: 'success.main'
                              }}
                            >
                              <Radio
                                checked={option.isCorrect}
                                onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'isCorrect', e.target.checked)}
                              />
                              <TextField
                                label={`Option ${optionIndex + 1}`}
                                value={option.text}
                                onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                                fullWidth
                                size="small"
                              />
                              <IconButton 
                                color="error" 
                                onClick={() => removeOption(questionIndex, optionIndex)}
                                size="small"
                                sx={{ ml: 1 }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                          <Button
                            startIcon={<AddIcon />}
                            onClick={() => addOption(questionIndex)}
                            sx={{ mt: 1 }}
                          >
                            Add Option
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button 
            onClick={editMode ? handleUpdateAssessment : handleCreateAssessment} 
            variant="contained" 
            color="primary"
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Assessment Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Assessment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedAssessment?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteAssessment} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AssessmentCreation