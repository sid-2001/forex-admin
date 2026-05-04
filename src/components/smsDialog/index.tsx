import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Autocomplete,
  createFilterOptions,
  Grid,
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

// Validation rules based on common SMS template requirements
const VALIDATION_RULES = {
  countryCode: {
    max: 3,
    message: 'Country code cannot exceed 3 characters',
    required: true,
  },
  smsTemplateDescription: {
    max: 255,
    message: 'SMS description cannot exceed 255 characters',
    required: true,
    min: 3,
    minMessage: 'SMS description must be at least 3 characters',
  },
  smsContent: {
    max: 160, // Standard SMS character limit
    message: 'SMS content cannot exceed 160 characters for a single SMS',
  },
}

export default function SmsTemplateDialog({
  open,
  onClose,
  onSubmit,
  editData,

  //@ts-ignore
  errMassage,
}: any) {
  const [countries] = useRecoilState(countyState)

  const [countryCode, setCountryCode] = useState('')
  const [smsTemplateDescription, setSmsTemplateDescription] = useState('')
  const [smsContent, setSmsContent] = useState('') // Added for SMS content validation
  const [active, setActive] = useState(true)
  const [effectiveFromDate, setEffectiveFromDate] = useState('')
  const [effectiveToDate, setEffectiveToDate] = useState('')

  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (editData && open) {
      setCountryCode(editData.countryCode || '')
      setSmsTemplateDescription(editData.smsTemplateDescription || '')
      setSmsContent(editData.smsContent || '')
      setActive(editData.active ?? true)
      setEffectiveFromDate(editData.effectiveFromDate?.split('T')[0] || '')
      setEffectiveToDate(editData.effectiveToDate?.split('T')[0] || '')
      setErrors({})
    } else {
      // Reset state when opening a fresh "Add" dialog
      setCountryCode('')
      setSmsTemplateDescription('')
      setSmsContent('')
      setActive(true)
      setEffectiveFromDate('')
      setEffectiveToDate('')
      setErrors({})
    }
  }, [editData, open])

  // Handle field change with error clearing
  const handleFieldChange = (field: string, value: any) => {
    switch (field) {
      case 'countryCode':
        setCountryCode(value)
        break
      case 'smsTemplateDescription':
        setSmsTemplateDescription(value)
        break

      case 'active':
        setActive(value)
        break
      case 'effectiveFromDate':
        setEffectiveFromDate(value)
        // Clear effectiveToDate error when from date changes
        if (errors.effectiveToDate?.includes('after')) {
          setErrors((prev: any) => ({ ...prev, effectiveToDate: '' }))
        }
        break
      case 'effectiveToDate':
        setEffectiveToDate(value)
        break
    }

    // Clear error for this field when user makes changes
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
    if (field === 'smsTemplateDescription' && value && !/^[A-Za-z0-9\s]+$/.test(value)) {
      setErrors({
        ...errors,
        [field]: 'Only alphabets and numbers are allowed',
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

    // Required field validation
    if (!countryCode) {
      newErrors.countryCode = 'Country is required'
    } else if (countryCode.length > VALIDATION_RULES.countryCode.max) {
      newErrors.countryCode = VALIDATION_RULES.countryCode.message
    }

    // SMS Description validation
    if (!smsTemplateDescription.trim()) {
      newErrors.smsTemplateDescription = 'SMS description is required'
    } else {
      const desc = smsTemplateDescription.trim()
      if (desc.length < VALIDATION_RULES.smsTemplateDescription.min) {
        newErrors.smsTemplateDescription = VALIDATION_RULES.smsTemplateDescription.minMessage
      } else if (desc.length > VALIDATION_RULES.smsTemplateDescription.max) {
        newErrors.smsTemplateDescription = VALIDATION_RULES.smsTemplateDescription.message
      } else if (!/^[A-Za-z0-9\s]+$/.test(smsTemplateDescription)) {
        newErrors.smsTemplateDescription = 'Only alphabets and numbers are allowed'
      }
    }

    // SMS Content validation (if provided)
    if (smsContent && smsContent.length > VALIDATION_RULES.smsContent.max) {
      newErrors.smsContent = VALIDATION_RULES.smsContent.message
    }

    // Date validations
    if (!effectiveFromDate) {
      newErrors.effectiveFromDate = 'Effective From date is required'
    }

    if (!effectiveToDate) {
      newErrors.effectiveToDate = 'Effective To date is required'
    }

    // Date range validation
    if (effectiveFromDate && effectiveToDate) {
      const fromDate = new Date(effectiveFromDate)
      const toDate = new Date(effectiveToDate)

      if (toDate <= fromDate) {
        newErrors.effectiveToDate = 'Effective To date must be after Effective From date'
      }

      // Check if dates are valid
      if (isNaN(fromDate.getTime())) {
        newErrors.effectiveFromDate = 'Invalid date format'
      }
      if (isNaN(toDate.getTime())) {
        newErrors.effectiveToDate = 'Invalid date format'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const payload: any = {
      countryCode,
      smsTemplateDescription: smsTemplateDescription.trim(),
      active,
      effectiveFromDate: `${effectiveFromDate}T00:00:00`,
      effectiveToDate: `${effectiveToDate}T00:00:00`,
    }

    // Only include smsContent if it's provided
    if (smsContent.trim()) {
      payload.smsContent = smsContent.trim()
    }

    // Add audit fields
    if (!editData) {
      payload.createdBy = 'SYSTEM'
    } else {
      payload.modifiedBy = 'SYSTEM'
      payload.smsTemplateCode = editData.smsTemplateCode
    }

    onSubmit(payload)
  }

  // Calculate remaining characters for SMS content
  const remainingChars = VALIDATION_RULES.smsContent.max - (smsContent?.length || 0)
  const isNearLimit = remainingChars <= 20
  const isOverLimit = remainingChars < 0

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>{editData ? 'Update SMS Template' : 'Add SMS Template'}</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {/* Country Autocomplete */}
          <Autocomplete
            options={countries?.filter((c) => c.status === 'A') || []}
            filterOptions={filter}
            getOptionLabel={(o) => `${o.countryName} (${o.countryCode})`}
            value={countries?.find((c) => c.countryCode === countryCode) || null}
            disabled={!!editData}
            onChange={(_, val) => {
              handleFieldChange('countryCode', val ? val.countryCode : '')
            }}
            renderInput={(p) => (
              <TextField
                {...p}
                label="Search Country"
                required
                error={!!errors.countryCode}
                helperText={errors.countryCode}
                // helperText={errors.countryCode || `Max ${VALIDATION_RULES.countryCode.max} characters`}
                inputProps={{ ...p.inputProps, maxLength: VALIDATION_RULES.countryCode.max }}
              />
            )}
          />
          {/* SMS Description */}
          <TextField
            label="SMS Description"
            fullWidth
            required
            value={smsTemplateDescription}
            onChange={(e) => handleFieldChange('smsTemplateDescription', e.target.value)}
            error={!!errors.smsTemplateDescription}
            helperText={errors.smsTemplateDescription}
            inputProps={{
              maxLength: VALIDATION_RULES.smsTemplateDescription.max,
              minLength: VALIDATION_RULES.smsTemplateDescription.min,
            }}
          />
          {/* Effective From Date */}
          <DynamicDatePicker
            label="Effective From"
            value={effectiveFromDate}
            onChange={(val: string) => handleFieldChange('effectiveFromDate', val)}
            error={!!errors.effectiveFromDate}
            helperText={errors.effectiveFromDate}
            required
          />
          {/* Effective To Date */}
          <DynamicEndDatePicker
            label="Effective To"
            value={effectiveToDate}
            minDate={effectiveFromDate}
            onChange={(val: string) => handleFieldChange('effectiveToDate', val)}
            error={!!errors.effectiveToDate}
            helperText={errors.effectiveToDate}
            required
          />
          {/* Active Checkbox */}
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={active} onChange={(e) => handleFieldChange('active', e.target.checked)} />}
              label="Active"
            />
          </Grid>
        </Box>
      </DialogContent>

      {/* Error Message Display */}
      {/* <ErrorMessage errMessage={errMassage} /> */}

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: 'grey.600' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isOverLimit && Math.abs(remainingChars) > 50} // Disable if too many characters
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
