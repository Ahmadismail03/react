// src/pages/instructor/QuizManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
  ExpandMore as ExpandMoreIcon,
  Assessment as AssessmentIcon,
  CheckCircleOutline as CorrectIcon,
  School as GradeIcon,
  Timer as TimerIcon,
  QuestionAnswer as QuestionIcon,
  Assignment as AssignmentIcon,
  ShowChart as StatisticsIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { courseApi, quizApi } from '../../services/api';

const QuizManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';
  
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openStatisticsDialog, setOpenStatisticsDialog] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [quizStatistics, setQuizStatistics] = useState(null);
  
  // New quiz state
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    isActive: true,
    totalPoints: 100,
    showCorrectAnswers: true,
    questions: [
      {
        text: '',
        points: 10,
        type: 'MULTIPLE_CHOICE',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      },
    ],
  });
  
  useEffect(() => {
    if (!isInstructor) {
      navigate('/');
      toast.error('Access denied. Instructor permissions required.');
      return;
    }
    
    fetchCourseData();
  }, [courseId, isInstructor, navigate]);
  
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await courseApi.getCourseById(courseId);
      setCourse(courseResponse.data);
      
      // Fetch all quizzes for this course
      const quizzesResponse = await quizApi.getAllQuizzes();
      // Filter quizzes by course ID
      const courseQuizzes = quizzesResponse.data.filter(
        quiz => quiz.courseId === Number(courseId)
      );
      setQuizzes(courseQuizzes);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course data');
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1 && selectedQuiz) {
      fetchQuizResults(selectedQuiz.id);
    }
  };
  
  const fetchQuizResults = async (quizId) => {
    try {
      // This would be the endpoint to get quiz results
      const response = await quizApi.getQuizSubmissions(quizId);
      setQuizResults(response.data);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      toast.error('Failed to load quiz results');
    }
  };
  
  const fetchQuizStatistics = async (quizId) => {
    try {
      const response = await quizApi.getQuizStatistics(quizId);
      setQuizStatistics(response.data);
      setOpenStatisticsDialog(true);
    } catch (error) {
      console.error('Error fetching quiz statistics:', error);
      toast.error('Failed to load quiz statistics');
    }
  };
  
  const handleCreateQuiz = () => {
    setNewQuiz({
      title: '',
      description: '',
      timeLimit: 30,
      isActive: true,
      totalPoints: 100,
      showCorrectAnswers: true,
      questions: [
        {
          text: '',
          points: 10,
          type: 'MULTIPLE_CHOICE',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ],
        },
      ],
    });
    setOpenCreateDialog(true);
  };
  
  const handleEditQuiz = (quiz) => {
    // Format the quiz data for editing
    setSelectedQuiz(quiz);
    setNewQuiz({
      ...quiz,
      questions: quiz.questions || [],
    });
    setOpenEditDialog(true);
  };
  
  const handleDeleteQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setOpenDeleteDialog(true);
  };
  
  const handleViewStatistics = (quiz) => {
    setSelectedQuiz(quiz);
    fetchQuizStatistics(quiz.id);
  };
  
  const handleQuizChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'isActive' || name === 'showCorrectAnswers') {
      setNewQuiz({
        ...newQuiz,
        [name]: checked,
      });
    } else {
      setNewQuiz({
        ...newQuiz,
        [name]: value,
      });
    }
  };
  
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions,
    });
  };
  
  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...newQuiz.questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    
    if (field === 'isCorrect' && updatedQuestions[questionIndex].type === 'MULTIPLE_CHOICE') {
      // For multiple choice, only one option can be correct
      updatedOptions.forEach((option, idx) => {
        option.isCorrect = idx === optionIndex;
      });
    } else {
      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        [field]: value,
      };
    }
    
    updatedQuestions[questionIndex].options = updatedOptions;
    
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions,
    });
  };
  
  const addQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [
        ...newQuiz.questions,
        {
          text: '',
          points: 10,
          type: 'MULTIPLE_CHOICE',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ],
        },
      ],
    });
  };
  
  const removeQuestion = (index) => {
    if (newQuiz.questions.length <= 1) {
      toast.error('Quiz must have at least one question');
      return;
    }
    
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions.splice(index, 1);
    
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions,
    });
  };
  
  const addOption = (questionIndex) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[questionIndex].options.push({ text: '', isCorrect: false });
    
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions,
    });
  };
  
  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...newQuiz.questions];
    if (updatedQuestions[questionIndex].options.length <= 2) {
      toast.error('Question must have at least two options');
      return;
    }
    
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions,
    });
  };
  
  const validateQuiz = () => {
    if (!newQuiz.title.trim()) {
      toast.error('Quiz title is required');
      return false;
    }
    
    if (newQuiz.timeLimit < 0) {
      toast.error('Time limit cannot be negative');
      return false;
    }
    
    if (newQuiz.totalPoints <= 0) {
      toast.error('Total points must be greater than 0');
      return false;
    }
    
    for (let i = 0; i < newQuiz.questions.length; i++) {
      const question = newQuiz.questions[i];
      
      if (!question.text.trim()) {
        toast.error(`Question ${i + 1} is missing text`);
        return false;
      }
      
      if (question.points <= 0) {
        toast.error(`Question ${i + 1} must have points greater than 0`);
        return false;
      }
      
      let hasCorrectOption = false;
      
      for (let j = 0; j < question.options.length; j++) {
        const option = question.options[j];
        
        if (!option.text.trim()) {
          toast.error(`Option ${j + 1} in Question ${i + 1} is missing text`);
          return false;
        }
        
        if (option.isCorrect) {
          hasCorrectOption = true;
        }
      }
      
      if (!hasCorrectOption) {
        toast.error(`Question ${i + 1} does not have a correct answer marked`);
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmitNewQuiz = async () => {
    if (!validateQuiz()) return;
    
    try {
      // Prepare quiz data
      const quizData = {
        ...newQuiz,
        courseId: Number(courseId),
      };
      
      // Create new quiz
      const response = await quizApi.createQuiz(quizData);
      
      // Update quizzes list with the new quiz
      setQuizzes([...quizzes, response.data]);
      
      toast.success('Quiz created successfully');
      setOpenCreateDialog(false);
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz');
    }
  };
  
  const handleUpdateQuiz = async () => {
    if (!validateQuiz()) return;
    
    try {
      // Prepare quiz data
      const quizData = {
        ...newQuiz,
        courseId: Number(courseId),
      };
      
      // Update quiz
      await quizApi.updateQuiz(selectedQuiz.id, quizData);
      
      // Update quizzes list with the updated quiz
      setQuizzes(quizzes.map(q => q.id === selectedQuiz.id ? { ...q, ...quizData } : q));
      
      toast.success('Quiz updated successfully');
      setOpenEditDialog(false);
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast.error('Failed to update quiz');
    }
  };
  
  const handleConfirmDelete = async () => {
    try {
      // Delete quiz
      await quizApi.deleteQuiz(selectedQuiz.id);
      
      // Update quizzes list
      setQuizzes(quizzes.filter(q => q.id !== selectedQuiz.id));
      
      toast.success('Quiz deleted successfully');
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  };
  
  const handleToggleActive = async (quiz) => {
    try {
      const updatedQuiz = { ...quiz, isActive: !quiz.isActive };
      await quizApi.updateQuiz(quiz.id, updatedQuiz);
      
      // Update quizzes list
      setQuizzes(quizzes.map(q => q.id === quiz.id ? updatedQuiz : q));
      
      toast.success(`Quiz ${updatedQuiz.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast.error('Failed to update quiz');
    }
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
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {course?.title ? `${course.title}: Quizzes & Assessments` : 'Quizzes & Assessments'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create and manage quizzes, tests, and assessments for your course
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateQuiz}
          >
            Create Quiz
          </Button>
        </Box>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab icon={<QuizIcon />} iconPosition="start" label="Quizzes" />
          {selectedQuiz && (
            <Tab icon={<AssessmentIcon />} iconPosition="start" label="Submissions" />
          )}
        </Tabs>
        
        {activeTab === 0 ? (
          quizzes.length === 0 ? (
            <Card sx={{ textAlign: 'center', p: 3 }}>
              <CardContent>
                <QuizIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Quizzes Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Start assessing student learning by creating quizzes.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateQuiz}
                >
                  Create Your First Quiz
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {quizzes.map((quiz) => (
                <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6">
                          {quiz.title}
                        </Typography>
                        <Chip 
                          label={quiz.isActive ? 'Active' : 'Inactive'} 
                          color={quiz.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {quiz.description || 'No description provided.'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <QuestionIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2">
                          {quiz.questions?.length || 0} Questions
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TimerIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
                        <Typography variant="body2">
                          {quiz.timeLimit} minutes
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GradeIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
                        <Typography variant="body2">
                          {quiz.totalPoints} Points
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <IconButton onClick={() => handleEditQuiz(quiz)} color="primary" size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleToggleActive(quiz)} size="small">
                        {quiz.isActive ? <CorrectIcon color="success" /> : <CorrectIcon color="disabled" />}
                      </IconButton>
                      <IconButton onClick={() => handleViewStatistics(quiz)} color="info" size="small">
                        <StatisticsIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteQuiz(quiz)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )
        ) : (
          // Quiz Submissions Tab
          <Box>
            {quizResults.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
                No submissions yet for this quiz.
              </Typography>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Submissions for: {selectedQuiz?.title}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Submission Date</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Time Spent</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {quizResults.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell>{result.studentName}</TableCell>
                          <TableCell>{new Date(result.submissionDate).toLocaleString()}</TableCell>
                          <TableCell>{result.score} / {selectedQuiz?.totalPoints}</TableCell>
                          <TableCell>{Math.floor(result.timeSpent / 60)} minutes</TableCell>
                          <TableCell>
                            <Chip 
                              label={result.passed ? 'Passed' : 'Failed'} 
                              color={result.passed ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}
      </Paper>
      
      {/* Create/Edit Quiz Dialog */}
      <Dialog 
        open={openCreateDialog || openEditDialog} 
        onClose={() => openCreateDialog ? setOpenCreateDialog(false) : setOpenEditDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>{openCreateDialog ? 'Create New Quiz' : 'Edit Quiz'}</DialogTitle>
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
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Total Points"
                name="totalPoints"
                type="number"
                value={newQuiz.totalPoints}
                onChange={handleQuizChange}
                fullWidth
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newQuiz.isActive}
                    onChange={handleQuizChange}
                    name="isActive"
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newQuiz.showCorrectAnswers}
                    onChange={handleQuizChange}
                    name="showCorrectAnswers"
                  />
                }
                label="Show Correct Answers After Submission"
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
                        <TextField
                          label="Points"
                          type="number"
                          value={question.points}
                          onChange={(e) => handleQuestionChange(questionIndex, 'points', parseInt(e.target.value) || 0)}
                          fullWidth
                          InputProps={{ inputProps: { min: 1 } }}
                        />
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
                              value={question.options?.findIndex(opt => opt.isCorrect) === 0 ? 'true' : 'false'}
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
                          {question.options?.map((option, optionIndex) => (
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
          <Button onClick={() => openCreateDialog ? setOpenCreateDialog(false) : setOpenEditDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={openCreateDialog ? handleSubmitNewQuiz : handleUpdateQuiz} 
            variant="contained" 
            color="primary"
          >
            {openCreateDialog ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Quiz Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Quiz</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedQuiz?.title}"?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. All student submissions for this quiz will also be deleted.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Quiz Statistics Dialog */}
      <Dialog 
        open={openStatisticsDialog} 
        onClose={() => setOpenStatisticsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Quiz Statistics: {selectedQuiz?.title}</DialogTitle>
        <DialogContent>
          {quizStatistics ? (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Average Score
                  </Typography>
                  <Typography variant="h3" color="primary.main">
                    {quizStatistics.averageScore}%
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Highest Score
                  </Typography>
                  <Typography variant="h3" color="success.main">
                    {quizStatistics.highestScore}%
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Pass Rate
                  </Typography>
                  <Typography variant="h3" color="info.main">
                    {quizStatistics.passRate}%
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Question Analysis
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Question</TableCell>
                        <TableCell align="right">Correct Answers</TableCell>
                        <TableCell align="right">% Correct</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {quizStatistics.questionStats?.map((stat, index) => (
                        <TableRow key={index}>
                          <TableCell component="th" scope="row">
                            {stat.questionText}
                          </TableCell>
                          <TableCell align="right">
                            {stat.correctAnswers} / {stat.totalAnswers}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={stat.percentCorrect} 
                                  color={
                                    stat.percentCorrect > 70 ? "success" : 
                                    stat.percentCorrect > 40 ? "warning" : "error"
                                  }
                                />
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {stat.percentCorrect}%
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatisticsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizManagement;