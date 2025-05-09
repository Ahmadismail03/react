import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Tooltip,
  InputAdornment,
  OutlinedInput,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { userApi, authApi } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const UserManagement = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('Fetching users from:', '/api/users')
      const response = await userApi.getAllUsers()
      console.log('Users response:', response)
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      console.error('Error response data:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      // More specific error message
      let errorMessage = 'Failed to load users';
      if (error.response?.data?.message) {
        errorMessage += ': ' + error.response.data.message;
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
    setPage(0)
  }

  const handleAddUser = () => {
    setOpenAddDialog(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setOpenEditDialog(true)
  }

  const handleDeleteUser = (user) => {
    setSelectedUser(user)
    setOpenDeleteDialog(true)
  }

  const handleAddDialogClose = () => {
    setOpenAddDialog(false)
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'STUDENT',
    })
  }

  const handleEditDialogClose = () => {
    setOpenEditDialog(false)
    setSelectedUser(null)
  }

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false)
    setSelectedUser(null)
  }

  const handleNewUserChange = (event) => {
    setNewUser({
      ...newUser,
      [event.target.name]: event.target.value,
    })
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userApi.updateUserRole(userId, newRole)
      setUsers(users.map(u => u.userId === userId ? { ...u, role: newRole } : u))
      toast.success('Role updated successfully')
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update role')
    }
  }

  const handleSubmitNewUser = async () => {
    // Validate required fields
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('All fields are required')
      return
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newUser.email)) {
      toast.error('Please enter a valid email address')
      return
    }
    
    // Validate password length
    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    
    try {
      // Create a copy of the user data with the correct structure
      // The backend expects a registration request format
      const userData = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role  // Don't modify the role, send it as is
      }
      
      console.log('Sending user data:', userData)
      
      // Use the register endpoint instead of createUser
      // This matches how users are created in the backend
      const response = await authApi.register(userData)
      console.log('Server response:', response)
      
      // Refresh the user list to show the new user
      await fetchUsers()
      toast.success('User added successfully')
      handleAddDialogClose()
    } catch (error) {
      console.error('Full error object:', error)
      console.error('Error response data:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      // More specific error message
      let errorMessage = 'Failed to create user';
      if (error.response?.data?.message) {
        errorMessage += ': ' + error.response.data.message;
      } else if (error.message && error.message.includes('Network Error')) {
        errorMessage += ': Network error - please check your connection';
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      } else {
        errorMessage += ': Unknown error occurred';
      }
      
      toast.error(errorMessage)
    }
  }

  const handleUpdateUser = async () => {
    try {
      // Create a copy of the user data to send to the backend
      // Only sending the name field as requested
      const userData = {
        name: selectedUser.name,
        // Keeping original email and role values but not sending them for update
      }
      
      console.log('Updating user with ID:', selectedUser.userId)
      console.log('Update data:', userData)
      
      // Send the update request to the backend
      const response = await userApi.updateUser(selectedUser.userId, userData)
      console.log('Update response:', response)
      
      // Refresh the user list to ensure we have the latest data from the server
      await fetchUsers()
      
      toast.success('User name updated successfully')
      handleEditDialogClose()
    } catch (error) {
      console.error('Error updating user:', error)
      console.error('Error response data:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      // More specific error message
      let errorMessage = 'Failed to update user';
      if (error.response?.data?.message) {
        errorMessage += ': ' + error.response.data.message;
      } else if (error.message && error.message.includes('Network Error')) {
        errorMessage += ': Network error - please check your connection';
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      } else {
        errorMessage += ': Unknown error occurred';
      }
      
      toast.error(errorMessage)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      console.log('Deleting user with ID:', selectedUser.userId)
      await userApi.deleteUser(selectedUser.userId)
      setUsers(users.filter(u => u.userId !== selectedUser.userId))
      toast.success('User deleted successfully')
      handleDeleteDialogClose()
    } catch (error) {
      console.error('Error deleting user:', error)
      console.error('Error response data:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      // More specific error message
      let errorMessage = 'Failed to delete user';
      if (error.response?.data?.message) {
        errorMessage += ': ' + error.response.data.message;
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      toast.error(errorMessage)
    }
  }

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <FormControl variant="outlined" fullWidth>
            <OutlinedInput
              id="search-users"
              placeholder="Search users by name or email"
              value={searchTerm}
              onChange={handleSearchChange}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
            />
          </FormControl>
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow hover key={user.userId}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <FormControl variant="outlined" size="small">
                        <Select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.userId, e.target.value)}
                          disabled={user.userId === user?.userId} // Can't change own role
                        >
                          <MenuItem value="ADMIN">Admin</MenuItem>
                          <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
                          <MenuItem value="STUDENT">Student</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditUser(user)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.userId === currentUser?.userId} // Can't delete yourself
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={handleAddDialogClose}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Full Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newUser.name}
            onChange={handleNewUserChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={newUser.email}
            onChange={handleNewUserChange}
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newUser.password}
            onChange={handleNewUserChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="new-user-role-label">Role</InputLabel>
            <Select
              labelId="new-user-role-label"
              name="role"
              value={newUser.role}
              onChange={handleNewUserChange}
              label="Role"
            >
              <MenuItem value="ADMIN">Admin</MenuItem>
              <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
              <MenuItem value="STUDENT">Student</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Cancel</Button>
          <Button onClick={handleSubmitNewUser} variant="contained" color="primary">
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Full Name"
                type="text"
                fullWidth
                variant="outlined"
                value={selectedUser.name}
                onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
              />
              {/* Email and role fields removed as requested */}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleUpdateUser} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserManagement