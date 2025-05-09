import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-toastify'

const OAuthCallback = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the response from the URL
        const params = new URLSearchParams(window.location.search)
        const response = params.get('response')
        
        if (response) {
          try {
            // Parse the JSON response
            const data = JSON.parse(response)
            
            if (data.accessToken) {
              // Store the token
              localStorage.setItem('token', data.accessToken)
              
              // Get user info from the token
              const tokenParts = data.accessToken.split('.')
              const payload = JSON.parse(atob(tokenParts[1]))
              
              // Create user object from token payload
              const userData = {
                id: payload.userId,
                email: payload.email,
                name: payload.name,
                role: payload.role.replace('ROLE_', '')
              }
              
              // Update auth context
              login(userData.email, data.accessToken)
              toast.success('Successfully signed in with Google')
              navigate('/')
            } else {
              throw new Error('No access token in response')
            }
          } catch (error) {
            console.error('Error parsing response:', error)
            toast.error('Failed to process authentication response')
            navigate('/login')
          }
        } else {
          throw new Error('No response received')
        }
      } catch (error) {
        console.error('OAuth callback error:', error)
        toast.error('Authentication failed')
        navigate('/login')
      }
    }

    handleCallback()
  }, [navigate, login])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Completing sign in...
      </Typography>
    </Box>
  )
}

export default OAuthCallback 