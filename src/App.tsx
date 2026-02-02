import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import DashboardLayout from './components/shared-layout'
import ResetPasswordPage from './pages/resetpassword'
import ProtectedRoute, { ProtectedRouteProps } from './helpers/protected-route'
import UserAdd from './pages/user-add'
import Login from './pages/newlogin'
import type {} from '@mui/x-data-grid/themeAugmentation'
import ReportIcon from '@mui/icons-material/Report'
// import Login from './pages/login'
// import Dashboard from './pages/dashboard'
// import { getToken, onMessage } from 'firebase/messaging'
// import Message from './components/message/index'
// import LoaderBackdrop from './components/loader/loader'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ThemeProvider } from '@emotion/react'
import { createTheme } from '@mui/material/styles'
import TransactionListing from './pages/transaction/index'
import CustomSnackbar from './components/customsnackbar/snackbar'
import KYCPage from './pages/kyc'
import ApplicantPage from './pages/applicant'
import ApplicantEnquiry from './pages/applicant-enquiry'
import AddApplicant from './pages/add-applicant'
import BeneficiaryDetailPage from './pages/beneficiary-detail'
import SendMoneyPage from './pages/send-money'
import MainTabsPage from './pages/static-data/staticdata.page'
import ReconPage from './pages/transaction/recon'
import GifModal from './components/successModal'
import BopScreen from './components/bop-screen'
import BopTable from './pages/bop-table'
import UtilizationEnquiryForm from './pages/utilization'
import UserTable from './pages/users'
import ModuleTable from './pages/module-list'
import RoleManagement from './pages/roles-list'
import ReconScreen from './pages/recon-screen'
import StaticData from './pages/static-data/staticdata.page'
import Dashboard from './pages/dashboard/dashboard.page'
import CdiScreen from './pages/cdi'
import { inactivityTiming, themeModeState } from '@/states/state'
import { useRecoilState } from 'recoil'
import { CssBaseline } from '@mui/material'
import SarbErrorsListing from './pages/sarb-errors'
import Loyality from './pages/loyality'
import AuditLogTable from './pages/audit-log'
import FieldValidationTable from './pages/field-validation'
import ForexBranchesPage from './pages/branches'
import { lazy, useCallback, useEffect } from 'react'
import { useAutoLogout } from './helpers/useAutoLogout'
import { LocalStorageService } from './helpers/local-storage-service'
import { CrossBorderPaymentsDashboard } from './pages/dashboard'
import EnhancedDashboard from './pages/dashboard/dashboard-new'
import GenderMaster from './pages/gendermaster'
import ChannelManagement from './components/channelmaster'
import StateManagement from './pages/state-manegment'
import ProductManagement from './pages/productMaster'
import ServiceManagement from './pages/ServiceManagement'
import SubServiceManagement from './pages/subService'
import BankMasterScreen from './pages/bank-master'
import BankTypeMaster from './pages/bank-type-master'
import BopCategoryMaster from './pages/bopcategorymaster'
import BopCategoryTypeMaster from './pages/bopcategorytypemaster'
import CountryBusinessPayoutPartnerFormDialog from './components/countrybuisnesspayoutformformdialog'
import CountryBusinessPayoutPartner from './pages/country-business-payout-partners'
import ProductBusinessCountryMapping from './pages/product-buisness-country-mapping'
import EmailTemplateMasterPage from './pages/emailtemplatelist'
import ScreenMaster from './pages/ScreenMaster/ScreenMaster'
import WhatsappTemplateManagement from './pages/whatsAppTemplateMaster'
import SmsTemplateManagement from './pages/smsTemplateMaster'
import EmailTemplateManagement from './pages/emailTemplateMaster'

