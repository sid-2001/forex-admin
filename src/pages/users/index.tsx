import React, { useEffect, useState } from 'react'
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton } from '@mui/x-data-grid'
import { Switch, Box, Typography, Button, useTheme } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import { UserService } from '@/services/user.service'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { HelperService } from '@/helpers/helper'
import RoleModal from '@/components/roles-tab'
import LoaderUI from '@/components/loader/loader'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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
  const apiRef = React.useRef<any>(null)
  const [filterModel, setFilterModel] = useState({ items: [] })
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({})
  let navigate = useNavigate()
  const user_service = new UserService()
  const local_service = new LocalStorageService()
  const helper_service = new HelperService()

  const fetchAllStaffList = async () => {
    try {
      const response = await user_service.getAllStaffList()
      const staffId = await local_service.get_staff_access()?.staffId

      //       setStaffList(  response.filter(
      //     (e) => e?.staffId != staffId
      // ))
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
            style={{ cursor: 'pointer', color: theme.palette.text.primary, textDecoration: 'underline' }}
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
    {
      field: 'createdLocalDateTime',
      headerName: 'Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => helper_service.convertDateAndTime(params?.row?.createdLocalDateTime),
    },
  ]

  const handleExportCSV = () => {
    const visibleCols = columns.filter(
      //@ts-ignore
      (col) => columnVisibilityModel[col.field] !== false,
    )

    // const visibleRowIds = Array.from(apiRef.current?.getFilteredRows?.().keys?.() || [])
    // const visibleRows = staffList.filter((row: any) => visibleRowIds.includes(row.staffId))
    const visibleRows = staffList.filter((row: any) =>
      filterModel.items.every((filter: any) => {
        if (!filter.value) return true
        const cellValue = row[filter.field]?.toString().toLowerCase() || ''
        return cellValue.includes(filter.value.toLowerCase())
      }),
    )
    const headers = visibleCols.map((col) => col.headerName).join(',')
    const rows = visibleRows.map((row: any) =>
      visibleCols
        .map((col) => {
          if (col.field === 'id1') return `${row.staffFirstName} ${row.staffLastName}`
          return row[col.field] || ''
        })
        .join(','),
    )

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'User_List.csv')
    link.click()
  }

  // 📄 Export PDF
  const handleExportPDF = () => {
    const visibleCols = columns.filter(
      //@ts-ignore
      (col) => columnVisibilityModel[col.field] !== false,
    )

    // const visibleRowIds = Array.from(apiRef.current?.getFilteredRows?.().keys?.() || [])
    // const visibleRows = staffList.filter((row: any) => visibleRowIds.includes(row.staffId))

    const visibleRows = staffList.filter((row: any) =>
      filterModel.items.every((filter: any) => {
        if (!filter.value) return true
        const cellValue = row[filter.field]?.toString().toLowerCase() || ''
        return cellValue.includes(filter.value.toLowerCase())
      }),
    )

    const headers = visibleCols.map((col) => col.headerName)
    const data = visibleRows.map((row: any) =>
      visibleCols.map((col) => {
        if (col.field === 'id1') return `${row.staffFirstName} ${row.staffLastName}`
        return row[col.field] || ''
      }),
    )

    const doc = new jsPDF({ unit: 'pt' })
    doc.setFontSize(14)
    doc.text('Staff Listing Report', 40, 40)
    autoTable(doc, {
      //@ts-ignore
      head: [headers],
      body: data,
      startY: 60,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [0, 80, 153], textColor: 255 },
    })
    doc.save('Staff_List.pdf')
  }

  // 🧰 Custom Toolbar
  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ justifyContent: 'flex-start', gap: 1, py: 1 }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <Button variant="outlined" color="primary" size="small" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
        CSV
      </Button>
      <Button variant="outlined" color="primary" size="small" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF}>
        PDF
      </Button>
      <Button variant="outlined" color="primary" size="small" startIcon={<FindReplaceIcon />} onClick={() => setFilterModel({ items: [] })}>
        Reset Filters
      </Button>
    </GridToolbarContainer>
  )

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.STAFF}>
      <Box sx={{ width: '80vw', height: '70vh' }}>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <Box>
            <Typography variant="h4" gutterBottom>
              <strong>All Staff</strong>
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
              Add Staff
            </Button>
          </Box>
        </Box>

        <StyledDataGrid
          apiRef={apiRef}
          rows={staffList || []}
          columns={columns}
          filterModel={filterModel}
          //@ts-ignore
          onFilterModelChange={(model) => setFilterModel(model)}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(model) => setColumnVisibilityModel(model)}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 20, page: 0 },
            },
          }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          getRowId={(row) => row.staffId}
          loading={staffList.length === 0}
          slots={{
            toolbar: CustomToolbar,
            loadingOverlay: LoaderUI.LoadingOverlay,
          }}
          disableColumnMenu
        />

        <RoleModal open={open} setOpen={setOpen}></RoleModal>
      </Box>
    </HasPermission>
  )
}

export default UserTable
