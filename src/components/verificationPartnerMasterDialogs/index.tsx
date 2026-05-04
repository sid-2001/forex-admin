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

const VALIDATION_RULES = {
  countryCode: { message: 'Country code is required', required: true },
  effectiveToDate: { required: true, message: 'To Date is required' },
  effectiveFromDate: { required: true, message: 'From Date is required' },
  verificationPartnerDescription: {
    pattern: /^[A-Za-z\s]+$/,
    patternMessage: 'Only alphabets allowed',
    required: true,
    message: 'Description is required',
  },
}

export default function VerificationPartnerMasterDialog({
  open,
  onClose,
  onSubmit,
  editData,

  //@ts-ignore
  errMassage,
}: any) {
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
    if (editData && open) {
      setForm({
        ...editData,
        effectiveFromDate: editData.effectiveFromDate?.split('T')[0] || '',
        effectiveToDate: editData.effectiveToDate?.split('T')[0] || '',
      })
      setErrors({})
    } else {
      setForm(initialFormState)
      setErrors({})
    }
  }, [editData, open])

  const handleChange = (e: any) => {
    const { name, value, checked, type } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors({ ...errors, [name]: '' })
    if (name === 'verificationPartnerDescription' && value && !/^[A-Za-z\s]+$/.test(value)) {
      setErrors({
        ...errors,
        [name]: 'Only alphabets allowed',
      })
    } else {
      setErrors({
        ...errors,
        [name]: '',
      })
    }
  }

  const validate = () => {
    const newErrors: any = {}

    Object.keys(VALIDATION_RULES).forEach((field) => {
      const rule = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES]
      const value = form[field as keyof typeof form]
      if (value) {
        // Max length validation
        //@ts-ignore
        if (rule.max && value.length > rule.max) {
          newErrors[field] = rule.message
        }

        //@ts-ignore
        if (field === 'verificationPartnerDescription' && rule.pattern && !rule.pattern.test(value)) {
          //@ts-ignore
          newErrors[field] = rule.patternMessage
        }
      } else if (
        //@ts-ignore
        rule.required
      ) {
        newErrors[field] = 'This field is required'
      }
    })

    // Date validation: effectiveToDate must be after effectiveFromDate
    if (form.effectiveFromDate && form.effectiveToDate) {
      const fromDate = new Date(form.effectiveFromDate)
      const toDate = new Date(form.effectiveToDate)

      if (toDate <= fromDate) {
        newErrors.effectiveToDate = 'Effective To date must be after Effective From date'
      }
    }

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
        effectiveToDate: `${form.effectiveToDate}T00:00:00`,
      }
      onSubmit(cleanPayload)
    }
  }

  // Handle date change with validation clearing
  const handleDateChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
    // Clear effectiveToDate error when effectiveFromDate changes
    if (field === 'effectiveFromDate' && errors.effectiveToDate) {
      setErrors({ ...errors, effectiveToDate: '' })
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

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Partner Description"
              name="verificationPartnerDescription"
              value={form.verificationPartnerDescription}
              onChange={handleChange}
              error={!!errors.verificationPartnerDescription}
              helperText={errors.verificationPartnerDescription}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFromDate}
              onChange={(val: string) => handleDateChange('effectiveFromDate', val)}
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
              onChange={(val: string) => handleDateChange('effectiveToDate', val)}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel control={<Checkbox name="active" checked={form.active} onChange={handleChange} color="primary" />} label="Active" />
          </Grid>
        </Grid>
      </DialogContent>

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
