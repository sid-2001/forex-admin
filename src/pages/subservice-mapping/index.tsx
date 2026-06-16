// pages/ServiceSubServiceMapping.tsx
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
import CodeIcon from '@mui/icons-material/Code'
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight'
import FingerprintIcon from '@mui/icons-material/Fingerprint'
import { useRecoilState, useRecoilValue } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import dayjs from 'dayjs'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import ServiceSubServiceMappingService from '@/services/service-subservice-mapping.service'
import ServiceMasterService from '@/services/service-master.service'
import SubServiceMasterService from '@/services/sub-service.service'
import { formatTableDate } from '@/helpers/dateformate'
import SequenceApiService from '@/services/sequence.api.service'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'
import { LocalStorageService } from '@/helpers/local-storage-service'

// ==================== MAIN COMPONENT ====================
export default function ServiceSubServiceMapping() {
  const mappingService = useMemo(() => new ServiceSubServiceMappingService(), [])
  const serviceService = useMemo(() => new ServiceMasterService(), [])
  const subServiceService = useMemo(() => new SubServiceMasterService(), [])
  const sequenceService = new SequenceApiService()
  const helper = new HelperService()

  const [countries, setcountries] = useState([])

  const [rows, setRows] = useState<any[]>([])
  const [filteredRows, setFilteredRows] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [subServices, setSubServices] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [isFormChanged, setIsFormChanged] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [countryFilter, setCountryFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Pagination
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)

  const [uniqueCountries, setUniqueCountries] = useState<string[]>([])
  const [uniqueServices, setUniqueServices] = useState<string[]>([])

  const [, setAlertOpen] = useRecoilState(alertState)
  const [, setAlertText] = useRecoilState(alertTextState)
  const [, setAlertType] = useRecoilState(alertTypeState)

  // Form state for dialog
  const [formErrors, setFormErrors] = useState<any>({})
  const [form, setForm] = useState<any>({
    countryCode: '',
    serviceCode: '',
    subServiceCode: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  })
  const [originalFormData, setOriginalFormData] = useState<any>(null)

  // ==================== HELPER FUNCTIONS ====================
  const showAlert = (type: 'Success' | 'Fail', text: string) => {
    setAlertType(type)
    setAlertText(text)
    setAlertOpen(true)
  }

  const fetchCountryCodes = useCallback(async () => {
    const res: any = await sequenceService.getActiveCountryCorridors()
    setcountries(res || [])
  }, [])

  useEffect(() => {
    fetchCountryCodes()
  }, [])

  const getCountryName = (countryCode: string) => {
    const country: any = countries.find((c: any) => c.countryCode === countryCode)
    return country ? country?.countryName : countryCode
  }

  const getServiceName = (serviceCode: string) => {
    const service = services.find((s) => s.serviceCode === serviceCode)
    return service ? service.serviceName : serviceCode
  }

  const getSubServiceName = (subServiceCode: string) => {
    const subService = subServices.find((s) => s.subServiceCode === subServiceCode)
    return subService ? subService.subServiceName : subServiceCode
  }

  const formatTimezoneOffset = () => {
    const offset = -new Date().getTimezoneOffset()
    const sign = offset >= 0 ? '+' : '-'
    const hours = Math.floor(Math.abs(offset) / 60)
      .toString()
      .padStart(2, '0')
    const minutes = (Math.abs(offset) % 60).toString().padStart(2, '0')
    return `${sign}${hours}:${minutes}`
  }

  // ==================== DATA FETCHING ====================
  const fetchServices = useCallback(async () => {
    try {
      const data = await serviceService.getServiceList()
      setServices(data)
    } catch (err) {
      console.error('Error fetching services:', err)
    }
  }, [serviceService])

  const fetchSubServices = useCallback(async () => {
    try {
      const data = await subServiceService.getSubServiceList()
      setSubServices(data)
    } catch (err) {
      console.error('Error fetching sub-services:', err)
    }
  }, [subServiceService])

  const fetchList = useCallback(async () => {
    try {
      const data = await mappingService.getAllMappings()
      console.log('Fetched Data:', data)
      setRows(data)

      // Extract unique values for filters
      const countriesSet = new Set<string>()
      const servicesSet = new Set<string>()

      data.forEach((row: any) => {
        if (row.countryCode) countriesSet.add(row.countryCode)
        if (row.serviceCode) servicesSet.add(row.serviceCode)
      })

      setUniqueCountries(Array.from(countriesSet).sort())
      setUniqueServices(Array.from(servicesSet).sort())
    } catch (err) {
      setRows([])
      showAlert('Fail', 'Failed to fetch data')
    }
  }, [mappingService])

  useEffect(() => {
    fetchServices()
    fetchSubServices()
    fetchList()
  }, [fetchServices, fetchSubServices, fetchList])

  // ==================== FILTERS ====================
  const applyFilters = useCallback(() => {
    let filtered = [...rows]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (row) =>
          row.serviceSubServiceMapCode?.toLowerCase().includes(term) ||
          row.countryCode?.toLowerCase().includes(term) ||
          row.serviceCode?.toLowerCase().includes(term) ||
          row.subServiceCode?.toLowerCase().includes(term) ||
          row.createdBy?.toLowerCase().includes(term),
      )
    }

    if (countryFilter !== 'all') {
      filtered = filtered.filter((row) => row.countryCode === countryFilter)
    }

    if (serviceFilter !== 'all') {
      filtered = filtered.filter((row) => row.serviceCode === serviceFilter)
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active'
      filtered = filtered.filter((row) => row.active === isActive)
    }

    setFilteredRows(filtered)
  }, [rows, searchTerm, countryFilter, serviceFilter, statusFilter])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const resetFilters = () => {
    setSearchTerm('')
    setCountryFilter('all')
    setServiceFilter('all')
    setStatusFilter('all')
    setPage(0)
  }

  // ==================== CSV EXPORT ====================
  const downloadCSV = () => {
    if (!filteredRows || filteredRows.length === 0) {
      showAlert('Fail', 'No data to export')
      return
    }

    const headers = [
      'Map Code',
      'Country',
      'Service Code',
      'Sub Service Code',
      'Active',
      'Effective From',
      'Effective To',
      'Created By',
      'Created Date',
    ]

    const csvRows = filteredRows.map((row) => [
      row.serviceSubServiceMapCode || '',
      row.countryCode || '',
      row.serviceCode || '',
      row.subServiceCode || '',
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
    link.setAttribute('download', `service_subservice_mapping_${new Date().toISOString().split('T')[0]}.csv`)
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
      serviceCode: '',
      subServiceCode: '',
      active: true,
      effectiveFromDate: '',
      effectiveToDate: '',
    })
  }

  const handleFormChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev: any) => ({ ...prev, [field]: null }))
    }

    // When effectiveFromDate changes, validate and potentially clear effectiveToDate
    if (field === 'effectiveFromDate' && value && form.effectiveToDate) {
      const fromDate = new Date(value)
      const toDate = new Date(form.effectiveToDate)
      fromDate.setHours(0, 0, 0, 0)
      toDate.setHours(0, 0, 0, 0)

      // If effectiveToDate is not after effectiveFromDate, clear it
      if (toDate <= fromDate) {
        setForm((prev: any) => ({ ...prev, effectiveToDate: '' }))
      }
    }
  }

  const checkFormChanged = (current: any, original: any) => {
    if (!original) return false
    return (
      current.countryCode !== original.countryCode ||
      current.serviceCode !== original.serviceCode ||
      current.subServiceCode !== original.subServiceCode ||
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
        serviceCode: editData.serviceCode || '',
        subServiceCode: editData.subServiceCode || '',
        active: editData.active ?? true,
        effectiveFromDate: formatToDateOnly(editData.effectiveFromDate),
        effectiveToDate: formatToDateOnly(editData.effectiveToDate),
      }

      setForm(newFormData)
      setOriginalFormData(newFormData)
    } else if (!editData && open) {
      const newFormData = {
        countryCode: '',
        serviceCode: '',
        subServiceCode: '',
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
    if (!form.serviceCode) {
      errs.serviceCode = 'Service is required'
    }
    if (!form.subServiceCode) {
      errs.subServiceCode = 'Sub Service is required'
    }
    if (!form.effectiveFromDate) {
      errs.effectiveFromDate = 'Effective from date is required'
    }
    if (!form.effectiveToDate) {
      errs.effectiveToDate = 'Effective to date is required'
    }

    // Effective To date must be AFTER Effective From date

    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const local_service = new LocalStorageService()

  const handleSubmit = async () => {
    if (!validateForm()) return

    const staffId = local_service.get_staff_id() || 'APSNGGGN3654'

    if (editData) {
      // Update payload
      const payload = {
        countryCode: form.countryCode,
        serviceCode: form.serviceCode,
        subServiceCode: form.subServiceCode,
        effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
        effectiveToDate: `${form.effectiveToDate}T00:00:00`,
        active: form.active,
        modifiedBy: staffId,
      }

      try {
        const res = await mappingService.updateMapping(editData.serviceSubServiceMapCode, payload)
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
      // Create payload
      const payload = {
        countryCode: form.countryCode,
        serviceCode: form.serviceCode,
        subServiceCode: form.subServiceCode,
        effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
        effectiveToDate: `${form.effectiveToDate}T00:00:00`,
        createdBy: staffId,
        active: form.active,
      }

      try {
        const res = await mappingService.createMapping(payload)
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

  // ==================== COLUMNS ====================
  const columns: GridColDef[] = [
    {
      field: 'serviceSubServiceMapCode',
      headerName: 'Map Code',
      width: 140,
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
      width: 90,
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
      field: 'serviceCode',
      headerName: 'Service',
      width: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Tooltip title={getServiceName(params.value)}>
          <Chip label={params.value} size="small" icon={<CodeIcon />} color="primary" variant="outlined" />
        </Tooltip>
      ),
    },
    {
      field: 'subServiceCode',
      headerName: 'Sub Service',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Tooltip title={getSubServiceName(params.value)}>
          <Chip label={params.value} size="small" icon={<SubdirectoryArrowRightIcon />} color="secondary" variant="outlined" />
        </Tooltip>
      ),
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
      field: 'createdBy',
      headerName: 'Created By',
      width: 120,
      headerClassName: 'super-app-theme--header',
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
            {'Service Sub Service Mapping'.toUpperCase()}
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
            Add Mapping
          </Button>
        </Stack>

        {/* Filters */}

        {/* Data Grid */}
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.serviceSubServiceMapCode || Math.random()}
          autoHeight
          disableRowSelectionOnClick
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              showDensitySelector: true, // ✅ enable density
            },
          }}
          slots={{ toolbar: CustomToolbar }}
          // slotProps={{ toolbar: { showQuickFilter: true } }}
          disableColumnMenu
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
            {editData ? 'Update Service Sub Service Mapping' : 'Create Service Sub Service Mapping'}
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

              {/* Service Dropdown */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  disabled={!form?.countryCode}
                  options={services.filter((s) => s.active !== false && s.countryCode == form?.countryCode)}
                  getOptionLabel={(option) => `${option.serviceCodeGenerated} - ${option.serviceName || option.serviceDescription}`}
                  value={services.find((s) => s.serviceCodeGenerated === form.serviceCode) || null}
                  onChange={(_, val) => handleFormChange('serviceCode', val?.serviceCodeGenerated || '')}
                  renderInput={(params) => (
                    <TextField {...params} label="Service" required error={!!formErrors.serviceCode} helperText={formErrors.serviceCode} />
                  )}
                />
              </Grid>

              {/* Sub Service Dropdown */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  disabled={!form?.countryCode}
                  //@ts-ignore
                  options={subServices.filter((s) => (s.active !== false) & (s.countryCode == form?.countryCode))}
                  getOptionLabel={(option) => `${option.subServiceCodeGenerated} - ${option.subServiceName || option.subServiceDescription}`}
                  value={subServices.find((s) => s.subServiceCodeGenerated === form.subServiceCode) || null}
                  onChange={(_, val) => handleFormChange('subServiceCode', val?.subServiceCodeGenerated || '')}
                  renderInput={(params) => (
                    <TextField {...params} label="Sub Service" required error={!!formErrors.subServiceCode} helperText={formErrors.subServiceCode} />
                  )}
                />
              </Grid>

              {/* Map Code Display for Edit */}
              {editData && editData.serviceSubServiceMapCode && (
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Map Code"
                    fullWidth
                    value={editData.serviceSubServiceMapCode}
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

              {/* Active Status */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox checked={form.active} onChange={(e) => handleFormChange('active', e.target.checked)} />}
                  label="Active Status"
                />
              </Grid>

              {/* Effective From Date */}
              <Grid item xs={6}>
                <DynamicEndDatePicker
                  label="Effective From"
                  value={form.effectiveFromDate}
                  onChange={(val: string) => handleFormChange('effectiveFromDate', val)}
                  error={!!formErrors.effectiveFromDate}
                  helperText={formErrors.effectiveFromDate}
                  required
                />
              </Grid>

              {/* Effective To Date - Disabled until Effective From is selected */}
              <Grid item xs={6}>
                <DynamicEndDatePicker
                  label="Effective To"
                  value={form.effectiveToDate}
                  minDate={form.effectiveFromDate}
                  onChange={(val: string) => handleFormChange('effectiveToDate', val)}
                  error={!!formErrors.effectiveToDate}
                  helperText={formErrors.effectiveToDate}
                  required
                  disabled={!form.effectiveFromDate}
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
