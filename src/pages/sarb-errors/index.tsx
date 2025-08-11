import React, { useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Typography, useTheme, Card, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { statusColors } from '@/contants/utils'
import LoaderUI from '@/components/loader/loader'

const sarbdata = [
  {
    id: 1,
    transaction_number: 'ZAOWRM250811IN0001',
    created_at: Date.now(),
    error_code: '401',
    error_description: 'Invalid Gender',
    transaction_attempt: 2,
    transaction_status: 'Nack',
  },
  {
    id: 2,
    transaction_number: 'ZAOWRM250811IN0007',
    created_at: Date.now(),
    error_code: '501',
    error_description: 'Invalid and mandatory postal address line 1',
    transaction_attempt: 1,
    transaction_status: 'Ack',
  },
]

const SarbErrorsListing: React.FC = () => {
  const [sarbData, setSarbData] = React.useState(sarbdata)
  //   const navigate = useNavigate()
  const helper = new HelperService()

  useEffect(() => {
    //  fetchSarbErrorsData()
  }, [])

  const fetchSarbErrorsData = async () => {
    try {
      //   const response = await bopService.getBopListing()
      //   setSarbData(response)
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const columns = [
    {
      field: 'transaction_number',
      headerName: 'Transaction No.',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'created_at',
      headerName: 'Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return helper.convertDateAndTime(params.row.created_at)
      },
    },
    {
      field: 'error_code',
      headerName: 'Error Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'error_description',
      headerName: 'Error Description',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'transaction_attempt',
      headerName: 'Attempt No',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },

    {
      field: 'transaction_status',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return (
          <div>
            <span
              style={{
                color: 'white',
                padding: '4px 16px',
                borderRadius: '6px',
                background: statusColors[params?.row?.transaction_status?.toUpperCase()],
              }}
            >
              {params?.row?.transaction_status?.toUpperCase()}
            </span>
          </div>
        )
      },
    },
    {
      field: 'id1',
      headerName: 'Action',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: () => <a>View More</a>,
    },
  ]

  return (
    <Box sx={{ width: '80vw', height: '60vh' }}>
      <Typography variant="h4" gutterBottom>
        <strong>Ack/Nack</strong>
      </Typography>
      <Stack direction="row" spacing={2} mb={2}>
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
            Total Transactions
          </Typography>

          <Typography variant="h6" fontWeight="bold" align="right">
            R2
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
            Ack
          </Typography>

          <Typography variant="h6" fontWeight="bold" align="right">
            R1
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
            Nack
          </Typography>

          <Typography variant="h6" fontWeight="bold" align="right">
            R1
          </Typography>
        </Card>
      </Stack>
      {sarbData && (
        <DataGrid
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
          rows={sarbData}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 20, page: 0 },
            },
          }}
          pageSizeOptions={[10]}
          loading={sarbData.length === 0}
          slots={{
            loadingOverlay: LoaderUI.LoadingOverlay, // custom loader
          }}
          getRowId={(row: any) => row.id}
        />
      )}
    </Box>
  )
}

export default SarbErrorsListing
