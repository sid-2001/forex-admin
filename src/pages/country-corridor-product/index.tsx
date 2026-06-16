// pages/CountryCorridorProductMaster.tsx
import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Box,
  Button,
  IconButton,
  Stack,
  Chip,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Tooltip,
} from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DownloadIcon from '@mui/icons-material/Download'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PublicIcon from '@mui/icons-material/Public'
import { useRecoilState, useRecoilValue } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { countyState } from '@/states/state'
// import CountryCorridorProductFormDialog from '../components/countryCorridorProductFormDialog'
import { CountryCorridorProductService } from '@/services/countryCorridorProduct.service'
// import { ProductService } from '@/services/product.service'
import { ProductSubServiceService } from '@/services/productSubService.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import dayjs from 'dayjs'
import CountryCorridorProductFormDialog from '@/components/county-corridor-product-code-master'
import ProductService from '@/services/product.service'
import { formatTableDate } from '@/helpers/dateformate'

import { CountryCorridorService } from '@/services/countryCorridor.service'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'

export default function CountryCorridorProductMaster() {
  const service = useMemo(() => new CountryCorridorProductService(), [])
  const productService = useMemo(() => new ProductService(), [])
  const subServiceService = useMemo(() => new ProductSubServiceService(), [])
  const coutry_corridor_service = new CountryCorridorService()
  const helper = new HelperService()
  const local_service = new LocalStorageService()

  const [rows, setRows] = useState<any[]>([])
  const [filteredRows, setFilteredRows] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [subServices, setSubServices] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [isFormChanged, setIsFormChanged] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [countryFilter, setCountryFilter] = useState('all')
  const [productFilter, setProductFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Pagination
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)

  const [countries, setcountries] = useState()

  const [uniqueCountries, setUniqueCountries] = useState<string[]>([])
  const [uniqueProducts, setUniqueProducts] = useState<string[]>([])

  const [, setAlertOpen] = useRecoilState(alertState)
  const [, setAlertText] = useRecoilState(alertTextState)
  const [, setAlertType] = useRecoilState(alertTypeState)

  const showAlert = (type: 'Success' | 'Fail', text: string) => {
    setAlertType(type)
    setAlertText(text)
    setAlertOpen(true)
  }

  const getCountryCode = (row: any) => {
    return row.countryCorridorMaster?.countryCode || row.countryCorridorCode?.substring(3, 5) || 'N/A'
  }

  const getProductName = (productCode: string) => {
    const product = products.find((p) => p.productCode === productCode)
    return product ? product.productName : productCode
  }

  // const getServiceName = (serviceCode: string) => {
  //   const service = subServices.find((s) => s.productServiceMapCode === serviceCode)
  //   return service ? service.productServiceMapCode : serviceCode
  // }

  // Fetch master data
  const fetchMasterData = useCallback(async () => {
    try {
      const [productsData, servicesData] = await Promise.all([productService.getProductList(), subServiceService.getAllProductSubServices()])
      setProducts(productsData)
      console.log('service data is here', servicesData)
      setSubServices(servicesData)
    } catch (err) {
      console.error('Error fetching master data:', err)
    }
  }, [productService, subServiceService])

  // Fetch main data
  const fetchList = useCallback(async () => {
    try {
      const res: any = await service.getAllCountryCorridorProducts()
      console.log(res, '==============')
      setRows(Array.isArray(res) ? res : res || [])

      // Extract unique values for filters
      const countriesSet = new Set<string>()
      const productsSet = new Set<string>()

      ;(Array.isArray(res) ? res : res?.data || []).forEach((row: any) => {
        const countryCode = getCountryCode(row)
        if (countryCode) countriesSet.add(countryCode)
        if (row.productCode) productsSet.add(row.productCode)
      })

      setUniqueCountries(Array.from(countriesSet).sort())
      setUniqueProducts(Array.from(productsSet).sort())
    } catch (err) {
      setRows([])
    }
  }, [service])

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...rows]

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (row) =>
          row.countryCorridorProductCode?.toLowerCase().includes(term) ||
          row.countryCorridorCode?.toLowerCase().includes(term) ||
          row.productCode?.toLowerCase().includes(term) ||
          row.productServiceCode?.toLowerCase().includes(term) ||
          row.createdBy?.toLowerCase().includes(term),
      )
    }

    // Filter by country
    if (countryFilter !== 'all') {
      filtered = filtered.filter((row) => getCountryCode(row) === countryFilter)
    }

    // Filter by product
    if (productFilter !== 'all') {
      filtered = filtered.filter((row) => row.productCode === productFilter)
    }

    // Filter by status
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active'
      filtered = filtered.filter((row) => row.active === isActive)
    }

    setFilteredRows(filtered)
  }, [rows, searchTerm, countryFilter, productFilter, statusFilter])

  useEffect(() => {
    fetchMasterData()
    fetchList()
  }, [fetchMasterData, fetchList])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  useEffect(() => {
    coutry_corridor_service.getAllCorridors().then((data) => {
      setcountries(data as any)
    })
  }, [])

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('')
    setCountryFilter('all')
    setProductFilter('all')
    setStatusFilter('all')
    setPage(0)
  }

  // Function to download CSV
  const downloadCSV = () => {
    if (!filteredRows || filteredRows.length === 0) {
      showAlert('Fail', 'No data to export')
      return
    }

    const headers = [
      'Product Code',
      'Corridor Code',
      'Country',
      'Product',
      'Service Code',
      'Date Format',
      'Time Format',
      'Currency',
      'Precision',
      'Round Off',
      'Active',
      'Effective From',
      'Effective To',
      'Created By',
      'Created Date',
    ]

    const csvRows = filteredRows.map((row) => [
      row.countryCorridorProductCode || '',
      row.countryCorridorCode || '',
      getCountryCode(row),
      row.productCode || '',
      row.productServiceCode || '',
      row.dateFormat || '',
      row.timeFormat || '',
      row.currencyFormat || '',
      row.decimalPrecision || '',
      row.decimalRoundOff || '',
      row.active ? 'Yes' : 'No',
      formatTableDate(row.effectiveFromDate),
      formatTableDate(row.effectiveToDate),
      row.createdBy || '',
      row.createdLocalDateTime ? dayjs(row.createdLocalDateTime).format('YYYY-MM-DD HH:mm') : '',
    ])

    const csvContent = [headers.join(','), ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `corridor_product_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showAlert('Success', 'CSV downloaded successfully')
  }

  // Custom toolbar with CSV download
  const CustomToolbar = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
        <GridToolbar />
        {/* <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={downloadCSV}
          sx={{ ml: 2 }}
        >
          Export CSV
        </Button> */}
      </Box>
    )
  }

  const handleDialogClose = () => {
    setOpen(false)
    setIsFormChanged(false)
    setEditData(null)
  }

  const handleFormChange = (changed: boolean) => {
    setIsFormChanged(changed)
  }

  const columns: GridColDef[] = [
    {
      field: 'countryCorridorProductCode',
      headerName: 'Product Code',
      width: 150,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 600,
            backgroundColor: '#eef4fa',
            color: '#0061B1',
          }}
        />
      ),
    },
    {
      field: 'countryCorridorCode',
      headerName: 'Corridor',
      width: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const countryCode = getCountryCode(params.row)
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PublicIcon sx={{ fontSize: 16, color: '#666' }} />
            <Typography variant="body2">{params.value}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              ({countryCode})
            </Typography>
          </Stack>
        )
      },
    },
    {
      field: 'productCode',
      headerName: 'Product',
      width: 100,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Tooltip title={getProductName(params.value)}>
          <Typography variant="body2">{params.value}</Typography>
        </Tooltip>
      ),
    },
    {
      field: 'productServiceCode',
      headerName: 'Service',
      width: 130,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'dateFormat',
      headerName: 'Date Format',
      width: 120,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'timeFormat',
      headerName: 'Time Format',
      width: 120,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'currencyFormat',
      headerName: 'Currency',
      width: 100,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'decimalPrecision',
      headerName: 'Precision',
      width: 90,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'decimalRoundOff',
      headerName: 'Round Off',
      width: 90,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'active',
      headerName: 'Active',
      width: 90,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Chip
          icon={params.value ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <CancelIcon sx={{ fontSize: 16 }} />}
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            backgroundColor: params.value ? '#e2f0e6' : '#ffece5',
            color: params.value ? '#0f6a3b' : '#b13e2d',
            fontWeight: 600,
            width: '70px',
          }}
        />
      ),
    },
    {
      field: 'effectiveFromDate',
      headerName: 'From',
      width: 100,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.value),
    },
    {
      field: 'effectiveToDate',
      headerName: 'To',
      width: 100,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (params.value?.includes('9999') ? '∞' : formatTableDate(params.value)),
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
            setIsFormChanged(false)
          }}
          disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3} sx={{ width: '100%', '& .super-app-theme--header': { backgroundColor: '#f5f5f5', fontWeight: 'bold' } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              display: 'grid',
              placeItems: 'center',
              color: '#0061B1',
            }}
          >
            {'Country Corridor Product Master'.toUpperCase()}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setEditData(null)
              setOpen(true)
              setIsFormChanged(false)
            }}
            sx={{ backgroundColor: '#0061B1' }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
          >
            Add
          </Button>
        </Stack>

        {/* Search and Filter Bar */}

        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.countryCorridorProductCode || Math.random()}
          autoHeight
          disableRowSelectionOnClick
          slots={{ toolbar: CustomToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          disableColumnMenu
          // density="standard"
          //@ts-ignore
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              showDensitySelector: true, // ✅ enable density
            },
          }}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page)
            setPageSize(model.pageSize)
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          sx={{
            boxShadow: 2,
            border: 2,
            borderColor: '#f5f5f5',
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
            },
          }}
        />

        <CountryCorridorProductFormDialog
          open={open}
          handleClose={handleDialogClose}
          editData={editData}
          refreshList={fetchList}
          showAlert={showAlert}
          onFormChange={handleFormChange}
          isUpdateDisabled={editData ? !isFormChanged : false}
          products={products}
          subServices={subServices}
          countries={countries as any}
        />
      </Box>
    </HasPermission>
  )
}
