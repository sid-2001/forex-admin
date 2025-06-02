import { Box, Grid, Typography, Input, useTheme } from '@mui/material'
import React from 'react'
import { DataGrid } from '@mui/x-data-grid'

const AboutBeneficiary = () => {
  const theme = useTheme();
  const rows = [
    { id: 1, transactionId: 'T001', destinationCountry: 'South Africa', amountZAR: '5000', status: 'Completed', gateway: 'PayPal', txnReferenceNumber: 'TXN12345', beneficiary: 'John Doe' },
    { id: 2, transactionId: 'T002', destinationCountry: 'USA', amountZAR: '15000', status: 'Pending', gateway: 'Stripe', txnReferenceNumber: 'TXN12346', beneficiary: 'Jane Smith' },
    { id: 3, transactionId: 'T003', destinationCountry: 'Canada', amountZAR: '12000', status: 'Completed', gateway: 'Visa', txnReferenceNumber: 'TXN12347', beneficiary: 'Samuel Jackson' },
    { id: 4, transactionId: 'T004', destinationCountry: 'Mexico', amountZAR: '25000', status: 'Failed', gateway: 'MasterCard', txnReferenceNumber: 'TXN12348', beneficiary: 'Carlos Rivera' },
    { id: 5, transactionId: 'T005', destinationCountry: 'South Africa', amountZAR: '3000', status: 'Completed', gateway: 'PayPal', txnReferenceNumber: 'TXN12349', beneficiary: 'Olivia Brown' },
];

  return (
    <Box sx={{
      width: "50vw"
    }}>
      <Typography variant="h4" gutterBottom>
        <strong> About Beneficiary </strong>
      </Typography>
      <Box mb={1} display="flex" justifyContent="space-between" alignItems="center">
        <Typography
          variant="h6"
          sx={{
            backgroundColor: theme.palette.primary.main,
            p: '0.5%',
            color: 'white',
            paddingBlock: 1,
            paddingInline: 2,
          }}> Beneficiary ID - APSIN0023
        </Typography>
      </Box>

      <Grid item xs={12}>
        <Grid container spacing={3} mt={1}>
          <Grid item xs={4}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Applicant ID
            </Typography>
            <Input
              fullWidth
              value="APSIN0012"
              sx={{
                fontSize: '1rem',
                padding: '10px 14px',
                backgroundColor: '#f5f5f5',
                color: '#4169E1',
                borderBottom: '2px solid #ADD8E6', // Blue bottom border
                borderRadius: 0, // Remove rounded corners
                '&:hover': {
                  borderBottom: '2px solid #ADD8E6', // Blue bottom border on hover
                },
                '&.Mui-focused': {
                  borderBottom: '2px solid #ADD8E6', // Blue bottom border when focused
                }
              }}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={3}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Account Holder
            </Typography>
            <Input
              fullWidth
              value="Ruchi Sharma"
              sx={{
                fontSize: '1rem',
                padding: '10px 14px',
                backgroundColor: '#f5f5f5',
                color: '#4169E1',
                borderBottom: '2px solid #ADD8E6', // Blue bottom border
                borderRadius: 0, // Remove rounded corners
                '&:hover': {
                  borderBottom: '2px solid #ADD8E6', // Blue bottom border on hover
                },
                '&.Mui-focused': {
                  borderBottom: '2px solid #ADD8E6', // Blue bottom border when focused
                }
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Nick Name
            </Typography>
            <Input
              fullWidth
              value="Ruchi"
              sx={{
                fontSize: '1rem',
                padding: '10px 14px',
                backgroundColor: '#f5f5f5',
                color: '#4169E1',
                borderBottom: '2px solid #ADD8E6', // Blue bottom border
                borderRadius: 0, // Remove rounded corners
                '&:hover': {
                  borderBottom: '2px solid #ADD8E6', // Blue bottom border on hover
                },
                '&.Mui-focused': {
                  borderBottom: '2px solid #ADD8E6', // Blue bottom border when focused
                }
              }}
            />
          </Grid>

          
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} mt={0.5}>
          <Grid item xs={3}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Account Number
            </Typography>
            <Input
              fullWidth
              value="999673488595"
              sx={{
                fontSize: '1rem',
                padding: '10px 14px',
                backgroundColor: '#f5f5f5',
                color: '#4169E1',
                borderBottom: '2px solid #ADD8E6', // Blue bottom border
                borderRadius: 0, // Remove rounded corners
                '&:hover': {
                  borderBottom: '2px solid #ADD8E6', // Blue bottom border on hover
                },
                '&.Mui-focused': {
                  borderBottom: '2px solid #ADD8E6', // Blue bottom border when focused
                }
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Bank Name
            </Typography>
            <Input
              fullWidth
              value="Kotak Mahindra"
              sx={{
                fontSize: '1rem',
                padding: '10px 10px',
                backgroundColor: '#f5f5f5',
                color: '#4169E1',
                borderBottom: '2px solid #ADD8E6', // Blue bottom border
                borderRadius: 0, // Remove rounded corners
                '&:hover': {
                  borderBottom: '2px solid #ADD8E6', // Blue bottom border on hover
                },
                '&.Mui-focused': {
                  borderBottom: '2px solid #ADD8E6', // Blue bottom border when focused
                }
              }}
            />
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              IFSC Code
            </Typography>
            <Input
              fullWidth
              value="KTK090974"
              sx={{
                fontSize: '1rem',
                padding: '10px 14px',
                backgroundColor: '#f5f5f5',
                color: '#4169E1',
                borderBottom: '2px solid #ADD8E6', // Blue bottom border
                borderRadius: 0, // Remove rounded corners
                '&:hover': {
                  borderBottom: '2px solid #ADD8E6', // Blue bottom border on hover
                },
                '&.Mui-focused': {
                  borderBottom: '2px solid #ADD8E6', // Blue bottom border when focused
                }
              }}
            />
          </Grid>

          
        </Grid>
         <Typography variant="h6" mt={4} gutterBottom>
                          <strong>Transactions</strong>
         </Typography>

      </Grid>
      <DataGrid
                  sx={{
                      width: '70vw',
                      '& .MuiDataGrid-columnHeaders': {
                          '& .super-app-theme--header': {
                              backgroundColor: '#005099',
                              color: 'white',
                          }
                      },
                      '& .MuiDataGrid-columnHeaderTitle': {
                          fontWeight: 'bold', // Bold title for headers
                      },
                      '& .MuiDataGrid-cell': {
                          fontSize: '14px',
                      },
                      '& .MuiDataGrid-row:nth-of-type(even)': {
                          backgroundColor: '#f0f8ff', // Light blue for even rows
                      },
                      '& .MuiDataGrid-row:nth-of-type(odd)': {
                          backgroundColor: '#ffffff', // White for odd rows
                      },
                      '& .super-app-theme--header': {
                          fontSize: '16px',
                      },
                  }}
                  columns={[
                      {
                          field: 'id',
                          headerName: 'SNo',
                          flex: 1,
                          headerClassName: 'super-app-theme--header',
                      },
                      {
                          field: 'transactionId',
                          headerName: 'Transaction ID',
                          flex: 1,
                          headerClassName: 'super-app-theme--header',
                      },
                      {
                          field: 'destinationCountry',
                          headerName: 'Destination Country',
                          flex: 1,
                          headerClassName: 'super-app-theme--header',
                      },
                      {
                          field: 'amountZAR',
                          headerName: 'Amount (ZAR)',
                          flex: 1,
                          headerClassName: 'super-app-theme--header',
                      },
                      {
                          field: 'status',
                          headerName: 'Status',
                          flex: 1,
                          headerClassName: 'super-app-theme--header',
                      },
                      {
                          field: 'gateway',
                          headerName: 'Gateway',
                          flex: 1,
                          headerClassName: 'super-app-theme--header',
                      },
                      {
                          field: 'txnReferenceNumber',
                          headerName: 'Txn Reference Number',
                          flex: 1,
                          headerClassName: 'super-app-theme--header',
                      },
                      {
                          field: 'beneficiary',
                          headerName: 'Beneficiary',
                          flex: 1,
                          headerClassName: 'super-app-theme--header',
                      },
                      {
                          field: 'action',
                          headerName: 'Action',
                          flex: 1,
                          headerClassName: 'super-app-theme--header',
                          renderCell: () => <button>View</button>, // Add any action button
                      },
                  ]}
                  rows={rows}
                  //@ts-ignore
                  pageSize={5}
                  rowsPerPageOptions={[5]}
              />
    </Box>
  )
}

export default AboutBeneficiary
