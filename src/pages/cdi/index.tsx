import React, { useEffect, useState } from 'react'
import { Box, Typography, useTheme, Drawer, Grid, TextField, Divider, Chip, IconButton, Button} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'
import { PreviewOutlined } from '@mui/icons-material'
import { TransactionService } from '@/services/transaction.service'
import LoaderUI from '@/components/loader/loader'
import { Card, CardContent, Stack, } from '@mui/material'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'


const StyledDataGrid = styled(DataGrid)({
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#1976d2',
    color: '#fff',
    fontWeight: 'bold',
  },
  // '& .MuiDataGrid-row:nth-of-type(even)': {
  //   backgroundColor: '#e3f2fd',
  // },
  '& .MuiDataGrid-cell': {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  '& .super-app-theme--header': {
    backgroundColor: '#005099',
    color: 'white',
  },
})

const CdiScreen = () => {
  const theme = useTheme()
  const [cdiRecords, setCdiRecords] = useState<any[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState<any>(null)
  const service = new TransactionService()
  const [isLoading, setIsLoading] = useState(true);
  const [referenceInput, setReferenceInput] = useState('')
  const [open, setOpen] = useRecoilState(alertState);
  const [text, setText] = useRecoilState(alertTextState);
  const [type, settype] = useRecoilState(alertTypeState);

  const [dashboardData, setDashboardData] = useState({
    totalDeposit: '0',
    released: '0',
    unMapped: '0',
  });


  const fetchCdiApiCall = async () => {
    try {
      const data = await service.cdiTransactions()
      setCdiRecords(data)


    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const data = await service.cdiCards()
      setDashboardData(data as any)
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };


  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchCdiApiCall();
      await fetchDashboardData();
      setIsLoading(false);
    };

    loadData();
  }, []);


  const openDrawer = (data: any) => {
    setTransactionDetails(data)
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setTransactionDetails(null)
  }

  // for reference update 
  const handleUpdateReference = async () => {
    if (!referenceInput.trim()) return;

    try {
      await service.updateTransactionMapping(referenceInput.trim(), transactionDetails.transactionNumber);
      setReferenceInput('');
      setText("Mapped Successfully")
      setOpen(true)
      settype("success")
      closeDrawer();
    } catch (error) {
      setText("Error fetching your data ")
      setOpen(true)
      settype("error")
      console.error('API error:', error);
    }
  };





  const columns: GridColDef[] = [

    { field: 'transactionNumber', headerName: 'Transaction ID', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'transactionDate', headerName: 'Date', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'transactionTime', headerName: 'Time', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'transactionAmount', headerName: 'Amount', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'accountNumber', headerName: 'Account Number', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'referenceNumber', headerName: 'Ref Number', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'referenceMatchIndicator',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const rawValue = params?.row?.referenceMatchIndicator
        const normalizedValue = String(rawValue).toUpperCase()
        const isMapped = ['Y', 'YES', 'TRUE'].includes(normalizedValue)
        const color = isMapped ? 'green' : 'red'
        const displayText = isMapped ? 'MAPPED' : 'NOT MAPPED'
        return <div style={{ color, fontWeight: 600 }}>{displayText}</div>
      },
    },

    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <IconButton onClick={() => openDrawer(params.row)}>
          <PreviewOutlined />
        </IconButton>
      ),
    },
  ]



  return (
    <Box sx={{ width: '80vw', height: '70vh', p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" color={theme.palette.text.primary}>
          <strong>CDI Transactions</strong>
        </Typography>
      </Box>
      <Stack direction="row" spacing={2} mb={2} >
        {/* Total Deposits */}
        <Card
          sx={{
            width: 240,
            height: 120,
            background: 'linear-gradient(135deg, rgb(164, 216, 228), rgb(15, 98, 165))',
            color: 'white',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 2,
          }}
        >
          <Typography variant="body2" fontWeight={1000} fontSize={20}>
            Total Deposits
          </Typography>

          <Typography variant="h6" fontWeight="bold" align="right">
            {dashboardData.totalDeposit}
          </Typography>
        </Card>

        {/* Released */}
        <Card
          sx={{
            width: 240,
            height: 120,
            background: 'linear-gradient(135deg, #21CBF3 , #4CAF50)',
            color: 'white',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 2,
          }}
        >
          <Typography variant="body2" fontWeight={1000} fontSize={20}>
            Released
          </Typography>

          <Typography variant="h6" fontWeight="bold" align="right">
            {dashboardData.released}
          </Typography>
        </Card>

        {/* Un-mapped */}
        <Card
          sx={{
            width: 240,
            height: 120,
            background: 'linear-gradient(135deg,rgb(93, 206, 231), #ff416c)',
            color: 'white',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 2,
          }}
        >
          <Typography variant="body2" fontWeight={1000} fontSize={20}>
            Un-Mapped
          </Typography>

          <Typography variant="h6" fontWeight="bold" align="right">
            {dashboardData.unMapped}
          </Typography>
        </Card>


      </Stack>


      <StyledDataGrid
        rows={cdiRecords}
        columns={columns}
        //@ts-ignore
        initialState={{
          pagination: {
            paginationModel: { pageSize: 20, page: 0 },
          },
        }}
        pageSizeOptions={[10]}
        loading={cdiRecords.length === 0}
        slots={{
          loadingOverlay: LoaderUI.LoadingOverlay, // custom loader
        }}
        disableRowSelectionOnClick
        getRowId={(row) => row?.transactionNumber}
      />

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={closeDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: '30%',
            padding: 2,
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
                width: '70%',
              }}
            >
              TRANSACTION ID : {transactionDetails.transactionNumber}
            </Typography>

            <Chip
              label={
                ['YES', 'Yes', 'Y', true].includes(
                  String(transactionDetails?.referenceMatchIndicator).toUpperCase()
                )
                  ? 'MAPPED'
                  : 'NOT MAPPED'
              }
              color={
                ['YES', 'Yes', 'Y', true].includes(
                  String(transactionDetails?.referenceMatchIndicator).toUpperCase()
                )
                  ? 'success'
                  : 'error'
              }
              sx={{ marginBottom: 2 }}
            />


            <Typography variant="subtitle1" fontWeight="bold" sx={{ marginBottom: 2 }}>
              Transaction Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="UTR Number" value={transactionDetails?.uniqueInstanceId || ''} fullWidth variant="outlined" size="small" disabled />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="Amount" value={transactionDetails?.transactionAmount || ''} fullWidth variant="outlined" size="small" disabled />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="Date" value={transactionDetails?.transactionDate || ''} fullWidth variant="outlined" size="small" disabled />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="Time" value={transactionDetails?.transactionTime || ''} fullWidth variant="outlined" size="small" disabled />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="Account Number" value={transactionDetails?.accountNumber || ''} fullWidth variant="outlined" size="small" disabled />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="Reference Number" value={transactionDetails?.referenceNumber || ''} fullWidth variant="outlined" size="small" disabled />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Effective Date" value={transactionDetails?.effectiveDate || ''} fullWidth variant="outlined" size="small" disabled />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="Bank Name" value={transactionDetails?.bankName || ''} fullWidth variant="outlined" size="small" disabled />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="Branch Code" value={transactionDetails?.branchCode || ''} fullWidth variant="outlined" size="small" disabled />
              </Grid>
            </Grid>

            
            {transactionDetails?.referenceMatchIndicator?.toUpperCase() !== 'YES' && (
             <>
              <Divider sx={{ my: 3, borderBottomWidth: '5px', }} />
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ marginBottom: 1 }}>
                  Reference  Number
                </Typography>

                <TextField
                  label="Enter Reference Number"
                  value={referenceInput}
                  onChange={(e) => setReferenceInput(e.target.value)}
                  fullWidth
                  sx={{ my: 2 }}
                />

                <Button
                  variant="contained"
                  onClick={handleUpdateReference}
                  disabled={!referenceInput}
                >
                  Send to Release
                </Button>
              </Box>
              </>
            )}
          </Box>
        )}
      </Drawer>
    </Box>
  )
}

export default CdiScreen
