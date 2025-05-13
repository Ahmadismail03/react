// src/contexts/AuthContext.jsx (Fixed Version)
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPasswordReset, setIsPasswordReset] = useState(false)

  // Configure axios defaults
  // Using empty string as base URL to work with the proxy in vite.config.js
  // This ensures requests are properly routed through the Vite proxy
  axios.defaults.baseURL = ''
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  // Check token validity on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Skip token validation if we're in a password reset flow
      const isResetPasswordPage = window.location.pathname.includes('/reset-password');
      
      if (isResetPasswordPage) {
        setLoading(false);
        setIsPasswordReset(true);
        return;
      }
      
      if (token) {
        try {
          const response = await axios.get('/api/auth/me')
          setUser(response.data)
        } catch (err) {
          console.error('Token validation failed:', err)
          
          // Don't clear token if we're in reset password flow
          if (!isResetPasswordPage) {
            localStorage.removeItem('token')
            setToken(null)
            setUser(null)
          }
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [token])

  const login = useCallback(async (email, password) => {
    try {
      setError(null)
      const response = await axios.post('/api/auth/login', { email, password })
      const { accessToken, id, email: userEmail, name, role } = response.data
      
      localStorage.setItem('token', accessToken)
      setToken(accessToken)
      setUser({ id, email: userEmail, name, role })
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      
      return true
    } catch (error) {
      console.error('Login failed:', error)
      if (error.response) {
        setError(error.response.data.message || 'Login failed')
        toast.error(error.response.data.message || 'Login failed')
      } else {
        setError('Network error. Please check your connection.')
        toast.error('Network error. Please check your connection.')
      }
      return false
    }
  }, [])

  const register = useCallback(async (name, email, password, role) => {
    try {
      setError(null)
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        role
      })
      
      // After successful registration, automatically log in the user
      const loginResponse = await axios.post('/api/auth/login', { email, password })
      const { accessToken, id, email: userEmail, name: userName, role: userRole } = loginResponse.data
      
      localStorage.setItem('token', accessToken)
      setToken(accessToken)
      setUser({ id, email: userEmail, name: userName, role: userRole })
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      if (error.response) {
        setError(error.response.data.message || 'Registration failed')
        toast.error(error.response.data.message || 'Registration failed')
      } else {
        setError('Network error. Please check your connection.')
        toast.error('Network error. Please check your connection.')
      }
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setError(null)
    delete axios.defaults.headers.common['Authorization']
    toast.success('Logged out successfully')
  }, [])

  const value = {
    user,
    token,
    error,
    loading,
    login,
    register,
    logout,
    isPasswordReset,
    isAuthenticated: !!token && !isPasswordReset,
  }

  if (loading) {
    return null // Or a loading spinner
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}