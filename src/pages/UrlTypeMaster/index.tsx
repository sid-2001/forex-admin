import React, { useEffect, useState, useMemo } from 'react'
import { Box, Button, IconButton, Stack, Typography, TextField, InputAdornment } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import UrlTypeApiService, { IUrlType } from '../../services/urlType.api.service'
import UrlTypeFormDialog from '../../components/UrlTypeFormDialog'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { HelperService } from '@/helpers/helper'

export default function UrlTypeMaster() {
  const [rows, setRows] = useState<IUrlType[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<IUrlType | null>(null)

  const [, setOpen] = useRecoilState(alertState)
  const [, setText] = useRecoilState(alertTextState)
  const [, setType] = useRecoilState(alertTypeState)

  const service = useMemo(() => new UrlTypeApiService(), [])
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
    { field: 'urlCode', headerName: 'URL Code', flex: 0.5, headerClassName: 'super-app-theme--header' },
    { field: 'urlType', headerName: 'URL Type', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'urlDescription', headerName: 'Description', flex: 1.2, headerClassName: 'super-app-theme--header' },
    {
      field: 'effectiveFromDate',
      headerName: 'From Date',
      flex: 0.6,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (params.value ? String(params.value).split('T')[0] : '-'),
    },
    {
      field: 'effectiveToDate',
      headerName: 'To Date',
      flex: 0.6,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (params.value ? String(params.value).split('T')[0] : '-'),
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
        </Stack>
      ),
    },
  ]

  const filteredRows = rows.filter((row) =>
    Object.values(row).some((val) => val !== null && String(val).toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3} sx={{ width: '100%', '& .header-bg': { fontWeight: 'bold', bgcolor: '#f5f5f5' } }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0061B1', textAlign: 'center' }}>
            URL TYPE MASTER
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
          getRowId={(row) => row.urlCode}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          disableColumnMenu
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          sx={{ bgcolor: 'white' }}
        />

        <UrlTypeFormDialog
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
