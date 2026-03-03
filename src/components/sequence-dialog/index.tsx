import React, { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, MenuItem, FormControlLabel, Switch } from '@mui/material'
import SequenceApiService from '../../services/sequence.api.service'

export default function SequenceDialog({ open, editData, onClose, refreshList, showAlert }: any) {
  const service = new SequenceApiService()
  const [formData, setFormData] = useState<any>({
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
    startSeqNumber: 1,
    currentSeqNumber: 1,
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  })

  useEffect(() => {
    if (editData) setFormData(editData)
    else
      setFormData({
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
        startSeqNumber: 1,
        currentSeqNumber: 1,
        active: true,
        effectiveFromDate: '',
        effectiveToDate: '',
      })
  }, [editData, open])

  const handleSubmit = async () => {
    try {
      if (editData) {
        await service.update(editData.sequenceId, formData)
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
              label="Country Code"
              value={formData.countryCode}
              onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth label="Product" value={formData.product} onChange={(e) => setFormData({ ...formData, product: e.target.value })} />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Product Code"
              value={formData.productCode}
              onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField fullWidth label="Vendor" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Vendor Type"
              value={formData.vendorType}
              onChange={(e) => setFormData({ ...formData, vendorType: e.target.value })}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth label="Doc Type" value={formData.docType} onChange={(e) => setFormData({ ...formData, docType: e.target.value })} />
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
              type="number"
              label="Max Digits"
              value={formData.maxLimitDigit}
              onChange={(e) => setFormData({ ...formData, maxLimitDigit: e.target.value })}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
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
            <TextField
              fullWidth
              type="datetime-local"
              label="Effective From"
              InputLabelProps={{ shrink: true }}
              value={formData.effectiveFromDate?.split('.')[0]}
              onChange={(e) => setFormData({ ...formData, effectiveFromDate: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Effective To"
              InputLabelProps={{ shrink: true }}
              value={formData.effectiveToDate?.split('.')[0]}
              onChange={(e) => setFormData({ ...formData, effectiveToDate: e.target.value })}
            />
          </Grid>

          <Grid item xs={6}>
            <FormControlLabel
              control={<Switch checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />}
              label="Active Status"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
