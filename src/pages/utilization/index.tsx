import React, { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItem,
  List,
  Paper,
  InputAdornment,
} from '@mui/material'
import { ApplicantService } from '@/services/applicant.service'
import TransactionTable from '../transaction-table'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const UtilizationEnquiryForm: React.FC = () => {
  const [apiType, setApiType] = useState('')
  const [enquiryType, setEnquiryType] = useState('')
  const [searchBy, setSearchBy] = useState<'applicantId' | 'nationalId'>('applicantId')
  const [applicantId, setApplicantId] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [applicantData, setapplicantData] = useState<any>({})
  const [limitData, setLimitData] = useState<any>({})
  const [transactionData, setTranactiondata] = useState([])
  const theme = useTheme()
  const appilicant_service = new ApplicantService()
  const helper = new HelperService()
  const local_service = new LocalStorageService()
  const navigate = useNavigate()
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [searchText, setSearchText] = useState('')
  const [applicantContactDetails, setApplicantContactDetails] = useState([])
  const [userlist, setUserList] = useState<any[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    appilicant_service.getTransactionsByApplicantId(applicantId).then((data) => {
      appilicant_service.getCompliance(applicantId).then((data) => {
        setLimitData(data)
      })
      const formattedData: any = data?.map((transaction: any, index: number) => ({
        ...transaction?.transactionOutward,
        ...transaction?.beneficiary,
        ...transaction?.transactionInwardList,
        ...transaction?.applicant,
        id: index + 1,
        transactionNumber: transaction?.transactionOutward?.transactionNumber,
        sendCountry: transaction?.transactionOutward?.sendCountry,
        receiveCountry: transaction?.transactionOutward?.receiveCountry,
        beneficiaryName: transaction?.beneficiary?.beneficiaryName,
        amount: transaction?.transactionOutward?.principalAmount,
        transactionStatus: transaction?.transactionOutward?.transactionStatus,
        destination: transaction?.transactionOutward?.receiveCountry,
        value: transaction?.transactionOutward?.principalAmount,
        currency: transaction?.transactionOutward?.settlementCurrency,
        settlement: helper.roundToTwoFixed(transaction?.transactionOutward?.principalAmount * transaction?.transactionOutward?.exchangeRates),
        destinationBank: transaction?.transactionOutward?.destinationBankBicCode,
        forex: helper.roundToTwoFixed(transaction?.transactionOutward?.exchangeRates),
        date: transaction?.transactionOutward?.owCreatedDate,
        reporting: transaction?.transactionOutward?.reportingStatus,
        status: transaction?.transactionOutward?.transactionStatus,
        final_amount: helper.roundToTwoFixed(transaction?.transactionOutward?.exchangeRates * transaction?.transactionOutward?.principalAmount),
        applicant: transaction?.applicant,
        //@ts-ignore
        inid: transaction?.transactionInwardNumber,
      }))
      setTranactiondata(formattedData || [])
    })
    appilicant_service.searchByApplicantId(applicantId).then((data: any) => {
      setapplicantData(data)
      console.log(data?.applicant)
    })

    e.preventDefault()
    setShowResults(true)
  }
  useEffect(() => {
    appilicant_service.getApplicantDetalis().then((data: any) => {
      const users = data?.map((e: any) => ({
        applicantId: e.applicant.applicantId,
        id: e.applicant.applicantId,
        name: e.applicant?.firstName,
        accountNumber: e.applicant.applicantId,
      }))
      setUserList(users || [])
    })
  }, [])

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.COMPLIANCE_MONITOR}>
      <Box sx={{ flexGrow: 1, p: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" fontWeight="bold" textAlign="left">
            Limit Utilization
          </Typography>

          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Back
          </Button>
        </Box>
        <Typography
          variant="h5"
          gutterBottom
          //fontWeight="bold"
          textAlign="left"
        >
          Per Applicant
        </Typography>

        <Grid container spacing={0}>
          {/* LEFT SIDE — FORM */}

          <Grid
            item
            xs={12}
            md={6}
            style={{
              width: '90vw',
            }}
          >
            <form onSubmit={handleSubmit}>
              <TextField
                label="Applicant ID"
                fullWidth
                margin="normal"
                value={searchText}
                onChange={(e) => {
                  const input = e.target.value
                  setSearchText(input)

                  if (input.trim() === '') {
                    setFilteredUsers([])
                    setSelectedUser(null)
                    setApplicantId('')
                  } else {
                    const filtered = userlist.filter(
                      (user) => user?.name?.toLowerCase().includes(input.toLowerCase()) || user?.id?.toLowerCase().includes(input.toLowerCase()),
                    )
                    setFilteredUsers(filtered)
                  }
                }}
                placeholder="Type a User name or ID..."
                InputProps={{
                  startAdornment: selectedUser && (
                    <InputAdornment position="start">
                      <Avatar alt={selectedUser.name} sx={{ mr: 1 }}>
                        {selectedUser.name[0]}
                      </Avatar>
                    </InputAdornment>
                  ),
                  readOnly: false,
                }}
              />

              {/* Dropdown list */}
              {filteredUsers.length > 0 && (
                <Paper elevation={3} sx={{ mt: 1, maxHeight: 250, overflowY: 'auto' }}>
                  <List>
                    {filteredUsers.map((user: any) => (
                      <ListItem
                        key={user.applicantId}
                        divider
                        onClick={() => {
                          setSelectedUser(user)
                          setApplicantId(user.applicantId)
                          setSearchText(user.applicantId)
                          setFilteredUsers([])
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar alt={user.name}>{user.name[0]}</Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={user.name} secondary={`ID: ${user.applicantId}`} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}

              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={!applicantId}>
                Submit
              </Button>
            </form>
          </Grid>

          {/* RIGHT SIDE — RESULTS OR NO DATA */}

          {showResults && (
            <Box sx={{ mt: 4, marginRight: 2 }}>
              {/* Applicant Info Row */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    variant="filled"
                    label="Applicant Name"
                    value={applicantData?.applicant?.firstName ?? 'No Data Found'}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    variant="filled"
                    label="Nationality"
                    value={applicantData?.applicant?.nationality ?? 'No Data Found'}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    variant="filled"
                    label="Residence Country"
                    value={applicantData?.applicant?.residentialAddressCountry ?? 'No Data Found'}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    variant="filled"
                    label="Phone"
                    value={applicantData?.applicantContactDetails?.find((c: any) => c.contactType === 'phone')?.contactDetails ?? 'No Data Found'}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>

              {/* Limit Card */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {/* Limit Card - Fixed Small Box */}
                <Grid item xs={12} md={4} lg={3}>
                  <Card
                    sx={{
                      p: 2,
                      background: 'linear-gradient(135deg,rgb(88, 175, 246) 0%,rgb(183, 203, 222) 50%,rgb(221, 226, 235) 100%)',
                      color: 'black',
                      height: '45vh',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6">
                      <b>{apiType}</b>
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                      Maximum Limit: {limitData?.maxLimit ?? 'No Data Found'}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                      Utilised Value: {limitData?.utilizedLimit ?? 'No Data Found'}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                      Avail Value: {limitData?.availableLimit ?? 'No Data Found'}
                    </Typography>
                  </Card>
                </Grid>

                {/* Transactions Table - Flexible, takes remaining space */}
                <Grid item xs={12} md={8} lg={9}>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    Transactions
                  </Typography>
                  <Box sx={{ width: '50%', height: 400 }}>
                    <TransactionTable
                      //@ts-ignore
                      transaction={transactionData}
                      applicantId={applicantId}
                      availabledata={!!applicantData?.firstName}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Grid>
      </Box>
    </HasPermission>
  )
}

export default UtilizationEnquiryForm
