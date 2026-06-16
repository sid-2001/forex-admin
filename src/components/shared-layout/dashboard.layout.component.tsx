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
} from '@mui/material'
import { styled } from '@mui/system'
import { LogoWhite } from '@/assets/images'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import Person2Icon from '@mui/icons-material/Person2'
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'
import { menuHistoryState, themeModeState } from '@/states/state'
import { LocalStorageService } from '@/helpers/local-storage-service'
import AddToQueueIcon from '@mui/icons-material/AddToQueue'
import CompactLocationBar from '../location'
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
import { useState, useEffect } from 'react'
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
import { LanguagesIcon, QrCodeIcon } from 'lucide-react'
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

  const getFlag = (code: string) => (code ? code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0))) : '🏳️')

  /** 🔹 Auto select first country if not selected */
  useEffect(() => {
    if (!staff.staffCountry && staff.staffCountries?.length) {
      local_service.set_usercountry(staff.staffCountries[0])
    }
  }, [staff])

  const selectedCountry = local_service.get_staff_country()

  return (
    <Typography>
      <Stack direction="row" alignItems="center" spacing={0.6} sx={{ mt: '2px' }}>
        {/* 🔹 MULTIPLE COUNTRIES → DROPDOWN */}
        {staff.staffCountries?.length > 1 ? (
          <Select
            size="small"
            value={selectedCountry}
            onChange={(e) => {
              local_service.set_usercountry(e.target.value)
              window.location.reload()
            }}
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
              <Typography sx={{ fontSize: { xs: '12px', md: '1.5vh' } }}>{getFlag(selectedCountry)}</Typography>
              <Typography
                sx={{
                  fontSize: { xs: '12px', md: '1.5vh' },
                  color: 'white',
                  whiteSpace: 'nowrap',
                }}
              >
                {countryNames[selectedCountry] || selectedCountry}
              </Typography>
            </>
          )
        )}
      </Stack>
    </Typography>
  )
}

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
]

const chunkArray = (arr: any[], size: number) => {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

const MasterDropdownIcon = ({ setSelectedApp, addToHistory, selectedApp }: any) => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleClose = () => setOpen(false)

  const handleNavigate = (item: any) => {
    setSelectedApp(item.label)
    addToHistory(item.label)
    navigate(item.path)
    handleClose()
  }

  const menuChunks = chunkArray(MASTER_MENU, 10)

  return (
    <>
      <Box sx={{ color: 'white', fontColor: 'white' }}>
        <IconButton onClick={() => setOpen(true)}>
          <BubbleChartIcon color="primary" sx={{ color: 'white', fontColor: 'white' }} />
        </IconButton>
        Masterdata
      </Box>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto', // 🔥 horizontal scroll if many columns
          }}
        >
          {menuChunks.map((group, index) => (
            <Box
              key={index}
              sx={{
                minWidth: 300,
                borderRight: index !== menuChunks.length - 1 ? '1px solid #eee' : 'none',
                pr: 1,
              }}
            >
              {group.map((item) => (
                <MenuItem key={item.name} selected={selectedApp === item.label} onClick={() => handleNavigate(item)}>
                  <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </MenuItem>
              ))}
            </Box>
          ))}
        </DialogContent>
      </Dialog>
    </>
  )
}

const DashboardLayout = () => {
  const [mode, setMode] = useRecoilState(themeModeState)
  const [open, setOpen] = useRecoilState(alertState)
  const staffCountry = local_service?.get_staff_country()
  const [selectedApp, setSelectedApp] = useRecoilState(selectedAppState)
  const [openloader, setopenloader] = useRecoilState(loaderStateNew)
  const [isDrawerOpen, setDrawerOpen] = useState(false)

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
      name: 'Users',
    },
    {
      icon: (
        <>
          <EmojiEventsIcon
            sx={{
              //@ts-ignore
              fontSize: '2vh',
              //@ts-ignore
              color: theme.palette.primary.light, // Corrected theme usage
            }}
          />
        </>
      ),
      label: 'Rewards',
      name: 'Rewards',
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
      name: staffCountry === 'UAE' ? 'PaymentInfo' : 'BOP',
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
      name: 'Staff',
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
                <>
                  {!(
                    (item.name === 'KYC' ||
                      item.name === 'CDI' ||
                      item.name === 'Error Codes' ||
                      item.name === 'Loyalty' ||
                      item.name === 'Audit-Logs' ||
                      item.name === 'Static Data') &&
                    staffCountry === 'UAE'
                  ) && (
                    <ListItem
                      button
                      selected={selectedApp === item.label}
                      key={index}
                      id={'imp-' + item.label}
                      sx={{
                        justifyContent: isDrawerOpen ? 'flex-start' : 'center',
                        textAlign: 'center',
                        alignItems: 'center',
                        backgroundColor: 'transparent',
                      }}
                      onClick={() => {
                        setSelectedApp(item.label)
                        addToHistory(item.label)
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
                  )}
                </>
              ))}

              <ListItem
                button
                id="imp-master-data"
                key="logout1"
                sx={{
                  textAlign: 'center',
                  alignItems: 'center',
                }}
              >
                <Stack
                  sx={{
                    textAlign: 'center',
                    width: '100%',
                  }}
                >
                  <MasterDropdownIcon
                    //@ts-ignore
                    setSelectedApp={setSelectedApp}
                    addToHistory={addToHistory}
                    //@ts-ignore
                    selectedApp={selectedApp}
                    item={undefined}
                  ></MasterDropdownIcon>
                </Stack>
              </ListItem>
            </List>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#b0b0b0',
                borderRadius: '4px',
              },
              width: '100vw',
              padding: '2%',
              paddingLeft: '1 %',
              // marginLeft: 0, // Prevent the sidebar from affecting the content
            }}
          >
            <MainContent>
              <Header>
                <Typography variant="h5"></Typography>
              </Header>
              <Outlet />
            </MainContent>
          </Box>
        </Box>
      </DashboardContainer>
    </ThemeProvider>
  )
}

export default DashboardLayout
