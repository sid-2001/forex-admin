import React, { useEffect, useState } from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Switch, Box, Typography, Button, useTheme } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import { UserService } from '@/services/user.service'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { HelperService } from '@/helpers/helper'
import RoleModal from '@/components/roles-tab'
import LoaderUI from '@/components/loader/loader'

const StyledDataGrid = styled(DataGrid)({
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#1976d2', // Blue header
    color: '#fff',
    fontWeight: 'bold',
  },
  // '& .MuiDataGrid-row:nth-of-type(even)': {
  //   backgroundColor: '#e3f2fd', // Light blue alternate rows
  // },

  '& .MuiDataGrid-root': {
    border: '1 px solid blue',
  },
  '& .MuiDataGrid-cell': {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  '& .super-app-theme--header': {
    backgroundColor: '#005099',
    color: 'white',
  },
})

const UserTable: React.FC = () => {
  const [staffList, setStaffList] = useState<any>([])
  const [open, setOpen] = useState(false)
  const theme = useTheme()

  let navigate = useNavigate()
  const user_service = new UserService()
  const local_service = new LocalStorageService()
  const helper_service = new HelperService()

  const fetchAllStaffList = async () => {
    try {
      const response = await user_service.getAllStaffList()
      setStaffList(response)
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  useEffect(() => {
    fetchAllStaffList()
  }, [])

  const columns: GridColDef[] = [
    {
      field: 'staffId',
      headerName: 'Staff ID',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return (
          <a
            style={{ cursor: 'pointer', color: theme.palette.text.primary , textDecoration:"underline" }}
            onClick={() => {
              navigate(`/profile/edit/${params.row.staffId}`)
            }}
          >
            {params.row.staffId}
          </a>
        )
      },
    },
    {
      field: 'id1',
      headerName: 'Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return `${params.row.staffFirstName} ${params.row.staffLastName}`
      },
    },
    { field: 'roleDescription', headerName: 'Role', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'staffBranch', headerName: 'Staff Branch', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'staffContactNumber', headerName: 'Contact', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'staffCountry', headerName: 'Country', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'username', headerName: 'Username', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'email', headerName: 'Email', flex: 1, headerClassName: 'super-app-theme--header' },
  ]

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.STAFF}>
      <Box sx={{ width: '80vw', height: '70vh' }}>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <Box>
            <Typography variant="h4" gutterBottom color ={theme.palette.text.primary} >
              <strong>All Users</strong>
            </Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              color="primary"
              disabled={!helper_service.checkUserHasPermission(local_service.get_modules()?.STAFF, 'canCreate')}
              onClick={() => {
                navigate('/profile/add')
              }}
            >
              Add User
            </Button>
          </Box>
        </Box>

        <StyledDataGrid
          rows={staffList || []}
          columns={columns}
          initialState={{
              pagination: {
                paginationModel: { pageSize: 20, page: 0 },
              },
            }}
            pageSizeOptions={[10]}
            loading={ staffList.length === 0}
            slots={{
              loadingOverlay: LoaderUI.LoadingOverlay, // custom loader
            }}
          disableRowSelectionOnClick
          getRowId={(row) => row.staffId}
        />

        <RoleModal open={open} setOpen={setOpen}></RoleModal>
      </Box>
    </HasPermission>
  )
}

export default UserTable
