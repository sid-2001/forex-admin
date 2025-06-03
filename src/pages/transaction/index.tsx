import { useEffect, useState } from 'react'
import {
  Box, Button, Divider, Grid, Typography, Chip, TextField, Drawer,
  ToggleButton, ToggleButtonGroup, useTheme, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Tooltip, Modal, List, ListItem, ListItemText
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useNavigate } from 'react-router-dom'
import {
  Applicant,
  TransactionDetailsResponse,
  TransactionInward,
  TransactionInwardCalclulated,
  TransactionOutward,
} from '@/types/transaction.type'
import AssessmentIcon from '@mui/icons-material/Assessment';
import { PreviewOutlined, SettingsAccessibilityRounded, Sync } from '@mui/icons-material'
import { useRecoilState } from 'recoil'
import { loaderStateNew, selectedCountryState } from '@/states/state'
import CompliancTool from '@/components/compliance-tool'
import { HelperService } from '@/helpers/helper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { TransactionService } from '@/services/transaction.service'
import { ApplicantService } from '@/services/applicant.service'

const TransactionPage = () => {

  const columns_outward = [
    {
      field: 'id', headerName: 'Transaction ID', flex: 1, headerClassName: 'super-app-theme--header', renderCell: (params: any) => {
        return (<a href="#" onClick={() => handleViewMore(params.row)}>{params?.value}</a>)
      }
    },
    { field: 'transactionInwardNumber', headerName: 'Inward ID', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'destination', headerName: 'Destination', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'value', headerName: ' Principal Amount ', flex: 1, headerClassName: 'super-app-theme--header', renderCell: (params: any) => params?.value?.toFixed(2) },
    { field: 'principalCurrency', headerName: ' Principal Currency ', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'settlementAmount', headerName: ' Settlement Amount', flex: 1, headerClassName: 'super-app-theme--header', renderCell: (params: any) => params?.value?.toFixed(2) },
    { field: 'settlementCurrency', headerName: 'Settlement Currency  ', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'applicant',
      headerName: 'Applicant',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const navigate = useNavigate();

        const nameOrId = params.value?.name || params.value?.applicantId || 'N/A';

        return (
          <Tooltip title={`Go to ${nameOrId}'s details`} arrow>
            <span
              onClick={() => navigate(`/applicant-details/${params.value?.applicantId}`)}
              style={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'underline' }}
            >
              {nameOrId}
            </span>
          </Tooltip>
        );
      }
    },
    { field: 'forex', headerName: 'Exchange Rate', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'charges', headerName: 'Charges', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: "stpError",
      headerName: "STP",
      flex: 1,
      headerClassName: "super-app-theme--header",
      renderCell: (params: any) =>
        params.value ? (
          <Chip label={params.value == "N" ? "No Error" : "Error"}
           color={params.value == "N" ? "success" : "error"} />
        ) : (
          <Chip onClick={() => {
            setmodalOpen(true)
          }} label="Error" color="error" />
        ),
    },
    {
      field: 'Bop action',
      headerName: 'Bop',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <>
          <IconButton onClick={() => {
            navigate(`/bop-details/${params.row.transactionNumber}/${params.row.tran_bop_attempt}`)
            handleViewMore(params.row)
          }}>
            <PreviewOutlined />
          </IconButton>
        </>
      ),
    },
    {
      field: "reporting",
      headerName: "Reporting Status",
      flex: 1,
      headerClassName: "super-app-theme--header",
      renderCell: (params: any) =>
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
      renderCell: (params: any) => {
        return helper.convertDateAndTime((params.value?.owCreatedDate))
      }
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      headerClassName: "super-app-theme--header",
      renderCell: (params: any) =>
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
    { field: 'transactionNumberIw', headerName: 'Transaction Number IW', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'owTransactionNumber', headerName: 'OW Transaction Number', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'sendingCountry', headerName: 'Sending Country', width: 130, headerClassName: 'super-app-theme--header' },
    { field: 'receivingCountry', headerName: 'Receiving Country', width: 130, headerClassName: 'super-app-theme--header' },
    { field: 'settlementCurrency', headerName: 'Settlement Currency', width: 150, headerClassName: 'super-app-theme--header' },
    { field: 'settlementAmount', headerName: 'Settlement Amount', type: 'number', width: 150, headerClassName: 'super-app-theme--header', renderCell: (params: any) => params?.value?.toFixed(2) },
    { field: 'reportingStatus', headerName: 'Reporting Status', width: 130, headerClassName: 'super-app-theme--header' },
    {
      field: "inCreatedDate",
      headerName: "Created Date",
      flex: 1,
      headerClassName: "super-app-theme--header",
      renderCell: (params: any) => {
        return helper.convertDateAndTime((params.row?.inCreatedDate))
      }
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <IconButton onClick={() => {
          navigate(`/bop-details/${params.row.owTransactionNumber}/${params.row.tran_bop_attempt}`)
        }}>
          <PreviewOutlined />
        </IconButton>
      ),
    },
  ];

  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [modalOpen, setmodalOpen] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState<any>(null)
  const [transactionType, setTransactionType] = useState('inwards') // Default to 'inwards'
  const [inboundTransaction, setInboundTransaction] = useState<Array<TransactionInward>>([])
  const [outboundTransaction, setOutboundTransaction] = useState<Array<TransactionOutward>>([])
  const [toolopen, setToolOpen] = useState(false)
  const [errors, seterrors] = useState(["Invalid email", "Password too short", "Username required"])
  const [selectedCountryOption, setSelectedCountryOption] = useRecoilState(selectedCountryState)
  //@ts-ignore
  const [applicant, setApplicant] = useState<Applicant>(null)
  const [trxStatus, settrxStatus] = useState('')
  const [transactionData, setTransactionData] = useState(inboundTransaction)
  const [commonloader, setcommonloader] = useRecoilState(loaderStateNew)
  const [selectedCountryoption, setselectedCountryoption] = useRecoilState(selectedCountryState)
  const [userList, setUserList] = useState([])
  const [creattrx, setCreatetrx] = useState('')
  const [zaphierlink, setZaphierLink] = useState('')
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  let applicant_service = new ApplicantService()
  let transaction_Service = new TransactionService()
  const helper = new HelperService()
  const local_service = new LocalStorageService()
  const theme = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    setcommonloader(true)
    applicant_service.getApplicantDetalis().then(data => {
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
  }, [])

  useEffect(() => {
    setcommonloader(true)
    transaction_Service.getInwardTransaction(selectedCountryOption == "IN" ? "IN" : "ZA").then(data => {
      setInboundTransaction(data)
    })

    transaction_Service
      .gettransactions()
      .then((data: TransactionDetailsResponse) => {
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
            settlement: helper.roundToTwoFixed(e?.transactionInwardList?.settlementAmount),
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
              settlement: helper.roundToTwoFixed(e?.transactionOutward?.principalAmount * e?.transactionOutward?.exchangeRates),
              destinationBank: e?.transactionOutward?.destinationBankBicCode,
              forex: helper.roundToTwoFixed(e?.transactionOutward?.exchangeRates),
              date: e?.transactionOutward?.owCreatedDate,
              reporting: e?.transactionOutward?.reportingStatus,
              status: e?.transactionOutward?.transactionStatus,
              final_amount: helper.roundToTwoFixed(e?.transactionOutward?.exchangeRates * e?.transactionOutward?.principalAmount),
              applicant: e?.applicant,
              //@ts-ignore
              inid: e?.transactionInwardNumber
            };
          })
          ?.filter((transaction) => {
            if (selectedCountryOption === "IN") {
              return (transaction.destination?.toLowerCase() !== "in");
            }
            else if ((selectedCountryOption === "SA")) {
              return (transaction.destination?.toLowerCase() !== "za");
            }

            return true; // If selectedCountryOption is not "IN", include all destinations
          });
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

  const openInNewTab = (url: any) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
  }

  const addpayment = (create_trx: any) => {
    if (trxStatus.toLocaleLowerCase() == "DRAFT" || trxStatus.toLocaleLowerCase() == "PENDING") {
      transaction_Service.createTransaction(creattrx).then(data => {
        console.log(data)
      })
    }

    transaction_Service.createZaphierTransaction({
      amount: (Number(create_trx?.totalpaybleamount)),
      currency: "ZAR"
    }).then(data => {
      setZaphierLink(data?.redirectUrl)
    })
  }

  const handleViewMore = (row: any) => {
    console.log(row)
    settrxStatus(row?.status)
    let d = {
      //@ts-ignore
      benificary: { "benificaryId": row?.beneficiaryId },
      transferMethod: 'Bank Trannsfer',
      destinationCountry: row.destination,
      selectedTimeMethod: {
        "id": 2,
        "time": "8 hours",
        "charges": 5,
        "total": 200,
        "segment": 2
      },
      gatewayStatus: 'Success',
      amount: row?.settlementAmount,
      applicant: {
        "applicantId": row.applicantId
      },
      forex: row.exchangeRates,
      gatewayId: '13122',
      //@ts-ignore
      timecharge: row.charges,
      sourceCurrency: selectedCountryoption == "SA" ? "ZAR" : "INR",
      sourceCountry: selectedCountryoption == 'SA' ? "ZA" : "IN",
      destinationCurrency: selectedCountryoption == 'SA' ? "INR" : "ZAR",
      bopId: row?.bobId,
      // totalpaybleamount: (Number(row.value) + Number(row.charges)),
      totalpaybleamount: (Number(row.value) * Number(row.exchangeRates)),
      transactionId: row?.transactionNumber
    }
    setCreatetrx(d as any)
    // addpayment(d as any)
    setTransactionDetails(row)
    setDrawerOpen(true)
  }
