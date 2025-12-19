import { ThemeProvider } from '@mui/material/styles'
import { Box, Typography, Avatar, List, ListItem, IconButton, AppBar, ListItemIcon, Toolbar, Tooltip, Chip, MenuItem, Select } from '@mui/material'
import { styled } from '@mui/system'
import { LogoWhite } from '@/assets/images'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import Person2Icon from '@mui/icons-material/Person2'
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'
import { themeModeState } from '@/states/state'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { Brightness4, Brightness7 } from '@mui/icons-material'
import { alertState, loaderState, selectedAppState, loaderStateNew, availableBalanceState } from '@/states/state'
import { useState, useEffect } from 'react'
import Backdrop from '@mui/material/Backdrop'
import LogoutIcon from '@mui/icons-material/Logout'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import Stack from '@mui/material/Stack'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme } from '@emotion/react'
import Paper from '@mui/material/Paper'
import WaterfallChartIcon from '@mui/icons-material/WaterfallChart'
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency'
import SourceIcon from '@mui/icons-material/Source'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import { TransactionService } from '@/services/transaction.service'
import ConfirmationModal from '../logout/logout.component'
import LoyaltyIcon from '@mui/icons-material/Loyalty'
import ErrorIcon from '@mui/icons-material/Error'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: 'transparent',
  padding: theme.spacing(1),
  textAlign: 'center',
  boxShadow: '0px 0px',
}))

const LoaderBackdrop = ({
  //@ts-ignore
  openloader,
  //@ts-ignore
  imageSrc,
}) => (
  <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={openloader}>
    <CircularProgress color="inherit" />
  </Backdrop>
)

const local_service: any = new LocalStorageService()

const DashboardContainer = styled(Box)({
  display: 'flex',
})

//@ts-nocheck
const MainContent = styled(Box)({
  width: '80%', // Adjusted to fit the screen
  padding: '1rem',
  marginLeft: 100,
})

const Header = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '1rem',
})




const CountrySelector = () => {
  const staff = local_service?.get_staff_access()

  if (!staff) return null

  const countryNames: Record<string, string> = {
    ZA: 'South Africa',
    IN: 'India',
    US: 'United States',
    UK: 'United Kingdom',
    AE: 'UAE',
  }

  const getFlag = (code: string) =>
    code
      ? code
          .toUpperCase()
          .replace(/./g, c =>
            String.fromCodePoint(127397 + c.charCodeAt(0))
          )
      : '🏳️'

  /** 🔹 Auto select first country if not selected */
  useEffect(() => {
    if (!staff.staffCountry && staff.staffCountries?.length) {
      local_service.set_usercountry(staff.staffCountries[0])
    }
  }, [staff])

  const selectedCountry =local_service.get_staff_country();


  return (
    <Typography>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.6}
        sx={{ mt: '2px' }}
      >
        {/* 🔹 MULTIPLE COUNTRIES → DROPDOWN */}
        {staff.staffCountries?.length > 1 ? (
          <Select
            size="small"
            value={selectedCountry}
            onChange={e =>
            {
              console.log(e)
              local_service.set_usercountry(e.target.value)
              window.location.reload()
            }
            }
            sx={{
             
              fontSize: { xs: '11px', md: '1.4vh' },
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: '20px',
              '& .MuiSelect-icon': { color: 'white' },
              '& fieldset': { border: 'none' },
            }}
          >
            {staff.staffCountries.map((code: string) => (
              <MenuItem key={code} value={code}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <span>{getFlag(code)}</span>
                  <span>{countryNames[code] || code}</span>
                </Box>
              </MenuItem>
            ))}
          </Select>
        ) : (
          /* 🔹 SINGLE COUNTRY → TEXT */
          selectedCountry && (
            <>
              <Typography
                sx={{ fontSize: { xs: '12px', md: '1.5vh' } }}
              >
                {getFlag(selectedCountry)}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '12px', md: '1.5vh' },
                  color: 'white',
                  whiteSpace: 'nowrap',
                }}
              >
                {countryNames[selectedCountry] ||
                  selectedCountry}
              </Typography>
            </>
          )
        )}
      </Stack>
    </Typography>
  )
}

