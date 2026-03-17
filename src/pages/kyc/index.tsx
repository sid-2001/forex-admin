import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Drawer,
  Grid,
  TextField,
  Typography,
  Divider,
  useTheme,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
  Modal,
  ListItem,
  List,
} from '@mui/material'
import { DataGrid, GridFilterModel, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarFilterButton } from '@mui/x-data-grid'
import VerifyDocumentModal from '@/components/verify-document'
import { Customer } from '@/types/customer.type'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { ApplicantService } from '@/services/applicant.service'
import { KycService } from '@/services/kyc.service'
import { Close, Comment, Send } from '@mui/icons-material'
import { loaderStateNew } from '@/states/state'
import { useRecoilState } from 'recoil'
import CloseIcon from '@mui/icons-material/Close'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmationModal from '@/components/logout/logout.component'
import { LocalStorageService } from '@/helpers/local-storage-service'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'
import dayjs from 'dayjs'
import LoaderUI from '@/components/loader/loader'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FieldValidationService } from '@/services/fieldvalidstion.service'
import { CountryLabelData, CountryReportingLabelDTO } from '@/types/field.validation.type'

const KYCPage = () => {
  const [open, setOpen] = useState(false)
  const [filteredData, setFilteredData] = useState<Array<Customer>>([])
  const [selectedKYC, setSelectedKYC] = useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedDocumentModal, setSelectedDocumentModel] = useState({})
  const [selectedVerifcationOpen, setselectedVerifcationOpen] = useState(false)
  const [mockdata, setMockData] = useState<Array<any>>([])
  const [loader, setCommonLoader] = useRecoilState(loaderStateNew)
  const [checkboxOpen, setCheckboxOpen] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState<any>([])
  const [prooftype, setProoftype] = useState<any>()
  const [imageUrl, setImageUrl] = useState('')
  const { id: kycIdFromRoute } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [fieldValidations, setFieldValidations] = useState<CountryLabelData>()
  const [fieldLabels, setFieldLabels] = useState<Record<string, string>>({})
  const [fieldMessages, setFieldMessages] = useState<Record<string, string>>({})

  const navigate = useNavigate()
  const theme = useTheme()
  const local_service = new LocalStorageService()
  let applicant_service = new ApplicantService()
  let kycservice = new KycService()
  let validation = new FieldValidationService()
  const helper_service = new HelperService()
  const userCountry = local_service?.get_staff_country()

  // Helper function to get label by field name
  const getLabel = (fieldName: string): string => {
    return fieldLabels[fieldName] || fieldName.replace(/_/g, ' ')
  }

  // Helper function to get validation message by field name
  const getValidationMessage = (fieldName: string): string => {
    return fieldMessages[fieldName] || ''
  }

  // Fetch field validations from API
  useEffect(() => {
    const fetchFieldValidations = async () => {
      try {
        const response = await validation.getScreenFieldvalidation(
          "KYC",
          local_service.get_staff_country(),
          "W"
        )
        
        if (response?.data) {
          setFieldValidations(response.data)
          
          // Create lookup maps for labels and messages
          const labelsMap: Record<string, string> = {}
          const messagesMap: Record<string, string> = {}
          
          response.data.countryReportingLabelDTO?.forEach((item: CountryReportingLabelDTO) => {
            const fieldName = item.countryLabelFieldNameAndValidation?.fieldName
            if (fieldName) {

              console.log(fieldName,"===>",item.countryLabelFieldNameAndValidation?.label)
              labelsMap[fieldName] = item.countryLabelFieldNameAndValidation?.label
              messagesMap[fieldName] = item.countryLabelFieldNameAndValidation?.validationMessageMandatory
            }
          })
        
          console.log("i m gettin here");
        console.log(  labelsMap['Applicant_ID'])
          console.log(labelsMap)
          setFieldLabels(labelsMap)
          setFieldMessages(messagesMap)
        }
      } catch (error) {
        console.error("Error fetching field validations:", error)
      }
    }

    fetchFieldValidations()
  }, [])

  // Dynamic column generation based on API labels
  const KycColumns = [
    {
      field: 'kycId',
      headerName: getLabel('KYC_ID') || 'KYC ID',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'applicantName',
      headerName: getLabel('Customer_Name') || 'Customer Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'nationality',
      headerName: getLabel('Nationality') || 'Nationality',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'kycCountry',
      headerName: getLabel('Country_of_Residence') || 'Resident Country',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'applicantId',
      headerName: getLabel('Applicant_ID') || 'Applicant ID',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return (
          <a
            style={{ cursor: 'pointer', color: theme.palette.text.primary, textDecoration: 'underline' }}
            onClick={() => {
              navigate(`/applicant-details/${params.row.applicantId}`)
            }}
          >
            {params.row.applicantId}
          </a>
        )
      },
    },
    {
      field: 'kycStatus',
      headerName: getLabel('Verification_Status') || 'Verification Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        let color: 'success' | 'warning' | 'error' = 'success'
        if (params.value === '') color = 'warning'
        else if (params.value === 'Rejected') color = 'error'

        return <Chip 
          label={params.value == 'v' ? getLabel('Verified') || 'Verified' : getLabel('Unverified') || 'Unverified'} 
          color={params.value == 'v' ? 'success' : 'warning'} 
          variant="filled" 
        />
      },
    },
    {
      field: 'action',
      headerName: getLabel('Action') || 'Action',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <Button variant="outlined" style={{ color: theme.palette.text.primary }} onClick={() => openDrawer(params.row)}>
          {getLabel('View_More') || 'View More'}
        </Button>
      ),
    },
  ]

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer sx={{ justifyContent: 'flex-start', gap: 1, py: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />

        <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={downloadCSV}>
          CSV
        </Button>

        <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={downloadPDF}>
          PDF
        </Button>

        <Button variant="outlined" size="small" startIcon={<FindReplaceIcon />} onClick={() => setFilterModel({ items: [] })}>
          {getLabel('Reset_Filters') || 'Reset Filters'}
        </Button>
      </GridToolbarContainer>
    )
  }

  const getApplicantKYCData = async () => {
    try {
      setIsLoading(true)
      const data: any = await applicant_service.getApplicantKyc(userCountry)
      console.log(data?.data)
      setMockData(data?.data)

      if (kycIdFromRoute) {
        const filtered: any = data.filter((item: any) => item.kycId === kycIdFromRoute)
        setFilteredData(filtered)
      } else {
        setFilteredData(data?.data)
      }
    } catch (err) {
      setCommonLoader(false)
      console.error('Error fetching countries:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getApplicantKYCData()
  }, [userCountry, kycIdFromRoute])

  const downloadCSV = () => {
    if (!filteredData || filteredData.length === 0) return

    const headers = [
      getLabel('KYC_ID') || 'KYC ID',
      getLabel('Customer_Name') || 'Customer Name',
      getLabel('Nationality') || 'Nationality',
      getLabel('Country_of_Residence') || 'Resident Country',
      getLabel('Applicant_ID') || 'Applicant ID',
      getLabel('Verification_Status') || 'Verification Status'
    ]

    const rows = filteredData.map((item) => [
      item.kycId,
      item?.applicantName,
      item.nationality,
      item?.kycCountry,
      item?.applicantId,
      item?.kycStatus === 'v' ? (getLabel('Verified') || 'Verified') : (getLabel('Unverified') || 'Unverified'),
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'kyc_data.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadPDF = () => {
    if (!filteredData || filteredData.length === 0) return

    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text(getLabel('KYC_Data_Report') || 'KYC Data Report', 14, 15)
    doc.setFontSize(10)
    doc.text(`${getLabel('Generated_On') || 'Generated on'}: ${new Date().toLocaleDateString()}`, 14, 22)

    const tableColumn = [
      getLabel('KYC_ID') || 'KYC ID',
      getLabel('Customer_Name') || 'Customer Name',
      getLabel('Nationality') || 'Nationality',
      getLabel('Country_of_Residence') || 'Resident Country',
      getLabel('Applicant_ID') || 'Applicant ID',
      getLabel('Status') || 'Status'
    ]
    
    const tableRows = filteredData.map((item) => [
      item.kycId,
      item.applicantName,
      item.nationality,
      item.kycCountry,
      item.applicantId,
      item.kycStatus === 'v' ? (getLabel('Verified') || 'Verified') : (getLabel('Unverified') || 'Unverified'),
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    })

    doc.save('kyc_data_report.pdf')
  }

  const handleAddComment = async () => {
    if (newComment.trim() === '') return

    const payload = {
      commentText: newComment,
      user: selectedKYC?.applicantName,
      kycId: selectedKYC?.kycId,
    }

    setLoading(true)

    try {
      const response = await kycservice.createComment(payload)
      setComments((prevComments: any) => [...prevComments, { ...response }])
      setNewComment('')
    } catch (error) {
      console.error('Error while adding comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const getKycDetailsById = async (kycId: string) => {
    try {
      const response:any = await kycservice.getKycById(kycId)
      let image = response?.documents.find((doc: any) => doc?.documentType === 'image'|| doc?.documentType === 'photo')?.documentFrontUrl
    
      console.log("image aa gyi is the",image)
      setImageUrl(image)
      setSelectedKYC(response)
      console.log(response)
      setComments(response?.comments || [])
      if (checkboxOpen) {
        setCheckboxOpen(!checkboxOpen)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const verifyProofType = async (proofType: any) => {
    try {
      setCheckboxOpen(false)
      setCommonLoader(true)
      await kycservice.verifyDocument(proofType?.documentCode, proofType?.kycId)
      await getKycDetailsById(proofType?.kycId)
      setCommonLoader(false)
    } catch (error) {
      console.error('Error calling API:', error)
      setCommonLoader(false)
    }
  }

  const unverifyProofType = async (proofType: any) => {
    try {
      setCheckboxOpen(false)
      setCommonLoader(true)
      await kycservice.unverifyDocument(proofType?.documentCode, proofType?.kycId)
      await kycservice.changeKycStatus('p', proofType?.kycId)
      await getKycDetailsById(proofType?.kycId)
      setCommonLoader(false)
    } catch (error) {
      console.error('Error calling API:', error)
    }
  }

  const openDrawer = (row: any) => {
    setSelectedKYC(row)
    setIsDrawerOpen(true)
    getKycDetailsById(row?.kycId)
  }

  const closeDrawer = () => {
    setSelectedKYC(null)
    setIsDrawerOpen(false)
    getApplicantKYCData()
  }

  const handleClose = () => {
    setIsDrawerOpen(false)
    setselectedVerifcationOpen(false)
    getApplicantKYCData()
  }

  return (
    <Box sx={{ width: '80vw', height: '70vh' }}>
      <HasPermission permission={'canRead'} module={local_service.get_modules()?.KYC}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" gutterBottom>
            <strong>{getLabel('Know_Your_Customer') || 'Know Your Customer'}</strong>
          </Typography>
        </Box>

        <Box
          sx={{
            width: '80vw',
            height: '70vh',
          }}
        >
          <DataGrid
            sx={{ width: '100%' }}
            rows={filteredData || []}
            getRowId={(row) => row.kycId}
            columns={KycColumns || []}
            filterModel={filterModel}
            onFilterModelChange={(model) => setFilterModel(model)}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 20, page: 0 },
              },
            }}
            pageSizeOptions={[10]}
            loading={isLoading}
            slots={{
              loadingOverlay: LoaderUI.LoadingOverlay,
              toolbar: CustomToolbar,
            }}
            disableColumnMenu
          />
        </Box>
      </HasPermission>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={closeDrawer}
        PaperProps={{
          sx: { width: '70%', height: '100%', padding: 1 },
        }}
      >
        <Box>
          <Box p={3}>
            <Box mb={6} display="flex" alignItems="center">
              <Typography
                variant="h5"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  p: '0.7%',
                  color: 'white',
                }}
              >
                {getLabel('KYC_ID') || 'KYC ID'} : {selectedKYC?.kycId}
              </Typography>

              <Typography
                variant="subtitle1"
                sx={{
                  backgroundColor: selectedKYC?.kycStatus === 'v' ? 'green' : 'red',
                  color: 'white',
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 100,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  ml: 2,
                  fontWeight: 'bold',
                }}
              >
                {selectedKYC?.kycStatus === 'v' 
                  ? (getLabel('Verified') || 'Verified') 
                  : (getLabel('Unverified') || 'Unverified')}
              </Typography>

              <Button
                variant="contained"
                color="success"
                onClick={handleClose}
                sx={{
                  ml: '55%',
                  height: 50,
                }}
              >
                {getLabel('Close') || 'Close'}
              </Button>
            </Box>

            <Grid container>
              <Grid item xs={2} p={3}>
                <Avatar
                  src={imageUrl
                    ?.replace('http://164.90.252.179/', 'https://api.impronics.com/uat/')
                    .replace('http://64.227.139.142/', 'https://api.impronics.com/')
                  }
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    border: '4px solid',
                    borderColor: selectedKYC?.kycStatus === 'v' ? 'green' : 'red',
                    objectFit: 'cover',
                  }}
                />
              </Grid>
              <Grid item xs={10}>
                <Typography variant="h6" gutterBottom color={theme.palette.secondary.main}>
                  <strong>{getLabel('Applicant_Details') || 'Applicant Details'}</strong>
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <TextField
                      label={getLabel('Applicant_ID') }
                      variant="filled"
                      fullWidth
                      defaultValue={selectedKYC?.applicantId}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label={getLabel('Customer_Name') || 'Customer Name Test'}
                      variant="filled"
                      fullWidth
                      defaultValue={selectedKYC?.applicantName}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label={getLabel('Nationality') || 'Nationality'}
                      variant="filled"
                      fullWidth
                      defaultValue={selectedKYC?.nationality}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label={getLabel('Date') || 'Date'}
                      variant="filled"
                      fullWidth
                      defaultValue={selectedKYC?.utcDatetime}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField 
                      fullWidth 
                      label={getLabel('Country_of_Residence') || 'Residence Country'} 
                      variant="filled" 
                      defaultValue={selectedKYC?.residentialAddressCountry} 
                      disabled 
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: 'grey', marginBottom: '1000px' }}>
                      {getLabel('Permanent_Address') || 'Permanent Address'}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField 
                          label={getLabel('Address_Line_1') || 'Address Line 1'} 
                          variant="filled" 
                          fullWidth 
                          defaultValue={selectedKYC?.residentialAddressLine1} 
                          disabled 
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField 
                          label={getLabel('Address_Line_2') || 'Address Line 2'} 
                          variant="filled" 
                          fullWidth 
                          defaultValue={selectedKYC?.residentialAddressLine2} 
                          disabled 
                        />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField 
                          label={getLabel('Suburb') || 'Suburb'} 
                          variant="filled" 
                          fullWidth 
                          defaultValue={selectedKYC?.residentialAddressSuburb} 
                          disabled 
                        />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField 
                          label={getLabel('City') || 'City'} 
                          variant="filled" 
                          fullWidth 
                          defaultValue={selectedKYC?.residentialAddressCity} 
                          disabled 
                        />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField
                          label={getLabel('State_Province') || 'State/Province'}
                          variant="filled"
                          fullWidth
                          defaultValue={selectedKYC?.residentialAddressStateProvince}
                          disabled
                        />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField 
                          label={getLabel('Postal_Code') || 'Postal Code'} 
                          variant="filled" 
                          fullWidth 
                          defaultValue={selectedKYC?.residentialAddressPostalCode} 
                          disabled 
                        />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField 
                          label={getLabel('Country') || 'Country'} 
                          variant="filled" 
                          fullWidth 
                          defaultValue={selectedKYC?.residentialAddressCountry} 
                          disabled 
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'grey',
                      }}
                    >
                      {getLabel('Postal_Address') || 'Postal Address'}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField 
                          label={getLabel('Address_Line_1') || 'Address Line 1'} 
                          disabled 
                          fullWidth 
                          defaultValue={selectedKYC?.postalAddressLine1} 
                          variant="filled" 
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField 
                          label={getLabel('Address_Line_2') || 'Address Line 2'} 
                          disabled 
                          fullWidth 
                          defaultValue={selectedKYC?.postalAddressLine2} 
                          variant="filled" 
                        />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField 
                          label={getLabel('Suburb') || 'Suburb'} 
                          variant="filled" 
                          fullWidth 
                          defaultValue={selectedKYC?.postalAddressSuburb} 
                          disabled 
                        />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField 
                          label={getLabel('City') || 'City'} 
                          fullWidth 
                          defaultValue={selectedKYC?.postalAddressCity} 
                          variant="filled" 
                          disabled 
                        />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField
                          label={getLabel('State_Province') || 'State/Province'}
                          fullWidth
                          variant="filled"
                          disabled
                          defaultValue={selectedKYC?.postalAddressStateProvince}
                        />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField
                          label={getLabel('Postal_Code') || 'Postal Code'}
                          fullWidth
                          variant="filled"
                          disabled
                          defaultValue={selectedKYC?.postalAddressPostalCode}
                        />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField
                          label={getLabel('Country') || 'Country'}
                          fullWidth
                          variant="filled"
                          disabled
                          defaultValue={selectedKYC?.postalAddressCountry}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Box mt={4}>
              <Typography variant="h6" gutterBottom color={theme.palette.secondary.main}>
                <strong>{getLabel('KYC_Documents') || 'KYC Documents'}</strong>
              </Typography>
              {selectedKYC?.documents?.map(
                (proofType: any) => (
                  <Grid container spacing={2} alignItems="center" mt={1} key={proofType}>
                    <Grid item xs={2}>
                      <TextField 
                        label={getLabel('Document_Name') || 'Document Name'} 
                        fullWidth 
                        defaultValue={proofType?.document?.documentType} 
                        disabled 
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        label={getLabel('Verification_Type') || 'Verification Type'}
                        fullWidth
                        defaultValue={proofType?.document?.complianceProcess === 'A' ? 'Auto' : 'Manual'}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField 
                        label={getLabel('Document_Status') || 'Document Status'} 
                        fullWidth 
                        defaultValue="Uploaded" 
                        disabled 
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          textAlign: 'center',
                        }}
                      >
                        <a href={`${proofType?.documentFrontUrl}`} target="_blank" rel="noopener noreferrer">
                          {getLabel('View_More') || 'View More'}
                        </a>
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography
                        style={{
                          backgroundColor: proofType.verificationStatus === 'va' ? '#C8E6C9' : '#FFCDD2',
                          borderRadius: '4px',
                          textAlign: 'center',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '4px 8px',
                        }}
                      >
                        {proofType.verificationStatus === 'va' ? (
                          <>
                            {getLabel('Verified') || 'Verified'}
                            <IconButton
                              onClick={async () => {
                                setCheckboxOpen(true)
                                setProoftype(proofType)
                              }}
                              disabled={
                                proofType.verificationStatus === 'v' ||
                                !helper_service.checkUserHasPermission(local_service.get_modules()?.KYC, 'canUpdate')
                              }
                            >
                              <CloseIcon />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            {getLabel('Pending') || 'Pending'}
                            <IconButton
                              onClick={async () => {
                                setCheckboxOpen(true)
                                setProoftype(proofType)
                              }}
                              disabled={
                                proofType.verificationStatus === 'va' ||
                                !helper_service.checkUserHasPermission(local_service.get_modules()?.KYC, 'canUpdate')
                              }
                            >
                              <CheckCircleOutlineIcon />
                            </IconButton>
                          </>
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton
                        onClick={() => {
                          setOpen(true)
                        }}
                      >
                        <Comment />
                      </IconButton>
                    </Grid>
                  </Grid>
                ),
              )}
            </Box>
          </Box>
        </Box>
      </Drawer>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            maxHeight: '80vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
            overflowY: 'auto',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{getLabel('Comments') || 'Comments'}</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ my: 2 }} />

          <List sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
            {comments.length === 0 ? (
              <Typography variant="body2" align="center" color="text.secondary" sx={{ py: 2 }}>
                {getLabel('No_Comments') || 'No comments available'}
              </Typography>
            ) : (
              comments.map((comment: any, index: any) => (
                <Box key={comment?.commentId} sx={{ position: 'relative', pl: 3 }}>
                  {index !== comments.length - 1 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: 12,
                        height: '100%',
                        width: 2,
                        bgcolor: 'gray',
                      }}
                    />
                  )}
                  <ListItem
                    sx={{
                      gap: 1,
                      mt: -0.5,
                      mb: 1,
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      padding: 0,
                    }}
                  >
                    <Avatar sx={{ bgcolor: 'primary.main', width: 35, height: 35 }}>{comment?.user?.charAt(0).toUpperCase()}</Avatar>

                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography sx={{ fontWeight: 'bold' }}>{comment?.user}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {dayjs(comment?.commentDate).format('DD/MM/YYYY hh:mm')}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5 }}>
                        {comment?.commentText}
                      </Typography>
                    </Box>
                  </ListItem>
                </Box>
              ))
            )}
          </List>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder={getLabel('Add_Comment') || 'Add a comment...'}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <IconButton onClick={handleAddComment} color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <Send />}
            </IconButton>
          </Box>
        </Box>
      </Modal>

      {checkboxOpen && (
        <ConfirmationModal
          showIcon={false}
          confirmBtnText={prooftype?.verificationStatus === 'va' 
            ? (getLabel('Unverify') || 'Unverify') 
            : (getLabel('Verify') || 'Verify')}
          isOpen={checkboxOpen}
          message={prooftype?.verificationStatus === 'va' 
            ? (getLabel('Unverify_Confirmation') || 'Do you want to unverify this document?') 
            : (getLabel('Verify_Confirmation') || 'Do you want to verify this document?')}
          handleConfirm={() => {
            prooftype?.verificationStatus === 'va' ? unverifyProofType(prooftype) : verifyProofType(prooftype)
          }}
          handleClose={() => setCheckboxOpen(false)}
        />
      )}

      <VerifyDocumentModal
        open={selectedVerifcationOpen}
        onClose={handleClose}
        //@ts-ignore
        sampledata={selectedDocumentModal}
      />
    </Box>
  )
}

export default KYCPage