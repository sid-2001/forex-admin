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
} from '@mui/material'
import { ApplicantService } from '@/services/applicant.service'
import TransactionTable from '../transaction-table'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

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
      setapplicantData(data?.data?.applicant)
    })

    e.preventDefault()
    setShowResults(true)
  }

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.COMPLIANCE_MONITOR}>
      <Box sx={{ flexGrow: 1, p: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
            onClick={() => navigate(-1)} // Takes user back
          >
            Back
          </Button>
        </Box>

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
              <FormControl fullWidth margin="normal">
                <InputLabel id="enquiry-type-label">Enquiry Type</InputLabel>
                <Select labelId="enquiry-type-label" value={enquiryType} onChange={(e: SelectChangeEvent) => setEnquiryType(e.target.value)}>
                  <MenuItem value="utilization">Utilization</MenuItem>
                  <MenuItem value="limit">Limit</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel id="api-type-label">API Type</InputLabel>
                <Select labelId="api-type-label" value={apiType} onChange={(e: SelectChangeEvent) => setApiType(e.target.value)}>
                  <MenuItem value="type1">SDA</MenuItem>
                  <MenuItem value="type2">FIA</MenuItem>
                  <MenuItem value="type3">FN</MenuItem>
                </Select>
              </FormControl>

              <FormControl component="fieldset" margin="normal">
                <RadioGroup row value={searchBy} onChange={(e) => setSearchBy(e.target.value as 'applicantId' | 'nationalId')}>
                  <FormControlLabel value="applicantId" control={<Radio />} label="Applicant ID" />
                  <FormControlLabel value="nationalId" disabled control={<Radio />} label="National ID" />
                </RadioGroup>
              </FormControl>

              <TextField
                label="Applicant ID"
                fullWidth
                margin="normal"
                value={applicantId}
                onChange={(e) => {
                  const input = e.target.value
                  const onlyAlphanumeric = input.replace(/[^a-zA-Z0-9]/g, '') // removes special chars
                  setApplicantId(onlyAlphanumeric)
                }}
                inputProps={{
                  pattern: '[a-zA-Z0-9]*',
                  title: 'Only alphanumeric characters are allowed',
                }}
              />

              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
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
                      <Typography>Country: {applicantData?.residenceCountry ?? 'No Data Found'}</Typography>
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
                  <Box sx={{ height: '40vh', width: '100%' }}>
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
                  No Records Found
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
