// frontend/src/pages/instructor/EnrollmentManagement.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  School as SchoolIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { enrollmentApi, courseApi, userApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const EnrollmentManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [openEnrollDialog, setOpenEnrollDialog] = useState(false);
  const [openUnenrollDialog, setOpenUnenrollDialog] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Only admin and instructor can access this page
    if (user && user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      toast.error('Access denied. Instructor or Admin permissions required.');
      navigate('/');
      return;
    }
    
    fetchCourseDetails();
    fetchEnrollments();
    fetchAvailableStudents();
  }, [courseId, user, navigate]);
  
  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching course details for ID:', courseId);
      const response = await courseApi.getCourseById(courseId);
      console.log('Course details:', response.data);
      setCourse(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
      setLoading(false);
    }
  };
  
  const fetchEnrollments = async () => {
    try {
      setEnrollmentsLoading(true);
      console.log('Fetching enrollments for course ID:', courseId);
      
      // Use the correct API endpoint for fetching course enrollments
      const response = await axios.get(`/api/enrollments/course/${courseId}`);
      
      console.log('Enrollments fetched:', response.data);
      setEnrollments(response.data || []);
      setEnrollmentsLoading(false);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setEnrollments([]);
      setEnrollmentsLoading(false);
    }
  };
  
  const fetchAvailableStudents = async () => {
    try {
      setStudentsLoading(true);
      
      // Fetch all users with STUDENT role
      console.log('Fetching available students');
      const response = await userApi.getAllUsers();
      
      // Filter to only include users with STUDENT role
      const students = response.data.filter(user => user.role === 'STUDENT');
      console.log('Available students:', students);
      
      setAvailableStudents(students || []);
      setStudentsLoading(false);
    } catch (error) {
      console.error('Error fetching available students:', error);
      setAvailableStudents([]);
      setStudentsLoading(false);
    }
  };
  
  const handleOpenEnrollDialog = () => {
    setOpenEnrollDialog(true);
  };
  
  const handleCloseEnrollDialog = () => {
    setOpenEnrollDialog(false);
    setSelectedStudentId('');
  };
  
  const handleOpenUnenrollDialog = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setOpenUnenrollDialog(true);
  };
  
  const handleCloseUnenrollDialog = () => {
    setOpenUnenrollDialog(false);
    setSelectedEnrollment(null);
  };
  
  const handleEnrollStudent = async () => {
    if (!selectedStudentId) {
      toast.error('Please select a student to enroll');
      return;
    }
    
    try {
      setEnrolling(true);
      setErrorMessage('');
      
      // Prepare enrollment data
      const enrollmentData = {
        studentId: selectedStudentId,
        courseId: courseId
      };
      
      console.log('Enrolling student with data:', enrollmentData);
      
      // Call the API to enroll the student
      await enrollmentApi.enrollStudent(enrollmentData);
      
      toast.success('Student enrolled successfully');
      handleCloseEnrollDialog();
      
      // Refresh enrollments list
      fetchEnrollments();
    } catch (error) {
      console.error('Error enrolling student:', error);
      
      // Get a meaningful error message
      let message = 'Failed to enroll student';
      if (error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      }
      
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setEnrolling(false);
    }
  };
  
  const handleUnenrollStudent = async () => {
    if (!selectedEnrollment) {
      toast.error('No enrollment selected');
      return;
    }
    
    try {
      setUnenrolling(true);
      setErrorMessage('');
      
      console.log('Unenrolling student:', selectedEnrollment.studentId, 'from course:', courseId);
      
      // Call the API to unenroll the student
      await enrollmentApi.unenrollStudent(courseId, selectedEnrollment.studentId);
      
      toast.success('Student unenrolled successfully');
      handleCloseUnenrollDialog();
      
      // Refresh enrollments list
      fetchEnrollments();
    } catch (error) {
      console.error('Error unenrolling student:', error);
      
      // Get a meaningful error message
      let message = 'Failed to unenroll student';
      if (error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      }
      
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setUnenrolling(false);
    }
  };
  
  // Filter students that are not already enrolled
  const getFilteredStudents = () => {
    if (!availableStudents.length || !enrollments.length) return availableStudents;
    
    // Get IDs of already enrolled students
    const enrolledStudentIds = enrollments.map(enrollment => 
      String(enrollment.studentId)
    );
    
    // Filter out already enrolled students
    return availableStudents.filter(student => 
      !enrolledStudentIds.includes(String(student.id)) && 
      !enrolledStudentIds.includes(String(student.userId))
    );
  };
  
  // Filter students by search term
  const getSearchFilteredStudents = () => {
    if (!searchTerm) return getFilteredStudents();
    
    return getFilteredStudents().filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  // Handle errors 
  const handleCloseError = () => {
    setErrorMessage('');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  const isAdmin = user?.role === 'ADMIN';
  
  return (
    <Box sx={{ p: 3 }}>
      <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" component="h1" gutterBottom>
              {course ? `Enrollments: ${course.title || course.name}` : 'Course Enrollments'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage student enrollments for this course
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenEnrollDialog}
          >
            Enroll Student
          </Button>
        </Box>
        
        {enrollmentsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : enrollments.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Students Enrolled
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              This course doesn't have any enrolled students yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenEnrollDialog}
            >
              Enroll Your First Student
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Enrollment Date</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment.enrollmentId}>
                    <TableCell>{enrollment.studentName}</TableCell>
                    <TableCell>{enrollment.studentEmail}</TableCell>
                    <TableCell>
                      {enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={enrollment.progress || 0} 
                            color={
                              enrollment.progress >= 75 ? "success" : 
                              enrollment.progress >= 50 ? "info" : 
                              enrollment.progress >= 25 ? "warning" : "error"
                            }
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(enrollment.progress || 0)}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={enrollment.completionStatus ? 'Completed' : 'In Progress'} 
                        color={enrollment.completionStatus ? 'success' : 'info'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleOpenUnenrollDialog(enrollment)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Enroll Student Dialog */}
      <Dialog open={openEnrollDialog} onClose={handleCloseEnrollDialog}>
        <DialogTitle>Enroll Student</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 400, mt: 2 }}>
            <TextField
              label="Search Students"
              fullWidth
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            {studentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <FormControl fullWidth>
                <InputLabel>Select Student</InputLabel>
                <Select
                  value={selectedStudentId}
                  label="Select Student"
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Select a student</em>
                  </MenuItem>
                  {getSearchFilteredStudents().map((student) => (
                    <MenuItem key={student.id || student.userId} value={student.id || student.userId}>
                      {student.name} ({student.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            {getSearchFilteredStudents().length === 0 && !studentsLoading && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {searchTerm 
                  ? 'No matching students found. Try a different search term.' 
                  : 'All students are already enrolled in this course.'}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEnrollDialog} disabled={enrolling}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleEnrollStudent}
            disabled={!selectedStudentId || enrolling}
            startIcon={enrolling ? <CircularProgress size={20} /> : <PersonAddIcon />}
          >
            {enrolling ? 'Enrolling...' : 'Enroll'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Unenroll Student Dialog */}
      <Dialog open={openUnenrollDialog} onClose={handleCloseUnenrollDialog}>
        <DialogTitle>Unenroll Student</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>
            Are you sure you want to unenroll <strong>{selectedEnrollment?.studentName}</strong> from this course?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This will remove the student's access to the course and delete their progress data. This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUnenrollDialog} disabled={unenrolling}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleUnenrollStudent}
            disabled={unenrolling}
            startIcon={unenrolling ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {unenrolling ? 'Unenrolling...' : 'Unenroll'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnrollmentManagement;