import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Grid, Autocomplete } from '@mui/material'
import { useState, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import VendorApiConfigService from '../../services/vendorApiConfig.service'

export default function VendorApiConfigDialog({ open, onClose, editData, refreshList, showAlert, vendors, urlTypes }: any) {
  const service = new VendorApiConfigService()
  const [countries] = useRecoilState(countyState)
  console.log(editData)
  const [form, setForm] = useState<any>({
    vendorCode: '',
    urlCode: '',
    serviceCountry: '',
    serviceCurrency: '',
    token: '',
    apiKey: '',
    secretKey: '',
    url: '',
    effectiveFromDate: '',
    effectiveToDate: '',
    active: true,
  })

  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (editData && open) {
      setForm({
        ...editData,
        effectiveFromDate: editData.effectiveFromDate ? String(editData.effectiveFromDate).split('T')[0] : '',
        effectiveToDate: editData.effectiveToDate ? String(editData.effectiveToDate).split('T')[0] : '',
        active: editData.active ?? true,
        // urlType: editData.urlType.urlType,
        // vendor: editData.vendor.vendorCode,
      })
    } else {
      setForm({
        vendorCode: '',
        urlCode: '',
        serviceCountry: '',
        serviceCurrency: '',
        token: '',
        apiKey: '',
        secretKey: '',
        url: '',
        effectiveFromDate: '',
        effectiveToDate: '',
        active: true,
      })
    }
    setErrors({})
  }, [editData, open])

  const validate = () => {
    const newErrors: any = {}
    if (!form.vendorCode) newErrors.vendorCode = 'Required'
    if (!form.urlCode) newErrors.urlCode = 'Required'
    if (!form.serviceCountry) newErrors.serviceCountry = 'Required'
    if (!form.apiKey) newErrors.apiKey = 'Required'
    if (!form.effectiveFromDate) newErrors.effectiveFromDate = 'Required'
    if (!form.effectiveToDate) newErrors.effectiveToDate = 'Required'

    if (form.effectiveFromDate && form.effectiveToDate && new Date(form.effectiveToDate) < new Date(form.effectiveFromDate)) {
      newErrors.effectiveToDate = 'End Date cannot be before Start Date'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    const payload = {
      ...form,
      effectiveFromDate: `${form.effectiveFromDate}T10:00:00`,
      effectiveToDate: `${form.effectiveToDate}T10:00:00`,
    }

    try {
      if (editData) {
        // Use ID (35 in your curl) for update
        await service.update(editData.id, payload)
        showAlert('success', 'Config updated successfully')
      } else {
        await service.create(payload)
        showAlert('success', 'Config created successfully')
      }
      refreshList()
      onClose()
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Operation failed')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Vendor API' : 'Add Vendor API'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* Vendor Selection */}
          <Grid item xs={6}>
            <Autocomplete
              options={vendors || []}
              getOptionLabel={(o: any) => `${o.vendorName} (${o.vendorCode})`}
              value={form.vendor || null}
              onChange={(_, val) => setForm({ ...form, vendorCode: val ? val.vendorCode : '' })}
              renderInput={(p) => <TextField {...p} label="Vendor" error={!!errors.vendorCode} helperText={errors.vendorCode} required />}
            />
          </Grid>

          {/* URL Type Selection */}
          <Grid item xs={6}>
            <Autocomplete
              options={urlTypes || []}
              getOptionLabel={(o: any) => `${o.urlType} (${o.urlCode})`}
              value={form.urlType || null}
              onChange={(_, val) => setForm({ ...form, urlCode: val ? val.urlCode : '' })}
              renderInput={(p) => <TextField {...p} label="URL Type" error={!!errors.urlCode} helperText={errors.urlCode} required />}
            />
          </Grid>

          <Grid item xs={6}>
            <Autocomplete
              options={countries?.filter((c: any) => c.status === 'A') || []}
              getOptionLabel={(o: any) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c: any) => c.countryCode === form.serviceCountry) || null}
              onChange={(_, val: any) =>
                setForm({ ...form, serviceCountry: val ? val.countryCode : '', serviceCurrency: val ? val.currencyCode : '' })
              }
              renderInput={(p) => (
                <TextField {...p} label="Service Country" error={!!errors.serviceCountry} helperText={errors.serviceCountry} required />
              )}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField fullWidth label="Service Currency" value={form.serviceCurrency} disabled />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="Endpoint URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="API Key"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              error={!!errors.apiKey}
              helperText={errors.apiKey}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField fullWidth label="Secret Key" value={form.secretKey} onChange={(e) => setForm({ ...form, secretKey: e.target.value })} />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="Token" multiline rows={2} value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} />
          </Grid>

          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFromDate}
              onChange={(v: any) => setForm({ ...form, effectiveFromDate: v })}
              error={!!errors.effectiveFromDate}
              helperText={errors.effectiveFromDate}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={form.effectiveToDate}
              minDate={form.effectiveFromDate}
              onChange={(v: any) => setForm({ ...form, effectiveToDate: v })}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
