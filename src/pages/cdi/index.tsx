import React, { useEffect, useState } from 'react'
import { Box, Typography, useTheme, Drawer, Grid, TextField, Divider, Chip, IconButton } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'
import { PreviewOutlined } from '@mui/icons-material'
import { TransactionService } from '@/services/transaction.service'
import LoaderUI from '@/components/loader/loader'

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
    fetchCdiApiCall()
  }, [])

  const openDrawer = (data: any) => {
    setTransactionDetails(data)
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setTransactionDetails(null)
  }

  const columns: GridColDef[] = [
    { field: 'transactionNumber', headerName: 'Transaction ID', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'referenceNumber', headerName: 'Reference No.', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'accountNumber', headerName: 'Account No.', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'bankName', headerName: 'Bank', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'transactionAmount', headerName: 'Amount', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'transactionDate', headerName: 'Date', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'branchCode', headerName: 'Branch', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'referenceMatchIndicator',
      headerName: 'Reference Match',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const value = params?.row?.referenceMatchIndicator
        const color = value === 'Y' || value === true ? 'green' : 'red'
        const displayText = value === 'Y' || value === true ? 'YES' : 'NO'

        return <div style={{ color }}>{displayText}</div>
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

            <Chip
              label={transactionDetails?.referenceMatchIndicator === 'Y' || transactionDetails?.referenceMatchIndicator === true ? 'YES' : 'NO'}
              color={
                transactionDetails?.referenceMatchIndicator === 'Y' || transactionDetails?.referenceMatchIndicator === true ? 'success' : 'error'
              }
              sx={{ marginBottom: 2 }}
            />

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
                <TextField label="Branch Code" variant="filled" fullWidth defaultValue={transactionDetails?.branchCode} size="small" disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Debit/Credit Indicator"
                  variant="filled"
                  fullWidth
                  defaultValue={transactionDetails?.debitCreditIndicator}
                  size="small"
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Transaction Number"
                  variant="filled"
                  fullWidth
                  defaultValue={transactionDetails?.transactionNumber}
                  size="small"
                  disabled
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
          </Box>
        )}
      </Drawer>
    </Box>
  )
}

export default CdiScreen
