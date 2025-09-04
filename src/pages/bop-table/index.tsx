import React, { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Typography, IconButton, Chip } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { statusColors } from '@/contants/utils'
import { BopService } from '@/services/bop.services'
import LoaderUI from '@/components/loader/loader'
import { useTheme } from '@emotion/react'

const BopTable: React.FC = () => {
  const [bopData, setBopData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const helper = new HelperService()
  const local_service = new LocalStorageService()
  const bopService = new BopService()

  useEffect(() => {
    fetchBopListingData()
  }, [])

  const fetchBopListingData = async () => {
    try {
      setIsLoading(true)
      const response = await bopService.getBopListing()
      setBopData(response)
      setIsLoading(false)
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }
  const renderBeneficiaryFullName = (row: any) => {
    const { benificiary_first_name, benificiary_last_name } = row
    return row?.benificiary_middle_name
      ? `${benificiary_first_name} ${row?.benificiary_middle_name} ${benificiary_last_name}`
      : `${benificiary_first_name} ${benificiary_last_name}`
  }

  const columns = [
    {
      field: 'transaction_number',
      headerName: 'Transaction No.',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const theme = useTheme()

        return (
          //@ts-ignore
          <Link to={`/transaction?flow=outwards&id=${params?.row?.transaction_number}`} style={{ color: theme.palette.text.primary }}>
            {params?.row?.transaction_number}
          </Link>
        )
      },
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
      field: 'beneficiary_name',
      headerName: 'Non Resident Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return <div>{renderBeneficiaryFullName(params?.row)}</div>
      },
    },
    {
      field: 'transaction_status',
      headerName: 'Transaction Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const status = params?.row?.transaction_status?.toUpperCase?.() || '';

        if (!status) {
          return null; // 👈 empty ho toh chip hi na render karo
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
        );
      },
    },
    {
      field: 'status',
      headerName: 'Bop Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const status = params?.row?.status?.toUpperCase?.() || '';

        if (!status) {
          return null; // 👈 empty ho toh chip skip
        }

        return (
          <Chip
            label={status}
            sx={{
              backgroundColor: statusColors[status] || 'grey',
              color: 'white',
              fontWeight: 'bold',
            }}
            size="small"
          />
        );
      },
    },

    {
      field: 'sap_status',
      headerName: 'Sarb Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const sapStatus = params?.row?.sap_status?.toUpperCase?.() || '';

        if (!sapStatus) {
          return null; // 👈 agar empty hai toh chip na dikhe
        }

        return (
          <Chip
            label={sapStatus}
            sx={{
              backgroundColor: statusColors[sapStatus] || 'grey',
              color: 'white',
              fontWeight: 'bold',
            }}
            size="small"
          />
        );
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
        {bopData && (
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
            rows={bopData || []}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 20, page: 0 },
              },
            }}
            pageSizeOptions={[10]}
            loading={isLoading}
            slots={{
              loadingOverlay: LoaderUI.LoadingOverlay, // custom loader
            }}
            getRowId={(row: any) => row.id}
          />
        )}
      </Box>
    </HasPermission>
  )
}

export default BopTable
