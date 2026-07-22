import react, { useState } from 'react'
import { Box, Button, Dialog, DialogContent, DialogTitle, DialogActions, Chip, Tooltip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { HelperService } from '@/helpers/helper'
import { statusColors } from '@/contants/utils'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import LoaderUI from '../loader/loader'
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridFilterModel } from '@mui/x-data-grid'
//@ts-ignore
const ReferralDataGrid = ({ rows, columns }) => {
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })

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
      getRowId={(row) => row.referreeId || row.id}
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
      renderCell: (params: any) => {
        return (
          <Tooltip title={params?.value} placement="top">
            <Box
              component="span"
              sx={{
                cursor: 'pointer',
                color: 'text.primary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {params?.value?.replace(/\s*\(.*?\)/, '')}
            </Box>
          </Tooltip>
        )
      },
    },
    {
      field: 'transactionNumber',
      headerName: 'Transaction ID',
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
      //         onClick={() => navigate(`/customer-details/${params.value}`)}
      //     >
      //         {params.value}
      //     </span>
      // ),
    },
  ]

  const percentageMap: any = {
    0: 0,
    1: 50,
    2: 75,
    3: 100,
  }

  const renderUtilisedRewards = (item: any) => {
    const transactionCnt = item?.transactionCnt ?? 0
    return ((percentageMap[transactionCnt] ?? 0) * item.totalRewards) / 100
  }

  const ReferralCreditedColumns = [
    {
      field: 'referreeId',
      headerName: 'Referree Id',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'refereeName',
      headerName: 'Referee Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'referralCode',
      headerName: 'Referral Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'totalRewards',
      headerName: 'Earned Rewards/Total Rewards',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <span>
          {renderUtilisedRewards(params.row)} / {params.row.totalRewards || 0}
        </span>
      ),
    },
    {
      field: 'transactionCnt',
      headerName: 'Transaction Count',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
  ]

  const RedeemedReferralsColumns = [
    {
      field: 'countryCode',
      headerName: 'Country Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return (
          <Tooltip title={params?.value} placement="top">
            <Box
              component="span"
              sx={{
                cursor: 'pointer',
                color: 'text.primary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {params?.value?.replace(/\s*\(.*?\)/, '')}
            </Box>
          </Tooltip>
        )
      },
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
