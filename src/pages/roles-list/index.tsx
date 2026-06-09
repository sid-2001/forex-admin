import React, { useEffect, useState } from 'react'
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridFilterModel, GridColDef } from '@mui/x-data-grid'
import { Box, Typography, Button } from '@mui/material'
import { UserService } from '@/services/user.service'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { HelperService } from '@/helpers/helper'
import RoleModal from '@/components/roleModal'
import LoaderUI from '@/components/loader/loader'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Edit } from '@mui/icons-material'

interface Role {
  roleId: string | number
  roleDescription: string
  roleStatus: string
}

const RoleManagementPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | 'create' | null>(null)
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>({})
  const apiRef = React.useRef<any>(null)

  const api_service = new UserService()
  const local_service = new LocalStorageService()
  const helper_service = new HelperService()

  const fetchRoles = async () => {
    const data = await api_service.getRolesList()
    setRoles(data)
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleSave = (updatedRole: Role) => {
    api_service.addRole(updatedRole, local_service.get_staff_id())
    setSelectedRole(null)
    // window.location.reload()
  }

  const columns: GridColDef[] = [
    { field: 'roleDescription', headerName: 'Role Name', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'roleStatus', headerName: 'Status', flex: 1, headerClassName: 'super-app-theme--header' },

    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<Edit />}
          onClick={() => setSelectedRole(params.row)}
          disabled={!helper_service.checkUserHasPermission(local_service.get_modules()?.ROLE, 'canUpdate')}
        >
          Edit
        </Button>
      ),
    },
    {
      field: 'totalModules',
      headerName: 'Total Modules',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => params?.row?.modules?.length,
    },
  ]

  const getVisibleFilteredRows = () => {
    const visibleCols = columns.filter((col) => columnVisibilityModel[col.field] !== false && col.field !== 'action')
    const filteredRows = roles.filter((row) =>
      filterModel.items.every((filter) => {
        if (!filter.value) return true
        const cellValue = (row as any)[filter.field]?.toString().toLowerCase() || ''
        return cellValue.includes(filter.value.toLowerCase())
      }),
    )
    return { visibleCols, filteredRows }
  }

  const handleExportCSV = () => {
    const { visibleCols, filteredRows } = getVisibleFilteredRows()
    if (!filteredRows.length) {
      alert('No matching rows to export!')
      return
    }

    const headers = visibleCols.map((col) => col.headerName).join(',')
    // const rows = filteredRows.map((row) => visibleCols.map((col) => `"${(row as any)[col.field] || ''}"`).join(','))

    //  const rows = filteredRows.map((row: any) =>
    //    visibleCols.map((col) => {
    //      if (col.field === 'totalModules') return `${row.modules.length}`
    //      return row[col.field] || ''
    //    }),
    //  )

    const rows = filteredRows.map((row: any) =>
      visibleCols
        .map((col) => {
          if (col.field === 'totalModules') return `${row.modules.length}`
          return row[col.field] || ''
        })
        .join(','),
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'Roles_List.csv')
    link.click()
  }

  const handleExportPDF = () => {
    const { visibleCols, filteredRows } = getVisibleFilteredRows()
    if (!filteredRows.length) {
      alert('No matching rows to export!')
      return
    }

    const headers = visibleCols.map((col) => col.headerName)

    const data = filteredRows.map((row: any) =>
      visibleCols.map((col) => {
        if (col.field === 'totalModules') return `${row.modules.length}`
        return row[col.field] || ''
      }),
    )
    const doc = new jsPDF({ unit: 'pt' })
    doc.setFontSize(14)
    doc.text('Roles Report', 40, 40)

    autoTable(doc, {
      //@ts-ignore
      head: [headers],
      body: data,
      startY: 60,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [0, 80, 153], textColor: 255 },
    })
    doc.save('Roles_List.pdf')
  }

  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ justifyContent: 'flex-start', gap: 1, py: 1 }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
        CSV
      </Button>
      <Button variant="outlined" size="small" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF}>
        PDF
      </Button>
      <Button variant="outlined" size="small" startIcon={<FindReplaceIcon />} onClick={() => setFilterModel({ items: [] })}>
        Reset Filters
      </Button>
    </GridToolbarContainer>
  )

  return (
    <HasPermission module={local_service.get_modules()?.ROLE} permission="canRead">
      <Box sx={{ width: '80vw', height: '70vh' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">
            <strong>Roles</strong>
          </Typography>
          <Button
            variant="contained"
            disabled={!helper_service.checkUserHasPermission(local_service.get_modules()?.ROLE, 'canCreate')}
            onClick={() => setSelectedRole('create')}
          >
            Add Role
          </Button>
        </Box>

        <DataGrid
          apiRef={apiRef}
          rows={roles}
          columns={columns}
          getRowId={(row) => row.roleId}
          filterModel={filterModel}
          onFilterModelChange={(model) => setFilterModel(model)}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(model) => setColumnVisibilityModel(model)}
          initialState={{ pagination: { paginationModel: { pageSize: 20, page: 0 } } }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          loading={roles.length === 0}
          slots={{ toolbar: CustomToolbar, loadingOverlay: LoaderUI.LoadingOverlay }}
          sx={{
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#005099', color: 'white' },
            '& .MuiDataGrid-cell': { fontSize: '14px' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', fontSize: '16px' },
          }}
          disableColumnMenu
        />

        {selectedRole && (
          <RoleModal
            setSelectedRole={setSelectedRole}
            open={!!selectedRole}
            initialData={selectedRole === 'create' ? null : selectedRole}
            onClose={() => setSelectedRole(null)}
            onSave={handleSave}
          />
        )}
      </Box>
    </HasPermission>
  )
}

export default RoleManagementPage
