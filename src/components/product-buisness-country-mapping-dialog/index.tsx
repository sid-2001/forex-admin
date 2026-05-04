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
import { useEffect, useState } from 'react'
import ProductBusinessCountryMappingService from '@/services/productBusinessCountryMapping.service'
import { useRecoilValue } from 'recoil'
import { countyState } from '@/states/state'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

const service = new ProductBusinessCountryMappingService()
const local_service = new LocalStorageService()

// Validation constants based on entity annotations
const VALIDATION = {
  BUSINESS_MAP_CODE: {
    maxLength: 15,
    message: 'Business Map Code cannot exceed 15 characters',
  },
  RECIPIENT_COUNTRY: {
    maxLength: 3,
    required: true,
    message: 'Country code cannot exceed 3 characters',
  },
  PAYMENT_RAIL: {
    maxLength: 10,
    required: true,
    message: 'Payment Rail cannot exceed 10 characters',
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
  productList: any[]
}

export default function ProductBusinessCountryMappingDialog({
  open,
  handleClose,
  editData,
  refreshList,
  showAlert,
  onFormChange,
  isUpdateDisabled,
  productList,
}: Props) {
  const countries = useRecoilValue(countyState)
  const [errors, setErrors] = useState<any>({})
  const [form, setForm] = useState<any>({
    countryCorridorProductCode: '',
    recipientCountry: '',
    paymentRail: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  })
  const [originalData, setOriginalData] = useState<any>(null)

  // Check if form data has changed from original
  const checkFormChanged = (current: any, original: any) => {
    if (!original) return false

    return (
      current.countryCorridorProductCode !== original.countryCorridorProductCode ||
      current.recipientCountry !== original.recipientCountry ||
      current.paymentRail !== original.paymentRail ||
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
    if (editData && open) {
      const formatToDateOnly = (dateStr: string) => {
        if (!dateStr) return ''
        return dateStr.split('T')[0]
      }

      const newFormData = {
        countryCorridorProductCode: editData.countryCorridorProductCode || editData.productCode || '',
        recipientCountry: editData.recipientCountry || '',
        paymentRail: editData.paymentRail || '',
        active: editData.active ?? true,
        effectiveFromDate: formatToDateOnly(editData.effectiveFromDate || editData.effective_from_date),
        effectiveToDate: formatToDateOnly(editData.effectiveToDate || editData.effective_to_date),
      }

      setForm(newFormData)
      setOriginalData(newFormData)
    } else if (!editData && open) {
      const newFormData = {
        countryCorridorProductCode: '',
        recipientCountry: '',
        paymentRail: '',
        active: true,
        effectiveFromDate: '',
        effectiveToDate: '',
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

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }))
    }
    if (field === 'paymentRail' && value && !/^[A-Za-z\s]+$/.test(value)) {
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
    const errs: any = {}

    // Product Code validation
    if (!form.countryCorridorProductCode) {
      errs.countryCorridorProductCode = 'Product is required'
    }

    // Recipient Country validation
    if (!form.recipientCountry) {
      errs.recipientCountry = 'Recipient Country is required'
    } else if (form.recipientCountry.length > VALIDATION.RECIPIENT_COUNTRY.maxLength) {
      errs.recipientCountry = VALIDATION.RECIPIENT_COUNTRY.message
    }

    // Payment Rail validation
    if (!form.paymentRail?.toString().trim()) {
      errs.paymentRail = 'Payment Rail is required'
    } else if (form.paymentRail.length > VALIDATION.PAYMENT_RAIL.maxLength) {
      errs.paymentRail = VALIDATION.PAYMENT_RAIL.message
    } else if (!/^[A-Za-z\s]+$/.test(form.paymentRail)) {
      errs.paymentRail = 'Only alphabets are allowed.'
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

    // Generate businessMapCode for new records

    const payload = {
      countryCorridorProductCode: form.countryCorridorProductCode,
      recipientCountry: form.recipientCountry,
      paymentRail: form.paymentRail,
      active: form.active,
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${form.effectiveToDate}T00:00:00`,
    }

    if (!editData) {
      Object.assign(payload, {
        createdBy: local_service.get_staff_id(),
      })
    } else {
      Object.assign(payload, { modifiedBy: local_service.get_staff_id() })
    }

    try {
      const res = editData
        ? //@ts-ignore
          await service.update(editData.businessMapCode, payload)
        : //@ts-ignore
          await service.create(payload)

      if (res) {
        showAlert('Success', `${res.message}`)
        refreshList()
        handleClose()
      }
    } catch (e) {
      showAlert('Fail', 'Server Error')
    }
  }

  // Helper to get helper text with character limit
  const getHelperText = (field: string, value: string, customMessage?: string) => {
    const validationMap: any = {
      recipientCountry: VALIDATION.RECIPIENT_COUNTRY,
      paymentRail: VALIDATION.PAYMENT_RAIL,
    }

    const validation = validationMap[field]
    if (!validation) return customMessage || ''

    const currentLength = value?.length || 0
    return `${currentLength}/${validation.maxLength} characters`
  }

  // Get selected product details
  const selectedProduct = productList.find((p) => p.countryProductCode === form.countryCorridorProductCode)

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Mapping' : 'Create Mapping'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Product Code Dropdown */}
          <Grid item xs={12}>
            <Autocomplete
              options={productList}
              getOptionLabel={(option) => `${option.countryCorridorProductCode}`}
              value={productList.find((p) => p.countryCorridorProductCode === form.countryCorridorProductCode) || null}
              onChange={(_, val) => handleChange('countryCorridorProductCode', val?.countryCorridorProductCode || '')}
              disabled={!!editData}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Product"
                  required
                  error={!!errors.countryCorridorProductCode}
                  helperText={errors.countryCorridorProductCode}
                />
              )}
            />
          </Grid>

          {/* Display selected product details */}
          {selectedProduct && (
            <Grid item xs={12}>
              <TextField
                label="Selected Product Details"
                fullWidth
                //@ts-ignore
                value={`Code: ${selectedProduct.productCode} | Name: ${selectedProduct.productName} | Effective: ${formatTimezoneOffset(selectedProduct.effectiveFromDate)} to ${formatTimezoneOffset(selectedProduct.effectiveToDate)}`}
                disabled
                size="small"
                variant="filled"
              />
            </Grid>
          )}

          {/* Recipient Country */}
          <Grid item xs={12}>
            <Autocomplete
              options={countries?.filter((c: any) => c.status === 'A') || []}
              getOptionLabel={(o: any) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c: any) => c.countryCode === form.recipientCountry) || null}
              onChange={(_, val) => handleChange('recipientCountry', val?.countryCode || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Destination Country"
                  required
                  error={!!errors.recipientCountry}
                  helperText={errors.recipientCountry || getHelperText('recipientCountry', form.recipientCountry)}
                />
              )}
            />
          </Grid>

          {/* Payment Rail */}
          <Grid item xs={12}>
            <TextField
              label="Payment Rail"
              required
              fullWidth
              error={!!errors.paymentRail}
              helperText={errors.paymentRail || getHelperText('paymentRail', form.paymentRail)}
              value={form.paymentRail}
              onChange={(e) => handleChange('paymentRail', e.target.value)}
              inputProps={{ maxLength: VALIDATION.PAYMENT_RAIL.maxLength }}
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
