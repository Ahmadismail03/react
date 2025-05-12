// src/App.jsx with updated routes
import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Box, Container, ThemeProvider, CssBaseline } from '@mui/material'
import Navbar from './components/layout/NavbarWithNotifications'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Profile from './pages/Profile'
import OAuthCallback from './pages/auth/OAuthCallback'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import theme from './theme'
import Background3D from './components/common/Background3D'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import AdminCourseManagement from './pages/admin/CourseManagement'
import SystemSettings from './pages/admin/SystemSettings'
import EnrollmentManagement from './pages/admin/EnrollmentManagement'

// Instructor pages
import CourseManagement from './pages/instructor/CourseManagement'
import ContentUpload from './pages/instructor/ContentUpload'
import AssessmentCreation from './pages/instructor/AssessmentCreation'
import QuizManagement from './pages/instructor/QuizManagement'
import ModuleManagement from './pages/instructor/ModuleManagement'

// Student pages
import StudentDashboard from './pages/student/StudentDashboard'
import CourseView from './pages/student/CourseView'
import GradeView from './pages/student/GradeView'

// Common components
import ProtectedRoute from './components/common/ProtectedRoute'

function AppRoutes() {
  const { user, isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
      <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" replace />} />
      <Route path="/reset-password" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/" replace />} />
      <Route path="/reset-password/:token" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/" replace />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      
      {/* Main dashboard - redirects based on role */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            user?.role === 'ADMIN' ? (
              <Navigate to="/admin" replace />
            ) : user?.role === 'INSTRUCTOR' ? (
              <Navigate to="/instructor" replace />
            ) : (
              <Navigate to="/student" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <UserManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/courses" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminCourseManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/courses/:courseId/enrollments" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <EnrollmentManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <SystemSettings />
        </ProtectedRoute>
      } />
      
      {/* Instructor routes */}
      <Route path="/instructor" element={
        <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/instructor/courses" element={
        <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
          <CourseManagement />
        </ProtectedRoute>
      } />
      <Route path="/instructor/courses/create" element={
        <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
          <CourseManagement />
        </ProtectedRoute>
      } />
      <Route path="/instructor/courses/:courseId/content" element={
        <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
          <ContentUpload />
        </ProtectedRoute>
      } />
      <Route path="/instructor/courses/:courseId/modules" element={
        <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
          <ModuleManagement />
        </ProtectedRoute>
      } />
      <Route path="/instructor/courses/:courseId/assessments" element={
        <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
          <AssessmentCreation />
        </ProtectedRoute>
      } />
      <Route path="/instructor/courses/:courseId/quizzes" element={
        <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
          <QuizManagement />
        </ProtectedRoute>
      } />
      <Route path="/instructor/courses/:courseId/enrollments" element={
        <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
          <EnrollmentManagement />
        </ProtectedRoute>
      } />
      
      {/* Student routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['STUDENT']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/student/course/:courseId" element={
        <ProtectedRoute allowedRoles={['STUDENT']}>
          <CourseView />
        </ProtectedRoute>
      } />
      <Route path="/student/grades" element={
        <ProtectedRoute allowedRoles={['STUDENT']}>
          <GradeView />
        </ProtectedRoute>
      } />
      <Route path="/courses/*" element={
        <ProtectedRoute allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}>
          <Courses />
        </ProtectedRoute>
      } />
      
      {/* Common protected routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      {/* Catch all route - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App() {
  useEffect(() => {
    // Check for token in URL parameters
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      // Store the token in localStorage
      localStorage.setItem('token', token);
      
      // Remove the token from the URL to prevent it from being shared or bookmarked
      const url = new URL(window.location);
      url.searchParams.delete('token');
      window.history.replaceState({}, document.title, url.toString());
      
      // Reload the page to apply the token
      window.location.href = '/';
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Background3D />
          {window.location.pathname !== '/login' && 
           window.location.pathname !== '/register' && 
           window.location.pathname !== '/forgot-password' && 
           !window.location.pathname.startsWith('/reset-password') && 
           <Navbar />}
          <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
            <AppRoutes />
          </Container>
        </Box>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App