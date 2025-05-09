import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { userApi } from '../services/api'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import TwitterIcon from '@mui/icons-material/Twitter'
import GitHubIcon from '@mui/icons-material/GitHub'

const Profile = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio || '',
        profilePictureUrl: user.profilePictureUrl || '',
        socialLinks: user.socialLinks ? JSON.parse(user.socialLinks) : { linkedin: '', twitter: '', github: '' }
      })
      reset({
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        linkedin: user.socialLinks ? JSON.parse(user.socialLinks).linkedin || '' : '',
        twitter: user.socialLinks ? JSON.parse(user.socialLinks).twitter || '' : '',
        github: user.socialLinks ? JSON.parse(user.socialLinks).github || '' : ''
      })
      
      if (user.profilePictureUrl) {
        setAvatarPreview(user.profilePictureUrl)
      }
    }
  }, [user, reset])

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')
      
      // Prepare social links
      const socialLinks = JSON.stringify({
        linkedin: data.linkedin || '',
        twitter: data.twitter || '',
        github: data.github || ''
      })
      
      // Update profile information
      const profileData = {
        name: data.name,
        email: data.email,
        bio: data.bio,
        socialLinks: socialLinks
      }
      
      // Handle avatar upload if there's a new file
      if (avatarFile) {
        const formData = new FormData()
        formData.append('profilePicture', avatarFile)
        try {
          const response = await userApi.uploadProfilePicture(formData)
          profileData.profilePictureUrl = response.data.url
        } catch (uploadErr) {
          console.error('Avatar upload error:', uploadErr)
          toast.error('Failed to upload profile picture')
        }
      }
      
      // Update profile
      await userApi.updateProfile(profileData)
      
      // Update password if provided
      if (data.currentPassword && data.newPassword) {
        await userApi.changePassword({
          oldPassword: data.currentPassword,
          newPassword: data.newPassword
        })
        toast.success('Password updated successfully')
      }
      
      toast.success('Profile updated successfully')
      
      // Update local user state
      setProfile({
        ...profile,
        name: data.name,
        email: data.email,
        bio: data.bio,
        socialLinks: {
          linkedin: data.linkedin || '',
          twitter: data.twitter || '',
          github: data.github || ''
        },
        profilePictureUrl: profileData.profilePictureUrl || profile.profilePictureUrl
      })
      
    } catch (err) {
      console.error('Profile update error:', err)
      setError(err.response?.data?.message || err.message || 'Failed to update profile')
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={avatarPreview}
                    sx={{
                      width: 120,
                      height: 120,
                      mb: 2,
                      bgcolor: 'primary.main',
                      fontSize: '3rem',
                    }}
                  >
                    {profile.name.charAt(0)}
                  </Avatar>
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    onClick={handleAvatarClick}
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: 0,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'background.default' },
                    }}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </Box>
                <Typography variant="h6">{profile.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {profile.email}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                  }}
                >
                  {profile.role}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Edit Profile
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      {...register('name', {
                        required: 'Name is required',
                        minLength: {
                          value: 3,
                          message: 'Name must be at least 3 characters',
                        },
                      })}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
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
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      rows={4}
                      placeholder="Tell us about yourself"
                      {...register('bio', {
                        maxLength: {
                          value: 500,
                          message: 'Bio must be less than 500 characters',
                        },
                      })}
                      error={!!errors.bio}
                      helperText={errors.bio?.message || '0/500 characters'}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                      Social Links
                    </Typography>
                    <TextField
                      fullWidth
                      label="LinkedIn"
                      placeholder="Your LinkedIn profile URL"
                      {...register('linkedin')}
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkedInIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Twitter"
                      placeholder="Your Twitter handle"
                      {...register('twitter')}
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TwitterIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      label="GitHub"
                      placeholder="Your GitHub username"
                      {...register('github')}
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <GitHubIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                      Change Password
                    </Typography>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type="password"
                      {...register('currentPassword')}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      {...register('newPassword', {
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      error={!!errors.newPassword}
                      helperText={errors.newPassword?.message}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      {...register('confirmPassword', {
                        validate: (value) =>
                          value === document.querySelector('input[name="newPassword"]').value ||
                          'Passwords do not match',
                      })}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{ mt: 2 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Profile