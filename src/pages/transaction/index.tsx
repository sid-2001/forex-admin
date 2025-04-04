import React, { useEffect, useState } from 'react'
import { Box, Button, Divider, Grid, Typography, Chip, TextField, Drawer, ToggleButton, ToggleButtonGroup, useTheme, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Modal, List, ListItem, ListItemText } from '@mui/material'
import { DataGrid, GridColDef, GridFilterAltIcon } from '@mui/x-data-grid'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useNavigate } from 'react-router-dom'
import { TransactionService } from '@/services/transaction.service'
import {
  Applicant,
  TansactionOutwardCalculated,
  TransactionDetailsResponse,
  TransactionInward,
  TransactionInwardCalclulated,
  TransactionOutward,
} from '@/types/transaction.type'
import { Filter1Outlined, SettingsAccessibilityRounded, Sync } from '@mui/icons-material'
import { useRecoilState } from 'recoil'
import { loaderState, loaderStateNew, selectedCountryState } from '@/states/state'
import { ApplicantService } from '@/services/applicant.service'
import CompliancTool from '@/components/compliance-tool'
import { HelperService } from '@/helpers/helper'
function formatDateTime(timestamp:any) {
  const date = new Date(timestamp);

  // Format Date as DD/MM/YYYY
  const formattedDate = date.toLocaleDateString('en-GB'); 

  // Format Time as HH:MM:SS
  const formattedTime = date.toLocaleTimeString('en-GB', { hour12: false });

  return `${formattedDate} and ${formattedTime}`;
}



