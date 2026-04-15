// pages/CountryCorridorPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Alert,
  AlertTitle,
  Snackbar,
  CircularProgress,
  Avatar,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControl,
  InputLabel,
  alpha,
  CardContent,
  Card,
  Grid,
  Autocomplete,
  createFilterOptions,
} from '@mui/material'
import { DataGrid, GridColDef, GridToolbar, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarQuickFilter } from '@mui/x-data-grid'
import { ThemeProvider, createTheme } from '@mui/material/styles'

// Icons
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Public as PublicIcon,
  Route as RouteIcon,
  Flag as FlagIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  CloudSync as CloudSyncIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  ContentCopy as CopyIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  FileDownload as ExportIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Done as DoneIcon,
  VisibilityOffRounded,
} from '@mui/icons-material'

// Services and Types
import { CountryCorridorService } from '@/services/countryCorridor.service'
import { CountryCorridorData, CreateCorridorPayload, UpdateCorridorPayload, CorridorStats } from '@/types/countryCorridor.types'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { formatTableDate } from '@/helpers/dateformate'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'
import dayjs from 'dayjs'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

const corridorService = new CountryCorridorService()

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e5f9e',
      light: '#3874b0',
      dark: '#164a7a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0b2b4a',
      light: '#2a577b',
      dark: '#0a3146',
    },
    success: {
      main: '#0f6a3b',
      light: '#e2f0e6',
    },
    error: {
      main: '#b13e2d',
      light: '#ffece5',
    },
    warning: {
      main: '#b3561b',
      light: '#fef1e6',
    },
    info: {
      main: '#1e5f9e',
      light: '#eef4fa',
    },
  },
  shape: {
    borderRadius: 12,
  },
})

// Status Chip Component
const StatusChip: React.FC<{ active: boolean }> = ({ active }) => (
  <Chip
    icon={active ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <CancelIcon sx={{ fontSize: 16 }} />}
    label={active ? 'Active' : 'Inactive'}
    size="small"
    sx={{
      backgroundColor: active ? alpha(theme.palette.success.main, 0.12) : alpha(theme.palette.error.main, 0.12),
      color: active ? theme.palette.success.main : theme.palette.error.main,
      fontWeight: 600,
      width: '70px',
    }}
  />
)

// Timezone Chip Component
const TimezoneChip: React.FC<{ timezone: string; offset: string }> = ({ timezone, offset }) => {
  const displayName = timezone?.split('/').pop()?.replace('_', ' ') || timezone
  return (
    <Tooltip title={`Timezone: ${timezone} (${offset})`}>
      <Chip
        icon={<TimeIcon sx={{ fontSize: 14 }} />}
        label={`${displayName} ${offset}`}
        size="small"
        sx={{
          backgroundColor: alpha(theme.palette.info.main, 0.08),
          color: theme.palette.info.dark,
          fontSize: '0.6875rem',
          height: 24,
        }}
      />
    </Tooltip>
  )
}