const DashboardLayout = () => {
  const [mode, setMode] = useRecoilState(themeModeState)
  const [open, setOpen] = useRecoilState(alertState)
  const staffCountry = local_service?.get_staff_country()
  const [selectedApp, setSelectedApp] = useRecoilState(selectedAppState)
  const [openloader, setopenloader] = useRecoilState(loaderStateNew)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const theme = useTheme()

  const handleModalClose = () => {
    setIsModalOpen(!isModalOpen)
  }

  const menuItems = [
    {
      icon: (
        <ShowChartIcon
          sx={{
            //@ts-ignore
            color: theme.palette.secondary.light,
            fontSize: '2vh',
            //@ts-ignore
            color: theme.palette.primary.light,
            '&:hover': {
              //@ts-ignore
              color: theme.palette.primary.main, // Change the color to blue on hover
            },
          }}
        />
      ),
      label: 'Dashboard',
      name: 'Dashboard',
    },
    {
      icon: (
        <CompareArrowsIcon
          sx={{
            //@ts-ignore
            color: theme.palette.secondary.light,
            fontSize: '2vh',
            //@ts-ignore
            color: theme.palette.primary.light,
            '&:hover': {
              //@ts-ignore
              color: theme.palette.primary.main, // Change the color to blue on hover
            },
          }}
        />
      ),
      label: 'Transaction',
      name: 'Transactions',
    },

    {
      icon: (
        <ContactEmergencyIcon
          sx={{
            //@ts-ignore
            color: theme.palette.secondary.light,
            fontSize: '2vh',
            //@ts-ignore
            color: theme.palette.primary.light,
            '&:hover': {
              //@ts-ignore
              color: theme.palette.primary.main, // Change the color to blue on hover
            },
          }}
        />
      ),
      label: 'Kyc',
      name: 'KYC',
    },
    {
      icon: (
        <PeopleOutlineIcon
          sx={{
            //@ts-ignore
            color: theme.palette.secondary.light,
            fontSize: '2vh',
            //@ts-ignore
            color: theme.palette.primary.light,
            '&:hover': {
              //@ts-ignore
              color: theme.palette.primary.main, // Change the color to blue on hover
            },
          }}
        />
      ),
      label: 'Applicant',
      name: 'Applicants',
    },
    {
      icon: (
        <>
          <SourceIcon
            sx={{
              //@ts-ignore
              fontSize: '2vh',
              //@ts-ignore
              color: theme.palette.primary.light, // Corrected theme usage
            }}
          />
        </>
      ),
      label: 'Bop',
      name: 'BOP',
    },
    {
      icon: (
        <>
          <Person2Icon
            sx={{
              //@ts-ignore
              fontSize: '2vh',
              //@ts-ignore
              color: theme.palette.primary.light, // Corrected theme usage
            }}
          />
        </>
      ),
      label: 'Profile',
      name: 'Users',
    },
    {
      icon: (
        <>
          <ViewModuleIcon
            sx={{
              //@ts-ignore
              fontSize: '2vh',
              //@ts-ignore
              color: theme.palette.primary.light, // Corrected theme usage
            }}
          />
        </>
      ),
      label: 'Module',
      name: 'Modules',
    },
    {
      icon: (
        <>
          <SupervisedUserCircleIcon
            sx={{
              //@ts-ignore
              fontSize: '2vh',
              //@ts-ignore
              color: theme.palette.primary.light, // Corrected theme usage
            }}
          />
        </>
      ),
      label: 'Role',
      name: 'Roles',
    },
    {
      icon: (
        <>
          <AccountBalanceIcon
            sx={{
              //@ts-ignore
              fontSize: '2vh',
              //@ts-ignore
              color: theme.palette.primary.light, // Corrected theme usage
            }}
          />
        </>
      ),
      label: 'Cdi',
      name: 'CDI',
    },

    {
      icon: (
        <>
          <IconButton>
            <WaterfallChartIcon
              sx={{
                fontSize: '2vh',
                //@ts-ignore
                color: theme.palette.primary.light,
              }}
            />
          </IconButton>
        </>
      ),
      label: 'Static',
      name: 'Static Data',
    },
    {
      icon: (
        <>
          <ErrorIcon
            sx={{
              //@ts-ignore
              fontSize: '2vh',
              //@ts-ignore
              color: theme.palette.primary.light, // Corrected theme usage
            }}
          />
        </>
      ),
      label: 'SarbErrors',
      name: 'Error Codes',
    },

    {
      icon: (
        <>
          <LoyaltyIcon
            sx={{
              //@ts-ignore
              fontSize: '2vh',
              //@ts-ignore
              color: theme.palette.primary.light, // Corrected theme usage
            }}
          />
        </>
      ),
      label: 'Loyalty',
      name: 'Loyalty',
    },
    {
      icon: (
        <>
          <LoyaltyIcon
            sx={{
              //@ts-ignore
              fontSize: '2vh',
              //@ts-ignore
              color: theme.palette.primary.light, // Corrected theme usage
            }}
          />
        </>
      ),
      label: 'Audit-Logs',
      name: 'Audit-Logs',
    },

    {
      icon: (
        <>
          <LoyaltyIcon
            sx={{
              //@ts-ignore
              fontSize: '2vh',
              //@ts-ignore
              color: theme.palette.primary.light, // Corrected theme usage
            }}
          />
        </>
      ),
      label: 'Field-Validation',
      name: 'Field-Validation',
    },
  ]

  useEffect(() => {
    setTimeout(() => {
      setOpen(false)
    }, 2000)
  }, [open])

  const handleLogout = () => {
    navigate('/login')
    localStorage.clear()
  }

  return (
    <ThemeProvider theme={theme}>
      <LoaderBackdrop openloader={openloader} imageSrc=".." />
<AppBar
  position="sticky"
  sx={{
    minHeight: '8vh',
    height: '10vh',
 
  }}
>
  <Toolbar>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      {/* Left side - Logo + Dark/Light Mode (UNCHANGED) */}
      
      <Box sx={{ display: 'flex', alignItems: 'left', gap: 2 }}>
          <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <IconButton
            onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
            
            color="inherit"
            sx={{
              transition: 'transform 0.3s',
              '&:hover': { transform: 'rotate(180deg)' },
              marginLeft:'7%'
            }}
          >
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Tooltip>
    
      
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2,textAlign:"center" }}>

            <Link to="/dashboard">
          <img
            src={LogoWhite}
            alt="Logo"
            style={{
              maxHeight: '6vh',
              width: 'auto',
              objectFit: 'contain',
              marginLeft:"130%"
            }}
          />
        </Link>

      </Box>

      {/* Right side - Profile box (MADE RESPONSIVE) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: { xs: '20px', md: '30px' },
          // border: '1px solid #D1DDFC',
          gap: { xs: 1, md: 1.2 },
          backgroundColor: 'transparent',
          // p: { xs: 0.8, md: 1 } ,
          margin:10,
       

        }}
      >
        <Avatar
          sx={{
            bgcolor: 'grey.700',
            width: { xs: 36, md: 42 },
            height: { xs: 36, md: 42 },
            fontSize: { xs: '14px', md: '1.8vh' },
            fontWeight: 600,
          }}
        >
          {
            <strong>
              {local_service?.get_staff_access().staffFirstName[0]?.toUpperCase() +
                local_service?.get_staff_access().staffLastName[0]?.toUpperCase()}
            </strong>
          }
        </Avatar>

        {/* Text content - hidden on mobile, visible on tablet+ */}
        <Box 
          sx={{ 
            display: { xs: 'none', sm: 'flex' }, 
            flexDirection: 'column', 
            justifyContent: 'center' 
          }}
        >
          {/* Name + Role in one line */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontFamily: 'sans-serif',
                fontSize: { xs: '14px', md: '2vh' },
                color: 'white',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {local_service?.get_staff_access().staffFirstName + ' ' + local_service?.get_staff_access().staffLastName}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontFamily: 'sans-serif',
                fontSize: { xs: '12px', md: '1.5vh' },
                color: 'white',
                opacity: 0.8,
                whiteSpace: 'nowrap',
              }}
            >
              • {local_service?.get_staff_access().userCategory || local_service?.get_staff_access().roleDescription || 'User'}
            </Typography>
          </Box>

          {/* Staff ID */}
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>

          
          <Typography
            variant="subtitle2"
            sx={{
              fontFamily: 'sans-serif',
              fontSize: { xs: '12px', md: '1.5vh' },
              color: 'white',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              marginTop: '2px',
            }}
          >
            {local_service?.get_staff_access().staffId}
          </Typography>
     <Typography>

    <CountrySelector></CountrySelector>

