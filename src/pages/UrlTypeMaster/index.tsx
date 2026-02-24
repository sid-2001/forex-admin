import React, { useEffect, useState, useMemo } from 'react'
import { Box, Button, IconButton, Stack, Typography, TextField, InputAdornment } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import UrlTypeApiService, { IUrlType } from '../../services/urlType.api.service'
import UrlTypeFormDialog from '../../components/UrlTypeFormDialog'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'

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
    <Box p={3} sx={{ width: '100%', '& .header-bg': { fontWeight: 'bold', bgcolor: '#f5f5f5' } }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#0061B1', textAlign: 'center' }}>
        URL TYPE MASTER
      </Typography>

      <Stack direction="row" justifyContent="right" mb={2}>
        {/* <TextField
          size="small"
          placeholder="Search URL Types..."
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        /> */}
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
        getRowId={(row) => row.urlCode}
        autoHeight
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
  )
}
