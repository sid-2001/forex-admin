// components/forex-country-dialog.tsx
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
  InputAdornment,
  Tooltip,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { ForexCountry } from '../../services/forextcoutnry.service'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  editData?: ForexCountry | null
}

// Validation rules
const VALIDATION_RULES = {
  countryCode: {
    max: 3,
    message: 'Country code cannot exceed 3 characters',
    required: true,
    pattern: /^[A-Z]{2,3}$/,
    patternMessage: 'Country code should be 2-3 uppercase letters',
  },
  countryName: {
    max: 100,
    message: 'Country name cannot exceed 100 characters',
    required: true,
    min: 2,
    minMessage: 'Country name must be at least 2 characters',
  },
  countryPhoneCode: {
    max: 4,
    message: 'Phone code cannot exceed 4 characters',
    required: true,
    pattern: /^\+\d{1,4}$/,
    patternMessage: 'Phone code should be + followed by 1-4 digits (e.g., +91, +1)',
  },
  countryFlag: {
    max: 10,
    message: 'Flag symbol cannot exceed 10 characters',
    // Emoji pattern - matches most flag emojis and common symbols
    pattern: /^[\u{1F1E6}-\u{1F1FF}\u{1F3F4}\u{E0000}-\u{E007F}\u{1F1F0}-\u{1F1FF}\p{Emoji}\p{So}]+$/u,
    patternMessage: 'Please enter a valid flag emoji or symbol',
  },
  countryFlagUrl: {
    max: 500,
    message: 'Flag URL cannot exceed 500 characters',
    pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i,
    patternMessage: 'Please enter a valid URL',
  },
  effectiveToDate: { required: true, message: 'To Date is required' },
  effectiveFromDate: { required: true, message: 'From Date is required' },
}

// Function to check if a string contains emoji
const containsEmoji = (str: string): boolean => {
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u
  return emojiRegex.test(str)
}

