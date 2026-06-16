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
} from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material'
import CountryLabelFieldsService, { CountryLabelField } from '../../services/country-label-fields.service'
import ChannelService from '@/services/channel.servive'
import ScreenService from '@/services/screen.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import dayjs from 'dayjs'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import { formatTableDate } from '@/helpers/dateformate'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'

const countryLabelFieldsService = new CountryLabelFieldsService()
const helper = new HelperService()

export default function CountryLabelFieldsGridPage() {
  const [rows, setRows] = useState<CountryLabelField[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<CountryLabelField | null>(null)
  const [screens, setScreens] = useState<any[]>([])
  const [channels, setChannels] = useState<any[]>([])

  const [form, setForm] = useState({
    channelCode: '',
    screen: '',
    fieldName: '',
    label: '',
    description: '',
    minLength: 2,
    maxLength: 50,
    dataType: 'STRING',
    validationRequired: 'Y' as 'Y' | 'N',
    validationMessageMandatory: '',
    validationMessageOptional: '',
    validationRegex: '',
    validationMessageError: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '9999-12-31T00:00:00',
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
    fetchScreens()
    fetchChannels()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await countryLabelFieldsService.getAll()
      console.log(data)
      setRows(data)
    } catch (error) {
      showError('Failed to load fields')
    } finally {
      setLoading(false)
    }
  }

  const fetchScreens = async () => {
    try {
      const screen_service = new ScreenService()
      const data = await screen_service.getScreenList()
      setScreens(Array.isArray(data) ? data : [])
    } catch (error) {
      showError('Failed to load screens')
    }
  }

  const fetchChannels = async () => {
    try {
      const channel_service = new ChannelService()
      const data = await channel_service.getChannelList()
      setChannels(Array.isArray(data) ? data : [])
    } catch (error) {
      showError('Failed to load channels')
    }
  }

  const handleCreate = () => {
    setSelected(null)
    setForm({
      channelCode: '',
      screen: '',
      fieldName: '',
      label: '',
      description: '',
      minLength: 2,
      maxLength: 50,
      dataType: 'STRING',
      validationRequired: 'Y',
      validationMessageMandatory: '',
      validationMessageOptional: '',
      validationRegex: '',
      validationMessageError: '',
      active: true,
      effectiveFromDate: '',
      effectiveToDate: '',
    })
    setOpen(true)
  }

  const handleEdit = (row: CountryLabelField) => {
    setSelected(row)
    setForm({
      channelCode: row.channelCode || '',
      screen: row.screen || '',
      fieldName: row.fieldName || '',
      label: row.label || '',
      description: row.description || '',
      minLength: row.minLength || 2,
      maxLength: row.maxLength || 50,
      dataType: row.dataType || 'STRING',
      validationRequired: row.validationRequired || 'Y',
      validationMessageMandatory: row.validationMessageMandatory || '',
      validationMessageOptional: row.validationMessageOptional || '',
      validationRegex: row.validationRegex || '',
      validationMessageError: row.validationMessageError || '',
      active: row.active ?? true,
      effectiveFromDate: row.effectiveFromDate || '',
      effectiveToDate: row.effectiveToDate || '9999-12-31T00:00:00',
    })
    setOpen(true)
  }

  const handleDelete = async (fieldLabelCode: string) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        const result = await countryLabelFieldsService.delete(fieldLabelCode)
        if (result.status) {
          showSuccess('Field deleted successfully')
          loadData()
        } else {
          showError(result.message)
        }
      } catch (error) {
        showError('Failed to delete field')
      }
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!form.channelCode || !form.screen || !form.fieldName || !form.label) {
      showError('Please fill all required fields')
      return
    }

    if (form.minLength < 0 || form.maxLength < 0) {
      showError('Length values cannot be negative')
      return
    }

    if (form.minLength > form.maxLength) {
      showError('Min length cannot be greater than max length')
      return
    }

    try {
      const payload = {
        ...form,
        createdBy: local_service.get_staff_id() || 'ADMIN',
        modifiedBy: selected ? local_service.get_staff_id() || 'ADMIN' : undefined,
        effectiveFromDate: form.effectiveFromDate ? new Date(form.effectiveFromDate).toISOString() : null,
        effectiveToDate: form.effectiveToDate ? new Date(form.effectiveToDate).toISOString() : null,
      }

      if (selected) {
        // Update

        //@ts-ignore
        const result = await countryLabelFieldsService.update(selected.fieldLabelCode!, payload)
        if (result.status) {
          showSuccess(result.message)
          setOpen(false)
          loadData()
        } else {
          showError(result.message)
        }
      } else {
        // Create
        const result = await countryLabelFieldsService.create(
          //@ts-ignore
          payload,
        )
        if (result.status) {
          showSuccess(result?.message)
          setOpen(false)
          loadData()
        } else {
          showError(result.message)
        }
      }
    } catch (error) {
      console.log(error)
      showError(selected ? 'Failed to update field' : 'Failed to create field')
    }
  }

  const columns: GridColDef[] = [
    { field: 'fieldLabelCode', headerName: 'Field Code', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'channelCode', headerName: 'Channel', flex: 0.8, headerClassName: 'super-app-theme--header' },
    { field: 'screen', headerName: 'Screen', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'fieldName', headerName: 'Field Name', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'label', headerName: 'Label', flex: 1, headerClassName: 'super-app-theme--header' },
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
      field: 'dataType',
      headerName: 'Data Type',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size="small" color={params.value === 'STRING' ? 'primary' : 'secondary'} />
      ),
    },
    {
      field: 'active',
      headerName: 'Status',
      flex: 0.6,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value ? 'Active' : 'Inactive'} size="small" color={params.value ? 'success' : 'error'} variant="outlined" />
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
          <IconButton
            size="small"
            color="primary"
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
            onClick={() => handleEdit(params.row)}
          >
            <EditIcon />
          </IconButton>
          {/* <IconButton 
            size="small" 
            color="error" 
            onClick={() => handleDelete(params.row.fieldLabelCode)}
          >
            <DeleteIcon />
          </IconButton> */}
        </Stack>
      ),
    },
  ]

  const dataTypes = ['STRING', 'NUMBER', 'DATE', 'BOOLEAN', 'EMAIL', 'PHONE']

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box sx={{ height: '100vh', p: 3 }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              display: 'grid',
              placeItems: 'center',
              color: '#0061B1',
            }}
          >
            Country Label Fields
          </Typography>
          <Button
            variant="contained"
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
            onClick={handleCreate}
          >
            + Create Field
          </Button>
        </Stack>

        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.fieldLabelCode || row.fieldName}
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
          <DialogTitle>{selected ? 'Edit Field' : 'Create New Field'}</DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                {/* Channel */}
                <Grid item xs={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Channel *</InputLabel>
                    <Select value={form.channelCode} label="Channel *" onChange={(e) => setForm({ ...form, channelCode: e.target.value })}>
                      {channels
                        .filter((ch: any) => ch.active === true)
                        .map((channel: any) => (
                          <MenuItem key={channel.channel_code} value={channel.channel_code}>
                            {channel.channel_name || channel.channel_code}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Screen */}
                <Grid item xs={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Screen *</InputLabel>
                    <Select value={form.screen} label="Screen *" onChange={(e) => setForm({ ...form, screen: e.target.value })}>
                      {screens
                        .filter((screen: any) => screen.Active == true)
                        .map((screen: any) => (
                          <MenuItem key={screen?.ScreenCode} value={screen?.ScreenCode}>
                            {screen.ScreenCode + '-' + screen.ScreenDescription}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Field Name & Label */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Field Name *"
                    value={form.fieldName}
                    onChange={(e) => setForm({ ...form, fieldName: e.target.value })}
                    placeholder="e.g., firstName, country"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Label *"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="e.g., First Name, Country"
                  />
                </Grid>
              </Grid>

              {/* Description */}
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />

              {/* Data Type & Validation Required */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Data Type</InputLabel>
                    <Select value={form.dataType} label="Data Type" onChange={(e) => setForm({ ...form, dataType: e.target.value })}>
                      {dataTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Validation Required</InputLabel>
                    <Select
                      value={form.validationRequired}
                      label="Validation Required"
                      onChange={(e) => setForm({ ...form, validationRequired: e.target.value as 'Y' | 'N' })}
                    >
                      <MenuItem value="Y">Yes</MenuItem>
                      <MenuItem value="N">No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Min & Max Length */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Min Length"
                    value={form.minLength}
                    onChange={(e) => setForm({ ...form, minLength: parseInt(e.target.value) || 0 })}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Length"
                    value={form.maxLength}
                    onChange={(e) => setForm({ ...form, maxLength: parseInt(e.target.value) || 0 })}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
              </Grid>

              {/* Validation Messages */}
              <TextField
                fullWidth
                label="Mandatory Message"
                value={form.validationMessageMandatory}
                onChange={(e) => setForm({ ...form, validationMessageMandatory: e.target.value })}
                placeholder="e.g., First name is mandatory"
              />

              <TextField
                fullWidth
                label="Optional Message"
                value={form.validationMessageOptional}
                onChange={(e) => setForm({ ...form, validationMessageOptional: e.target.value })}
                placeholder="e.g., Optional field"
              />

              <TextField
                fullWidth
                label="Error Message"
                value={form.validationMessageError}
                onChange={(e) => setForm({ ...form, validationMessageError: e.target.value })}
                placeholder="e.g., Invalid first name"
              />

              <TextField
                fullWidth
                label="Validation Regex"
                value={form.validationRegex}
                onChange={(e) => setForm({ ...form, validationRegex: e.target.value })}
                placeholder="e.g., ^[A-Za-z ]+$"
                helperText="Leave empty if no regex validation needed"
              />

              {/* Effective Dates */}
              <Divider>Effective Dates</Divider>
              <Grid container spacing={2}>
                {/* <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Effective From"
                  value={form.effectiveFromDate ? form.effectiveFromDate.split('T')[0] : ''}
                  onChange={(e) => setForm({ ...form, effectiveFromDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid> */}
                <Grid item xs={6}>
                  <DynamicDatePicker
                    label="Effective From"
                    value={form.effectiveFromDate}
                    onChange={(val: string) => {
                      console.log(val, 'kdjhchdvy')
                      setForm({ ...form, effectiveFromDate: val })
                    }}
                    // error={!!errors.effectiveFrom}
                    // helperText={errors.effectiveFrom}
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
                {/* <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Effective To"
                  value={form.effectiveToDate && form.effectiveToDate !== '9999-12-31T00:00:00' ? form.effectiveToDate.split('T')[0] : ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      effectiveToDate: e.target.value ? e.target.value + 'T00:00:00' : '9999-12-31T00:00:00',
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: form.effectiveFromDate ? form.effectiveFromDate.split('T')[0] : undefined,
                  }}
                />
              </Grid> */}
              </Grid>

              {/* Active Status */}
              <FormControlLabel
                control={<Switch checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
                label="Active"
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
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
