import { ThemeProvider } from '@mui/material/styles'
import {
  Box,
  Typography,
  List,
  ListItem,
  IconButton,
  AppBar,
  ListItemIcon,
  Toolbar,
  Tooltip,
  MenuItem,
  Select,
  ListItemText,
  DialogContent,
  Dialog,
  ListItemButton,
  Collapse,
  TextField,
  InputAdornment,
} from '@mui/material'
import { styled } from '@mui/system'
import { LogoWhite } from '@/assets/images'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useRecoilState, useRecoilValue } from 'recoil'
import Person2Icon from '@mui/icons-material/Person2'
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'
import { menuHistoryState, sidebarMenusState, themeModeState } from '@/states/state'
import { LocalStorageService } from '@/helpers/local-storage-service'
import AddToQueueIcon from '@mui/icons-material/AddToQueue'
import CompactLocationBar from '../location'
import SearchIcon from '@mui/icons-material/Search'

import {
  ArrowBack,
  Brightness4,
  Brightness7,
  CardMembershipRounded,
  CardTravel,
  FilterBAndW,
  HomeRepairServiceRounded,
  LeakRemove,
} from '@mui/icons-material'
import { alertState, selectedAppState, loaderStateNew } from '@/states/state'
import React, { useState, useEffect } from 'react'
import Backdrop from '@mui/material/Backdrop'
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
import LoyaltyIcon from '@mui/icons-material/Loyalty'
import ErrorIcon from '@mui/icons-material/Error'
import ProfileMenu from '../profilesetting'
import RefreshIcon from '@mui/icons-material/Refresh'
import WcIcon from '@mui/icons-material/Wc'
import AirIcon from '@mui/icons-material/Air'
import BubbleChartIcon from '@mui/icons-material/BubbleChart'
import LanguageIcon from '@mui/icons-material/Language'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import ReportIcon from '@mui/icons-material/Report'
import ReportOffIcon from '@mui/icons-material/ReportOff'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing'
// import AssessmentIcon from '@mui/icons-material/Assessment'
import { FolderIcon, GavelIcon, LanguagesIcon, Menu, QrCodeIcon, SettingsIcon } from 'lucide-react'
import WebIcon from '@mui/icons-material/Web'
import MonitorIcon from '@mui/icons-material/Monitor'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import SmsIcon from '@mui/icons-material/Sms'
import EmailIcon from '@mui/icons-material/Email'
import VerifiedIcon from '@mui/icons-material/Verified'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import DescriptionIcon from '@mui/icons-material/Description'
import PublicIcon from '@mui/icons-material/Public'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import BusinessIcon from '@mui/icons-material/Business'
import AssessmentIcon from '@mui/icons-material/Assessment'
import LinkIcon from '@mui/icons-material/Link'
import HandshakeIcon from '@mui/icons-material/Handshake'
import AltRouteIcon from '@mui/icons-material/AltRoute'
import SpeedIcon from '@mui/icons-material/Speed'
import HomeIcon from '@mui/icons-material/Home'
import BadgeIcon from '@mui/icons-material/Badge'
import RuleIcon from '@mui/icons-material/Rule'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip'
import CampaignIcon from '@mui/icons-material/Campaign'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'

const mapMenuIcons: any = {
  Modules: <ViewModuleIcon />,
  Customers: <PeopleOutlineIcon />,
  Rewards: <EmojiEventsIcon />,
  Users: <Person2Icon />,
  Roles: <SupervisedUserCircleIcon />,
  'Transaction Outward': <CompareArrowsIcon />,
  'Transaction Inward': <CompareArrowsIcon />,
  Transactions: <CompareArrowsIcon />,
  BOP: <SourceIcon />,
  'Transaction Dashboard': <CompareArrowsIcon />,
  'Master Data': <BubbleChartIcon />,
  'Regulatory Information': <SourceIcon />,
}

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
  //width: '80%', // Adjusted to fit the screen
  padding: '1rem',
  marginLeft: 120,
})

