import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Alert,
  AlertTitle,
  Snackbar,
  CircularProgress,
  Avatar,
  Divider,
  Badge,
  Menu,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel,
  FormControl,
  InputLabel,
  alpha,
} from '@mui/material'
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
  Info as InfoIcon,
} from '@mui/icons-material'

// Services and Types
import { CountryCorridorService } from '@/services/countryCorridor.service'
import {
  CountryCorridorData,
  CreateCorridorPayload,
  UpdateCorridorPayload,
  CorridorStats,
} from '@/types/countryCorridor.types'
import { TableIcon, ViewIcon } from 'lucide-react'

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
    }}
  />
)

// Timezone Chip Component
const TimezoneChip: React.FC<{ timezone: string; offset: string }> = ({ timezone, offset }) => {
  const displayName = timezone.split('/').pop()?.replace('_', ' ') || timezone
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
  const [corridors, setCorridors] = useState<CountryCorridorData[]>([])
  const [filteredCorridors, setFilteredCorridors] = useState<CountryCorridorData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  
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
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  
  // Selected corridor
  const [selectedCorridor, setSelectedCorridor] = useState<CountryCorridorData | null>(null)
  const [selectedCorridors, setSelectedCorridors] = useState<string[]>([])
  const [corridorHistory, setCorridorHistory] = useState<CountryCorridorData[]>([])
  
  // Form data
  const [formData, setFormData] = useState<CreateCorridorPayload>({
    countryCode: '',
    active: true,
    createdBy: 'APSNG26010500002',
    effectiveFromDate: '2026-01-01T00:00:00',
    effectiveToDate: '9999-12-31T00:00:00',
  })
  
  const [editFormData, setEditFormData] = useState<UpdateCorridorPayload>({
    countryCode: '',
    active: true,
    modifiedBy: 'APSNG26010500002',
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

  // View mode
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')

  // Fetch corridors
  const fetchCorridors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await corridorService.getAllCorridors()
      setCorridors(data)
      applyFilters(data)
      setTotalCount(data.length)
      
      const countries = [...new Set(data.map(c => c.countryCode))].sort()
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

  // Apply filters
  const applyFilters = useCallback((data: CountryCorridorData[]) => {
    let filtered = [...data]

    // Filter by tab
    if (tabValue === 1) filtered = filtered.filter(c => c.active === true)
    else if (tabValue === 2) filtered = filtered.filter(c => c.active === false)

    // Filter by country
    if (countryFilter !== 'all') {
      filtered = filtered.filter(c => c.countryCode === countryFilter)
    }

    // Filter by status
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active'
      filtered = filtered.filter(c => c.active === isActive)
    }

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c =>
        c.countryCorridorCode.toLowerCase().includes(term) ||
        c.countryCode.toLowerCase().includes(term) ||
        c.createdBy.toLowerCase().includes(term)
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

    setFilteredCorridors(filtered)
    setTotalCount(filtered.length)
  }, [tabValue, countryFilter, statusFilter, searchTerm, sortBy, sortOrder])

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

  // Handle create corridor
  const handleCreateCorridor = async () => {
    if (!formData.countryCode) {
      showSnackbar('Country code is required', 'error')
      return
    }
    
    setLoading(true)
    try {
      await corridorService.createCorridor(formData)
      showSnackbar('Corridor created successfully', 'success')
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
    if (!selectedCorridor) return
    
    setLoading(true)
    try {
      await corridorService.updateCorridor(
        selectedCorridor.countryCorridorCode,
        editFormData
      )
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
  const handleToggleStatus = async (corridorCode: string, currentStatus: boolean) => {
    setLoading(true)
    try {
      await corridorService.updateActiveStatus(corridorCode, !currentStatus)
      showSnackbar(
        `Corridor ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        'success'
      )
      fetchCorridors()
      fetchStats()
    } catch (err: any) {
      showSnackbar(err.message || `Failed to ${!currentStatus ? 'activate' : 'deactivate'} corridor`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle deactivate corridor
  const handleDeactivateCorridor = async () => {
    if (!selectedCorridor) return
    
    setLoading(true)
    try {
      await corridorService.deactivateCorridor(
        selectedCorridor.countryCorridorCode,
        'APSNG26010500002'
      )
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
      const blob = await corridorService.exportCorridorsToCSV(
        countryFilter !== 'all' ? countryFilter : undefined
      )
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
      createdBy: 'APSNG26010500002',
      effectiveFromDate: '2026-01-01T00:00:00',
      effectiveToDate: '9999-12-31T00:00:00',
    })
  }

  // Show snackbar
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setSnackbarOpen(true)
  }

  // Handle tab change
  const handleTabChange = (
    //@ts-ignore
    event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    setPage(0)
  }

  // Handle page change
  const handleChangePage = (
    
    //@ts-ignore
    event: unknown, newPage: number) => {
    setPage(newPage)
  }

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setPage(0)
  }

  // Handle country filter change
  const handleCountryFilterChange = (event: SelectChangeEvent) => {
    setCountryFilter(event.target.value)
    setPage(0)
  }

  // Handle status filter change
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value)
    setPage(0)
  }

  // Handle sort change
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
    setPage(0)
  }

  // Open edit dialog
  const handleOpenEditDialog = (corridor: CountryCorridorData) => {
    setSelectedCorridor(corridor)
    setEditFormData({
      countryCode: corridor.countryCode,
      active: corridor.active,
      modifiedBy: 'APSNG26010500002',
      effectiveFromDate: corridor.effectiveFromDate,
      effectiveToDate: corridor.effectiveToDate,
    })
    setOpenEditDialog(true)
  }

  // Open delete dialog
  const handleOpenDeleteDialog = (corridor: CountryCorridorData) => {
    setSelectedCorridor(corridor)
    setOpenDeleteDialog(true)
  }

  // Open view dialog
  const handleOpenViewDialog = (corridor: CountryCorridorData) => {
    setSelectedCorridor(corridor)
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

  // Handle select corridor
  const handleSelectCorridor = (corridorCode: string) => {
    setSelectedCorridors(prev =>
      prev.includes(corridorCode)
        ? prev.filter(c => c !== corridorCode)
        : [...prev, corridorCode]
    )
  }

  // Handle select all
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedCorridors(filteredCorridors.map(c => c.countryCorridorCode))
    } else {
      setSelectedCorridors([])
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

  // Effects
  useEffect(() => {
    fetchCorridors()
    fetchStats()
  }, [])

  useEffect(() => {
    applyFilters(corridors)
  }, [corridors, tabValue, countryFilter, statusFilter, searchTerm, sortBy, sortOrder, applyFilters])

  // Render table view
  const renderTableView = () => (
    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={
                  selectedCorridors.length > 0 &&
                  selectedCorridors.length < filteredCorridors.length
                }
                checked={
                  filteredCorridors.length > 0 &&
                  selectedCorridors.length === filteredCorridors.length
                }
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell onClick={() => handleSortChange('countryCorridorCode')} sx={{ cursor: 'pointer', fontWeight: 700 }}>
              Corridor Code
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Country</TableCell>
            <TableCell onClick={() => handleSortChange('active')} sx={{ cursor: 'pointer', fontWeight: 700 }}>
              Status
            </TableCell>
            <TableCell onClick={() => handleSortChange('effectiveFromDate')} sx={{ cursor: 'pointer', fontWeight: 700 }}>
              Effective Period
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Created By</TableCell>
            <TableCell onClick={() => handleSortChange('createdLocalDateTime')} sx={{ cursor: 'pointer', fontWeight: 700 }}>
              Created At
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Timezone</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && page === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading corridors...
                </Typography>
              </TableCell>
            </TableRow>
          ) : filteredCorridors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                <WarningIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No corridors found
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenCreateDialog(true)}
                  sx={{ mt: 3 }}
                >
                  Create New Corridor
                </Button>
              </TableCell>
            </TableRow>
          ) : (
            filteredCorridors
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow
                  key={row.countryCorridorCode}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleOpenViewDialog(row)}
                >
                  <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedCorridors.includes(row.countryCorridorCode)}
                      onChange={() => handleSelectCorridor(row.countryCorridorCode)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.countryCorridorCode}
                      size="small"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.dark',
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopyToClipboard(row.countryCorridorCode)
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontWeight={600}>{row.countryCode}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <StatusChip active={row.active} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(row.effectiveFromDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      → {row.effectiveToDate === '9999-12-31T00:00:00' ? '∞' : new Date(row.effectiveToDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {row.createdBy}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(row.createdLocalDateTime).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(row.createdLocalDateTime).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TimezoneChip
                      timezone={row.createdTimezone}
                      offset={row.createdOffset}
                    />
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenEditDialog(row)
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={row.active ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleStatus(row.countryCorridorCode, row.active)
                          }}
                        >
                          {row.active ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="History">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            fetchCorridorHistory(row.countryCorridorCode)
                          }}
                        >
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMenuOpen(e, row.countryCorridorCode)
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  )

  // Render card view
  const renderCardView = () => (
    <Grid container spacing={3}>
      {filteredCorridors
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((corridor) => (
          <Grid item xs={12} sm={6} md={4} key={corridor.countryCorridorCode}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: corridor.active
                  ? alpha(theme.palette.success.main, 0.2)
                  : alpha(theme.palette.error.main, 0.2),
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 4,
                },
              }}
              onClick={() => handleOpenViewDialog(corridor)}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Chip
                      label={corridor.countryCorridorCode}
                      size="small"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.dark',
                      }}
                    />
                    <StatusChip active={corridor.active} />
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.info.main, 0.12), color: 'info.main' }}>
                      <FlagIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {corridor.countryCode}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Stack direction="row" justifyContent="space-between">
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Effective From
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {new Date(corridor.effectiveFromDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        To
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {corridor.effectiveToDate === '9999-12-31T00:00:00' ? '∞' : new Date(corridor.effectiveToDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Created By
                      </Typography>
                      <Typography variant="body2">{corridor.createdBy}</Typography>
                    </Box>
                    <TimezoneChip
                      timezone={corridor.createdTimezone}
                      offset={corridor.createdOffset}
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
    </Grid>
  )

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: 4 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(145deg, #ffffff, #f5faff)',
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <PublicIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" color="secondary.main" fontWeight={700}>
                  Country Corridor Master
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" mt={0.5}>
                  <Chip
                    icon={<CloudSyncIcon />}
                    label="Staging · localhost:8087"
                    size="small"
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }}
                  />
                  <Chip label="v2.1.6" size="small" sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.08), color: 'secondary.main' }} />
                </Stack>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportCSV} sx={{ borderRadius: 40 }}>
                Export
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreateDialog(true)} sx={{ borderRadius: 40 }}>
                New Corridor
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Total Corridors
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color="secondary.main">
                      {stats.total}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                      <Chip label={`${stats.active} active`} size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.08), color: 'success.main' }} />
                      <Chip label={`${stats.inactive} inactive`} size="small" sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), color: 'error.main' }} />
                    </Stack>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), width: 56, height: 56 }}>
                    <RouteIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Countries
                    </Typography>
                    <Typography variant="h3" fontWeight={700} color="secondary.main">
                      {stats.countries}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1} noWrap>
                      {stats.countryList.slice(0, 3).join(', ')}
                      {stats.countryList.length > 3 && ` +${stats.countryList.length - 3}`}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.12), width: 56, height: 56 }}>
                    <FlagIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Created By
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="secondary.main">
                      APSNG260105
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Primary creator
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.12), width: 56, height: 56 }}>
                    <PersonIcon sx={{ color: 'warning.main', fontSize: 28 }} />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Effective From
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="secondary.main">
                      2026-01-01
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      → 9999-12-31 (∞)
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.12), width: 56, height: 56 }}>
                    <CalendarIcon sx={{ color: 'info.main', fontSize: 28 }} />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs and Filters */}
        <Paper elevation={0} sx={{ mb: 3, borderRadius: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                px: 2,
                '& .MuiTab-root': {
                  borderRadius: 40,
                  minHeight: 48,
                  px: 3,
                  fontWeight: 600,
                },
                '& .Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                },
              }}
            >
              <Tab icon={<RouteIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={`All (${stats.total})`} />
              <Tab icon={<CheckCircleIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={`Active (${stats.active})`} />
              <Tab icon={<CancelIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={`Inactive (${stats.inactive})`} />
            </Tabs>
          </Box>

          <Box sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flex={1}>
                <TextField
                  size="small"
                  placeholder="Search by code, country, creator..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  sx={{ minWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: 40 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Country</InputLabel>
                  <Select value={countryFilter} label="Country" onChange={handleCountryFilterChange} sx={{ borderRadius: 40 }}>
                    <MenuItem value="all">All Countries</MenuItem>
                    {uniqueCountries.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={statusFilter} label="Status" onChange={handleStatusFilterChange} sx={{ borderRadius: 40 }}>
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>

                <IconButton
                  onClick={() => setShowFilters(!showFilters)}
                  color={showFilters ? 'primary' : 'default'}
                  sx={{ borderRadius: 40, border: '1px solid', borderColor: showFilters ? 'primary.main' : 'divider' }}
                >
                  <FilterIcon />
                </IconButton>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Tooltip title="Table View">
                  <IconButton
                    onClick={() => setViewMode('table')}
                    color={viewMode === 'table' ? 'primary' : 'default'}
                    sx={{ borderRadius: 40 }}
                  >
                    <TableIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Card View">
                  <IconButton
                    onClick={() => setViewMode('card')}
                    color={viewMode === 'card' ? 'primary' : 'default'}
                    sx={{ borderRadius: 40 }}
                  >
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Refresh">
                  <IconButton onClick={fetchCorridors} sx={{ borderRadius: 40 }} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            {/* Advanced Filters */}
            {showFilters && (
              <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Advanced Filters
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Sort By</InputLabel>
                      <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)} sx={{ borderRadius: 40 }}>
                        <MenuItem value="createdLocalDateTime">Created Date</MenuItem>
                        <MenuItem value="countryCorridorCode">Corridor Code</MenuItem>
                        <MenuItem value="countryCode">Country Code</MenuItem>
                        <MenuItem value="effectiveFromDate">Effective From</MenuItem>
                        <MenuItem value="active">Status</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button size="small" onClick={resetFilters} startIcon={<ClearIcon />} sx={{ borderRadius: 40 }}>
                        Reset All
                      </Button>
                      <Button size="small" variant="contained" onClick={() => applyFilters(corridors)} startIcon={<DoneIcon />} sx={{ borderRadius: 40 }}>
                        Apply Filters
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Main Content */}
        {loading && page === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {viewMode === 'table' ? renderTableView() : renderCardView()}
            {viewMode === 'card' && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <TablePagination
                  rowsPerPageOptions={[6, 12, 24, 48]}
                  component="div"
                  count={totalCount}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            )}
          </>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mt: 3, borderRadius: 3 }} onClose={() => setError(null)}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {/* Create Dialog */}
        <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={700} color="secondary.main">
                Create New Corridor
              </Typography>
              <IconButton onClick={() => setOpenCreateDialog(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Country Code *</InputLabel>
                    <Select
                      value={formData.countryCode}
                      label="Country Code *"
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="IN">India (IN)</MenuItem>
                      <MenuItem value="NG">Nigeria (NG)</MenuItem>
                      <MenuItem value="ZA">South Africa (ZA)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        color="success"
                      />
                    }
                    label="Active Status"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Created By"
                    value={formData.createdBy}
                    onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                    fullWidth
                    size="small"
                    sx={{ borderRadius: 2 }}
                    required
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenCreateDialog(false)} sx={{ borderRadius: 40 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleCreateCorridor}
              disabled={loading || !formData.countryCode}
              sx={{ borderRadius: 40 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Corridor'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ bgcolor: alpha(theme.palette.warning.main, 0.02) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={700} color="secondary.main">
                Edit Corridor: {selectedCorridor?.countryCorridorCode}
              </Typography>
              <IconButton onClick={() => setOpenEditDialog(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Country Code"
                    value={editFormData.countryCode}
                    onChange={(e) => setEditFormData({ ...editFormData, countryCode: e.target.value })}
                    fullWidth
                    size="small"
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
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
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Modified By"
                    value={editFormData.modifiedBy}
                    onChange={(e) => setEditFormData({ ...editFormData, modifiedBy: e.target.value })}
                    fullWidth
                    size="small"
                    sx={{ borderRadius: 2 }}
                    required
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenEditDialog(false)} sx={{ borderRadius: 40 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="warning"
              startIcon={<SaveIcon />}
              onClick={handleUpdateCorridor}
              disabled={loading}
              sx={{ borderRadius: 40 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Update Corridor'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ bgcolor: alpha(theme.palette.error.main, 0.02) }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.12), color: 'error.main' }}>
                <WarningIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={700} color="error.main">
                Deactivate Corridor
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to deactivate corridor <strong>{selectedCorridor?.countryCorridorCode}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDeleteDialog(false)} sx={{ borderRadius: 40 }}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleDeactivateCorridor} disabled={loading} sx={{ borderRadius: 40 }}>
              {loading ? <CircularProgress size={24} /> : 'Deactivate'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ bgcolor: alpha(theme.palette.info.main, 0.02) }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.12), color: 'info.main' }}>
                  <RouteIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="secondary.main">
                    Corridor Details
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedCorridor?.countryCorridorCode}
                  </Typography>
                </Box>
              </Stack>
              <IconButton onClick={() => setOpenViewDialog(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            {selectedCorridor && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Basic Information
                      </Typography>
                      <Stack spacing={2} sx={{ mt: 2 }}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Corridor Code
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {selectedCorridor.countryCorridorCode}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Country
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {selectedCorridor.countryCode}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Status
                          </Typography>
                          <StatusChip active={selectedCorridor.active} />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Effective Period
                          </Typography>
                          <Typography variant="body2">
                            {new Date(selectedCorridor.effectiveFromDate).toLocaleDateString()} →{' '}
                            {selectedCorridor.effectiveToDate === '9999-12-31T00:00:00' ? '∞' : new Date(selectedCorridor.effectiveToDate).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Audit Information
                      </Typography>
                      <Stack spacing={2} sx={{ mt: 2 }}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Created By
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {selectedCorridor.createdBy}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Created At
                          </Typography>
                          <Typography variant="body2">
                            {new Date(selectedCorridor.createdLocalDateTime).toLocaleString()}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Timezone
                          </Typography>
                          <TimezoneChip
                            timezone={selectedCorridor.createdTimezone}
                            offset={selectedCorridor.createdOffset}
                          />
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => { setOpenViewDialog(false); if (selectedCorridor) handleOpenEditDialog(selectedCorridor); }} startIcon={<EditIcon />} sx={{ borderRadius: 40 }}>
              Edit
            </Button>
            <Button onClick={() => setOpenViewDialog(false)} variant="contained" sx={{ borderRadius: 40 }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{ sx: { borderRadius: 2, minWidth: 200 } }}
        >
          <MenuItem onClick={() => { 
            const corridor = corridors.find(c => c.countryCorridorCode === selectedMenuCorridor)
            if (corridor) handleCopyToClipboard(corridor.countryCorridorCode)
            handleMenuClose()
          }}>
            <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Copy Code</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            const corridor = corridors.find(c => c.countryCorridorCode === selectedMenuCorridor)
            if (corridor) fetchCorridorHistory(corridor.countryCorridorCode)
            handleMenuClose()
          }}>
            <ListItemIcon><HistoryIcon fontSize="small" /></ListItemIcon>
            <ListItemText>View History</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {
            const corridor = corridors.find(c => c.countryCorridorCode === selectedMenuCorridor)
            if (corridor) handleOpenDeleteDialog(corridor)
            handleMenuClose()
          }} sx={{ color: 'error.main' }}>
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
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
    </ThemeProvider>
  )
}

export default CountryCorridorPage