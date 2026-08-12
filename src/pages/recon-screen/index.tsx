import React, { useCallback, useEffect, useState } from 'react'
import { DataGrid, GridColDef, GridFilterModel, GridToolbarFilterButton, GridToolbarColumnsButton, GridToolbarContainer } from '@mui/x-data-grid'
import { Drawer, Box, Typography, TextField, Grid, Button, Divider, Card } from '@mui/material'
import { TransactionService } from '@/services/transaction.service'
import { useTheme } from '@emotion/react'
import StatusDropdown from '../../components/status-recon'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { convertStrToTitleCase } from '@/contants/utils'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import DownloadIcon from '@mui/icons-material/Download'
import LoaderUI from '@/components/loader/loader'
import FindReplaceIcon from '@mui/icons-material/FindReplace'

// Define types
interface TransactionRow {
  id: number
  applicantTranNumber: string
  captureTimestamp: string
  releaseTimestamp: string
  senderCountry: string
  senderCurrency: string
  senderAmount: number
  receiversCountry: string
  receiversCurrency: string
  receiversAmount: number
  coverNumber: string
  exchangeRateUsed: number
  gatewayUsed: string
  gatewayPercentage: number | null
  gatewayCharges: number | null
  platformCharges1: number
  senderCtryPymtStatus: string | null
  senderCtryGatewaySettlInd: string | null
  senderCorrBankName: string
  senderCorrBankBic: string
  senderCorrBankSortCode: string
  rcvCorrBankName: string
  rcvCorrBankBic: string
  rcvCorrBankSortCode: string
  finalBankRecipientName: string | null
  finalRcptBankName: string | null
  finalRcptBranchSortCode: string | null
  finalRcptBankBic: string | null
  finalRcptBankAcctNum: string | null
  finalBankMoneyReleasedInd: string | null
  toCtryBulkMoneyReleasedInd: string | null
  toCtryBulkMoneyReleaseTxnNum: string | null
  beneficiaryMoneyReceivedInd: string
  utrFinalTrn: string
  senderCtryTransId: string | null
  rcvCtryTransId: string | null
  reconStatus: string | null
  beneficiaryBankTransactionStatus: string | null
  settlementBankTransactionStatus: string | null
  settlementTransDate: string | null
  settlementTransBankName: string | null
  settlementTransBankSortCode: string | null
  settlementTransBicCode: string | null
}

interface TransactionDetails {
  id: number
  applicantTranNumber: string
  captureTimestamp: string
  releaseTimestamp: string
  senderCountry: string
  senderCurrency: string
  senderAmount: number
  receiversCountry: string
  receiversCurrency: string
  receiversAmount: number
  coverNumber: string
  exchangeRateUsed: number
  gatewayUsed: string
  gatewayPercentage: number
  gatewayCharges: number
  platformCharges1: number
  senderCtryPymtStatus: string
  senderCtryGatewaySettlInd: string | null
  senderCorrBankName: string
  senderCorrBankBic: string
  senderCorrBankSortCode: string
  rcvCorrBankName: string
  rcvCorrBankBic: string
  rcvCorrBankSortCode: string
  finalBankRecipientName: string
  finalRcptBankName: string
  finalRcptBranchSortCode: string
  finalRcptBankBic: string
  finalRcptBankAcctNum: string
  finalBankMoneyReleasedInd: boolean | null
  toCtryBulkMoneyReleasedInd: string | null
  toCtryBulkMoneyReleaseTxnNum: string | null
  beneficiaryMoneyReceivedInd: string
  utrFinalTrn: string
  senderCtryTransId: string
  rcvCtryTransId: string
  reconStatus: string
  beneficiaryBankTransactionStatus: string
  settlementBankTransactionStatus: string
  settlementTransDate: string
  settlementTransBankName: string
  settlementTransBankSortCode: string
  settlementTransBicCode: string
}

