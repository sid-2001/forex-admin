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
import BankBusinessTypeService from '@/services/bantypemaster.service'
import BankMasterService from '@/services/bankmaster.service'

const service = new CountryBusinessPayoutPartnerService()
const productBusinessService = new ProductBusinessCountryMappingService()
const Bank_business_type_service = new BankBusinessTypeService()
const local_service = new LocalStorageService()
const bankMasterService = new BankMasterService()

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
  const [businessTypeCodeList, setBusinessTypeCodeList] = useState<any[]>([])
  const [errors, setErrors] = useState<any>({})
  const [originalData, setOriginalData] = useState<any>(null)
  const [payoutPartnerList, setPayoutPartnerList] = useState<any>([])

  // Initial state uses camelCase
  const [form, setForm] = useState<any>({
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

      Bank_business_type_service.getList().then((data: any) => {
        const list = Array.isArray(data) ? data : data?.data || []
        setBusinessTypeCodeList(list.filter((item: any) => item.active === true))
      })

      bankMasterService.getBankList().then((data: any) => {
        const list = Array.isArray(data) ? data : data?.data || []
        setPayoutPartnerList(list.filter((item: any) => item.active === true))
      })
    }
  }, [open])

  useEffect(() => {
    if (open) {
      if (editData) {
        // Edit Mode: Map incoming snake_case or camelCase to our form state
        const formatDate = (d: string) => (d && d.includes('T') ? d.split('T')[0] : d)
        const newFormData = {
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
    if (!form.effectiveFromDate) {
      // Effective From Date validation
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

    // Generate code for new records if not provided
    const payload = {
      ...form,
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${form.effectiveToDate}T00:00:00`,
    }

    if (!editData) {
      Object.assign(payload, {
        createdBy: staffId,
      })
    } else {
      Object.assign(payload, {
        modifiedBy: staffId,
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
            <Autocomplete
              options={businessTypeCodeList}
              disabled={!!editData}
              getOptionLabel={(o: any) => o.businessTypeCode || ''}
              value={businessTypeCodeList.find((m) => m.businessTypeCode === form.businessTypeCode) || null}
              onChange={(_, val) => handleChange('businessTypeCode', val?.businessTypeCode || '')}
              renderInput={(p) => (
                <TextField
                  {...p}
                  label="Business Type Code"
                  required
                  error={!!errors.businessTypeCode}
                  helperText={errors.businessTypeCode || getHelperText('businessTypeCode', form.businessTypeCode)}
                />
              )}
            />
          </Grid>

          {/* Payout Partner */}
          <Grid item xs={12}>
            <Autocomplete
              options={payoutPartnerList}
              getOptionLabel={(o: any) => `${o.bankMasterCode} (${o.bankName})` || ''}
              value={businessTypeCodeList.find((m) => m.bankMasterCode === form.payoutPartner) || null}
              onChange={(_, val) => handleChange('payoutPartner', val?.bankMasterCode || '')}
              renderInput={(p) => (
                <TextField {...p} label="Payout Partner Code" required error={!!errors.payoutPartner} helperText={errors.payoutPartner} />
              )}
            />
          </Grid>

          {/* Effective From Date */}
          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFromDate}
              onChange={(val: string) => handleChange('effectiveFromDate', val)}
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
              onChange={(val: string) => handleChange('effectiveToDate', val)}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
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
