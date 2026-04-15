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
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

const filter = createFilterOptions({
  matchFrom: 'any',
  stringify: (o: any) => `${o.countryName} ${o.countryCode}`,
})

const VALIDATION_RULES = {
  countryCode: {
    max: 3,
    message: 'Country code cannot exceed 3 characters',
    required: true,
    pattern: /^[A-Z]{2,3}$/,
    patternMessage: 'Country code should be 2-3 uppercase letters',
  },
  stateCode: {
    message: 'State Code is required',
    pattern: /^[A-Za-z\s]+$/,
    patternMessage: 'Only alphabets allowed',
    required: true,
  },
  description: {
    message: 'Description is required',
    pattern: /^[A-Za-z\s]+$/,
    patternMessage: 'Only alphabets allowed',
    required: true,
  },
  effectiveToDate: { required: true, message: 'To Date is required' },
  effectiveFromDate: { required: true, message: 'From Date is required' },
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  editData?: any | null
}

export default function StateFormDialog({ open, onClose, onSubmit, editData }: Props) {
  const [form, setForm] = useState({
    stateCode: '',
    description: '',
    countryCode: '',
    effectiveFromDate: '',
    effectiveToDate: '',
    active: true,
  })
  const [errors, setErrors] = useState<any>({})
  const [countries] = useRecoilState(countyState)

  useEffect(() => {
    if (editData && open) {
      setForm({
        stateCode: editData.StateCode || '',
        description: editData.StateDescription || '',
        countryCode: editData.CountryCode || '',
        effectiveFromDate: editData.EffectiveFromDate ? editData.EffectiveFromDate.split('T')[0] : '',
        effectiveToDate: editData.EffectiveToDate ? editData.EffectiveToDate.split('T')[0] : '',
        active: editData.Active ?? true,
      })
    } else {
      setForm({ stateCode: '', description: '', countryCode: '', effectiveFromDate: '', effectiveToDate: '', active: true })
    }
    setErrors({})
  }, [editData, open])

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
        if ((field === 'description' || field === 'stateCode' || field === 'countryCode') && rule.pattern && !rule.pattern.test(value)) {
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
    if (!validate()) return

    // Clean payload: Remove primary keys before sending to API
    const { ...cleanData } = form as any

    onSubmit({
      ...cleanData,
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${form.effectiveToDate}T00:00:00`,
    })
  }

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update State' : 'Create State'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Autocomplete
              options={countries?.filter((c: any) => c.status === 'A') || []}
              filterOptions={filter}
              getOptionLabel={(o: any) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c: any) => c.countryCode === form.countryCode) || null}
              disabled={!!editData}
              onChange={(_, val) => handleChange('countryCode', val?.countryCode || '')}
              renderInput={(p) => <TextField {...p} label="Country" error={!!errors.countryCode} helperText={errors.countryCode} required />}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="State Code"
              inputProps={{ maxLength: 10 }}
              value={form.stateCode}
              disabled={!!editData}
              onChange={(e: any) => handleChange('stateCode', e.target.value.toUpperCase() || '')}
              error={!!errors.stateCode}
              helperText={errors.stateCode}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="State Description"
              value={form.description}
              onChange={(e: any) => handleChange('description', e.target.value || '')}
              error={!!errors.description}
              helperText={errors.description}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFromDate}
              onChange={(val: string) => {
                setForm({ ...form, effectiveFromDate: val })
              }}
              minDate={new Date().toISOString().split('T')[0]}
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
