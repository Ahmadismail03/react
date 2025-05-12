// src/pages/admin/EnrollmentManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
  Grid,
  Autocomplete,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  BarChart as ChartIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { enrollmentApi, courseApi, userApi } from '../../services/api';

const EnrollmentManagement = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isInstructor = user?.role === 'INSTRUCTOR';
  
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [course, setCourse] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [unenrollDialogOpen, setUnenrollDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (!isAdmin && !isInstructor) {
      navigate('/');
      toast.error('Access denied. Admin or instructor permissions required.');
      return;
    }
    
    if (courseId) {
      fetchCourseData();
      fetchEnrollments();
    } else {
      navigate('/admin/courses');
      toast.error('Course ID is required.');
    }
  }, [courseId, isAdmin, isInstructor, navigate]);
  
  const fetchCourseData = async () => {
    try {
      const response = await courseApi.getCourseById(courseId);
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course data');
    }
  };
  
  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await enrollmentApi.getCourseEnrollments(courseId);
      setEnrollments(response.data);
      setFilteredEnrollments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to load enrollment data');
      setLoading(false);
    }
  };
  
  const fetchAvailableStudents = async () => {
    try {
      // Get all users with STUDENT role
      const response = await userApi.getAllUsers();
      const students = response.data.filter(user => user.role === 'STUDENT');
      
      // Filter out already enrolled students
      const enrolledStudentIds = enrollments.map(enrollment => enrollment.studentId);
      const availableStudents = students.filter(student => !enrolledStudentIds.includes(student.userId));
      
      setAvailableStudents(availableStudents);
    } catch (error) {
      console.error('Error fetching available students:', error);
      toast.error('Failed to load available students');
    }
  };
  
  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    
    if (value) {
      const filtered = enrollments.filter(
        enrollment => 
          enrollment.student.name.toLowerCase().includes(value) || 
          enrollment.student.email.toLowerCase().includes(value)
      );
      setFilteredEnrollments(filtered);
    } else {
      setFilteredEnrollments(enrollments);
    }
    
    setPage(0);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleOpenEnrollDialog = () => {
    fetchAvailableStudents();
    setSelectedStudent(null);
    setEnrollDialogOpen(true);
  };
  
  const handleCloseEnrollDialog = () => {
    setEnrollDialogOpen(false);
  };
  
  const handleOpenUnenrollDialog = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setUnenrollDialogOpen(true);
  };
  
  const handleCloseUnenrollDialog = () => {
    setUnenrollDialogOpen(false);
    setSelectedEnrollment(null);
  };
  
  const handleOpenProgressDialog = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setProgress(enrollment.progress);
    setProgressDialogOpen(true);
  };
  
  const handleCloseProgressDialog = () => {
    setProgressDialogOpen(false);
    setSelectedEnrollment(null);
  };
  
  const handleProgressChange = (event) => {
    setProgress(parseInt(event.target.value, 10));
  };
  
  const handleEnrollStudent = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student to enroll');
      return;
    }
    
    try {
      // Enroll student in course
      const enrollmentData = {
        courseId: Number(courseId),
        studentId: selectedStudent.userId
      };
      
      const response = await enrollmentApi.enrollStudent(enrollmentData);
      
      // Add new enrollment to the list
      const newEnrollment = {
        ...response.data,
        student: selectedStudent
      };
      
      setEnrollments([...enrollments, newEnrollment]);
      setFilteredEnrollments([...filteredEnrollments, newEnrollment]);
      
      toast.success(`${selectedStudent.name} has been enrolled successfully`);
      handleCloseEnrollDialog();
    } catch (error) {
      console.error('Error enrolling student:', error);
      toast.error('Failed to enroll student');
    }
  };
  
  const handleUnenrollStudent = async () => {
    try {
      await enrollmentApi.unenrollStudent(courseId, selectedEnrollment.studentId);
      
      // Remove enrollment from the list
      const updatedEnrollments = enrollments.filter(
        e => e.id !== selectedEnrollment.id
      );
      setEnrollments(updatedEnrollments);
      setFilteredEnrollments(
        filteredEnrollments.filter(e => e.id !== selectedEnrollment.id)
      );
      
      toast.success(`Student has been unenrolled successfully`);
      handleCloseUnenrollDialog();
    } catch (error) {
      console.error('Error unenrolling student:', error);
      toast.error('Failed to unenroll student');
    }
  };
  
  const handleUpdateProgress = async () => {
    try {
      await enrollmentApi.updateProgress(selectedEnrollment.id, { progress });
      
      // Update enrollment in the list
      const updatedEnrollments = enrollments.map(e => 
        e.id === selectedEnrollment.id ? { ...e, progress } : e
      );
      setEnrollments(updatedEnrollments);
      setFilteredEnrollments(
        filteredEnrollments.map(e => 
          e.id === selectedEnrollment.id ? { ...e, progress } : e
        )
      );
      
      toast.success('Progress updated successfully');
      handleCloseProgressDialog();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
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
              {course?.title ? `${course.title}: Enrollments` : 'Course Enrollments'}
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
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5">{enrollments.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Enrollments</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5">
                    {enrollments.filter(e => e.progress === 100).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Completed</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5">
                    {enrollments.length > 0 
                      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length) 
                      : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Average Progress</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by student name or email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            value={searchTerm}
            onChange={handleSearch}
          />
        </Box>
        
        {filteredEnrollments.length === 0 ? (
          <Alert severity="info">
            No enrollments found. {searchTerm ? 'Try a different search term.' : 'Enroll students in this course.'}
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Enrollment Date</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEnrollments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>{enrollment.student.name}</TableCell>
                      <TableCell>{enrollment.student.email}</TableCell>
                      <TableCell>
                        {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={enrollment.progress} 
                              sx={{ height: 8, borderRadius: 5 }}
                              color={
                                enrollment.progress === 100 ? 'success' : 
                                enrollment.progress > 50 ? 'info' : 'primary'
                              }
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">
                              {enrollment.progress}%
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={enrollment.progress === 100 ? 'Completed' : 'In Progress'} 
                          color={enrollment.progress === 100 ? 'success' : 'primary'} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Update Progress">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleOpenProgressDialog(enrollment)}
                          >
                            <ChartIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Unenroll">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleOpenUnenrollDialog(enrollment)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredEnrollments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}
      </Paper>
      
      {/* Enroll Student Dialog */}
      <Dialog open={enrollDialogOpen} onClose={handleCloseEnrollDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Enroll Student</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              options={availableStudents}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={selectedStudent}
              onChange={(event, newValue) => {
                setSelectedStudent(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Student"
                  placeholder="Search for a student..."
                  fullWidth
                />
              )}
            />
            
            {availableStudents.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No available students found to enroll in this course.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEnrollDialog}>Cancel</Button>
          <Button 
            onClick={handleEnrollStudent} 
            variant="contained" 
            color="primary"
            disabled={!selectedStudent}
          >
            Enroll Student
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Unenroll Student Dialog */}
      <Dialog open={unenrollDialogOpen} onClose={handleCloseUnenrollDialog}>
        <DialogTitle>Unenroll Student</DialogTitle>
        <DialogContent>
          {selectedEnrollment && (
            <>
              <Typography>
                Are you sure you want to unenroll {selectedEnrollment.student.name} from this course?
              </Typography>
              <Alert severity="warning" sx={{ mt: 2 }}>
                This action cannot be undone. All student progress and submission data for this course will be lost.
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUnenrollDialog}>Cancel</Button>
          <Button onClick={handleUnenrollStudent} variant="contained" color="error">
            Unenroll
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Update Progress Dialog */}
      <Dialog open={progressDialogOpen} onClose={handleCloseProgressDialog}>
        <DialogTitle>Update Student Progress</DialogTitle>
        <DialogContent>
          {selectedEnrollment && (
            <Box sx={{ pt: 2 }}>
              <Typography gutterBottom>
                Update progress for {selectedEnrollment.student.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <TextField
                    type="number"
                    label="Progress (%)"
                    value={progress}
                    onChange={handleProgressChange}
                    fullWidth
                    InputProps={{
                      inputProps: { min: 0, max: 100 }
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ height: 10, borderRadius: 5 }}
                    color={
                      progress === 100 ? 'success' : 
                      progress > 50 ? 'info' : 'primary'
                    }
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">
                    {progress}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProgressDialog}>Cancel</Button>
          <Button onClick={handleUpdateProgress} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnrollmentManagement;