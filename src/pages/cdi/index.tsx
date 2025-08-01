import React, { useEffect, useState } from 'react'
import { Box, Typography, useTheme, Drawer, Grid, TextField, Divider, Chip, IconButton, Button } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'
import { PreviewOutlined } from '@mui/icons-material'
import { TransactionService } from '@/services/transaction.service'
import LoaderUI from '@/components/loader/loader'
import { Outline } from 'react-pdf'
import { Card, CardContent, Stack, Avatar, Skeleton } from '@mui/material'
import { AttachMoney } from '@mui/icons-material'



const StyledDataGrid = styled(DataGrid)({
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#1976d2',
    color: '#fff',
    fontWeight: 'bold',
  },
  '& .MuiDataGrid-row:nth-of-type(even)': {
    backgroundColor: '#e3f2fd',
  },
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

  const fetchCdiApiCall = async () => {
    try {
      const data = await service.cdiTransactions()
      setCdiRecords(data)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }

  useEffect(() => {
  const loadData = async () => {
    setIsLoading(true);
    await fetchCdiApiCall();
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
  const [isLoading, setIsLoading] = useState(true);




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
        <Typography variant="h4" color={theme.palette.secondary.main}>
          <strong>CDI Transactions</strong>
        </Typography>
      </Box>
    <Stack direction="row" spacing={2} mb={2} >
  {/* Total Deposits */}
  <Card
    sx={{
      width: 240,
      height: 120,
      background: 'linear-gradient(to right, #2196F3, #21CBF3)',
      color: 'white',
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <CardContent sx={{ textAlign: 'center', p: 0 }}>
      <Typography variant="body2" fontWeight={500}>
        Total Deposits
      </Typography>
      <Typography variant="h6" fontWeight="bold">
        R1,000,000
      </Typography>
    </CardContent>
  </Card>

  {/* Released */}
  <Card
    sx={{
      width: 240,
      height: 120,
      background: 'linear-gradient(to right, #4CAF50, #81C784)',
      color: 'white',
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <CardContent sx={{ textAlign: 'center', p: 0 }}>
      <Typography variant="body2" fontWeight={500}>
        Released
      </Typography>
      <Typography variant="h6" fontWeight="bold">
        R988,899
      </Typography>
    </CardContent>
  </Card>

  {/* Un-mapped */}
  <Card
    sx={{
      width: 240,
      height: 120,
      background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
      color: 'white',
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <CardContent sx={{ textAlign: 'center', p: 0 }}>
      <Typography variant="body2" fontWeight={500}>
        Un-mapped
      </Typography>
      <Typography variant="h6" fontWeight="bold">
        R11,101
      </Typography>
    </CardContent>
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
        getRowId={(row) => row?.referenceNumber}
      />

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={closeDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: '30%',
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
                backgroundColor: theme.palette.primary.main,
                p: '0.5%',
                color: 'white',
                paddingLeft: '5%',
                paddingRight: '5%',
                marginBottom: 2,
                width: '40%',
              }}
            >
              TRANSACTION ID : {transactionDetails.referenceNumber}
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
                <TextField label="UTR Number" value={transactionDetails?.uniqueInstanceId || ''} fullWidth variant="outlined" size="small" disabled/>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="Amount" value={transactionDetails?.transactionAmount || ''} fullWidth variant="outlined" size="small" disabled/>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="Date" value={transactionDetails?.transactionDate || ''} fullWidth  variant="outlined"  size="small" disabled/>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="Time" value={transactionDetails?.transactionTime || ''} fullWidth variant="outlined" size="small" disabled/>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="Account Number" value={transactionDetails?.accountNumber || ''} fullWidth variant="outlined" size="small" disabled />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="Reference Number" value={transactionDetails?.referenceNumber || ''} fullWidth variant="outlined" size="small" disabled/>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Effective Date" value={transactionDetails?.effectiveDate || ''} fullWidth variant="outlined" size="small" disabled/>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="Bank Name" value={transactionDetails?.bankName || ''} fullWidth variant="outlined" size="small" disabled/>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField label="Branch Code" value={transactionDetails?.branchCode || ''} fullWidth variant="outlined" size="small" disabled/>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, borderBottomWidth: '5px', }} />
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ marginBottom: 1 }}>
                Transaction Number
              </Typography>

              <TextField
                label="Enter Transaction Number"
                variant="outlined"
                size="small"
                sx={{ width: '60%', marginBottom: 2 }} // You can adjust width as needed
              />

              <Button
                variant="outlined"
                color="primary"
                sx={{
                  textTransform: 'none',
                  fontWeight: 'bold',
                  border: 'Outline',
                  width: '60%', // Match or change independently
                }}
                onClick={() => {
                  console.log('Send for Release clicked');
                }}
              >
                Send for Release
              </Button>
            </Box>



          </Box>
        )}
      </Drawer>
    </Box>
  )
}

export default CdiScreen
