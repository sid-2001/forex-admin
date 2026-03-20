import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  FormHelperText,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { ForexCurrency } from '@/services/forex-currency.service'
import { countyState } from '@/states/state'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  editData?: ForexCurrency | null
  onFormChange?: (changed: boolean) => void
  isUpdateDisabled?: boolean
}

// Validation constants based on entity annotations
const VALIDATION = {
  COUNTRY_CODE: {
    maxLength: 10,
    required: true,
    message: 'Country code cannot exceed 10 characters',
  },
  CURRENCY_CODE: {
    maxLength: 255,
    required: true,
    message: 'Currency code cannot exceed 255 characters',
  },
  CURRENCY_NAME: {
    maxLength: 255,
    required: true,
    message: 'Currency name cannot exceed 255 characters',
  },
  CURRENCY_SYMBOL: {
    maxLength: 255,
    message: 'Currency symbol cannot exceed 255 characters',
  },
}

export default function ForexCurrencyDialog({ open, onClose, onSubmit, editData, onFormChange, isUpdateDisabled }: Props) {
  const localService = new LocalStorageService()
  const countries = useRecoilValue(countyState)
  const staffData = localService.get_staff_access()

  const [form, setForm] = useState<any>({
    countryCode: '',
    currencyCode: '',
    currencyName: '',
    currencySymbol: '',
    active: true,
  })

  const [originalData, setOriginalData] = useState<any>(null)
  const [errors, setErrors] = useState<any>({})

  // Check if form data has changed from original
  const checkFormChanged = (current: any, original: any) => {
    if (!original) return false

    return (
      current.currencyCode !== original.currencyCode ||
      current.currencyName !== original.currencyName ||
      current.currencySymbol !== original.currencySymbol ||
      current.active !== original.active
    )
  }

  // Helper to format timezone offset
  const formatTimezoneOffset = () => {
    const offset = -new Date().getTimezoneOffset()
    const sign = offset >= 0 ? '+' : '-'
    const hours = Math.floor(Math.abs(offset) / 60)
      .toString()
      .padStart(2, '0')
    const minutes = (Math.abs(offset) % 60).toString().padStart(2, '0')
    return `${sign}${hours}:${minutes}`
  }

  useEffect(() => {
    if (editData && open) {
      const newFormData = {
        countryCode: editData.countryCode || '',
        currencyCode: editData.currencyCode || '',
        currencyName: editData.currencyName || '',
        currencySymbol: editData.currencySymbol || '',
        active: editData.active ?? true,
      }
      setForm(newFormData)
      setOriginalData(newFormData)
    } else if (!editData && open) {
      const newFormData = {
        countryCode: '',
        currencyCode: '',
        currencyName: '',
        currencySymbol: '',
        active: true,
      }
      setForm(newFormData)
      setOriginalData(null)
    }
    setErrors({})
  }, [editData, open])

  // Notify parent component when form changes
  useEffect(() => {
    if (onFormChange && originalData) {
      const changed = checkFormChanged(form, originalData)
      onFormChange(changed)
    }
  }, [form, originalData, onFormChange])

  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value })
    if (errors[key]) {
      setErrors({ ...errors, [key]: '' })
    }
  }

  const validate = () => {
    const newErrors: any = {}

    // Country Code validation
    if (!form.countryCode) {
      newErrors.countryCode = 'Country is required'
    } else if (form.countryCode.length > VALIDATION.COUNTRY_CODE.maxLength) {
      newErrors.countryCode = VALIDATION.COUNTRY_CODE.message
    }

    // Currency Code validation
    if (!form.currencyCode) {
      newErrors.currencyCode = 'Currency code is required'
    } else if (form.currencyCode.length > VALIDATION.CURRENCY_CODE.maxLength) {
      newErrors.currencyCode = VALIDATION.CURRENCY_CODE.message
    }

    // Currency Name validation
    if (!form.currencyName) {
      newErrors.currencyName = 'Currency name is required'
    } else if (form.currencyName.length > VALIDATION.CURRENCY_NAME.maxLength) {
      newErrors.currencyName = VALIDATION.CURRENCY_NAME.message
    }

    // Currency Symbol validation (optional, but check length if provided)
    if (form.currencySymbol && form.currencySymbol.length > VALIDATION.CURRENCY_SYMBOL.maxLength) {
      newErrors.currencySymbol = VALIDATION.CURRENCY_SYMBOL.message
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const now = new Date().toISOString()
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const offset = formatTimezoneOffset()

    let payload = {
      ...form,
      // createdBy: editData ? undefined : localService.get_staff_id(),
      // modifiedBy: localService.get_staff_id(),
      // createdLocaldatetime: editData ? undefined : now.split('.')[0],
      // modifiedLocaldatetime: now.split('.')[0],
      // createdTimezone: editData ? undefined : timeZone,
      // modifiedTimezone: timeZone,
      // createdOffset: editData ? undefined : offset,
      // modifiedOffset: offset,
      // createdUtcDatetime: editData ? undefined : new Date().toISOString(),
      // modifiedUtcDatetime: new Date().toISOString(),
    }

    if (editData) {
      payload.modifiedBy = staffData?.staffId
    } else {
      payload.createdBy = staffData?.staffId
    }

    onSubmit(payload)
  }

  // Helper to get helper text with character limit
  const getHelperText = (field: string, value: string, customMessage?: string) => {
    const validationMap: any = {
      countryCode: VALIDATION.COUNTRY_CODE,
      currencyCode: VALIDATION.CURRENCY_CODE,
      currencyName: VALIDATION.CURRENCY_NAME,
      currencySymbol: VALIDATION.CURRENCY_SYMBOL,
    }

    const validation = validationMap[field]
    if (!validation) return customMessage || ''

    const currentLength = value?.length || 0
    return `${currentLength}/${validation.maxLength} characters`
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editData ? 'Update Currency' : 'Add Currency'}</DialogTitle>

      <DialogContent>
        {/* Country Dropdown */}
        <TextField
          select
          required
          label="Country"
          fullWidth
          margin="dense"
          value={form.countryCode}
          disabled={!!editData}
          error={!!errors.countryCode}
          helperText={errors.countryCode || getHelperText('countryCode', form.countryCode)}
          onChange={(e) => handleChange('countryCode', e.target.value)}
        >
          {countries
            .filter((e) => e.status === 'A')
            .map((c) => (
              <MenuItem
                //@ts-ignore
                key={c.countryCode}
                value={c.countryCode}
              >
                {c.countryName} ({c.countryCode})
              </MenuItem>
            ))}
        </TextField>

        <TextField
          required
          label="Currency Code"
          fullWidth
          margin="dense"
          value={form.currencyCode}
          error={!!errors.currencyCode}
          helperText={errors.currencyCode || getHelperText('currencyCode', form.currencyCode)}
          onChange={(e) => handleChange('currencyCode', e.target.value)}
          inputProps={{ maxLength: VALIDATION.CURRENCY_CODE.maxLength }}
        />

        <TextField
          required
          label="Currency Name"
          fullWidth
          margin="dense"
          value={form.currencyName}
          error={!!errors.currencyName}
          helperText={errors.currencyName || getHelperText('currencyName', form.currencyName)}
          onChange={(e) => handleChange('currencyName', e.target.value)}
          inputProps={{ maxLength: VALIDATION.CURRENCY_NAME.maxLength }}
        />

        <TextField
          required
          label="Currency Symbol"
          fullWidth
          margin="dense"
          value={form.currencySymbol}
          error={!!errors.currencySymbol}
          helperText={errors.currencySymbol || getHelperText('currencySymbol', form.currencySymbol)}
          onChange={(e) => handleChange('currencySymbol', e.target.value)}
          inputProps={{ maxLength: VALIDATION.CURRENCY_SYMBOL.maxLength }}
        />

        <FormControlLabel control={<Checkbox checked={form.active} onChange={(e) => handleChange('active', e.target.checked)} />} label="Active" />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={editData ? isUpdateDisabled : false}>
          {editData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
