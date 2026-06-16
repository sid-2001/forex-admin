// pages/ProductSubServiceMaster.tsx
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
  Grid,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Autocomplete,
} from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DownloadIcon from '@mui/icons-material/Download'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PublicIcon from '@mui/icons-material/Public'
import FingerprintIcon from '@mui/icons-material/Fingerprint'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { ProductSubServiceService } from '../../services/productSubService.service'
import ProductService from '@/services/product.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import dayjs from 'dayjs'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import ServiceMasterService from '@/services/service-master.service'
import ServiceSubServiceMappingService from '@/services/service-subservice-mapping.service'
import { formatTableDate } from '@/helpers/dateformate'
import SequenceApiService from '@/services/sequence.api.service'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'

// ==================== MAIN COMPONENT ====================
export default function ProductSubServiceMaster() {
  const service = useMemo(() => new ProductSubServiceService(), [])
  const productService = useMemo(() => new ProductService(), [])
  const serviceService = useMemo(() => new ServiceMasterService(), []) // Add service service
  const helper = new HelperService()

  const [rows, setRows] = useState<any[]>([])
  const [filteredRows, setFilteredRows] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([]) // Add services state
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [isFormChanged, setIsFormChanged] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [countryFilter, setCountryFilter] = useState('all')
  const [productFilter, setProductFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)

  const [uniqueCountries, setUniqueCountries] = useState<string[]>([])
  const [uniqueProducts, setUniqueProducts] = useState<string[]>([])

  const [, setAlertOpen] = useRecoilState(alertState)
  const [, setAlertText] = useRecoilState(alertTextState)
  const [, setAlertType] = useRecoilState(alertTypeState)

  // Form state for dialog
  const [formErrors, setFormErrors] = useState<any>({})
  const [form, setForm] = useState<any>({
    countryCode: '',
    productCode: '',
    serviceCode: '', // Add serviceCode
    serviceMapCode: '',
    serviceDescription: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  })
  const [originalFormData, setOriginalFormData] = useState<any>(null)
  const sequenceService = new SequenceApiService()

  const [countries, setcountries] = useState([])

  // ==================== HELPER FUNCTIONS ====================
  const showAlert = (type: 'Success' | 'Fail', text: string) => {
    setAlertType(type)
    setAlertText(text)
    setAlertOpen(true)
  }

  const getCountryName = (countryCode: string) => {
    const country: any = countries.find((c: any) => c.countryCode === countryCode)
    return country ? country?.countryName : countryCode
  }

  const getProductName = (productCode: string) => {
    const product = products.find((p) => p.productCode === productCode)
    return product ? product.productName : productCode
  }

  const subservicemap = new ServiceSubServiceMappingService()

  // ==================== DATA FETCHING ====================
  const fetchProducts = useCallback(async () => {
    try {
      const data = await productService.getProductList()
      setProducts(data)
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }, [productService])

  const fetchServices = useCallback(async () => {
    try {
      const data = await subservicemap.getAllMappings() // Fetch services
      setServices(data)
    } catch (err) {
      console.error('Error fetching services:', err)
    }
  }, [serviceService])

  const fetchList = useCallback(async () => {
    try {
      const data = await service.getAll()
      console.log('Fetched Data Sample:', data[0])
      setRows(data)

      // Extract unique values for filters
      const countriesSet = new Set<string>()
      const productsSet = new Set<string>()

      data.forEach((row: any) => {
        if (row.countryCode) countriesSet.add(row.countryCode)
        if (row.productCode) productsSet.add(row.productCode)
      })

      setUniqueCountries(Array.from(countriesSet).sort())
      setUniqueProducts(Array.from(productsSet).sort())
    } catch (err) {
      setRows([])
      showAlert('Fail', 'Failed to fetch data')
    }
  }, [service])

  const fetchCountryCodes = useCallback(async () => {
    const res: any = await sequenceService.getActiveCountryCorridors()
    setcountries(res || [])
  }, [])

  useEffect(() => {
    fetchCountryCodes()
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchServices() // Fetch services
    fetchList()
  }, [fetchProducts, fetchServices, fetchList])

  // ==================== FILTERS ====================
  const applyFilters = useCallback(() => {
    let filtered = [...rows]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (row) =>
          row.productServiceMapCode?.toLowerCase().includes(term) ||
          row.countryCode?.toLowerCase().includes(term) ||
          row.productCode?.toLowerCase().includes(term) ||
          row.serviceCode?.toLowerCase().includes(term) ||
          row.serviceDescription?.toLowerCase().includes(term) ||
          row.serviceCodeGenerated?.toLowerCase().includes(term) ||
          row.createdBy?.toLowerCase().includes(term),
      )
    }

    if (countryFilter !== 'all') {
      filtered = filtered.filter((row) => row.countryCode === countryFilter)
    }

    if (productFilter !== 'all') {
      filtered = filtered.filter((row) => row.productCode === productFilter)
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active'
      filtered = filtered.filter((row) => row.active === isActive)
    }

    setFilteredRows(filtered)
  }, [rows, searchTerm, countryFilter, productFilter, statusFilter])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  // ==================== CSV EXPORT ====================
  const downloadCSV = () => {
    if (!filteredRows || filteredRows.length === 0) {
      showAlert('Fail', 'No data to export')
      return
    }

    const headers = [
      'Map Code',
      'Country',
      'Product',
      'Generated Code',
      'Service Code',
      'Description',
      'Active',
      'Effective From',
      'Effective To',
      'Created By',
      'Created Date',
    ]

    const csvRows = filteredRows.map((row) => [
      row.productServiceMapCode || '',
      row.countryCode || '',
      row.productCode || '',
      row.serviceCodeGenerated || '',
      row.serviceCode || '',
      row.serviceDescription || '',
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
    link.setAttribute('download', `product_sub_service_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showAlert('Success', 'CSV downloaded successfully')
  }

  // ==================== DIALOG HANDLERS ====================
  const handleDialogClose = () => {
    setOpen(false)
    setIsFormChanged(false)
    setEditData(null)
    setFormErrors({})
    setForm({
      countryCode: '',
      productCode: '',
      serviceCode: '',
      serviceMapCode: '',
      serviceDescription: '',
      active: true,
      effectiveFromDate: '',
      effectiveToDate: '',
    })
  }

  const handleFormChange = (field: string, value: any) => {
    setForm((prev: any) => {
      let updated = { ...prev, [field]: value }

      return updated
    })

    if (formErrors[field]) {
      setFormErrors((prev: any) => ({ ...prev, [field]: null }))
    }
  }

  const checkFormChanged = (current: any, original: any) => {
    if (!original) return false
    return (
      current.countryCode !== original.countryCode ||
      current.productCode !== original.productCode ||
      current.serviceCode !== original.serviceCode ||
      current.serviceDescription !== original.serviceDescription ||
      current.active !== original.active ||
      current.effectiveFromDate !== original.effectiveFromDate ||
      current.effectiveToDate !== original.effectiveToDate
    )
  }

  useEffect(() => {
    if (editData && open) {
      const formatToDateOnly = (dateStr: string) => {
        if (!dateStr) return ''
        return dateStr.split('T')[0]
      }

      const newFormData = {
        countryCode: editData.countryCode || '',
        productCode: editData.productCode || '',
        serviceCode: editData?.serviceMapCode || '',
        serviceMapCode: editData.productServiceMapCode || '',
        serviceDescription: editData.serviceDescription || '',
        active: editData.active ?? true,
        effectiveFromDate: formatToDateOnly(editData.effectiveFromDate),
        effectiveToDate: formatToDateOnly(editData.effectiveToDate),
      }

      setForm(newFormData)
      setOriginalFormData(newFormData)
    } else if (!editData && open) {
      const newFormData = {
        countryCode: '',
        productCode: '',
        serviceCode: '',
        serviceMapCode: '',
        serviceDescription: '',
        active: true,
        effectiveFromDate: null,
        effectiveToDate: null,
      }
      setForm(newFormData)
      setOriginalFormData(null)
    }
    setFormErrors({})
  }, [editData, open])

  useEffect(() => {
    if (originalFormData) {
      const changed = checkFormChanged(form, originalFormData)
      setIsFormChanged(changed)
    }
  }, [form, originalFormData])

  const validateForm = () => {
    const errs: any = {}

    if (!form.countryCode) {
      errs.countryCode = 'Country is required'
    }
    if (!form.productCode) {
      errs.productCode = 'Product is required'
    }
    if (!form.serviceCode) {
      // Add service code validation
      errs.serviceCode = 'Service is required'
    }
    // if (!editData && !form.serviceMapCode) {
    //   errs.serviceMapCode = 'Service Map Code is required'
    // }

    if (!form.effectiveFromDate) {
      errs.effectiveFromDate = 'Effective from date is required'
    }
    if (!form.effectiveToDate) {
      errs.effectiveToDate = 'Effective to date is required'
    }

    // Fix: Effective To date must be after Effective From date (not equal or before)
    if (form.effectiveFromDate && form.effectiveToDate) {
      const fromDate = new Date(form.effectiveFromDate)
      const toDate = new Date(form.effectiveToDate)
      // Set hours to compare dates correctly
      fromDate.setHours(0, 0, 0, 0)
      toDate.setHours(0, 0, 0, 0)

      if (toDate <= fromDate) {
        // Changed from < to <= to prevent equal dates
        errs.effectiveToDate = 'Effective To date must be after Effective From date'
      }
    }

    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const local_service = new LocalStorageService()

  const handleSubmit = async () => {
    if (!validateForm()) return

    const staffId = local_service.get_staff_id()

    if (editData) {
      // Update payload - include serviceCode
      //@ts-ignore
      const payload = {
        countryCode: form.countryCode,
        productCode: form.productCode,
        serviceMapCode: form.serviceCode, // Include service code
        // serviceDescription: form.serviceDescription,
        effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
        effectiveToDate: `${form.effectiveToDate}T00:00:00`,
        active: form.active,
        modifiedBy: staffId,
      }

      try {
        //@ts-ignore
        const res = await service.update(editData.productServiceMapCode, payload)
        if (res?.status) {
          showAlert('Success', res?.message || 'Updated successfully')
          handleDialogClose()
          fetchList()
        } else {
          showAlert('Fail', res?.message || 'Update failed')
        }
      } catch (e) {
        showAlert('Fail', 'Server Error')
      }
    } else {
      // Create payload - include serviceCode
      const payload = {
        countryCode: form.countryCode,
        productCode: form.productCode,
        // serviceCode: form.serviceCode, // Include service code
        serviceMapCode: form.serviceCode,
        effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
        effectiveToDate: `${form.effectiveToDate}T00:00:00`,
        createdBy: staffId,
      }

      try {
        const res = await service.create(payload)
        if (res?.status) {
          showAlert('Success', res?.message || 'Created successfully')
          handleDialogClose()
          fetchList()
        } else {
          showAlert('Fail', res?.message || 'Creation failed')
        }
      } catch (e) {
        showAlert('Fail', 'Server Error')
      }
    }
  }

  // ==================== CUSTOM TOOLBAR ====================
  const CustomToolbar = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
        <GridToolbar />
      </Box>
    )
  }

  // ==================== COLUMNS ====================
  const columns: GridColDef[] = [
    {
      field: 'productServiceMapCode',
      headerName: 'Map Code',
      flex: 1,
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
      field: 'countryCode',
      headerName: 'Country',
      flex: 1,

      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <PublicIcon sx={{ fontSize: 16, color: '#666' }} />
          <Tooltip title={getCountryName(params.value)}>
            <Typography variant="body2">{params.value}</Typography>
          </Tooltip>
        </Stack>
      ),
    },
    {
      field: 'productCode',
      headerName: 'Product',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Tooltip title={getProductName(params.value)}>
          <Chip label={params.value} size="small" variant="outlined" color="primary" />
        </Tooltip>
      ),
    },

    {
      field: 'active',
      headerName: 'Active',
      flex: 1,
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
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.value),
    },
    {
      field: 'effectiveToDate',
      headerName: 'To',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (params.value?.includes('9999') ? '∞' : formatTableDate(params.value)),
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      sortable: false,
      renderCell: (params) => (
        <IconButton
          color="primary"
          size="small"
          disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
          onClick={() => {
            console.log(params.row)

            setEditData(params.row)
            setOpen(true)
            setIsFormChanged(false)
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  // ==================== RENDER ====================
  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3} sx={{ width: '100%', '& .super-app-theme--header': { backgroundColor: '#f5f5f5', fontWeight: 'bold' } }}>
        {/* Header */}
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
            {'Product Sub Service Master'.toUpperCase()}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setEditData(null)
              setOpen(true)
              setIsFormChanged(false)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
            sx={{ backgroundColor: '#0061B1' }}
          >
            Add
          </Button>
        </Stack>

        {/* Data Grid */}
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.productServiceMapCode || Math.random()}
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

        {/* Form Dialog */}
        <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="md">
          <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
            {editData ? 'Update Product Sub Service' : 'Create Product Sub Service '}
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Country Dropdown */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={countries?.filter((c: any) => c.status === 'A') || []}
                  getOptionLabel={(o: any) => `${o.countryName} (${o.countryCode})`}
                  value={countries?.find((c: any) => c.countryCode === form.countryCode) || null}
                  onChange={(_, val) => handleFormChange('countryCode', val?.countryCode || '')}
                  disabled={!!editData}
                  renderInput={(params) => (
                    <TextField {...params} label="Country" required error={!!formErrors.countryCode} helperText={formErrors.countryCode} />
                  )}
                />
              </Grid>

              {/* Product Dropdown */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={products.filter((p) => p.active)}
                  getOptionLabel={(option) => `${option.countryProductCode} - ${option.productName}`}
                  value={products.find((p) => p.countryProductCode === form.productCode) || null}
                  onChange={(_, val) => handleFormChange('productCode', val?.countryProductCode || '')}
                  disabled={!!editData && form?.countryCode}
                  renderInput={(params) => (
                    <TextField {...params} label="Product" required error={!!formErrors.productCode} helperText={formErrors.productCode} />
                  )}
                />
              </Grid>

              {/* Service Dropdown - MOVED OUTSIDE CONDITIONAL */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={services.filter((s) => s.active !== false && s.countryCode == form.countryCode)}
                  getOptionLabel={(option) => `${option.serviceSubServiceMapCode}`}
                  value={services.find((s) => s.serviceSubServiceMapCode === form.serviceCode) || null}
                  onChange={(_, val) => handleFormChange('serviceCode', val?.serviceSubServiceMapCode || '')}
                  renderInput={(params) => (
                    <TextField {...params} label="Service" required error={!!formErrors.serviceCode} helperText={formErrors.serviceCode} />
                  )}
                />
              </Grid>

              {/* Generated Code (Display only for edit) */}
              {editData && editData.serviceCodeGenerated && (
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Generated Service Code"
                    fullWidth
                    value={editData.serviceCodeGenerated}
                    disabled
                    variant="filled"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FingerprintIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}

              {/* Service Description */}

              {/* Active Status (for update) */}
              {editData && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Checkbox checked={form.active} onChange={(e) => handleFormChange('active', e.target.checked)} />}
                    label="Active Status"
                  />
                </Grid>
              )}

              {/* Effective From Date */}
              <Grid item xs={6}>
                <DynamicDatePicker
                  label="Effective From"
                  value={form.effectiveFromDate}
                  onChange={(val: string) => handleFormChange('effectiveFromDate', val)}
                  error={!!formErrors.effectiveFromDate}
                  helperText={formErrors.effectiveFromDate}
                  required
                />
              </Grid>

              {/* Effective To Date - DISABLED UNTIL EFFECTIVE FROM IS SELECTED */}
              <Grid item xs={6}>
                <DynamicEndDatePicker
                  label="Effective To"
                  value={form.effectiveToDate}
                  minDate={form.effectiveFromDate}
                  onChange={(val: string) => handleFormChange('effectiveToDate', val)}
                  error={!!formErrors.effectiveToDate}
                  helperText={formErrors.effectiveToDate}
                  required
                  disabled={!form.effectiveFromDate} // Disable if Effective From is not selected
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Button onClick={handleDialogClose} color="inherit">
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={editData ? !isFormChanged : false} sx={{ backgroundColor: '#0061B1' }}>
              {editData ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </HasPermission>
  )
}
