import { useCallback, useEffect, useState } from 'react'
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
import { useNavigate, useLocation } from 'react-router-dom'
import { TransactionInward, TransactionInwardCalclulated, TransactionOutward } from '@/types/transaction.type'
import { PreviewOutlined } from '@mui/icons-material'
import { useRecoilState } from 'recoil'
import { loaderStateNew } from '@/states/state'
import CompliancTool from '@/components/compliance-tool'
import { HelperService } from '@/helpers/helper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { TransactionService } from '@/services/transaction.service'
import { ApplicantService } from '@/services/applicant.service'
import { statusColors } from '@/contants/utils'
import LoaderUI from '@/components/loader/loader'
import React from 'react'
import {
  GridColDef,
  GridToolbar,
  GridPaginationModel,
  GridFilterModel,
} from "@mui/x-data-grid";

const applicant_service = new ApplicantService()
const transaction_Service = new TransactionService()
const helper = new HelperService()
const local_service = new LocalStorageService()

const TransactionListing = () => {
  const columns_outward = [
    {
      field: 'id',
      headerName: 'Transaction ID',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return (
          <a href="#" style={{ color: theme.palette.text.primary }} onClick={() => handleViewMore(params.row)}>
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
              style={{ cursor: 'pointer', color: theme.palette.text.primary, textDecoration: 'underline' }}
            >
              {nameOrId}
            </span>
          </Tooltip>
        )
      },
    },
    { field: 'forex', headerName: 'Exchange Rate', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'charges', headerName: 'Charges', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'gateway_name', headerName: 'Gateway', width: 100, headerClassName: 'super-app-theme--header' },

    {
      field: 'owCreatedDate',
      headerName: 'Date',
      type: 'Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return helper.convertDateAndTime(params?.row?.owCreatedDate)
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return <div style={{ color: statusColors[params?.row?.status?.toUpperCase()] }}>{params?.row?.status?.toUpperCase()}</div>
      },
    },
    {
      field: 'payment_status',
      headerName: 'Settlement Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return (
          <div>
            <span
              style={{
                backgroundColor: statusColors[params?.row?.paymentStatus?.toUpperCase()],
                color: 'white',
                borderRadius: '20px',
                padding: '12px 12px',
                fontSize: '13px',
              }}
            >
              {params?.row?.paymentStatus?.toUpperCase()}
            </span>
          </div>
        )
      },
    },
    {
      field: 'stpError',
      headerName: 'STP',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <Chip
          label={params.value === 'Y' ? 'Error' : 'No Error'}
          color={params.value === 'Y' ? 'error' : 'success'}
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
    { field: 'principalCurrency', headerName: 'Principal Currency', width: 150, headerClassName: 'super-app-theme--header' },

    { field: 'gatewayId', headerName: 'Gateway', width: 100, headerClassName: 'super-app-theme--header' },

    { field: 'gatewayStatus', headerName: 'Gateway', width: 100, headerClassName: 'super-app-theme--header' },
    {
      field: 'settlementAmount',
      headerName: 'Settlement Amount',
      type: 'number',
      width: 150,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'inCreatedDate',
      headerName: 'Created Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return helper.convertDateAndTime(params?.row?.inCreatedDate)
      },
    },
    {
      field: 'lcharges2',
      headerName: 'Charges',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },

    {
      field: 'owCreatedDate',
      headerName: 'Date',
      type: 'Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return helper.convertDateAndTime(params?.row?.owCreatedDate)
      },
    },

    {
      field: 'transactionStatus',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return <div style={{ color: statusColors[params?.row?.status?.toUpperCase()] }}>{params?.row?.status?.toUpperCase()}</div>
      },
    },

    {
      field: 'stpError',
      headerName: 'STP',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <Chip
          label={params.value === 'Y' ? 'Error' : 'No Error'}
          color={params.value === 'Y' ? 'error' : 'success'}
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
  const [transactionType, setTransactionType] = useState('')
  const [inboundTransaction, setInboundTransaction] = useState<Array<TransactionInward>>([])
  const [outboundTransaction, setOutboundTransaction] = useState<Array<TransactionOutward>>([])
  const [toolopen, setToolOpen] = useState(false)
  const [trxStatus, settrxStatus] = useState('')
  const [transactionData, setTransactionData] = useState(inboundTransaction)
  const [commonloader, setcommonloader] = useRecoilState(loaderStateNew)
  const [userList, setUserList] = useState([])
  const [creattrx, setCreatetrx] = useState('')
  const [zaphierlink, setZaphierLink] = useState('')
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [stpErrors, setStpErrors] = useState<any>([])
  const [givenTransaction, setGivenTransaction] = useState<any>(null)
  
  // Add state for row count
  const [rowCount, setRowCount] = useState(0);

  const theme = useTheme()
  const navigate = useNavigate()
  const { search } = useLocation()
  const queryParams = new URLSearchParams(search)
  const userCountry = local_service?.get_staff_country()
  const flow = queryParams.get('flow')

  // pagination state
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });

  // filter state
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [],
  });

  // Fetch API whenever pagination or filter changes
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { page, pageSize } = paginationModel;

        // build filter query (basic example: single filter only)
        let filterQuery = "";
        if (filterModel.items.length > 0) {
          const f = filterModel.items[0];
          if (f.value) {
            filterQuery = `&filterField=${f.field}&filterValue=${f.value}`;
          }
        }
        getAllTransactions(page, pageSize, filterQuery)

      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        // setLoading(false);
      }
    };

    fetchData();
  }, [paginationModel, filterModel]);

  // handle page or pageSize change
  const handlePaginationChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel);
  };

  // handle filter changes
  const handleFilterChange = (newFilterModel: GridFilterModel) => {
    setFilterModel(newFilterModel);
  };

  const fetchStpErrorList = useCallback(async (transactionId: string) => {
    try {
      const { data } = await transaction_Service.getStpRules(transactionId)
      setStpErrors(data || [])
    } catch (error) {
      console.log('err', error)
    }
  }, [])

  const getApplicantDetails = useCallback(async () => {
    try {
      const data = await applicant_service.getApplicantDetalis()

      const users: any = data.map((e) => {
        const benificiary_list = e.beneficiaryList.map((b) => {
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
      setUserList(users)
    } catch (error) {
      console.log(error)
    }
  }, [])

  const getInwardTransactionList = useCallback(async () => {
    try {
      setcommonloader(true)
      const data = await transaction_Service.getInwardTransaction(userCountry)
      setInboundTransaction(data || [])
      setcommonloader(false)
    } catch (error) {
      console.log(error)
    }
  }, [])

  const getAllTransactions = useCallback(async (page: number, size: number,
    //@ts-ignore
    filterQuery: string = "") => {
    try {
      // setcommonloader(true)
      const data: any = await transaction_Service.getOutwardAllTransaction(userCountry, page, size)
      console.log(data)
      // Assuming your API response has a structure like:
      // { content: [], totalElements: 100, totalPages: 5 }
      const inbound: Array<TransactionInwardCalclulated>[] | any = data?.content?.map((e: any) => {
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

      const outbound: Array<TransactionOutward> | any = data
        ?.map((e: any) => {
          return {
            ...e.transactionGatewayDTO,
            ...e.beneficiary,
            ...e.applicant,
            id: e?.transactionGatewayDTO?.transactionNumber,
            destination: e?.transactionGatewayDTO?.receiveCountry,
            value: e?.transactionGatewayDTO?.principalAmount,
            currency: e?.transactionGatewayDTO?.settlementCurrency,
            settlement: helper.roundToTwoFixed(e?.transactionGatewayDTO?.principalAmount * e?.transactionGatewayDTO?.exchangeRates),
            destinationBank: e?.transactionGatewayDTO?.destinationBankBicCode,
            forex: helper.roundToTwoFixed(e?.transactionGatewayDTO?.exchangeRates),
            date: e?.transactionGatewayDTO?.owCreatedDate,
            reporting: e?.transactionGatewayDTO?.reportingStatus,
            status: e?.transactionGatewayDTO?.transactionStatus,
            final_amount: helper.roundToTwoFixed(e?.transactionGatewayDTO?.exchangeRates * e?.transactionGatewayDTO?.principalAmount),
            applicant: e?.applicant,
            gateway_name: e?.transactionGatewayDTO?.forexPaymentGateway?.company,
            //@ts-ignore
            inid: e?.transactionInwardNumber,
          }
        })
        ?.filter((transaction: any) => {
          if (queryParams.get('id') != null) {
            return transaction?.id == queryParams.get('id')
          }

          if (userCountry === 'IN') {
            return transaction.destination?.toLowerCase() !== 'in'
          } else if (userCountry === 'ZA') {
            return transaction.destination?.toLowerCase() !== 'za'
          }
          return true
        })

      // Set the appropriate data based on transaction type
      if (transactionType === 'inwards') {
        setTransactionData(inbound);
      } else {
        setOutboundTransaction(outbound);
      }
      
      // Set the total row count for pagination
      setRowCount(data?.totalElements || 0);
      
      setcommonloader(false);
    } catch (error) {
      console.log(error)
      setcommonloader(false);
    }
  }, [transactionType, userCountry])

  useEffect(() => {
    if (!flow) {
      setTransactionType('inwards')
    } else {
      setTransactionType(flow)
    }
    getApplicantDetails()
    getInwardTransactionList()
    getAllTransactions(0, 20)
    setGivenTransaction(queryParams.get('id'))
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
      sourceCurrency: userCountry === 'ZA' ? 'ZAR' : 'INR',
      sourceCountry: userCountry,
      destinationCurrency: userCountry === 'ZA' ? 'INR' : 'ZAR',
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
      if (givenTransaction !== null) {
        navigate(`/transaction?flow=${newType}&id=${givenTransaction}`)
      } else {
        navigate(`/transaction?flow=${newType}`)
      }
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

  const getTransactionPermission = () => {
    return transactionType === 'inwards' ? local_service.get_modules()?.TRANSACTION_INWARD : local_service.get_modules()?.TRANSACTION_OUTWARD
  }

  const getLoadingState = () => {
    return commonloader;
  }

  return (
    <Box sx={{  width: '80vw', height: '70vh' }}>
      <Typography variant="h4" gutterBottom>
        <strong>Transactions</strong>
      </Typography>

      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} sx={{ width: '80vw' }}>
        <Box>
          <ToggleButtonGroup value={transactionType} color="primary" exclusive onChange={handleToggleTransactionType} sx={{ mb: 2 }}>
            <ToggleButton value="inwards">Inwards</ToggleButton>

            <ToggleButton value="outwards">Outwards</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Left group: three text links */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mr: 3 }}>
            <Typography
              variant="body2"
              sx={{
                cursor: 'pointer',
                borderBottom: '1px solid black',
                lineHeight: 1.5,
                px: 0.5,
                '&:hover': {
                  borderBottomColor: 'primary.main',
                  fontWeight: 'bold', // correct casing
                },
              }}
              onClick={() => handleNavigation('/recon-trx')}
            >
              Reconciliation
            </Typography>

            <Typography
              variant="body2"
              sx={{
                cursor: 'pointer',
                borderBottom: '1px solid black',
                lineHeight: 1.5,
                px: 0.5,
                '&:hover': {
                  borderBottomColor: 'primary.main',
                  fontWeight: 'bold',
                },
              }}
              // disabled={!helper.checkUserHasPermission(local_service.get_modules()?.COMPLIANCE_MONITOR, 'canRead')}
              onClick={() => handleNavigation('/utilization')}
            >
              Utilization Limit
            </Typography>

            <Typography
              variant="body2"
              sx={{
                cursor: 'pointer',
                borderBottom: '1px solid black',
                lineHeight: 1.5,
                px: 0.5,
                '&:hover': {
                  borderBottomColor: 'primary.main',
                  fontWeight: 'bold',
                },
              }}
              // disabled={!helper.checkUserHasPermission(local_service.get_modules()?.RECONCILLATION, 'canRead')}
              onClick={() => handleNavigation('/recon')}
            >
              Settlement
            </Typography>
          </Box>

          {/* Right: transaction button */}
          <Button
            variant="contained"
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.TRANSACTION_OUTWARD, 'canCreate')}
            onClick={() => handleNavigation('/sendmoney')}
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
        }}
      >
        {helper.checkUserHasPermission(getTransactionPermission(), 'canRead') && (
          <DataGrid
            rows={transactionType === 'inwards' ? inboundTransaction : outboundTransaction || []}
           //@ts-ignore
            columns={transactionType === 'inwards' ? inward_columns : columns_outward}
            getRowId={(row: any) => (transactionType === 'inwards' ? row?.transactionNumberIw : row.id)}
            pageSizeOptions={[10, 20, 50]}
            paginationMode="server"
            filterMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationChange}
            filterModel={filterModel}
            onFilterModelChange={handleFilterChange}
            rowCount={1000}
            loading={getLoadingState()}
            slots={{
              loadingOverlay: LoaderUI.LoadingOverlay,
              toolbar: GridToolbar,
            }}
            disableRowSelectionOnClick
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
            // backgroundColor: 'white',
          },
        }}
      >
        {transactionDetails && (
          <Box>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                backgroundColor: theme.palette.primary.main,
                p: '0.5%',
                color: 'white',
                paddingLeft: '5%',
                paddingRight: '5%',
                marginBottom: 2,
                width: '40%',
              }}
            >
              TRANSACTION ID : {transactionDetails.id}
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
          <Button onClick={handleClose} color="secondary" >
            Cancel
          </Button>
          <Button onClick={handleApply} variant="contained" color="primary">
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      <CompliancTool open={toolopen} setOpen={setToolOpen} userList={userList} fetchUserDetails={() => {}} />

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
            rows={stpErrors || []}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 20, page: 0 },
              },
            }}
            loading={stpErrors?.length > 0 ? false : true}
            slots={{
              loadingOverlay: LoaderUI.LoadingOverlay,
            }}
            pageSizeOptions={[10]}
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

export default TransactionListing