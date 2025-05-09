import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Paper,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  VideoLibrary as VideoIcon,
  Description as PdfIcon,
  Link as LinkIcon,
  Quiz as QuizIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as IncompleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { courseApi } from '../../services/api';
import { contentApi } from '../../services/api';
import { assessmentApi } from '../../services/api';
import { enrollmentApi } from '../../services/api';
import { moduleApi } from '../../services/api';

const CourseView = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentProgress, setContentProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  
  // Fetch course details, content, assessments, and progress
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        // Fetch course details
        const courseData = await courseApi.getCourseById(courseId);
        setCourse(courseData);
        
        try {
          // Fetch modules for this course
          const moduleResponse = await moduleApi.getModulesByCourse(courseId);
          const modulesData = moduleResponse.data || [];
          // Fetch all content for this course
          const contentResponse = await contentApi.getContentByCourse(courseId);
          const contentData = contentResponse.data || [];
          // Group content by moduleId
          const modulesWithContent = modulesData.map(module => ({
            ...module,
            content: contentData.filter(c => c.moduleId === module.moduleId)
          }));
          setModules(modulesWithContent);
        } catch (contentError) {
          console.error('Error fetching course content:', contentError);
          if (contentError.response && contentError.response.status === 403) {
            toast.error('You do not have permission to access this course content');
            setModules([]);
          } else {
            throw contentError;
          }
        }
        
        // Fetch assessments
        const assessmentData = await assessmentApi.getCourseAssessments(courseId);
        setAssessments(assessmentData);
        
        // Fetch user's progress for this course
        const progressData = await enrollmentApi.getEnrollmentProgress(courseId, user.id);
        const formattedProgress = {};
        progressData.completedContent.forEach(item => {
          formattedProgress[item.contentId] = true;
        });
        setContentProgress(formattedProgress);
        setOverallProgress(progressData.overallProgress);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course data:', error);
        setLoading(false);
        if (error.response && error.response.status === 403) {
          toast.error('You do not have permission to access this course');
        }
      }
    };
    
    fetchCourseData();
  }, [courseId, user.id]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedContent(null);
  };
  
  const handleContentSelect = async (content) => {
    try {
      // Try to fetch the specific content to verify access
      if (content.id) {
        await contentApi.getContent(content.id);
      }
      
      setSelectedContent(content);
      
      // If content hasn't been marked as completed yet, mark it
      if (!contentProgress[content.id]) {
        markContentAsCompleted(content.id);
      }
    } catch (error) {
      console.error('Error accessing content:', error);
      
      // Handle access denied errors
      if (error.response && error.response.status === 403) {
        toast.error('You do not have permission to access this content');
      } else {
        toast.error('Failed to load content. Please try again later.');
      }
    }
  };
  
  const markContentAsCompleted = async (contentId) => {
    try {
      await enrollmentApi.markContentAsCompleted(courseId, contentId);
      
      // Update local state
      setContentProgress(prev => ({
        ...prev,
        [contentId]: true
      }));
      
      // Recalculate overall progress
      const totalContentItems = modules.reduce((total, module) => total + module.content.length, 0);
      const completedItems = Object.values(contentProgress).filter(Boolean).length + 1;
      const newProgress = Math.round((completedItems / totalContentItems) * 100);
      
      setOverallProgress(newProgress);
    } catch (error) {
      console.error('Error marking content as completed:', error);
    }
  };
  
  const handleStartQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
    setQuizDialogOpen(true);
  };
  
  const handleQuizAnswerChange = (questionId, answerId) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };
  
  const handleSubmitQuiz = async () => {
    try {
      // Format answers for submission
      const formattedAnswers = Object.keys(quizAnswers).map(questionId => ({
        questionId,
        answerId: quizAnswers[questionId]
      }));
      
      // Submit quiz answers
      const result = await assessmentApi.submitAssessment(currentQuiz.id, formattedAnswers);
      
      setQuizResult(result);
      setQuizSubmitted(true);
      
      // If passed, mark the assessment as completed
      if (result.passed) {
        await enrollmentApi.markAssessmentAsCompleted(courseId, currentQuiz.id);
        
        // Update progress
        const updatedProgress = await enrollmentApi.getEnrollmentProgress(courseId, user.id);
        setOverallProgress(updatedProgress.overallProgress);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };
  
  const handleCloseQuiz = () => {
    setQuizDialogOpen(false);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!course) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Course not found or you don't have access to this course.</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/student')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>{course.title}</Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>{course.instructor.name}</Typography>
        <Typography variant="body1" paragraph>{course.description}</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>Progress:</Typography>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress variant="determinate" value={overallProgress} sx={{ height: 10, borderRadius: 5 }} />
          </Box>
          <Typography variant="body2">{`${overallProgress}%`}</Typography>
        </Box>
      </Paper>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Content" />
            <Tab label="Assessments" />
          </Tabs>
        </Box>
        
        {/* Content Tab */}
        <Box role="tabpanel" hidden={activeTab !== 0} sx={{ mt: 2 }}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Modules</Typography>
                  <List>
                    {modules.map((module) => (
                      <React.Fragment key={module.moduleId}>
                        <ListItem>
                          <ListItemText 
                            primary={module.title} 
                            secondary={`${module.content.length} items`} 
                          />
                        </ListItem>
                        <List component="div" disablePadding>
                          {module.content.map((content) => (
                            <ListItem 
                              button 
                              key={content.contentId} 
                              onClick={() => handleContentSelect(content)}
                              selected={selectedContent && selectedContent.contentId === content.contentId}
                              sx={{ pl: 4 }}
                            >
                              <ListItemIcon>
                                {content.type === 'VIDEO' && <VideoIcon />}
                                {content.type === 'PDF' && <PdfIcon />}
                                {content.type === 'LINK' && <LinkIcon />}
                                {content.type === 'QUIZ' && <QuizIcon />}
                              </ListItemIcon>
                              <ListItemText primary={content.title} />
                              <ListItemIcon>
                                {contentProgress[content.contentId] ? 
                                  <CompletedIcon color="success" /> : 
                                  <IncompleteIcon />}
                              </ListItemIcon>
                            </ListItem>
                          ))}
                        </List>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Paper elevation={2} sx={{ p: 2, minHeight: '500px' }}>
                  {selectedContent ? (
                    <Box>
                      <Typography variant="h6" gutterBottom>{selectedContent.title}</Typography>
                      
                      {selectedContent.type === 'VIDEO' && (
                        <Box sx={{ mt: 2 }}>
                          <video 
                            controls 
                            width="100%" 
                            src={selectedContent.url} 
                            poster={selectedContent.thumbnailUrl || '/video-placeholder.jpg'}
                          />
                          <Typography variant="body1" sx={{ mt: 2 }}>{selectedContent.description}</Typography>
                        </Box>
                      )}
                      
                      {selectedContent.type === 'PDF' && (
                        <Box sx={{ mt: 2 }}>
                          <iframe 
                            src={selectedContent.url} 
                            width="100%" 
                            height="500px" 
                            title={selectedContent.title}
                          />
                        </Box>
                      )}
                      
                      {selectedContent.type === 'LINK' && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body1" paragraph>{selectedContent.description}</Typography>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<LinkIcon />}
                            href={selectedContent.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open Resource
                          </Button>
                        </Box>
                      )}
                      
                      {selectedContent.type === 'QUIZ' && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body1" paragraph>{selectedContent.description}</Typography>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<QuizIcon />}
                            onClick={() => handleStartQuiz(selectedContent)}
                          >
                            Start Quiz
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                      <Typography variant="h6" color="text.secondary">
                        Select a content item from the list to view
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
        
        {/* Assessments Tab */}
        <Box role="tabpanel" hidden={activeTab !== 1} sx={{ mt: 2 }}>
          {activeTab === 1 && (
            <Grid container spacing={3}>
              {assessments.length > 0 ? (
                assessments.map((assessment) => (
                  <Grid item xs={12} sm={6} md={4} key={assessment.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={assessment.imageUrl || '/quiz-placeholder.jpg'}
                        alt={assessment.title}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h5" component="div">
                          {assessment.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {assessment.description}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={`${assessment.questions.length} Questions`} 
                            size="small" 
                            sx={{ mr: 1, mb: 1 }} 
                          />
                          <Chip 
                            label={`${assessment.timeLimit} Minutes`} 
                            size="small" 
                            sx={{ mr: 1, mb: 1 }} 
                          />
                          <Chip 
                            label={`Passing: ${assessment.passingScore}%`} 
                            size="small" 
                            sx={{ mb: 1 }} 
                          />
                        </Box>
                      </CardContent>
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Button 
                          variant="contained" 
                          fullWidth
                          startIcon={<PlayIcon />}
                          onClick={() => handleStartQuiz(assessment)}
                        >
                          Start Assessment
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      No assessments available for this course yet.
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      </Box>
      
      {/* Quiz Dialog */}
      <Dialog 
        open={quizDialogOpen} 
        onClose={quizSubmitted ? handleCloseQuiz : undefined}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentQuiz?.title}
          {!quizSubmitted && (
            <Typography variant="subtitle2" color="text.secondary">
              Complete all questions and submit to continue
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {quizSubmitted && quizResult ? (
            <Box>
              <Alert 
                severity={quizResult.passed ? "success" : "error"}
                sx={{ mb: 2 }}
              >
                {quizResult.passed 
                  ? `Congratulations! You passed with a score of ${quizResult.score}%` 
                  : `You did not pass. Your score: ${quizResult.score}%. Required: ${currentQuiz.passingScore}%`}
              </Alert>
              
              <Typography variant="h6" gutterBottom>Results:</Typography>
              
              {quizResult.questions.map((question, index) => (
                <Box key={question.id} sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="subtitle1">
                    {index + 1}. {question.text}
                  </Typography>
                  
                  <List>
                    {question.answers.map(answer => (
                      <ListItem key={answer.id}>
                        <ListItemIcon>
                          {answer.correct && <CompletedIcon color="success" />}
                          {!answer.correct && answer.id === quizAnswers[question.id] && <IncompleteIcon color="error" />}
                          {!answer.correct && answer.id !== quizAnswers[question.id] && <IncompleteIcon color="disabled" />}
                        </ListItemIcon>
                        <ListItemText 
                          primary={answer.text} 
                          sx={{
                            color: answer.correct ? 'success.main' : 
                                  (answer.id === quizAnswers[question.id] && !answer.correct) ? 'error.main' : 'inherit'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </Box>
          ) : currentQuiz ? (
            <Box>
              {currentQuiz.questions.map((question, index) => (
                <Box key={question.id} sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {index + 1}. {question.text}
                  </Typography>
                  
                  <List>
                    {question.answers.map(answer => (
                      <ListItem 
                        button 
                        key={answer.id}
                        onClick={() => handleQuizAnswerChange(question.id, answer.id)}
                        selected={quizAnswers[question.id] === answer.id}
                        sx={{ 
                          borderRadius: 1,
                          mb: 1,
                          border: '1px solid',
                          borderColor: quizAnswers[question.id] === answer.id ? 'primary.main' : 'divider'
                        }}
                      >
                        <ListItemText primary={answer.text} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          {quizSubmitted ? (
            <Button onClick={handleCloseQuiz} variant="contained">
              Close
            </Button>
          ) : (
            <>
              <Button onClick={handleCloseQuiz} color="inherit">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitQuiz} 
                variant="contained"
                disabled={Object.keys(quizAnswers).length !== currentQuiz?.questions.length}
              >
                Submit Answers
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseView;