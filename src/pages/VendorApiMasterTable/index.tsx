import React, { useEffect, useState, useMemo } from 'react'
import { Box, Button, IconButton, Stack, Typography, TextField, InputAdornment } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'

// Services
import VendorApiConfigService from '../../services/vendorApiConfig.service'
import VendorApiService from '../../services/vendor.api.service'
import UrlTypeApiService from '../../services/urlType.api.service'

// Dialog Component
import VendorApiConfigDialog from '../../components/VendorApiConfigDialog'
import { formatTableDate } from '@/helpers/dateformate'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { HelperService } from '@/helpers/helper'

export default function VendorApiMasterTable() {
  const [rows, setRows] = useState([])
  const [vendors, setVendors] = useState([])
  const [urlTypes, setUrlTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)

  // Global Alert State
  const [, setOpen] = useRecoilState(alertState)
  const [, setText] = useRecoilState(alertTextState)
  const [, setType] = useRecoilState(alertTypeState)

  const configService = useMemo(() => new VendorApiConfigService(), [])
  const vendorService = useMemo(() => new VendorApiService(), [])
  const urlTypeService = useMemo(() => new UrlTypeApiService(), [])
  const local_service = new LocalStorageService()
  const helper = new HelperService()

  const showAlert = (t: 'success' | 'error', m: string) => {
    setType(t)
    setText(m)
    setOpen(true)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. Fetch the main Configuration list
      const configData = await configService.getAll()
      console.log(configData, 'configData')
      setRows(configData)

      // 2. Fetch Lookup data for the Dialog Dropdowns
      const [vData, uData]: any = await Promise.all([vendorService.getAll(), urlTypeService.getAll()])
      setVendors(vData)
      setUrlTypes(uData)
    } catch (error) {
      showAlert('error', 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const columns: GridColDef[] = [
    {
      field: 'vendorCode',
      headerName: 'Vendor',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      valueGetter: (_: any, row: any) => row?.vendor?.vendorCode || '',
    },
    {
      field: 'urlCode',
      headerName: 'URL Type',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      valueGetter: (_: any, row: any) => row?.urlType?.urlCode || '',
    },
    { field: 'serviceCountry', headerName: 'Country', flex: 0.7, headerClassName: 'super-app-theme--header' },
    { field: 'serviceCurrency', headerName: 'Currency', flex: 0.7, headerClassName: 'super-app-theme--header' },
    {
      field: 'apiKey',
      headerName: 'API Key',
      flex: 1.2,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (params.value ? `****${String(params.value).slice(-4)}` : '-'),
    },
    {
      field: 'effective_from_date',
      headerName: 'Effective From',
      flex: 1,
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      //@ts-ignore
      valueGetter: (value, row) => {
        const date = row?.effectivefromdate || row?.effectiveFromDate

        return date ? formatTableDate(date) : ''
      },
    },
    {
      field: 'effective_to_date',
      headerName: 'Effective To',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      minWidth: 150,
      //@ts-ignore
      valueGetter: (value, row) => {
        const date = row?.effectivetodate || row?.effectiveToDate

        return date ? formatTableDate(date) : ''
      },
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
          disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  const filteredRows = rows.filter((row: any) => {
    return Object.values(row).some((val) => val !== null && String(val).toLowerCase().includes(searchQuery.toLowerCase()))
  })

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3} sx={{ width: '100%', '& .header-bg': { fontWeight: 'bold', bgcolor: '#f5f5f5' } }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0061B1', textAlign: 'center' }}>
            VENDOR API CONFIGURATION
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
          getRowId={(row) => row.id || `${row.vendorCode}-${row.urlCode}`}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
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

        {/* Connected Dialog */}
        <VendorApiConfigDialog
          open={dialogOpen}
          editData={editData}
          vendors={vendors}
          urlTypes={urlTypes}
          onClose={() => setDialogOpen(false)}
          refreshList={fetchData}
          showAlert={showAlert}
        />
      </Box>
    </HasPermission>
  )
}
