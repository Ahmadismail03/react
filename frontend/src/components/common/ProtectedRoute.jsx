import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/**
 * ProtectedRoute component that handles role-based access control
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {Array<string>} props.allowedRoles - Array of roles allowed to access this route
 * @returns {React.ReactNode} - The protected component or redirect
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth()

  // Show nothing while checking authentication
  if (loading) {
    return null
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If no specific roles are required, allow any authenticated user
  if (allowedRoles.length === 0) {
    return children
  }

  // Check if user has one of the allowed roles
  if (user && allowedRoles.includes(user.role)) {
    return children
  }

  // Redirect based on user role if they don't have access
  const roleRedirectMap = {
    ADMIN: '/admin',
    INSTRUCTOR: '/instructor',
    STUDENT: '/student',
  }

  // Default to dashboard if role not found in map
  const redirectPath = user?.role ? roleRedirectMap[user.role] || '/' : '/'
  
  return <Navigate to={redirectPath} replace />
}

export default ProtectedRoute