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
  Tooltip,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Autocomplete,
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  Update as UpdateIcon,
  Category as CategoryIcon,
} from '@mui/icons-material'
import CountryLabelCodesService, { CountryLabelCode, CombinedCountryLabelOption } from '../../services/country-label-codes.service'
import CountryBusinessPayoutPartnerService, { CountryBusinessPayoutPartner } from '../../services/countryBusinessPayoutPartner.service'
import BopCategoryService from '../../services/bop.category.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { countyState } from '@/states/state'
import { useRecoilState } from 'recoil'
import ChannelService from '@/services/channel.servive'
import { CountryData } from '@/types/static.type'
import dayjs from 'dayjs'

const countryLabelCodesService = new CountryLabelCodesService()
const countryBusinessPayoutPartnerService = new CountryBusinessPayoutPartnerService()
const bopCategoryService = new BopCategoryService()

export interface BopCategory {
  bopPurposeCategoryCode: string
  bopCategoryType: string
  bopCategoryDescription: string
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string | null
  modifiedBy: string | null
  createdLocalDateTime: string
  createdTimeZone: string
  createdOffset: string
  modifiedLocalDateTime: string | null
  modifiedTimeZone: string | null
  modifiedOffset: string | null
  createdUtcDateTime: string
  modifiedUtcDateTime: string | null
  effectiveDateValid: boolean
}

