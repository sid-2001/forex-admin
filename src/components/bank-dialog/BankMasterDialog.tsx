import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Autocomplete,
  createFilterOptions,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilValue } from 'recoil'
import { countyState } from '@/states/state'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

const filter = createFilterOptions({
  matchFrom: 'any',
  stringify: (o: any) => `${o.countryName} ${o.countryCode}`,
})

export default function BankMasterDialog({ open, onClose, onSubmit, editData }: any) {
  const localService = new LocalStorageService()
  const countries = useRecoilValue(countyState)
  const [errors, setErrors] = useState<any>({})

  const [form, setForm] = useState<any>({
    countryCode: '',
    currencyCode: 'INR',
    bankCode: '',
    bankName: '',
    bankBranchCode: '',
    bankIfscBicCode: '',
    bankStateProvinceCode: '',
    bankCity: '',
    bankPostalCode: '',
    active: true,
    effective_from_date: '',
    effective_to_date: '',
  })

  useEffect(() => {
    if (editData && open) {
      const fDate = editData.effective_from_date || editData.effectiveFromDate || editData.effectivefromdate || ''
      const tDate = editData.effective_to_date || editData.effectiveToDate || editData.effectivetodate || ''

      setForm({
        ...editData,
        effective_from_date: fDate.includes('T') ? fDate.split('T')[0] : fDate,
        effective_to_date: tDate.includes('T') ? tDate.split('T')[0] : tDate,
      })
    } else {
      setForm({
        countryCode: '',
        currencyCode: 'INR',
        bankCode: '',
        bankName: '',
        bankBranchCode: '',
        bankIfscBicCode: '',
        bankStateProvinceCode: '',
        bankCity: '',
        bankPostalCode: '',
        active: true,
        effective_from_date: '',
        effective_to_date: '',
      })
    }
    setErrors({})
  }, [editData, open])

  const handleSubmit = () => {
    const newErrors: any = {}
    const requiredFields = [
      'countryCode',
      'bankCode',
      'bankName',
      'bankBranchCode',
      'bankIfscBicCode',
      'bankCity',
      'bankStateProvinceCode',
      'bankPostalCode',
      'effective_from_date',
      'effective_to_date',
    ]

    requiredFields.forEach((field) => {
      if (!form[field]) newErrors[field] = 'Required'
    })

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    // Date Validation
    if (new Date(form.effective_to_date) < new Date(form.effective_from_date)) {
      onSubmit({ validationError: 'End Date cannot be earlier than Start Date' })
      return
    }

    onSubmit({
      ...form,
      created_by: localService.get_staff_id(),
      modified_by: editData ? localService.get_staff_id() : undefined,
      effective_from_date: `${form.effective_from_date}T00:00:00.000Z`,
      effective_to_date: `${form.effective_to_date}T00:00:00.000Z`,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Bank' : 'Add Bank'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={6}>
            <Autocomplete
              options={countries?.filter((c: any) => c.status === 'A') || []}
              filterOptions={filter}
              getOptionLabel={(o: any) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c: any) => c.countryCode === form.countryCode) || null}
              onChange={(_, val) => setForm({ ...form, countryCode: val ? val.countryCode : '' })}
              renderInput={(p) => <TextField {...p} label="Country" required error={!!errors.countryCode} helperText={errors.countryCode} />}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Bank Code"
              required
              disabled={!!editData}
              value={form.bankCode}
              onChange={(e) => setForm({ ...form, bankCode: e.target.value })}
              error={!!errors.bankCode}
              helperText={errors.bankCode}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bank Name"
              required
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              error={!!errors.bankName}
              helperText={errors.bankName}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Branch Code"
              required
              value={form.bankBranchCode}
              onChange={(e) => setForm({ ...form, bankBranchCode: e.target.value })}
              error={!!errors.bankBranchCode}
              helperText={errors.bankBranchCode}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="IFSC / BIC"
              required
              value={form.bankIfscBicCode}
              onChange={(e) => setForm({ ...form, bankIfscBicCode: e.target.value })}
              error={!!errors.bankIfscBicCode}
              helperText={errors.bankIfscBicCode}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="City"
              required
              value={form.bankCity}
              onChange={(e) => setForm({ ...form, bankCity: e.target.value })}
              error={!!errors.bankCity}
              helperText={errors.bankCity}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="State"
              required
              value={form.bankStateProvinceCode}
              onChange={(e) => setForm({ ...form, bankStateProvinceCode: e.target.value })}
              error={!!errors.bankStateProvinceCode}
              helperText={errors.bankStateProvinceCode}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Postal Code"
              required
              value={form.bankPostalCode}
              onChange={(e) => setForm({ ...form, bankPostalCode: e.target.value })}
              error={!!errors.bankPostalCode}
              helperText={errors.bankPostalCode}
            />
          </Grid>

          {/* <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              label="Effective From"
              required
              InputLabelProps={{ shrink: true }}
              value={form.effective_from_date}
              onChange={(e) => setForm({ ...form, effective_from_date: e.target.value })}
              error={!!errors.effective_from_date}
              helperText={errors.effective_from_date}
            />
          </Grid> */}
          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effective_from_date}
              onChange={(val: string) => {
                console.log(val, 'kdjhchdvy')
                setForm({ ...form, effective_from_date: val })
              }}
              error={!!errors.effective_from_date}
              helperText={errors.effective_from_date}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={form.effective_to_date}
              minDate={form.effective_from_date}
              onChange={(val: string) => {
                setForm({ ...form, effective_to_date: val })
              }}
              error={!!errors.effective_to_date}
              helperText={errors.effective_to_date}
              required
            />
          </Grid>

          {/* <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              label="Effective To"
              required
              InputLabelProps={{ shrink: true }}
              value={form.effective_to_date}
              onChange={(e) => setForm({ ...form, effective_to_date: e.target.value })}
              error={!!errors.effective_to_date}
              helperText={errors.effective_to_date}
              inputProps={{ min: form.effective_from_date }}
            /> */}
          {/* </Grid> */}

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
