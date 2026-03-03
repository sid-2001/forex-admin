import { useEffect, useState, useCallback, useMemo } from 'react'
import { Box, Button, IconButton, Stack, Chip, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import ProductBusinessCountryMappingDialog from '../../components/product-buisness-country-mapping-dialog'
import ProductBusinessCountryMappingService from '@/services/productBusinessCountryMapping.service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import dayjs from 'dayjs'

export default function ProductBusinessCountryMapping() {
  const service = useMemo(() => new ProductBusinessCountryMappingService(), [])
  const [rows, setRows] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)

  const [, setAlertOpen] = useRecoilState(alertState)
  const [, setAlertText] = useRecoilState(alertTextState)
  const [, setAlertType] = useRecoilState(alertTypeState)

  const showAlert = (type: 'Success' | 'Fail', text: string) => {
    setAlertType(type)
    setAlertText(text)
    setAlertOpen(true)
  }

  const fetchList = useCallback(async () => {
    try {
      const res: any = await service.getList()
      // Log to verify the fields: effectiveFromDate and effectiveToDate
      console.log('Fetched Data Sample:', res[0])
      setRows(Array.isArray(res) ? res : res?.data || [])
    } catch (err) {
      setRows([])
    }
  }, [service])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  // Helper to format dates for the table display
  const formatDateForTable = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return '-'
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch (e) {
      return '-'
    }
  }
  const formatTableDate = (dateString: string) => {
    if (!dateString) return ''
    const storedConfig = localStorage.getItem('countryConfig')
    let format = 'YYYY-MM-DD'

    if (storedConfig) {
      const config = JSON.parse(storedConfig)
      format = config.dateFormat.replace(/d/g, 'D').replace(/y/g, 'Y')
    }
    console.log(format, 'dkjhbcvy')
    return dayjs(dateString).format(format.toUpperCase())
  }

  const columns: GridColDef[] = [
    { field: 'businessMapCode', headerName: 'Code', flex: 0.8, headerClassName: 'super-app-theme--header' },
    { field: 'countryCorridorProductCode', headerName: 'Product', flex: 0.8, headerClassName: 'super-app-theme--header' },
    { field: 'recipientCountry', headerName: 'Country', flex: 0.5, headerClassName: 'super-app-theme--header' },
    { field: 'paymentRail', headerName: 'Payment Rail', flex: 0.8, headerClassName: 'super-app-theme--header' },
    {
      field: 'effectiveFromDate',
      headerName: 'Effective From',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const val = params.row?.effective_from_date || params.row?.effectiveFromDate
        return val ? val.split('T')[0] : ''
      },
    },
    {
      field: 'effective_from_date',
      headerName: 'Effective From',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectivefromdate || params.row?.effectiveFromDate),
    },
    {
      field: 'effective_to_date',
      headerName: 'Effective To',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectivetodate || params.row?.effectiveToDate),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      headerClassName: 'super-app-theme--header',
      sortable: false,
      renderCell: (params) => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => {
            setEditData(params.row)
            setOpen(true)
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  return (
    <Box p={3} sx={{ width: '100%', '& .super-app-theme--header': { backgroundColor: '#f5f5f5', fontWeight: 'bold' } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            // color: 'text.primary',
            letterSpacing: '-0.02em',
            display: 'grid',
            placeItems: 'center',
            color: '#0061B1',
          }}
        >
          {'Product Master'.toUpperCase()}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setOpen(true)
          }}
        >
          Add
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.businessMapCode || Math.random()}
        autoHeight
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true } }}
        disableColumnMenu
        density="standard"
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        // pageSizeOptions={[5, 10, 20]}
        sx={{
          boxShadow: 2,
          border: 2,
          borderColor: '#f5f5f5',
          '& .MuiDataGrid-cell:hover': {
            color: 'primary.main',
          },
        }}
      />

      <ProductBusinessCountryMappingDialog
        open={open}
        handleClose={() => setOpen(false)}
        editData={editData}
        refreshList={fetchList}
        showAlert={showAlert}
      />
    </Box>
  )
}
