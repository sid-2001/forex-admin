import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Box, Grid } from '@mui/material'
import { useEffect, useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  editData?: any | null
}

export default function ProductFormDialog({ open, onClose, onSubmit, editData }: Props) {
  const [form, setForm] = useState({
    productCode: '',
    productName: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  })

  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (editData && open) {
      // Safe splitting for pre-filling HTML5 date inputs
      const fDate = editData.effectiveFromDate || editData.effectivefromdate || ''
      const tDate = editData.effectiveToDate || editData.effectivetodate || ''

      setForm({
        productCode: editData.productCode || '',
        productName: editData.productName || '',
        active: editData.active ?? true,
        effectiveFromDate: fDate.split('T')[0],
        effectiveToDate: tDate.split('T')[0],
      })
    } else {
      setForm({
        productCode: '',
        productName: '',
        active: true,
        effectiveFromDate: '',
        effectiveToDate: '',
      })
    }
    setErrors({})
  }, [editData, open])

  const handleSubmit = () => {
    const newErrors: any = {}
    if (!form.productCode.trim()) newErrors.productCode = 'Required'
    if (!form.productName.trim()) newErrors.productName = 'Required'
    if (!form.effectiveFromDate) newErrors.effectiveFromDate = 'Required'
    if (!form.effectiveToDate) newErrors.effectiveToDate = 'Required'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    // Validation: To Date cannot be before From Date
    if (new Date(form.effectiveToDate) < new Date(form.effectiveFromDate)) {
      onSubmit({ validationError: 'Effective To Date cannot be earlier than From Date' })
      return
    }

    onSubmit({
      ...form,
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${form.effectiveToDate}T00:00:00`,
    })
  }

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Product' : 'Create New Product'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              label="Product Code"
              fullWidth
              required
              disabled={!!editData}
              value={form.productCode}
              onChange={(e) => handleChange('productCode', e.target.value.toUpperCase())}
              error={!!errors.productCode}
              helperText={errors.productCode}
              placeholder="e.g., RMOW"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Product Name"
              fullWidth
              required
              value={form.productName}
              onChange={(e) => {
                const value = e.target.value
                setForm({ ...form, productName: value })

                if (!/^[A-Za-z\s]+$/.test(value)) {
                  setErrors({
                    ...errors,
                    productName: 'Only alphabets allowed',
                  })
                } else {
                  setErrors({
                    ...errors,
                    productName: '',
                  })
                }
              }}
              error={!!errors.productName}
              helperText={errors.productName}
              placeholder="e.g., Remittance - Outward"
            />
          </Grid>

          {/* <Grid item xs={6}>
            <TextField
              type="date"
              label="Effective From"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={form.effectiveFromDate}
              onChange={(e) => handleChange('effectiveFromDate', e.target.value)}
              error={!!errors.effectiveFromDate}
              helperText={errors.effectiveFromDate}
            />
          </Grid> */}
          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFromDate}
              onChange={(val: string) => handleChange('effectiveFromDate', val)}
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
              onChange={(val: string) => handleChange('effectiveToDate', val)}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              required
            />
          </Grid>

          {/* <Grid item xs={6}>
            <TextField
              type="date"
              label="Effective To"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={form.effectiveToDate}
              onChange={(e) => handleChange('effectiveToDate', e.target.value)}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              inputProps={{ min: form.effectiveFromDate }}
            />
          </Grid> */}

          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.active} onChange={(e) => handleChange('active', e.target.checked)} color="primary" />}
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
          {editData ? 'Update Product' : 'Save Product'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