const MASTER_MENU = [
  // {
  //   label: 'Field-Validation',
  //   name: 'Field-Validation',
  //   icon: <LoyaltyIcon fontSize="small" />,
  //   path: '/field-validation',
  // },
  {
    label: 'Static-Gender',
    name: 'Gender',
    icon: <WcIcon fontSize="small" />,
    path: '/static-gender',
  },
  {
    label: 'Channel',
    name: 'Channels',
    icon: <AirIcon fontSize="small" />,
    path: '/channel',
  },
  {
    label: 'States',
    name: 'States',
    icon: <LanguagesIcon fontSize="small" />,
    path: '/states',
  },
  {
    label: 'Bank-Type',
    name: 'Bank-Type',
    icon: <FilterBAndW fontSize="small" />,
    path: '/bank-type',
  },
  {
    label: 'Bank-Master',
    name: 'Bank-Master',
    icon: <AccountBalanceIcon fontSize="small" />,
    path: 'banks-master',
  },
  {
    label: 'Sub Services',
    name: 'Sub Services',
    icon: <LeakRemove fontSize="small" />,
    path: 'subservice',
  },
  {
    label: 'Services',
    name: 'Service',
    icon: <HomeRepairServiceRounded fontSize="small" />,
    path: 'service',
  },
  {
    label: 'Products',
    name: 'Products',
    icon: <Inventory2Icon fontSize="small" />,
    path: 'product',
  },
  {
    label: 'Bop Category Type',
    name: 'Bop Category',
    icon: <ReportOffIcon fontSize="small" />,
    path: 'bop-category-type',
  },

  {
    label: 'Bop Category',
    name: 'Bop Category',
    icon: <ReportIcon fontSize="small" />,
    path: 'bopcategory',
  },
  {
    label: 'Product Buisness Mapping',
    name: 'Product Buisness Mapping',
    icon: <CardTravel fontSize="small" />,
    path: 'product-buisness-mapping',
  },
  {
    label: 'Buisness Railand Partners',
    name: 'Buisness Railand Partners',
    icon: <CardMembershipRounded fontSize="small" />,
    path: 'business-railand-partner',
  },
  {
    label: 'Forex Currency',
    name: 'Forex Currency',
    icon: <AttachMoneyIcon fontSize="small" />,
    path: 'forex-currency-master',
  },

  {
    label: 'Forex Country',
    name: 'Forex Country',
    icon: <LanguageIcon fontSize="small" />,
    path: 'forex-country-master',
  },
  {
    label: 'Screen Master',
    name: 'Screen master',
    icon: <MonitorIcon fontSize="small" />,
    path: 'screen',
  },
  {
    label: 'WhatsApp Master',
    name: 'WhatsApp master',
    icon: <WhatsAppIcon fontSize="small" />,
    path: 'whatsapp',
  },
  // {
  //   label: 'Sms Master',
  //   name: 'Sms manegement master',
  //   icon: <SmsIcon fontSize="small" />,
  //   path: 'smsmanegement',
  // },
  {
    label: 'Email Master',
    name: 'Email manegement master',
    icon: <EmailIcon fontSize="small" />,
    path: 'email-manegement',
  },
  // {
  //   label: 'Verification Master',
  //   name: 'Email manegement master',
  //   icon: <VerifiedIcon fontSize="small" />,
  //   path: 'verification-partner',
  // },
  {
    label: 'Country Kyc Master',
    name: 'Country Kyc master',
    icon: <FactCheckIcon fontSize="small" />,
    path: 'country-Kyc-doc-management',
  },
  {
    label: 'Terms and Condition',
    name: 'Terms and Condition',
    icon: <DescriptionIcon fontSize="small" />,
    path: 'terms-condition',
  },

  {
    label: 'Country Label Code Master',
    name: 'Country Label Code Master',
    icon: <PublicIcon fontSize="small" />,
    path: 'country-label-code-master',
  },
  {
    label: 'Country label Master',
    name: 'Country label Master',
    icon: <LocationOnIcon fontSize="small" />,
    path: 'country-label-master',
  },
  {
    label: 'Country Reporting Label Master',
    name: 'Country Reporting Label Master',
    icon: <AssessmentIcon fontSize="small" />,
    path: 'country-reporting-label-master',
  },
  {
    label: 'Vendor Master',
    name: 'Vendor Master',
    icon: <BusinessIcon fontSize="small" />,
    path: 'vendorapimaster',
  },
  {
    label: 'Vendor Url Master',
    name: 'Vendor Url Master',
    icon: <LinkIcon fontSize="small" />,
    path: 'urlmaster',
  },
  {
    label: 'vendor master table',
    name: 'vendorapi master table ',
    icon: <HandshakeIcon fontSize="small" />,
    path: 'vendorapimastertable',
  },
  {
    label: 'Country Corridor Page',
    name: 'Country Corridor Page',
    icon: <AltRouteIcon fontSize="small" />,
    path: 'country-corridor-page',
  },
  {
    label: 'Kyc Limit Type',
    name: 'Kyc Limit Type',
    icon: <SpeedIcon fontSize="small" />,
    path: 'kyc-limit-type',
  },
  {
    label: 'Resident Type',
    name: 'Resident Type',
    icon: <HomeIcon fontSize="small" />,
    path: 'resident-type',
  },
  {
    label: 'KYC Document Type',
    name: 'KYC Document Type',
    icon: <BadgeIcon fontSize="small" />,
    path: 'kyc-document-type',
  },
  {
    label: 'Country Limit Type Wise',
    name: 'Country Limit Type Wise',
    icon: <RuleIcon fontSize="small" />,
    path: 'country-limit-type-wise',
  },

  {
    label: 'KYC Document Mapping',
    name: 'Kyc Document Mapping',
    icon: <AccountTreeIcon fontSize="small" />,
    path: 'kyc-doc-mapping',
  },
  {
    label: 'Exchange Rate',
    name: 'Exchange Rate',
    icon: <CurrencyExchangeIcon fontSize="small" />,
    path: 'exchange-rate',
  },
  {
    label: 'Sequence Master',
    name: 'ESequence Master',
    icon: <FormatListNumberedIcon fontSize="small" />,
    path: 'sequence-master',
  },
  {
    label: 'Country Product Code',
    name: 'Country Product Code',
    icon: <QrCodeIcon fontSize="small" />,
    path: 'country-product-code',
  },
  {
    label: 'Product Sub Service',
    name: 'Product Sub Service',
    icon: <PrecisionManufacturingIcon fontSize="small" />,
    path: 'product-subservice',
  },

  {
    label: 'Service Sub Service Mapping',
    name: 'Service Sub Service Mapping',
    icon: <AddToQueueIcon fontSize="small" />,
    path: 'service-sub-service-mapping',
  },
  {
    label: 'Notification Master',
    name: 'Notification Master',
    icon: <NotificationsIcon fontSize="small" />,
    path: 'notifications',
  },
  {
    label: 'Notification Campaign',
    name: 'Notification Campaign',
    icon: <CampaignIcon fontSize="small" />,
    path: 'notification-campaign',
  },
  {
    label: 'Privacy Policy',
    name: 'Privacy Policy',
    icon: <PrivacyTipIcon fontSize="small" />,
    path: 'privacy-policy',
  },
  {
    label: 'Coupons',
    name: 'Coupons',
    icon: <LocalOfferIcon fontSize="small" />,
    path: 'coupons',
  },
  {
    label: 'FAQ',
    name: 'FAQ',
    icon: <LocalOfferIcon fontSize="small" />,
    path: 'faq',
  },

  {
    label: 'Menu Items',
    name: 'Menu Items',
    icon: <LocalOfferIcon fontSize="small" />,
    path: 'menu-items',
  },
  {
    label: 'Group',
    name: 'Group',
    icon: <LocalOfferIcon fontSize="small" />,
    path: 'group',
  },
]