const CountryCorridorPage: React.FC = () => {
  // State
  const [rows, setRows] = useState<CountryCorridorData[]>([])
  const [filteredRows, setFilteredRows] = useState<CountryCorridorData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pagination
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  // Tabs
  const [tabValue, setTabValue] = useState(0)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [countryFilter, setCountryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Sort
  const [sortBy, setSortBy] = useState('createdLocalDateTime')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Statistics
  const [stats, setStats] = useState<CorridorStats>({
    total: 0,
    active: 0,
    inactive: 0,
    countries: 0,
    countryList: [],
  })

  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false)
  const [countries] = useRecoilState(countyState)

  // Selected corridor
  const [selectedRow, setSelectedRow] = useState<CountryCorridorData | null>(null)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [corridorHistory, setCorridorHistory] = useState<CountryCorridorData[]>([])
  const local_service = useMemo(() => new LocalStorageService(), [])

  // Form data
  const [formData, setFormData] = useState<CreateCorridorPayload>({
    countryCode: '',
    active: true,
    createdBy: local_service?.get_staff_id() || 'APSNG26010500002',
    //@ts-ignore
    effectiveFromDate: null,
    //@ts-ignore
    effectiveToDate: null,
  })

  const [editFormData, setEditFormData] = useState<UpdateCorridorPayload>({
    countryCode: '',
    active: true,
    modifiedBy: local_service?.get_staff_id() || 'APSNG26010500002',
    effectiveFromDate: '',
    effectiveToDate: '',
  })

  // Unique countries
  const [uniqueCountries, setUniqueCountries] = useState<string[]>([])

  // Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedMenuCorridor, setSelectedMenuCorridor] = useState<string | null>(null)

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success')

  // Date validation errors
  const [dateErrors, setDateErrors] = useState<{ from: string; to: string }>({ from: '', to: '' })

  // Fetch corridors
  const fetchCorridors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await corridorService.getAllCorridors()
      setRows(data)
      applyFilters(data)

      const countries = [...new Set(data.map((c) => c.countryCode))].sort()
      setUniqueCountries(countries)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch corridors')
      showSnackbar('Failed to fetch corridors', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await corridorService.getCorridorStats()
      setStats(data)
    } catch (err: any) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarQuickFilter />
      <GridToolbarDensitySelector />
    </GridToolbarContainer>
  )

  // Apply filters
  const applyFilters = useCallback(
    (data: CountryCorridorData[]) => {
      let filtered = [...data]

      // Filter by tab
      if (tabValue === 1) filtered = filtered.filter((c) => c.active === true)
      else if (tabValue === 2) filtered = filtered.filter((c) => c.active === false)

      // Filter by country
      if (countryFilter !== 'all') {
        filtered = filtered.filter((c) => c.countryCode === countryFilter)
      }

      // Filter by status
      if (statusFilter !== 'all') {
        const isActive = statusFilter === 'active'
        filtered = filtered.filter((c) => c.active === isActive)
      }

      // Filter by search
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        filtered = filtered.filter(
          (c) =>
            c.countryCorridorCode.toLowerCase().includes(term) ||
            c.countryCode.toLowerCase().includes(term) ||
            c.createdBy.toLowerCase().includes(term),
        )
      }

      // Apply sort
      filtered.sort((a, b) => {
        let aValue: any = a[sortBy as keyof CountryCorridorData]
        let bValue: any = b[sortBy as keyof CountryCorridorData]

        if (sortBy === 'effectiveFromDate' || sortBy === 'effectiveToDate' || sortBy === 'createdLocalDateTime') {
          aValue = new Date(aValue).getTime()
          bValue = new Date(bValue).getTime()
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
        return 0
      })

      // Add serial numbers
      const rowsWithSerial = filtered.map((row, index) => ({
        ...row,
        serialNo: index + 1,
      }))

      setFilteredRows(rowsWithSerial)
    },
    [tabValue, countryFilter, statusFilter, searchTerm, sortBy, sortOrder],
  )

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('')
    setCountryFilter('all')
    setStatusFilter('all')
    setTabValue(0)
    setSortBy('createdLocalDateTime')
    setSortOrder('desc')
    setPage(0)
  }

  // Validate dates
  const validateDates = (fromDate: string, toDate: string): boolean => {
    const errors = { from: '', to: '' }

    if (!fromDate) {
      errors.from = 'Effective From date is required'
    }
    if (!toDate) {
      errors.to = 'Effective To date is required'
    }

    if (fromDate && toDate) {
      const from = new Date(fromDate)
      const to = new Date(toDate)

      if (from > to) {
        errors.from = 'From date cannot be after To date'
        errors.to = 'To date cannot be before From date'
      }
    }

    setDateErrors(errors)
    return !errors.from && !errors.to
  }

  // Handle create corridor
  const handleCreateCorridor = async () => {
    if (!formData.countryCode) {
      showSnackbar('Country code is required', 'error')
      return
    }

    //@ts-ignore

    if (!validateDates(formData.effectiveFromDate, formData.effectiveToDate)) {
      return
    }

    const payload = {
      ...formData,
      effectiveFromDate: `${formData.effectiveFromDate}T00:00:00`,
      effectiveToDate: formData.effectiveToDate === '9999-12-31' ? '9999-12-31T00:00:00' : `${formData.effectiveToDate}T00:00:00`,
    }

    setLoading(true)
    try {
      let res = await corridorService.createCorridor(payload)
      //@ts-ignore
      showSnackbar(`${res.message}`)
      setOpenCreateDialog(false)
      resetForm()
      fetchCorridors()
      fetchStats()
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to create corridor', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle update corridor
  const handleUpdateCorridor = async () => {
    if (!selectedRow) return

    //@ts-ignore
    if (!validateDates(editFormData.effectiveFromDate, editFormData.effectiveToDate)) {
      return
    }

    const payload = {
      ...editFormData,
      effectiveFromDate: `${editFormData.effectiveFromDate}T00:00:00`,
      effectiveToDate: editFormData.effectiveToDate === '9999-12-31' ? '9999-12-31T00:00:00' : `${editFormData.effectiveToDate}T00:00:00`,
    }

    setLoading(true)
    try {
      await corridorService.updateCorridor(selectedRow.countryCorridorCode, payload)
      showSnackbar('Corridor updated successfully', 'success')
      setOpenEditDialog(false)
      fetchCorridors()
      fetchStats()
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to update corridor', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle toggle status
  const handleToggleStatus = async (corridor: CountryCorridorData) => {
    setLoading(true)
    const newStatus = !corridor.active
    try {
      await corridorService.updateActiveStatus(
        corridor.countryCorridorCode,
        newStatus,
        local_service?.get_staff_id(),
        corridor.effectiveFromDate,
        corridor.effectiveToDate,
      )

      showSnackbar(`Corridor ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success')
      fetchCorridors()
      fetchStats()
    } catch (err: any) {
      showSnackbar(err.message || `Failed to ${newStatus ? 'activate' : 'deactivate'} corridor`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle deactivate corridor
  const handleDeactivateCorridor = async () => {
    if (!selectedRow) return

    setLoading(true)
    try {
      await corridorService.deactivateCorridor(selectedRow.countryCorridorCode, local_service?.get_staff_id() || 'APSNG26010500002')
      showSnackbar('Corridor deactivated successfully', 'success')
      setOpenDeleteDialog(false)
      fetchCorridors()
      fetchStats()
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to deactivate corridor', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle export CSV
  const handleExportCSV = async () => {
    setLoading(true)
    try {
      const blob = await corridorService.exportCorridorsToCSV(countryFilter !== 'all' ? countryFilter : undefined)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `corridors_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      showSnackbar('Export started successfully', 'success')
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to export corridors', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle copy to clipboard
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showSnackbar(`Copied: ${text}`, 'success')
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      countryCode: '',
      active: true,
      createdBy: local_service?.get_staff_id() || 'APSNG26010500002',
      effectiveFromDate: '',
      effectiveToDate: '',
    })
    setDateErrors({ from: '', to: '' })
  }

  // Show snackbar
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setSnackbarOpen(true)
  }

  // Open edit dialog
  const handleOpenEditDialog = (row: CountryCorridorData) => {
    setSelectedRow(row)
    setEditFormData({
      countryCode: row.countryCode,
      active: row.active,
      modifiedBy: local_service?.get_staff_id() || 'APSNG26010500002',
      effectiveFromDate: row.effectiveFromDate.split('T')[0],
      effectiveToDate: row.effectiveToDate.split('T')[0],
    })
    setDateErrors({ from: '', to: '' })
    setOpenEditDialog(true)
  }

  // Open delete dialog
  const handleOpenDeleteDialog = (row: CountryCorridorData) => {
    setSelectedRow(row)
    setOpenDeleteDialog(true)
  }

  // Open view dialog
  const handleOpenViewDialog = (row: CountryCorridorData) => {
    setSelectedRow(row)
    setOpenViewDialog(true)
  }

  // Fetch corridor history
  const fetchCorridorHistory = async (corridorCode: string) => {
    setLoading(true)
    try {
      const history = await corridorService.getCorridorHistory(corridorCode)
      setCorridorHistory(history)
      setOpenHistoryDialog(true)
    } catch (err: any) {
      showSnackbar(`Failed to fetch history for ${corridorCode}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle select row
  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  // Handle select all
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(filteredRows.map((c) => c.countryCorridorCode))
    } else {
      setSelectedRows([])
    }
  }

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, corridorCode: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedMenuCorridor(corridorCode)
  }

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedMenuCorridor(null)
  }

  // Custom toolbar with CSV download

  // Columns definition
  const columns: GridColDef[] = [
    {
      field: 'serialNo',
      headerName: 'S. No',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'countryCorridorCode',
      headerName: 'Corridor Code',
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
          <Typography variant="body2">{params.value}</Typography>
        </Stack>
      ),
    },
    {
      field: 'active',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => <StatusChip active={params.value} />,
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
      renderCell: (params) => formatTableDate(params.value),
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'createdLocalDateTime',
      headerName: 'Created At',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => new Date(params.value).toLocaleString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenEditDialog(params.row)
              }}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ]

  // Effects
  useEffect(() => {
    fetchCorridors()
    fetchStats()
  }, [])

  const filter = createFilterOptions({
    matchFrom: 'any',
    stringify: (o: any) => `${o.countryName} ${o.countryCode}`,
  })

  useEffect(() => {
    applyFilters(rows)
  }, [rows, tabValue, countryFilter, statusFilter, searchTerm, sortBy, sortOrder, applyFilters])

  return (
    <Box p={3} sx={{ width: '100%', bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#0061B1' }}>
          Country Corridor Master
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm()
            setOpenCreateDialog(true)
          }}
          sx={{ backgroundColor: '#0061B1' }}
        >
          Add Corridor
        </Button>
      </Stack>

      {/* Tabs and Filters */}

      {/* Data Grid */}

      {/* <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.countryCorridorCode}
          autoHeight
          loading={loading}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{
  toolbar: {
    showQuickFilter: true,
    showDensitySelector: true, // 👈 THIS is missing
  },
}}
          // slotProps={{ toolbar: { showQuickFilter: true } }}
          // disableColumnMenu
          density="standard"
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page)
            setPageSize(model.pageSize)
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-cell': {
              fontSize: '13px',
              borderBottom: '1px solid #e0e0e0',
            },
            '& .MuiDataGrid-row:nth-of-type(even)': {
              backgroundColor: '#f9f9f9',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#e3f2fd',
            },
            '& .super-app-theme--header': {
              fontWeight: 'bold',
            },
          }}
        /> */}

      <DataGrid
        rows={filteredRows}
        columns={columns}
        getRowId={(row) => row.countryCorridorCode}
        autoHeight
        loading={loading}
        disableRowSelectionOnClick
        slots={{ toolbar: GridToolbar }}
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
      />

      {/* Create Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Create New Corridor</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Country Selection */}
            <Autocomplete
              options={countries?.filter((c: any) => c.status === 'A') || []}
              filterOptions={filter}
              getOptionLabel={(o: any) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c: any) => c.countryCode === formData.countryCode) || null}
              onChange={(_, val) => setFormData({ ...formData, countryCode: val ? val.countryCode : '' })}
              renderInput={(p) => (
                <TextField
                  {...p}
                  label="Country"
                  required
                  error={!formData.countryCode && formData.countryCode !== ''}
                  helperText={!formData.countryCode && formData.countryCode !== '' ? 'Country is required' : 'Select Active Country'}
                />
              )}
            />

            {/* Active Status */}

            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />}
                label="Active Status"
              />
            </Grid>

            {/* <TextField
              label="Effective From Date"
              type="date"
              value={formData.effectiveFromDate}
              onChange={(e) => {
                setFormData({ ...formData, effectiveFromDate: e.target.value })
                validateDates(e.target.value, formData.effectiveToDate)
              }}
              fullWidth
              size="small"
              required
              error={!!dateErrors.from}
              helperText={dateErrors.from}
              InputLabelProps={{ shrink: true }}
            />

          
            <TextField
              label="Effective To Date"
              type="date"
              value={formData.effectiveToDate}
              onChange={(e) => {
                setFormData({ ...formData, effectiveToDate: e.target.value })
                validateDates(formData.effectiveFromDate, e.target.value)
              }}
              fullWidth
              size="small"
              required
              error={!!dateErrors.to}
              helperText={dateErrors.to || (formData.effectiveToDate === '9999-12-31' ? 'Indefinite (∞)' : '')}
              InputLabelProps={{ shrink: true }}
            />
   */}
            <DynamicDatePicker
              label="Effective From"
              value={formData.effectiveFromDate}
              onChange={(val: string) => {
                console.log(val, 'kdjhchdvy')
                setFormData({ ...formData, effectiveFromDate: val })
              }}
              // error={!!errors.effectiveFromDate}
              // helperText={errors.effectiveFromDate}
              required
            />

            <DynamicEndDatePicker
              label="Effective To"
              value={formData.effectiveToDate}
              minDate={formData.effectiveFromDate}
              onChange={(val: string) => {
                setFormData({ ...formData, effectiveToDate: val })
              }}
              // error={!!errors.effectiveToDate}
              // helperText={errors.effectiveToDate}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateCorridor}
            disabled={loading || !formData.countryCode || !!dateErrors.from || !!dateErrors.to}
          >
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Edit Corridor: {selectedRow?.countryCorridorCode}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Country Selection (Read Only) */}
            <Autocomplete
              options={countries?.filter((c: any) => c.status === 'A') || []}
              filterOptions={filter}
              disabled={true}
              getOptionLabel={(o: any) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c: any) => c.countryCode === editFormData.countryCode) || null}
              renderInput={(p) => <TextField {...p} label="Country" required />}
            />

            {/* Active Status */}
            <FormControlLabel
              control={
                <Switch
                  checked={editFormData.active}
                  onChange={(e) => setEditFormData({ ...editFormData, active: e.target.checked })}
                  color="success"
                />
              }
              label="Active Status"
            />

            <DynamicDatePicker
              label="Effective From"
              value={formData.effectiveFromDate}
              onChange={(val: string) => {
                console.log(val, 'kdjhchdvy')
                setFormData({ ...formData, effectiveFromDate: val })
              }}
              // error={!!errors.effectiveFromDate}
              // helperText={errors.effectiveFromDate}
              required
            />

            <DynamicEndDatePicker
              label="Effective To"
              value={formData.effectiveToDate}
              minDate={formData.effectiveFromDate}
              onChange={(val: string) => {
                setFormData({ ...formData, effectiveToDate: val })
              }}
              // error={!!errors.effectiveToDate}
              // helperText={errors.effectiveToDate}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleUpdateCorridor} disabled={loading || !!dateErrors.from || !!dateErrors.to}>
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', color: '#b13e2d' }}>Deactivate Corridor</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Are you sure you want to deactivate corridor <strong>{selectedRow?.countryCorridorCode}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeactivateCorridor} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Corridor Details</DialogTitle>
        <DialogContent dividers>
          {selectedRow && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Basic Information
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Corridor Code:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedRow.countryCorridorCode}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Country:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedRow.countryCode}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Status:
                      </Typography>
                      <StatusChip active={selectedRow.active} />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Effective Period:
                      </Typography>
                      <Typography variant="body2">
                        {formatTableDate(selectedRow.effectiveFromDate)} →{' '}
                        {selectedRow.effectiveToDate?.includes('9999') ? '∞' : formatTableDate(selectedRow.effectiveToDate)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Audit Information
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Created By:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedRow.createdBy}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Created At:
                      </Typography>
                      <Typography variant="body2">{new Date(selectedRow.createdLocalDateTime).toLocaleString()}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Timezone:
                      </Typography>
                      <TimezoneChip timezone={selectedRow.createdTimezone} offset={selectedRow.createdOffset} />
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenViewDialog(false)
              handleOpenEditDialog(selectedRow!)
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ sx: { minWidth: 200 } }}>
        <MenuItem
          onClick={() => {
            handleCopyToClipboard(selectedMenuCorridor || '')
            handleMenuClose()
          }}
        >
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Code</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            fetchCorridorHistory(selectedMenuCorridor || '')
            handleMenuClose()
          }}
        >
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View History</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleOpenDeleteDialog(rows.find((r) => r.countryCorridorCode === selectedMenuCorridor)!)
            handleMenuClose()
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Deactivate</ListItemText>
        </MenuItem>
      </Menu>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default CountryCorridorPage
