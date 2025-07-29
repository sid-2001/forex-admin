import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import DashboardLayout from './components/shared-layout'
import ResetPasswordPage from './pages/resetpassword'
import ProtectedRoute, { ProtectedRouteProps } from './helpers/protected-route'
import IndexPage from './pages/defaultpage'
import UserAdd from './pages/user-add'
import Login from './pages/newlogin'
import Cdiscreen from './pages/cdi'

// import Login from './pages/login'
// import Dashboard from './pages/dashboard'
// import { RecoilRoot } from 'recoil'
// import CreateDriver from './pages/add-driver'
// import favicon from '../src/assets/images/new-logo.png'
// import { Schedule } from '@mui/icons-material'
// import Scheduler from './pages/scheduler'
// import { getToken, onMessage } from 'firebase/messaging'
// import Message from './components/message/index'
// import LoaderBackdrop from './components/loader/loader'
// import ApplicantPage from './pages/applicant'
// import BeneficiaryTable from './components/beneficiary-table'

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
import AddBeneficiary from './pages/add-beneficiary'
import BeneficiaryDetailPage from './pages/beneficiary-detail'
import BeneficiaryEnquiry from './pages/beneficiary-enquiry'
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

function App() {
  const defaultProtectedRouteProps: Omit<ProtectedRouteProps, 'outlet'> = {
    authenticationPath: '/login',
  }

  const theme = createTheme({
    palette: {
      primary: {
        main: '#0061B1',
        light: '#CDEDFF',
      },
      secondary: {
        main: '#323232',
        light: 'white',
      },
    },
    typography: {
      fontFamily: "'Roboto', 'Arial', sans-serif",
    },
  })

  return (
    <>
      <ThemeProvider theme={theme}>
        <ToastContainer />
        <CustomSnackbar />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<DashboardLayout />} />}>
              <Route path="transaction" element={<TransactionListing />} />
              <Route path="sendmoney" element={<SendMoneyPage />} />
              <Route path="kyc" element={<KYCPage />} />
              <Route path="kyc/:id" element={<KYCPage />} />
              <Route path="cdi" element={<CdiScreen />} />
              <Route path="profile" element={<UserTable />} />
              <Route path="profile/add" element={<UserAdd />} />
              <Route path="profile/edit/:staffId" element={<UserAdd />} />
              <Route path="applicant-details/:applicantId" element={<ApplicantPage />} />
              <Route path="applicant" element={<ApplicantEnquiry />} />
              <Route path="add-applicant" element={<AddApplicant />} />
              <Route path="add-beneficiary/:id" element={<AddBeneficiary />} />
              <Route path="recon" element={<ReconPage />} />
              <Route path="utilization" element={<UtilizationEnquiryForm />} />
              <Route path="beneficiary-details/:beneficiaryId" element={<BeneficiaryDetailPage />} />
              <Route path="beneficiary" element={<BeneficiaryEnquiry />} />
              <Route path="configuration" element={<MainTabsPage />} />
              <Route path="users/add" element={<UserAdd />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="bop-details/:transactionId/:transaction_attempt" element={<BopScreen />} />
              <Route path="bop" element={<BopTable />} />
              <Route path="static" element={<StaticData />} />
              <Route path="recon-trx" element={<ReconScreen />} />
              <Route path="module" element={<ModuleTable />} />
              <Route path="role" element={<RoleManagement />} />
              <Route path="*" element={<IndexPage />} />
            </Route>

            <Route path="login" element={<Login />} />
            <Route path="transaction/create" element={<GifModal />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  )
}

export default App
