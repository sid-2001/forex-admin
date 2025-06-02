import React, { useState } from 'react'
import { Container, Box, TextField, Button, Typography, Divider, InputAdornment, IconButton, Snackbar, Alert } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Logo from '../../assets/images/logo.png' // Adjust the path as necessary
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import SendIcon from '@mui/icons-material/Send'
import { AuthService } from '../../services/auth.service'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const theme = createTheme({
  palette: {
    primary: {
      main: '#66C1FC', // Light blue background
    },
    secondary: {
      main: '#FFFFFF', // White color for box
    },
    text: {
      primary: '#ADD8E6', // Light blue for text
    },
    success: {
      main: '#008000', // Green button
    },
  },
})

const ResetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  //   const [branch, setBranch] = useState('Headquarters');
  const [otp, setOtp] = useState('')

  //   const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false)

  const [isOtpVerified, setIsOtpVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState('error')
  const [snackbarMessage, setSnackbarMessage] = useState('')
  //   const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  const [confirmedPassword, setConfirmedPassword] = useState('')
  const [error, setError] = useState(false)

  const navigate = useNavigate()

  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value)
    // setError(e.target.value !== confirmedPassword);
  }

  const handleConfirmedPasswordChange = (e: any) => {
    // const { value } = e.target;
    // setConfirmedPassword(value);
    setConfirmedPassword(e.target.value)
    setError(password !== e.target.value)
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleMouseDownPassword = (event: any) => {
    event.preventDefault()
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('Email:', email)
    console.log('Password:', password)
    let service = new AuthService()
    service
      .updatePassword({ password: password })
      .then((data) => {
        if (data.success == true) {
          navigate('/login')
        }
      })
      .catch((err) => {
        setSnackbarSeverity('error')
        setSnackbarMessage('Oops! Something Went Wrong')
        setOpenSnackbar(true)
        console.log(err)
      })

    // You can add code here to handle the form submission, such as making an API call.
  }
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  const handleVerifyEmail = async () => {
    setLoading(true)
    try {
      let auth_service = new AuthService()
      let data = await auth_service.sendVerifcation(email)
      if (data.success == true) {
        setIsVerified(true)
        setSnackbarSeverity('success')
        setSnackbarMessage('OTP Send Succesfully')
        setOpenSnackbar(true)
      }
    } catch (error) {
      console.error('Error:', error)
      setIsVerified(false)
      setSnackbarSeverity('error')
      setSnackbarMessage('Email verification failed.')
      setOpenSnackbar(true)
    }
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    setLoading(true)
    try {
      let auth_service = new AuthService()
      let data = await auth_service.verifyOtp({ email: email, otp: otp })
      if (data.success == true) {
        setIsVerified(true)
        setIsOtpVerified(true)
        setSnackbarSeverity('success')
        setSnackbarMessage('OTP Verified Succesfully')
        setOpenSnackbar(true)
      }
    } catch (error) {
      console.error('Error:', error)
      setIsVerified(false)
      setSnackbarSeverity('error')
      setSnackbarMessage('Otp Verification failed.')
      setOpenSnackbar(true)
    }
    setLoading(false)
  }

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '130vh',
        height: '50%',
        bgcolor: 'primary.main',
        p: 4,
      }}
    >
      {/* <Typography variant="h3" align="center" gutterBottom color="text.primary" sx={{ mb: 4 }}>
          LMS PORTAL
        </Typography> */}

      <Box
        sx={{
          // display: 'flex',
          bgcolor: 'secondary.main',
          p: 4,
          borderRadius: 2,
          boxShadow: 3,

          width: { xs: '90%', sm: '70%', md: '50%', lg: '70%' },
          maxWidth: 1600,
        }}
      >
        <Typography variant="h4" align="center" fontWeight="100" gutterBottom color="#005388">
          LMS Portal
        </Typography>

        <Box
          sx={{
            display: 'flex',
            bgcolor: 'secondary.main',
            // p: 4,
            // borderRadius: 2,
            // boxShadow: 3,
            width: { xs: '100%', sm: '100%', md: '100%', lg: '100%' },
            // maxWidth: 1200,
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              flex: 1,
              pr: { md: 4 },
            }}
          >
            <Typography variant="h3" align="left" fontWeight="100px" color="text.primary">
              Reset Password
            </Typography>

            <TextField
              fullWidth
              margin="normal"
              label="Verify Email"
              variant="outlined"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setIsVerified(false) // Reset verification state on change
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {isVerified ? (
                      <CheckBoxIcon color="success" />
                    ) : (
                      <IconButton onClick={handleVerifyEmail} disabled={loading}>
                        <SendIcon />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Verify OTP"
              variant="outlined"
              disabled={!isVerified}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value)
                setIsOtpVerified(false) // Reset verification state on change
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {isOtpVerified ? (
                      <CheckBoxIcon color="success" />
                    ) : (
                      <IconButton disabled={!isVerified} onClick={handleVerifyOtp}>
                        <SendIcon />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
              <Alert icon={false} severity={snackbarSeverity as any} sx={{ width: '100%' }}>
                {/* This success Alert has no icon. */}
                {snackbarMessage}
              </Alert>
            </Snackbar>
            {/* 
      <Alert icon={false}  severity={snackbarSeverity}    sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert> */}

            <TextField
              fullWidth
              margin="normal"
              label="New Password"
              type="password"
              variant="outlined"
              value={password}
              disabled={!(isVerified && isOtpVerified)}
              onChange={handlePasswordChange}
            />

            <TextField
              fullWidth
              margin="normal"
              disabled={!(isVerified && isOtpVerified)}
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={confirmedPassword}
              onChange={handleConfirmedPasswordChange}
              error={error}
              helperText={error ? 'Passwords do not match' : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* <Typography align="left" sx={{ mt: 1 }}>
              <a href="#" style={{ textDecoration: 'none', color: 'black' }}>Forgot Password?</a>
            </Typography> */}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="success"
              sx={{ mt: 2 }}
              disabled={!(isVerified && isOtpVerified) && password.length == 0}
            >
              Update Password
            </Button>
          </Box>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ bgcolor: 'primary.main', width: 2, marginLeft: '10px', display: { xs: 'none', md: 'block' } }}
          />
          <Box
            sx={{
              flex: 1,

              alignItems: 'center',
              justifyContent: 'center',
              display: { xs: 'none', md: 'flex' },
              pl: { md: 4 },
            }}
          >
            <img src={Logo} alt="Learning Academy" style={{ width: '100%', maxWidth: 300, height: 'auto' }} />
          </Box>
        </Box>
      </Box>
    </Container>
  )
}

export default ResetPasswordPage
