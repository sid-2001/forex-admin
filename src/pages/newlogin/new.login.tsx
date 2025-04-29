import React, { useEffect, useState } from 'react'
import { Grid, TextField, Button, Box, Typography, InputAdornment, IconButton, useTheme, Snackbar } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '@/services/auth.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { Logo } from '@/assets/images' // Assuming the logo is properly imported
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState, loaderState, selectedAppState, selectedCountryState, sidbarSelectionState } from '@/states/state'
import LoaderBackdrop from '@/components/loader/loader'
import CustomSnackbar from '@/components/customsnackbar/snackbar'
import CloseIcon from '@mui/icons-material/Close'
const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [text, setText] = useState('')
  const [type, setType] = useState('')
  const [open, setOpen] = useState(false)
  const [commonloader, setcommonloader] = useRecoilState(loaderState)
    const[selecteCountryState,setselectedCountryState]=useRecoilState(selectedCountryState)
    const [selectedTab, setSelectedTab] = useRecoilState(selectedAppState)
    const [error, setError] = useState('');

    

  const [openSnackbar, setOpenSnackBar] = useState(false)

  const auth_service = new AuthService()
  const local_service = new LocalStorageService()
  const navigate = useNavigate()
  const theme = useTheme()



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // Enforce lowercase only
    input = input.toLowerCase();

    const regex = /^[a-z0-9]*$/; // Only lowercase letters and numbers

    if (!regex.test(input)) {
      setError('Only lowercase letters and numbers are allowed.');
    } else if (input.length > 0 && input.length <= 10) {
      setError('Username must be more than 10 characters.');
    } else {
      setError('');
    }

    setEmail(input);
  };

  const handleClose = (
     //@ts-ignore
    event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const action = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleClose}>
        UNDO
      </Button>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  )

  useEffect(() => {
    if (local_service.get_accesstoken()) {
      navigate('/price')
    
      setTimeout(()=>{
window.location.reload()
      
      },100)
    
    }
  }, [navigate, local_service])

  const handleLogin = async () => {
    try {
      // setcommonloader(true)

      setSelectedTab("Price")

      auth_service
        .loginAdmin({
         "username": email,
          "password":password,
       
        })
        .then((data:any) => {
          
        console.log("i m in the data",data)






        
          if (data.status == true) {

            console.log(data?.data)

              setText('User SuccesFully Logged In')

              setText(data?.message)
              setType('success')
              setOpen(true)
              if(data?.data?.residenceCountry=="India"){

                setselectedCountryState('IN')
              }else{
              
                setselectedCountryState('SA')
              }

              setTimeout(() => {
                local_service.set_accesstoken('"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoic2hpdmFuc2hAaW1wcm9uaWNzLmNvbSIsInVzZXJfaWQiOiJjYmMzZDg3OS1iMTM2LTQyYTAtODY3Yy1mYjg2YTQ4MmI3ODciLCJyb2xlIjoiYWRtaW4ifSwiZXhwIjoxNzM4NTk3ODk1LCJqdGkiOiIwZTMxMDA1OS02ZTIyLTQ1MjgtYTliYS04OTA3MTNhZDZiMmYiLCJyZWZyZXNoIjpmYWxzZX0.06XT7DA3cs13hOIDyqlXcHElSXpFzHFO2L0y507Z0YQ"')
                local_service.set_user((data.data))
                local_service.set_role('user')
                navigate('/price')
            
              }, 500);
             
              console.log("i m here in the data")
              console.log(data)

            
            
         
          
          } else {
            setText(data?.message)
            console.log(data?.message)
            console.log('i m in the not success page')
            // setText('Unable to Verify Your Identity')
            setType('error')

           setOpen(true)
            setOpen(true)
            console.log(open)
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
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'red',
      }}
    >
      <LoaderBackdrop openloader={commonloader} />

      <Snackbar open={open} autoHideDuration={4000} onClose={handleClose} message={text} action={action} />
      {/* <CustomSnackbar /> */}
      <Box
        sx={{
          height: '100%',

          backgroundColor: theme.palette.primary.main,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // padding: 2,
        }}
      >
        <Grid
          container
          sx={{
            maxWidth: '700px',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: 3,
            // overflow: 'hidden',
          }}
        >
          {/* Logo Section */}
          <Grid
            item
            xs={12}
            sx={{
              // backgroundColor: theme.palette.primary.light,
              padding: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img src={Logo} alt="Logo" style={{ width: '80%', height: '80px', marginBottom: '1rem' }} />
            <Typography variant="h6" color="grey" textAlign="center" fontFamily="Inter">
              Please Sign In With Your Credentials
            </Typography>
          </Grid>

          {/* Form Section */}
          <Grid
            item
            xs={12}
            sx={{
              padding: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Typography variant="h6" color={theme.palette.primary.main} textAlign="center" fontFamily="Inter">
              User Name
              </Typography>

    

<TextField
      placeholder="User Name"
      variant="standard"
      fullWidth
      margin="normal"
      value={email}
      onChange={handleChange}
      inputProps={{ maxLength: 20 }}
      error={!!error}
      helperText={error}
    />

              <Typography variant="h6" color={theme.palette.primary.main} textAlign="center" fontFamily="Inter">
                Password
              </Typography>
              <TextField
                placeholder="Password"
                variant="standard"
                fullWidth
                margin="normal"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePasswordVisibility}>{showPassword ? <Visibility /> : <VisibilityOff />}</IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button  disabled={email.length>0&&password.length>0?false:true} variant="contained" color="primary" fullWidth sx={{ mt: 3, padding: '10px 0' }} onClick={handleLogin}>
                Sign In
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </div>
  )
}

export default LoginPage