const MasterDropdownIcon = ({ setSelectedApp, addToHistory, selectedApp, childData, onClose, isOpen }: any) => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const handleClose = () => onClose()

  const handleNavigate = (item: any) => {
    setSelectedApp(item.childMenuName)
    addToHistory(item.childMenuName)
    navigate(item.path)
    handleClose()
  }

  const filteredSubMenusData = childData.filter((menuItem: any) => {
    const searchText = search.toLowerCase().trim()

    if (!searchText) return true

    return menuItem?.childMenuName?.toLowerCase().includes(searchText)
  })

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="xs"
      PaperProps={{
        sx: {
          position: 'absolute',
          left: 140,
          top: '25vh',
          bottom: 0,
          margin: 0,
          width: '400px',
          maxWidth: '100%',
          height: '60vh',
          borderRadius: '4px',
        },
      }}
    >
      <DialogContent sx={{ overflow: 'hidden' }}>
        <>
          <TextField
            size="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: 350,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6b7280' }} />
                </InputAdornment>
              ),
            }}
          />

          <Box
            sx={{
              overflowY: 'scroll',
              height: '100%',
              padding: '20px 0px',
            }}
          >
            {filteredSubMenusData.map((item: any, index: number) => (
              <Box key={index}>
                <MenuItem
                  sx={{ paddingLeft: 0, paddingRight: 0 }}
                  key={index}
                  selected={selectedApp === item.childMenuName}
                  onClick={() => handleNavigate(item)}
                >
                  <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.childMenuName} />
                </MenuItem>
              </Box>
            ))}
          </Box>
        </>
      </DialogContent>
    </Dialog>
  )
}

