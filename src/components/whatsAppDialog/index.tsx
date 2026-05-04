import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Grid, Autocomplete } from '@mui/material'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

// Validation rules based on entity annotations
const VALIDATION_RULES = {
  countryCode: {
    max: 3,
    message: 'Country code cannot exceed 3 characters',
    required: true,
  },
  description: {
    max: 255,
    message: 'Description cannot exceed 255 characters',
    required: true,
    min: 3,
    minMessage: 'Description must be at least 3 characters',
    pattern: /^[A-Za-z\s]+$/,
    patternMessage: 'Only alphabets allowed',
  },
  toDate: { required: true, message: 'To Date is required' },
  fromDate: { required: true, message: 'From Date is required' },
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  editData?: any | null
  onFormChange?: (changed: boolean) => void
  isUpdateDisabled?: boolean
}

export default function WhatsappTemplateDialog({ open, onClose, onSubmit, editData, onFormChange, isUpdateDisabled }: Props) {
  const [countries] = useRecoilState(countyState)
  const [form, setForm] = useState({
    countryCode: '',
    description: '',
    fromDate: '',
    toDate: '',
    active: true,
  })
  const [originalData, setOriginalData] = useState<any>(null)
  const [errors, setErrors] = useState<any>({})

  // Check if form data has changed from original
  const checkFormChanged = (current: any, original: any) => {
    if (!original) return false

    return (
      current.description !== original.description ||
      current.fromDate !== original.fromDate ||
      current.toDate !== original.toDate ||
      current.active !== original.active
    )
  }

  useEffect(() => {
    if (open) {
      if (editData) {
        const newFormData = {
          countryCode: editData.countryCode || '',
          description: editData.whatsappTemplateDescription || editData.description || '',
          fromDate: editData.effectiveFromDate?.split('T')[0] || '',
          toDate: editData.effectiveToDate?.split('T')[0] || '',
          active: editData.active ?? true,
        }
        setForm(newFormData)
        setOriginalData(newFormData)
      } else {
        const newFormData = {
          countryCode: '',
          description: '',
          fromDate: '',
          toDate: '',
          active: true,
        }
        setForm(newFormData)
        setOriginalData(null)
      }
      setErrors({})
    }
  }, [editData, open])

  // Notify parent component when form changes
  useEffect(() => {
    if (onFormChange && originalData) {
      const changed = checkFormChanged(form, originalData)
      onFormChange(changed)
    }
  }, [form, originalData, onFormChange])

  // Handle field change with error clearing
  const handleFieldChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }

    // Clear toDate error when fromDate changes (if it was a date range error)
    if (field === 'fromDate' && errors.toDate?.includes('after')) {
      setErrors((prev: any) => ({ ...prev, toDate: '' }))
    }

    if (field === 'description' && value && !/^[A-Za-z\s]+$/.test(value)) {
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
        if (field === 'description' && rule.pattern && !rule.pattern.test(value)) {
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
        newErrors.effectiveToDate = 'Effective To date must be after Effective From date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    // Original payload structure preserved exactly
    const payload = {
      countryCode: form.countryCode,
      whatsappTemplateDescription: form.description.trim(),
      active: form.active,
      effectiveFromDate: `${form.fromDate}T00:00:00`,
      effectiveToDate: `${form.toDate}T00:00:00`,
    }

    onSubmit(payload)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update WhatsApp Template' : 'Create WhatsApp Template'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Country Autocomplete */}
          <Grid item xs={12}>
            <Autocomplete
              options={countries?.filter((c) => c.status === 'A') || []}
              getOptionLabel={(o) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c) => c.countryCode === form.countryCode) || null}
              disabled={!!editData}
              onChange={(_, val) => {
                handleFieldChange('countryCode', val ? val.countryCode : '')
              }}
              renderInput={(p) => (
                <TextField
                  {...p}
                  label="Country"
                  required
                  error={!!errors.countryCode}
                  helperText={errors.countryCode}
                  inputProps={{ ...p.inputProps, maxLength: VALIDATION_RULES.countryCode.max }}
                />
              )}
            />
          </Grid>

          {/* Description Field */}
          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth
              required
              value={form.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
              inputProps={{
                maxLength: VALIDATION_RULES.description.max,
                minLength: VALIDATION_RULES.description.min,
              }}
              multiline
              rows={2}
            />
          </Grid>

          {/* Effective From Date */}
          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.fromDate}
              onChange={(val: string) => handleFieldChange('fromDate', val)}
              error={!!errors.fromDate}
              helperText={errors.fromDate}
              required
            />
          </Grid>

          {/* Effective To Date */}
          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={form.toDate}
              minDate={form.fromDate}
              onChange={(val: string) => handleFieldChange('toDate', val)}
              error={!!errors.toDate}
              helperText={errors.toDate}
              required
            />
          </Grid>

          {/* Active Status */}
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.active} onChange={(e) => handleFieldChange('active', e.target.checked)} />}
              label="Active Status"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={editData ? isUpdateDisabled : false}>
          {editData ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
