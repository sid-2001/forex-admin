// import { useState ,useEffect} from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import DashboardLayout from './components/shared-layout'
import ResetPasswordPage from './pages/resetpassword'
import ProtectedRoute, { ProtectedRouteProps } from './helpers/protected-route'
import IndexPage from './pages/defaultpage'
import DriverList from './pages/list-driver'
import UserAdd from './pages/user-add'
import LogsList from './pages/log-list'
import NewLog from './pages/add-log'
import Login from './pages/newlogin'
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
import NewTransactionPage from './pages/transaction/index'
import CustomSnackbar from './components/customsnackbar/snackbar'
import KYCPage from './pages/kyc'
import ApplicantPage from './pages/applicant'
import ApplicantEnquiry from './pages/applicant-enquiry'
import AddApplicant from './pages/add-applicant'
import AboutBeneficiary from './pages/beneficiary-about'
import AddBeneficiary from './pages/add-beneficiary'
import BeneficiaryDetailPage from './pages/beneficiary-detail'
import BeneficiaryEnquiry from './pages/beneficiary-enquiry'
import SendMoneyPage from './pages/send-money'
import MainTabsPage from './pages/static-data/staticdata.page'
import CurrencyBarChart from './pages/dashboard/dashboard.page'
import ReconPage from './pages/transaction/recon'
import GifModal from './components/successModal'
import ChargesDataGridTable from './pages/add-charges'
import ListCharges from './pages/list-chages'
import BopScreen from './components/bop-screen'
import BopTable from './pages/bop-table'
import UtilizationEnquiryForm from './pages/utilization'
import UserTable from './pages/users'
import ModuleTable from './pages/module-list'
import RoleManagement from './pages/roles-list'

function App() {
  const defaultProtectedRouteProps: Omit<ProtectedRouteProps, 'outlet'> = {
    authenticationPath: '/login',
  }

  // useEffect

  // async function requestPermission() {
  //   //requesting permission using Notification API
  //   const permission = await Notification.requestPermission()

  //   if (permission === 'granted') {
  //     console.log('permisson granted')
  //     const token = await getToken(messaging, {
  //       vapidKey: 'BDnysNJ5LJGYRzOzC34uilCBPDGsAOaxaAGDc7iIC-5Gfpu5GqjCjOBzQebay2-glPK-ewZjlDtKYUH91hCLfPg',
  //     })
  //     console.log(token)

  //     //We can send token to server
  //     console.log('Token generated : ', token)
  //   } else if (permission === 'denied') {
  //     //notifications are blocked
  //     alert('You denied for the notification')
  //   }
  // }

  // onMessage(messaging, (payload) => {
  //   toast(<Message notification={payload.notification} />)
  // })

  // useEffect(() => {
  //   requestPermission()
  // }, [])

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
      fontFamily: "'Roboto', 'Arial', sans-serif"
    },
  })

  return (
    <>
      <ThemeProvider theme={theme}>
        <ToastContainer />
        <CustomSnackbar />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute {...defaultProtectedRouteProps}
              outlet={<DashboardLayout />} />}>
              <Route path="transaction" element={<NewTransactionPage />} />
              <Route path="sendmoney" element={<SendMoneyPage />} />
              <Route path="kyc" element={<KYCPage />} />
              <Route path="profile" element={<UserTable />} />
              <Route path="profile/add" element={<UserAdd />} />
              <Route path="profile/edit/:staffId" element={<UserAdd />} />
              <Route path="applicant-details/:applicantId" element={<ApplicantPage />} />
              <Route path="applicant" element={<ApplicantEnquiry />} />
              <Route path="add-applicant" element={<AddApplicant />} />
              <Route path="about-beneficiary" element={<AboutBeneficiary />} />
              <Route path="add-beneficiary/:id" element={<AddBeneficiary />} />
              <Route path="recon" element={<ReconPage />} />
              <Route path="utilization" element={<UtilizationEnquiryForm />} />
              <Route path="charges/add" element={<ChargesDataGridTable />} />
              <Route path="list-charges" element={<ListCharges />} />
              <Route path="beneficiary-details/:beneficiaryId" element={<BeneficiaryDetailPage />} />
              <Route path="beneficiary" element={<BeneficiaryEnquiry />} />
              <Route path="configuration" element={<MainTabsPage />} />
              <Route path="driver" element={<DriverList />} />
              <Route path="users/add" element={<UserAdd />} />
              <Route path="price" element={<CurrencyBarChart />} />
              <Route path="bop-details/:transactionId/:transaction_attempt" element={<BopScreen />} />
              <Route path="bop" element={<BopTable />} />
              <Route path="logs" element={<LogsList />} />
              <Route path="logs/add" element={<NewLog />} />
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
