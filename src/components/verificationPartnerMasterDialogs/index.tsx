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
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'
import ErrorMessage from '../errorMessage'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

const filter = createFilterOptions({
  matchFrom: 'any',
  stringify: (o: any) => `${o.countryName} ${o.countryCode}`,
})

export default function VerificationPartnerMasterDialog({ open, onClose, onSubmit, editData, errMassage }: any) {
  const [countries] = useRecoilState(countyState)

  const initialFormState = {
    verificationPartnerCode: '',
    countryCode: '',
    verificationPartnerDescription: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  }

  const [form, setForm] = useState(initialFormState)
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (editData) {
      setForm({
        ...editData,
        effectiveFromDate: editData.effectiveFromDate?.split('T')[0] || '',
        effectiveToDate: editData.effectiveToDate?.split('T')[0] || '',
      })
    } else {
      setForm(initialFormState)
      setErrors({})
    }
  }, [editData, open])

  const handleChange = (e: any) => {
    const { name, value, checked, type } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const validate = () => {
    const newErrors: any = {}
    const requiredFields = ['countryCode', 'verificationPartnerDescription', 'effectiveFromDate', 'effectiveToDate']

    requiredFields.forEach((field) => {
      if (!form[field as keyof typeof form]) {
        newErrors[field] = 'Required'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      const cleanPayload = {
        // verificationPartnerCode: form.verificationPartnerCode,
        countryCode: form.countryCode,
        verificationPartnerDescription: form.verificationPartnerDescription,
        active: form.active,
        effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
        effectiveToDate: `${form.effectiveToDate}T23:59:59`,
      }
      onSubmit(cleanPayload)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>{editData ? 'Edit Verification Partner' : 'Add Verification Partner'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Autocomplete
              options={countries?.filter((c) => c.status === 'A') || []}
              filterOptions={filter}
              getOptionLabel={(option) => `${option.countryName} (${option.countryCode})`}
              value={countries?.find((c) => c.countryCode === form.countryCode) || null}
              disabled={!!editData}
              onChange={(_, newValue) => {
                setForm({ ...form, countryCode: newValue ? newValue.countryCode : '' })
                if (errors.countryCode) setErrors({ ...errors, countryCode: '' })
              }}
              renderInput={(params) => (
                <TextField {...params} label="Search Country" required error={!!errors.countryCode} helperText={errors.countryCode} />
              )}
            />
          </Grid>

          {/* <Grid item xs={12}>
            <TextField
              fullWidth
              label="Partner Code"
              name="verificationPartnerCode"
              value={form.verificationPartnerCode}
              onChange={handleChange}
              error={!!errors.verificationPartnerCode}
              helperText={errors.verificationPartnerCode}
              disabled={!!editData}
            />
          </Grid> */}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Partner Description"
              name="verificationPartnerDescription"
              value={form.verificationPartnerDescription}
              onChange={handleChange}
              error={!!errors.verificationPartnerDescription}
              helperText={errors.verificationPartnerDescription}
            />
          </Grid>

          {/* <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Effective From"
              name="effectiveFromDate"
              InputLabelProps={{ shrink: true }}
              value={form.effectiveFromDate}
              onChange={handleChange}
              error={!!errors.effectiveFromDate}
              helperText={errors.effectiveFromDate}
            />
          </Grid> */}
          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFromDate}
              onChange={(val: string) => {
                console.log(val, 'kdjhchdvy')
                setForm({ ...form, effectiveFromDate: val })
              }}
              error={!!errors.effectiveFrom}
              helperText={errors.effectiveFrom}
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
          {/* <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Effective To"
              name="effectiveToDate"
              InputLabelProps={{ shrink: true }}
              value={form.effectiveToDate}
              onChange={handleChange}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
            />
          </Grid> */}

          <Grid item xs={12}>
            <FormControlLabel control={<Checkbox name="active" checked={form.active} onChange={handleChange} color="primary" />} label="Active" />
          </Grid>
        </Grid>
      </DialogContent>

      <ErrorMessage errMessage={errMassage} />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: 'grey.600' }}>
          CANCEL
        </Button>
        <Button variant="contained" onClick={handleSubmit} sx={{ px: 4 }}>
          SAVE
        </Button>
      </DialogActions>
    </Dialog>
  )
}
