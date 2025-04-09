import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Drawer,
  Grid,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
import { Chuks } from '@/assets/images'
import { Customer } from '@/types/customer.type'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { ApplicantService } from '@/services/applicant.service'
import { KycService } from '@/services/kyc.service'
import { Close, Comment, Coronavirus, Send } from '@mui/icons-material'
import axios from 'axios'
import { loaderStateNew } from '@/states/state'
import { useRecoilState } from 'recoil'
// import { theme } from '@/contants/theme'
// const mockData = [
//   {
//     id: 1,
//     kycId: 'KYCIN0012',
//     customerName: 'Chakshu Chopra',
//     nationality: 'Indian',
//     residentCountry: 'South Africa',
//     idProof: 'Passport',
//     addressProof: 'Utility Bill',
//     verificationStatus: 'Pending',
//     pemanentAddress: {
//       country: 'South Africa',
//       zipCode: '233002',
//       state: 'CapTown',
//       city: 'Labnon',
//     },
//     currentAddress: {
//       country: 'South Africa',
//       zipCode: '233002',
//       state: 'CapTown',
//       city: 'Labnon',
//     },

//     kyc: {
//       idProof: {
//         idType: 'Pasport',
//         verificationType: 'Sybrin',
//         documentStatus: 'uploaded/NotUploaded',
//         documentLink: 'www.aws.....***.com',
//         verificationStatus: '',
//         documnentNumber: '23232323232',
//         expiryDate: '12/21/2021',
//         nameAsPerDocument: 'Chakshu Document',
//         issuingAuthoriy: 'SA Republic',
//         additionalComment: '',
//       },

//       addressProof: {
//         idType: 'Pasport',
//         verificationType: 'Sybrin',
//         documentStatus: 'uploaded/NotUploaded',
//         documentLink: 'www.aws.....***.com',
//         verificationStatus: '',
//         documnentNumber: '23232323232',
//         expiryDate: '12/21/2021',
//         nameAsPerDocument: 'Chakshu Document',
//         issuingAuthoriy: 'SA Republic',
//         additionalComment: '',
//       },

//       incomeProof: {
//         idType: 'Passport',
//         verificationType: 'Sybrin',
//         documentStatus: 'uploaded/NotUploaded',
//         documentLink: 'www.aws.....***.com',
//         verificationStatus: '',
//         documnentNumber: '23232323232',
//         expiryDate: '12/21/2021',
//         nameAsPerDocument: 'Chakshu Document',
//         issuingAuthoriy: 'SA Republic',
//         additionalComment: '',
//         failureCause: 'Poor Qulaity Image',
//       },
//     },
//     // dob: '1990-05-20',
//     // phone: '+91 1234567890',
//     // email: 'chakshu@gmail.com',
//     kycSubmittedOn: '2024-01-01',
//     verifiedOn: 'N/A',

//     //new
//     kycStatus: 'v',
//     kycStartDate: '2025-01-01T10:00:00Z',
//     kycApprovalDate: '2025-01-05T10:00:00Z',
//     kycExpiryDate: '2025-12-31T23:59:59Z',
//     kycCountry: 'IN',
//     dob: '1990-01-01',
//     email: 'john.doe@example.com',
//     applicantName: 'John Doe',
//     permanentAddressCountry: 'India',
//     permanentAddressLine1: '123, Main Street',
//     permanentAddressLine2: 'Apartment 5B',
//     permanentAddressSuburb: 'Suburb A',
//     permanentAddressCity: 'City X',
//     permanentAddressState: 'State Y',
//     permanentAddressZip: '123456',
//     currentAddressLine1: '456, Secondary Street',
//     currentAddressLine2: 'Apartment 10A',
//     currentAddressSuburb: 'Suburb B',
//     currentAddressCity: 'City Z',
//     currentAddressState: 'State W',
//     currentAddressZip: '654321',
//     currentAddressCountry: 'India',
//     kycCustomerImage: 'https://example.com/images/kyc_customer.jpg',
//     applicantId: 'A12345',
//     sanctionPartnerId: 'SP123',

