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
  ListItemText,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import VerifyDocumentModal from '@/components/verify-document'
import { Customer } from '@/types/customer.type'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { ApplicantService } from '@/services/applicant.service'
import { KycService } from '@/services/kyc.service'
import { Close, Comment, Send } from '@mui/icons-material'
import { loaderStateNew, selectedCountryState } from '@/states/state'
import { useRecoilState } from 'recoil'
import CloseIcon from '@mui/icons-material/Close'
import { useNavigate } from 'react-router-dom'
import ConfirmationModal from '@/components/logout/logout.component'
import { LocalStorageService } from '@/helpers/local-storage-service'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'

const KYCPage = () => {
  const [open, setOpen] = useState(false)
  const [filterValues, setFilterValues] = useState({
    kycId: '',
    verificationStatus: '',
    country: '',
  })
  const [filteredData, setFilteredData] = useState<Array<Customer>>([])
  const [selectedKYC, setSelectedKYC] = useState<any>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedDocumentModal, setSelectedDocumentModel] = useState({})
  const [selectedVerifcationOpen, setselectedVerifcationOpen] = useState(false)
  const [mockdata, setMockData] = useState<Array<any>>([])
  const [loader, setCommonLoader] = useRecoilState(loaderStateNew)
  const [checkboxOpen, setCheckboxOpen] = useState(false)
  const [kycstatus, setKycStatus] = useState('p')
  const [selectedcountry, setselectedCountry] = useRecoilState(selectedCountryState)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [prooftype, setProoftype] = useState()

  const navigate = useNavigate()
  const theme = useTheme()
  const local_service = new LocalStorageService()
  let applicant_service = new ApplicantService()
  let kycservice = new KycService()
  const helper_service = new HelperService()

  const [comments, setComments] = useState([
    {
      commentId: 'CMT1',
      commentText: 'Document verification in progress.',
      commentDate: '2025-01-06T10:00:00Z',
      user: 'admin',
    },
    {
      commentId: 'CMT2',
      commentText: 'Document uploaded for verification.',
      commentDate: '2025-01-05T12:30:00Z',
      user: 'user1',
    },
  ])

  const KycColumns = [
    {
      field: 'kycId',
      headerName: 'KYC ID',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return (
          <a style={{ cursor: 'pointer', color: 'rgb(25, 118, 210)' }} onClick={() => openDrawer(params.row)}>
            {params.row.kycId}
          </a>
        )
      },
    },
    {
      field: 'applicantName',
      headerName: 'Customer Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'nationality',
      headerName: 'Nationality',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'kycCountry',
      headerName: 'Resident Country',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'applicantId',
      headerName: 'Applicant ID',
      flex: 1,
      headerClassName: 'super-app-theme--header',

      renderCell: (params: any) => {
        return (
          <a
            style={{ cursor: 'pointer', color: 'rgb(25, 118, 210)' }}
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
      headerName: 'Verification Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        let color: 'success' | 'warning' | 'error' = 'success'
        if (params.value === '') color = 'warning'
        else if (params.value === 'Rejected') color = 'error'

        return <Chip label={params.value == 'v' ? 'verified' : 'unverified'} color={params.value == 'v' ? 'success' : 'warning'} variant="outlined" />
      },
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <Button variant="outlined" onClick={() => openDrawer(params.row)}>
          View More
        </Button>
      ),
    },
  ]

  useEffect(() => {
    setCommonLoader(true)
    applicant_service.getApplicantKyc(selectedcountry == 'SA' ? 'ZA' : 'IN').then((data) => {
      setMockData(data)
      //@ts-ignores
      setFilteredData(data)
      setCommonLoader(false)
    })
  }, [])

  const handleAddComment = async () => {
    if (newComment.trim() === '') return

    const payload = {
      commentText: newComment,

      user: selectedKYC?.applicantName, // Replace with the actual user info
      kycId: selectedKYC?.kycId,
    }

    setLoading(true)

    try {
      // API Call

      const response = await kycservice.createComment(payload)

      if (
        //@ts-ignore
        response.status === 200
      ) {
        // Update the comments list with the new comment
        setComments((prevComments: any) => [...prevComments, { ...payload, commentId: `CMT${comments.length + 1}` }])
        setNewComment('') // Clear the input field
      } else {
      }
      setNewComment('')
      kycservice.getComment(selectedKYC?.kycId).then((data) => {
        setComments(data.filter((e) => e.kycId == selectedKYC?.kycId))
      })
      kycservice.getComment(selectedKYC?.kycId)

      //@ts-ignore
      kycservice.getComment(row?.kycId).then((data) => {
        //@ts-ignore
        setComments(data.filter((e) => e.kycId == row?.kycI))
      })
    } catch (error) {
      console.error('Error while adding comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const verifyProofType = async (proofType: any) => {
    try {
      // Your API call logic here
      setCommonLoader(true)
      kycservice
        .verifyDocument(proofType?.id?.documentCode, proofType?.id?.kycId)
        .then((data) => {
          console.log(data)
          // window.location.reload()
        })
        .catch((err) => {
          console.log(err)
        })

      applicant_service.getApplicantKyc(selectedcountry == 'SA' ? 'ZA' : 'IN').then((data) => {
        setMockData(data)
        //@ts-ignores
        setFilteredData(data)
        setCommonLoader(false)
        let selected_data = data.filter((e) => e.kycId == proofType?.id?.kycId)
        if (selected_data.length > 0) {
          setSelectedKYC(selected_data[0])
          setKycStatus(selected_data[0]?.kycStatus)
          setCheckboxOpen(false)
        }
      })
      // kycservice.verifyDocument(pro)
    } catch (error) {
      console.error('Error calling API:', error)
    }
  }

  const unverifyProofType = async (proofType: any) => {
    try {
      // Your API call logic here
      setCommonLoader(true)
      kycservice
        .unverifyDocument(proofType?.id?.documentCode, proofType?.id?.kycId)
        .then(() => {
          kycservice.changeKycStatus('p', proofType?.id?.kycId).then(() => {
            applicant_service.getApplicantKyc(selectedcountry == 'SA' ? 'ZA' : 'IN').then((data) => {
              setMockData(data)
              //@ts-ignores
              setFilteredData(data)
              setCommonLoader(false)
              let selected_data = data.filter((e) => e.kycId == proofType?.id?.kycId)
              if (selected_data.length > 0) {
                setSelectedKYC(selected_data[0])
                setKycStatus(selected_data[0]?.kycStatus)
                // setKycStatus(selected_data[0]?.kycstatus)
                setCheckboxOpen(false)
              }
            })
          })

          // window.location.reload()
        })
        .catch((err) => {
          console.log(err)
        })
      // kycservice.verifyDocument(pro)
    } catch (error) {
      console.error('Error calling API:', error)
    }
  }

  const openDrawer = (row: any) => {
    setKycStatus(row?.kycStatus)
    setSelectedKYC(row)
    setIsDrawerOpen(true)
    kycservice.getComment(row?.kycId).then((data) => {
      setComments(data.filter((e) => e.kycId == row?.kycI))
    })
  }

  const closeDrawer = () => {
    setSelectedKYC(null)
    setIsDrawerOpen(false)
  }

  const handleClose = () => {
    setIsDrawerOpen(false)
    setselectedVerifcationOpen(false)
  }
  return (
    <Box padding={3}>
      <HasPermission permission={'canRead'} module={local_service.get_modules()?.KYC}>
        <Typography variant="h4" gutterBottom>
          <strong>Know-Your Customer</strong>
        </Typography>

        <Box
          marginTop={2}
          sx={{
            width: '80vw',
            height: '65vh',
            '& .super-app-theme--header': {
              backgroundColor: '#005099',
              color: 'white',
            },
          }}
        >
          <DataGrid
            sx={{ width: '100%' }}
            rows={filteredData}
            getRowId={(row) => row.kycId}
            columns={KycColumns || []}
            //@ts-ignore
            pageSize={5}
            rowsPerPageOptions={[5]}
          />
        </Box>
      </HasPermission>

      {/* Full-Screen Drawer */}

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
            {/* Header */}
            <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
              <Typography
                variant="h5"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  p: '0.5%',
                  color: 'white',
                  borderRadius: '10px',
                  paddingLeft: '5%',
                  paddingRight: '5%',
                }}
              >
                KYC ID - {selectedKYC?.kycId}
              </Typography>
              <Typography variant="subtitle1" style={{ backgroundColor: '#FFEEBA', padding: '4px 8px', borderRadius: '4px' }}>
                {kycstatus == 'v' ? 'Verified' : 'Unverified'}
              </Typography>
            </Box>

            {/* Applicant Details Section */}
            <Grid container spacing={3}>
              <Grid item xs={8}>
                <Typography variant="h6" gutterBottom>
                  <strong> Applicant Details</strong>
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <TextField
                      label="Applicant ID"
                      variant="filled"
                      fullWidth
                      //@ts-ignore
                      defaultValue={selectedKYC?.applicantId}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Customer Name"
                      variant="filled"
                      //@ts-ignore
                      defaultValue={selectedKYC?.applicantName}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Nationality"
                      variant="filled"
                      defaultValue="Indian"
                      //@ts-ignore
                      defaultValue={selectedKYC?.nationality}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField label="Residence Country" variant="filled" defaultValue={selectedKYC?.permanentAddressCountry} disabled />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: 'grey', marginBottom: '1000px' }}>
                      Permanent Address
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField label="Address Line 1" variant="filled" fullWidth defaultValue={selectedKYC?.permanentAddressLine1} disabled />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField label="Address Line 2" variant="filled" fullWidth defaultValue={selectedKYC?.permanentAddressLine2} disabled />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField label="Suburb" variant="filled" fullWidth defaultValue={selectedKYC?.permanentAddressSuburb} disabled />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField label="City" variant="filled" fullWidth defaultValue={selectedKYC?.permanentAddressCity} disabled />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField label="State" variant="filled" fullWidth defaultValue={selectedKYC?.permanentAddressState} disabled />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField label="Zip Code" variant="filled" fullWidth defaultValue={selectedKYC?.permanentAddressZip} disabled />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField label="Country" variant="filled" fullWidth defaultValue={selectedKYC?.permanentAddressCountry} disabled />
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
                      Postal Address
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField label="Address Line 1" disabled fullWidth defaultValue={selectedKYC?.currentAddressLine1} variant="filled" />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Address Line 2"
                          disabled
                          fullWidth
                          defaultValue={selectedKYC?.currentAddressLine1 + selectedKYC?.currentAddressLine2}
                          variant="filled"
                        />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField label="Suburb" variant="filled" fullWidth defaultValue={selectedKYC?.currentAddressSuburb} disabled />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField label="City" fullWidth defaultValue={selectedKYC?.currentAddressCity} variant="filled" disabled />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField
                          label="State"
                          fullWidth
                          defaultValue="South Africa"
                          variant="filled"
                          disabled
                          //@ts-ignore
                          defaultValue={selectedKYC?.currentAddressState}
                        />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField
                          label="Zip Code"
                          fullWidth
                          defaultValue="South Africa"
                          variant="filled"
                          disabled
                          //@ts-ignore
                          defaultValue={selectedKYC?.currentAddressZip}
                        />
                      </Grid>
                      <Grid item xs={2.3}>
                        <TextField
                          label="Country"
                          fullWidth
                          defaultValue="South Africa"
                          variant="filled"
                          disabled
                          //@ts-ignore
                          defaultValue={selectedKYC?.currentAddressCountry}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={4} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Avatar
                  src="https://via.placeholder.com/100" // Replace with actual image URL
                  sx={{
                    width: 100,
                    height: 100,
                    border: '2px solid green',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {' '}
                  {selectedKYC?.applicantName?.split(' ').length > 0
                    ? selectedKYC?.applicantName.split(' ')[0][0] +
                      ' ' +
                      (selectedKYC?.applicantName.split(' ')[1][0] ? selectedKYC?.applicantName.split(' ')[1][0] : '')
                    : selectedKYC?.applicantName.split(' ')[0]}{' '}
                </Avatar>
                <Typography mt={2} color="green">
                  {/* <strong>Matched with ID Proof </strong> */}
                </Typography>
              </Grid>
            </Grid>

            {/* KYC Status Section */}
            <Box mt={4}>
              <Typography variant="h6">
                <strong>KYC Documents</strong>
              </Typography>
              {selectedKYC?.documents?.map(
                //@ts-ignore
                (proofType) => (
                  <Grid container spacing={2} alignItems="center" mt={1} key={proofType}>
                    <Grid item xs={2}>
                      {/* {JSON.stringify(proofType?.document?.documentName)}
                       */}
                      <TextField label="Document Name" fullWidth defaultValue={proofType?.document?.documentName} disabled />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField label="Verification Type" fullWidth defaultValue="Auto" disabled />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField label="Document Status" fullWidth defaultValue="Uploaded" disabled />
                    </Grid>
                    <Grid item xs={2}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          textAlign: 'center',
                        }}
                      >
                        <u
                          onClick={() => {
                            // setselectedVerifcationOpen(true)
                            // setSelectedDocumentModel(proofType?.documentDetails)
                          }}
                        >
                          {/* <a href={proofType?.documentUrl}>View More</a> */}
                          <a href={`${proofType?.documentUrl.split('/').pop()}`} target="_blank" rel="noopener noreferrer">
                            View More
                          </a>
                          {/* view more */}
                        </u>
                      </Typography>
                      {/* <Button variant="outlined">Uploaded</Button> */}
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
                        {/* {(proofType.verificationStatus === 'va' ||kycstatus=='v')? (

<>
ƒ
        Verified {kycstatus}
        <IconButton
        onClick={async () => {

          setCheckboxOpen(true)

          setProoftype(proofType)
        
          // await unverifyProofType(proofType); // API call
        
        }}
        disabled={proofType.verificationStatus === 'v' }
      >
        <CloseIcon />
      </IconButton>
</>
      ) : (
        <>
          Failed
          <IconButton
            onClick={async () => {
            
              await verifyProofType(proofType); // API call
            
            }}
            disabled={proofType.verificationStatus === 'va' }
          >
            <CheckCircleOutlineIcon />
          </IconButton>
        </>
      )} */}

                        {proofType.verificationStatus === 'va' ? (
                          <>
                            Verified
                            <IconButton
                              onClick={async () => {
                                setCheckboxOpen(true)
                                setProoftype(proofType)
                                // await unverifyProofType(proofType); // API call
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
                            Failed
                            <IconButton
                              onClick={async () => {
                                setCheckboxOpen(true)
                                setProoftype(proofType)
                                // await verifyProofType(proofType); // API call
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
                      {/* <TextField label="Additional Comments" fullWidth defaultValue={proofType?.verificationStatusComments} disabled /> */}
                      <IconButton
                        onClick={() => {
                          setOpen(true)
                          kycservice.getComment(selectedKYC?.kycId).then((data) => {
                            setComments(data.filter((e) => e.kycId == selectedKYC?.kycId))
                          })
                          kycservice.getComment(selectedKYC?.kycId)
                        }}
                      >
                        <Comment />
                      </IconButton>
                    </Grid>
                  </Grid>
                ),
              )}
            </Box>

            {/* Buttons */}
            <Box mt={4} display="flex" justifyContent="flex-end">
              {/* <Button variant="contained" color="primary" style={{ marginRight: 8 }} onClick={handleClose}>
                Save
              </Button> */}
              <Button variant="contained" color="success" onClick={handleClose}>
                close
              </Button>
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
            width: 400,
            maxHeight: '80vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
            overflowY: 'auto',
          }}
        >
          {/* Modal Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Comments</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Comments List */}
          <List sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
            {comments.map((comment, index) => (
              <Box key={comment.commentId} sx={{ position: 'relative', pl: 3 }}>
                {/* Vertical Line Connector */}
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

                {/* Comment Item */}
                <ListItem sx={{ alignItems: 'flex-start', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 30, height: 30 }}>{comment.user.charAt(0).toUpperCase()}</Avatar>
                  <ListItemText
                    primary={comment.user}
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                          {comment.commentText}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {new Date(comment.commentDate).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </Box>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          {/* Add Comment Section */}
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Add a comment..."
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
          //@ts-ignore
          confirmBtnText={prooftype?.verificationStatus === 'va' ? 'Unverify' : 'Verify'}
          isOpen={checkboxOpen}
          //@ts-ignore
          message={prooftype?.verificationStatus === 'va' ? 'Do you want to unverify this document?' : 'Do you want to verify this document?'}
          handleConfirm={() => {
            //@ts-ignore
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
