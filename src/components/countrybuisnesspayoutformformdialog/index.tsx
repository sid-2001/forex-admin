import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Grid, Autocomplete } from '@mui/material'
import { useEffect, useState, useMemo } from 'react'
import CountryBusinessPayoutPartnerService from '@/services/countryBusinessPayoutPartner.service'
import ProductBusinessCountryMappingService from '@/services/productBusinessCountryMapping.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

const service = new CountryBusinessPayoutPartnerService()
const productBusinessService = new ProductBusinessCountryMappingService()
const local_service = new LocalStorageService()

export default function CountryBusinessPayoutPartnerFormDialog({ open, handleClose, editData, refreshList, showAlert }: any) {
  const [bussismessmapcode, setBussisnessmapcode] = useState<any[]>([])
  const [errors, setErrors] = useState<any>({})

  // Initial state uses camelCase
  const [form, setForm] = useState<any>({
    countryCorridorBusinessMapCode: '',
    businessTypeCode: '',
    payoutPartner: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  })

  useEffect(() => {
    if (open) {
      productBusinessService.getList().then((data: any) => {
        const list = Array.isArray(data) ? data : data?.data || []
        setBussisnessmapcode(list.filter((item: any) => item.active === true))
      })
    }
  }, [open])

  useEffect(() => {
    if (open) {
      if (editData) {
        // Edit Mode: Map incoming snake_case or camelCase to our form state
        const formatDate = (d: string) => (d && d.includes('T') ? d.split('T')[0] : d)
        setForm({
          ...editData,
          countryCorridorBusinessMapCode: editData.countryCorridorBusinessMapCode || '',
          effectiveFromDate: formatDate(editData.effectiveFromDate || editData.effective_from_date),
          effectiveToDate: formatDate(editData.effectiveToDate || editData.effective_to_date),
        })
      } else {
        // Create Mode: Explicitly blank dates
        setForm({
          countryCorridorBusinessMapCode: '',
          businessTypeCode: '',
          payoutPartner: '',
          active: true,
          effectiveFromDate: '',
          effectiveToDate: '',
        })
      }
      setErrors({})
    }
  }, [editData, open])

  const validate = () => {
    const errs: any = {}
    if (!form.countryCorridorBusinessMapCode) errs.countryCorridorBusinessMapCode = 'Required'
    if (!form.businessTypeCode) errs.businessTypeCode = 'Required'
    if (!form.payoutPartner) errs.payoutPartner = 'Required'
    if (!form.effectiveFromDate) errs.effectiveFromDate = 'Required'
    if (!form.effectiveToDate) errs.effectiveToDate = 'Required'

    // Date logical validation
    if (form.effectiveFromDate && form.effectiveToDate) {
      if (new Date(form.effectiveFromDate) > new Date(form.effectiveToDate)) {
        errs.effectiveFromDate = 'Start date cannot be after end date'
        errs.effectiveToDate = 'End date cannot be before start date'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    const staffId = local_service.get_staff_id()
    const payload = {
      ...form,
      // Sending back to API with correct spelling and time suffix
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${form.effectiveToDate}T00:00:00`,
    }

    try {
      const res = editData
        ? await service.update(editData.countryBusinessPayoutPartnerCode, { ...payload, modified_by: staffId })
        : await service.create({ ...payload, created_by: staffId })

      if (res && res.status === true) {
        showAlert('Success', `Partner ${editData ? 'Updated' : 'Created'} Successfully`)
        refreshList()
        handleClose()
      } else {
        showAlert('Fail', res?.message || 'Operation failed')
      }
    } catch (e) {
      showAlert('Fail', 'Server Error')
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Payout Partner' : 'Create Payout Partner'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Autocomplete
              options={bussismessmapcode}
              disabled={!!editData}
              getOptionLabel={(o: any) => o.businessMapCode || ''}
              value={bussismessmapcode.find((m) => m.businessMapCode === form.countryCorridorBusinessMapCode) || null}
              onChange={(_, val) => setForm({ ...form, countryCorridorBusinessMapCode: val?.businessMapCode || '' })}
              renderInput={(p) => (
                <TextField
                  {...p}
                  label="Corridor Business Map Code"
                  required
                  error={!!errors.countryCorridorBusinessMapCode}
                  helperText={errors.countryCorridorBusinessMapCode}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Business Type Code"
              fullWidth
              required
              value={form.businessTypeCode}
              onChange={(e) => setForm({ ...form, businessTypeCode: e.target.value.toUpperCase() })}
              error={!!errors.businessTypeCode}
              helperText={errors.businessTypeCode}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Payout Partner"
              fullWidth
              required
              value={form.payoutPartner}
              onChange={(e) => setForm({ ...form, payoutPartner: e.target.value })}
              error={!!errors.payoutPartner}
              helperText={errors.payoutPartner}
            />
          </Grid>
          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFromDate}
              onChange={(val: string) => {
                console.log(val, 'kdjhchdvy')
                setForm({ ...form, effectiveFromDate: val })
              }}
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
              onChange={(val: string) => {
                setForm({ ...form, effectiveToDate: val })
              }}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              required
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
              onChange={(e) => setForm({ ...form, effectiveFromDate: e.target.value })}
              error={!!errors.effectiveFromDate}
              helperText={errors.effectiveFromDate}
            />
          </Grid> */}
          {/* <Grid item xs={6}>
            <TextField
              type="date"
              label="Effective To"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={form.effectiveToDate}
              onChange={(e) => setForm({ ...form, effectiveToDate: e.target.value })}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              inputProps={{ min: form.effectiveFromDate }}
            />
          </Grid> */}
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
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
