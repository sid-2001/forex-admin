import React, { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControlLabel, Grid, Checkbox } from '@mui/material'
import VendorApiService from '../../services/vendor.api.service'
import { LocalStorageService } from '@/helpers/local-storage-service'

export default function VendorApiFormDialog({ open, editData, onClose, refreshList, showAlert }: any) {
  const service = new VendorApiService()
  const localService = new LocalStorageService()

  const [formData, setFormData] = useState({
    vendorCode: '',
    urlCode: '',
    country: '',
    currency: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  })

  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (editData && open) {
      setFormData({
        ...editData,
        effectiveFromDate: editData.effectiveFromDate?.split('T')[0] || '',
        effectiveToDate: editData.effectiveToDate?.split('T')[0] || '',
      })
    } else {
      setFormData({
        vendorCode: '',
        urlCode: '',
        country: '',
        currency: '',
        active: true,
        effectiveFromDate: '',
        effectiveToDate: '',
      })
      setErrors({})
    }
  }, [editData, open])

  const validate = () => {
    const errs: any = {}
    if (!formData.vendorCode) errs.vendorCode = 'Required'
    if (!formData.urlCode) errs.urlCode = 'Required'
    if (!formData.country) errs.country = 'Required'
    if (!formData.currency) errs.currency = 'Required'
    if (!formData.effectiveFromDate) errs.effectiveFromDate = 'Required'

    if (formData.effectiveFromDate && formData.effectiveToDate) {
      if (new Date(formData.effectiveToDate) < new Date(formData.effectiveFromDate)) {
        errs.effectiveToDate = 'End date cannot be before start date'
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    const staffId = localService.get_staff_id()
    const payload = {
      ...formData,
      effectiveFromDate: `${formData.effectiveFromDate}T00:00:00`,
      effectiveToDate: formData.effectiveToDate ? `${formData.effectiveToDate}T23:59:59` : null,
      [editData ? 'modified_by' : 'created_by']: staffId,
    }

    try {
      const res = editData ? await service.update(editData.id, payload) : await service.create(payload)

      if (res) {
        showAlert('Success', `Configuration ${editData ? 'Updated' : 'Created'} Successfully`)
        refreshList()
        onClose()
      }
    } catch (e) {
      showAlert('Fail', 'Server Error')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
        {editData ? 'Edit Vendor Configuration' : 'Create Vendor Configuration'}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={6}>
            <TextField
              label="Vendor Code"
              fullWidth
              required
              value={formData.vendorCode}
              error={!!errors.vendorCode}
              helperText={errors.vendorCode}
              onChange={(e) => setFormData({ ...formData, vendorCode: e.target.value.toUpperCase() })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="URL Code"
              fullWidth
              required
              value={formData.urlCode}
              error={!!errors.urlCode}
              helperText={errors.urlCode}
              onChange={(e) => setFormData({ ...formData, urlCode: e.target.value.toUpperCase() })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Country (ISO)"
              fullWidth
              required
              value={formData.country}
              error={!!errors.country}
              helperText={errors.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Currency"
              fullWidth
              required
              value={formData.currency}
              error={!!errors.currency}
              helperText={errors.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Effective From"
              type="date"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={formData.effectiveFromDate}
              error={!!errors.effectiveFromDate}
              onChange={(e) => setFormData({ ...formData, effectiveFromDate: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Effective To"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: formData.effectiveFromDate }}
              value={formData.effectiveToDate}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              onChange={(e) => setFormData({ ...formData, effectiveToDate: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />}
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
          {editData ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
