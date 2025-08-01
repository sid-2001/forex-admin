import { ThemeProvider } from '@mui/material/styles'
import { Box, Typography, Avatar, List, ListItem, ListItemText, IconButton, Modal, AppBar, ListItemIcon, Toolbar } from '@mui/material'
import { styled } from '@mui/system'
import { Logo, LogoWhite } from '@/assets/images'
import { Outlet, useNavigate } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import Person2Icon from '@mui/icons-material/Person2'
// import { sidbarSelectionState, studentListState } from "../../states/state";
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'
import { themeModeState } from '@/states/state'
// import { studentService } from "@/services/student.service";
import { LocalStorageService } from '@/helpers/local-storage-service'
import { Brightness4, Brightness7 } from '@mui/icons-material'
import { useContext } from 'react'
import {
  alertState,
  alertTextState,
  alertTypeState,
  loaderState,
  role,
  sidbarSelectionState,
  selectedAppState,
  loaderStateNew,
  selectedCountryState,
  availableBalanceState,
  staticTableState,
} from '@/states/state'
import { useState } from 'react'
import Fade from '@mui/material/Fade'
import Backdrop from '@mui/material/Backdrop'
import LogoutIcon from '@mui/icons-material/Logout'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import { useEffect } from 'react'

import Stack from '@mui/material/Stack'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme } from '@emotion/react'
import Paper from '@mui/material/Paper'
import WaterfallChartIcon from '@mui/icons-material/WaterfallChart'
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency'
import SourceIcon from '@mui/icons-material/Source'
import ShowChartIcon from '@mui/icons-material/ShowChart'
// import { IconButton } from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import { Us, Sa, Za, In } from 'react-flags-select'
import { TransactionService } from '@/services/transaction.service'
// import LogoutModalProps from '../logout/logout.component'
import ConfirmationModal from '../logout/logout.component'
import static_list from '@/contants/static.data'

const RotatingImage = (
  //@ts-ignore
  { src, alt },
) => (
  //@ts-ignore
  <Box
    //@ts-ignore
    // component="img"
    autoPlay
    component="img"
    src={Logo}
    alt="Impronics"
    loop
    sx={{
      width: '130px', // Adjust size as needed
      height: '100px', // Adjust size as needed
      backgroundColor: 'transparent',
      animation: 'spin 2s linear infinite',
      '@keyframes spin': {
        '0%': {
          transform: 'rotate(0deg)',
        },
        '100%': {
          transform: 'rotate(360deg)',
        },
      },
    }}
  />
)

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
    {/* <RotatingImage src={imageSrc} alt="Loading" /> */}
  </Backdrop>
)

let local_service: any = new LocalStorageService()

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

