import React, { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, FormControlLabel, Checkbox } from '@mui/material'
import SequenceApiService from '../../services/sequence.api.service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

export default function SequenceDialog({ open, editData, onClose, refreshList, showAlert }: any) {
  const service = new SequenceApiService()

  const initialFormState = {
    countryCode: '',
    product: '',
    productCode: '',
    vendor: '',
    vendorType: '',
    docType: '',
    prefix: '',
    intermediate: '',
    suffix: '',
    maxLimitDigit: 5,
    docSeq: '',
    flag: true,
    startSeqNumber: 0,
    currentSeqNumber: 0,
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  }

  const [formData, setFormData] = useState<any>(initialFormState)

  useEffect(() => {
    if (editData) setFormData(editData)
    else setFormData(initialFormState)
  }, [editData, open])

  const handleSubmit = async () => {
    const mandatoryFields = [
      'countryCode',
      'product',
      'productCode',
      'vendor',
      'vendorType',
      'docType',
      'docSeq',
      'effectiveFromDate',
      'effectiveToDate',
    ]

    const isFormIncomplete = mandatoryFields.some((field) => !formData[field] || formData[field].toString().trim() === '')

    if (isFormIncomplete) {
      showAlert('error', 'Please fill in all mandatory fields before saving.')
      return
    }

    // 2. Proceed with API call
    try {
      if (editData) {
        await service.update(editData.sequenceId, {
          ...formData,
          effectiveFromDate: formData.effective_from_date + 'T00:00:00.000Z',
          effectiveToDate: formData.effective_to_date + 'T00:00:00.000Z',
        })
        showAlert('success', 'Sequence updated successfully')
      } else {
        await service.create(formData)
        showAlert('success', 'Sequence created successfully')
      }
      refreshList()
      onClose()
    } catch (error) {
      showAlert('error', 'Operation failed')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editData ? 'Edit Sequence' : 'Add New Sequence'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={4}>
            <TextField
              fullWidth
              required
              label="Country Code"
              value={formData.countryCode}
              onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              required
              label="Product"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              required
              label="Product Code"
              value={formData.productCode}
              onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              required
              label="Vendor"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              required
              label="Vendor Type"
              value={formData.vendorType}
              onChange={(e) => setFormData({ ...formData, vendorType: e.target.value })}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              required
              label="Doc Type"
              value={formData.docType}
              onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField fullWidth label="Prefix" value={formData.prefix} onChange={(e) => setFormData({ ...formData, prefix: e.target.value })} />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Intermediate"
              value={formData.intermediate}
              onChange={(e) => setFormData({ ...formData, intermediate: e.target.value })}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField fullWidth label="Suffix" value={formData.suffix} onChange={(e) => setFormData({ ...formData, suffix: e.target.value })} />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              required
              type="number"
              label="Max Digits"
              value={formData.maxLimitDigit}
              onChange={(e) => setFormData({ ...formData, maxLimitDigit: e.target.value })}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              required
              label="Doc Sequence Pattern"
              value={formData.docSeq}
              onChange={(e) => setFormData({ ...formData, docSeq: e.target.value })}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              type="number"
              label="Start #"
              value={formData.startSeqNumber}
              onChange={(e) => setFormData({ ...formData, startSeqNumber: e.target.value })}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              type="number"
              label="Current #"
              value={formData.currentSeqNumber}
              onChange={(e) => setFormData({ ...formData, currentSeqNumber: e.target.value })}
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={formData.effectiveFromDate}
              onChange={(val: string) => setFormData({ ...formData, effectiveFromDate: val })}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={formData.effectiveToDate}
              minDate={formData.effectiveFromDate}
              onChange={(val: string) => setFormData({ ...formData, effectiveToDate: val })}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="active"
                  checked={formData.active}
                  onChange={(e: any) => setFormData({ ...formData, active: e.target.checked })}
                  color="primary"
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} color="primary">
          {editData ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