const TransactionPage = () => {

  // reporting:e?.transactionOutward?.reportingStatus=="ACK"?"Reported":"Pending",
  //           status:e?.transactionOutward?.transactionStatus=="CR"?"Pending":"Done",

  const helper=new HelperService()

  const columns_outward: GridColDef[] = [
    { field: 'id', headerName: 'Transaction ID', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'destination', headerName: 'Destination', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'value', headerName: 'Amount ', flex: 1, headerClassName: 'super-app-theme--header' },

   
    {
      field: 'applicant',
      headerName: 'Applicant',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => params.value?.applicantId || ''
    },
    


    


    { field: 'forex', headerName: 'Exchange Rate', flex: 1, headerClassName: 'super-app-theme--header' },

    { field: 'charges', headerName: 'Charges', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'currency', headerName: 'Currency', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'final_amount', headerName: 'Settlement Amount INR', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: "stpError",
      headerName: "STP Error",
      flex: 1,
      headerClassName: "super-app-theme--header",
      renderCell: (params) =>
        params.value ? (
          
          <Chip  label={params.value=="N"?"No Error":"Error"} color={params.value=="N"?"success":"error"} />
        
        ) : (
          <Chip onClick={() => {
            setmodalOpen(true)

          }} label="Error" color="error" />
        ),
    },
    // { field: 'destinationBank', headerName: 'Destination Bank', flex: 1, headerClassName: 'super-app-theme--header' },

    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        // <Button variant="contained" color="primary" onClick={() => handleViewMore(params.row)}>
        //   View More
        // </Button>
        // <Button variant="contained" color="primary" startIcon={<VisibilityIcon />} onClick={() => handleViewMore(params.row)}>
        //   View More
        // </Button>
        <>
          <IconButton onClick={() => {
            handleViewMore(params.row)
          }}>
            <VisibilityIcon />
          </IconButton>
          {params?.row?.transactionNumber? <a style={{
              cursor: 'pointer',
            }}
            onClick={()=>navigate(`/bop-details/${params.row.transactionNumber}/${params.row.tran_bop_attempt}`)}>
            View Bop
          </a>:null}
         </>
      ),
    },


    {
      field: "reporting",
      headerName: "Reporting Status",
      flex: 1,
      headerClassName: "super-app-theme--header",
      renderCell: (params) =>
        params?.value?.reporting == "Reported" ? (
          params.value.status
        ) : (
          (
            params?.value?.status
             )
        ),
    },


    

    {
      field: "owCreatedDate",
      headerName: "Date",
      flex: 1,
      headerClassName: "super-app-theme--header",
      renderCell: (
        params
           
        )=>{
 formatDateTime(params.value?.owCreatedDate)

        }
     
    },


    {
      field: "status",
      headerName: "Status",
      flex: 1,
      headerClassName: "super-app-theme--header",
      renderCell: (params) =>
        params?.value?.status == 'Pending' ? (
          <Tooltip title={params?.value?.status || "Unknown Error"} arrow>
            <Chip label="Pending" color="error" />
          </Tooltip>
        ) : (
       params?.value?.status
        ),
    },





  ]



  const inward_columns = [
    { field: 'transactionNumberIw', headerName: 'Transaction Number IW', flex: 1, headerClassName: 'super-app-theme--header'  },
    { field: 'owTransactionNumber', headerName: 'OW Transaction Number', flex: 1, headerClassName: 'super-app-theme--header'  },
    { field: 'sendingCountry', headerName: 'Sending Country', width: 130, headerClassName: 'super-app-theme--header'  },
    { field: 'receivingCountry', headerName: 'Receiving Country', width: 130, headerClassName: 'super-app-theme--header'  },
    { field: 'settlementCurrency', headerName: 'Settlement Currency', width: 150 , headerClassName: 'super-app-theme--header' },
    { field: 'settlementAmount', headerName: 'Settlement Amount', type: 'number', width: 150, headerClassName: 'super-app-theme--header'  },
    { field: 'reportingStatus', headerName: 'Reporting Status', width: 130, headerClassName: 'super-app-theme--header'  },
    // { field: 'destinationBankCode', headerName: 'Destination Bank Code', width: 180, headerClassName: 'super-app-theme--header'  },
    // {
    //   field: 'inCreatedDate',
    //   headerName: 'Created Date',
    //   width: 180,
    //   valueGetter: (params) => new Date(params.value).toLocaleString('en-GB'),
    //    headerClassName: 'super-app-theme--header' 
    // },
    // {
    //   field: 'inModifiedDate',
    //   headerName: 'Modified Date',
    //   width: 180,
    //   valueGetter: (params) => new Date(params.value).toLocaleString('en-GB'),
    //    headerClassName: 'super-app-theme--header' 
    // },
  ];
  

  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [modalOpen, setmodalOpen] = useState(false)

  const [transactionDetails, setTransactionDetails] = useState<any>(null)
  const [transactionType, setTransactionType] = useState('inwards') // Default to 'inwards'

  const [inboundTransaction, setInboundTransaction] = useState<Array<TransactionInward>>([])
  const [outboundTransaction, setOutboundTransaction] = useState<Array<TransactionOutward>>([])
  const [toolopen, setToolOpen] = useState(false)
  const [errors, seterrors] = useState(["Invalid email", "Password too short", "Username required"])

const[selectedCountryOption,setSelectedCountryOption]=useRecoilState(selectedCountryState)
  //@ts-ignore
  const [applicant, setApplicant] = useState<Applicant>(null)

  const [transactionData, setTransactionData] = useState(inboundTransaction)
  const [commonloader, setcommonloader] = useRecoilState(loaderStateNew)
const[selectedCountryoption,setselectedCountryoption]=useRecoilState(selectedCountryState)
  const [userList, setUserList] = useState([])
  const[creattrx,setCreatetrx]=useState('')
  const[zaphierlink,setZaphierLink]=useState('')

  let applicant_service = new ApplicantService()




  useEffect(() => {
    setcommonloader(true)
    applicant_service.getApplicantDetalis().then(data => {


      console.log(data)

      let users = data.map((e) => {
        let benificiary_list = e.beneficiaryList.map((b) => {

          return (



            {
              "benificaryId": b.beneficiaryId,
              "name": b.beneficiaryName,
              "accountHolderName": b.beneficiaryName,
              "accountNumber": b.bankBicCode,
              "bank": b.bankName,
              "ifscCode": b.bankBicCode
            })


        })

        return ({
          "applicantId": e.applicant.applicantId,
          id: e.applicant.applicantId,
          //@ts-ignore
          name: e.applicant?.firstName,
          accountNumber: '**********789',
          profilePhoto: 'https://randomuser.me/api/portraits/women/4.jpg',
          benificary: benificiary_list

        })
      })


      setUserList(users as any)
      setcommonloader(false)

    })

    // console.log(se)

  }, [])




