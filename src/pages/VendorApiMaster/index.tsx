import React, { useEffect, useState, useMemo } from 'react'
import { Box, Button, IconButton, Stack, Typography, TextField, InputAdornment } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import VendorApiService, { IVendor } from '../../services/vendor.api.service'
import VendorApiFormDialog from '../../components/VendorApiFormDialog'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { formatTableDate } from '@/helpers/dateformate'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'
import { LocalStorageService } from '@/helpers/local-storage-service'

export default function VendorApiMaster() {
  const [rows, setRows] = useState<IVendor[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<IVendor | null>(null)

  const [, setOpen] = useRecoilState(alertState)
  const [, setText] = useRecoilState(alertTextState)
  const [, setType] = useRecoilState(alertTypeState)

  const service = useMemo(() => new VendorApiService(), [])
  const local_service = new LocalStorageService()
  const helper = new HelperService()

  const fetchData = async () => {
    setLoading(true)
    const data = await service.getAll()
    setRows(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const columns: GridColDef[] = [
    { field: 'vendorCode', headerName: 'Code', flex: 0.4, headerClassName: 'super-app-theme--header' },
    { field: 'vendorName', headerName: 'Vendor Name', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'vendorEmail', headerName: 'Email', flex: 0.8, headerClassName: 'super-app-theme--header' },
    {
      field: 'effectiveFromDate',
      headerName: 'Effective From',
      flex: 0.5,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params?.value),
    },
    {
      field: 'effectiveToDate',
      headerName: 'Effective to',
      flex: 0.5,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params?.value),
    },
    {
      field: 'active',
      headerName: 'Status',
      flex: 0.4,
      headerClassName: 'super-app-theme--header',
      renderCell: (p) => (p.value ? 'Active' : 'Inactive'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              setEditData(params.row)
              setDialogOpen(true)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          {/* <IconButton
            color="error"
            size="small"
            onClick={async () => {
              if (confirm(`Deactivate ${params.row.vendorCode}?`)) {
                await service.delete(params.row.vendorCode)
                setType('success')
                setText('Deactivated')
                setOpen(true)
                fetchData()
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton> */}
        </Stack>
      ),
    },
  ]

  const filteredRows = rows.filter((row) => Object.values(row).some((val) => String(val).toLowerCase().includes(searchQuery.toLowerCase())))

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3} sx={{ width: '100%', '& .header-bg': { fontWeight: 'bold', bgcolor: '#f5f5f5' } }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0061B1', textAlign: 'center' }}>
            VENDOR MASTER
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setEditData(null)
              setDialogOpen(true)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
          >
            Add
          </Button>
        </Stack>

        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.vendorCode}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          disableColumnMenu
          // initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          sx={{ bgcolor: 'white' }}
        />

        <VendorApiFormDialog
          open={dialogOpen}
          editData={editData}
          onClose={() => setDialogOpen(false)}
          refreshList={fetchData}
          showAlert={(t: any, m: any) => {
            setType(t)
            setText(m)
            setOpen(true)
          }}
        />
      </Box>
    </HasPermission>
  )
}
