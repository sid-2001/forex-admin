import react, { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Button, Dialog, DialogContent, DialogTitle, DialogActions, Chip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { HelperService } from '@/helpers/helper'
import { statusColors } from '@/contants/utils'

//@ts-ignore
const ReferralDataGrid = ({ rows, columns }) => {
  return (
    <DataGrid
      sx={{
        height: '70vh',
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
      rows={rows || []}
      //@ts-ignore
      pageSize={5}
      rowsPerPageOptions={[5]}
      disableSelectionOnClick
      getRowId={(row) => row.referreeId || row.id}
    />
  )
}

const ReferralTransactions = ({
  //@ts-ignore
  referralRecords,
  //@ts-ignore
  referralType,
}) => {
  const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false)
  const [transactionList, setTransactionList] = useState<any>([])
  const navigate = useNavigate()
  const helper = new HelperService()

  const ReferralColumns = [
    {
      field: 'countryCode',
      headerName: 'Country Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'transactionNumber',
      headerName: 'Transaction Number',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'rewardRedeemed',
      headerName: referralType === 'Credited' ? 'Reward Credited' : 'Reward Redeemed',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'referrerApplicantId',
      headerName: 'Applicant Id',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      // renderCell: (params: any) => (
      //     <span
      //         style={{ color: '#1976d2', cursor: 'pointer' }}
      //         onClick={() => navigate(`/applicant-details/${params.value}`)}
      //     >
      //         {params.value}
      //     </span>
      // ),
    },
  ]

  const ReferralCreditedColumns = [
    {
      field: 'countryCode',
      headerName: 'Country Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'applicantReferralTransaction',
      headerName: 'Transactions Count',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <span
          style={{
            cursor: 'pointer',
            color: '#1976d2',
          }}
          onClick={() => {
            setShowTransactionModal(!showTransactionModal)
            setTransactionList(params.row.applicantReferralTransaction)
          }}
        >
          {params.row.applicantReferralTransaction.length}
        </span>
      ),
    },
    {
      field: 'totalRewards',
      headerName: 'Total Rewards',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'referreeId',
      headerName: 'Applicant Id',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      // renderCell: (params: any) => (
      //     <span
      //         style={{ color: '#1976d2', cursor: 'pointer' }}
      //         onClick={() => navigate(`/applicant-details/${params.value}`)}
      //     >
      //         {params.value}
      //     </span>
      // ),
    },
  ]

  const RedeemedReferralsColumns = [
    {
      field: 'countryCode',
      headerName: 'Country Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'code',
      headerName: 'Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const status = params?.row?.status?.toUpperCase?.() || ''

        if (!status) {
          return null // 👈 empty ho toh chip hi na render karo
          // OR return <Chip label="N/A" size="small" />; // fallback chahiye toh
        }

        return (
          <Chip
            label={status}
            sx={{
              backgroundColor: statusColors[status] || 'grey',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        )
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'createdLocalDateTime',
      headerName: 'Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => helper.convertDateAndTime(params?.row?.createdLocalDateTime),
    },
  ]

  const handleModalClose = () => {
    setShowTransactionModal(!setShowTransactionModal)
  }

  const gridColumns = () => {
    if (referralType === 'Credited') return ReferralCreditedColumns
    else if (referralType === 'Redeemed') return ReferralColumns
    else if (referralType === 'RedeemReferral') return RedeemedReferralsColumns
  }

  return (
    <Box>
      {referralRecords && referralRecords.length > 0 ? <ReferralDataGrid rows={referralRecords} columns={gridColumns()} /> : <p>No Referral Found</p>}

      <Dialog open={showTransactionModal} onClose={handleModalClose} fullWidth maxWidth="md">
        <DialogTitle>All Transactions</DialogTitle>
        <DialogContent>
          <div style={{ height: 400, width: '800', marginTop: 16 }}>
            <ReferralDataGrid rows={transactionList} columns={ReferralColumns} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ReferralTransactions