const addpayment=(create_trx:any)=>{

  let trx_service=new TransactionService()
  trx_service.createTransaction(create_trx).then(data=>{

    console.log(data)
  })

  console.log("trx detials",transactionDetails)
  trx_service.createZaphierTransaction({

    amount:(Number(create_trx?.totalpaybleamount)),
    currency:"ZAR"
  }).then(data=>{
 console.log(data?.redirectUrl)
    setZaphierLink(data?.redirectUrl)

    // console.log(data?.redirectUrl)
  })
}

  const handleViewMore = (row: any) => {

    console.log(row)

  let d={
    //@ts-ignore
    benificary:{"benificaryId":  row?.beneficiaryId},
    transferMethod:'Bank Trannsfer',
     destinationCountry:row.destination,
     selectedTimeMethod:{
      "id": 2,
      "time": "8 hours",
      "charges": 5,
      "total": 200,
      "segment": 2
  },
     gatewayStatus:'Success',
     amount:row.value,
    applicant:row.applicantId,
    forex: row.exchangeRates,
    gatewayId:'13122',
     //@ts-ignore
    timecharge:row.charges,
    sourceCurrency:selectedCountryoption=="SA"?"ZAR":"INR",
  
    sourceCountry:selectedCountryoption=='SA'?"ZA":"IN",
    destinationCurrency:selectedCountryoption=='SA'?"INR":"ZAR",
   totalpaybleamount: (Number(row.value)+  Number(row.charges)),
   transactionId:row?.transactionNumber
  
   
} 


setCreatetrx(d as any)

addpayment(d as any)



console.log(d)


    setTransactionDetails(row)
    setDrawerOpen(true)
  }

  let transaction_Service = new TransactionService()


  const trnx = []
  useEffect(() => {

    setcommonloader(true)


    transaction_Service.getInwardTransaction(selectedCountryOption== "IN"?"IN":"SA").then(data=>{
      console.log('Inward Transaction')
      console.log(data)
      setInboundTransaction(data)

  
      
    })

    transaction_Service
      .gettransactions()
      .then((data: TransactionDetailsResponse) => {
        console.log("data-----------------------", data);

        let inbound: Array<TransactionInwardCalclulated>[] | any = data?.transactionDetailsList.map((e: any) => {
          //@ts-ignore
          return ({
            //@ts-ignore
            ...e.transactionInwardList,
            ...e.beneficiary,

            id: e?.transactionInwardList?.transactionNumberIw,
            destination: e?.transactionInwardList?.receivingCountry,
            value: e?.transactionInwardList?.settlementAmount,
            currency: e?.transactionInwardList?.settlementCurrency,
            settlement: helper.roundToTwoFixed( e?.transactionInwardList?.settlementAmount),
            destinationBank: e?.transactionInwardList?.destinationBankCode,
            errorCause: " ",
            forex: e?.transactionOutward?.exchangeRates,
            date: e?.transactionOutward?.owCreatedDate,
            final_amount: e?.transactionOutward?.exchangeRates * e?.transactionOutward?.principalAmount,
            applicant: e?.applicant
          })
        })


        let outbound: Array<TransactionOutward> | any = data?.transactionDetailsList
        ?.map((e) => {
          return {
            ...e.transactionOutward,
            ...e.beneficiary,
            ...e.applicant,
      
            id: e?.transactionOutward?.transactionNumber,
            destination: e?.transactionOutward?.receiveCountry,
            value: e?.transactionOutward?.principalAmount,
            currency: e?.transactionOutward?.settlementCurrency,
            settlement:  helper.roundToTwoFixed( e?.transactionOutward?.principalAmount * e?.transactionOutward?.exchangeRates),
            destinationBank: e?.transactionOutward?.destinationBankBicCode,
            forex:  helper.roundToTwoFixed( e?.transactionOutward?.exchangeRates),
            date: e?.transactionOutward?.owCreatedDate,
  
            reporting: e?.transactionOutward?.reportingStatus,
            status: e?.transactionOutward?.transactionStatus,
            final_amount:  helper.roundToTwoFixed( e?.transactionOutward?.exchangeRates * e?.transactionOutward?.principalAmount),
            applicant: e?.applicant,
          };
        })
        // ?.filter((transaction) => {
        //   if (selectedCountryOption === "IN") {
        //     return (transaction.destination?.toLowerCase() !== "in");
        //   }
        //   else{
        //     return (transaction.destination?.toLowerCase() !== "za");

        //   }

        //   return true; // If selectedCountryOption is not "IN", include all destinations
        // });
      


        let user: Array<Applicant>[] | any = data?.transactionDetailsList.map((e) => {
          return {
            ...e.applicant

          }
        })

     

        // setInboundTransaction([])
        setTransactionData(inbound)
        setOutboundTransaction(outbound)
        setcommonloader(false)


      })
      .catch(
        //@ts-ignore
        (err: any) => {

          console.log("err", err)
        })
  }, [])

  const handleToggleTransactionType = (

    //@ts-ignore
    event, newType) => {
    if (newType) {
      setTransactionType(newType)
      //@ts-ignore
      setTransactionData(newType === 'inwards' ? inboundTransaction : outboundTransaction)
    }
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    // window.location.href = zaphierlink;
  
   
  }
  const theme = useTheme()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  // Open the dialog
  const handleOpen = () => {
    setOpen(true);
  };

  // Close the dialog
  const handleClose = () => {
    setOpen(false);
   
  };

  // Handle applying filters
  const handleApply = () => {
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);
    setOpen(false);
  };

  return (
    <Box sx={{ width: '100%' }}>



      <Typography variant="h4" gutterBottom>
        <strong>Transactions</strong>
      </Typography>
      <ToggleButtonGroup value={transactionType} exclusive onChange={handleToggleTransactionType} sx={{ mb: 2 }}>
        <ToggleButton value="inwards" sx={{ backgroundColor: '#005099', color: 'white' }}>
          Inwards
        </ToggleButton>
        <ToggleButton value="outwards" sx={{ backgroundColor: '#005099', color: 'white' }}>
          Outwards
        </ToggleButton>
      </ToggleButtonGroup>

      <Box
        marginTop={2}
        sx={{
          width: '80vw',
          height: '80vh',

          '& .super-app-theme--header': {
            backgroundColor: '#005099',
            color: 'white',
          },
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              alignSelf: 'flex-end',
            }}
          >




            <IconButton onClick={() => setToolOpen(true)}>
              <SettingsAccessibilityRounded />
            </IconButton>

            <IconButton onClick={() => {

              navigate('/recon')

            }} color="primary">
              <Sync sx={{
                marginBottom: "10%"
              }} />
            </IconButton>

            <Button
              variant="outlined"
              sx={{
                marginBottom: '10%',
              }}
              onClick={
                //@ts-ignore
                (e) => {
                  // console.log()
                  navigate('/sendmoney')
                }}
            >
              + Transaction
            </Button>
          </div>
        </div>
        {


          transactionType == 'inwards' ? (<DataGrid
            rows={inboundTransaction?.length>0?inboundTransaction:[]}
            //@ts-ignore
            columns={inward_columns}
            getRowId={(row) => row?.transactionNumberIw}
            //@ts-ignore
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-root': {
                border: '1 px solid blue',
              },
              '& .MuiDataGrid-cell': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
          />) : (<DataGrid
            rows={outboundTransaction}
            columns={columns_outward}
            getRowId={(row) => row.id}
            //@ts-ignore
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-root': {
                border: '1 px solid blue',
              },
              '& .MuiDataGrid-cell': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
          />)
        }

      </Box>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={closeDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: '60%',
            padding: 2,
            backgroundColor: 'white',
          },
        }}
      >
        {transactionDetails && (
          <Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                marginBottom: 2,
                color: 'white',
                textAlign: 'center',
                backgroundColor: theme.palette.primary.main,
                width: '40%',
                padding: '1%',
                borderRadius: '3%',
              }}
            >
              TRN ID- {transactionDetails.id}
            </Typography>
            <Chip label="Pending" color="warning" sx={{ marginBottom: 2 }} />
            <Divider sx={{ my: 2 }} />

            {/* Transaction Details Section */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginBottom: 2 }}>
              Transaction Details
            </Typography>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Destination" variant="filled" fullWidth
                  //@ts-ignore
                  defaultValue={transactionDetails.destination} size="small" disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Value" variant="filled" fullWidth
                  //@ts-ignore
                  defaultValue={transactionDetails.value} size="small" disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Currency" variant="filled" fullWidth
                  //@ts-ignore
                  defaultValue={transactionDetails.currency} size="small" disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Date" variant="filled" fullWidth
                  //@ts-ignore
                  defaultValue={transactionDetails.date} size="small" disabled />
              </Grid>
            </Grid>

            {/* Beneficiary Details Section */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginBottom: 2 }}>
              Beneficiary Details
            </Typography>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Account Number" variant="filled" fullWidth defaultValue={transactionDetails?.accountNumber} size="small" disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Bank" variant="filled" fullWidth defaultValue={transactionDetails?.bankName} size="small" disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Bank Code" variant="filled" fullWidth defaultValue={transactionDetails?.bankBicCode} size="small" disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Account Holder Name"
                  variant="filled"
                  fullWidth
                  defaultValue={transactionDetails?.beneficiaryName}
                  size="small"
                  disabled
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginBottom: 2 }}>
              Applicant Details
            </Typography>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Applicant Id" variant="filled" fullWidth defaultValue={JSON.stringify(transactionDetails?.applicant?.applicantId)} size="small" disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Applicant Name" variant="filled" fullWidth defaultValue={transactionDetails?.applicant?.firstName} size="small" disabled />
              </Grid>

            </Grid>
          
            <Button variant="outlined" onClick={closeDrawer}>
  <img
    src="https://media.licdn.com/dms/image/v2/C560BAQEH3RSdlorC_g/company-logo_200_200/company-logo_200_200/0/1675795834026/zapier_logo?e=2147483647&v=beta&t=Hx-pHbieeJMPM-LUGcTe3O8iwYPYW7xUBc0W1uC2tBs"
    alt="Zapier Logo"
    style={{ width: 24, height: 24, marginRight: 8, borderRadius: '50%' }}
  />
  Complete Payment
</Button>
          </Box>
        )}
      </Drawer>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Start Date */}
            <TextField
              label="Start Date"
              type="date"
              value={startDate || ''}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />

            {/* End Date */}
            <TextField
              label="End Date"
              type="date"
              value={endDate || ''}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleApply} variant="contained" color="primary">
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      < CompliancTool
        //@ts-ignore
        open={toolopen}
        //@ts-ignore
        setOpen={setToolOpen}
        //@ts-ignore
        userList={userList}
        fetchUserDetails={() => { }}
      />

      <Modal open={modalOpen} onClose={() => setmodalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Error List
          </Typography>
          <List>
            {errors.map((error, index) => (
              <ListItem key={index} divider>
                <ListItemText primary={`• ${error}`} />
              </ListItem>
            ))}
          </List>
          <Button variant="contained" color="error" fullWidth onClick={() => setmodalOpen(false)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  )
}

export default TransactionPage

