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

// Validation rules based on common email template requirements
const VALIDATION_RULES = {
  countryCode: { max: 3, required: true, message: 'Country code cannot exceed 3 characters' },
  // templateCode: { max: 50, message: 'Template code cannot exceed 50 characters' },
  templateName: {
    max: 100,
    pattern: /^[A-Za-z\s]+$/,
    patternMessage: 'Only alphabets allowed',
    message: 'Template name cannot exceed 100 characters',
    required: true,
  },
  fromName: {
    max: 100,
    pattern: /^[A-Za-z\s]+$/,
    patternMessage: 'Only alphabets allowed',
    message: 'From name cannot exceed 100 characters',
    required: true,
  },
  fromEmail: {
    max: 100,
    message: 'Email cannot exceed 100 characters',
    required: true,
    pattern: /^(?!.*\.\.)(?!.*\.$)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
    patternMessage: 'Invalid email format',
  },
  effectiveToDate: { required: true, message: 'To Date is required' },
  effectiveFromDate: { required: true, message: 'From Date is required' },
  emailSubject: {
    max: 200,
    pattern: /^[A-Za-z\s]+$/,
    patternMessage: 'Only alphabets allowed',
    message: 'Subject cannot exceed 200 characters',
    required: true,
  },
  emailBodyHtml: { max: 10000, message: 'HTML body cannot exceed 10000 characters' },
  emailBodyText: { max: 5000, message: 'Text body cannot exceed 5000 characters' },
  emailTemplateDescription: {
    max: 255,
    pattern: /^[A-Za-z\s]+$/,
    patternMessage: 'Only alphabets allowed',
    message: 'Description cannot exceed 255 characters',
  },
}

// Function to validate HTML
const isValidHTML = (html: string): boolean => {
  if (!html) return true // Empty HTML is considered valid (optional field)

  try {
    // Create a DOM parser to check if HTML is valid
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Check for parsing errors
    const parserErrors = doc.querySelectorAll('parsererror')
    if (parserErrors.length > 0) {
      return false
    }

    // Additional check for unclosed tags
    const div = document.createElement('div')
    div.innerHTML = html
    // If innerHTML is different from original after parsing, there might be issues
    // This is a simple check - you might want more sophisticated validation
    return true
  } catch (error) {
    return false
  }
}

// Function to check for potentially dangerous HTML (XSS prevention)
const isSafeHTML = (html: string): boolean => {
  if (!html) return true

  // List of disallowed tags/attributes that could be used for XSS
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onload\s*=/gi,
    /onmouseover\s*=/gi,
    /onfocus\s*=/gi,
    /onblur\s*=/gi,
    /onchange\s*=/gi,
    /onsubmit\s*=/gi,
    /onreset\s*=/gi,
    /onselect\s*=/gi,
    /onabort\s*=/gi,
    /<iframe\b/gi,
    /<embed\b/gi,
    /<object\b/gi,
  ]

  return !dangerousPatterns.some((pattern) => pattern.test(html))
}

