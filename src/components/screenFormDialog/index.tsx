import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Grid, Autocomplete } from '@mui/material'
import { useState, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

const VALIDATION_RULES = {
  selectedCountry: {
    max: 3,
    message: 'Country code cannot exceed 3 characters',
    required: true,
    pattern: /^[A-Z]{2,3}$/,
    patternMessage: 'Country code should be 2-3 uppercase letters',
  },
  screencode: {
    message: 'Screen Code cannot exceed 3 characters',
    pattern: /^[A-Za-z\s]+$/,
    patternMessage: 'Only alphabets allowed',
    required: true,
    max: 3,
  },
  description: {
    message: 'Description is required',
    pattern: /^[A-Za-z\s]+$/,
    patternMessage: 'Only alphabets allowed',
    required: true,
  },
  toDate: { required: true, message: 'To Date is required' },
  fromDate: { required: true, message: 'From Date is required' },
}

export default function ScreenFormDialog({ open, onClose, onSubmit, editData }: any) {
  const [countries] = useRecoilState(countyState)
  const [form, setForm] = useState({
    screencode: '',
    description: '',
    selectedCountry: '',
    fromDate: '',
    toDate: '',
    active: true,
  })

  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (open) {
      if (editData) {
        // Update these keys to match your PascalCase API response
        setForm({
          screencode: editData.ScreenCode || '',
          description: editData.ScreenDescription || '',
          selectedCountry: editData.CountryCode || '',
          fromDate: editData.EffectiveFromDate?.split('T')[0] || '',
          toDate: editData.EffectiveToDate?.split('T')[0] || '',
          active: editData.Active ?? true,
        })
      } else {
        setForm({
          screencode: '',
          description: '',
          selectedCountry: '',
          fromDate: '',
          toDate: '',
          active: true,
        })
      }
      setErrors({})
    }
  }, [editData, open])

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      //@ts-ignore
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
    // Clear toDate error when fromDate changes (if it was a date range error)
    if (field === 'fromDate' && errors.toDate?.includes('after')) {
      setErrors((prev: any) => ({ ...prev, toDate: '' }))
    }
    if ((field === 'description' || field === 'screencode') && value && !/^[A-Za-z\s]+$/.test(value)) {
      setErrors({
        ...errors,
        [field]: 'Only alphabets allowed',
      })
    } else {
      setErrors({
        ...errors,
        [field]: '',
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
        if ((field === 'description' || field === 'screenCode' || field === 'countryCode') && rule.pattern && !rule.pattern.test(value)) {
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
    if (form.fromDate && form.toDate) {
      const fromDate = new Date(form.fromDate)
      const toDate = new Date(form.toDate)

      if (toDate <= fromDate) {
        newErrors.toDate = 'Effective To date must be after Effective From date'
      }
    }

    setErrors(newErrors)
    console.log(newErrors, 'ERROS')
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    console.log(form, '-----------')
    if (!validate()) return

    onSubmit({
      screencode: form.screencode,
      screendescription: form.description,
      active: form.active,
      selectedCountry: form.selectedCountry,
      fromDate: form.fromDate,
      toDate: form.toDate,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Screen' : 'Add Screen'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Autocomplete
              options={countries?.filter((c) => c.status === 'A') || []}
              getOptionLabel={(o) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c) => c.countryCode === form.selectedCountry) || null}
              disabled={!!editData}
              onChange={(_, val) => handleChange('selectedCountry', val ? val.countryCode : '')}
              renderInput={(p) => (
                <TextField {...p} label="Destination Country" required error={!!errors.selectedCountry} helperText={errors.selectedCountry} />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Screen Code"
              required
              disabled={!!editData}
              value={form.screencode}
              onChange={(e) => handleChange('screencode', e.target.value.toUpperCase())}
              error={!!errors.screencode}
              helperText={errors.screencode}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              required
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.fromDate}
              onChange={(val: string) => handleChange('fromDate', val)}
              error={!!errors.fromDate}
              helperText={errors.fromDate}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={form.toDate}
              minDate={form.fromDate}
              onChange={(val: string) => handleChange('toDate', val)}
              error={!!errors.toDate}
              helperText={errors.toDate}
              required
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
