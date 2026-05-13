import React, { useEffect, useState } from 'react'
import { Grid, TextField, Button, Box, Typography, InputAdornment, IconButton, Snackbar } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '@/services/auth.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { Logo, SecondLogo } from '@/assets/images'

import { useRecoilState } from 'recoil'
import {
  countyState,
  inactivityTiming,
  loaderState,
  selectedAppState,
  selectedCountryState,
  userAccessCountry,
  userCurrencyState,
} from '@/states/state'
import { UserService } from '@/services/user.service'
import staticdataService from '@/services/staticdata.service'
import LoaderUI from '@/components/loader/loader'
import { TransactionService } from '@/services/transaction.service'
import { FieldValidationService } from '@/services/fieldvalidstion.service'
import { CountryLabelData, LoginPageLabel } from '@/types/field.validation.type'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginType, setLoginType] = useState<'email' | 'phone' | 'username'>('email')
  const [error, setError] = useState('')
  const [text, setText] = useState('')
  const [type, setType] = useState('')
  const [open, setOpen] = useState(false)

  const [commonloader, setCommonLoader] = useRecoilState(loaderState)
  const [, setUserAccessCountry] = useRecoilState(userAccessCountry)
  const [, setSelectedCountryState] = useRecoilState(selectedCountryState)
  const [, setSelectedTab] = useRecoilState(selectedAppState)
  const [, setCountry] = useRecoilState(countyState)
  const [, setUserCurrency] = useRecoilState(userCurrencyState)
  const [, setInactivityTiming] = useRecoilState(inactivityTiming)
  const [validataion, setValidation] = useState<LoginPageLabel>()

  const auth_service = new AuthService()
  const local_service = new LocalStorageService()
  const user_service = new UserService()
  const static_service = new staticdataService()
  const transaction_service = new TransactionService()
  const field_validataion_service = new FieldValidationService()
  const navigate = useNavigate()

  const checkType = (value: string) => {
    const trimmed = value.trim()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const phoneRegex = /^[6-9]\d{9}$/

    // username:
    // - 3 to 20 chars
    // - letters, numbers, _ .
    // - must contain at least one letter
    const usernameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9_.]{3,20}$/

    if (emailRegex.test(trimmed)) {
      return 'email'
    }

    if (phoneRegex.test(trimmed)) {
      return 'phone'
    }

    if (usernameRegex.test(trimmed)) {
      return 'username'
    }

    return 'invalid'
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    const detectedType = checkType(value)

    if (detectedType === 'invalid') {
      //@ts-ignore
      setError(validataion?.username_validataion_msg ? validataion?.username_validataion_msg : 'No Message From Backend')
    } else {
      setError('')
      setLoginType(detectedType)
    }
  }
  const fetchAllModulesList = async () => {
    try {
      const response: any = await user_service.getAllModulesData()
      if (response) {
        let moduleObj: any = {}
        response.forEach((item: any) => {
          moduleObj[item.moduleName.replace(/\s+/g, '_').toUpperCase()] = item.moduleName
        })
        localStorage.setItem('modules', JSON.stringify(moduleObj))
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const handleLogin = async () => {
    if (!email || !password || error) return

    try {
      setCommonLoader(true)
      setSelectedTab('Price')
      fetchAllModulesList()

      const response: any = await auth_service.loginStaff({
        usernameOrEmailOrPhone: loginType,
        value: email,
        password,
      })

      if (response?.data) {
        const { data } = response

        local_service.set_accesstoken(data.token)
        local_service.set_staff_access(data)
        local_service.set_role(data?.roleDescription)

        const currency = await static_service.getCountryCurrency(data?.staffCountry)
        setUserCurrency(currency as any)

        const countries = await static_service.getCountryList()
        setCountry(countries)

        await transaction_service.getAllValidationsList(data?.staffCountry)

        setUserAccessCountry(data?.staffCountries)
        setInactivityTiming(data?.inactivityTime)

        setText('User Successfully Logged In')
        setType('success')
        setOpen(true)

        navigate('/dashboard')
      } else {
        setText(response?.message || 'Login failed')
        setType('error')
        setOpen(true)
      }
    } catch (err) {
      console.error(err)
      setText('Login failed')
      setType('error')
      setOpen(true)
    } finally {
      setCommonLoader(false)
    }
  }

  useEffect(() => {
    if (local_service.get_accesstoken()) {
      navigate('/dashboard')
      setTimeout(() => window.location.reload(), 100)
    }
    field_validataion_service.getScreenFieldvalidation('LOGIN', 'IN', 'W').then((data) => {
      console.log(data)

      let username_data = data?.data?.countryReportingLabelDTO?.filter((e) => e.countryLabelFieldNameAndValidation?.fieldName == 'username')
      let password_data = data?.data?.countryReportingLabelDTO?.filter((e) => e.countryLabelFieldNameAndValidation?.fieldName == 'password')
      let validation_data: LoginPageLabel = {
        usename: username_data.length > 0 ? username_data[0].countryLabelFieldNameAndValidation?.label : 'username',
        password: password_data.length > 0 ? password_data[0].countryLabelFieldNameAndValidation?.label : 'password',
        username_validataion_msg:
          username_data.length > 0 ? username_data[0].countryLabelFieldNameAndValidation.validationMessageMandatory : 'Please enter a valid Username',
        Password_validataion_msg:
          password_data.length > 0 ? password_data[0].countryLabelFieldNameAndValidation.validationMessageMandatory : 'Please enter a valid Password',

        username_minimum_legth: username_data.length > 0 ? username_data[0].countryLabelFieldNameAndValidation?.minLength : 1,

        username_max_length: username_data.length > 0 ? username_data[0].countryLabelFieldNameAndValidation?.maxLength : 40,
        username_regx: username_data.length > 0 ? username_data[0].countryLabelFieldNameAndValidation?.validationRegex : '^.*$',
        Password_minimum_legth: password_data.length > 0 ? password_data[0].countryLabelFieldNameAndValidation?.minLength : 1,
        Password_max_length: password_data.length > 0 ? password_data[0].countryLabelFieldNameAndValidation?.maxLength : 40,
        Password_regx: password_data.length > 0 ? password_data[0].countryLabelFieldNameAndValidation?.validationRegex : '^.*$',
      }
      setValidation(validation_data)
      console.log(validation_data)
      // setValidation(data?.data);
    })
  }, [])

  return (
    <Grid container sx={{ height: '100vh' }}>
      {/* LEFT SECTION */}
      <Grid
        item
        xs={12}
        md={4}
        sx={{
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: 4,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 600 }}>
          {/* LOGOS */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 6,
              mb: 20,
            }}
          >
            <img src={Logo} alt="Logo" height={100} />
            <img src={SecondLogo} alt="Logo" height={30} />
          </Box>

          <Typography variant="h3" fontWeight="bold">
            Sign In
          </Typography>
          <Typography variant="h5" color="text.secondary" mb={3}>
            with your credentials
          </Typography>

          {/* FORM → ENTER KEY WORKS HERE */}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleLogin()
              console.log('Form submitted!') // Add this line
            }}
          >
            <TextField
              //@ts-ignore
              placeholder={validataion?.usename || 'Username/Email/Phone'}
              fullWidth
              margin="normal"
              value={email}
              onChange={handleChange}
              error={!!error} // Show error state when there's an error
              helperText={email ? error : ''}
              // helperText={error || validataion?.username_validataion_msg} // Show validation message
              inputProps={{
                minLength: validataion?.username_minimum_legth,
                maxLength: validataion?.username_max_length,
                pattern: validataion?.username_regx,
              }}
            />

            <TextField
              //@ts-ignore
              placeholder={validataion?.password || 'Password'}
              fullWidth
              margin="normal"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              //@ts-ignore
              error={!!password && password.length < (validataion?.Password_minimum_legth || 1)} // Add validation
              // helperText={password ? validataion?.Password_validataion_msg : ''}
              // helperText={   validataion?.Password_validataion_msg}
              inputProps={{
                minLength: validataion?.Password_minimum_legth,
                maxLength: validataion?.Password_max_length,
                pattern: validataion?.Password_regx,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <Visibility /> : <VisibilityOff />}</IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit" // This is important - makes the button submit the form
              fullWidth
              variant="contained"
              disabled={!email || !password || !!error}
              sx={{ mt: 3, py: 1.5, backgroundColor: '#0361B1' }}
            >
              Sign In
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 20, color: '#0361B1', fontSize: 16 }}>
            www.<strong style={{ fontSize: 22 }}>impropay.global</strong>
          </Typography>
        </Box>
      </Grid>

      {/* RIGHT SECTION */}
      <Grid
        item
        xs={false}
        md={8}
        sx={{
          display: { xs: 'none', md: 'block' },
          background: 'linear-gradient(to bottom, #004080, #0361B1)',
        }}
      />

      <LoaderUI.LoaderBackdrop openloader={commonloader} />

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        message={text}
      />
    </Grid>
  )
}

export default LoginPage