const DashboardLayout = () => {
  let navigate = useNavigate()
  const [mode, setMode] = useRecoilState(themeModeState)

  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selecteCountryState, setselectedCountryState] = useRecoilState(selectedCountryState)
  const opendropdown = Boolean(anchorEl)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const [selectedApp, setSelectedApp] = useRecoilState(selectedAppState)
  //@ts-ignore
  const [selectedrole, setselectedrole] = useRecoilState(role)
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const [selectedTab, setSelectedTab] = useRecoilState(sidbarSelectionState)
  const [balance, setBalance] = useRecoilState(availableBalanceState)
  const [droppopopen, setdropopoOpen] = useState(false)
  const [openloader, setopenloader] = useRecoilState(loaderStateNew)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  //@ts-ignore
  const [staticTable, setStaticTable] = useRecoilState<{
    name: string
    'primary-key': string
    api: string
    listname: string
    updatePrimaryKey: String
    //@ts-ignore
  }>(staticTableState)

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen)
  }

  const handleModalClose = () => {
    setIsModalOpen(!isModalOpen)
  }

  const handleStaicClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleStaticClose = () => {
    setAnchorEl(null)
  }

  const openStaticDataPop = Boolean(anchorEl)

  //@ts-ignore
  const handleTableClick = (table: (typeof tableList)[0]) => {
    setStaticTable(table)

    navigate('/static')
    // Add navigation or API calls here
    setTimeout(() => {
      window.location.reload()
    }, 500)
    handleClose()
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
      label: 'kyc',
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
    },

    {
      icon: (
        <>
          <IconButton onClick={handleClick}>
            <WaterfallChartIcon
              sx={{
                fontSize: '2vh',
                //@ts-ignore
                color: theme.palette.primary.light,
              }}
            />
          </IconButton>

          <Modal
            open={openStaticDataPop}
            onClose={handleStaticClose}
            closeAfterTransition
            slotProps={{
              backdrop: {
                sx: {
                  backdropFilter: 'blur(5px)',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                },
              },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 300,
                maxHeight: 400,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 2,
                overflowY: 'auto',
              }}
            >
              <Typography textAlign="center" variant="h6" sx={{ mb: 1 }}>
                <b>Select Table</b>
              </Typography>
              <List>
                {static_list.map((table, index) => (
                  <ListItem
                    button
                    key={index}
                    onClick={() => {
                      handleTableClick(table)
                      handleStaticClose()
                    }}
                  >
                    <ListItemText
                      sx={{
                        alignContent: 'center',
                        textAlign: 'center',
                      }}
                      primary={table.listname}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Modal>
        </>
      ),
      label: 'Static',
    },
  ]

  const handleClose = () => {
    setdropopoOpen(false)
    setdropopoOpen(false)
  }
  let [loader, setLoader] = useRecoilState(loaderState)
  let trx_service = new TransactionService()

  useEffect(() => {
    trx_service.getBalanceEnquiry().then((data) => {
      setBalance(data as any)
    })

    setTimeout(() => {
      setLoader(false)
    }, 2000)
  }, [loader])

  useEffect(() => {
    setTimeout(() => {
      setOpen(false)
    }, 2000)
  }, [open])

  const handleSidebarClick = (text: any) => {
    setSelectedApp(text)
  }

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
          //@ts-ignore
          widthh: '100%',
          height: '7%',
          paddingBottom: 0,
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', px: 2, py: 1 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img src={LogoWhite} alt="Logo" style={{ height: 60 }} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Available Balance :
                </Typography>
                <Typography variant="body1">
                  ₹{balance}
                </Typography>
              </Box>

              <IconButton
                onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
                color="inherit"
              >
                {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Box>
          </Box>


          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: '30px',
              borderColor: '#1C58F2',
              backgroundColor: 'primary',
              border: '1px solid #D1DDFC',
              padding: '7px',
              paddingRight: '10px',
              // boxShadow: "5px 5px 5px #888888",
              marginBottom: '6px',
            }}
          >
            {selecteCountryState == 'SA' ? (
              <>
                <Avatar>
                  {<strong>{local_service?.get_staff_access().staffFirstName[0] + local_service?.get_staff_access().staffLastName[0]}</strong>}
                </Avatar>

                <Box ml={1}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontFamily: 'sans-serif',
                      fontSize: '12px',
                      color: 'white',
                    }}
                  >
                    <strong>{local_service?.get_staff_access().staffFirstName + ' ' + local_service?.get_staff_access().staffLastName}</strong>
                  </Typography>

                  <Stack direction="row">
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontFamily: 'sans-serif',
                        fontSize: '11px',
                        color: 'white',
                      }}
                    >
                      <strong>{local_service?.get_staff_access().staffId}</strong>
                    </Typography>

                    {/*                   <Za
                    style={{
                      height: '20px',
                      width: '25px',
                      marginLeft: '5%',
                      // padding: '10px',
                      borderRadius: '30%',
                    }}
                  /> */}
                  </Stack>
                </Box>
              </>
            ) : (
              <>
                {/* {local_service.get_user()?.firstName?(
local_service.get_user()?.firstName[0]


            ):(L)} */}
                {/* <Avatar >{local_service.get_user()?.firstName[0] + " " + local_service.get_user()?.lastName[0]}</Avatar> */}

                <Box ml={1}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontFamily: 'sans-serif',
                      fontSize: '12px',
                      color: 'white',
                    }}
                  >
                    <strong>{local_service?.get_staff_access()?.staffFirstName + ' ' + local_service?.get_staff_access()?.staffLastName}</strong>
                  </Typography>

                  <Stack direction="row">
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontFamily: 'sans-serif',
                        fontSize: '11px',
                        color: 'white',
                      }}
                    >
                      <strong>{local_service?.get_staff_access()?.staffId}</strong>
                    </Typography>
                    {/* 
                  <In
                    style={{
                      height: '20px',
                      width: '25px',
                      marginLeft: '5%',
                      // padding: '10px',
                      borderRadius: '30%',
                    }}
                  /> */}
                  </Stack>
                </Box>
              </>
            )}
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
              height: '100vh',
              position: 'fixed', // Makes the sidebar stay fixed in place
              top: 80, // Stick to the top of the viewport
              left: 0, // Stick to the left of the viewport
              overflow: 'hidden',
              boxShadow: '2px 0 5px rgba(0,0,0,0.3)',
              transition: 'width 0.3s', // Smooth transition for open/close
              zIndex: 1500, // Ensure it's above other elements
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between', // Space items out, so logout stays at the bottom
            }}
          >
            <List
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                textAlign: 'center',
                height: '100%',
                '@media (max-height: 700px)': {
                  maxHeight: 'calc(100vh - 80px)', // Adjust based on AppBar height
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
                  }}
                  onClick={() => {
                    handleSidebarClick(item.label)

                    if (item.label.toLocaleLowerCase() != 'static') {
                      navigate(item.label.toLocaleLowerCase())
                    }
                  }}
                >
                  <Stack>
                    <Item>
                      <ListItemIcon
                        sx={{
                          textAlign: 'center',
                          justifyContent: 'center',
                          //@ts-ignore
                          color: selectedApp === item.label ? theme.palette.primary.main : 'inherit', // Change color if selected
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
                      {item.label}
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
                  // Push this item to the end
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
                      <LogoutIcon sx={{ color: 'red' }} />
                    </ListItemIcon>
                  </Item>
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

            {/* Logout icon */}

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
              paddingLeft: '5%',
              marginLeft: 0, // Prevent the sidebar from affecting the content
            }}
          >
            <MainContent >
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