</Typography>

</Box>
          {/* Country */}
      
        </Box>
      </Box>

    
    </Box>
  </Toolbar>
</AppBar>
      <DashboardContainer>
        <Box sx={{ position: 'relative' }}>
          {/* Sidebar */}
          <Box
            sx={{
              width: isDrawerOpen ? 200 : 100,
              //@ts-ignore
              backgroundColor: theme.palette.secondary.main,
              position: 'fixed',
              top: '10vh',
              left: 0,
              height: 'calc(100vh - 10vh)',
              overflowY: 'auto',
              boxShadow: '2px 0 5px rgba(0,0,0,0.3)',
              transition: 'width 0.3s',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 1500,
            }}
          >
            <List
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                textAlign: 'center',
                height: '100%',
                '@media (max-height: 700px)': {
                  maxHeight: 'calc(100vh - 80px)',
                },
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  //@ts-ignore
                  backgroundColor: theme.palette.secondary.main,
                },
                '&::-webkit-scrollbar-thumb': {
                  //@ts-ignore
                  backgroundColor: theme.palette.secondary.main,
                  borderRadius: '8px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  //@ts-ignore
                  backgroundColor: theme.palette.secondary.dark,
                },
              }}
            >
              {menuItems.map((item, index) => (
                <ListItem
                  button
                  selected={selectedApp === item.label}
                  key={index}
                  sx={{
                    justifyContent: isDrawerOpen ? 'flex-start' : 'center',
                    textAlign: 'center',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                  }}
                  onClick={() => {
                    setSelectedApp(item.label)
                    navigate(item.label.toLocaleLowerCase())
                  }}
                >
                  <Stack sx={{ padding: '1%' }}>
                    <Item>
                      <ListItemIcon
                        sx={{
                          textAlign: 'center',
                          justifyContent: 'center',
                          //@ts-ignore
                          // color: selectedApp === item.label ? theme.palette.primary.main : 'red', // Change color if selected
                        }}
                        onClick={() => {
                          navigate(item.label.toLocaleLowerCase())
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                    </Item>
                    <Item
                      style={{
                        color: 'white',
                        padding: '1%',
                      }}
                    >
                      {item.name}
                    </Item>
                  </Stack>
                </ListItem>
              ))}

              <ListItem
                button
                key="logout"
                sx={{
                  textAlign: 'center',
                  alignItems: 'center',
                }}
                onClick={() => {
                  setIsModalOpen(true)
                }}
              >
                <Stack>
                  {/* <Item>
                    <ListItemIcon
                      sx={{
                        textAlign: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <LogoutIcon sx={{ color: 'red' }} />
                    </ListItemIcon>
                  </Item> */}
                  {isDrawerOpen && (
                    <Item
                      style={{
                        color: 'white',
                        padding: '1%',
                      }}
                    >
                      Logout
                    </Item>
                  )}
                </Stack>
              </ListItem>
            </List>

            <List
              sx={{
                textAlign: 'center',
              }}
            >
              <ListItem
                button
                key="logout"
                sx={{
                  textAlign: 'center',
                  alignItems: 'center',
                }}
                onClick={() => {
                  setIsModalOpen(true)
                }}
              >
                <Stack>
                  <Item>
                    <ListItemIcon
                      sx={{
                        textAlign: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <LogoutIcon sx={{ color: 'white' }} /> {/* Adjust color if needed */}
                    </ListItemIcon>
                  </Item>
                </Stack>
              </ListItem>
            </List>
          </Box>

          <Box
            sx={{
              flexGrow: 1,

              padding: '2%',
              paddingLeft: '1 %',
              marginLeft: 0, // Prevent the sidebar from affecting the content
            }}
          >
            <MainContent>
              <Header>
                <Typography variant="h5"></Typography>
              </Header>
              <Outlet />
            </MainContent>

            {isModalOpen && (
              <ConfirmationModal
                isOpen={isModalOpen}
                message="Do you really want to logout?"
                handleConfirm={() => {
                  handleLogout()
                }}
                handleClose={() => {
                  handleModalClose()
                }}
                confirmBtnText="Logout"
                showIcon={true}
              />
            )}
          </Box>
        </Box>
      </DashboardContainer>
    </ThemeProvider>
  )
}

export default DashboardLayout
