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
} from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import TermsConditionsService, { TermsConditions } from '../../services/termsandcondition.service'
import { countyState } from '@/states/state'
import { useRecoilState, useRecoilValue } from 'recoil'
import staticdataService from '@/services/staticdata.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import ChannelService from '@/services/channel.servive'
import ScreenService from '@/services/screen.service'
import { formatTableDate } from '@/helpers/dateformate'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

const termsService = new TermsConditionsService()

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

export default function TermsConditionsGridPage() {
  const [rows, setRows] = useState<TermsConditions[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<TermsConditions | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedChannel, setSelectedChannel] = useState<string>('')
  const [screens, setScreens] = useState<any>([])
  const [selectedScreen, setSelectedScreen] = useState<string>('')
  const [versions, setVersions] = useState<any[]>([])
  const [editorValue, setEditorValue] = useState('')
  // const [countries, setCountries] = useRecoilState(countyState);
  const countries = useRecoilValue(countyState)
  const [channels, setChannels] = useState([])
  const [form, setForm] = useState({
    countryCode: '',
    channel: '',
    screen: '',
    headerSectionCount: 0,
    contentCount: 0,
    version: '1.0',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '9999-12-31T00:00:00',
  })
  const [errors, setErrors] = useState<any>({})

  const local_service = new LocalStorageService()
  const userCountry = local_service?.get_staff_country()
  const static_service = new staticdataService()

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
  }, [])

  const handleCountryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const countryCode = event.target.value as string
    setSelectedCountry(countryCode)
    const selectedCountryObj = countries.find((country) => country.countryCode == countryCode)
    console.log('selected', selectedCountryObj)
  }

  const handleChannelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const channelCode = event.target.value as string
    setSelectedChannel(channelCode)
    const selectedChannelObj = channels.find(
      (channel) =>
        //@ts-ignore
        channel.channel_code == channelCode,
    )
    console.log('selected', selectedChannelObj)
  }

  const handleScreenChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const screenCode = event.target.value as string
    setSelectedScreen(screenCode)
    const selectedScreenObj = screens.find(
      (screen: any) =>
        //@ts-ignore
        screen.screencode == screenCode,
    )
    console.log('selected', selectedScreenObj)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setRows(await termsService.getAll())
    } catch {
      showError('Failed to load Terms')
    } finally {
      setLoading(false)
    }
  }

  const fetchScreens = async () => {
    try {
      const screen_service = new ScreenService()
      screen_service.getScreenList().then((e) => {
        setScreens(e)
      })
      setLoading(true)
    } catch {
      showError('Failed to load Screens')
    } finally {
      setLoading(false)
    }
  }

  const fetchchannel = async () => {
    try {
      const channel_service = new ChannelService()
      setLoading(true)
      channel_service.getChannelList().then((data) => {
        console.log(data)
        setChannels(data as any)
      })
    } catch {
      showError('Failed to load Channels')
    } finally {
      setLoading(false)
    }
  }

  /* ---------- VIEW / EDIT ---------- */
  const handleView = (row: TermsConditions) => {
    const parsed = parseJsonContent(row.jsonContent)
    const active = parsed.editorData?.find((v: any) => v.active)

    setSelected(row)
    setVersions(parsed.editorData || [])
    setEditorValue(active ? cleanHtml(active.data) : '')

    // Update selected dropdowns
    setSelectedCountry(row.countryCode || '')
    setSelectedChannel(row.channel || '')
    setSelectedScreen(row.screen || '')

    setForm({
      countryCode: row.countryCode || '',
      channel: row.channel || '',
      screen: row.screen || '',
      headerSectionCount: 23,
      contentCount: row.contentCount ?? 0,
      version: row.version,
      active: row.active,
      effectiveFromDate: row.effectiveFromDate || '',
      effectiveToDate: row.effectiveToDate || '9999-12-31T00:00:00',
    })

    setOpen(true)
  }

  /* ---------- CREATE ---------- */
  const handleCreate = async () => {
    try {
      // Validation
      if (!selectedCountry || !selectedChannel || !selectedScreen || !form.effectiveFromDate) {
        showError('Please fill all required fields')
        return
      }

      const payload = {
        ...form,
        countryCode: selectedCountry,
        channel: selectedChannel,
        screen: selectedScreen,
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
        createdBy: 'ADMIN',
      }

      await termsService.create(payload)
      showSuccess('Terms created successfully')
      setOpen(false)
      loadData()
    } catch {
      showError('Create failed')
    }
  }

  /* ---------- UPDATE ---------- */
  const handleUpdate = async () => {
    if (!selected) return

    try {
      // Validation
      if (!selectedCountry || !selectedChannel || !selectedScreen || !form.effectiveFromDate) {
        showError('Please fill all required fields')
        return
      }

      const updatedVersions = versions.map((v) => ({ ...v, active: false }))
      updatedVersions.push({
        id: `v${updatedVersions.length + 1}`,
        data: cleanHtml(editorValue),
        active: true,
        updatedAt: new Date().toISOString(),
      })

      await termsService.update(selected.termsCode!, {
        ...selected,
        ...form,
        countryCode: selectedCountry,
        channel: selectedChannel,
        screen: selectedScreen,
        jsonContent: JSON.stringify({ editorData: updatedVersions }),
        modifiedBy: 'ADMIN',
      })

      showSuccess('Terms updated')
      setOpen(false)
      loadData()
    } catch {
      showError('Update failed')
    }
  }

  /* ---------- GRID ---------- */
  const columns: GridColDef[] = [
    { field: 'termsCode', headerName: 'Terms Code', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'countryCode', headerName: 'Country', flex: 0.7, headerClassName: 'super-app-theme--header' },
    { field: 'channel', headerName: 'Channel', flex: 0.6, headerClassName: 'super-app-theme--header' },
    { field: 'screen', headerName: 'Screen', flex: 1, headerClassName: 'super-app-theme--header' },
    // {
    //   field: "effectiveFromDate",
    //   headerName: "Effective From",
    //   flex: 0.8,
    //   valueFormatter: (params) => {
    //     if (!params?.value) return '';
    //     return(params?.value);
    //   }
    // },
    // {
    //   field: "effectiveToDate",
    //   headerName: "Effective To",
    //   flex: 0.8,
    //   valueFormatter: (params) => {
    //     if (!params.value || params.value === "9999-12-31T00:00:00") return 'N/A';
    //     return (params.value)
    //   }
    // },
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
      field: 'action',
      headerName: 'Action',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Button size="small" onClick={() => handleView(params.row)}>
          View / Edit
        </Button>
      ),
    },
  ]

  return (
    <Box sx={{ height: '100vh', p: 3 }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Terms & Conditions</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setSelected(null)
            setVersions([])
            setEditorValue('')
            setSelectedCountry('')
            setSelectedChannel('')
            setSelectedScreen('')
            setForm({
              countryCode: '',
              channel: '',
              screen: '',
              headerSectionCount: 0,
              contentCount: 0,
              version: '1.0',
              active: true,
              effectiveFromDate: '',
              effectiveToDate: '9999-12-31T00:00:00',
            })
            setOpen(true)
          }}
        >
          + Create Terms
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
          getRowId={(r) => r.termsCode!}
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
        <DialogTitle>{selected ? 'Edit Terms' : 'Create Terms'}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Country Selection */}
            <FormControl fullWidth>
              <InputLabel>Destination Country *</InputLabel>
              <Select
                value={selectedCountry}
                //@ts-ignore
                onChange={handleCountryChange}
                label="Destination Country *"
              >
                {countries
                  ?.filter((item) => item.status === 'A' && item.countryCode !== userCountry)
                  .map((country) => (
                    <MenuItem
                      //@ts-ignore
                      key={country.countryCode}
                      value={country.countryCode}
                    >
                      <Typography>{country.countryName}</Typography>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {/* Channel Selection */}
            <FormControl fullWidth>
              <InputLabel>Channel *</InputLabel>
              <Select
                value={selectedChannel}
                //@ts-ignore
                onChange={handleChannelChange}
                label="Channel *"
              >
                {channels ? (
                  channels
                    ?.filter(
                      (item) =>
                        //@ts-ignore
                        item.active === true,
                    )
                    .map((channel) => (
                      <MenuItem
                        //@ts-ignore
                        key={channel.channel_code}
                        //@ts-ignore
                        value={channel.channel_code}
                      >
                        <Typography>
                          {
                            //@ts-ignore
                            channel.channel_code
                          }
                        </Typography>
                      </MenuItem>
                    ))
                ) : (
                  <></>
                )}
              </Select>
            </FormControl>

            {/* Screen Selection */}
            <FormControl fullWidth>
              <InputLabel>Screen *</InputLabel>
              <Select
                value={selectedScreen}
                //@ts-ignore
                onChange={handleScreenChange}
                label="Screen *"
              >
                {screens
                  ?.filter(
                    (item: any) =>
                      //@ts-ignore
                      item.active === true,
                  )
                  .map((screen: any) => (
                    <MenuItem key={screen.screencode} value={screen.screencode}>
                      <Typography>{screen.screencode}</Typography>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {/* Effective Date Fields */}
            <Grid container spacing={2}>
              {/* <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Effective From *"
                  type="date"
                  value={form.effectiveFromDate ? form.effectiveFromDate.split('T')[0] : ''}
                  onChange={(e) => setForm({ ...form, effectiveFromDate: e.target.value + 'T00:00:00' })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid> */}
              <Grid item xs={6}>
                <DynamicDatePicker
                  label="Effective From"
                  value={form.effectiveFromDate ? form.effectiveFromDate.split('T')[0] : ''}
                  onChange={(val: string) => {
                    console.log(val, 'kdjhchdvy')
                    setForm({
                      ...form,
                      effectiveFromDate: val ? `${val}T00:00:00` : '',
                    })
                  }}
                  error={!!errors.effectiveFromDate}
                  helperText={errors.effectiveFromDate}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <DynamicEndDatePicker
                  label="Effective To"
                  value={form.effectiveToDate && form.effectiveToDate !== '9999-12-31T00:00:00' ? form.effectiveToDate.split('T')[0] : ''}
                  minDate={form.effectiveFromDate ? form.effectiveFromDate.split('T')[0] : undefined}
                  onChange={(val: string) => {
                    setForm({
                      ...form,
                      effectiveToDate: val ? `${val}T00:00:00` : '9999-12-31T00:00:00',
                    })
                  }}
                  required
                />
              </Grid>

              {/* <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Effective To"
                  type="date"
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

            {/* Active Switch */}
            <FormControlLabel
              control={<Switch checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
              label="Active"
            />

            <Divider />

            {/* Rich Text Editor */}
            <Typography variant="subtitle2">Content *</Typography>
            <QuillToolbar />
            <ReactQuill theme="snow" value={editorValue} onChange={setEditorValue} modules={{ toolbar: '#quill-toolbar' }} style={{ height: 250 }} />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={selected ? handleUpdate : handleCreate}>
            {selected ? 'Save Changes' : 'Create'}
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
  )
}
