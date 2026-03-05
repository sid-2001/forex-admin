import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Grid, Autocomplete } from '@mui/material'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

// Validation rules
const VALIDATION_RULES = {
  countryCode: { 
    max: 3, 
    message: 'Country code cannot exceed 3 characters',
    required: true 
  },
  description: { 
    max: 255, 
    message: 'Description cannot exceed 255 characters',
    required: true,
    min: 3,
    minMessage: 'Description must be at least 3 characters'
  }
}

export default function WhatsappTemplateDialog({ open, onClose, onSubmit, editData }: any) {
  const [countries] = useRecoilState(countyState)
  const [form, setForm] = useState({
    countryCode: '',
    description: '',
    fromDate: '',
    toDate: '',
    active: true,
  })
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (open) {
      if (editData) {
        setForm({
          countryCode: editData.countryCode || '',
          description: editData.whatsappTemplateDescription || editData.description || '',
          fromDate: editData.effectiveFromDate?.split('T')[0] || '',
          toDate: editData.effectiveToDate?.split('T')[0] || '',
          active: editData.active ?? true,
        })
      } else {
        setForm({
          countryCode: '',
          description: '',
          fromDate: '',
          toDate: '',
          active: true,
        })
      }
      setErrors({})
    }
  }, [editData, open])

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
  }

  const validate = () => {
    const newErrors: any = {}

    // Country Code validation
    if (!form.countryCode) {
      newErrors.countryCode = 'Country is required'
    } else if (form.countryCode.length > VALIDATION_RULES.countryCode.max) {
      newErrors.countryCode = VALIDATION_RULES.countryCode.message
    }

    // Description validation
    if (!form.description.trim()) {
      newErrors.description = 'Description is required'
    } else {
      const desc = form.description.trim()
      if (desc.length < VALIDATION_RULES.description.min) {
        newErrors.description = VALIDATION_RULES.description.minMessage
      } else if (desc.length > VALIDATION_RULES.description.max) {
        newErrors.description = VALIDATION_RULES.description.message
      }
    }

    // Date validations
    if (!form.fromDate) {
      newErrors.fromDate = 'Effective From date is required'
    }

    if (!form.toDate) {
      newErrors.toDate = 'Effective To date is required'
    }

    // Date range validation
    if (form.fromDate && form.toDate) {
      const fromDate = new Date(form.fromDate)
      const toDate = new Date(form.toDate)
      
      // Check if dates are valid
      if (isNaN(fromDate.getTime())) {
        newErrors.fromDate = 'Invalid date format'
      }
      if (isNaN(toDate.getTime())) {
        newErrors.toDate = 'Invalid date format'
      }
      
      // Check if toDate is after fromDate
      if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime()) && toDate <= fromDate) {
        newErrors.toDate = 'Effective To date must be after Effective From date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    
    const payload = {
      countryCode: form.countryCode,
      whatsappTemplateDescription: form.description.trim(),
      active: form.active,
      effectiveFromDate: `${form.fromDate}T00:00:00`,
      effectiveToDate: `${form.toDate}T23:59:59`,
    }

    // Add audit fields
    if (editData) {
      Object.assign(payload, {
        modifiedBy: 'SYSTEM', // Replace with actual user from auth
        whatsappTemplateCode: editData.whatsappTemplateCode
      })
    } else {
      Object.assign(payload, {
        createdBy: 'SYSTEM' // Replace with actual user from auth
      })
    }

    onSubmit(payload)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
        {editData ? 'Update WhatsApp Template' : 'Create WhatsApp Template'}
      </DialogTitle>
      
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
                  helperText={errors.countryCode || `Max ${VALIDATION_RULES.countryCode.max} characters`}
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
              helperText={
                errors.description || 
                `${form.description.length}/${VALIDATION_RULES.description.max} characters (min: ${VALIDATION_RULES.description.min})`
              }
              inputProps={{ 
                maxLength: VALIDATION_RULES.description.max,
                minLength: VALIDATION_RULES.description.min
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
              control={
                <Checkbox 
                  checked={form.active} 
                  onChange={(e) => handleFieldChange('active', e.target.checked)} 
                />
              }
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
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}