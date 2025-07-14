import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Divider,
  Grid,
  Typography,
  Chip,
  TextField,
  Drawer,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Modal,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useNavigate } from 'react-router-dom'
import { Applicant, TransactionDetailsResponse, TransactionInward, TransactionInwardCalclulated, TransactionOutward } from '@/types/transaction.type'
import AssessmentIcon from '@mui/icons-material/Assessment'
import { PreviewOutlined, SettingsAccessibilityRounded, Sync } from '@mui/icons-material'
import { useRecoilState } from 'recoil'
import { loaderStateNew, selectedCountryState } from '@/states/state'
import CompliancTool from '@/components/compliance-tool'
import { HelperService } from '@/helpers/helper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { TransactionService } from '@/services/transaction.service'
import { ApplicantService } from '@/services/applicant.service'
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange'
import { statusColors } from '@/contants/utils'

const TransactionPage = () => {
  const columns_outward = [
    {
      field: 'id',
      headerName: 'Transaction ID',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return (
          <a href="#" onClick={() => handleViewMore(params.row)}>
            {params?.value}
          </a>
        )
      },
    },
    { field: 'transactionInwardNumber', headerName: 'Inward ID', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'destination', headerName: 'Destination', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'value',
      headerName: ' Principal Amount ',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => params?.value?.toFixed(2),
    },
    { field: 'principalCurrency', headerName: ' Principal Currency ', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'settlementAmount',
      headerName: ' Settlement Amount',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => params?.value?.toFixed(2),
    },
    { field: 'settlementCurrency', headerName: 'Settlement Currency  ', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'applicant',
      headerName: 'Applicant',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const nameOrId = params.value?.name || params.value?.applicantId || 'N/A'
        return (
          <Tooltip title={`Go to ${nameOrId}'s details`} arrow>
            <span
              onClick={() => handleNavigation(`/applicant-details/${params.value?.applicantId}`)}
              style={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'underline' }}
            >
              {nameOrId}
            </span>
          </Tooltip>
        )
      },
    },
    { field: 'forex', headerName: 'Exchange Rate', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'charges', headerName: 'Charges', flex: 1, headerClassName: 'super-app-theme--header' },

    {
      field: 'reporting',
      headerName: 'Reporting Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (params?.value?.reporting == 'Reported' ? params.value.status : params?.value?.status),
    },
    {
      field: 'owCreatedDate',
      headerName: 'Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return helper.convertDateAndTime(params.value?.owCreatedDate)
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return <div style={{ color: statusColors[params.row.status.toUpperCase()] }}>{params.row.status.toUpperCase()}</div>
      },

      // renderCell: (params: any) =>
      //   params?.value?.status == 'Pending' ? (
      //     <Tooltip title={params?.value?.status || 'Unknown Error'} arrow>
      //       <Chip label="Pending" color="error" />
      //     </Tooltip>
      //   ) : (
      //     params?.value?.status
      //   ),
    },
    {
      field: 'stpError',
      headerName: 'STP',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <Chip
          label={params.value === 'N' ? 'No Error' : 'Error'}
          color={params.value === 'N' ? 'success' : 'error'}
          onClick={() => {
            if (params.value === 'Y') {
              setmodalOpen(true)
              fetchStpErrorList(params?.row?.id)
            }
          }}
        />
      ),
    },
    {
      field: 'Bop action',
      headerName: 'Bop',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <>
          <IconButton
            onClick={() => {
              handleNavigation(`/bop-details/${params.row.transactionNumber}/${params.row.tran_bop_attempt}`)
              handleViewMore(params.row)
            }}
          >
            <PreviewOutlined />
          </IconButton>
        </>
      ),
    },
  ]

  const inward_columns = [
    { field: 'transactionNumberIw', headerName: 'Transaction Number IW', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'owTransactionNumber', headerName: 'OW Transaction Number', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'sendingCountry', headerName: 'Sending Country', width: 130, headerClassName: 'super-app-theme--header' },
    { field: 'receivingCountry', headerName: 'Receiving Country', width: 130, headerClassName: 'super-app-theme--header' },
    { field: 'settlementCurrency', headerName: 'Settlement Currency', width: 150, headerClassName: 'super-app-theme--header' },
    {
      field: 'settlementAmount',
      headerName: 'Settlement Amount',
      type: 'number',
      width: 150,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => params?.value?.toFixed(2),
    },
    { field: 'reportingStatus', headerName: 'Reporting Status', width: 130, headerClassName: 'super-app-theme--header' },
    {
      field: 'inCreatedDate',
      headerName: 'Created Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return helper.convertDateAndTime(params.row?.inCreatedDate)
      },
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <IconButton
          onClick={() => {
            handleNavigation(`/bop-details/${params.row.owTransactionNumber}/${params.row.tran_bop_attempt}`)
          }}
        >
          <PreviewOutlined />
        </IconButton>
      ),
    },
  ]

  const StpColumns = [
    {
      field: 'transactionNo',
      headerName: 'Transaction No.',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'fieldName',
      headerName: 'Field',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'errorMessage',
      headerName: 'Error Message',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
  ]

  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [modalOpen, setmodalOpen] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState<any>(null)
  const [transactionType, setTransactionType] = useState('inwards') // Default to 'inwards'
  const [inboundTransaction, setInboundTransaction] = useState<Array<TransactionInward>>([])
  const [outboundTransaction, setOutboundTransaction] = useState<Array<TransactionOutward>>([])
  const [toolopen, setToolOpen] = useState(false)
  const [selectedCountryOption, setSelectedCountryOption] = useRecoilState(selectedCountryState)
  //@ts-ignore
  const [trxStatus, settrxStatus] = useState('')
  const [transactionData, setTransactionData] = useState(inboundTransaction)
  const [commonloader, setcommonloader] = useRecoilState(loaderStateNew)
  const [selectedCountryoption, setselectedCountryoption] = useRecoilState(selectedCountryState)
  const [userList, setUserList] = useState([])
  const [creattrx, setCreatetrx] = useState('')
  const [zaphierlink, setZaphierLink] = useState('')
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [stpErrors, setStpErrors] = useState<any>([])

  let applicant_service = new ApplicantService()
  let transaction_Service = new TransactionService()
  const helper = new HelperService()
  const local_service = new LocalStorageService()
  const theme = useTheme()
  const navigate = useNavigate()

  const fetchStpErrorList = async (transactionId: string) => {
    try {
      const { data } = await transaction_Service.getStpRules(transactionId)
      console.log(data, '==============')
      setStpErrors(data)
    } catch (error) {
      console.log('err', error)
    }
  }

  useEffect(() => {
    setcommonloader(true)
    applicant_service.getApplicantDetalis().then((data) => {
      let users = data.map((e) => {
        let benificiary_list = e.beneficiaryList.map((b) => {
          return {
            benificaryId: b.beneficiaryId,
            name: b.beneficiaryName,
            accountHolderName: b.beneficiaryName,
            accountNumber: b.bankBicCode,
            bank: b.bankName,
            ifscCode: b.bankBicCode,
          }
        })

        return {
          applicantId: e.applicant.applicantId,
          id: e.applicant.applicantId,
          //@ts-ignore
          name: e.applicant?.firstName,
          accountNumber: '**********789',
          profilePhoto: 'https://randomuser.me/api/portraits/women/4.jpg',
          benificary: benificiary_list,
        }
      })
      setUserList(users as any)
      setcommonloader(false)
    })
  }, [])

  useEffect(() => {
    setcommonloader(true)
    transaction_Service.getInwardTransaction(selectedCountryOption === 'IN' ? 'IN' : 'ZA').then((data) => {
      setInboundTransaction(data)
    })

    transaction_Service
      .gettransactions()
      .then((data: TransactionDetailsResponse) => {
        let inbound: Array<TransactionInwardCalclulated>[] | any = data?.transactionDetailsList.map((e: any) => {
          //@ts-ignore
          return {
            //@ts-ignore
            ...e.transactionInwardList,
            ...e.beneficiary,
            id: e?.transactionInwardList?.transactionNumberIw,
            destination: e?.transactionInwardList?.receivingCountry,
            value: e?.transactionInwardList?.settlementAmount,
            currency: e?.transactionInwardList?.settlementCurrency,
            settlement: helper.roundToTwoFixed(e?.transactionInwardList?.settlementAmount),
            destinationBank: e?.transactionInwardList?.destinationBankCode,
            errorCause: ' ',
            forex: e?.transactionOutward?.exchangeRates,
            date: e?.transactionOutward?.owCreatedDate,
            final_amount: e?.transactionOutward?.exchangeRates * e?.transactionOutward?.principalAmount,
            applicant: e?.applicant,
          }
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
              inid: e?.transactionInwardNumber,
            }
          })
          ?.filter((transaction) => {
            if (selectedCountryOption === 'IN') {
              return transaction.destination?.toLowerCase() !== 'in'
            } else if (selectedCountryOption === 'ZA') {
              return transaction.destination?.toLowerCase() !== 'za'
            }

            return true // If selectedCountryOption is not "IN", include all destinations
          })
        let user: Array<Applicant>[] | any = data?.transactionDetailsList.map((e) => {
          return {
            ...e.applicant,
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
          console.log('err', err)
        },
      )
  }, [])

  const openInNewTab = (url: any) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
  }

  const addpayment = (create_trx: any) => {
    if (trxStatus.toLocaleLowerCase() == 'DRAFT' || trxStatus.toLocaleLowerCase() == 'PENDING') {
      transaction_Service.createTransaction(creattrx).then((data) => {
        console.log(data)
      })
    }

    transaction_Service
      .createZaphierTransaction({
        amount: Number(create_trx?.totalpaybleamount),
        currency: 'ZAR',
      })
      .then((data) => {
        setZaphierLink(data?.redirectUrl)
      })
  }

  const handleViewMore = (row: any) => {
    settrxStatus(row?.status)
    let d = {
      //@ts-ignore
      benificary: { benificaryId: row?.beneficiaryId },
      transferMethod: 'Bank Trannsfer',
      destinationCountry: row.destination,
      selectedTimeMethod: {
        id: 2,
        time: '8 hours',
        charges: 5,
        total: 200,
        segment: 2,
      },
      gatewayStatus: 'Success',
      amount: row?.settlementAmount,
      applicant: {
        applicantId: row.applicantId,
      },
      forex: row.exchangeRates,
      gatewayId: '13122',
      //@ts-ignore
      timecharge: row.charges,
      sourceCurrency: selectedCountryoption === 'ZA' ? 'ZAR' : 'INR',
      sourceCountry: selectedCountryoption === 'ZA' ? 'ZA' : 'IN',
      destinationCurrency: selectedCountryoption === 'ZA' ? 'INR' : 'ZAR',
      bopId: row?.bobId,
      // totalpaybleamount: (Number(row.value) + Number(row.charges)),
      totalpaybleamount: Number(row.value) * Number(row.exchangeRates),
      transactionId: row?.transactionNumber,
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
    setOpen(false)
  }

  // Handle applying filters
  const handleApply = () => {
    setOpen(false)
  }

  const handleNavigation = (url: string) => {
    navigate(url)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom color={theme.palette.secondary.main}>
        <strong>Transactions</strong>
      </Typography>

      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} sx={{ width: '80vw' }}>
        <Box>
          <ToggleButtonGroup value={transactionType} color="primary" exclusive onChange={handleToggleTransactionType} sx={{ mb: 2 }}>
            <ToggleButton value="inwards">Inwards</ToggleButton>

            <ToggleButton value="outwards">Outwards</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box>
          <IconButton onClick={() => setToolOpen(true)} color="primary">
            <SettingsAccessibilityRounded />
          </IconButton>

          <IconButton
            onClick={() => {
              handleNavigation('/recon-trx')
            }}
            color="primary"
          >
            <CurrencyExchangeIcon />
          </IconButton>

          <IconButton
            onClick={() => {
              handleNavigation('/utilization')
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.COMPLIANCE_MONITOR, 'canRead')}
            color="primary"
          >
            <AssessmentIcon
              sx={{
                marginBottom: '10%',
              }}
            />
          </IconButton>

          <IconButton
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.RECONCILLATION, 'canRead')}
            onClick={() => {
              handleNavigation('/recon')
            }}
            color="primary"
          >
            <Sync
              sx={{
                marginBottom: '10%',
              }}
            />
          </IconButton>

          <Button
            variant="outlined"
            sx={{
              marginBottom: '3%',
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.TRANSACTION_OUTWARD, 'canCreate')}
            onClick={(e: any) => {
              handleNavigation('/sendmoney')
            }}
          >
            + Transaction
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          width: '80vw',
          height: '65vh',
          '& .super-app-theme--header': {
            backgroundColor: '#005099',
            color: 'white',
          },
          '& .MuiDataGrid-row:nth-of-type(even)': {
            backgroundColor: '#e3f2fd',
          },
          '& .MuiDataGrid-row:nth-of-type(odd)': {
            backgroundColor: '#ffffff',
          },
        }}
      >
        {transactionType === 'inwards' && helper.checkUserHasPermission(local_service.get_modules()?.TRANSACTION_INWARD, 'canRead') && (
          <DataGrid
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
          />
        )}

        {transactionType === 'outwards' && helper.checkUserHasPermission(local_service.get_modules()?.TRANSACTION_OUTWARD, 'canRead') && (
          <DataGrid
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
          />
        )}
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
                <TextField
                  label="Destination"
                  variant="filled"
                  fullWidth
                  //@ts-ignore
                  defaultValue={transactionDetails.destination}
                  size="small"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Value"
                  variant="filled"
                  fullWidth
                  //@ts-ignore
                  defaultValue={transactionDetails.value?.toFixed(2)}
                  size="small"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Currency"
                  variant="filled"
                  fullWidth
                  //@ts-ignore
                  defaultValue={transactionDetails?.principalCurrency}
                  size="small"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Date"
                  variant="filled"
                  fullWidth
                  //@ts-ignore
                  defaultValue={helper.convertDateAndTime(transactionDetails.date)}
                  size="small"
                  disabled
                />
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
            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginBottom: 2, color: theme.palette.primary.main }}>
              Applicant Details
            </Typography>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Applicant Id"
                  variant="filled"
                  fullWidth
                  defaultValue={transactionDetails?.applicant?.applicantId}
                  size="small"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Applicant Name"
                  variant="filled"
                  fullWidth
                  defaultValue={transactionDetails?.applicant?.firstName}
                  size="small"
                  disabled
                />
              </Grid>
            </Grid>
            {trxStatus == 'DRAFT' || trxStatus == 'PENDING' ? (
              <>
                <Button
                  disabled={zaphierlink?.length > 0 ? false : true}
                  variant="outlined"
                  onClick={() => {
                    closeDrawer()
                    // window.location.href=zaphierlink;
                    openInNewTab(zaphierlink)
                    addpayment(creattrx)
                  }}
                >
                  <img
                    src="https://media.licdn.com/dms/image/v2/C560BAQEH3RSdlorC_g/company-logo_200_200/company-logo_200_200/0/1675795834026/zapier_logo?e=2147483647&v=beta&t=Hx-pHbieeJMPM-LUGcTe3O8iwYPYW7xUBc0W1uC2tBs"
                    alt="Zapier Logo"
                    style={{ width: 24, height: 24, marginRight: 8, borderRadius: '50%' }}
                  />
                  Complete Payment
                </Button>
              </>
            ) : (
              <></>
            )}
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

      <CompliancTool
        //@ts-ignore
        open={toolopen}
        //@ts-ignore
        setOpen={setToolOpen}
        //@ts-ignore
        userList={userList}
        fetchUserDetails={() => {}}
      />

      <Modal open={modalOpen} onClose={() => setmodalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 1000,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            STP Errors List
          </Typography>
          <DataGrid
            sx={{
              width: '100%',
              '& .MuiDataGrid-columnHeaders': {
                '& .super-app-theme--header': {
                  backgroundColor: '#005099',
                  color: 'white',
                },
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-cell': {
                fontSize: '14px',
              },
              '& .MuiDataGrid-row:nth-of-type(even)': {
                backgroundColor: '#f0f8ff',
              },
              '& .MuiDataGrid-row:nth-of-type(odd)': {
                backgroundColor: '#ffffff',
              },
              '& .super-app-theme--header': {
                fontSize: '16px',
              },
            }}
            columns={StpColumns}
            rows={stpErrors}
            //@ts-ignore
            pageSize={5}
            rowsPerPageOptions={[5]}
            getRowId={(row: any) => row.id} // Ensure proper row ID handling
          />
          <Button variant="outlined" onClick={() => setmodalOpen(false)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  )
}

export default TransactionPage
