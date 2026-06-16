import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Box, Grid, TextField, Typography, Button, Tabs, Tab, Avatar, useTheme, Card, CardContent } from '@mui/material'
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { FieldValidationService } from '@/services/fieldvalidstion.service'
import { CountryLabelData, CountryReportingLabelDTO } from '@/types/field.validation.type'

const allLevels = [
  {
    levelName: 'Standard',
    bgcolor: '',
    rewardValue: 0,
  },
  {
    levelName: 'Bronze',
    bgcolor: '',
    rewardValue: 1,
  },
  {
    levelName: 'Silver',
    bgcolor: '',
    rewardValue: 2,
  },
  {
    levelName: 'Gold',
    bgcolor: '',
    rewardValue: 3,
  },
]

const ApplicantPage = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { applicantId } = useParams()
  const applicant_service = new ApplicantService()
  const helper = new HelperService()
  const local_service = new LocalStorageService()
  const kyc_service = new KycService()
  const validation = new FieldValidationService()
  const userCountry = local_service?.get_staff_country()

  const [selectedTab, setSelectedTab] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [utilizedLimit, setutilizedLimit] = useState(0)
  const [availableLimit, setAvailableLimit] = useState(0)
  const [referralRedeemTransaction, setReferralRedeemTransaction] = useState<any>([])
  const [referralCreditedTransaction, setReferralCreditedTransaction] = useState<any>([])
  const [applicantImage, setApplicantImage] = useState<string>('')
  const [applicantDocuments, setApplicantDocuments] = useState<any[]>([])
  const [applicantDetails, setApplicantDetails] = useState<any>({})
  const [kycId, setKycId] = useState<string | null>(null)
  const [redeemReferralTrans, setRedeemReferralTrans] = useState<any>([])

  // Field validation states
  const [fieldValidations, setFieldValidations] = useState<CountryLabelData>()
  const [fieldLabels, setFieldLabels] = useState<Record<string, string>>({})
  const [fieldMessages, setFieldMessages] = useState<Record<string, string>>({})
  // const [allLevels, setLevels] = useState<Record<string, string>>({})

  const parseData = local_service.get_staff_access()

  // Helper function to get label by field name
  const getLabel = (fieldName: string): string => {
    return fieldLabels[fieldName] || fieldName.replace(/_/g, ' ')
  }

  const tabs = [
    { label: `${getLabel('Documents')}` || 'Documents', value: 0, hidden: userCountry === 'UAE' },
    { label: `${getLabel('Beneficiaries')}` || 'Beneficiaries', value: 1 },
    { label: `${getLabel('Transactions')}` || 'Transactions', value: 2 },
    // { label: `${getLabel('Referral_Redeemed')}` || 'Referral Redeemed Transactions', value: 3 },
    // { label: `${getLabel('Referral_Credited')}` || 'Referral Credited Transactions', value: 4 },
    { label: 'Active Referrals', value: 4 },

    { label: 'Redeemption Requests', value: 5, hidden: userCountry !== 'UAE' },
  ]

  const fetchFieldValidations = async () => {
    try {
      const response = await validation.getScreenFieldvalidation('APPLICANT', local_service.get_staff_country(), 'W')

      if (response?.data) {
        setFieldValidations(response.data)

        // Create lookup maps for labels and messages
        const labelsMap: Record<string, string> = {}
        const messagesMap: Record<string, string> = {}

        response.data.countryReportingLabelDTO?.forEach((item: CountryReportingLabelDTO) => {
          const fieldName = item.countryLabelFieldNameAndValidation?.fieldName?.trim()
          if (fieldName) {
            labelsMap[fieldName] = item.countryLabelFieldNameAndValidation?.label
            messagesMap[fieldName] = item.countryLabelFieldNameAndValidation?.validationMessageMandatory
          }
        })

        console.log(labelsMap, 'labelsMap')
        console.log(messagesMap, 'messagesMap')

        setFieldLabels(labelsMap)
        setFieldMessages(messagesMap)
      }
    } catch (error) {
      console.error('Error fetching field validations:', error)
    }
  }

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
                  label: getLabel('Utilized_Limit') || 'Utilized Limit',
                  color: '#FF6B6B',
                },
                {
                  id: 1,
                  value: available,
                  label: getLabel('Available_Limit') || 'Available Limit',
                  color: '#4ECDC4',
                },
              ],
              innerRadius: 35,
              outerRadius: 50,
            },
          ]}
          width={400}
          height={100}
        />
      </Box>
    )
  }

  const MemoizedPieChart = useMemo(() => {
    return <LimitPieChart />
  }, [utilizedLimit, availableLimit, fieldLabels])

  useEffect(() => {
    if (userCountry !== 'UAE') fetchComplianceLimitData()
    if (userCountry === 'UAE') setSelectedTab(1)
    else setSelectedTab(0)
    fetchFieldValidations()
    fetchApplicantData()
    fetchTransactionsList()
    fetchReferralRedeemedTransactions()
    fetchReferralCreditedTransactions()
    getdocumentlistByApplicantId()
    fetchRedeemReferrals()
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
      console.log(response, 'response')
      const { applicant, applicantContactDetails, beneficiaryList, kycId, kycStatus, rewards, loyaltyResponse }: any = response
      console.log(loyaltyResponse?.nextLevel, 'response level')

      setApplicantDetails({
        ...applicant,
        email: applicantContactDetails?.find((item: any) => item.contactType === 'email')?.contactDetails,
        phone: applicantContactDetails?.find((item: any) => item.contactType === 'phone')?.contactDetails,
        beneficiaryList,
        kycStatus,
        rewards,
        loyaltyResponse,
      })

      if (kycId) {
        setKycId(kycId)
      }
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

  const fetchRedeemReferrals = useCallback(async () => {
    if (!applicantId) return
    try {
      const { data } = await kyc_service.getRedeemedReferralsByApplicantId(applicantId)
      setRedeemReferralTrans(data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }, [applicantId])

  const getdocumentlistByApplicantId = useCallback(async () => {
    if (!applicantId) return
    try {
      const data = await applicant_service.getDocumentByApplicantId(applicantId)
      if (data.length > 0) {
        const imageRecord = data.find((doc: any) => doc.docCode.toLowerCase() == 'image')

        setApplicantImage(imageRecord?.docFrontUrl || '')
        setApplicantDocuments(data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }, [applicantId])

  const handleTabChange = async (
    //@ts-ignore
    event: React.ChangeEvent<{}>,
    newValue: number,
  ) => {
    setSelectedTab(newValue)
  }

  const renderNameInitials = () => {
    return applicantDetails?.firstName?.charAt(0) + '' + applicantDetails?.lastName?.charAt(0)
  }

  const renderTierBgColor = (tier: any) => {
    return tier === 'Bronze'
      ? ['#804A00', '#CD7F32']
      : tier === 'Silver'
        ? ['#C0C0C0', '#D4D6D8']
        : tier === 'Gold'
          ? ['#B8860B', '#FFD700']
          : tier === 'Platinum'
            ? ['#A0A9B0', '#E8ECF0']
            : ['#1468B7', '#1468B8']
  }

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.APPLICANT}>
      <Box sx={{ width: '90vw' }}>
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ width: '75%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                {getLabel('Applicant') || 'Applicant Details'}
              </Typography>

              {/* <Typography
                variant="body1"
                ml={2}
                sx={{
                  backgroundColor: 'primary.main',
                  p: '0.5%',
                  color: 'white',
                  paddingBlock: 1,
                  paddingInline: 1,
                }}
              >
                {getLabel('Applicant_ID') || 'Applicant Id'} - {applicantId}
              </Typography>
              {applicantDetails?.kycStatus === 'v' && (
                <Typography
                  variant="body1"
                  onClick={() => {
                    if (kycId) {
                      navigate(`/kyc/${kycId}`)
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
                  {`${getLabel('KYC_ID') || 'KYC ID'} - ${kycId}`}
                </Typography>
              )} */}
            </Box>

            {/* Applicant Information Form */}
            <Box>
              <Grid container spacing={2} alignItems="flex-start" justifyContent="space-between">
                <Grid item xs={12} sm={3} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                  <Box
                    width={150}
                    height={150}
                    border="4px solid green"
                    borderRadius="50%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Avatar
                      src={applicantImage
                        ?.replace('http://164.90.252.179/', 'https://api.impronics.com/uat/')
                        .replace('http://64.227.139.142/', 'https://api.impronics.com/')}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    >
                      {applicantDetails && applicantDetails?.firstName && renderNameInitials()}
                    </Avatar>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Grid container spacing={2} marginBottom={1}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={getLabel('Applicant_ID') || 'Applicant Id'}
                        variant="filled"
                        size="small"
                        value={applicantId || ''}
                        fullWidth
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {userCountry !== 'UAE' && applicantDetails?.kycStatus === 'v' && (
                        <TextField
                          label={getLabel('KYC_ID') || 'KYC ID'}
                          variant="filled"
                          size="small"
                          value={kycId || ''}
                          fullWidth
                          InputProps={{ readOnly: true }}
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label={getLabel('First_Name') || 'Applicant First Name'}
                        variant="filled"
                        size="small"
                        value={applicantDetails?.firstName || ''}
                        fullWidth
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    {applicantDetails?.middleName && (
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label={getLabel('Middle_Name') || 'Applicant Middle Name'}
                          variant="filled"
                          size="small"
                          value={applicantDetails?.middleName || ''}
                          fullWidth
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label={getLabel('Last_Name') || 'Applicant Last Name'}
                        variant="filled"
                        size="small"
                        value={applicantDetails?.lastName || ''}
                        fullWidth
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={getLabel('Nationality') || 'Nationality'}
                        variant="filled"
                        size="small"
                        value={applicantDetails?.nationality || ''}
                        fullWidth
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={getLabel('Country_of_Residence') || 'Residence Country'}
                        variant="filled"
                        size="small"
                        value={applicantDetails?.residentialAddressCountry || ''}
                        fullWidth
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={getLabel('Phone') || 'Phone'}
                        variant="filled"
                        size="small"
                        value={applicantDetails?.phone || ''}
                        fullWidth
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={getLabel('Email') || 'Email'}
                        variant="filled"
                        size="small"
                        value={applicantDetails?.email || ''}
                        fullWidth
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={getLabel('DOB') || 'DOB'}
                        variant="filled"
                        size="small"
                        value={applicantDetails?.dob || ''}
                        fullWidth
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={getLabel('Gender') || 'Gender'}
                        variant="filled"
                        size="small"
                        value={applicantDetails?.gender === 'M' ? 'Male' : 'Female'}
                        fullWidth
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* <Grid item xs={12} sm={3} sx={{ alignContent: 'top' }}>
                  {userCountry !== 'UAE' && <>{MemoizedPieChart}</>}
                </Grid> */}
              </Grid>
            </Box>

            {/* Postal Address Section */}

            {userCountry !== 'UAE' && (
              <Box>
                <Typography variant="subtitle1" sx={{ color: 'grey', marginBottom: 1 }}>
                  <strong>{getLabel('Postal_Address') || 'Postal Address'}</strong>
                </Typography>
                <Grid container spacing={2} marginBottom={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="filled"
                      fullWidth
                      size="small"
                      label={getLabel('Address_Line_1') || 'Address Line 1'}
                      value={applicantDetails?.postalAddressLine1 || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="filled"
                      size="small"
                      fullWidth
                      label={getLabel('Address_Line_2') || 'Address Line 2'}
                      value={applicantDetails?.postalAddressLine2 || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2} marginBottom={2}>
                  {parseData?.staffCountry === 'ZA' && (
                    <Grid item xs={12} sm={2.3}>
                      <TextField
                        variant="filled"
                        size="small"
                        fullWidth
                        label={getLabel('Suburb') || 'Suburb'}
                        value={applicantDetails?.postalAddressSuburb || ''}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} sm={2.3}>
                    <TextField
                      variant="filled"
                      fullWidth
                      size="small"
                      label={getLabel('City') || 'City'}
                      value={applicantDetails?.postalAddressCity || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={2.3}>
                    <TextField
                      variant="filled"
                      size="small"
                      fullWidth
                      label={getLabel('State') || 'State'}
                      value={applicantDetails?.postalAddressStateProvince || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={2.3}>
                    <TextField
                      variant="filled"
                      fullWidth
                      size="small"
                      label={getLabel('Postal_Code') || 'Postal Code'}
                      value={applicantDetails?.postalAddressPostalCode || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2.3}>
                    <TextField
                      variant="filled"
                      fullWidth
                      label={getLabel('Country') || 'Country'}
                      size="small"
                      value={applicantDetails?.postalAddressCountry || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>

                {/* Residential Address Section */}
                <Typography variant="subtitle1" sx={{ color: 'grey', marginBottom: 1 }}>
                  <strong>{getLabel('Residential_Address') || 'Residential Address'}</strong>
                </Typography>

                <Grid container spacing={2} marginBottom={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="filled"
                      fullWidth
                      size="small"
                      label={getLabel('Address_Line_1') || 'Address Line 1'}
                      value={applicantDetails?.residentialAddressLine1 || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      variant="filled"
                      fullWidth
                      size="small"
                      label={getLabel('Address_Line_2') || 'Address Line 2'}
                      value={applicantDetails?.residentialAddressLine2 || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2} marginBottom={2}>
                  {parseData?.staffCountry === 'ZA' && (
                    <Grid item xs={12} sm={2.3}>
                      <TextField
                        variant="filled"
                        fullWidth
                        label={getLabel('Suburb') || 'Suburb'}
                        size="small"
                        value={applicantDetails?.residentialAddressSuburb || ''}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} sm={2.3}>
                    <TextField
                      variant="filled"
                      fullWidth
                      size="small"
                      label={getLabel('City') || 'City'}
                      value={applicantDetails?.residentialAddressCity || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2.3}>
                    <TextField
                      variant="filled"
                      size="small"
                      fullWidth
                      label={getLabel('State') || 'State'}
                      value={applicantDetails?.residentialAddressStateProvince || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2.3}>
                    <TextField
                      variant="filled"
                      size="small"
                      fullWidth
                      label={getLabel('Postal_Code') || 'Zip Code'}
                      value={applicantDetails?.residentialAddressPostalCode || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2.3}>
                    <TextField
                      variant="filled"
                      size="small"
                      fullWidth
                      label={getLabel('Country') || 'Country'}
                      value={applicantDetails?.residentialAddressCountry || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box mt={6}>
              {/* Tab Component */}

              <Tabs value={selectedTab} onChange={handleTabChange}>
                {tabs
                  .filter((t) => !t.hidden)
                  .map((tab) => (
                    //@ts-ignore
                    <Tab key={tab.value} {...tab} x={{ marginRight: '2px' }} />
                  ))}
              </Tabs>

              {/* Content Sections */}
              {userCountry !== 'UAE' && selectedTab === 0 && <DocumentsListComponent documentRecords={applicantDocuments || []} />}
              {selectedTab === 1 && <BeneficiaryTable beneficiary={applicantDetails?.beneficiaryList || []} />}
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
              {selectedTab === 5 && <ReferralTransactions referralRecords={redeemReferralTrans || []} referralType={'RedeemReferral'} />}
            </Box>
          </Box>
          <Box sx={{ width: '25%', margin: '0px 40px' }}>
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      background: `linear-gradient(90deg, ${renderTierBgColor(applicantDetails?.userTier)[0]} 0%, ${renderTierBgColor(applicantDetails?.userTier)[1]} 100%)`,
                      borderRadius: 6,
                      p: 1,
                      textAlign: 'center',
                      color: '#fff',
                    }}
                  >
                    <Typography variant="body1" fontWeight={400}>
                      Loyalty Tier{' '}
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {applicantDetails?.userTier}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      background: 'linear-gradient(to bottom,#FFEB99,rgb(172, 169, 65))',
                      borderRadius: 6,
                      p: 1,
                      textAlign: 'center',
                      color: '#fff',
                    }}
                  >
                    <Typography variant="body1" fontWeight={400}>
                      IMPROPAY Rewards
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {' '}
                      {applicantDetails?.rewards?.referralAvailableRewards + applicantDetails?.rewards?.loyaltyAvailableRewards || 0}{' '}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      background: '#79CBF0',
                      borderRadius: 6,
                      p: 1,
                      textAlign: 'center',
                      color: '#fff',
                    }}
                  >
                    <Typography variant="body1" fontWeight={400}>
                      Loyalty Rewards
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {applicantDetails?.rewards?.loyaltyAvailableRewards || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      background: 'linear-gradient(to bottom, #81C784,rgb(40, 124, 44))',
                      borderRadius: 6,
                      p: 1,
                      textAlign: 'center',
                      color: '#fff',
                    }}
                  >
                    <Typography fontWeight={400} variant="body1">
                      Referral Rewards
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {applicantDetails?.rewards?.referralAvailableRewards || 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {applicantDetails && applicantDetails?.loyaltyResponse?.nextLevel ? (
              <Box sx={{ marginTop: '30px' }}>
                <Typography variant="body2" sx={{ textAlign: 'center', marginBottom: '6px', color: '#1468B7', fontWeight: '500' }}>
                  TO UNLOCK THE NEXT TIER
                </Typography>
                <Box
                  sx={{
                    background: `linear-gradient(90deg, ${renderTierBgColor(applicantDetails?.userTier)[0]} 0%, ${renderTierBgColor(applicantDetails?.userTier)[1]} 100%)`,
                    borderRadius: 4,
                    p: 1,
                    textAlign: 'center',
                    color: '#fff',
                    marginBottom: 2,
                  }}
                >
                  <Typography variant="body1" fontWeight={400}>
                    Next Tier{' '}
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {applicantDetails?.loyaltyResponse?.nextLevel?.userTier}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 2,
                    p: '16px 12px',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #2f7ed8 0%, #3b93e8 40%, #5db6f0 100%)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-20%',
                      right: '-10%',
                      width: '70%',
                      height: '120%',
                      background: 'linear-gradient(120deg, transparent, rgba(255,255,255,.25), transparent)',
                      transform: 'rotate(-10deg)',
                    },
                    marginBottom: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" fontWeight={600}>
                      Transactions{' '}
                    </Typography>

                    <Typography variant="body1" fontWeight={600}>
                      {applicantDetails?.loyaltyResponse?.applicantLoyaltyData?.totalTransactions}/
                      {applicantDetails?.loyaltyResponse?.nextLevel?.tierRetentionTransactions}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 2,
                    p: '16px 12px',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #2f7ed8 0%, #3b93e8 40%, #5db6f0 100%)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-20%',
                      right: '-10%',
                      width: '70%',
                      height: '120%',
                      background: 'linear-gradient(120deg, transparent, rgba(255,255,255,.25), transparent)',
                      transform: 'rotate(-10deg)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1" fontWeight={600}>
                      Amount{' '}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {applicantDetails?.loyaltyResponse?.applicantLoyaltyData?.totalAmount}/
                      {applicantDetails?.loyaltyResponse?.nextLevel?.tierRetentionAmount}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ padding: '30px 0px', borderRadius: '16px', marginTop: '30px', background: '#000', textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: '600' }}>
                  You're at the Top!
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff', fontWeight: '400', margin: '10px 0px' }}>
                  Enjoy {applicantDetails?.loyaltyResponse?.currentLevel?.discountPercentage} AED flat reward on every transaction
                </Typography>

                <Typography variant="body2" sx={{ color: '#fff', fontWeight: '300' }}>
                  Hightest loyalty tier achieved
                </Typography>
              </Box>
            )}

            {/* show retention box */}
            {applicantDetails?.loyaltyResponse?.currentLevel?.userTier !== 'Standard' && (
              <Box sx={{ padding: '10px 16px', borderRadius: '16px', marginTop: '30px', background: '#1468B7' }}>
                <Typography variant="body2" sx={{ color: '#fff' }}>
                  TO RETAIN YOUR TIER
                </Typography>

                <Typography variant="h6" fontWeight={600} sx={{ color: '#fff' }}>
                  {applicantDetails?.loyaltyResponse?.currentLevel?.userTier}
                </Typography>

                <Box
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 2,
                    p: '6px 10px',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #2f7ed8 0%, #3b93e8 40%, #5db6f0 100%)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-20%',
                      right: '-10%',
                      width: '70%',
                      height: '120%',
                      background: 'linear-gradient(120deg, transparent, rgba(255,255,255,.25), transparent)',
                      transform: 'rotate(-10deg)',
                    },
                    marginBottom: '20px',
                  }}
                >
                  <Typography variant="body1" fontWeight={400}>
                    Transactions{' '}
                  </Typography>

                  <Typography variant="body1" fontWeight={600}>
                    {applicantDetails?.loyaltyResponse?.applicantLoyaltyData?.totalTransactions}/
                    {applicantDetails?.loyaltyResponse?.currentLevel?.tierRetentionTransactions}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 2,
                    p: '6px 10px',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #2f7ed8 0%, #3b93e8 40%, #5db6f0 100%)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-20%',
                      right: '-10%',
                      width: '70%',
                      height: '120%',
                      background: 'linear-gradient(120deg, transparent, rgba(255,255,255,.25), transparent)',
                      transform: 'rotate(-10deg)',
                    },
                  }}
                >
                  <Typography variant="body1" fontWeight={400}>
                    Amount{' '}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {applicantDetails?.loyaltyResponse?.applicantLoyaltyData?.totalAmount}/
                    {applicantDetails?.loyaltyResponse?.currentLevel?.tierRetentionAmount}
                  </Typography>
                </Box>
                <Box sx={{ mt: '10px' }}>
                  <Typography sx={{ textAlign: 'center', color: '#fff' }} variant="body1">
                    In {applicantDetails?.loyaltyResponse?.currentLevel?.timePeriodDays} days
                  </Typography>
                </Box>
              </Box>
            )}

            {/* show levels block */}
            <Box sx={{ padding: '24px 16px', borderRadius: '16px', marginTop: '30px', background: '#0D1F35' }}>
              <Typography variant="h5" sx={{ color: '#fff', textAlign: 'center', fontWeight: '700', marginBottom: 2 }}>
                All Levels
              </Typography>
              <Grid container spacing={2}>
                {applicantDetails?.loyaltyResponse?.allLevels.map((level: any) => (
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        borderRadius: 6,
                        textAlign: 'center',
                        color: '#fff',
                        border: '1px solid gray',
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={'bold'}
                        sx={{
                          borderTopLeftRadius: '22px',
                          borderTopRightRadius: '22px',
                          padding: '8px 0px',
                          background: `linear-gradient(90deg, ${renderTierBgColor(level.userTier)} 0%, ${renderTierBgColor(level.userTier)[1]} 100%)`,
                        }}
                      >
                        {level.userTier}
                      </Typography>
                      <Typography variant="h6" fontWeight={600} sx={{ padding: '20px 10px' }}>
                        {level?.discountPercentage} AED
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </Box>
      </Box>
    </HasPermission>
  )
}

export default ApplicantPage
