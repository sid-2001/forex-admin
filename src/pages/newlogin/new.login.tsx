import React, { useEffect, useState } from 'react'
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  Snackbar,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '@/services/auth.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { Logo, SecondLogo } from '@/assets/images'

import { useRecoilState } from 'recoil'
import {
  countyState,
  loaderState,
  selectedAppState,
  selectedCountryState,
  userCurrencyState,
} from '@/states/state'
import { UserService } from '@/services/user.service'
import staticdataService from '@/services/staticdata.service'
import LoaderUI from '@/components/loader/loader'
import { TransactionService } from '@/services/transaction.service'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [text, setText] = useState('')
  const [type, setType] = useState('')
  const [open, setOpen] = useState(false)
  const [commonloader, setcommonloader] = useRecoilState(loaderState)
  const [selecteCountryState, setselectedCountryState] =
    useRecoilState(selectedCountryState)
  const [selectedTab, setSelectedTab] = useRecoilState(selectedAppState)
  const [county, setCountry] = useRecoilState(countyState)
  const [error, setError] = useState('')
  const [userCurrency, setUserCurrency] = useRecoilState(userCurrencyState)

  const auth_service = new AuthService()
  const local_service = new LocalStorageService()
  const user_service = new UserService()
  const static_service = new staticdataService()
  const transaction_service = new TransactionService()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value
    input = input.toLowerCase()
    setEmail(input)
  }

  const getCountryList = async () => {
    try {
      const data = await static_service.getCountryList()
      setCountry(data)
    } catch (err) {
      console.log(err)
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    if (local_service.get_accesstoken()) {
      navigate('/dashboard')
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }, [navigate, local_service])

  const fetchAllModulesList = async () => {
    try {
      const response: any = await user_service.getAllModulesData()
      if (response) {
        let moduleObj: any = {}
        response.forEach((item: any) => {
          moduleObj[item.moduleName.replace(/\s+/g, '_').toUpperCase()] =
            item.moduleName
        })
        localStorage.setItem('modules', JSON.stringify(moduleObj))
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const fetchAllValidations = async (country: any) => {
    try {
      const response: any = await transaction_service.getAllValidationsList(
        country,
      )
      localStorage.setItem('validations', JSON.stringify(response?.data))
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const handleLogin = async () => {
    try {
      setSelectedTab('Price')
      auth_service
        .loginStaff({
          username: email,
          password: password,
        })
        .then((response: any) => {
          if (response?.data) {
            fetchAllModulesList()
            setText('User SuccesFully Logged In')
            setType('success')
            setOpen(true)
            const { data } = response
            setTimeout(() => {
              local_service.set_accesstoken(
                '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoic2hpdmFuc2hAaW1wcm9uaWNzLmNvbSIsInVzZXJfaWQiOiJjYmMzZDg3OS1iMTM2LTQyYTAtODY3Yy1mYjg2YTQ4MmI3ODciLCJyb2xlIjoiYWRtaW4ifSwiZXhwIjoxNzM4NTk3ODk1LCJqdGkiOiIwZTMxMDA1OS02ZTIyLTQ1MjgtYTliYS04OTA3MTNhZDZiMmYiLCJyZWZyZXNoIjpmYWxzZX0.06XT7DA3cs13hOIDyqlXcHElSXpFzHFO2L0y507Z0YQ"',
              )
              local_service.set_staff_access(data)
              static_service
                .getCountryCurrency(data?.staffCountry)
                .then((currency) => {
                  setUserCurrency(currency as any)
                })
              local_service.set_role(data?.roleDescription)
              getCountryList()
              fetchAllValidations(data?.staffCountry)
              navigate('/dashboard')
            }, 500)
          } else {
            setText(response?.message)
            setType('error')
            setOpen(true)
          }
        })
        .catch((err) => {
          console.error(err)
        })
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Grid container sx={{ height: '100vh' }}>
      {/* Left Section */}
  <Box
  sx={{
    width: { xs: '100vw', md: '800px' }, // fixed 400px on desktop, full width on mobile
    height: '100vh',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    px: 4,
  }}
>
        <Box sx={{ width: '100vw', maxWidth: 600 }}>
          {/* Logo + Title */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 6,
              mb: 20,
            }}
          >
            <img src={Logo} alt="Logo" style={{ height: '100px', display: 'flex', alignItems: 'flex-start' }} />
            <img src={SecondLogo} alt="Logo" style={{ height: '30px', display: 'flex', alignItems: 'flex-start' }} />

          </Box>

          {/* Heading */}
          <Typography variant="h3" fontWeight="bold" mb={1}>
            Sign In
          </Typography>
          <Typography variant="h5" color="text.secondary" mb={3}>
            with your credentials
          </Typography>

          {/* Username */}
          <TextField
            placeholder="Email ID"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={handleChange}
            inputProps={{ maxLength: 20 }}
            error={!!error}
            helperText={error}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#fff",
                "& fieldset": {
                  borderColor: "#79CBF0", // light sky blue default
                },
                "&:hover fieldset": {
                  borderColor: "#0361B1", // dark blue on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#024a87", // darker blue on focus
                  borderWidth: "1.5px",
                },
              },
            }}
          />

          {/* Password Field */}
          <TextField
            placeholder="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePasswordVisibility} edge="end">
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#fff",
                "& fieldset": {
                  borderColor: "#79CBF0", // light sky blue default
                },
                "&:hover fieldset": {
                  borderColor: "#0361B1", // dark blue on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#024a87", // darker blue on focus
                  borderWidth: "1.5px",
                },
              },
            }}
          />

          {/* Forgot Password */}
          <Typography
            variant="body2"
            sx={{
              textAlign: 'left',
              mt: 1,
              cursor: 'pointer',
              color: '#0361B1',
            }}
          >
            Forgot Password?
          </Typography>

          {/* Sign In Button */}
          <Button
            disabled={email.length > 0 && password.length > 0 ? false : true}
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              py: 1.5,
              backgroundColor: '#0361B1',
              '&:disabled': {
                backgroundColor: '#E4E4E4',
                color: '#B7B7B7',
              },
            }}
            onClick={handleLogin}
          >
            Sign In
          </Button>

          {/* Footer */}
    <Typography
  variant="body2"
  sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    mt: 20,
    fontSize: '16px',
  }}
>
  <span style={{ color: '#0361B1', fontWeight: 400 ,fontSize:"20px"}}>www.</span>
  <span style={{ color: '#0361B1', fontWeight: 'bold',fontSize:"30px" }}>impropay.global</span>
</Typography>


        </Box>
      </Box>

      {/* Right Section */}
      <Grid
        item
        xs={12}
        md={8}
        sx={{
          background: 'linear-gradient(to bottom, #004080, #0361B1)',
          // display: { xs: 'none', md: 'block' },
        }}
      />

      {/* Loader + Snackbar */}
      <LoaderUI.LoaderBackdrop openloader={commonloader} />
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        message={text}
      />
    </Grid>
  )
}

export default LoginPage
