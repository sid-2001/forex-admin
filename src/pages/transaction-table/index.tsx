import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HasPermission from '@/components/permissionWrapper'
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridFilterModel } from '@mui/x-data-grid'
import { LocalStorageService } from '@/helpers/local-storage-service'
import LoaderUI from '@/components/loader/loader'
import { Box, Button, Tooltip } from '@mui/material'
import FindReplaceIcon from '@mui/icons-material/FindReplace'

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
const TransactionTable: React.FC<TransactionTableProps> = ({ transaction, applicantId }) => {
  let navigate = useNavigate()
  const userCountry = local_service?.get_staff_country()
  // 🧹 Filter model state
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })

  const renderBeneficiaryFullName = (beneficiary: any) => {
    const { beneficiaryFirstName, beneficiaryLastName } = beneficiary
    return beneficiary?.beneficiaryMiddleName
      ? `${beneficiaryFirstName} ${beneficiary?.beneficiaryMiddleName} ${beneficiaryLastName}`
      : `${beneficiaryFirstName} ${beneficiaryLastName}`
  }

  const renderTransactionStatus = (transStatus: string) => (transStatus === 'IN_PROGRESS' ? 'IN PROGRESS' : transStatus)

  const columns = [
    {
      field: 'transactionNumber',
      headerName: 'Transaction ID',
      width: 250,
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
      field: 'platformTransactionReferenceId',
      headerName: 'Lulu Transaction ID',
      width: 200,
      headerClassName: 'super-app-theme--header',
    },

    {
      field: 'sendCountry',
      headerName: 'Sender Country',
      width: 150,
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
      field: 'currency',
      headerName: 'Sender Currency',
      width: 150,
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
      field: 'receiveCountry',
      headerName: 'Receiver Country',
      width: 150,
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
      field: 'principalCurrency',
      headerName: 'Receiver Currency',
      width: 150,
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
      field: 'beneficiaryName',
      headerName: 'Beneficiary Name',
      width: 250,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => <div>{renderBeneficiaryFullName(params?.row)}</div>,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 150,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'transactionStatus',
      headerName: 'Transaction Status',
      width: 150,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => <div>{renderTransactionStatus(params?.row?.transactionStatus)}</div>,
    },
  ]

  const filteredColumns = userCountry !== 'UAE' ? columns.filter((item) => item.field !== 'platformTransactionReferenceId') : columns

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
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.TRANSACTION_OUTWARD}>
      {transaction.length > 0 ? (
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
          columns={filteredColumns}
          rows={transaction}
          initialState={{
            pagination: { paginationModel: { pageSize: 20, page: 0 } },
          }}
          pageSizeOptions={[10, 20, 50]}
          getRowId={(row: any) => row.id}
          slots={{
            loadingOverlay: LoaderUI.LoadingOverlay,
            toolbar: CustomToolbar, // 👈 Toolbar with reset filters
          }}
          disableColumnMenu
          filterModel={filterModel}
          onFilterModelChange={(model) => setFilterModel(model)}
        />
      ) : (
        <p>No Transactions Found</p>
      )}
    </HasPermission>
  )
}

export default TransactionTable