export default function TransactionPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null)
  const [sourcebankTransaction, setsourcebankTransaction] = useState('')
  const [beneficaryTransaction, setbeneficaryTransaction] = useState('')
  const [settlementTransaction, setsettlementTransaction] = useState('')
  const [text, setText] = useRecoilState(alertTextState)
  const [type, setType] = useRecoilState(alertTypeState)
  const [open, setOpen] = useRecoilState(alertState)
  const [reconStatus, setreconStatus] = useState('')
  const [amountDetails, setAmountDetails] = useState({
    aedAmount: 0,
    inrPayout: 0,
    luluFee: 0,
    platformFee: 0,
    vatOnFee: 0,
    vatOnLuluFee: 0,
  })
  const [filters, setFilters] = useState({
    fromDate: null,
    toDate: null,
  })
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<any>({})
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })

  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<
    Partial<Pick<TransactionRow, 'id' | 'gatewayUsed' | 'senderCtryTransId' | 'rcvCtryTransId' | 'senderCtryGatewaySettlInd' | 'reconStatus'>>[]
  >([])
  let trx_service = new TransactionService()
  const theme: any = useTheme()

  const isFilterEmpty = !filters.fromDate && !filters.toDate

  // error, processed, settled
  function getStatusColor(
    //@ts-ignore
    status,
  ) {
    switch (status?.toLowerCase()) {
      case 'error':
        return 'red'
      case 'processed':
        return 'blue'
      case 'settled':
        return 'green'
      default:
        return 'gray' // fallback color for unknown statuses
    }
  }

  const handleSave = () => {
    let payload = {
      beneficiaryBankTransactionStatus: beneficaryTransaction,
      settlementBankTransactionStatus: settlementTransaction,
      reconStatus: reconStatus,
      senderCtryPymtStatus: sourcebankTransaction,
    }

    trx_service
      .updateReconTrxId(
        //@ts-ignore
        transactionDetails?.id,
        payload,
      )
      .then((data) => {
        console.log(data)

        if (data?.id) {
          setText('Update Succesfull')
          setType('success')
        } else {
          setText('Update  UnSuccesfull')
          setType('error')
        }
        setOpen(true)
      })
    //@ts-ignore
    handleViewMore(transactionDetails?.id)
  }

  const handleViewMore = async (id: number) => {
    // Simulating API call with sample data
    console.log(id)
    trx_service.getReconTrxId(id).then((data: any) => {
      console.log(data)
      //@ts-ignore
      setTransactionDetails(data?.forexReconTransaction)
      setsourcebankTransaction((data?.forexReconTransaction as TransactionDetails).senderCtryPymtStatus)
      setsettlementTransaction((data?.forexReconTransaction as TransactionDetails).settlementBankTransactionStatus)
      setbeneficaryTransaction((data?.forexReconTransaction as TransactionDetails).beneficiaryBankTransactionStatus)
      setreconStatus((data?.forexReconTransaction as TransactionDetails).reconStatus)

      console.log((data?.forexReconTransaction as TransactionDetails).senderCtryPymtStatus)
      console.log((data?.forexReconTransaction as TransactionDetails).settlementBankTransactionStatus)
      console.log((data?.forexReconTransaction as TransactionDetails).beneficiaryBankTransactionStatus)
    })

    // setTransactionDetails(sampleDetails);
    setDrawerOpen(true)
  }

  const fetchReconTxns = useCallback(async (filterValue: string) => {
    const response = await trx_service.getReconTrx(filterValue)
    setRows(response?.transactions || [])
    setAmountDetails(response?.total || {})
  }, [])

  useEffect(() => {
    fetchReconTxns('')
  }, [])

  // Sample data for the DataGrid
  const columns: GridColDef[] = [
    // { field: 'id', headerName: 'Transaction ID', flex: 1, headerClassName: 'super-app-theme--header' },
    // { field: 'gatewayUsed', headerName: 'Gateway/Channel', flex: 1, headerClassName: 'super-app-theme--header' },
    // { field: 'senderCtryTransId', headerName: 'Source Bank Trx ID', flex: 1, headerClassName: 'super-app-theme--header' },
    // { field: 'rcvCtryTransId', headerName: 'Destination Bank Trx ID', flex: 1, headerClassName: 'super-app-theme--header' },
    // { field: 'senderCtryGatewaySettlInd', headerName: 'Settlement Trx ID', flex: 1, headerClassName: 'super-app-theme--header' },
    // { field: 'reconStatus', headerName: 'Status', flex: 1, headerClassName: 'super-app-theme--header' },
    // {
    //   field: 'actions',
    //   type: 'actions',
    //   headerName: 'Action',
    //   flex: 1,
    //   headerClassName: 'super-app-theme--header',
    //   getActions: (params) => [<GridActionsCellItem icon={<VisibilityIcon />} label="View More" onClick={() => handleViewMore(params.row.id)} />],
    // },

    { field: 'transactionId', headerName: 'Transaction ID', flex: 1, headerClassName: 'super-app-theme--header' },

    { field: 'sender', headerName: 'Settlement Country', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'aedAmount', headerName: 'Settlement Amount', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'sourceCurrency', headerName: 'Settlement Currency', flex: 1, headerClassName: 'super-app-theme--header' },

    { field: 'recipient', headerName: 'Principal Country', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'inrPayout', headerName: 'Principal Amount', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'payoutCurrency', headerName: 'Principal Currency', flex: 1, headerClassName: 'super-app-theme--header' },

    { field: 'luluFxRate', headerName: 'LULU FX Rate', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'improPayFxRate', headerName: 'IMPROPAY FX Rate', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'fxMargin', headerName: 'FX Margin', flex: 1, headerClassName: 'super-app-theme--header' },

    { field: 'platformFee', headerName: 'Charges', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'vatOnFee', headerName: 'VAT', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'luluFee', headerName: 'LULU Commission', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => convertStrToTitleCase(params.row.status),
    },
    {
      field: 'mismatchFields',
      headerName: 'Mismatch Fields',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => <span>{params.value?.join(', ')}</span>,
      // renderCell: (params: any) => {
      //   if (params.row.mismatchFields.length > 0) {
      //     return (
      //       <ul>
      //         {params.row.mismatchFields.map((item: string, ind: number) => (
      //           <li key={ind}>{item}</li>
      //         ))}
      //       </ul>
      //     )
      //   }
      // },
    },
  ]

  const handleFilterValueChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSearch = async () => {
    const payload = {
      fromDate: filters.fromDate ? dayjs(filters.fromDate).format('YYYY-MM-DD') : '',
      toDate: filters.toDate ? dayjs(filters.toDate).format('YYYY-MM-DD') : '',
    }
    const queryString = new URLSearchParams(Object.fromEntries(Object.entries(payload).filter(([_, v]) => v))).toString()
    try {
      setLoading(true)
      await fetchReconTxns(queryString)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setFilters({
      fromDate: null,
      toDate: null,
    })
    fetchReconTxns('')
  }

  const handleExportCSV = () => {
    const visibleCols = columns.filter((col) => columnVisibilityModel[col.field] !== false)
    const headers = visibleCols.map((col) => col.headerName).join(',')
    //@ts-ignore
    const mappedRows = rows.map((row) => visibleCols.map((col) => row[col.field] ?? '').join(','))
    const csv = [headers, ...mappedRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'reconcilation.csv')
    link.click()
  }

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer sx={{ justifyContent: 'flex-start', gap: 1, py: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />

        {/* Reset Filters */}
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<FindReplaceIcon />}
          onClick={() => setFilterModel({ items: [] })}
          sx={{ ml: 1 }}
        >
          Reset Filters
        </Button>
      </GridToolbarContainer>
    )
  }

  return (
    <Box
      sx={{
        height: '80vh',
        width: '90vw',
      }}
    >
      {/* Heading */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
          }}
        >
          Reconciliation
        </Typography>
      </Box>

      <Box
        mb={2}
        display="flex"
        gap={1}
        alignItems="center"
        flexWrap="wrap"
        sx={{
          background: '#fff',
          padding: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="From Date"
            //@ts-ignore
            format="YYYY-MM-DD"
            value={filters?.fromDate}
            onChange={(newValue: any) => handleFilterValueChange('fromDate', newValue)}
            slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
            //@ts-ignore
            renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
          />

          <DatePicker
            label="To Date"
            value={filters?.toDate}
            onChange={(newValue: any) => handleFilterValueChange('toDate', newValue)}
            minDate={filters?.fromDate}
            format="YYYY-MM-DD"
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: 150 },
              },
            }}
          />
        </LocalizationProvider>

        <Button variant="contained" onClick={handleSearch} disabled={isFilterEmpty || loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>

        <Button disabled={loading} variant="outlined" onClick={handleClear}>
          Clear
        </Button>

        <Button variant="outlined" color="primary" size="small" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
          Export
        </Button>
      </Box>

      <Box>
        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
            padding: '20px',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: '#334155',
                  minHeight: 24,
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                Settlement Amount
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: '#334155',
                  minHeight: 24,
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                {amountDetails?.aedAmount}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: '#334155',
                  minHeight: 24,
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                Principal Amount
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: '#334155',
                  minHeight: 24,
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                {amountDetails?.inrPayout}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: '#334155',
                  minHeight: 24,
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                Impro Fee
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: '#334155',
                  minHeight: 24,
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                {amountDetails?.platformFee}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: '#334155',
                  minHeight: 24,
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                VAT
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: '#334155',
                  minHeight: 24,
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                {amountDetails?.vatOnFee}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: '#334155',
                  minHeight: 24,
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                Lulu Commission
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: '#334155',
                  minHeight: 24,
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                {amountDetails?.luluFee}
              </Typography>
            </Box>

            {/* 
            <Box>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: '#334155',
                  minHeight: 24,
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                VAT On lulu Fee
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: '#334155',
                  minHeight: 24,
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                {amountDetails?.vatOnLuluFee}
              </Typography>
            </Box> */}
          </Box>
        </Card>
      </Box>

      {/* Data Grid */}
      <DataGrid
        sx={{
          // height: '70vh',
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
          '& .super-app-theme--header': {
            fontSize: '16px',
          },
        }}
        rows={rows}
        columns={columns}
        getRowId={(row: any) => row.transactionId}
        initialState={{
          pagination: { paginationModel: { pageSize: 20, page: 0 } },
        }}
        pageSizeOptions={[10, 20, 50]}
        slots={{
          loadingOverlay: LoaderUI.LoadingOverlay,
          toolbar: CustomToolbar, // 👈 Toolbar with reset filters
        }}
        disableColumnMenu
        filterModel={filterModel}
        onFilterModelChange={(model) => setFilterModel(model)}
      />

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: '50vw', p: 3 }}>
          <Box display="flex" gap={2}>
            <Box
              flex={1}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',

                width: '30%',
                fontWeight: '300',
                padding: '2%',
              }}
            >
              TRX ID {transactionDetails?.applicantTranNumber}
            </Box>

            <Box
              flex={0.1}
              sx={{
                backgroundColor: getStatusColor(transactionDetails?.reconStatus),
                color: 'white',

                textAlign: 'center',
                fontWeight: '900',
                alignContent: 'center',
                padding: '1%',
              }}
            >
              {transactionDetails?.reconStatus}
            </Box>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: '500',
            }}
            gutterBottom
          >
            <b> Transaction Details</b>
          </Typography>
          {transactionDetails && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <TextField fullWidth label="Applicant Id" value={transactionDetails?.applicantTranNumber || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Destination" value={transactionDetails?.receiversCountry || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Settlement Amount" value={transactionDetails?.receiversAmount || ''} disabled />
                </Grid>

                <Grid item xs={3}>
                  <TextField fullWidth label="Principal Amount" value={transactionDetails?.senderAmount || ''} disabled />
                </Grid>

                <Grid item xs={3}>
                  <TextField fullWidth label="Cover" value={transactionDetails?.coverNumber || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Sender Currency" value={transactionDetails?.senderCurrency || ''} disabled />
                </Grid>

                <Grid item xs={3}>
                  <TextField fullWidth label="Reciver Currency" value={transactionDetails?.receiversCurrency || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Gateway" value={transactionDetails?.gatewayUsed || ''} disabled />
                </Grid>

                <Grid item xs={3}>
                  <TextField fullWidth label="Charges" value={transactionDetails?.gatewayCharges || ''} disabled />
                </Grid>
              </Grid>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: '500',
                }}
                gutterBottom
              >
                <b> Beneficary Details </b>
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <TextField fullWidth label="Account Holder Name" value={transactionDetails?.gatewayCharges || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Account Holder" value={transactionDetails?.gatewayCharges || ''} disabled />
                </Grid>

                <Grid item xs={3}>
                  <TextField fullWidth label="Beneficay Id" value={transactionDetails?.beneficiaryMoneyReceivedInd || ''} disabled />
                </Grid>

                <Grid item xs={3}>
                  <TextField fullWidth label="Bank" value={transactionDetails?.rcvCorrBankName || ''} disabled />
                </Grid>

                <Grid item xs={3}>
                  <TextField fullWidth label="IFSC Code" value={transactionDetails?.rcvCorrBankBic || ''} disabled />
                </Grid>
              </Grid>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: '500',
                }}
                gutterBottom
              >
                <b> Source Bank Transaction ID </b>{' '}
                <span
                  style={{
                    backgroundColor: theme.palette.primary.main,
                    padding: '1%',

                    color: 'white',
                  }}
                >
                  {transactionDetails?.senderCtryTransId ? transactionDetails?.senderCtryTransId : 'NOT DATA AVAILABLE'}
                </span>
                <span
                  style={{
                    marginLeft: '4%',
                  }}
                >
                  <StatusDropdown value={sourcebankTransaction} onChange={setsourcebankTransaction}></StatusDropdown>
                </span>
              </Typography>

              <Grid container spacing={2} mt={1}>
                <Grid item xs={3}>
                  <TextField fullWidth label="Date" value={transactionDetails.captureTimestamp || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Sender Bank Name" value={transactionDetails.senderCorrBankName || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Sender Bank BIC" value={transactionDetails.senderCorrBankBic || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Sender Sort Code" value={transactionDetails.senderCorrBankSortCode || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Amount Settled" value={transactionDetails?.senderAmount || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="County /Region" value={transactionDetails?.senderCountry || ''} disabled />
                </Grid>
              </Grid>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: '500',
                }}
                gutterBottom
              >
                <b> Beneficary Transacation ID</b>{' '}
                <span
                  style={{
                    backgroundColor: theme.palette.primary.main,
                    padding: '1%',

                    color: 'white',
                  }}
                >
                  {transactionDetails?.rcvCtryTransId ? transactionDetails?.rcvCtryTransId : 'NO DATA AVAILABLE'}
                </span>
                <span
                  style={{
                    marginLeft: '4%',
                  }}
                >
                  <StatusDropdown value={beneficaryTransaction} onChange={setbeneficaryTransaction}></StatusDropdown>
                </span>
              </Typography>

              <Grid container spacing={2} mt={1}>
                <Grid item xs={3}>
                  <TextField fullWidth label="Date" value={transactionDetails.captureTimestamp || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label=" Bank Name" value={transactionDetails.rcvCorrBankName || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label=" Bank BIC Code" value={transactionDetails.rcvCorrBankBic || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Bank Sort Code" value={transactionDetails.rcvCorrBankSortCode || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Amount Settled" value={transactionDetails?.receiversAmount || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="County /Region" value={transactionDetails?.receiversCountry || ''} disabled />
                </Grid>
              </Grid>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: '500',
                }}
                gutterBottom
              >
                <b> Settlement Transaction ID</b>{' '}
                <span
                  style={{
                    backgroundColor: theme.palette.primary.main,
                    padding: '1%',

                    color: 'white',
                  }}
                >
                  {transactionDetails?.utrFinalTrn ? transactionDetails?.utrFinalTrn : 'NO DATA AVAILABLE'}
                </span>
                <span
                  style={{
                    marginLeft: '4%',
                  }}
                >
                  <StatusDropdown value={settlementTransaction} onChange={setsettlementTransaction}></StatusDropdown>
                </span>
              </Typography>

              <Grid container spacing={2} mt={1}>
                <Grid item xs={3}>
                  <TextField fullWidth label="Date" value={transactionDetails.settlementTransDate || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label=" Bank Name" value={transactionDetails.settlementTransBankName || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label=" Bank BIC" value={transactionDetails.settlementTransBicCode || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Sort Code" value={transactionDetails.settlementTransBankSortCode || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Amount Settled" value={transactionDetails?.receiversAmount || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="County /Region" value={transactionDetails?.receiversCountry || ''} disabled />
                </Grid>
              </Grid>

              <Box mt={4}>
                <Button variant="outlined" onClick={handleSave}>
                  Save
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  )
}