export default function CountryLabelCodesGridPage() {
  const [rows, setRows] = useState<CountryLabelCode[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<CountryLabelCode | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [countries] = useRecoilState(countyState)
  const [channels, setChannels] = useState<any[]>([])
  const [allRailPayoutMappings, setAllRailPayoutMappings] = useState<CountryBusinessPayoutPartner[]>([])
  const [filteredRailPayoutMappings, setFilteredRailPayoutMappings] = useState<CountryBusinessPayoutPartner[]>([])
  const [bopCategories, setBopCategories] = useState<BopCategory[]>([])
  const [filteredBopCategories, setFilteredBopCategories] = useState<BopCategory[]>([])
  const [loadingRailMappings, setLoadingRailMappings] = useState(false)
  const [loadingBopCategories, setLoadingBopCategories] = useState(false)

  const [form, setForm] = useState({
    countryCode: '',
    railPayoutMappingCode: '',
    countryReportingCode: '',
    channel: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '2027-01-01T00:00:00',
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  const local_service = new LocalStorageService()
  const user = local_service?.get_user()

  const showSuccess = (msg: string) => setSnackbar({ open: true, message: msg, severity: 'success' })

  const showError = (msg: string) => setSnackbar({ open: true, message: msg, severity: 'error' })

  useEffect(() => {
    loadData()
    loadChannels()
    loadAllRailPayoutMappings()
    loadBopCategories()
  }, [])

  // Filter rail payout mappings when country changes
  useEffect(() => {
    if (form.countryCode && allRailPayoutMappings.length > 0) {
      filterRailPayoutMappingsByCountry(form.countryCode)
    } else {
      setFilteredRailPayoutMappings([])
    }
  }, [form.countryCode, allRailPayoutMappings])

  // Filter BOP categories based on selected country
  useEffect(() => {
    console.log(form.countryCode)
    console.log(bopCategories)
    if (form.countryCode && bopCategories.length > 0) {
      console.log(form.countryCode)
      filterBopCategoriesByCountry(form.countryCode)
    } else {
      setFilteredBopCategories([])
    }
  }, [form.countryCode, bopCategories])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await countryLabelCodesService.getAll()
      setRows(data)
    } catch (error) {
      showError('Failed to load country label codes')
    } finally {
      setLoading(false)
    }
  }

  const loadChannels = async () => {
    try {
      const channelService = new ChannelService()
      const data = await channelService.getChannelList()
      setChannels(Array.isArray(data) ? data : [])
    } catch (error) {
      showError('Failed to load channels')
    }
  }

  const loadAllRailPayoutMappings = async () => {
    try {
      setLoadingRailMappings(true)
      const result = await countryBusinessPayoutPartnerService.getAll()
      console.log('All Rail Payout Mappings:', result)
      setAllRailPayoutMappings(Array.isArray(result) ? result : [])
    } catch (error) {
      showError('Failed to load rail payout mappings')
    } finally {
      setLoadingRailMappings(false)
    }
  }

  const loadBopCategories = async () => {
    try {
      setLoadingBopCategories(true)
      const result = await bopCategoryService.getAll()
      console.log('BOP Categories Response:', result)

      if (Array.isArray(result)) {
        setBopCategories(result)
      } else {
        setBopCategories([])
      }
    } catch (error) {
      console.error('Failed to load BOP categories:', error)
      showError('Failed to load BOP categories')
    } finally {
      setLoadingBopCategories(false)
    }
  }

  const filterRailPayoutMappingsByCountry = (countryCode: string) => {
    try {
      // Assuming rail payout mapping code contains country code at the beginning
      // Example: "INMCBRPZA0005" starts with "IN"
      const filtered = allRailPayoutMappings.filter((mapping) => {
        // Check if mapping code starts with country code
        if (mapping.countryBusinessPayoutPartnerCode.startsWith(countryCode)) {
          return true
        }

        // Also check if there's countryCorridorBusinessMapCode that contains country
        if (mapping.countryCorridorBusinessMapCode && mapping.countryCorridorBusinessMapCode.includes(countryCode)) {
          return true
        }

        return false
      })

      setFilteredRailPayoutMappings(filtered)

      // If current railPayoutMappingCode is not in filtered list, clear it
      if (form.railPayoutMappingCode && !filtered.some((m) => m.countryBusinessPayoutPartnerCode === form.railPayoutMappingCode)) {
        setForm((prev) => ({ ...prev, railPayoutMappingCode: '' }))
      }
    } catch (error) {
      console.error('Error filtering rail payout mappings:', error)
      setFilteredRailPayoutMappings([])
    }
  }

  const filterBopCategoriesByCountry = (countryCode: string) => {
    try {
      console.log(bopCategories)
      const filtered = bopCategories.filter((category) => {
        //@ts-ignore
        return  category?.countryCode == countryCode
      })

      console.log(filtered)

      setFilteredBopCategories(filtered)

      // If current countryReportingCode is not in filtered list, clear it
      if (form.countryReportingCode && !filtered.some((c) => c.bopPurposeCategoryCode === form.countryReportingCode)) {
        setForm((prev) => ({ ...prev, countryReportingCode: '' }))
      }
    } catch (error) {
      console.error('Error filtering BOP categories:', error)
      setFilteredBopCategories([])
    }
  }

  const handleCreate = () => {
    setSelected(null)
    setForm({
      countryCode: '',
      railPayoutMappingCode: '',
      countryReportingCode: '',
      channel: '',
      active: true,
      effectiveFromDate: '',
      effectiveToDate: '',
    })
    setOpen(true)
  }

  const handleEdit = (row: CountryLabelCode) => {
    setSelected(row)
    setForm({
      countryCode: row.countryCode || '',
      railPayoutMappingCode: row.railPayoutMappingCode || '',
      countryReportingCode: row.countryReportingCode || '',
      channel: row.channel || '',
      active: row.active ?? true,
      effectiveFromDate: row.effectiveFromDate || '',
      effectiveToDate: row.effectiveToDate || '',
    })
    setOpen(true)
  }

  const handleDelete = async (countryLabelCode: string) => {
    if (window.confirm('Are you sure you want to delete this country label code?')) {
      try {
        const result = await countryLabelCodesService.delete(countryLabelCode)
        if (result.status) {
          showSuccess('Country label code deleted successfully')
          loadData()
        } else {
          showError(result.message)
        }
      } catch (error) {
        showError('Failed to delete country label code')
      }
    }
  }

  const handleCountryChange = (countryCode: string) => {
    setForm((prev) => ({
      ...prev,
      countryCode,
      railPayoutMappingCode: '', // Clear rail payout mapping when country changes
      countryReportingCode: '', // Clear BOP category when country changes
    }))
  }

  const handleSubmit = async () => {
    // Validation
    if (!form.countryCode || !form.railPayoutMappingCode || !form.countryReportingCode || !form.channel || !form.effectiveFromDate) {
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
      console.log(payload)
      console.log(selected)
      if (selected && selected.countryLabelCode) {
        // Update
        const updatePayload = {
          ...payload,
          countryLabelCode: selected.countryLabelCode,
        }
        const result = await countryLabelCodesService.update(updatePayload, selected?.countryLabelCode)
        if (result.status) {
          showSuccess('Country label code updated successfully')
          setOpen(false)
          loadData()
        } else {
          showError(result.message)
        }
      } else {
        // Create
        const result = await countryLabelCodesService.create(payload)
        if (result.status) {
          showSuccess('Country label code created successfully')
          setOpen(false)
          loadData()
        } else {
          showError(result.message)
        }
      }
    } catch (error) {
      console.log(error)
      showError(selected ? 'Failed to update country label code' : 'Failed to create country label code')
    }
  }

  // Filter rows based on search term
  const filteredRows = rows.filter((row) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    const country = countries.find((c) => c.countryCode === row.countryCode)?.countryName?.toLowerCase() || ''
    const railMapping = allRailPayoutMappings.find((r) => r.countryBusinessPayoutPartnerCode === row.railPayoutMappingCode)
    const railInfo = railMapping ? `${railMapping.businessTypeCode} ${railMapping.payoutPartner}`.toLowerCase() : ''

    // Find BOP category details
    const bopCategory = bopCategories.find((c) => c.bopPurposeCategoryCode === row.countryReportingCode)
    const bopInfo = bopCategory ? `${bopCategory.bopCategoryType} ${bopCategory.bopCategoryDescription}`.toLowerCase() : ''

    return (
      row.countryLabelCode?.toLowerCase().includes(searchLower) ||
      row.countryCode.toLowerCase().includes(searchLower) ||
      country.includes(searchLower) ||
      row.railPayoutMappingCode.toLowerCase().includes(searchLower) ||
      railInfo.includes(searchLower) ||
      row.countryReportingCode.toLowerCase().includes(searchLower) ||
      bopInfo.includes(searchLower) ||
      row.channel.toLowerCase().includes(searchLower)
    )
  })
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
    {
      field: 'countryLabelCode',
      headerName: 'Label Code',
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'countryCode',
      headerName: 'Country',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: GridRenderCellParams) => {
        const country = countries.find((c) => c.countryCode === params.value)
        return (
          <Box>
            <Typography variant="body2">{params.value}</Typography>
            <Typography variant="caption" color="textSecondary">
              {country?.countryName || 'N/A'}
            </Typography>
          </Box>
        )
      },
    },
    {
      field: 'railPayoutMappingCode',
      headerName: 'Rail Payout Mapping',
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: GridRenderCellParams) => {
        const railMapping = allRailPayoutMappings.find((r) => r.countryBusinessPayoutPartnerCode === params.value)
        return (
          <Box>
            <Typography variant="body2" noWrap>
              {params.value}
            </Typography>
            {railMapping && (
              <Typography variant="caption" color="textSecondary">
                {railMapping.businessTypeCode}/{railMapping.payoutPartner}
              </Typography>
            )}
          </Box>
        )
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
      field: 'countryReportingCode',
      headerName: 'Reporting Code',
      flex: 1.2,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: GridRenderCellParams) => {
        const bopCategory = bopCategories.find((c) => c.bopPurposeCategoryCode === params.value)
        return (
          <Box>
            <Typography variant="body2">{params.value}</Typography>
            {bopCategory && (
              <Typography variant="caption" color="textSecondary" noWrap>
                {bopCategory.bopCategoryType}
              </Typography>
            )}
          </Box>
        )
      },
    },
    {
      field: 'channel',
      headerName: 'Channel',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: GridRenderCellParams) => <Chip label={params.value} size="small" color="secondary" variant="outlined" />,
    },
    {
      field: 'active',
      headerName: 'Status',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value ? 'Active' : 'Inactive'} size="small" color={params.value ? 'success' : 'error'} variant="outlined" />
      ),
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
      flex: 1,
      headerClassName: 'super-app-theme--header',
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit">
            <IconButton size="small" color="primary" onClick={() => handleEdit(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ]

  // Get country name by code
  const getCountryName = (countryCode: string) => {
    const country = countries.find((c) => c.countryCode === countryCode)
    return country?.countryName || countryCode
  }

  // Get rail payout mapping details
  const getRailPayoutMappingInfo = (code: string) => {
    const mapping = allRailPayoutMappings.find((r) => r.countryBusinessPayoutPartnerCode === code)
    if (!mapping) return code
    return `${code} (${mapping.businessTypeCode}/${mapping.payoutPartner})`
  }

  // Get BOP category details
  const getBopCategoryInfo = (code: string) => {
    const category = bopCategories.find((c) => c.bopPurposeCategoryCode === code)
    if (!category) return code
    return `${code} - ${category.bopCategoryType}`
  }

  return (
    <Box sx={{ height: '100vh', p: 3 }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">
          <b>Country Label Codes</b>
        </Typography>
        <Button variant="contained" onClick={handleCreate} startIcon={<UpdateIcon />}>
          + Create Label Code
        </Button>
      </Stack>

      {/* Search Bar */}
      {/* <TextField
        fullWidth
        placeholder="Search by label code, country, rail mapping, or reporting code..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      /> */}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="h6">{rows.length}</Typography>
            <Typography variant="body2">Total Label Codes</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
            <Typography variant="h6">{rows.filter((r) => r.active).length}</Typography>
            <Typography variant="body2">Active Codes</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
            <Typography variant="h6">{[...new Set(rows.map((r) => r.countryCode))].length}</Typography>
            <Typography variant="body2">Countries</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
            <Typography variant="h6">{[...new Set(rows.map((r) => r.channel))].length}</Typography>
            <Typography variant="body2">Channels</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.countryLabelCode || `${row.countryCode}-${row.railPayoutMappingCode}`}
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
          {selected ? 'Edit Country Label Code' : 'Create New Country Label Code'}
          {selected && (
            <Typography variant="caption" display="block" color="textSecondary">
              ID: {selected.countryLabelCode}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Auto-generated Code Preview */}
            {selected && (
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Generated Label Code:
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selected.countryLabelCode}
                </Typography>
              </Paper>
            )}

            {/* Country Code */}
            <FormControl fullWidth required>
              <InputLabel>Country Code *</InputLabel>
              <Select value={form.countryCode} label="Country Code *" onChange={(e) => handleCountryChange(e.target.value)}>
                {countries
                  .filter((country) => country.status === 'A')
                  .map((country: CountryData) => (
                    <MenuItem
                      //@ts-ignore
                      key={country.countryCode}
                      value={country.countryCode}
                    >
                      <Box>
                        <Typography variant="body2">{country.countryCode}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {country.countryName}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {/* Rail Payout Mapping Code */}
            <FormControl fullWidth required>
              <InputLabel>Rail Payout Mapping Code *</InputLabel>
              <Select
                value={form.railPayoutMappingCode}
                label="Rail Payout Mapping Code *"
                onChange={(e) => setForm({ ...form, railPayoutMappingCode: e.target.value })}
                startAdornment={
                  form.railPayoutMappingCode && (
                    <InputAdornment position="start">
                      <BusinessIcon fontSize="small" />
                    </InputAdornment>
                  )
                }
                disabled={!form.countryCode || loadingRailMappings || filteredRailPayoutMappings.length === 0}
              >
                {loadingRailMappings ? (
                  <MenuItem disabled>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography>Loading rail mappings...</Typography>
                    </Box>
                  </MenuItem>
                ) : filteredRailPayoutMappings.length === 0 ? (
                  <MenuItem disabled>
                    {form.countryCode ? `No rail payout mappings found for ${getCountryName(form.countryCode)}` : 'Please select a country first'}
                  </MenuItem>
                ) : (
                  filteredRailPayoutMappings
                    .filter((mapping) => mapping.active)
                    .map((mapping) => (
                      <MenuItem key={mapping.countryBusinessPayoutPartnerCode} value={mapping.countryBusinessPayoutPartnerCode}>
                        <Box>
                          <Typography variant="body2">{mapping.countryBusinessPayoutPartnerCode}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            Business: {mapping.businessTypeCode} | Payout: {mapping.payoutPartner}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                )}
              </Select>
              {form.countryCode && filteredRailPayoutMappings.length === 0 && !loadingRailMappings && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                  No active rail payout mappings found for {getCountryName(form.countryCode)}. Please add mappings in the Country Business Payout
                  Partner section first.
                </Typography>
              )}
            </FormControl>

            {/* Country Reporting Code (BOP Category) */}
            <FormControl fullWidth required>
              <InputLabel>Country Reporting Code (BOP Category) *</InputLabel>
              <Select
                value={form.countryReportingCode}
                label="Country Reporting Code (BOP Category) *"
                onChange={(e) => setForm({ ...form, countryReportingCode: e.target.value })}
                startAdornment={
                  form.countryReportingCode && (
                    <InputAdornment position="start">
                      <CategoryIcon fontSize="small" />
                    </InputAdornment>
                  )
                }
                disabled={!form.countryCode || loadingBopCategories || filteredBopCategories.length === 0}
              >
                {loadingBopCategories ? (
                  <MenuItem disabled>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography>Loading BOP categories...</Typography>
                    </Box>
                  </MenuItem>
                ) : filteredBopCategories.length === 0 ? (
                  <MenuItem disabled>
                    {form.countryCode ? `No BOP categories found for ${getCountryName(form.countryCode)}` : 'Please select a country first'}
                  </MenuItem>
                ) : (
                  filteredBopCategories.map((category) => (
                    <MenuItem key={category.bopPurposeCategoryCode} value={category.bopPurposeCategoryCode}>
                      <Box>
                        <Typography variant="body2">{category.bopPurposeCategoryCode}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {category.bopCategoryType} - {category.bopCategoryDescription}
                        </Typography>
                        <Typography variant="caption" display="block" color={category.effectiveDateValid ? 'success' : 'error'}>
                          {category.effectiveDateValid ? 'Active' : 'Inactive'} |{new Date(category.effectiveFromDate).toLocaleDateString()} -{' '}
                          {new Date(category.effectiveToDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
              {form.countryCode && filteredBopCategories.length === 0 && !loadingBopCategories && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                  No active BOP categories found for {getCountryName(form.countryCode)}. Please add BOP categories first.
                </Typography>
              )}
            </FormControl>

            {/* Channel */}
            <FormControl fullWidth required>
              <InputLabel>Channel *</InputLabel>
              <Select value={form.channel} label="Channel *" onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                {channels
                  .filter((ch: any) => ch.active === true)
                  .map((channel: any) => (
                    <MenuItem key={channel.channel_code} value={channel.channel_code}>
                      {channel.channel_name || channel.channel_code}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <Divider>Effective Dates</Divider>

            {/* Effective Dates */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Effective From *"
                  value={form.effectiveFromDate ? form.effectiveFromDate.split('T')[0] : ''}
                  onChange={(e) => setForm({ ...form, effectiveFromDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Effective To"
                  value={form.effectiveToDate ? form.effectiveToDate.split('T')[0] : ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      effectiveToDate: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: form.effectiveFromDate ? form.effectiveFromDate.split('T')[0] : undefined,
                  }}
                />
              </Grid>
            </Grid>

            {/* Active Status */}
            <FormControlLabel
              control={<Switch checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
              label="Active"
            />

            {/* Preview Section */}
            {(form.countryCode || form.railPayoutMappingCode || form.countryReportingCode) && (
              <>
                <Divider>Preview</Divider>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Field</TableCell>
                        <TableCell>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Country</TableCell>
                        <TableCell>{getCountryName(form.countryCode)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Rail Payout Mapping</TableCell>
                        <TableCell>{getRailPayoutMappingInfo(form.railPayoutMappingCode)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>BOP Category</TableCell>
                        <TableCell>{getBopCategoryInfo(form.countryReportingCode)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Channel</TableCell>
                        <TableCell>{form.channel}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Generated Code</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {`${form.countryCode}${form.railPayoutMappingCode}${form.countryReportingCode}${form.channel}`}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!form.countryCode || !form.railPayoutMappingCode || !form.countryReportingCode || !form.channel || !form.effectiveFromDate}
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
  )
}
