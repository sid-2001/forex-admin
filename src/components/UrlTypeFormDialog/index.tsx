import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useState, useEffect } from 'react'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import UrlTypeApiService from '../../services/urlType.api.service'
import { LocalStorageService } from '@/helpers/local-storage-service'

export default function UrlTypeFormDialog({ open, onClose, editData, refreshList, showAlert }: any) {
  const service = new UrlTypeApiService()
  const local_service = new LocalStorageService()
  const staffData = local_service.get_staff_access()

  const [form, setForm] = useState({
    urlCode: '',
    urlType: '',
    urlDescription: '',
    effectiveFromDate: '',
    effectiveToDate: '',
    active: true,
  })
  // createdBy: editData ? undefined : staffData?.staffId
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (editData && open) {
      setForm({
        urlCode: editData.urlCode || '',
        urlType: editData.urlType || '',
        urlDescription: editData.urlDescription || '',
        effectiveFromDate: editData.effectiveFromDate ? String(editData.effectiveFromDate).split('T')[0] : '',
        effectiveToDate: editData.effectiveToDate ? String(editData.effectiveToDate).split('T')[0] : '',
        active: editData.active ?? true,
      })
    } else {
      setForm({ urlCode: '', urlType: '', urlDescription: '', effectiveFromDate: '', effectiveToDate: '', active: true })
    }
    setErrors({})
  }, [editData, open])

  const validate = () => {
    const newErrors: any = {}
    if (!form.urlCode.trim()) newErrors.urlCode = 'Required'
    if (!form.urlType.trim()) newErrors.urlType = 'Required'
    if (!form.urlDescription.trim()) newErrors.urlDescription = 'Required'
    if (!form.effectiveFromDate) newErrors.effectiveFromDate = 'Required'
    if (!form.effectiveToDate) newErrors.effectiveToDate = 'Required'

    if (form.effectiveFromDate && form.effectiveToDate) {
      if (new Date(form.effectiveToDate) < new Date(form.effectiveFromDate)) {
        newErrors.effectiveToDate = 'End Date cannot be before Start Date'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    // Formatting dates to YYYY-MM-DDTHH:mm:ss
    let payload: any = {
      ...form,
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00Z`,
      effectiveToDate: `${form.effectiveToDate}T00:00:00Z`,
      createdBy: editData ? null : local_service.get_staff_id(),
    }
    if (editData) {
      payload.modifiedBy = staffData?.staffId
    } else {
      payload.createdBy = staffData?.staffId
    }
    try {
      if (editData) {
        await service.update(form.urlCode, payload)
        showAlert('success', 'URL Type updated successfully')
      } else {
        await service.create(payload)
        showAlert('success', 'URL Type created successfully')
      }
      refreshList()
      onClose()
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Operation failed')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update URL Type' : 'Add URL Type'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="URL Code"
              value={form.urlCode}
              disabled={!!editData}
              onChange={(e) => setForm({ ...form, urlCode: e.target.value.toUpperCase() })}
              error={!!errors.urlCode}
              helperText={errors.urlCode}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="URL Type"
              placeholder="e.g. CALLBACK, BASE"
              value={form.urlType}
              onChange={(e) => setForm({ ...form, urlType: e.target.value.toUpperCase() })}
              error={!!errors.urlType}
              helperText={errors.urlType}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={form.urlDescription}
              onChange={(e) => setForm({ ...form, urlDescription: e.target.value })}
              error={!!errors.urlDescription}
              helperText={errors.urlDescription}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFromDate}
              onChange={(val: string) => setForm({ ...form, effectiveFromDate: val })}
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
              onChange={(val: string) => setForm({ ...form, effectiveToDate: val })}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
              label="Active Status"
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
