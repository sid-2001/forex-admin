import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Snackbar,
  Alert,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  IconButton,
  Chip,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Paper,
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid'
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  Category as CategoryIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import CountryReportingMappingsService, {
  CountryReportingMapping,
  CountryLabelOption,
  FieldLabelOption,
} from '../../services/country-reporting-mapping.service'
import CountryLabelCodesService from '../../services/country-label-codes.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import dayjs from 'dayjs'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'

const countryReportingMappingsService = new CountryReportingMappingsService()
const countryLabelCodesService = new CountryLabelCodesService()

export default function CountryReportingMappingsGridPage() {
  const [rows, setRows] = useState<CountryReportingMapping[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<CountryReportingMapping | null>(null)
  const [countryLabelOptions, setCountryLabelOptions] = useState<CountryLabelOption[]>([])
  const [fieldLabelOptions, setFieldLabelOptions] = useState<FieldLabelOption[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingCountryLabels, setLoadingCountryLabels] = useState(false)
  const [loadingFieldLabels, setLoadingFieldLabels] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [form, setForm] = useState({
    countryLabelCode: '',
    fieldLabelCode: '',
    requirementLevels: 'M' as 'M' | 'O' | 'C',
    visibility: 'Y' as 'Y' | 'N',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '2026-12-31T23:59:59',
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  const local_service = new LocalStorageService()
  const user = local_service?.get_user()
  const helper = new HelperService()

  const showSuccess = (msg: string) => setSnackbar({ open: true, message: msg, severity: 'success' })

  const showError = (msg: string) => setSnackbar({ open: true, message: msg, severity: 'error' })

  useEffect(() => {
    loadData()
    loadOptions()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await countryReportingMappingsService.getAll()
      setRows(data)
    } catch (error) {
      showError('Failed to load country reporting mappings')
    } finally {
      setLoading(false)
    }
  }

  const loadOptions = async () => {
    try {
      // Load country label options from API
      await loadCountryLabelOptions()

      // Load field label options
      await loadFieldLabelOptions()
    } catch (error) {
      showError('Failed to load options')
    }
  }

  const loadCountryLabelOptions = async () => {
    try {
      setLoadingCountryLabels(true)
      // Fetch country label codes from API using CountryLabelCodesService
      const countryLabelCodes = await countryLabelCodesService.getAll()

      console.log('API Response from CountryLabelCodesService.getAll():', countryLabelCodes)

      // Transform the data to match CountryLabelOption interface
      const options: CountryLabelOption[] = countryLabelCodes.map((code: any) => {
        // Generate display name based on available fields
        const displayName = [
          code.countryCode || '',
          code.railPayoutMappingCode || '',
          code.countryReportingCode || '',
          code.channel ? `(${code.channel})` : '',
        ]
          .filter(Boolean)
          .join(' - ')

        return {
          countryLabelCode: code.countryLabelCode || '',
          countryCode: code.countryCode || '',
          railPayoutMappingCode: code.railPayoutMappingCode || '',
          countryReportingCode: code.countryReportingCode || '',
          channel: code.channel || '',
          displayName: displayName || code.countryLabelCode || 'Unknown',
        }
      })

      // Filter out invalid options (empty countryLabelCode)
      const validOptions = options.filter((opt) => opt.countryLabelCode)

      setCountryLabelOptions(validOptions)
      console.log('Loaded country label options:', validOptions.length, validOptions)
    } catch (error) {
      console.error('Error loading country label options:', error)
      showError('Failed to load country label options from API')
      setCountryLabelOptions([])
    } finally {
      setLoadingCountryLabels(false)
    }
  }

  const loadFieldLabelOptions = async () => {
    try {
      setLoadingFieldLabels(true)
      // Load field label options
      const fieldLabels = await countryReportingMappingsService.getFieldLabelOptions()
      setFieldLabelOptions(fieldLabels)
      console.log('Loaded field label options:', fieldLabels.length, fieldLabels)
    } catch (error) {
      console.error('Error loading field label options:', error)
      showError('Failed to load field label options')
      setFieldLabelOptions([])
    } finally {
      setLoadingFieldLabels(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await loadData()
      await loadOptions()
      showSuccess('Data refreshed successfully')
    } catch (error) {
      showError('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  const handleCreate = () => {
    setSelected(null)
    setForm({
      countryLabelCode: '',
      fieldLabelCode: '',
      requirementLevels: 'M',
      visibility: 'Y',
      active: true,
      effectiveFromDate: '',
      effectiveToDate: '2026-12-31T23:59:59',
    })
    setOpen(true)
  }

  const handleEdit = (row: CountryReportingMapping) => {
    setSelected(row)
    setForm({
      countryLabelCode: row.countryLabelCode || '',
      fieldLabelCode: row.fieldLabelCode || '',
      requirementLevels: row.requirementLevels || 'M',
      visibility: row.visibility || 'Y',
      active: row.active ?? true,
      effectiveFromDate: row.effectiveFromDate || '',
      effectiveToDate: row.effectiveToDate || '2026-12-31T23:59:59',
    })
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this mapping?')) {
      try {
        const result = await countryReportingMappingsService.delete(id, false)
        if (result.status) {
          showSuccess('Mapping deleted successfully')
          loadData()
        } else {
          showError(result.message)
        }
      } catch (error) {
        showError('Failed to delete mapping')
      }
    }
  }

  const handleSubmit = async () => {
    // Validation

    console.log(form)
    if (!form.countryLabelCode || !form.fieldLabelCode || !form.effectiveFromDate) {
      showError('Please fill all required fields')
      return
    }

    if (new Date(form.effectiveFromDate) > new Date(form.effectiveToDate)) {
      showError('Effective From date cannot be after Effective To date')
      return
    }

    try {
      const payload = {
        ...form,
        createdBy: selected ? undefined : local_service.get_staff_id() || 'ADMIN',
        modifiedBy: selected ? local_service.get_staff_id() || 'ADMIN' : undefined,
        effectiveFromDate: new Date(form.effectiveFromDate).toISOString(),
        effectiveToDate: new Date(form.effectiveToDate).toISOString(),
      }

      if (selected) {
        // Update
        const updatePayload = {
          ...payload,
          id: selected.id,
        }

        const result = await countryReportingMappingsService.update(updatePayload, updatePayload?.id)
        if (result.status) {
          showSuccess('Mapping updated successfully')
          setOpen(false)
          loadData()
        } else {
          showError(result.message)
        }
      } else {
        // Create
        const result = await countryReportingMappingsService.create(payload)
        if (result.status) {
          showSuccess('Mapping created successfully')
          setOpen(false)
          loadData()
        } else {
          showError(result.message)
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      showError(selected ? 'Failed to update mapping' : 'Failed to create mapping Server Error')
    }
  }

  // Filter rows based on search term
  const filteredRows = rows.filter((row) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    const countryLabel = countryLabelOptions.find((opt) => opt.countryLabelCode === row.countryLabelCode)?.displayName?.toLowerCase() || ''

    const fieldLabel = fieldLabelOptions.find((opt) => opt.fieldLabelCode === row.fieldLabelCode)?.displayName?.toLowerCase() || ''

    return (
      row.id?.toLowerCase().includes(searchLower) ||
      row.countryLabelCode?.toLowerCase().includes(searchLower) ||
      countryLabel.includes(searchLower) ||
      row.fieldLabelCode?.toLowerCase().includes(searchLower) ||
      fieldLabel.includes(searchLower) ||
      row.requirementLevels.toLowerCase().includes(searchLower) ||
      row.visibility.toLowerCase().includes(searchLower)
    )
  })

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Mapping ID',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'countryLabelCode',
      headerName: 'Country Label',
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: GridRenderCellParams) => {
        const countryLabel = countryLabelOptions.find((opt) => opt.countryLabelCode === params.value)
        return (
          <Box>
            <Typography variant="body2" noWrap>
              {countryLabel?.displayName || params.value}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {params.value}
            </Typography>
            {(countryLabel as any) && (
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`Country: ${
                    //@ts-ignore
                    countryLabel.countryCode
                  }`}
                  variant="outlined"
                  color="primary"
                />
                {
                  //@ts-ignore
                  countryLabel.channel && (
                    <Chip
                      size="small"
                      label={`Channel: ${
                        //@ts-ignore
                        countryLabel.channel
                      }`}
                      variant="outlined"
                      color="secondary"
                    />
                  )
                }
              </Box>
            )}
          </Box>
        )
      },
    },
    {
      field: 'fieldLabelCode',
      headerName: 'Field Label',
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: GridRenderCellParams) => {
        const fieldLabel = fieldLabelOptions.find((opt) => opt.fieldLabelCode === params.value)
        return (
          <Box>
            <Typography variant="body2" noWrap>
              {fieldLabel?.displayName || params.value}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {params.value}
            </Typography>
            {fieldLabel && (
              <Typography variant="caption" display="block" color="textSecondary">
                {fieldLabel.channelCode}/{fieldLabel.screen} - {fieldLabel.fieldName}
              </Typography>
            )}
          </Box>
        )
      },
    },
    {
      field: 'requirementLevels',
      headerName: 'Requirement',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip
          title={
            params.value === 'M'
              ? 'Mandatory - Field is required'
              : params.value === 'O'
                ? 'Optional - Field is not required'
                : 'Conditional - Field is required based on conditions'
          }
        >
          <Chip
            label={params.value === 'M' ? 'Mandatory' : params.value === 'O' ? 'Optional' : 'Conditional'}
            size="small"
            color={params.value === 'M' ? 'error' : params.value === 'O' ? 'warning' : 'info'}
            variant="outlined"
          />
        </Tooltip>
      ),
    },
    {
      field: 'visibility',
      headerName: 'Visibility',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.value === 'Y' ? 'Visible - Field is shown to users' : 'Hidden - Field is not shown to users'}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {params.value === 'Y' ? <VisibilityIcon color="success" /> : <VisibilityOffIcon color="action" />}
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              {params.value === 'Y' ? 'Visible' : 'Hidden'}
            </Typography>
          </Box>
        </Tooltip>
      ),
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
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.value ? 'Active mapping' : 'Inactive mapping'}>
          <Chip label={params.value ? 'Active' : 'Inactive'} size="small" color={params.value ? 'success' : 'error'} variant="outlined" />
        </Tooltip>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit mapping">
            <IconButton
              size="small"
              color="primary"
              disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
              onClick={() => handleEdit(params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip
            //@ts-ignore
            //@ts-ignore
            title="Delete mapping"
            children={undefined as any}
          >
            {/* <IconButton 
              size="small" 
              color="error" 
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteIcon />
            </IconButton> */}
          </Tooltip>
        </Stack>
      ),
    },
  ]

  const requirementLevels = [
    { value: 'M', label: 'Mandatory', description: 'Field is required' },
    { value: 'O', label: 'Optional', description: 'Field is not required' },
    { value: 'C', label: 'Conditional', description: 'Field is required based on conditions' },
  ]

  const visibilityOptions = [
    { value: 'Y', label: 'Visible', description: 'Field is shown to users' },
    { value: 'N', label: 'Hidden', description: 'Field is not shown to users' },
  ]

  // Get selected country label details
  const getSelectedCountryLabelDetails = () => {
    if (!form.countryLabelCode) return null
    return countryLabelOptions.find((opt) => opt.countryLabelCode === form.countryLabelCode)
  }

  // Get selected field label details
  const getSelectedFieldLabelDetails = () => {
    if (!form.fieldLabelCode) return null
    return fieldLabelOptions.find((opt) => opt.fieldLabelCode === form.fieldLabelCode)
  }
  const formatTableDate = (dateString: string) => {
    if (!dateString) return ''
    const storedConfig = localStorage.getItem('countryConfig')
    let format = 'YYYY-MM-DD'

    if (storedConfig) {
      const config = JSON.parse(storedConfig)
      format = config.dateFormat.replace(/d/g, 'D').replace(/y/g, 'Y')
    }

    return dayjs(dateString).format(format.toUpperCase())
  }

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box sx={{ height: '100vh', p: 3 }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
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
            Country Reporting Mappings
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleRefresh}
              startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
              disabled={refreshing}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
              onClick={handleCreate}
            >
              + Create Mapping
            </Button>
          </Box>
        </Stack>

        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id || `${row.countryLabelCode}-${row.fieldLabelCode}`}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true } }}
            disableColumnMenu
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
          />
        </Box>

        {/* Create/Edit Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selected ? 'Edit Mapping' : 'Create New Mapping'}
            <Typography variant="caption" display="block" color="textSecondary">
              ID: {selected?.id || 'New'}
            </Typography>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {/* Country Label Code */}
              <FormControl fullWidth required>
                <InputLabel>Country Label Code *</InputLabel>
                <Select
                  value={form.countryLabelCode}
                  label="Country Label Code *"
                  onChange={(e) => setForm({ ...form, countryLabelCode: e.target.value })}
                  startAdornment={
                    form.countryLabelCode && (
                      <InputAdornment position="start">
                        <BusinessIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }
                  disabled={loadingCountryLabels}
                >
                  {loadingCountryLabels ? (
                    <MenuItem disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        <Typography>Loading country labels...</Typography>
                      </Box>
                    </MenuItem>
                  ) : countryLabelOptions.length === 0 ? (
                    <MenuItem disabled>
                      <Typography color="textSecondary">No country label codes found. Please check API connection.</Typography>
                    </MenuItem>
                  ) : (
                    countryLabelOptions.map((option) => (
                      <MenuItem key={option.countryLabelCode} value={option.countryLabelCode}>
                        <Box sx={{ width: '100%' }}>
                          <Typography variant="body2" fontWeight="medium">
                            {option.displayName}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                            <Chip size="small" label={`Country: ${option.countryCode}`} variant="outlined" color="primary" />
                            {
                              //@ts-ignore
                              option.channel && (
                                <Chip
                                  size="small"
                                  label={`Channel: ${
                                    //@ts-ignore
                                    option.channel
                                  }`}
                                  variant="outlined"
                                  color="secondary"
                                />
                              )
                            }
                          </Box>
                          <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                            Rail Payout: {option.railPayoutMappingCode} | Reporting: {option.countryReportingCode}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Code: {option.countryLabelCode}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                  {countryLabelOptions.length} country label codes available
                </Typography>
              </FormControl>

              {/* Field Label Code */}
              <FormControl fullWidth required>
                <InputLabel>Field Label Code *</InputLabel>
                <Select
                  value={form.fieldLabelCode}
                  label="Field Label Code *"
                  onChange={(e) => setForm({ ...form, fieldLabelCode: e.target.value })}
                  disabled={loadingFieldLabels}
                >
                  {loadingFieldLabels ? (
                    <MenuItem disabled>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        <Typography>Loading field labels...</Typography>
                      </Box>
                    </MenuItem>
                  ) : fieldLabelOptions.length === 0 ? (
                    <MenuItem disabled>
                      <Typography color="textSecondary">No field label codes found. Please check API connection.</Typography>
                    </MenuItem>
                  ) : (
                    fieldLabelOptions.map((option: any) => (
                      <MenuItem key={option.fieldLabelCode} value={option.fieldLabelCode}>
                        <Box sx={{ width: '100%' }}>
                          <Typography variant="body2" fontWeight="medium">
                            {option.displayName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Field: {option.fieldName} | Label: {option.label}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Channel: {option.channelCode} | Screen: {option.screen}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Code: {option.fieldLabelCode}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                  {fieldLabelOptions.length} field label codes available
                </Typography>
              </FormControl>

              {/* Requirement Levels & Visibility */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Requirement Level *</InputLabel>
                    <Select
                      value={form.requirementLevels}
                      label="Requirement Level *"
                      onChange={(e) => setForm({ ...form, requirementLevels: e.target.value as 'M' | 'O' | 'C' })}
                    >
                      {requirementLevels.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box>
                            <Typography>{option.label}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {option.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Visibility *</InputLabel>
                    <Select
                      value={form.visibility}
                      label="Visibility *"
                      onChange={(e) => setForm({ ...form, visibility: e.target.value as 'Y' | 'N' })}
                    >
                      {visibilityOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box>
                            <Typography>{option.label}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {option.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider>Effective Dates</Divider>

              {/* Effective Dates */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <DynamicDatePicker
                    label="Effective From"
                    value={form.effectiveFromDate}
                    onChange={(val: string) => {
                      setForm({ ...form, effectiveFromDate: val })
                    }}
                    // error={!!errors.effectiveFromDate}
                    // helperText={errors.effectiveFromDate}
                    required
                  />
                </Grid>

                <Grid item xs={6}>
                  <DynamicEndDatePicker
                    label="Effective To"
                    value={form.effectiveToDate}
                    minDate={form.effectiveFromDate}
                    onChange={(val: string) => {
                      setForm({ ...form, effectiveToDate: val })
                    }}
                    // error={!!errors.effectiveToDate}
                    // helperText={errors.effectiveToDate}
                    required
                  />
                </Grid>
              </Grid>

              {/* Active Status */}
              <FormControlLabel
                control={<Switch checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
                label="Active"
              />

              {/* Preview Section */}
              {(form.countryLabelCode || form.fieldLabelCode) && (
                <>
                  <Divider>Mapping Preview</Divider>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                      Mapping Details:
                    </Typography>

                    <Grid container spacing={2}>
                      {/* Country Label Details */}
                      <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 1.5 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            <BusinessIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Country Label
                          </Typography>
                          {getSelectedCountryLabelDetails() ? (
                            <Stack spacing={0.5}>
                              <Typography variant="body2">
                                <strong>Code:</strong> {getSelectedCountryLabelDetails()?.countryLabelCode}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Country:</strong> {getSelectedCountryLabelDetails()?.countryCode}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Rail Payout:</strong> {getSelectedCountryLabelDetails()?.railPayoutMappingCode}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Reporting:</strong> {getSelectedCountryLabelDetails()?.countryReportingCode}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Channel:</strong>{' '}
                                {
                                  //@ts-ignore
                                  getSelectedCountryLabelDetails()?.channel || 'N/A'
                                }
                              </Typography>
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              No country label selected
                            </Typography>
                          )}
                        </Paper>
                      </Grid>

                      {/* Field Label Details */}
                      <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 1.5 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            <AccountBalanceIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Field Label
                          </Typography>
                          {getSelectedFieldLabelDetails() ? (
                            <Stack spacing={0.5}>
                              <Typography variant="body2">
                                <strong>Code:</strong> {getSelectedFieldLabelDetails()?.fieldLabelCode}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Field:</strong> {getSelectedFieldLabelDetails()?.fieldName}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Label:</strong> {getSelectedFieldLabelDetails()?.label}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Channel:</strong> {getSelectedFieldLabelDetails()?.channelCode}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Screen:</strong> {getSelectedFieldLabelDetails()?.screen}
                              </Typography>
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              No field label selected
                            </Typography>
                          )}
                        </Paper>
                      </Grid>

                      {/* Mapping Configuration */}
                      <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 1.5 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            <CategoryIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Mapping Configuration
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Requirement:</strong> {requirementLevels.find((r) => r.value === form.requirementLevels)?.label}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {requirementLevels.find((r) => r.value === form.requirementLevels)?.description}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Visibility:</strong> {visibilityOptions.find((v) => v.value === form.visibility)?.label}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {visibilityOptions.find((v) => v.value === form.visibility)?.description}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="body2">
                                <strong>Status:</strong> {form.active ? 'Active' : 'Inactive'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="body2">
                                <strong>Effective From:</strong> {form.effectiveFromDate || 'Not set'}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Effective To:</strong>{' '}
                                {form.effectiveToDate === '2026-12-31T23:59:59' ? 'Default (2026-12-31)' : form.effectiveToDate}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Paper>
                </>
              )}
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!form.countryLabelCode || !form.fieldLabelCode || !form.effectiveFromDate || loadingCountryLabels || loadingFieldLabels}
            >
              {selected ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            top: { xs: '10%', sm: '20%' },
            '& .MuiAlert-root': {
              fontSize: '0.9rem',
              padding: '8px 16px',
            },
          }}
        >
          <Alert severity={snackbar.severity} variant="filled" elevation={6}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </HasPermission>
  )
}