//@ts-ignore
  const handleToggleTransactionType = (event: any, newType: string) => {
    if (newType) {
      setTransactionType(newType)
      //@ts-ignore
      setTransactionData(newType === 'inwards' ? inboundTransaction : outboundTransaction)
    }
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setZaphierLink('')
    // window.location.href = zaphierlink;
  }

  // Close the dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Handle applying filters
  const handleApply = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        <strong>Transactions</strong>
      </Typography>
      <ToggleButtonGroup value={transactionType} color='primary'
        exclusive onChange={handleToggleTransactionType} sx={{ mb: 2 }}>
        <ToggleButton value="inwards">
          Inwards
        </ToggleButton>

        <ToggleButton value="outwards">
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
              navigate('/utilization')
            }} color="primary">
              <AssessmentIcon sx={{
                marginBottom: "10%"
              }} />
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
              disabled={!helper.checkUserHasPermission(local_service.get_modules()?.TRANSACTION_OUTWARD, 'canCreate')}
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

        {transactionType === 'inwards' &&
          helper.checkUserHasPermission(local_service.get_modules()?.TRANSACTION_INWARD, 'canRead') && (<DataGrid
            rows={inboundTransaction?.length > 0 ? inboundTransaction : []}
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
          />)
        }

        {transactionType === 'outwards' &&
          helper.checkUserHasPermission(local_service.get_modules()?.TRANSACTION_OUTWARD, 'canRead') && (<DataGrid
            rows={outboundTransaction}
            columns={columns_outward}
            getRowId={(row: any) => row.id}
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
          />)}
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

            <Chip label={transactionDetails?.status} color="warning" sx={{ marginBottom: 2 }} />

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
                  defaultValue={transactionDetails.value?.toFixed(2)} size="small" disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Currency" variant="filled" fullWidth
                  //@ts-ignore
                  defaultValue={transactionDetails?.principalCurrency} size="small" disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Date" variant="filled" fullWidth
                  //@ts-ignore
                  defaultValue={helper.convertDateAndTime(transactionDetails.date)} size="small" disabled />
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
            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginBottom: 2 }}>
              Applicant Details
            </Typography>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Applicant Id" variant="filled" fullWidth defaultValue={(transactionDetails?.applicant?.applicantId)} size="small" disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Applicant Name" variant="filled" fullWidth defaultValue={transactionDetails?.applicant?.firstName} size="small" disabled />
              </Grid>
            </Grid>
            {
              (trxStatus == "DRAFT" || trxStatus == "PENDING") ? (<>
                <Button disabled={zaphierlink?.length > 0 ? false : true} variant="outlined" onClick={() => {
                  closeDrawer()
                  // window.location.href=zaphierlink;
                  openInNewTab(zaphierlink)
                  addpayment(creattrx)
                }}>
                  <img
                    src="https://media.licdn.com/dms/image/v2/C560BAQEH3RSdlorC_g/company-logo_200_200/company-logo_200_200/0/1675795834026/zapier_logo?e=2147483647&v=beta&t=Hx-pHbieeJMPM-LUGcTe3O8iwYPYW7xUBc0W1uC2tBs"
                    alt="Zapier Logo"
                    style={{ width: 24, height: 24, marginRight: 8, borderRadius: '50%' }}
                  />
                  Complete Payment
                </Button>
              </>) : (<></>)
            }
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

