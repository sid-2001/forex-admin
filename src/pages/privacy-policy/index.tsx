import React, { useEffect, useState, useCallback } from 'react'
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
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  IconButton,
  FormHelperText,
} from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { LocalStorageService } from '@/helpers/local-storage-service'
import ChannelService from '@/services/channel.servive'
import ScreenService from '@/services/screen.service'
import { formatTableDate } from '@/helpers/dateformate'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import EditIcon from '@mui/icons-material/Edit'
import SequenceApiService from '@/services/sequence.api.service'
import PrivacyPolicyService from '@/services/privacypolicy.service'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'

/* ---------- HELPERS ---------- */
const parseJsonContent = (jsonContent: any) => {
  if (!jsonContent) return { editorData: [] }
  if (typeof jsonContent === 'string') {
    try {
      return JSON.parse(jsonContent)
    } catch {
      return { editorData: [] }
    }
  }
  return jsonContent
}

const cleanHtml = (html: string) =>
  html
    ?.replace(/\n/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .trim() || ''

/* ---------- QUILL TOOLBAR ---------- */
const QuillToolbar = () => (
  <div id="quill-toolbar">
    <select className="ql-header">
      <option value="1">H1</option>
      <option value="2">H2</option>
      <option value="3">H3</option>
      <option value="">Normal</option>
    </select>
    <button className="ql-bold" />
    <button className="ql-italic" />
    <button className="ql-underline" />
    <button className="ql-list" value="ordered" />
    <button className="ql-list" value="bullet" />
    <button className="ql-link" />
    <button className="ql-clean" />
  </div>
)

const VALIDATION_RULES = {
  countryCode: {
    message: 'Country code is required',
    required: true,
  },
  channel: {
    message: 'Channel is required',
    required: true,
  },
  screen: {
    message: 'Screen is required',
    required: true,
  },
  effectiveToDate: { required: true, message: 'To Date is required' },
  effectiveFromDate: { required: true, message: 'From Date is required' },
}

export default function PrivacyPolicy() {
  const [rows, setRows] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [screens, setScreens] = useState<any>([])
  const [versions, setVersions] = useState<any[]>([])
  const [editorValue, setEditorValue] = useState('')
  const [countries, setcountries] = useState([])

  const [channels, setChannels] = useState([])
  const [form, setForm] = useState({
    countryCode: '',
    channel: '',
    screen: '',
    version: '1.0',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  })
  const [errors, setErrors] = useState<any>({})

  const local_service = new LocalStorageService()
  const channel_service = new ChannelService()
  const screen_service = new ScreenService()
  const sequenceService = new SequenceApiService()
  const policyService = new PrivacyPolicyService()
  const helper = new HelperService()

  const userCountry = local_service?.get_staff_country()

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  const showSuccess = (msg: string) => setSnackbar({ open: true, message: msg, severity: 'success' })

  const showError = (msg: string) => setSnackbar({ open: true, message: msg, severity: 'error' })

  useEffect(() => {
    loadData()
    fetchScreens()
    fetchchannel()
    fetchCountryCodes()
  }, [])

  const fetchCountryCodes = useCallback(async () => {
    const res: any = await sequenceService.getActiveCountryCorridors()
    setcountries(res || [])
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setRows(await policyService.getAll())
    } catch {
      showError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchScreens = async () => {
    try {
      const res = await screen_service.getScreenList()
      setScreens(res)
      setLoading(true)
    } catch {
      showError('Failed to load Screens')
    } finally {
      setLoading(false)
    }
  }

  const fetchchannel = async () => {
    try {
      setLoading(true)
      const data = await channel_service.getChannelList()
      setChannels(data as any)
    } catch {
      showError('Failed to load Channels')
    } finally {
      setLoading(false)
    }
  }

  /* ---------- VIEW / EDIT ---------- */
  const handleView = (row: any) => {
    const parsed = parseJsonContent(row.jsonContent)
    const active = parsed.editorData?.find((v: any) => v.active)

    setSelected(row)
    setVersions(parsed.editorData || [])
    setEditorValue(active ? cleanHtml(active.data) : '')

    setForm({
      countryCode: row.countryCode || '',
      channel: row.channel || '',
      screen: row.screen || '',
      version: row.version,
      active: row.active,
      //   effectiveFromDate: row.effectiveFromDate || '',
      //   effectiveToDate: row.effectiveToDate || '9999-12-31T00:00:00',
      effectiveFromDate: row.effectiveFromDate?.split('T')[0] || '',
      effectiveToDate: row.effectiveToDate?.split('T')[0] || '',
    })

    setOpen(true)
  }

  const handleChange = (field: string, value: any) => {
    console.log(field, value)
    setForm((prev: any) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors: any = {}

    Object.keys(VALIDATION_RULES).forEach((field) => {
      const rule = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES]
      const value = form[field as keyof typeof form]

      if (!value && rule.required) newErrors[field] = rule.message
    })

    // Date validation: effectiveToDate must be after effectiveFromDate
    if (form.effectiveFromDate && form.effectiveToDate) {
      const fromDate = new Date(form.effectiveFromDate)
      const toDate = new Date(form.effectiveToDate)

      if (toDate <= fromDate) {
        newErrors.effectiveToDate = 'Effective To date must be after Effective From date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ---------- CREATE ---------- */
  const handleCreate = async () => {
    if (!validate()) return
    try {
      const payload = {
        ...form,
        jsonContent: JSON.stringify({
          editorData: [
            {
              id: 'v1',
              data: cleanHtml(editorValue),
              active: true,
              updatedAt: new Date().toISOString(),
            },
          ],
        }),
        createdBy: local_service.get_staff_id(),
        effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
        effectiveToDate: `${form.effectiveToDate}T00:00:00`,
      }

      let res = await policyService.create(payload)
      if (res?.status) {
        showSuccess(res?.message)
        setOpen(false)
        loadData()
      }
    } catch {
      showError('Create failed Server Error')
    }
  }

  /* ---------- UPDATE ---------- */
  const handleUpdate = async () => {
    if (!selected) return
    if (!validate()) return

    try {
      const updatedVersions = versions.map((v) => ({ ...v, active: false }))
      updatedVersions.push({
        id: `v${updatedVersions.length + 1}`,
        data: cleanHtml(editorValue),
        active: true,
        updatedAt: new Date().toISOString(),
      })

      let res = await policyService.update(selected.policyCode!, {
        ...selected,
        ...form,
        jsonContent: JSON.stringify({ editorData: updatedVersions }),
        modifiedBy: local_service.get_staff_id(),
        effectiveFromDate: form.effectiveFromDate + 'T00:00:00',
        effectiveToDate: form.effectiveToDate + 'T00:00:00',
      })

      showSuccess(res?.message)
      setOpen(false)
      loadData()
    } catch {
      showError('Update failed')
    }
  }

  /* ---------- GRID ---------- */
  const columns: GridColDef[] = [
    { field: 'policyCode', headerName: 'Policy Code', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'countryCode', headerName: 'Country', flex: 0.7, headerClassName: 'super-app-theme--header' },
    { field: 'channel', headerName: 'Channel', flex: 0.6, headerClassName: 'super-app-theme--header' },
    { field: 'screen', headerName: 'Screen', flex: 1, headerClassName: 'super-app-theme--header' },
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
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <IconButton
          color="primary"
          disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
          onClick={() => handleView(params.row)}
        >
          <EditIcon />
        </IconButton>
      ),
    },
  ]

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box sx={{ height: '100vh', p: 3 }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0061B1', textAlign: 'center' }}>
            Privacy Policy
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setSelected(null)
              setVersions([])
              setEditorValue('')
              setForm({
                countryCode: '',
                channel: '',
                screen: '',

                version: '1.0',
                active: true,
                effectiveFromDate: '',
                effectiveToDate: '',
              })
              setOpen(true)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
          >
            + Create Policy
          </Button>
        </Stack>
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true } }}
            disableColumnMenu
            getRowId={(r) => r.policyCode!}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
          />
        </Box>

        {/* ---------- DIALOG ---------- */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{selected ? 'Edit Policy' : 'Create Policy'}</DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                {/* Country Selection */}
                <FormControl fullWidth required error={!!errors.countryCode}>
                  <InputLabel>Destination Country</InputLabel>
                  <Select
                    value={form?.countryCode}
                    onChange={(e: any) => handleChange('countryCode', e.target.value || '')}
                    label="Destination Country"
                  >
                    {countries
                      ?.filter((item: any) => item.status === 'A')
                      .map((country: any, index: number) => (
                        <MenuItem
                          //@ts-ignore
                          key={index}
                          value={country.countryCode}
                        >
                          <Typography>
                            {country.countryName} ({country.countryCode})
                          </Typography>
                        </MenuItem>
                      ))}
                  </Select>
                  <FormHelperText>{errors?.countryCode}</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                {/* Channel Selection */}
                <FormControl fullWidth required error={!!errors.channel}>
                  <InputLabel>Channel</InputLabel>
                  <Select value={form?.channel} onChange={(e: any) => handleChange('channel', e.target.value || '')} label="Channel">
                    {channels ? (
                      channels
                        ?.filter(
                          (item) =>
                            //@ts-ignore
                            item.active === true,
                        )
                        .map((channel: any, index: number) => (
                          <MenuItem
                            //@ts-ignore
                            key={index}
                            //@ts-ignore
                            value={channel.channel_code}
                          >
                            <Typography>
                              {
                                //@ts-ignore
                                channel.channel_code
                              }{' '}
                              ({channel?.channel_description})
                            </Typography>
                          </MenuItem>
                        ))
                    ) : (
                      <></>
                    )}
                  </Select>
                  <FormHelperText>{errors?.channel}</FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                {/* Screen Selection */}
                <FormControl fullWidth required error={!!errors.screen}>
                  <InputLabel>Screen</InputLabel>
                  <Select value={form?.screen} onChange={(e: any) => handleChange('screen', e.target.value || '')} label="Screen">
                    {screens
                      ?.filter(
                        (item: any) =>
                          //@ts-ignore
                          item.Active === true,
                        //@ts-ignore
                      )
                      .map((screen: any, index: number) => (
                        <MenuItem key={index} value={screen.ScreenCode}>
                          <Typography>
                            {screen.ScreenCode} ({screen.ScreenDescription})
                          </Typography>
                        </MenuItem>
                      ))}
                  </Select>
                  <FormHelperText>{errors.screen}</FormHelperText>
                </FormControl>
              </Grid>

              {/* Effective From Date */}
              <Grid item xs={6}>
                <DynamicDatePicker
                  label="Effective From"
                  value={form.effectiveFromDate}
                  onChange={(val: string) => {
                    setForm({ ...form, effectiveFromDate: val })
                    if (errors.effectiveFromDate) setErrors({ ...errors, effectiveFromDate: '' })
                  }}
                  error={!!errors.effectiveFromDate}
                  helperText={errors.effectiveFromDate}
                  required
                />
              </Grid>

              {/* Effective To Date */}
              <Grid item xs={6}>
                <DynamicEndDatePicker
                  label="Effective To"
                  value={form.effectiveToDate}
                  minDate={form.effectiveFromDate}
                  onChange={(val: string) => {
                    setForm({ ...form, effectiveToDate: val })
                    if (errors.effectiveToDate) setErrors({ ...errors, effectiveToDate: '' })
                  }}
                  error={!!errors.effectiveToDate}
                  helperText={errors.effectiveToDate}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.active}
                      onChange={(e) => {
                        setForm({ ...form, active: e.target.checked })
                        if (errors.active) setErrors({ ...errors, active: '' })
                      }}
                    />
                  }
                  label="Active"
                />
              </Grid>

              <Divider />

              <Grid item xs={12}>
                {/* Rich Text Editor */}
                <Typography variant="subtitle2">Content</Typography>
                <QuillToolbar />
                <ReactQuill
                  theme="snow"
                  value={editorValue}
                  onChange={setEditorValue}
                  modules={{ toolbar: '#quill-toolbar' }}
                  style={{ height: 250 }}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={selected ? handleUpdate : handleCreate}>
              {selected ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Centered Snackbar */}
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
