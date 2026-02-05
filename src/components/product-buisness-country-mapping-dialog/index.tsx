import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Grid, Autocomplete } from '@mui/material'
import { useEffect, useState } from 'react'
import ProductBusinessCountryMappingService from '@/services/productBusinessCountryMapping.service'
import { useRecoilValue } from 'recoil'
import { countyState } from '@/states/state'
import { LocalStorageService } from '@/helpers/local-storage-service'

const service = new ProductBusinessCountryMappingService()
const local_service = new LocalStorageService()

export default function ProductBusinessCountryMappingDialog({ open, handleClose, editData, refreshList, showAlert }: any) {
  const countries = useRecoilValue(countyState)
  const [errors, setErrors] = useState<any>({})
  const [form, setForm] = useState<any>({
    productCode: '',
    recipientCountry: '',
    paymentRail: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  })

  useEffect(() => {
    if (editData && open) {
      const formatToDateOnly = (dateStr: string) => {
        if (!dateStr) return ''
        return dateStr.split('T')[0]
      }

      setForm({
        ...editData,
        // Using || logic to handle variations in API field naming
        productCode: editData.productCode || editData.businessMapCode || '',
        recipientCountry: editData.recipientCountry || '',
        paymentRail: editData.paymentRail || '',
        active: editData.active ?? true,
        effectiveFromDate: formatToDateOnly(editData.effectiveFromDate || editData.effective_from_date),
        effectiveToDate: formatToDateOnly(editData.effectiveToDate || editData.effective_to_date),
      })
    } else {
      setForm({
        productCode: '',
        recipientCountry: '',
        paymentRail: '',
        active: true,
        effectiveFromDate: '',
        effectiveToDate: '',
      })
    }
    setErrors({})
  }, [editData, open])

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }
  }

  const validate = () => {
    const errs: any = {}
    if (!form.productCode?.toString().trim()) errs.productCode = 'Required'
    if (!form.recipientCountry) errs.recipientCountry = 'Required'
    if (!form.paymentRail?.toString().trim()) errs.paymentRail = 'Required'
    if (!form.effectiveFromDate) errs.effectiveFromDate = 'Required'
    if (!form.effectiveToDate) errs.effectiveToDate = 'Required'

    if (form.effectiveFromDate && form.effectiveToDate) {
      if (new Date(form.effectiveToDate) < new Date(form.effectiveFromDate)) {
        errs.effectiveToDate = 'End date cannot be earlier than start date'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    const payload = {
      ...form,
      // Formatting to ISO for Backend
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00.000Z`,
      effectiveToDate: `${form.effectiveToDate}T23:59:59.000Z`,
      modifiedBy: local_service.get_staff_id(),
    }

    try {
      const res = editData
        ? await service.update(editData.businessMapCode, payload)
        : await service.create({ ...payload, createdBy: local_service.get_staff_id() })

      if (res) {
        showAlert('Success', `Mapping ${editData ? 'Updated' : 'Created'} Successfully`)
        refreshList()
        handleClose()
      }
    } catch (e) {
      showAlert('Fail', 'Server Error')
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Mapping' : 'Create Mapping'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Product Code"
              required
              fullWidth
              error={!!errors.productCode}
              helperText={errors.productCode}
              value={form.productCode}
              disabled={!!editData}
              onChange={(e) => handleChange('productCode', e.target.value.toUpperCase())}
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              options={countries?.filter((c: any) => c.status === 'A') || []}
              getOptionLabel={(o: any) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c: any) => c.countryCode === form.recipientCountry) || null}
              onChange={(_, val) => handleChange('recipientCountry', val?.countryCode || '')}
              renderInput={(p) => (
                <TextField {...p} label="Destination Country" required error={!!errors.recipientCountry} helperText={errors.recipientCountry} />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Payment Rail"
              required
              fullWidth
              error={!!errors.paymentRail}
              helperText={errors.paymentRail}
              value={form.paymentRail}
              onChange={(e) => handleChange('paymentRail', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              type="date"
              label="Effective From"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.effectiveFromDate}
              helperText={errors.effectiveFromDate}
              value={form.effectiveFromDate}
              onChange={(e) => handleChange('effectiveFromDate', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              type="date"
              label="Effective To"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              value={form.effectiveToDate}
              inputProps={{ min: form.effectiveFromDate }}
              onChange={(e) => handleChange('effectiveToDate', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.active} onChange={(e) => handleChange('active', e.target.checked)} />}
              label="Active Status"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editData ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
