import React, { useCallback, useEffect, useState } from 'react'
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridFilterModel } from '@mui/x-data-grid'
import { Box, Typography, Button, Stack, IconButton } from '@mui/material'
import { Navigate, useNavigate } from 'react-router-dom'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import LoaderUI from '@/components/loader/loader'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import CouponService from '@/services/coupons.service'
import CouponDialog from '@/components/couponFormDialog'
import EditIcon from '@mui/icons-material/Edit'
import MasterService from '@/services/master.service'
import MenuItemsDialog from '@/components/menu-items-dialog'

const MenuIems: React.FC = () => {
  const [menusData, setMenusData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const helper = new HelperService()
  const local_service = new LocalStorageService()
  const masterService = new MasterService()
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>({})
  const apiRef = React.useRef<any>(null)

  const [openMenuItemModal, setOpenMenuItemModal] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [, setOpen] = useRecoilState(alertState)
  const [, setText] = useRecoilState(alertTextState)
  const [, setType] = useRecoilState(alertTypeState)

  const showAlert = (t: 'success' | 'error', m: string) => {
    setType(t)
    setText(m)
    setOpen(true)
  }

  useEffect(() => {
    fetchMenuItemsLists()
  }, [])

  const fetchMenuItemsLists = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await masterService.getAllMenus()
      console.log(response, '--------------')
      setMenusData(response?.data)
      setIsLoading(false)
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }, [])

  const columns = [
    {
      field: 'menuCode',
      headerName: 'Menu Code',
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'menuName',
      headerName: 'Menu Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'groupCode',
      headerName: 'Group Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'groupName',
      headerName: 'Group Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'menuType',
      headerName: 'Menu Type',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'parentMenuCode',
      headerName: 'Parent Menu Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'parentMenuName',
      headerName: 'Parent Menu Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'childMenuCode',
      headerName: 'Child Menu Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'childMenuName',
      headerName: 'Child Menu Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'path',
      headerName: 'Path',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'createdLocalDateTime',
      headerName: 'Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return helper.convertDateAndTime(params.row.createdLocalDateTime)
      },
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            color="primary"
            onClick={() => {
              setEditData(params.row)
              setOpenMenuItemModal(true)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
          >
            <EditIcon />
          </IconButton>
        </Stack>
      ),
    },
  ]

  const getVisibleFilteredRows = () => {
    const visibleCols = columns.filter((col) => columnVisibilityModel[col.field] !== false && col.field !== 'action')

    const filteredRows = menusData.filter((row: any) =>
      filterModel.items.every((filter) => {
        if (!filter.value) return true
        const cellValue = row[filter.field]?.toString().toLowerCase() || ''
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
    const rows = filteredRows.map((row: any) => visibleCols.map((col) => `"${row[col.field] || ''}"`).join(','))

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'menus.csv')
    link.click()
  }

  const handleExportPDF = () => {
    const { visibleCols, filteredRows } = getVisibleFilteredRows()

    if (!filteredRows.length) {
      alert('No matching rows to export!')
      return
    }

    const headers = visibleCols.map((col) => col.headerName)
    const data = filteredRows.map((row: any) => visibleCols.map((col) => row[col.field] || ''))

    const doc = new jsPDF({ unit: 'pt' })
    doc.setFontSize(14)
    doc.text('Menu Items Report', 40, 40)
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 60,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [0, 80, 153], textColor: 255 },
    })
    doc.save('Menus.pdf')
  }

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
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3} sx={{ width: '90vw', height: '80vh' }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0061B1', textAlign: 'center' }}>
            MENU ITEMS LISTING
          </Typography>
          <Box>
            <Button
              variant="contained"
              onClick={() => {
                setEditData(null)
                setOpenMenuItemModal(true)
              }}
              sx={{ ml: 2 }}
              disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
            >
              Add
            </Button>
          </Box>
        </Stack>

        {menusData && (
          <DataGrid
            apiRef={apiRef}
            rows={menusData || []}
            //@ts-ignore
            columns={columns}
            filterModel={filterModel}
            onFilterModelChange={(model) => setFilterModel(model)}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(model) => setColumnVisibilityModel(model)}
            initialState={{
              pagination: { paginationModel: { pageSize: 20, page: 0 } },
            }}
            pageSizeOptions={[10, 20, 50]}
            disableRowSelectionOnClick
            loading={isLoading}
            getRowId={(row: any) => row.menuCode}
            slots={{
              toolbar: CustomToolbar,
              loadingOverlay: LoaderUI.LoadingOverlay,
            }}
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#005099',
                color: 'white',
              },
              '& .MuiDataGrid-cell': { fontSize: '14px' },
              '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', fontSize: '16px' },
            }}
            disableColumnMenu
          />
        )}

        <MenuItemsDialog
          open={openMenuItemModal}
          editData={editData}
          onClose={() => setOpenMenuItemModal(false)}
          refreshList={fetchMenuItemsLists}
          showAlert={showAlert}
        />
      </Box>
    </HasPermission>
  )
}

export default MenuIems
