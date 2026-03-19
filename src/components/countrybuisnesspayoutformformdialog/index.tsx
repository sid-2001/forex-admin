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
  FormHelperText,
} from '@mui/material'
import { useEffect, useState, useMemo } from 'react'
import CountryBusinessPayoutPartnerService from '@/services/countryBusinessPayoutPartner.service'
import ProductBusinessCountryMappingService from '@/services/productBusinessCountryMapping.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

const service = new CountryBusinessPayoutPartnerService()
const productBusinessService = new ProductBusinessCountryMappingService()
const local_service = new LocalStorageService()

// Validation constants based on entity annotations
const VALIDATION = {
  COUNTRY_BUSINESS_PAYOUT_PARTNER_CODE: {
    maxLength: 15,
    message: 'Payout Partner Code cannot exceed 15 characters',
  },
  COUNTRY_CORRIDOR_BUSINESS_MAP_CODE: {
    maxLength: 15,
    required: true,
    message: 'Business Map Code cannot exceed 15 characters',
  },
  BUSINESS_TYPE_CODE: {
    maxLength: 10,
    required: true,
    message: 'Business Type Code cannot exceed 10 characters',
  },
  PAYOUT_PARTNER: {
    maxLength: 10,
    required: true,
    message: 'Payout Partner Code cannot exceed 10 characters',
  },
}

interface Props {
  open: boolean
  handleClose: () => void
  editData?: any | null
  refreshList: () => void
  showAlert: (type: 'Success' | 'Fail', text: string) => void
  onFormChange?: (changed: boolean) => void
  isUpdateDisabled?: boolean
}

