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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [searchText, setSearchText] = useState('')
  const [applicantContactDetails, setApplicantContactDetails] = useState([]);
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
      setapplicantData(data?.applicant)
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
          <Typography
            variant="h4"
            gutterBottom
            fontWeight="bold"
            textAlign="left"
          >
            Limit Utilization Enquiry
          </Typography>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
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

        <Grid container spacing={50}>
          {/* LEFT SIDE — FORM */}

          <Grid
            item
            xs={12}
            md={6}
            style={{
              width: '100vw',
            }}
          >
            <form onSubmit={handleSubmit}>
              {/* <FormControl fullWidth margin="normal">
                <InputLabel id="enquiry-type-label">Enquiry Type</InputLabel>
                <Select
                  labelId="enquiry-type-label"
                  id="enquiry-type"
                  value={enquiryType}
                  label="Enquiry Type"
                  onChange={(e: SelectChangeEvent) => setEnquiryType(e.target.value)}
                >
                  <MenuItem value="utilization">Utilization</MenuItem>
                  <MenuItem value="limit">Limit</MenuItem>
                </Select>
              </FormControl> */}
              {/* <FormControl component="fieldset" margin="normal">
                <RadioGroup row value={searchBy} onChange={(e) => setSearchBy(e.target.value as 'applicantId' | 'nationalId')}>
                  <FormControlLabel value="applicantId" control={<Radio />} label="Applicant ID" />
                </RadioGroup>
              </FormControl> */}

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
                      (user) =>
                        user?.name?.toLowerCase().includes(input.toLowerCase()) ||
                        user.id.toString().includes(input)
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
              <FormControl fullWidth margin="normal">
                <InputLabel id="api-type-label">API Type</InputLabel>
                <Select
                  labelId="api-type-label"
                  id="api-type"
                  value={apiType}
                  label="API Type"
                  onChange={(e: SelectChangeEvent) => setApiType(e.target.value)}
                >
                  <MenuItem value="type1">SDA</MenuItem>
                  <MenuItem value="type2">FIA</MenuItem>
                  <MenuItem value="type3">FN</MenuItem>
                </Select>
              </FormControl>

              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={!applicantId}>
                Submit
              </Button>
            </form>
          </Grid>

          {/* RIGHT SIDE — RESULTS OR NO DATA */}
          <Grid item xs={12} md={6}>
            {showResults ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 }, border: '1px solid', borderColor: 'primary.light' }}>
                      <Typography variant="h6">
                        <b>Applicant Info</b>
                      </Typography>
                      <Typography>Name: {applicantData?.firstName ?? 'No Data Found'}</Typography>
                      <Typography>Gender: {applicantData?.gender ?? 'No Data Found'}</Typography>
                      <Typography>Country: {applicantData?.nationality ?? 'No Data Found'}</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardContent sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 }, border: '1px solid', borderColor: 'primary.light' }}>
                      <Typography variant="h6">
                        <b>Limits</b>
                      </Typography>
                      <Typography>Max Limit: {limitData?.maxLimit ?? 'No Data Found'}</Typography>
                      <Typography>Utilized Limit: {limitData?.utilizedLimit ?? 'No Data Found'}</Typography>
                      <Typography>Available Limit: {limitData?.availableLimit ?? 'No Data Found'}</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    <b>Transactions</b>
                  </Typography>
                  <Box sx={{ height: '40vh', width: '20vw' }}>
                    <TransactionTable
                      //@ts-ignore
                      transaction={transactionData}
                      applicantId={applicantId}
                      availabledata={!!applicantData?.firstName}
                    />
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  width: '100%',
                  border: '1px dashed grey',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '60vh',
                }}
              >
                <Typography variant="h6" color="textSecondary">
                  No Records
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>

    </HasPermission>
  )
}

export default UtilizationEnquiryForm
