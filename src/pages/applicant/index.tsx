import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Avatar,
  useTheme,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import TransactionTable from '../transaction-table'
import { ApplicantService } from '@/services/applicant.service'
import { PieChart } from '@mui/x-charts/PieChart/PieChart'
import { HelperService } from '@/helpers/helper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import HasPermission from '@/components/permissionWrapper'
import { KycService } from '@/services/kyc.service'
import ReferralTransactions from '@/components/referralTransactionTable'
import DocumentsListComponent from '../document-tab'
import BeneficiaryTable from '@/components/beneficiary-table'
import axios from 'axios'

const ApplicantPage = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { applicantId } = useParams()
  const applicant_service = new ApplicantService()
  const helper = new HelperService()
  const local_service = new LocalStorageService()
  const kyc_service = new KycService()
  const [isEditable, setIsEditable] = useState(false)
  const [isChanged, setIsChanged] = useState(false)
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)
  const [openSaveDialog, setOpenSaveDialog] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [utilizedLimit, setutilizedLimit] = useState(0)
  const [availableLimit, setAvailableLimit] = useState(0)
  const [maxlimit, setMaxlimit] = useState(0)
  const [referralRedeemTransaction, setReferralRedeemTransaction] = useState<any>([])
  const [referralCreditedTransaction, setReferralCreditedTransaction] = useState<any>([])
  const [applicantImage, setApplicantImage] = useState<string>('')
  const [applicantDocuments, setApplicantDocuments] = useState<any[]>([])
  const [applicantDetails, setApplicantDetails] = useState<any>({})
  const [kycId, setKycId] = useState<string | null>(null);
    const { id: kycIdFromRoute } = useParams()

  function LimitPieChart() {
    const utilized = Math.abs(utilizedLimit)
    const available = Math.abs(availableLimit)

    return (
      <Box>
        <PieChart
          series={[
            {
              data: [
                {
                  id: 0,
                  value: utilized,
                  label: 'Utilized Limit',
                  color: '#FF6B6B',
                },
                {
                  id: 1,
                  value: available,
                  label: 'Available Limit',
                  color: '#4ECDC4',
                },
              ],
              innerRadius: 35, // donut shape
              outerRadius: 50,
            },
          ]}
          width={400}
          height={100}
        />
        {/* <Typography
        variant="subtitle2"
        sx={{
          position: 'absolute',
          top: '17.5%',
          right:"-20.5%",
          
          // transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          fontWeight: 'bold',
          color:"pink",
          fontSize:"0.5em"
        }}
      >
        Max Limit
        <br />
        {maxlimit.toLocaleString()}
      </Typography> */}
      </Box>
    )
  }
  useEffect(() => {
    fetchComplianceLimitData()
    fetchApplicantData()
    fetchTransactionsList()
    fetchReferralRedeemedTransactions()
    fetchReferralCreditedTransactions()
    getdocumentlistByApplicantId()
   // fetchKycId()
  }, [])

  const fetchComplianceLimitData = async () => {
    if (!applicantId) {
      return
    }
    try {
      const response = await applicant_service.getCompliance(applicantId)
      setutilizedLimit(response?.utilizedLimit)
      setAvailableLimit(response?.availableLimit)
    } catch (error) {
      console.error('Error fetching applicant data:', error)
    }
  }
  const fetchApplicantData = async () => {
    if (!applicantId) {
      console.error('Applicant ID is missing in the URL')
      return
    }
    try {
      const response = await applicant_service.searchByApplicantId(applicantId)
      const { applicant, applicantContactDetails, beneficiaryList }: any = response
      setApplicantDetails({
        ...applicant,
        email: applicantContactDetails?.[1]?.contactDetails,
        phone: applicantContactDetails?.[0]?.contactDetails,
        beneficiaryList,
      })
    } catch (error) {
      console.error('Error fetching applicant data:', error)
    }
  }

  const fetchTransactionsList = useCallback(async () => {
    if (!applicantId) return

    try {
      const data = await applicant_service.getTransactionsByApplicantId(applicantId)

      const formattedData = data?.map((transaction: any, index: number) => ({
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
      setTransactions(formattedData || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }, [applicantId])

  const fetchReferralRedeemedTransactions = useCallback(async () => {
    if (!applicantId) return

    try {
      const data = await kyc_service.getReferralRedeemedTransactions(applicantId)
      setReferralRedeemTransaction(data.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }, [applicantId])
 
  const fetchReferralCreditedTransactions = useCallback(async () => {
    if (!applicantId) return
    try {
      const { data } = await kyc_service.getReferralCreditedTransactions(applicantId)
      setReferralCreditedTransaction(data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }, [applicantId])
  const getdocumentlistByApplicantId = useCallback(async () => {
    if (!applicantId) return
    try {
      const { data } = await applicant_service.getDocumentByApplicantId(applicantId)
      if (data.length > 0) {
        const imageRecord = data.find((doc: any) => doc.documentName === 'image')
        setApplicantImage(imageRecord?.docUrl || '')
        setApplicantDocuments(data) // ✅ store all documents
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }, [applicantId])
  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setIsEditable(true)
    } else {
      if (isChanged) {
        setOpenConfirmationDialog(true)
      } else {
        setIsEditable(false)
      }
    }
  }
  const handleSaveChanges = () => {
    if (isChanged) {
      setOpenSaveDialog(true) // Show save confirmation dialog
    } else {
      alert('No changes made to save!')
    }
  }

  const handleSaveConfirm = () => {
    setOpenSaveDialog(false)
    setIsEditable(false)
  }

  const handleDiscardChanges = () => {
    setOpenConfirmationDialog(false)
    setIsEditable(false)
  }

  const handleCancelEdit = () => {
    setOpenConfirmationDialog(false)
  }

  const handleTabChange = async (
    //@ts-ignore
    event: React.ChangeEvent<{}>,
    newValue: number,
  ) => {
    setSelectedTab(newValue)
  }

  const handleBack = () => {
    navigate('/applicant')
  }

  const renderNameInitials = () => {
    return applicantDetails?.firstName.charAt(0) + '' + applicantDetails?.lastName.charAt(0)
  }

//   const fetchKycId = async () => {
//   if (!applicantId) return;

//   try {
//     const response = await axios.get(`https://api.impronics.com/api/applicant/applicant-all-details/applicantId/${applicantId}`);
//     console.log("KYC Response:", response.data); // Debug output

//     const kyc = response.data?.data?.kycId; // ✅ Correct path
//     if (kyc) {
//       setKycId(kyc);
//     } else {
//       setKycId('Not Found');
//     }
//   } catch (error) {
//     console.error("Error fetching KYC ID:", error);
//     setKycId('Error');
//   }
// };
useEffect(() => {
  if (!applicantId) return;

  applicant_service.getApplicantDetailsById(applicantId).then((data) => {
    if (data?.kycId) {
      setKycId(data.kycId);
    }
  });
}, [applicantId]);


  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.APPLICANT}>
      <Box sx={{ width: '50vw' }}>
        <Box>
          <Typography variant="h5" gutterBottom color={theme.palette.secondary.main} sx={{ fontWeight: 'bold' }}>
            Applicant Details
          </Typography>
        </Box>
 
        <Box mb={6} display="flex"  alignItems="center">
          <Typography
            variant="body1" mb={1}
            
            sx={{
              backgroundColor: 'primary.main',
            
              p: '0.5%',
              color: 'white',
              paddingBlock: 1,
              paddingInline: 1,
            }}
          >
            Applicant Id - {applicantId}
          </Typography>
          <Typography
            variant="body1" 
            mb={1}
            onClick={() => {
            if (kycId) {
                navigate(`/kyc/${kycId}`) // ✅ This goes to /kyc/KYC12345
                       }
            }}
            sx={{
              backgroundColor: 'primary.main',
              p: '0.5%',
              color: 'white',
              paddingBlock: 1,
              paddingInline: 1,
              cursor: 'pointer',
              ml: 2,
              '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              textDecoration: 'underline',
                         },
            }}
          >
             {`KYC ID - ${kycId ?? 'Loading...'}`}
          </Typography>
        </Box>
 
        {/* Applicant Information Form */}
        <Box sx={{ width: '80vw' }}>
          <Grid container spacing={2} mb={2} alignItems="flex-start" justifyContent="space-between">
            <Grid item xs={12} sm={2} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
              <Box width={150} height={150} border="4px solid green" borderRadius="50%" display="flex" alignItems="center" justifyContent="center">
                <Avatar
                  src={applicantImage.replace('http://64.227.139.142', 'https://api.impronics.com')}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                >
                  {applicantDetails && applicantDetails?.fistname && renderNameInitials()}
                </Avatar>
              </Box>
            </Grid>
            <Grid item xs={12} sm={7}>
              <Grid container spacing={2} marginBottom={1}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Applicant first Name"
                    variant="filled"
                    value={applicantDetails?.firstName || ''}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                {applicantDetails?.middleName && (
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Applicant Middle Name"
                      variant="filled"
                      value={applicantDetails?.middleName || ''}
                      fullWidth
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Applicant Last Name"
                    variant="filled"
                    value={applicantDetails?.lastName || ''}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nationality"
                    variant="filled"
                    value={applicantDetails?.nationality || ''}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Residence Country"
                    variant="filled"
                    value={applicantDetails?.residenceCountry || ''}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Phone" variant="filled" value={applicantDetails?.phone || ''} fullWidth InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Email" variant="filled" value={applicantDetails?.email || ''} fullWidth InputProps={{ readOnly: true }} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={3} sx={{ alignContent: 'top' }}>
              <LimitPieChart></LimitPieChart>
            </Grid>
          </Grid>
        </Box>
 
        {/* Permanent Address Section */}
        <Box sx={{ width: '80vw' }}>
          <Typography variant="subtitle1" sx={{ color: 'grey', marginBottom: 1 }}>
            <strong>Postal Address</strong>
          </Typography>
          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Address Line 1" value={applicantDetails?.postalAddressLine1 || ''} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Address Line 2" value={applicantDetails?.postalAddressLine2 || ''} InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>
 
          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={2}>
              <TextField fullWidth label="Suburb" value={applicantDetails?.suburb || ''} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={12} sm={2}>
              <TextField fullWidth label="city" value={applicantDetails?.city || ''} InputProps={{ readOnly: true }} />
            </Grid>

            <Grid item xs={12} sm={2}>
              <TextField fullWidth label="State" value={applicantDetails?.applicantState || ''} InputProps={{ readOnly: true }} />
            </Grid>
 
            <Grid item xs={12} sm={1.5}>
              <TextField fullWidth label="Postal Code" value={applicantDetails?.postalCode || ''} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField fullWidth label="Country" value={applicantDetails?.country || ''} InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>
 
          {/* Physical Address Section */}
          <Typography variant="subtitle1" sx={{ color: 'grey', marginBottom: 1 }}>
            <strong>Physical Address</strong>
          </Typography>
 
          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Address Line 1" value={applicantDetails?.physicalAddressLine1 || ''} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Address Line 2" value={applicantDetails?.physicalAddressLine2 || ''} InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>
 
          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={2}>
              <TextField fullWidth label="Suburb" value={applicantDetails?.suburb || ''} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField fullWidth label="City" value={applicantDetails?.residenceCity || ''} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField fullWidth label="State" value={applicantDetails?.residenceState || ''} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField fullWidth label="Zip Code" value={applicantDetails?.residencePostalCode || ''} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField fullWidth label="Country" value={applicantDetails?.residenceCountry || ''} InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>
        </Box>
        {/* Tab Component */}
        <Tabs sx={{ marginBottom: '10px' }} value={selectedTab} onChange={handleTabChange} aria-label="Customer data tabs">
          <Tab label="Documents" sx={{ marginRight: '2px' }} />
          <Tab label="Beneficiaries" sx={{ marginRight: '2px' }} />
          <Tab label="Transactions" sx={{ marginRight: '2px' }} />
          <Tab label="Referral Redeemed Transactions" sx={{ marginRight: '2px' }} />
          <Tab label="Referral Credited Transactions" sx={{ marginRight: '2px' }} />
        </Tabs>
        {/* ✅ Uploaded Documents Section */}
        {selectedTab === 0 && <DocumentsListComponent documentRecords={applicantDocuments || []} />}
        {selectedTab === 1 && <BeneficiaryTable beneficiary={applicantDetails?.beneficiaryList || []} applicantId={applicantId} />}
        {selectedTab === 2 && (
          <TransactionTable
            //@ts-ignore
            applicantId={applicantId || ''}
            //@ts-ignore
            transaction={transactions}
          />
        )}

        {selectedTab === 3 && <ReferralTransactions referralRecords={referralRedeemTransaction || []} referralType={'Redeemed'} />}
        {selectedTab === 4 && <ReferralTransactions referralRecords={referralCreditedTransaction || []} referralType={'Credited'} />}

        {/* Action Buttons */}
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} sm={3}>
            <Button variant="outlined" onClick={handleBack} fullWidth>
              Back to Applicant List
            </Button>
          </Grid>
          {/* <Grid item xs={12} sm={3}>
            {isEditable && (
              <Button variant="contained" fullWidth onClick={handleSaveChanges}>
                Save Changes
              </Button>
            )}
          </Grid> */}
        </Grid>
 
        {/* Confirmation Dialogs */}
        <Dialog open={openConfirmationDialog} onClose={handleCancelEdit}>
          <DialogTitle>Confirm Discard</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to discard your changes?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDiscardChanges} color="primary">
              Yes
            </Button>
            <Button onClick={handleCancelEdit} color="secondary">
              No
            </Button>
          </DialogActions>
        </Dialog>
 
        <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
          <DialogTitle>Confirm Save</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to save the changes?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSaveConfirm} color="primary">
              Yes
            </Button>
            <Button onClick={() => setOpenSaveDialog(false)} color="secondary">
              No
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </HasPermission>
  )
}

export default ApplicantPage
