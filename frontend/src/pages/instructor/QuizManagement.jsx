// src/pages/instructor/QuizManagement.jsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControlLabel,
  Switch,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Tooltip,
  Alert,
  Chip
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Quiz as QuizIcon,
  ExpandMore as ExpandMoreIcon,
  AccessTime as TimeIcon,
  CheckCircle as CorrectIcon,
  Help as HelpIcon,
  BarChart as StatisticsIcon
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { courseApi, quizApi } from '../../services/api'
import { toast } from 'react-toastify'

const QuizManagement = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { courseId } = useParams()
  
  const [course, setCourse] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [quizzesLoading, setQuizzesLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [statsDialogOpen, setStatsDialogOpen] = useState(false)
  const [quizStats, setQuizStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    active: true,
    passingScore: 70,
    showResults: true,
    shuffleQuestions: false,
    questions: [
      {
        text: '',
        type: 'MULTIPLE_CHOICE',
        points: 1,
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]
      }
    ]
  })
  
  useEffect(() => {
    if (courseId) {
      fetchCourseDetails()
      fetchQuizzes()
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
  
  const fetchQuizzes = async () => {
    try {
      setQuizzesLoading(true)
      // This is a placeholder - you'll need to implement an API endpoint for this
      const response = await quizApi.getCourseQuizzes(courseId)
      setQuizzes(response.data || [])
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      toast.error('Failed to load quizzes')
      // For demo, create some sample quizzes
      setQuizzes([
        {
          id: 1,
          title: 'Introduction Quiz',
          description: 'Test your knowledge of the basics',
          timeLimit: 15,
          active: true,
          questions: [{ id: 1, text: 'Sample question 1' }, { id: 2, text: 'Sample question 2' }]
        },
        {
          id: 2,
          title: 'Advanced Concepts',
          description: 'Test your understanding of advanced topics',
          timeLimit: 30,
          active: false,
          questions: [{ id: 3, text: 'Sample question 3' }, { id: 4, text: 'Sample question 4' }]
        }
      ])
    } finally {
      setQuizzesLoading(false)
    }
  }
  
  const handleOpenCreateDialog = () => {
    setEditMode(false)
    setNewQuiz({
      title: '',
      description: '',
      timeLimit: 30,
      active: true,
      passingScore: 70,
      showResults: true,
      shuffleQuestions: false,
      questions: [
        {
          text: '',
          type: 'MULTIPLE_CHOICE',
          points: 1,
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ]
        }
      ]
    })
    setCreateDialogOpen(true)
  }
  
  const handleOpenEditDialog = (quiz) => {
    setEditMode(true)
    setSelectedQuiz(quiz)
    
    // Transform the quiz data for editing
    setNewQuiz({
      ...quiz,
      questions: quiz.questions || [
        {
          text: '',
          type: 'MULTIPLE_CHOICE',
          points: 1,
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ]
        }
      ]
    })
    
    setCreateDialogOpen(true)
  }
  
  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false)
  }
  
  const handleOpenDeleteDialog = (quiz) => {
    setSelectedQuiz(quiz)
    setDeleteDialogOpen(true)
  }
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setSelectedQuiz(null)
  }
  
  const handleOpenStatsDialog = async (quiz) => {
    setSelectedQuiz(quiz)
    setStatsLoading(true)
    setStatsDialogOpen(true)
    
    try {
      const response = await quizApi.getQuizStatistics(quiz.id)
      setQuizStats(response.data)
    } catch (error) {
      console.error('Error fetching quiz statistics:', error)
      toast.error('Failed to load quiz statistics')
      
      // Sample data for demonstration
      setQuizStats({
        totalSubmissions: 24,
        averageScore: 72.5,
        highestScore: 98,
        passRate: 83.3,
        averageTimeSpent: 12.4
      })
    } finally {
      setStatsLoading(false)
    }
  }
  
  const handleCloseStatsDialog = () => {
    setStatsDialogOpen(false)
    setQuizStats(null)
  }
  
  const handleQuizChange = (e) => {
    const { name, value, checked, type } = e.target
    setNewQuiz({
      ...newQuiz,
      [name]: type === 'checkbox' ? checked : value
    })
  }
  
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newQuiz.questions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    }
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions
    })
  }
  
  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...newQuiz.questions]
    const updatedOptions = [...updatedQuestions[questionIndex].options]
    
    if (field === 'isCorrect' && updatedQuestions[questionIndex].type === 'MULTIPLE_CHOICE') {
      // For multiple choice, only one option can be correct
      updatedOptions.forEach((option, idx) => {
        option.isCorrect = idx === optionIndex
      })
    } else {
      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        [field]: value
      }
    }
    
    updatedQuestions[questionIndex].options = updatedOptions
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions
    })
  }
  
  const addQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [
        ...newQuiz.questions,
        {
          text: '',
          type: 'MULTIPLE_CHOICE',
          points: 1,
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ]
        }
      ]
    })
  }
  
  const removeQuestion = (index) => {
    if (newQuiz.questions.length <= 1) {
      toast.error('Quiz must have at least one question')
      return
    }
    
    const updatedQuestions = [...newQuiz.questions]
    updatedQuestions.splice(index, 1)
    
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions
    })
  }
  
  const addOption = (questionIndex) => {
    const updatedQuestions = [...newQuiz.questions]
    updatedQuestions[questionIndex].options.push({ text: '', isCorrect: false })
    
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions
    })
  }
  
  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...newQuiz.questions]
    if (updatedQuestions[questionIndex].options.length <= 2) {
      toast.error('Question must have at least two options')
      return
    }
    
    updatedQuestions[questionIndex].options.splice(optionIndex, 1)
    
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions
    })
  }
  
  const validateQuiz = () => {
    if (!newQuiz.title.trim()) {
      toast.error('Please enter a quiz title')
      return false
    }
    
    if (newQuiz.timeLimit <= 0) {
      toast.error('Time limit must be greater than 0')
      return false
    }
    
    for (let i = 0; i < newQuiz.questions.length; i++) {
      const question = newQuiz.questions[i]
      
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
  
  const handleCreateQuiz = async () => {
    if (!validateQuiz()) return
    
    try {
      const quizData = {
        ...newQuiz,
        courseId
      }
      
      const response = await quizApi.createQuiz(quizData)
      
      // Add the new quiz to the list
      setQuizzes([...quizzes, response.data])
      
      toast.success('Quiz created successfully')
      handleCloseCreateDialog()
    } catch (error) {
      console.error('Error creating quiz:', error)
      toast.error('Failed to create quiz')
      
      // For demo, add a mock quiz
      const mockQuiz = {
        ...newQuiz,
        id: Math.floor(Math.random() * 1000),
        courseId
      }
      setQuizzes([...quizzes, mockQuiz])
      handleCloseCreateDialog()
    }
  }
  
  const handleUpdateQuiz = async () => {
    if (!validateQuiz()) return
    
    try {
      await quizApi.updateQuiz(selectedQuiz.id, newQuiz)
      
      // Update the quiz in the list
      setQuizzes(quizzes.map(q => q.id === selectedQuiz.id ? { ...q, ...newQuiz } : q))
      
      toast.success('Quiz updated successfully')
      handleCloseCreateDialog()
    } catch (error) {
      console.error('Error updating quiz:', error)
      toast.error('Failed to update quiz')
      
      // For demo, update the quiz in the list
      setQuizzes(quizzes.map(q => q.id === selectedQuiz.id ? { ...q, ...newQuiz } : q))
      handleCloseCreateDialog()
    }
  }
  
  const handleDeleteQuiz = async () => {
    try {
      await quizApi.deleteQuiz(selectedQuiz.id)
      
      // Remove the quiz from the list
      setQuizzes(quizzes.filter(q => q.id !== selectedQuiz.id))
      
      toast.success('Quiz deleted successfully')
      handleCloseDeleteDialog()
    } catch (error) {
      console.error('Error deleting quiz:', error)
      toast.error('Failed to delete quiz')
      
      // For demo, remove the quiz from the list
      setQuizzes(quizzes.filter(q => q.id !== selectedQuiz.id))
      handleCloseDeleteDialog()
    }
  }
  
  const toggleQuizActive = async (quiz) => {
    try {
      const updatedQuiz = { ...quiz, active: !quiz.active }
      await quizApi.updateQuiz(quiz.id, updatedQuiz)
      
      // Update the quiz in the list
      setQuizzes(quizzes.map(q => q.id === quiz.id ? updatedQuiz : q))
      
      toast.success(`Quiz ${updatedQuiz.active ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      console.error('Error toggling quiz status:', error)
      toast.error('Failed to update quiz status')
      
      // For demo, update the quiz in the list
      setQuizzes(quizzes.map(q => q.id === quiz.id ? { ...q, active: !q.active } : q))
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
          {course ? `Quizzes: ${course.title}` : 'Quizzes'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Create Quiz
        </Button>
      </Box>
      
      {quizzesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : quizzes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <QuizIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Quizzes Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create quizzes to assess student knowledge.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Create Your First Quiz
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {quizzes.map((quiz) => (
            <Grid item xs={12} sm={6} lg={4} key={quiz.id}>
              <Card sx={{ 
                position: 'relative',
                opacity: quiz.active ? 1 : 0.7
              }}>
                {!quiz.active && (
                  <Box sx={{ 
                    position: 'absolute', 
                    right: 0, 
                    top: 0, 
                    zIndex: 1, 
                    m: 1 
                  }}>
                    <Chip label="Inactive" color="default" size="small" />
                  </Box>
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {quiz.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {quiz.description || 'No description provided'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HelpIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      {quiz.questions.length} Questions
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimeIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="body2">
                      Time Limit: {quiz.timeLimit} minutes
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleOpenEditDialog(quiz)}>
                    Edit
                  </Button>
                  <Button size="small" onClick={() => handleOpenStatsDialog(quiz)}>
                    Statistics
                  </Button>
                  <Button 
                    size="small" 
                    color={quiz.active ? "error" : "success"}
                    onClick={() => toggleQuizActive(quiz)}
                  >
                    {quiz.active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button size="small" color="error" onClick={() => handleOpenDeleteDialog(quiz)}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Create/Edit Quiz Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Quiz' : 'Create Quiz'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Quiz Title"
                name="title"
                value={newQuiz.title}
                onChange={handleQuizChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={newQuiz.description}
                onChange={handleQuizChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Time Limit (minutes)"
                name="timeLimit"
                type="number"
                value={newQuiz.timeLimit}
                onChange={handleQuizChange}
                fullWidth
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Passing Score (%)"
                name="passingScore"
                type="number"
                value={newQuiz.passingScore}
                onChange={handleQuizChange}
                fullWidth
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newQuiz.active}
                    onChange={handleQuizChange}
                    name="active"
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newQuiz.showResults}
                    onChange={handleQuizChange}
                    name="showResults"
                  />
                }
                label="Show Results After Submission"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newQuiz.shuffleQuestions}
                    onChange={handleQuizChange}
                    name="shuffleQuestions"
                  />
                }
                label="Shuffle Questions"
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
              
              {newQuiz.questions.map((question, questionIndex) => (
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
                      <Grid item xs={12} sm={6}>
                        <FormControl component="fieldset">
                          <FormLabel component="legend">Question Type</FormLabel>
                          <RadioGroup
                            row
                            value={question.type}
                            onChange={(e) => handleQuestionChange(questionIndex, 'type', e.target.value)}
                          >
                            <FormControlLabel value="MULTIPLE_CHOICE" control={<Radio />} label="Multiple Choice" />
                            <FormControlLabel value="MULTIPLE_ANSWER" control={<Radio />} label="Multiple Answer" />
                            <FormControlLabel value="TRUE_FALSE" control={<Radio />} label="True/False" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Points"
                          type="number"
                          value={question.points}
                          onChange={(e) => handleQuestionChange(questionIndex, 'points', parseInt(e.target.value))}
                          fullWidth
                          InputProps={{ inputProps: { min: 1 } }}
                        />
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
                            Options {question.type === 'MULTIPLE_ANSWER' ? '(select all correct answers)' : '(select one correct answer)'}
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
                              {question.type === 'MULTIPLE_ANSWER' ? (
                                <Checkbox
                                  checked={option.isCorrect}
                                  onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'isCorrect', e.target.checked)}
                                />
                              ) : (
                                <Radio
                                  checked={option.isCorrect}
                                  onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'isCorrect', e.target.checked)}
                                />
                              )}
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
            onClick={editMode ? handleUpdateQuiz : handleCreateQuiz} 
            variant="contained" 
            color="primary"
          >
            {editMode ? 'Update Quiz' : 'Create Quiz'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Quiz Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Quiz</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedQuiz?.title}"? This will also delete all student submissions and results. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteQuiz} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Quiz Statistics Dialog */}
      <Dialog open={statsDialogOpen} onClose={handleCloseStatsDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Quiz Statistics: {selectedQuiz?.title}
        </DialogTitle>
        <DialogContent>
          {statsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="h5" align="center">
                    {quizStats?.totalSubmissions || 0} Submissions
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary">
                      Average Score
                    </Typography>
                    <Typography variant="h5">
                      {quizStats?.averageScore || 0}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary">
                      Highest Score
                    </Typography>
                    <Typography variant="h5">
                      {quizStats?.highestScore || 0}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary">
                      Pass Rate
                    </Typography>
                    <Typography variant="h5">
                      {quizStats?.passRate || 0}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary">
                      Avg. Time Spent
                    </Typography>
                    <Typography variant="h5">
                      {quizStats?.averageTimeSpent || 0} min
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<StatisticsIcon />}
                  onClick={() => {
                    // Navigate to detailed statistics page
                    toast.info('Detailed statistics view not implemented yet')
                  }}
                >
                  View Detailed Statistics
                </Button>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatsDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default QuizManagement