// Function to extract flag emoji from country code (for helper)
const getFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return ''
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export default function ForexCountryDialog({ open, onClose, onSubmit, editData }: Props) {
  const localService = new LocalStorageService()

  const [form, setForm] = useState<any>({
    countryCode: '',
    countryName: '',
    active: true,
    countryFlag: '',
    countryFlagUrl: '',
    countryPhoneCode: '',
    effectiveFromDate: '',
    effectiveToDate: '',
  })

  const [errors, setErrors] = useState<any>({})
  const [flagPreview, setFlagPreview] = useState<string>('')

  const formatDate = (dateStr: any) => {
    if (!dateStr) return ''
    const str = String(dateStr)
    return str.includes('T') ? str.split('T')[0] : str
  }

  useEffect(() => {
    if (editData && open) {
      const activeStatus = editData.status === 'A' || editData.active === true

      setForm({
        countryCode: editData.countryCode || '',
        countryName: editData.countryName || '',
        active: activeStatus,
        countryFlag: editData.countryFlag || '',
        countryFlagUrl: editData.countryFlagUrl || '',
        countryPhoneCode: editData.countryPhoneCode || '',
        effectiveFromDate: formatDate(editData.effectiveFromDate),
        effectiveToDate: formatDate(editData.effectiveToDate),
      })

      // Set flag preview if exists
      if (editData.countryFlag && containsEmoji(editData.countryFlag)) {
        setFlagPreview(editData.countryFlag)
      } else {
        setFlagPreview('')
      }
    } else if (open) {
      setForm({
        countryCode: '',
        countryName: '',
        active: true,
        countryFlag: '',
        countryFlagUrl: '',
        countryPhoneCode: '',
        effectiveFromDate: '',
        effectiveToDate: '',
      })
      setFlagPreview('')
    }
    setErrors({})
  }, [editData, open])

  // Handle field change with error clearing
  const handleFieldChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))

    // Update flag preview for emoji
    if (field === 'countryFlag') {
      if (containsEmoji(value)) {
        setFlagPreview(value)
      } else {
        setFlagPreview('')
      }
    }
    if ((field === 'countryName' || field === 'countryCode') && value && !/^[A-Za-z\s]+$/.test(value)) {
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

    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
  }

  // Auto-generate flag emoji from country code
  const generateFlagFromCode = () => {
    if (form.countryCode && form.countryCode.length === 2) {
      const flagEmoji = getFlagEmoji(form.countryCode)
      handleFieldChange('countryFlag', flagEmoji)
    }
  }

  const validate = () => {
    const newErrors: any = {}

    // Country Code validation
    if (!form.countryCode) {
      newErrors.countryCode = 'Country code is required'
    } else {
      const code = form.countryCode.toUpperCase()
      if (code.length > VALIDATION_RULES.countryCode.max) {
        newErrors.countryCode = VALIDATION_RULES.countryCode.message
      } else if (!VALIDATION_RULES.countryCode.pattern.test(code)) {
        newErrors.countryCode = VALIDATION_RULES.countryCode.patternMessage
      }
    }

    // Country Name validation
    if (!form.countryName.trim()) {
      newErrors.countryName = 'Country name is required'
    } else {
      const name = form.countryName.trim()
      if (name.length < VALIDATION_RULES.countryName.min) {
        newErrors.countryName = VALIDATION_RULES.countryName.minMessage
      } else if (name.length > VALIDATION_RULES.countryName.max) {
        newErrors.countryName = VALIDATION_RULES.countryName.message
      }
    }

    // Phone Code validation
    if (!form.countryPhoneCode) {
      newErrors.countryPhoneCode = 'Phone code is required'
    } else {
      const phoneCode = form.countryPhoneCode.trim()
      if (phoneCode.length > VALIDATION_RULES.countryPhoneCode.max) {
        newErrors.countryPhoneCode = VALIDATION_RULES.countryPhoneCode.message
      } else if (!VALIDATION_RULES.countryPhoneCode.pattern.test(phoneCode)) {
        newErrors.countryPhoneCode = VALIDATION_RULES.countryPhoneCode.patternMessage
      }
    }

    // Country Flag validation (optional but if provided, validate it's a proper emoji/symbol)
    if (form.countryFlag) {
      const flag = form.countryFlag.trim()
      if (flag.length > VALIDATION_RULES.countryFlag.max) {
        newErrors.countryFlag = VALIDATION_RULES.countryFlag.message
      } else if (VALIDATION_RULES.countryFlag.pattern && !VALIDATION_RULES.countryFlag.pattern.test(flag)) {
        // If it doesn't match emoji pattern but might be a text flag
        if (!containsEmoji(flag) && !/^[A-Za-z]{2}$/.test(flag)) {
          newErrors.countryFlag = VALIDATION_RULES.countryFlag.patternMessage
        }
      }
    }

    // Flag URL validation (optional)
    if (form.countryFlagUrl) {
      const url = form.countryFlagUrl.trim()
      if (url.length > VALIDATION_RULES.countryFlagUrl.max) {
        newErrors.countryFlagUrl = VALIDATION_RULES.countryFlagUrl.message
      } else if (VALIDATION_RULES.countryFlagUrl.pattern && !VALIDATION_RULES.countryFlagUrl.pattern.test(url)) {
        newErrors.countryFlagUrl = VALIDATION_RULES.countryFlagUrl.patternMessage
      }
    }

    if (!form.effectiveFromDate) newErrors.effectiveFromDate = 'From Date is required'
    if (!form.effectiveToDate) newErrors.effectiveToDate = 'To Date is required'

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

    const payload = {
      countryCode: form.countryCode.toUpperCase(),
      countryName: form.countryName.trim(),
      countryPhoneCode: form.countryPhoneCode.trim(),
      countryFlag: form.countryFlag?.trim() || null,
      countryFlagUrl: form.countryFlagUrl?.trim() || null,
      active: form.active,
      status: form.active ? 'A' : 'I',
      createdBy: localService.get_staff_id(),
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${form.effectiveToDate}T00:00:00`,
      ...(editData && { modifiedBy: localService.get_staff_id() }),
    }

    onSubmit(payload)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Forex Country' : 'Add Forex Country'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* Country Code */}
          <Grid item xs={12}>
            <TextField
              label="Country Code"
              fullWidth
              required
              disabled={!!editData}
              value={form.countryCode}
              error={!!errors.countryCode}
              helperText={errors.countryCode}
              onChange={(e) => handleFieldChange('countryCode', e.target.value.toUpperCase())}
              inputProps={{
                maxLength: VALIDATION_RULES.countryCode.max,
                style: { textTransform: 'uppercase' },
              }}
            />
          </Grid>

          {/* Country Name */}
          <Grid item xs={12}>
            <TextField
              label="Country Name"
              fullWidth
              required
              value={form.countryName}
              error={!!errors.countryName}
              helperText={errors.countryName}
              onChange={(e) => handleFieldChange('countryName', e.target.value)}
              inputProps={{
                maxLength: VALIDATION_RULES.countryName.max,
                minLength: VALIDATION_RULES.countryName.min,
              }}
            />
          </Grid>

          {/* Phone Code */}
          <Grid item xs={12}>
            <TextField
              label="Phone Code"
              fullWidth
              required
              value={form.countryPhoneCode}
              error={!!errors.countryPhoneCode}
              helperText={errors.countryPhoneCode}
              onChange={(e) => handleFieldChange('countryPhoneCode', e.target.value)}
              inputProps={{ maxLength: VALIDATION_RULES.countryPhoneCode.max }}
              placeholder="+91"
            />
          </Grid>

          {/* Country Flag - Emoji/Symbol Field */}
          <Grid item xs={12}>
            <TextField
              label="Country Flag (Emoji or Symbol)"
              fullWidth
              value={form.countryFlag}
              error={!!errors.countryFlag}
              helperText={errors.countryFlag}
              onChange={(e) => handleFieldChange('countryFlag', e.target.value)}
              inputProps={{ maxLength: VALIDATION_RULES.countryFlag.max }}
              placeholder="🇺🇸 or ★ or US"
              InputProps={{
                startAdornment: flagPreview ? (
                  <InputAdornment position="start">
                    <Tooltip title="Flag preview">
                      <span style={{ fontSize: '1.5rem' }}>{flagPreview}</span>
                    </Tooltip>
                  </InputAdornment>
                ) : (
                  <InputAdornment position="start">
                    <EmojiEmotionsIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment:
                  form.countryCode?.length === 2 && !form.countryFlag ? (
                    <InputAdornment position="end">
                      <Button size="small" onClick={generateFlagFromCode} sx={{ textTransform: 'none' }}>
                        Generate Flag
                      </Button>
                    </InputAdornment>
                  ) : null,
              }}
            />
            {/* Quick emoji hints */}
            <Grid container spacing={1} sx={{ mt: 0.5 }}>
              <Grid item>
                <Tooltip title="United States Flag">
                  <span style={{ fontSize: '1.5rem', cursor: 'pointer', marginRight: '8px' }} onClick={() => handleFieldChange('countryFlag', '🇺🇸')}>
                    🇺🇸
                  </span>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="United Kingdom Flag">
                  <span style={{ fontSize: '1.5rem', cursor: 'pointer', marginRight: '8px' }} onClick={() => handleFieldChange('countryFlag', '🇬🇧')}>
                    🇬🇧
                  </span>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="India Flag">
                  <span style={{ fontSize: '1.5rem', cursor: 'pointer', marginRight: '8px' }} onClick={() => handleFieldChange('countryFlag', '🇮🇳')}>
                    🇮🇳
                  </span>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="European Union Flag">
                  <span style={{ fontSize: '1.5rem', cursor: 'pointer', marginRight: '8px' }} onClick={() => handleFieldChange('countryFlag', '🇪🇺')}>
                    🇪🇺
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>

          {/* Flag URL */}
          <Grid item xs={12}>
            <TextField
              label="Flag URL (Optional)"
              fullWidth
              value={form.countryFlagUrl}
              error={!!errors.countryFlagUrl}
              helperText={errors.countryFlagUrl}
              onChange={(e) => handleFieldChange('countryFlagUrl', e.target.value)}
              inputProps={{ maxLength: VALIDATION_RULES.countryFlagUrl.max }}
              placeholder="https://example.com/flag.png"
            />
          </Grid>

          {/* Effective From Date */}
          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFromDate}
              onChange={(val: string) => {
                setForm({ ...form, effectiveFromDate: val })
                if (errors.effectiveFromDate) setErrors({ ...errors, effectiveFromDate: '' })
              }}
              error={!!errors.effectiveFromDate}
              helperText={errors.effectiveFromDate}
              required
            />
          </Grid>

          {/* Effective To Date */}
          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={form.effectiveToDate}
              minDate={form.effectiveFromDate}
              onChange={(val: string) => {
                setForm({ ...form, effectiveToDate: val })
                if (errors.effectiveToDate) setErrors({ ...errors, effectiveToDate: '' })
              }}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              required
            />
          </Grid>

          {/* Active Checkbox */}
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.active} onChange={(e) => handleFieldChange('active', e.target.checked)} color="primary" />}
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
