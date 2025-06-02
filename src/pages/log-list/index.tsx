import React, { useEffect, useState } from 'react'
import { DataGrid, gridClasses, GridColDef } from '@mui/x-data-grid'
import { Container, Box, Typography, Chip } from '@mui/material'
import { useNavigate } from 'react-router-dom'

import { DriverService } from '@/services/driver.service'
import dayjs from 'dayjs' // Make sure to install dayjs for date formatting

interface Log {
  uid: string
  driver_name: string
  transaction_count: number
  reason_of_abend: string
  raised_at: string | null
  fixed_at: string | null
  status: string
  attending_person: {
    id: string
    user_code: string
    first_name: string
    last_name: string
    email: string
    phone: string
    created_at: string // ISO date string, e.g., "2024-11-06T07:15:25.459797"
    role: 'admin' | 'user' | 'guest' // Assuming possible roles; add more if needed
    notification_token: string
    is_active: boolean
  }
}

const LogsList: React.FC = () => {
  const [Logs, setLogs] = useState<Log[]>([])
  const driver_service = new DriverService()
  const navigate = useNavigate()

  useEffect(() => {
    //@ts-ignore
    driver_service.logsList().then((data) => {
      //@ts-ignore
      setLogs(data)
    })
  }, [])

  const formatDate = (date: string | null) => (date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-------')

  const columns: GridColDef[] = [
    {
      field: 'driver_name',
      headerName: 'Driver Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerAlign: 'center',
    },
    // {
    //   field: 'transaction_count',
    //   headerName: 'Transaction Count',
    //   flex: 1,
    //   headerClassName: 'super-app-theme--header',
    //   valueGetter: (params) => params || 0, // Default to 0 if null
    // },
    {
      field: 'reason_of_abend',
      headerName: 'Reason of Abend',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'raised_at',
      headerName: 'Raised At',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      valueGetter: (params) => formatDate(params),
    },
    {
      field: 'fixed_at',
      headerName: 'Fixed At',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      valueGetter: (params) => formatDate(params),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Chip
          label={params.row.status}
          color={params.row.status === 'open' ? 'success' : 'error'}
          variant="outlined"
          style={{ fontWeight: 'bold' }}
        />
      ),
    },
    {
      field: 'attendee',
      headerName: 'Attendee ',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      valueGetter: (params) => {
        console.log(params)
        if (params) {
          //@ts-ignore
          return params?.first_name + ' ' + params?.last_name
        } else {
          return '-------'
        }
      },
    },
  ]

  return (
    <Box sx={{ minHeight: '100vh', padding: 2 }}>
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" sx={{ color: '#005099' }}>
            Logs
          </Typography>
        </Box>
        <Box
          sx={{
            borderRadius: 2,
            boxShadow: 3,
            width: '100%',
            '& .super-app-theme--header': {
              backgroundColor: '#005099',
              color: 'white',
            },
          }}
        >
          <DataGrid
            rows={Logs}
            columns={columns}
            //@ts-ignore
            pageSize={5}
            rowsPerPageOptions={[5]}
            getRowId={(row) => row.uid}
            rowClassName={(params: any) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row')}
            sx={{
              [`& .${gridClasses.menuIcon}`]: {
                visibility: 'visible',
                width: 'auto',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#005099',
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-cell': {
                color: '#0d47a1',
                textAlign: 'center',
              },
              '& .MuiDataGrid-row.even-row .MuiDataGrid-cell': {
                backgroundColor: '#ffffff', // White for even rows
              },
              '& .MuiDataGrid-row.odd-row .MuiDataGrid-cell': {
                backgroundColor: '#e3f2fd', // Light blue for odd rows
              },
              '& .MuiDataGrid-footerContainer': {
                color: 'white',
              },
              '& .MuiCheckbox-root': {
                color: '#005099',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#90caf9',
              },
            }}
            autoHeight
          />
        </Box>
      </Container>
    </Box>
  )
}

export default LogsList
