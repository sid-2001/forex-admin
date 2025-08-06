import react, { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Button, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import { useNavigate } from 'react-router-dom'

//@ts-ignore
const ReferralDataGrid = ({ rows, columns, width }) => {
  return (
    <DataGrid
      sx={{
        width: width,
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

  const handleModalClose = () => {
    
    setShowTransactionModal(!setShowTransactionModal)
  }

  return (
    <Box>
      {referralRecords && referralRecords.length > 0 ? (
        <ReferralDataGrid rows={referralRecords} columns={referralType === 'Credited' ? ReferralCreditedColumns : ReferralColumns} width={'70vw'} 
        />
      ) : (
        <p>No Referral Found</p>
      )}

      <Dialog open={showTransactionModal} onClose={handleModalClose} fullWidth maxWidth="md">
        <DialogTitle>All Transactions</DialogTitle>
        <DialogContent>
          <div style={{ height: 400, width: '800', marginTop: 16 ,  }}>
            <ReferralDataGrid rows={transactionList} width={'600'} columns={ReferralColumns} />
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
