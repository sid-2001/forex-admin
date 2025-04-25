import React, { useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Typography, IconButton } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { HelperService } from '@/helpers/helper'

const { VITE_FOREX_NODE_APP_URL } = import.meta.env;
const backendUrl = VITE_FOREX_NODE_APP_URL

const BopTable: React.FC = () => {
  const [bopData, setBopData] = React.useState([])
  const navigate = useNavigate();
  const helper = new HelperService()
  const test = 10;


  useEffect(() => {
    fetchBopListingData()
  }, [])

  const fetchBopListingData = async () => {
    fetch(`${backendUrl}/bop/getAll`, {
      method: 'GET', // The HTTP method (GET by default, so this is optional)
      headers: {
        'Content-Type': 'application/json', // Optional: Set content-type header
        // You can add more headers if needed
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json() // or response.text() if you expect plain text
      })
      .then((data) => {
        console.log(data) // Handle the data from the response
        setBopData(data)
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error)
      })
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
    // {
    //   field: 'residence_country',
    //   headerName: 'Resident Country',
    //   flex: 1,
    //   headerClassName: 'super-app-theme--header',
    // },
    // {
    //   field: 'benificiary_country',
    //   headerName: 'Non Resident Country',
    //   flex: 1,
    //   headerClassName: 'super-app-theme--header',
    // },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'sap_status',
      headerName: 'Sap Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: "created_at",
      headerName: "Date",
      flex: 1,
      headerClassName: "super-app-theme--header",
      renderCell: (
        params: any

      ) => {
        return helper.convertDateAndTime(params.row.created_at);
      }
    },
    {
      field: 'id1',
      headerName: 'Action',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (

        <IconButton onClick={() => {
          navigate(`/bop-details/${params.row.transaction_number}/${params.row.transaction_attempt}`)
        }}>
          <VisibilityIcon style={{
            cursor: 'pointer',
          }} />
        </IconButton>

      ),
    },
  ]

  return (
    <Box sx={{ width: '85vw', height: '80vh' }}>
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
  )
}

export default BopTable
