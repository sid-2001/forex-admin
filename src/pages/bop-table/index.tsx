import React, { useEffect } from 'react'
import { DataGrid, renderActionsCell } from '@mui/x-data-grid'
import { Box, Typography, IconButton } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { statusColors } from '@/contants/utils'

const { VITE_FOREX_NODE_APP_URL } = import.meta.env
const backendUrl = VITE_FOREX_NODE_APP_URL

const BopTable: React.FC = () => {
  const [bopData, setBopData] = React.useState([])
  const navigate = useNavigate()
  const helper = new HelperService()
  const local_service = new LocalStorageService()

  useEffect(() => {
    fetchBopListingData()
  }, [])

  const fetchBopListingData = async () => {
    try {
      const response = await fetch(`${backendUrl}/bop/getAll`)
      const data = await response.json()
      setBopData(data)
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
      field: 'transaction_attempt',
      headerName: 'Transaction Attempt No',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'name',
      headerName: 'Resident Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'benificiary_name',
      headerName: 'Non Resident Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return <div style={{ color: statusColors[params.row.status.toUpperCase()] }}>{params.row.status.toUpperCase()}</div>
      },
    },
    {
      field: 'sap_status',
      headerName: 'Sarb Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return <div>{params.row.sap_status.toUpperCase()}</div>
      },
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
      field: 'id1',
      headerName: 'Action',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <IconButton
          onClick={() => {
            navigate(`/bop-details/${params.row.transaction_number}/${params.row.transaction_attempt}`)
          }}
        >
          <VisibilityIcon
            style={{
              cursor: 'pointer',
            }}
          />
        </IconButton>
      ),
    },
  ]

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.BOP}>
      <Box sx={{ width: '80vw', height: '70vh' }}>
        <Typography variant="h4" gutterBottom>
          <strong>Bop Listing </strong>
        </Typography>
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
            '& .MuiDataGrid-row:nth-of-type(even)': {
              backgroundColor: '#f0f8ff',
            },
            '& .MuiDataGrid-row:nth-of-type(odd)': {
              backgroundColor: '#ffffff',
            },
            '& .super-app-theme--header': {
              fontSize: '16px',
            },
          }}
          columns={columns}
          rows={bopData}
          //@ts-ignore
          pageSize={5}
          rowsPerPageOptions={[5]}
          getRowId={(row: any) => row.id} // Ensure proper row ID handling
        />
      </Box>
    </HasPermission>
  )
}

export default BopTable