function App() {
  const defaultProtectedRouteProps: Omit<ProtectedRouteProps, 'outlet'> = {
    authenticationPath: '/login',
  }
  const [mode, setMode] = useRecoilState(themeModeState)
  const [inactivity, setinactivityTiming] = useRecoilState(inactivityTiming)
  const local_service: any = new LocalStorageService()

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#0061B1',
        light: '#CDEDFF',
      },
      secondary: {
        main: '#0A1C2C',
        light: '#c2d9eeff',
      },
      text: {
        primary: mode === 'dark' ? '#ffffff' : '#0A1C2C',
        secondary: mode === 'dark' ? '#B0BEC5' : '#455A64',
      },
    },
    typography: {
      fontFamily: "'Roboto', 'Arial', sans-serif",
      h1: { color: 'text.primary' },
      h2: { color: 'text.primary' },
      h3: { color: 'text.primary' },
      h4: { color: 'text.primary' },
      h5: { color: 'text.primary' },
      h6: { color: 'text.primary' },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'dark' ? '#0B151D' : 'white',
            color: mode === 'dark' ? '#fff' : '#000',
            transition: 'all 0.3s ease',
          },
          /* Hide scrollbar globally */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',

          '#root': {
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            '& .super-app-theme--header': {
              backgroundColor: '#005099',
              color: '#fff',
            },
            '& .MuiDataGrid-row:nth-of-type(even)': {
              backgroundColor: mode === 'dark' ? '#143752' : '#e3f2fd',
            },
            // '& .MuiDataGrid-row.Mui-selected': {
            //   backgroundColor: mode === 'dark' ? '#fff' : '#BBDEFB',
            // },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#0A1C2C' : '#ffffff',
            transition: 'background-color 0.3s ease',
          },
        },
      },
    },
  })

  const handleLogout = useCallback(() => {
    if (local_service?.get_accesstoken() != null) {
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    }
  }, [])
  const INACTIVITY_TIME = 10 * 60 * 1000 // 1 minutes
  // ✅ Enable auto logout (30 min inactivity)
  useAutoLogout(handleLogout, Number(inactivity) * 60000 > INACTIVITY_TIME ? Number(inactivity) * 60000 : INACTIVITY_TIME)

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* <LoaderBackdrop /> */}
        {/* <Message /> */}
        <ToastContainer />
        <CustomSnackbar />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<DashboardLayout />} />}>
              <Route index element={<Dashboard />}></Route>
              <Route path="dash" element={<EnhancedDashboard />} />
              <Route path="transaction" element={<TransactionListing />} />
              <Route path="sendmoney" element={<SendMoneyPage />} />
              <Route path="kyc" element={<KYCPage />} />
              <Route path="kyc/:id" element={<KYCPage />} />
              <Route path="cdi" element={<CdiScreen />} />
              <Route path="loyalty" element={<Loyality />} />
              <Route path="profile" element={<UserTable />} />
              <Route path="profile/add" element={<UserAdd />} />
              <Route path="profile/edit/:staffId" element={<UserAdd />} />
              <Route path="applicant-details/:applicantId" element={<ApplicantPage />} />
              <Route path="applicant" element={<ApplicantEnquiry />} />
              <Route path="add-applicant" element={<AddApplicant />} />
              <Route path="recon" element={<ReconPage />} />
              <Route path="utilization" element={<UtilizationEnquiryForm />} />
              <Route path="beneficiary-details/:beneficiaryId" element={<BeneficiaryDetailPage />} />
              <Route path="configuration" element={<MainTabsPage />} />f
              <Route path="users/add" element={<UserAdd />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="bop-details/:transactionId/:transaction_attempt" element={<BopScreen />} />
              <Route path="bop" element={<BopTable />} />
              <Route path="static" element={<StaticData />} />
              <Route path="recon-trx" element={<ReconScreen />} />
              <Route path="module" element={<ModuleTable />} />
              <Route path="role" element={<RoleManagement />} />
              <Route path="sarberrors" element={<SarbErrorsListing />} />
              <Route path="audit-logs" element={<AuditLogTable />} />
              <Route path="field-validation" element={<FieldValidationTable />} />
              <Route path="static-gender" element={<GenderMaster />} />
              <Route path="states" element={<StateManagement />} />
              <Route path="banks-master" element={<BankMasterScreen />} />
              <Route path="bank-type" element={<BankTypeMaster />} />
              <Route path="product" element={<ProductManagement />} />
              <Route path="service" element={<ServiceManagement />} />
              <Route path="whatsapp" element={<WhatsappTemplateManagement />} />
              <Route path="smsmanegement" element={<SmsTemplateManagement />} />
              <Route path="email-manegement" element={<EmailTemplateManagement />} />
              {/* EmailTemplateManagement */}
              <Route path="subservice" element={<SubServiceManagement />} />
              <Route path="channel" element={<ChannelManagement />} />
              <Route path="screen" element={<ScreenMaster />} />
              <Route path="branches" element={<ForexBranchesPage />} />
              <Route path="bopcategory" element={<BopCategoryMaster />} />
              <Route path="bop-category-type" element={<BopCategoryTypeMaster />} />
              <Route path="bop-category-type" element={<BopCategoryTypeMaster />} />
              <Route path="product-buisness-mapping" element={<ProductBusinessCountryMapping />} />
              <Route path="business-railand-partner" element={<CountryBusinessPayoutPartner />} />
              <Route path="email-template" element={<EmailTemplateMasterPage />} />
              <Route path="business-railand-partner" element={<CountryBusinessPayoutPartner />} />
              <Route path="*" element={<Dashboard />} />
            </Route>

            <Route path="login" element={<Login />} />
            <Route path="transaction/response" element={<GifModal />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  )
}

export default App

function handleLogout(): void {
  throw new Error('Function not implemented.')
}
