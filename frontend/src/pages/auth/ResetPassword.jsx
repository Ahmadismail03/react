// frontend/src/pages/auth/ResetPassword.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation, Link as RouterLink } from 'react-router-dom'
import {
  Avatar,
  Button,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material'
import LockResetIcon from '@mui/icons-material/LockReset'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { authApi } from '../../services/authApi'

const ResetPassword = () => {
  const [loading, setLoading] = useState(false)
  const [validatingToken, setValidatingToken] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  
  // Get token from URL parameters
  const { token: urlToken } = useParams()
  const location = useLocation()
  const queryToken = new URLSearchParams(location.search).get('token')
  const token = urlToken || queryToken

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  // Validate token when component mounts
  useEffect(() => {
    const validateToken = async () => {
      try {
        console.log('Validating token:', token)
        if (!token) {
          throw new Error('No token provided')
        }
        
        const response = await authApi.validateResetToken(token)
        console.log('Token validation response:', response)
        setTokenValid(response.data.valid)
      } catch (err) {
        console.error('Token validation error:', err)
        toast.error('Invalid or expired reset token')
        setTokenValid(false)
      } finally {
        setValidatingToken(false)
      }
    }

    if (token) {
      console.log('Token found in URL:', token)
      validateToken()
    } else {
      console.warn('No token found in URL parameters')
      setValidatingToken(false)
      setTokenValid(false)
    }
  }, [token])

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Missing reset token')
      return
    }
    
    try {
      setLoading(true)
      await authApi.resetPassword(token, data.password)
      setSuccess(true)
      toast.success('Password has been reset successfully')
    } catch (err) {
      console.error('Reset password error:', err)
      toast.error(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (validatingToken) {
    return (
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            mt: 8,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
          }}
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Validating your reset token...
          </Typography>
        </Paper>
      </Container>
    )
  }

  if (!tokenValid && !validatingToken) {
    return (
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            mt: 8,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'error.main' }}>
            <LockResetIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Invalid Reset Link
          </Typography>
          <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
            The password reset link is invalid or has expired.
          </Alert>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate('/forgot-password')}
            sx={{ mt: 2 }}
          >
            Request New Reset Link
          </Button>
          <Grid container justifyContent="center" sx={{ mt: 3 }}>
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Back to Login
              </Link>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    )
  }

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockResetIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Reset Your Password
        </Typography>

        {success ? (
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Your password has been reset successfully.
            </Alert>
            <Typography variant="body1" sx={{ mb: 3 }}>
              You can now log in with your new password.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              Go to Login
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please enter your new password below.
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="New Password"
              type="password"
              id="password"
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === watch('password') || 'Passwords do not match',
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>

            <Grid container justifyContent="center">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  Remember your password? Sign In
                </Link>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  )
}

export default ResetPassword