import React, { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import RoleModal from '../../components/roleModal'
import { Box, Button, Typography } from '@mui/material'
import { UserService } from '@/services/user.service'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { HelperService } from '@/helpers/helper'
import { useTheme } from '@emotion/react'
import LoaderUI from '@/components/loader/loader'

const RoleManagementPage = () => {
  const [roles, setRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)

  const api_service = new UserService()
  const local_service = new LocalStorageService()
  const helper_service = new HelperService()

  const fetchRoles = () => {
    api_service.getRolesList().then((data) => {
      setRoles(data)
    })
  }
  const theme: any = useTheme()

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleSave = (updatedRole: any) => {
    api_service.addRole(updatedRole)

    // axios.put(`/api/roles/${updatedRole.roleId}`, updatedRole) // 🔁 Replace with your PUT API
    //   .then(() => {
    //     alert('Role updated successfully');
    //     setSelectedRole(null);
    //     fetchRoles(); // Refresh list
    //   })
    //   .catch((err) => console.error(err));
  }

  return (
    <HasPermission module={local_service.get_modules()?.ROLE} permission={'canRead'}>
      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} sx={{ width: '80vw' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            <strong>Roles </strong>
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            disabled={!helper_service.checkUserHasPermission(local_service.get_modules()?.ROLE, 'canCreate')}
            sx={{ mb: 2 }}
            onClick={() => {
              setSelectedRole(null)
              //@ts-ignore
              setSelectedRole('create')
            }}
          >
            Add Role
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          width: '80vw',
          height: '70vh',
        }}
      >
        <DataGrid
          rows={roles}
          //@ts-ignore
          columns={[
            { field: 'roleDescription', headerName: 'Role Name', width: 250, flex: 1, headerClassName: 'super-app-theme--header' },
            { field: 'roleStatus', headerName: 'Status', width: 120, flex: 1, headerClassName: 'super-app-theme--header' },
            ,
          ]}
          //@ts-ignore//@ts-ignore
          getRowId={(row) => row?.roleId}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 20, page: 0 },
            },
          }}
          pageSizeOptions={[10]}
          loading={roles.length === 0}
          slots={{
            loadingOverlay: LoaderUI.LoadingOverlay, // Make sure LoaderUI is defined/imported
          }}
          sx={{
            '& .MuiDataGrid-root': {
              border: '1 px solid blue',
            },
            '& .MuiDataGrid-cell': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }}
          onRowClick={(params) => setSelectedRole(params.row)}
        />
      </Box>

      {selectedRole && <RoleModal open={!!selectedRole} initialData={selectedRole} onClose={() => setSelectedRole(null)} onSave={handleSave} />}
    </HasPermission>
  )
}

export default RoleManagementPage
