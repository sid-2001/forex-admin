import React, { useEffect, useState, useMemo } from 'react'
import { Box, Button, IconButton, Stack, Typography, TextField, InputAdornment } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'

import SequenceApiService from '../../services/sequence.api.service'
import SequenceDialog from '../../components/sequence-dialog'
import { formatTableDate } from '@/helpers/dateformate'

export default function SequenceMasterTable() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)

  const [, setOpen] = useRecoilState(alertState)
  const [, setText] = useRecoilState(alertTextState)
  const [, setType] = useRecoilState(alertTypeState)

  const sequenceService = useMemo(() => new SequenceApiService(), [])

  const showAlert = (t: 'success' | 'error', m: string) => {
    setType(t)
    setText(m)
    setOpen(true)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const res: any = await sequenceService.getAll()

      const actualData = res?.data || res

      console.log('Final Data Extract:', actualData)

      if (Array.isArray(actualData)) {
        setRows(actualData as any)
      } else {
        console.warn('Response is not an array. Check structure:', actualData)
        setRows([])
      }
    } catch (error) {
      console.error('Fetch Error:', error)
      showAlert('error', 'Failed to load sequences')
    } finally {
      setLoading(false)
    }
  }

  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows
    const query = searchQuery.toLowerCase()
    return rows.filter(
      (row: any) =>
        row.sequenceNumber?.toLowerCase().includes(query) || row.product?.toLowerCase().includes(query) || row.docType?.toLowerCase().includes(query),
    )
  }, [rows, searchQuery])

  useEffect(() => {
    fetchData()
  }, [])

  const columns: GridColDef[] = [
    { field: 'sequenceId', headerName: 'Current Sequence', flex: 1.2, headerClassName: 'super-app-theme--header' },
    { field: 'countryCode', headerName: 'Country', flex: 0.6, headerClassName: 'super-app-theme--header' },
    { field: 'product', headerName: 'Product', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'docType', headerName: 'Doc Type', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'prefix', headerName: 'Prefix', flex: 0.6, headerClassName: 'super-app-theme--header' },
    { field: 'currentSeqNumber', headerName: 'Current #', flex: 0.7, headerClassName: 'super-app-theme--header' },
    {
      field: 'effectiveFromDate',
      headerName: 'Effective From',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.value),
    },
    {
      field: 'effectiveToDate',
      headerName: 'Effective To',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.value),
    },
    {
      field: 'active',
      headerName: 'Status',
      flex: 0.6,
      headerClassName: 'super-app-theme--header',
      renderCell: (p) => (p.value ? 'Active' : 'Inactive'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
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
      ),
    },
  ]

  return (
    <Box p={3} sx={{ width: '100%', '& .header-bg': { fontWeight: 'bold', bgcolor: '#f5f5f5' } }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0061B1', textAlign: 'center' }}>
          GENERATE SEQUENCE MASTER
        </Typography>
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

      <Box sx={{ height: 400, width: '100%', bgcolor: 'white' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.sequenceId}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
        />
      </Box>

      <SequenceDialog open={dialogOpen} editData={editData} onClose={() => setDialogOpen(false)} refreshList={fetchData} showAlert={showAlert} />
    </Box>
  )
}