//     documents: [
//       {
//         //new

//         kycId: 'KYC12345678',
//         documentCode: 'DOC123',
//         uploadDate: '2025-01-05T06:30:00.000+00:00',
//         verificationStatus: 'va',
//         documentUrl: 'https://example.com/documents/passport.pdf',
//         verificationStatusComments: 'Verified',
//       },
//       {
//         documentCode: 'DOC124',
//         uploadDate: '2025-01-10T12:00:00Z',
//         verificationStatus: 'vp',
//         documentUrl: 'https://example.com/documents/d2.pdf',
//         verificationStatusComments: 'Pending',
//       },
//     ],
//   },
// ]

const KYCPage = () => {
  console.log('sdffsdfas')
  const [open, setOpen] = useState(false);
  const theme = useTheme()
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
  const[loader,setCommonLoader]=useRecoilState(loaderStateNew)


  const [comments, setComments] = useState([
    {
      commentId: "CMT1",
      commentText: "Document verification in progress.",
      commentDate: "2025-01-06T10:00:00Z",
      user: "admin",
    },
    {
      commentId: "CMT2",
      commentText: "Document uploaded for verification.",
      commentDate: "2025-01-05T12:30:00Z",
      user: "user1",
    },
  ]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

 

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;

    const payload = {
      commentText: newComment,
      commentDate: new Date().toISOString(),
      user: selectedKYC?.applicantName, // Replace with the actual user info
    };

    setLoading(true);

    try {
      // API Call
    
      const response = await kycservice.createComment(payload);

      if (
        
        //@ts-ignore
        response.status === 200) {
        // Update the comments list with the new comment
        setComments((prevComments) => [
          ...prevComments,
          { ...payload, commentId: `CMT${comments.length + 1}` },
        ]);
        setNewComment(""); // Clear the input field
      } else {
       
      }
    } catch (error) {
      console.error("Error while adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }))
  }

  let kycservice=new KycService()
  const verifyProofType = async (proofType:any) => {
    try {
      // Your API call logic here
      console.log(selectedKYC);
      console.log(proofType)
      console.log(proofType.kycId,proofType.documentCode)
      kycservice.verifyDocument(proofType?.id?.documentCode,proofType?.id?.kycId).then(data=>{

        console.log(data)

        window.location.reload()
      }).catch(err=>{

        console.log(err)
      })
      // kycservice.verifyDocument(pro)
    } catch (error) {
      console.error("Error calling API:", error);
    }
  };
  let applicant_service = new ApplicantService()

  useEffect(() => {
    console.log("setting Loader")
    setCommonLoader(true)
    applicant_service.getApplicantKyc().then((data) => {
      
      // console.log(data)

      console.log('data is here', data)
      setMockData(data)
       //@ts-ignores
      setFilteredData(data)
      setCommonLoader(false)




    })



  }, [])

  const applyFilters = () => {
    const filtered = mockdata?.filter((item) => {
      return (
        (filterValues.kycId === '' || item.kycId.includes(filterValues.kycId)) &&
        (filterValues.verificationStatus === '' || item.verificationStatus === filterValues.verificationStatus) &&
        (filterValues.country === '' || item.residentCountry === filterValues.country)
      )
    })
    setFilteredData(filtered)
  }

  const openDrawer = (row: any) => {
    setSelectedKYC(row)
    setIsDrawerOpen(true)
console.log(row)
    kycservice.getComment(row)
  }

  const closeDrawer = () => {
    setSelectedKYC(null)
    setIsDrawerOpen(false)
  }

  const handleClose = () => {
    console.log('thi is the data')
    setIsDrawerOpen(false)
    setselectedVerifcationOpen(false)
  }
  return (
    <Box padding={3}>
      <VerifyDocumentModal open={selectedVerifcationOpen} onClose={handleClose}
      
       //@ts-ignore
      sampledata={selectedDocumentModal}></VerifyDocumentModal>

      <Typography variant="h4" gutterBottom>
        <strong>Know-Your Customer</strong>
      </Typography>

      {/* Filters */}
      {/* <Grid container spacing={2} marginBottom={2}>
        <Grid item xs={4}>
          <TextField
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#000',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                // Class for the border around the input field
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2e2e2e',
                  borderWidth: '2px',
                },
              },
              // Class for the label of the input field
              '& .MuiInputLabel': {
                color: 'red',
                fontWeight: 'bold',
              },
            }}
            //@ts-ignore
            sx={{
              // Label
              '& .MuiInputLabel-standard': {
                // color: theme.palette.primary.main,
                fontWeight: 'bold',
                '&.Mui-focused': {
                  color: ' theme.palette.primary.main',

                  fontSize: '20px',
                  //   fontWeight: '400px',
                },
              },
            }}
            variant="standard"
            fullWidth
            label="KYC ID"
            value={filterValues.kycId}
            onChange={(e) => handleFilterChange('kycId', e.target.value)}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="Verification Status"
            variant="standard"
            select
            value={filterValues.verificationStatus}
            onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
            sx={{
              // Label
              '& .MuiInputLabel-standard': {
                // color: theme.palette.primary.main,
                fontWeight: 'bold',
                '&.Mui-focused': {
                  color: ' theme.palette.primary.main',

                  fontSize: '20px',
                  //   fontWeight: '400px',
                },
              },
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Verified">Verified</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="Country"
            variant="standard"
            select
            value={filterValues.country}
            sx={{
              // Label
              '& .MuiInputLabel-standard': {
                // color: theme.palette.primary.main,
                fontWeight: 'bold',
                '&.Mui-focused': {
                  color: ' theme.palette.primary.main',

                  fontSize: '20px',
                  //   fontWeight: '400px',
                },
              },
            }}
            onChange={(e) => handleFilterChange('country', e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="South Africa">South Africa</MenuItem>
            <MenuItem value="USA">USA</MenuItem>
          </TextField>
        </Grid>
      </Grid>
      <Button variant="contained" onClick={applyFilters}>
        Apply Filters
      </Button> */}

      {/* Data Grid */}
      <Box
        marginTop={2}
        sx={{
          width: '73vw',
          height:'80vh',
          '& .super-app-theme--header': {
            backgroundColor: '#005099',
            color: 'white',
          },
        }}
      >
        <DataGrid
          sx={{
            width: '100%',
          }}
          rows={filteredData}
          getRowId={(row) => row.kycId}
          
           //@ts-ignore
          columns={[
            // {
            //   field: 'id',
            //   headerName: 'S. No',
            //   flex: 1,
            //   headerClassName: 'super-app-theme--header',
            // },
            {
              field: 'kycId',
              headerName: 'KYC ID',
              flex: 1,
              headerClassName: 'super-app-theme--header',
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
            { field: 'permanentAddressCountry', headerName: 'Resident Country', flex: 1, headerClassName: 'super-app-theme--header' },
            ,

            { field: 'applicantId', headerName: 'Applicant ID', flex: 1, headerClassName: 'super-app-theme--header' },

        
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
              renderCell: (params) => (
                <Button variant="outlined" onClick={() => openDrawer(params.row)}>
                  View More
                </Button>
              ),
            },
          ]}
          //@ts-ignore
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </Box>

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
                {selectedKYC?.kycStatus == 'v' ? 'verified' : 'unverified'}
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
                    <TextField label="Customer Name" variant="filled"
                     //@ts-ignore
                    defaultValue={selectedKYC?.applicantName} disabled />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField label="Nationality" variant="filled" defaultValue="Indian"
                    
                     //@ts-ignore
                    defaultValue={selectedKYC?.nationality} disabled />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField label="Residence Country" variant="filled" defaultValue={selectedKYC?.permanentAddressCountry} disabled />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: 'grey', marginBottom: '1000px' }}>
                      Permanent Address
                    </Typography>
                    <TextField
                      label="Address"
                      variant="filled"
                      fullWidth
                      defaultValue={selectedKYC?.permanentAddressLine1 + selectedKYC?.permanentAddressLine2}
                      disabled
                    />
                    <Grid container spacing={2} mt={1}>
                      <Grid item xs={3}>
                        <TextField label="City" variant="filled" fullWidth defaultValue={selectedKYC?.permanentAddressCity} disabled />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField label="State" variant="filled" fullWidth defaultValue={selectedKYC?.permanentAddressState} disabled />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField label="Zip Code" variant="filled" fullWidth defaultValue={selectedKYC?.permanentAddressZip} disabled />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField label="Country" variant="filled" fullWidth defaultValue={selectedKYC?.permanentAddressCountry} disabled />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'grey',
                        marginbutton: '2%',
                      }}
                    >
                      Current Address
                    </Typography>
                    <TextField
                      label="Address"
                      disabled
                      fullWidth
                      defaultValue={selectedKYC?.currentAddressLine1 + selectedKYC?.currentAddressLine2}
                      variant="filled"
                    />
                    <Grid container spacing={2} mt={1}>
                      <Grid item xs={3}>
                        <TextField label="City" fullWidth defaultValue={selectedKYC?.currentAddressCity} variant="filled" disabled />
                      </Grid>
                      <Grid item xs={3}>
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
                      <Grid item xs={3}>
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
                      <Grid item xs={3}>
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
                <Box
                  width={100}
                  component="img"
              
                  height={100}
                  border="2px solid  green"
                  borderRadius="50%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                ></Box>
                <Typography mt={2} color="green">
                  <strong>Matched with ID Proof</strong>
                </Typography>
              </Grid>
            </Grid>

            {/* KYC Status Section */}
            <Box mt={4}>
              <Typography variant="h6">
                <strong>KYC Status</strong>
              </Typography>
              {selectedKYC?.documents?.map(
                 //@ts-ignore
                (proofType) => (
                <Grid container spacing={2} alignItems="center" mt={1} key={proofType}>
                  <Grid item xs={2}>
                    <TextField label="Document Name" fullWidth defaultValue={proofType?.documentName} disabled />
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
                        <a href={`http://64.227.139.142/files/${proofType?.documentUrl.split('/').pop()}` } target="_blank" rel="noopener noreferrer">
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
        backgroundColor:
          proofType.verificationStatus === 'va' ? '#C8E6C9' : '#FFCDD2',
        borderRadius: '4px',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 8px',
      }}
    >
      {proofType.verificationStatus === 'va' ? (
        'Verified'
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
      )}
    </Typography>

                 


    

                  </Grid>
                  <Grid item xs={2}>
                    {/* <TextField label="Additional Comments" fullWidth defaultValue={proofType?.verificationStatusComments} disabled /> */}
                    <IconButton onClick={() => {setOpen(true)
                    console.log(selectedKYC?.comments)
                    setComments([
                      {
                        commentId: "CMT1",
                        commentText: "Document verification in progress.",
                        commentDate: "2025-01-06T10:00:00Z",
                        user: "admin",
                      },
                      {
                        commentId: "CMT2",
                        commentText: "Document uploaded for verification.",
                        commentDate: "2025-01-05T12:30:00Z",
                        user: "user1",
                      },
                    ])

                    kycservice.getComment(selectedKYC?.kycId)
// setComments()



                    }}>
        <Comment />
      </IconButton>

              
                  </Grid>
                </Grid>
              ))}
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
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            maxHeight: "80vh",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
            overflowY: "auto",
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
          <List sx={{ maxHeight: "50vh", overflowY: "auto" }}>
            {comments.map((comment, index) => (
              <Box key={comment.commentId} sx={{ position: "relative", pl: 3 }}>
                {/* Vertical Line Connector */}
                {index !== comments.length - 1 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: 12,
                      height: "100%",
                      width: 2,
                      bgcolor: "gray",
                    }}
                  />
                )}

                {/* Comment Item */}
                <ListItem sx={{ alignItems: "flex-start", gap: 1 }}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 30, height: 30 }}>
                    {comment.user.charAt(0).toUpperCase()}
                  </Avatar>
                  <ListItemText
                    primary={comment.user}
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ color: "text.primary" }}>
                          {comment.commentText}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
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



    </Box>
  )
}

export default KYCPage