export default function CountryBusinessPayoutPartnerFormDialog({
  open,
  handleClose,
  editData,
  refreshList,
  showAlert,
  onFormChange,
  isUpdateDisabled,
}: Props) {
  const [businessMapCode, setBusinessMapCode] = useState<any[]>([])
  const [errors, setErrors] = useState<any>({})
  const [originalData, setOriginalData] = useState<any>(null)

  // Initial state uses camelCase
  const [form, setForm] = useState<any>({
    countryBusinessPayoutPartnerCode: '',
    countryCorridorBusinessMapCode: '',
    businessTypeCode: '',
    payoutPartner: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  })

  // Check if form data has changed from original
  const checkFormChanged = (current: any, original: any) => {
    if (!original) return false

    return (
      current.countryCorridorBusinessMapCode !== original.countryCorridorBusinessMapCode ||
      current.businessTypeCode !== original.businessTypeCode ||
      current.payoutPartner !== original.payoutPartner ||
      current.active !== original.active ||
      current.effectiveFromDate !== original.effectiveFromDate ||
      current.effectiveToDate !== original.effectiveToDate
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
    if (open) {
      productBusinessService.getList().then((data: any) => {
        const list = Array.isArray(data) ? data : data?.data || []
        setBusinessMapCode(list.filter((item: any) => item.active === true))
      })
    }
  }, [open])

  useEffect(() => {
    if (open) {
      if (editData) {
        // Edit Mode: Map incoming snake_case or camelCase to our form state
        const formatDate = (d: string) => (d && d.includes('T') ? d.split('T')[0] : d)
        const newFormData = {
          countryBusinessPayoutPartnerCode: editData.countryBusinessPayoutPartnerCode || '',
          countryCorridorBusinessMapCode: editData.countryCorridorBusinessMapCode || '',
          businessTypeCode: editData.businessTypeCode || '',
          payoutPartner: editData.payoutPartner || '',
          active: editData.active ?? true,
          effectiveFromDate: formatDate(editData.effectiveFromDate || editData.effective_from_date),
          effectiveToDate: formatDate(editData.effectiveToDate || editData.effective_to_date),
        }
        setForm(newFormData)
        setOriginalData(newFormData)
      } else {
        // Create Mode: Explicitly blank dates
        const newFormData = {
          countryBusinessPayoutPartnerCode: '',
          countryCorridorBusinessMapCode: '',
          businessTypeCode: '',
          payoutPartner: '',
          active: true,
          effectiveFromDate: '',
          effectiveToDate: '',
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

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const errs: any = {}

    // Country Business Payout Partner Code validation (only for create)
    if (
      !editData &&
      form.countryBusinessPayoutPartnerCode &&
      form.countryBusinessPayoutPartnerCode.length > VALIDATION.COUNTRY_BUSINESS_PAYOUT_PARTNER_CODE.maxLength
    ) {
      errs.countryBusinessPayoutPartnerCode = VALIDATION.COUNTRY_BUSINESS_PAYOUT_PARTNER_CODE.message
    }

    // Country Corridor Business Map Code validation
    if (!form.countryCorridorBusinessMapCode) {
      errs.countryCorridorBusinessMapCode = 'Corridor Business Map Code is required'
    } else if (form.countryCorridorBusinessMapCode.length > VALIDATION.COUNTRY_CORRIDOR_BUSINESS_MAP_CODE.maxLength) {
      errs.countryCorridorBusinessMapCode = VALIDATION.COUNTRY_CORRIDOR_BUSINESS_MAP_CODE.message
    }

    // Business Type Code validation
    if (!form.businessTypeCode) {
      errs.businessTypeCode = 'Business Type Code is required'
    } else if (form.businessTypeCode.length > VALIDATION.BUSINESS_TYPE_CODE.maxLength) {
      errs.businessTypeCode = VALIDATION.BUSINESS_TYPE_CODE.message
    }

    // Payout Partner validation
    if (!form.payoutPartner) {
      errs.payoutPartner = 'Payout Partner is required'
    } else if (form.payoutPartner.length > VALIDATION.PAYOUT_PARTNER.maxLength) {
      errs.payoutPartner = VALIDATION.PAYOUT_PARTNER.message
    }

    // Effective From Date validation
    if (!form.effectiveFromDate) {
      errs.effectiveFromDate = 'Effective from date must not be null'
    }

    // Effective To Date validation
    if (!form.effectiveToDate) {
      errs.effectiveToDate = 'Effective to date must not be null'
    }

    // Date range validation (AssertTrue)
    if (form.effectiveFromDate && form.effectiveToDate) {
      const fromDate = new Date(form.effectiveFromDate)
      const toDate = new Date(form.effectiveToDate)

      if (toDate <= fromDate) {
        errs.effectiveToDate = 'Effective To date must be after Effective From date'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    const staffId = local_service.get_staff_id()
    const now = new Date().toISOString()
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const offset = formatTimezoneOffset()

    // Generate code for new records if not provided
    const payload = {
      ...form,
      countryBusinessPayoutPartnerCode: form.countryBusinessPayoutPartnerCode || `PAY${Date.now()}`,
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${form.effectiveToDate}T00:00:00`,
      // modified_by: staffId,
      // modifiedLocalDateTime: now.split('.')[0],
      // modifiedTimeZone: timeZone,
      // modifiedOffset: offset,
      // modifiedUtcDateTime: new Date().toISOString(),
    }

    if (!editData) {
      Object.assign(payload, {
        createdBy: staffId,
        // createdLocalDateTime: now.split('.')[0],
        // createdTimeZone: timeZone,
        // createdOffset: offset,
        // createdUtcDateTime: new Date().toISOString(),
      })
    } else {
      Object.assign(payload, {
        modifiedBy: staffId,
        // createdLocalDateTime: now.split('.')[0],
        // createdTimeZone: timeZone,
        // createdOffset: offset,
        // createdUtcDateTime: new Date().toISOString(),
      })
    }

    try {
      const res = editData ? await service.update(editData.countryBusinessPayoutPartnerCode, payload) : await service.create(payload)

      if (res && res.status === true) {
        showAlert('Success', `Partner ${editData ? 'Updated' : 'Created'} Successfully`)
        refreshList()
        handleClose()
      } else {
        showAlert('Fail', res?.message || 'Operation failed')
      }
    } catch (e) {
      showAlert('Fail', 'Server Error')
    }
  }

  // Helper to get helper text with character limit
  const getHelperText = (field: string, value: string, customMessage?: string) => {
    const validationMap: any = {
      countryBusinessPayoutPartnerCode: VALIDATION.COUNTRY_BUSINESS_PAYOUT_PARTNER_CODE,
      countryCorridorBusinessMapCode: VALIDATION.COUNTRY_CORRIDOR_BUSINESS_MAP_CODE,
      businessTypeCode: VALIDATION.BUSINESS_TYPE_CODE,
      payoutPartner: VALIDATION.PAYOUT_PARTNER,
    }

    const validation = validationMap[field]
    if (!validation) return customMessage || ''

    const currentLength = value?.length || 0
    return `${currentLength}/${validation.maxLength} characters`
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Payout Partner' : 'Create Payout Partner'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Country Business Payout Partner Code - Only shown in create mode */}
          {!editData && (
            <Grid item xs={12}>
              <TextField
                label="Payout Partner Code"
                fullWidth
                value={form.countryBusinessPayoutPartnerCode}
                onChange={(e) => handleChange('countryBusinessPayoutPartnerCode', e.target.value.toUpperCase())}
                error={!!errors.countryBusinessPayoutPartnerCode}
                helperText={
                  errors.countryBusinessPayoutPartnerCode || getHelperText('countryBusinessPayoutPartnerCode', form.countryBusinessPayoutPartnerCode)
                }
                inputProps={{ maxLength: VALIDATION.COUNTRY_BUSINESS_PAYOUT_PARTNER_CODE.maxLength }}
                placeholder="Will be auto-generated if left blank"
              />
            </Grid>
          )}

          {/* Country Corridor Business Map Code */}
          <Grid item xs={12}>
            <Autocomplete
              options={businessMapCode}
              disabled={!!editData}
              getOptionLabel={(o: any) => o.businessMapCode || ''}
              value={businessMapCode.find((m) => m.businessMapCode === form.countryCorridorBusinessMapCode) || null}
              onChange={(_, val) => handleChange('countryCorridorBusinessMapCode', val?.businessMapCode || '')}
              renderInput={(p) => (
                <TextField
                  {...p}
                  label="Corridor Business Map Code"
                  required
                  error={!!errors.countryCorridorBusinessMapCode}
                  helperText={
                    errors.countryCorridorBusinessMapCode || getHelperText('countryCorridorBusinessMapCode', form.countryCorridorBusinessMapCode)
                  }
                />
              )}
            />
          </Grid>

          {/* Business Type Code */}
          <Grid item xs={12}>
            <TextField
              label="Business Type Code"
              fullWidth
              required
              value={form.businessTypeCode}
              onChange={(e) => handleChange('businessTypeCode', e.target.value.toUpperCase())}
              error={!!errors.businessTypeCode}
              helperText={errors.businessTypeCode || getHelperText('businessTypeCode', form.businessTypeCode)}
              inputProps={{ maxLength: VALIDATION.BUSINESS_TYPE_CODE.maxLength }}
            />
          </Grid>

          {/* Payout Partner */}
          <Grid item xs={12}>
            <TextField
              label="Payout Partner"
              fullWidth
              required
              value={form.payoutPartner}
              onChange={(e) => handleChange('payoutPartner', e.target.value)}
              error={!!errors.payoutPartner}
              helperText={errors.payoutPartner || getHelperText('payoutPartner', form.payoutPartner)}
              inputProps={{ maxLength: VALIDATION.PAYOUT_PARTNER.maxLength }}
            />
          </Grid>

          {/* Effective From Date */}
          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFromDate}
              onChange={(val: string) => handleChange('effectiveFromDate', val)}
              error={!!errors.effectiveFromDate}
              helperText={errors.effectiveFromDate || 'Required'}
              required
            />
          </Grid>

          {/* Effective To Date */}
          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={form.effectiveToDate}
              minDate={form.effectiveFromDate}
              onChange={(val: string) => handleChange('effectiveToDate', val)}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate || 'Required, must be after Effective From'}
              required
            />
          </Grid>

          {/* Active Status */}
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.active} onChange={(e) => handleChange('active', e.target.checked)} />}
              label="Active Status"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={editData ? isUpdateDisabled : false}>
          {editData ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
