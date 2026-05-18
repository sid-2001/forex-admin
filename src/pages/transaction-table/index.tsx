import React, { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Button, Chip, Divider, Drawer, Grid, IconButton, TextField, Typography, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'

const local_service = new LocalStorageService()

interface Transaction {
  id: number
  transactionNumber: string
  sendCountry: string
  receiveCountry: string
  amount: string
  transactionStatus: string
}

interface TransactionTableProps {
  transactions: Transaction[]
}
//@ts-ignore
const TransactionTable: React.FC<TransactionTableProps> = ({ transaction, applicantId, availabledata = true }) => {
  let navigate = useNavigate()
  const theme = useTheme()
  const helper = new HelperService()

  const [transactionDetails, setTransactionDetails] = useState<any>(null)
  const [trxStatus, settrxStatus] = useState('')
  const [zaphierlink, setZaphierLink] = useState('')
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const closeDrawer = () => {
    setDrawerOpen(false)
  }

  const renderBeneficiaryFullName = (beneficiary: any) => {
    const { beneficiaryFirstName, beneficiaryLastName } = beneficiary
    return beneficiary?.beneficiaryMiddleName
      ? `${beneficiaryFirstName} ${beneficiary?.beneficiaryMiddleName} ${beneficiaryLastName}`
      : `${beneficiaryFirstName} ${beneficiaryLastName}`
  }

  const renderTransactionStatus = (transStatus: string) => (transStatus === 'IN_PROGRESS' ? 'IN PROGRESS' : transStatus)

  const columns = [
    {
      field: 'id',
      headerName: 'S. No',
      flex: 0.5,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'transactionNumber',
      headerName: 'Transaction No.',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <span
          style={{
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
          onClick={() => navigate(`/transaction-detail/${params?.row?.transactionNumber}`)}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: 'sendCountry',
      headerName: 'Sender Country',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'receiveCountry',
      headerName: 'Receiver Country',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'beneficiaryName',
      headerName: 'Beneficiary Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => <div>{renderBeneficiaryFullName(params?.row)}</div>,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 0.5,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'transactionStatus',
      headerName: 'Transaction Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => <div>{renderTransactionStatus(params?.row?.transactionStatus)}</div>,
    },
  ]

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.TRANSACTION_OUTWARD}>
      <Box sx={{ width: '46vw' }}>
        {transaction.length > 0 ? (
          <Box
            sx={{
              width: '120%',
              height: '30vh',
              overflow: 'auto',
              borderRadius: '6px',
            }}
          >
            <DataGrid
              sx={{
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
              columns={columns}
              rows={transaction}
              //@ts-ignore
              pageSize={5}
              rowsPerPageOptions={[5]}
              getRowId={(row: any) => row.id}
            />
          </Box>
        ) : (
          <p>No Transactions Found</p>
        )}

        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={closeDrawer}
          sx={{
            '& .MuiDrawer-paper': {
              width: '60%',
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
                  marginBottom: 2,
                  color: 'white',
                  textAlign: 'center',
                  backgroundColor: theme.palette.primary.main,
                  width: '40%',
                  padding: '1%',
                  borderRadius: '3%',
                }}
              >
                TRN ID- {transactionDetails?.transactionNumber}
              </Typography>

              <Chip label={transactionDetails?.status} color="warning" sx={{ marginBottom: 2 }} />
              <Divider sx={{ my: 2 }} />

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
                    defaultValue={transactionDetails.currency}
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
                  <TextField
                    label="Account Number"
                    variant="filled"
                    fullWidth
                    defaultValue={transactionDetails?.accountNumber}
                    size="small"
                    disabled
                  />
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
                    defaultValue={
                      transactionDetails?.beneficiaryMiddleName
                        ? `${transactionDetails.beneficiaryFirstName} ${transactionDetails?.beneficiaryMiddleName} ${transactionDetails.beneficiaryLastName}`
                        : `${transactionDetails.beneficiaryFirstName} ${transactionDetails.beneficiaryLastName}`
                    }
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
                  <TextField label="Applicant Id" variant="filled" fullWidth defaultValue={transactionDetails?.applicantId} size="small" disabled />
                </Grid>
                {/* <Grid item xs={12} md={6}>
                      <TextField label="Applicant Name" variant="filled" fullWidth defaultValue={transactionDetails?.applicant?.firstName} size="small" disabled />
                    </Grid> */}
              </Grid>
              {trxStatus == 'DRAFT' || trxStatus == 'PENDING' ? (
                <>
                  <Button
                    disabled={zaphierlink.length > 0 ? false : true}
                    variant="outlined"
                    onClick={() => {
                      closeDrawer()
                      // window.location.href=zaphierlink;
                      // openInNewTab(zaphierlink)
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
      </Box>
    </HasPermission>
  )
}

export default TransactionTable
