import { useEffect, useState, useMemo } from 'react'
import { Box, Button, IconButton, Stack, Typography, TextField, InputAdornment } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import VendorApiFormDialog from '../../components/VendorApiFormDialog'
import VendorApiService from '../../services/vendor.api.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'

export default function VendorApiMaster() {
  const [rows, setRows] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const [, setOpen] = useRecoilState(alertState)
  const [, setText] = useRecoilState(alertTextState)
  const [, setType] = useRecoilState(alertTypeState)

  const service = useMemo(() => new VendorApiService(), [])
  const localService = useMemo(() => new LocalStorageService(), [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await service.getAll()
      setRows(Array.isArray(res) ? res : res?.data || [])
    } catch (e) {
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => Object.values(row).some((val) => String(val).toLowerCase().includes(searchQuery.toLowerCase())))
  }, [rows, searchQuery])

  const columns: GridColDef[] = [
    { field: 'vendorCode', headerName: 'Vendor', flex: 0.5, headerClassName: 'super-app-theme--header' },
    { field: 'urlCode', headerName: 'URL Code', flex: 0.5, headerClassName: 'super-app-theme--header' },
    { field: 'country', headerName: 'Country', flex: 0.4, headerClassName: 'super-app-theme--header' },
    { field: 'currency', headerName: 'Currency', flex: 0.4, headerClassName: 'super-app-theme--header' },
    {
      field: 'effectiveFromDate',
      headerName: 'From',
      flex: 0.6,
      headerClassName: 'super-app-theme--header',
      valueFormatter: (params: any) => (params?.value ? String(params.value).split('T')[0] : '-'),
    },
    {
      field: 'active',
      headerName: 'Active',
      flex: 0.3,
      headerClassName: 'super-app-theme--header',
      renderCell: (p) => (p.value ? 'Yes' : 'No'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <IconButton
          color="primary"
          onClick={() => {
            setEditData(params.row)
            setDialogOpen(true)
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  return (
    <Box p={3} sx={{ width: '100%', '& .super-app-theme--header': { backgroundColor: '#f5f5f5', fontWeight: 'bold' } }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#0061B1', textAlign: 'center' }}>
        VENDOR API CONFIGURATION
      </Typography>

      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setDialogOpen(true)
          }}
        >
          Add
        </Button>
      </Stack>

      <DataGrid
        rows={filteredRows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id || row.vendorCode + row.urlCode}
        autoHeight
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      />

      <VendorApiFormDialog
        open={dialogOpen}
        editData={editData}
        onClose={() => setDialogOpen(false)}
        refreshList={fetchData}
        showAlert={(t: any, msg: any) => {
          setType(t)
          setText(msg)
          setOpen(true)
        }}
      />
    </Box>
  )
}