const DashboardLayout = () => {
  const [mode, setMode] = useRecoilState(themeModeState)
  const [open, setOpen] = useRecoilState(alertState)
  const staffCountry = local_service?.get_staff_country()
  const [selectedApp, setSelectedApp] = useRecoilState(selectedAppState)
  const [openloader, setopenloader] = useRecoilState(loaderStateNew)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [openSubMenu, setOpenSubMenu] = useState(false)
  const [submenusData, setSubMenuData] = useState([])

  const sidebarMenus = useRecoilValue(sidebarMenusState)

  const navigate = useNavigate()
  const theme = useTheme()

  const [history, setHistory] = useRecoilState(menuHistoryState)

  // 1. ADD: Adds item to the end (prevents duplicates if desired)
  const addToHistory = (menuName: string) => {
    setHistory((oldHistory) => {
      // if (oldHistory.includes(menuName)) return oldHistory; // Avoid duplicates
      return [...oldHistory, menuName]
    })
  }

  const iconStyle = {
    fontSize: '2vh',
    //@ts-ignore
    color: theme.palette.primary.light,
    '&:hover': {
      //@ts-ignore
      color: theme.palette.primary.main, // Change the color to blue on hover
    },
  }

  const menuItems = [
    {
      icon: <ShowChartIcon sx={iconStyle} />,
      label: 'Dashboard',
      name: 'Dashboard',
    },
    {
      icon: <PeopleOutlineIcon sx={iconStyle} />,
      label: 'Customer',
      name: 'Customers',
    },
    {
      icon: <EmojiEventsIcon sx={iconStyle} />,
      label: 'Rewards',
      name: 'Rewards',
    },
    {
      icon: <CompareArrowsIcon sx={iconStyle} />,
      label: 'Transaction',
      name: 'Transactions',
    },

    {
      icon: <AssessmentIcon sx={iconStyle} />,
      label: 'transaction-dashboard',
      name: 'Transaction Dashboard',
    },

    {
      icon: <ContactEmergencyIcon sx={iconStyle} />,
      label: 'Kyc',
      name: 'KYC',
    },

    {
      icon: <SourceIcon sx={iconStyle} />,
      label: 'Bop',
      name: staffCountry === 'UAE' ? 'Regulatory Information' : 'BOP',
    },
    {
      icon: <Person2Icon sx={iconStyle} />,
      label: 'Profile',
      name: 'Users',
    },
    {
      icon: <SupervisedUserCircleIcon sx={iconStyle} />,
      label: 'Role',
      name: 'Roles',
    },
    {
      icon: <ViewModuleIcon sx={iconStyle} />,
      label: 'Module',
      name: 'Modules',
    },

    {
      icon: <AccountBalanceIcon sx={iconStyle} />,
      label: 'Cdi',
      name: 'CDI',
    },

    {
      icon: <WaterfallChartIcon sx={iconStyle} />,
      label: 'Static',
      name: 'Static Data',
    },

    {
      icon: <ErrorIcon sx={iconStyle} />,
      label: 'SarbErrors',
      name: 'Error Codes',
    },

    {
      icon: <LoyaltyIcon sx={iconStyle} />,
      label: 'Loyalty',
      name: 'Loyalty',
    },

    {
      icon: <LoyaltyIcon sx={iconStyle} />,
      label: 'Audit-Logs',
      name: 'Audit-Logs',
    },
  ]

  useEffect(() => {
    setTimeout(() => {
      setOpen(false)
    }, 2000)
  }, [open])

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
                  id="imp-change-appearence"
                  onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
                  color="inherit"
                  sx={{
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'rotate(180deg)' },
                    marginLeft: '7%',
                  }}
                >
                  {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
              </Tooltip>

              <IconButton
                onClick={() => {
                  window.location.reload()
                }}
                color="inherit"
                sx={{
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'rotate(180deg)' },
                  marginLeft: '7%',
                }}
              >
                {mode === 'dark' ? <RefreshIcon /> : <RefreshIcon />}
              </IconButton>

              <IconButton
                onClick={() => {
                  window.history.back()
                  setSelectedApp(history[history.length - 2])
                }}
                color="inherit"
                sx={{
                  transition: 'transform 0.3s',
                  // '&:hover': { transform: 'rotate(180deg)' },
                  marginLeft: '7%',
                }}
              >
                {mode === 'dark' ? <ArrowBack /> : <ArrowBack />}
              </IconButton>
              {/* <Box sx={{ display: 'flex', alignItems: 'center', justifyContent:"center",  gap: 2 }}>

                    <CompactLocationBar />
              </Box> */}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, textAlign: 'center' }}>
              <Link to="/dashboard">
                <img
                  src={LogoWhite}
                  alt="Logo"
                  style={{
                    maxHeight: '6vh',
                    width: 'auto',
                    objectFit: 'contain',
                    // marginLeft:"10%"t
                  }}
                />
              </Link>
            </Box>

            {/* Right side - Profile box (MADE RESPONSIVE) */}

            <ProfileMenu></ProfileMenu>
          </Box>
        </Toolbar>
      </AppBar>
      <DashboardContainer>
        {/* <Box sx={{ position: 'relative' }}> */}
        {/* Sidebar */}

        <Box
          sx={{
            width: isDrawerOpen ? 200 : 120,
            //@ts-ignore
            backgroundColor: theme.palette.secondary.main,
            position: 'fixed',
            top: '10vh',
            left: 0,
            height: 'calc(100vh - 10vh)',
            overflowY: 'auto',
            boxShadow: '2px 0 5px rgba(0,0,0,0.3)',
            transition: 'width 0.3s',
            // display: 'flex',
            // flexDirection: 'column',
            // justifyContent: 'space-between',
            zIndex: 1500,
          }}
        >
          <List>
            <ListItemButton
              id="imp-master-data"
              onClick={() => {
                setSelectedApp('Dashboard')
                addToHistory('Dashboard')
                navigate('/dashboard')
              }}
              selected={selectedApp === 'Dashboard'}
            >
              <Stack direction="column" alignItems="center" justifyContent="center" width="100%" spacing={1.5}>
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <ShowChartIcon />
                </ListItemIcon>

                <Typography variant="body1" align="center" color="#fff">
                  Dashboard
                </Typography>
              </Stack>
            </ListItemButton>
            {[...sidebarMenus].map((item: any, index: any) => (
              <React.Fragment key={index}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={selectedApp === item.menuName}
                    onClick={() => {
                      if (item.children.length > 0) {
                        setOpenSubMenu(true)
                        setSubMenuData(item.children)
                      } else {
                        setSelectedApp(item.parentMenuName)
                        addToHistory(item.parentMenuName)
                        navigate(item.path.toLowerCase())
                      }
                    }}
                  >
                    <Stack direction="column" alignItems="center" justifyContent="center" width="100%" spacing={1.5}>
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          justifyContent: 'center',
                          color: '#fff',
                        }}
                      >
                        {/* {item.icon} */}
                        {mapMenuIcons[item.menuName]}
                      </ListItemIcon>

                      <Typography variant="body1" align="center" color="#fff">
                        {item.menuName}
                      </Typography>
                    </Stack>
                  </ListItemButton>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Box>

        <Box
          sx={{
            // width: 'calc(100vw - 120px)',
            // flexGrow: 1,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#b0b0b0',
              borderRadius: '4px',
            },
            // width: '100vw',
            // padding: '2%',
            // paddingLeft: '1%',

            // marginLeft: 0, // Prevent the sidebar from affecting the content
          }}
        >
          <MainContent>
            <Outlet />
          </MainContent>
        </Box>
        {/* </Box> */}

        {openSubMenu && (
          <MasterDropdownIcon
            //@ts-ignore
            setSelectedApp={setSelectedApp}
            addToHistory={addToHistory}
            //@ts-ignore
            selectedApp={selectedApp}
            childData={submenusData}
            onClose={() => setOpenSubMenu(false)}
            isOpen={openSubMenu}
          />
        )}
      </DashboardContainer>
    </ThemeProvider>
  )
}

export default DashboardLayout
