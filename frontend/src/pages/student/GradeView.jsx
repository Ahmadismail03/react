import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Grid,
  Divider,
  LinearProgress,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  School as SchoolIcon,
  Grade as GradeIcon,
  CheckCircle as CompletedIcon,
  Schedule as InProgressIcon,
  Timeline as ProgressIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { enrollmentApi } from '../../services/api';
import { assessmentApi } from '../../services/api';

const GradeView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [assessmentResults, setAssessmentResults] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    averageGrade: 0,
    averageProgress: 0
  });
  
  useEffect(() => {
    const fetchGradeData = async () => {
      try {
        setLoading(true);
        
        // Fetch all user enrollments with progress
        const enrollmentsData = await enrollmentApi.getUserEnrollments(user.id);
        setEnrollments(enrollmentsData);
        
        // Fetch assessment results for all courses
        const resultsData = await assessmentApi.getUserAssessmentResults(user.id);
        setAssessmentResults(resultsData);
        
        // Calculate overall statistics
        const completedCourses = enrollmentsData.filter(enrollment => enrollment.progress === 100).length;
        const totalCourses = enrollmentsData.length;
        
        // Calculate average grade from assessment results
        let totalGrade = 0;
        let gradeCount = 0;
        
        resultsData.forEach(result => {
          if (result.score !== null) {
            totalGrade += result.score;
            gradeCount++;
          }
        });
        
        const averageGrade = gradeCount > 0 ? Math.round(totalGrade / gradeCount) : 0;
        
        // Calculate average progress across all courses
        const totalProgress = enrollmentsData.reduce((sum, enrollment) => sum + enrollment.progress, 0);
        const averageProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
        
        setOverallStats({
          totalCourses,
          completedCourses,
          averageGrade,
          averageProgress
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching grade data:', error);
        setLoading(false);
      }
    };
    
    fetchGradeData();
  }, [user.id]);
  
  const getGradeColor = (grade) => {
    if (grade >= 90) return 'success.main';
    if (grade >= 70) return 'info.main';
    if (grade >= 60) return 'warning.main';
    return 'error.main';
  };
  
  const getGradeLabel = (grade) => {
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>My Grades & Progress</Typography>
      
      {/* Overall Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h5">{overallStats.totalCourses}</Typography>
              <Typography variant="body2" color="text.secondary">Total Courses</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CompletedIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h5">{overallStats.completedCourses}</Typography>
              <Typography variant="body2" color="text.secondary">Completed Courses</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <GradeIcon sx={{ fontSize: 40, color: getGradeColor(overallStats.averageGrade), mb: 1 }} />
              <Typography variant="h5">
                {overallStats.averageGrade}% ({getGradeLabel(overallStats.averageGrade)})
              </Typography>
              <Typography variant="body2" color="text.secondary">Average Grade</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ProgressIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h5">{overallStats.averageProgress}%</Typography>
              <Typography variant="body2" color="text.secondary">Average Progress</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Course Progress and Grades */}
      <Typography variant="h5" gutterBottom>Course Progress</Typography>
      
      {enrollments.length > 0 ? (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Instructor</TableCell>
                <TableCell>Enrollment Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell>{enrollment.course.title}</TableCell>
                  <TableCell>{enrollment.course.instructor.name}</TableCell>
                  <TableCell>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {enrollment.progress === 100 ? (
                      <Chip 
                        icon={<CompletedIcon />} 
                        label="Completed" 
                        color="success" 
                        size="small" 
                      />
                    ) : (
                      <Chip 
                        icon={<InProgressIcon />} 
                        label="In Progress" 
                        color="primary" 
                        size="small" 
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={enrollment.progress} 
                          sx={{ height: 8, borderRadius: 5 }} 
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {`${enrollment.progress}%`}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => navigate(`/student/course/${enrollment.course.id}`)}
                    >
                      View Course
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center', mb: 4 }}>
          <Typography variant="body1" color="text.secondary">
            You are not enrolled in any courses yet.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/courses')}
          >
            Browse Courses
          </Button>
        </Paper>
      )}
      
      {/* Assessment Results */}
      <Typography variant="h5" gutterBottom>Assessment Results</Typography>
      
      {assessmentResults.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Assessment</TableCell>
                <TableCell>Completion Date</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assessmentResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{result.course.title}</TableCell>
                  <TableCell>{result.assessment.title}</TableCell>
                  <TableCell>{new Date(result.completionDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ color: getGradeColor(result.score), fontWeight: 'bold' }}
                    >
                      {result.score}% ({getGradeLabel(result.score)})
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {result.passed ? (
                      <Chip 
                        label="Passed" 
                        color="success" 
                        size="small" 
                      />
                    ) : (
                      <Chip 
                        label="Failed" 
                        color="error" 
                        size="small" 
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            You haven't completed any assessments yet.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default GradeView;