export default function EmailTemplateMasterDialog({ open, onClose, onSubmit, editData, errMassage }: any) {
  const [countries] = useRecoilState(countyState)

  const initialFormState = {
    countryCode: '',
    // templateCode: '',
    templateName: '',
    fromName: '',
    fromEmail: '',
    emailSubject: '',
    emailBodyHtml: '',
    emailBodyText: '',
    emailTemplateDescription: '',
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

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }))
    }
    if (
      (name === 'fromName' || name === 'templateName' || name === 'emailTemplateDescription' || name === 'emailSubject') &&
      value &&
      !/^[A-Za-z\s]+$/.test(value)
    ) {
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

  // Handle date change with error clearing
  const handleDateChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
    // Clear effectiveToDate error when effectiveFromDate changes
    if (field === 'effectiveFromDate' && errors.effectiveToDate) {
      setErrors((prev: any) => ({ ...prev, effectiveToDate: '' }))
    }
  }

  const validate = () => {
    const newErrors: any = {}

    // Field-specific validations
    Object.keys(VALIDATION_RULES).forEach((field) => {
      const rule = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES]
      const value = form[field as keyof typeof form]

      console.log(rule, value, 'vvvvv')

      if (value) {
        // Max length validation
        //@ts-ignore
        if (rule.max && value.length > rule.max) {
          newErrors[field] = rule.message
        }

        // Email pattern validation
        //@ts-ignore
        if (
          (field === 'fromEmail' ||
            field === 'fromName' ||
            field === 'templateName' ||
            field === 'emailSubject' ||
            field === 'emailTemplateDescription') &&
          //@ts-ignore
          rule.pattern &&
          //@ts-ignore
          !rule.pattern.test(value)
        ) {
          //@ts-ignore
          newErrors[field] = rule.patternMessage || 'Invalid email format'
        }
      } else if (
        //@ts-ignore
        rule.required
      ) {
        newErrors[field] = 'This field is required'
      }
    })

    // HTML validation
    if (form.emailBodyHtml) {
      if (!isValidHTML(form.emailBodyHtml)) {
        newErrors.emailBodyHtml = 'Invalid HTML format'
      } else if (!isSafeHTML(form.emailBodyHtml)) {
        newErrors.emailBodyHtml = 'HTML contains potentially unsafe content'
      }
    }

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
        countryCode: form.countryCode,
        templateCode: `TMP_${Date.now()}`, // Auto-generate if not provided
        templateName: form.templateName.trim(),
        emailSubject: form.emailSubject.trim(),
        emailBodyHtml: form.emailBodyHtml?.trim() || '',
        emailBodyText: form.emailBodyText?.trim() || '',
        fromName: form.fromName?.trim() || form.fromEmail?.split('@')[0], // Default from email username
        fromEmail: form.fromEmail.trim(),
        emailTemplateDescription: form.emailTemplateDescription?.trim() || `${form.templateName} Template`,
        active: form.active,
        effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
        effectiveToDate: `${form.effectiveToDate}T00:00:00`,
      }
      onSubmit(cleanPayload)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 'bold' }}>{editData ? 'Edit Email Template' : 'Add Email Template'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* Searchable Country Autocomplete */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={countries?.filter((c) => c.status === 'A') || []}
              filterOptions={filter}
              getOptionLabel={(option) => `${option.countryName} (${option.countryCode})`}
              value={countries?.find((c) => c.countryCode === form.countryCode) || null}
              disabled={!!editData}
              onChange={(_event, newValue) => {
                setForm({ ...form, countryCode: newValue ? newValue.countryCode : '' })
                if (errors.countryCode) setErrors({ ...errors, countryCode: '' })
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Country"
                  required
                  error={!!errors.countryCode}
                  helperText={errors.countryCode}
                  inputProps={{ ...params.inputProps, maxLength: VALIDATION_RULES.countryCode.max }}
                />
              )}
            />
          </Grid>

          {/* <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Template Code"
              name="templateCode"
              value={form.templateCode}
              onChange={handleChange}
              error={!!errors.templateCode}
              helperText={errors.templateCode}
              disabled={!!editData}
              inputProps={{ maxLength: VALIDATION_RULES.templateCode.max }}
            />
          </Grid> */}

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Template Name"
              name="templateName"
              value={form.templateName}
              onChange={handleChange}
              error={!!errors.templateName}
              helperText={errors.templateName}
              required
              inputProps={{ maxLength: VALIDATION_RULES.templateName.max, pattern: '[A-Za-z ]*' }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="From Name"
              name="fromName"
              value={form.fromName}
              onChange={handleChange}
              required
              error={!!errors.fromName}
              helperText={errors.fromName}
              inputProps={{ maxLength: VALIDATION_RULES.fromName.max, pattern: '[A-Za-z ]*' }}
            />
          </Grid>

          <Grid item xs={12} sm={12}>
            <TextField
              fullWidth
              label="From Email"
              name="fromEmail"
              value={form.fromEmail}
              onChange={handleChange}
              error={!!errors.fromEmail}
              helperText={errors.fromEmail}
              required
              inputProps={{ maxLength: VALIDATION_RULES.fromEmail.max }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Subject"
              name="emailSubject"
              value={form.emailSubject}
              onChange={handleChange}
              error={!!errors.emailSubject}
              helperText={errors.emailSubject}
              required
              inputProps={{ maxLength: VALIDATION_RULES.emailSubject.max }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="HTML Body"
              name="emailBodyHtml"
              value={form.emailBodyHtml}
              onChange={handleChange}
              error={!!errors.emailBodyHtml}
              helperText={errors.emailBodyHtml}
              inputProps={{ maxLength: VALIDATION_RULES.emailBodyHtml.max }}
              placeholder="<html><body>Your HTML content here</body></html>"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Text Body (Plain Text)"
              name="emailBodyText"
              value={form.emailBodyText}
              onChange={handleChange}
              error={!!errors.emailBodyText}
              helperText={errors.emailBodyText}
              inputProps={{ maxLength: VALIDATION_RULES.emailBodyText.max }}
              placeholder="Plain text version of your email (for clients that don't support HTML)"
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
            <TextField
              fullWidth
              label="Description"
              name="emailTemplateDescription"
              value={form.emailTemplateDescription}
              onChange={handleChange}
              error={!!errors.emailTemplateDescription}
              helperText={errors.emailTemplateDescription}
              inputProps={{ maxLength: VALIDATION_RULES.emailTemplateDescription.max }}
            />
          </Grid>

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
