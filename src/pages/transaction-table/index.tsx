import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Chip, Divider, Drawer, Grid, IconButton, TextField, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility'
import { TransactionService } from '@/services/transaction.service';
import { HelperService } from '@/helpers/helper';
import HasPermission from '@/components/permissionWrapper';
import { LocalStorageService } from '@/helpers/local-storage-service';

const local_service = new LocalStorageService();

interface Transaction {
  id: number;
  transactionNumber: string;
  sendCountry: string;
  receiveCountry: string;
  amount: string;
  transactionStatus: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
}
//@ts-ignore
const TransactionTable: React.FC<TransactionTableProps> = ({ transaction, applicantId, availabledata = true }) => {
  let navigate = useNavigate()
  const theme = useTheme()
  const helper = new HelperService()

  const handleViewMore = (row: any) => {
    console.log(row)
    setDrawerOpen(true)
    setTransactionDetails(row)

  }

  const [transactionDetails, setTransactionDetails] = useState<any>(null)
  const [trxStatus, settrxStatus] = useState('')
  const [zaphierlink, setZaphierLink] = useState('')
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const closeDrawer = () => {

    let trx_service = new TransactionService();

    if (trxStatus == "DRAFT" || trxStatus == "PENDING") {
      //  trx_service.createTransaction(creattrx).then(data => {

      //    console.log(data)
      //  })
    }
    setDrawerOpen(false)
    //  setZaphierLink('')
    // window.location.href = zaphierlink;
  }

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
    },
    {
      field: 'sendCountry',
      headerName: 'Send Country',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'receiveCountry',
      headerName: 'Receive Country',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },

    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <>
          <IconButton onClick={() => {
            handleViewMore(params.row)
          }}>
            <VisibilityIcon />
          </IconButton>
        </>
      ),
    },
    {
      field: 'beneficiaryName',
      headerName: 'Beneficiary Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
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
    },
  ];

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.TRANSACTION_OUTWARD}>
      <Box sx={{ width: '100%', height: "100%" }}>
        <Button
          disabled={!availabledata && !helper.checkUserHasPermission(local_service.get_modules()?.TRANSACTION_OUTWARD, 'canCreate')}
          variant="outlined"
          onClick={() => {
            const url = applicantId ? `/sendmoney?applicantId=${applicantId}` : '/sendmoney'
            navigate(url)
          }}
          sx={{
            marginBottom: "3%"
          }}
        >Add Transaction + </Button>
        {transaction.length > 0 ?

          (<DataGrid
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
              '& .super-app-theme--header': {
                fontSize: '16px',
              },
            }}
            columns={columns}
            rows={transaction}
            //@ts-ignore
            pageSize={5}
            rowsPerPageOptions={[5]}
            getRowId={(row: any) => row.id} // Ensure proper row ID handling
          />) : (<p>No Transactions Found</p>)}

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
                    defaultValue={transactionDetails.currency} size="small" disabled />
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
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" sx={{ marginBottom: 2 }}>
                Applicant Details
              </Typography>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={12} md={6}>
                  <TextField label="Applicant Id" variant="filled" fullWidth defaultValue={(transactionDetails?.applicantId)} size="small" disabled />
                </Grid>
                {/* <Grid item xs={12} md={6}>
                      <TextField label="Applicant Name" variant="filled" fullWidth defaultValue={transactionDetails?.applicant?.firstName} size="small" disabled />
                    </Grid> */}
              </Grid>
              {
                (trxStatus == "DRAFT" || trxStatus == "PENDING") ? (<>
                  <Button disabled={zaphierlink.length > 0 ? false : true} variant="outlined" onClick={() => {
                    closeDrawer()
                    // window.location.href=zaphierlink;
                    // openInNewTab(zaphierlink)
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
      </Box></HasPermission>
  );
};

export default TransactionTable;
