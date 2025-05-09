import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
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
} from '@mui/material'
import LockResetIcon from '@mui/icons-material/LockReset'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { authApi } from '../../services/api'

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      await authApi.forgotPassword(data.email)
      setSuccess(true)
      toast.success('Password reset instructions sent to your email')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset instructions')
    } finally {
      setLoading(false)
    }
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
          Reset Password
        </Typography>

        {success ? (
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Password reset instructions have been sent to your email.
            </Alert>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Please check your inbox and follow the instructions to reset your password.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              Back to Login
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              autoFocus
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
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

export default ForgotPassword