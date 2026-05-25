// components/countryCorridorProductFormDialog.tsx
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
  MenuItem,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { CountryCorridorProductService } from '@/services/countryCorridorProduct.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

const service = new CountryCorridorProductService()
const local_service = new LocalStorageService()

// Validation constants
const VALIDATION = {
  COUNTRY_CORRIDOR_CODE: {
    maxLength: 15,
    message: 'Country Corridor Code cannot exceed 15 characters',
  },
  PRODUCT_CODE: {
    required: true,
    message: 'Product is required',
  },
  SERVICE_CODE: {
    required: true,
    message: 'Product Service Code is required',
  },
  DECIMAL_PRECISION: {
    min: 0,
    max: 6,
    message: 'Decimal precision must be between 0 and 6',
  },
}

// Format options
const DATE_FORMATS = [
  { value: 'dd-MM-yyyy', label: 'DD-MM-YYYY' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
  { value: 'yyyy/MM/dd', label: 'YYYY/MM/DD' },
]

const TIME_FORMATS = [
  { value: 'HH:mm:ss', label: '24 Hour (HH:MM:SS)' },
  { value: 'HH:mm', label: '24 Hour (HH:MM)' },
  { value: 'hh:mm:ss a', label: '12 Hour (HH:MM:SS AM/PM)' },
  { value: 'hh:mm a', label: '12 Hour (HH:MM AM/PM)' },
]

const CURRENCY_FORMATS = [
  { value: 'INR', label: 'Indian Rupee (₹)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
  { value: 'NGN', label: 'Nigerian Naira (₦)' },
  { value: 'ZAR', label: 'South African Rand (R)' },
  { value: 'AED', label: 'United Arab Emirates dirham (AED)' },
]

const PRECISION_OPTIONS = [0, 1, 2, 3, 4, 5, 6]
const ROUND_OFF_OPTIONS = [0, 0.01, 0.05, 0.1, 0.25, 0.5, 1]

interface Props {
  open: boolean
  handleClose: () => void
  editData?: any | null
  refreshList: () => void
  showAlert: (type: 'Success' | 'Fail', text: string) => void
  onFormChange?: (changed: boolean) => void
  isUpdateDisabled?: boolean
  products: any[]
  subServices: any[]
  countries: any[]
}

export default function CountryCorridorProductFormDialog({
  open,
  handleClose,
  editData,
  refreshList,
  showAlert,
  onFormChange,
  isUpdateDisabled,
  products,
  subServices,
  countries,
}: Props) {
  const [errors, setErrors] = useState<any>({})
  const [filteredServices, setFilteredServices] = useState<any[]>([])
  const [form, setForm] = useState<any>({
    countryCorridorCode: '',
    productCode: '',
    productServiceCode: '',
    dateFormat: 'dd-MM-yyyy',
    timeFormat: 'HH:mm:ss',
    currencyFormat: 'INR',
    decimalPrecision: 2,
    decimalRoundOff: 0.5,
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  })
  const [originalData, setOriginalData] = useState<any>(null)

  // Check if form data has changed from original
  const checkFormChanged = (current: any, original: any) => {
    if (!original) return false

    return (
      current.countryCorridorCode !== original.countryCorridorCode ||
      current.productCode !== original.productCode ||
      current.productServiceCode !== original.productServiceCode ||
      current.dateFormat !== original.dateFormat ||
      current.timeFormat !== original.timeFormat ||
      current.currencyFormat !== original.currencyFormat ||
      current.decimalPrecision !== original.decimalPrecision ||
      current.decimalRoundOff !== original.decimalRoundOff ||
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

  // Filter sub services based on selected product
  useEffect(() => {
    if (form.productCode) {
      console.log(form?.productCode)
      console.log(subServices)

      const filtered = subServices.filter((s) => s.productCode == form.productCode)
      setFilteredServices(filtered)
    } else {
      setFilteredServices([])
    }
  }, [form.productCode, subServices])

  useEffect(() => {
    if (editData && open) {
      const formatToDateOnly = (dateStr: string) => {
        if (!dateStr) return ''
        return dateStr.split('T')[0]
      }

      const newFormData = {
        countryCorridorCode: editData.countryCorridorCode || '',
        productCode: editData.productCode || '',
        productServiceCode: editData.productServiceCode || '',
        dateFormat: editData.dateFormat || 'dd-MM-yyyy',
        timeFormat: editData.timeFormat || 'HH:mm:ss',
        currencyFormat: editData.currencyFormat || 'INR',
        decimalPrecision: editData.decimalPrecision || 2,
        decimalRoundOff: editData.decimalRoundOff || 0.5,
        active: editData.active ?? true,
        effectiveFromDate: formatToDateOnly(editData.effectiveFromDate),
        effectiveToDate: formatToDateOnly(editData.effectiveToDate),
      }

      setForm(newFormData)
      setOriginalData(newFormData)
    } else if (!editData && open) {
      const today = new Date().toISOString().split('T')[0]
      const nextYear = new Date()
      nextYear.setFullYear(nextYear.getFullYear() + 1)

      const newFormData = {
        countryCorridorCode: '',
        productCode: '',
        productServiceCode: '',
        dateFormat: 'dd-MM-yyyy',
        timeFormat: 'HH:mm:ss',
        currencyFormat: 'INR',
        decimalPrecision: 2,
        decimalRoundOff: 0.5,
        active: true,
        effectiveFromDate: null,
        effectiveToDate: null,
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

    // Reset service code when product changes
    if (field === 'productCode') {
      setForm((prev: any) => ({ ...prev, productServiceCode: '' }))
    }
  }

  const validate = () => {
    const errs: any = {}

    // Country Corridor Code validation
    if (!form.countryCorridorCode) {
      errs.countryCorridorCode = 'Country Corridor Code is required'
    } else if (form.countryCorridorCode.length > VALIDATION.COUNTRY_CORRIDOR_CODE.maxLength) {
      errs.countryCorridorCode = VALIDATION.COUNTRY_CORRIDOR_CODE.message
    }

    // Product Code validation
    if (!form.productCode) {
      errs.productCode = VALIDATION.PRODUCT_CODE.message
    }

    // Product Service Code validation
    if (!form.productServiceCode) {
      errs.productServiceCode = VALIDATION.SERVICE_CODE.message
    }

    // Format validations
    if (!form.dateFormat) {
      errs.dateFormat = 'Date Format is required'
    }
    if (!form.timeFormat) {
      errs.timeFormat = 'Time Format is required'
    }
    if (!form.currencyFormat) {
      errs.currencyFormat = 'Currency Format is required'
    }

    // Decimal validations
    if (form.decimalPrecision === undefined || form.decimalPrecision === '') {
      errs.decimalPrecision = 'Decimal Precision is required'
    } else if (form.decimalPrecision < 0 || form.decimalPrecision > 6) {
      errs.decimalPrecision = VALIDATION.DECIMAL_PRECISION.message
    }

    // Effective From Date validation
    if (!form.effectiveFromDate) {
      errs.effectiveFromDate = 'Effective from date must not be null'
    }

    // Effective To Date validation
    if (!form.effectiveToDate) {
      errs.effectiveToDate = 'Effective to date must not be null'
    }

    // Date range validation

    console.log(errs)

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    const now = new Date().toISOString()
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const offset = formatTimezoneOffset()

    const payload = {
      countryCorridorCode: form.countryCorridorCode,
      productCode: form.productCode,
      productServiceCode: form.productServiceCode,
      dateFormat: form.dateFormat,
      timeFormat: form.timeFormat,
      currencyFormat: form.currencyFormat,
      decimalPrecision: parseFloat(form.decimalPrecision),
      decimalRoundOff: parseFloat(form.decimalRoundOff),
      active: form.active,
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${form.effectiveToDate}T00:00:00`,
      modifiedBy: local_service.get_staff_id(),
    }

    if (!editData) {
      Object.assign(payload, {
        createdBy: local_service.get_staff_id(),
      })
    }

    try {
      const res = editData
        ? await service.updateCountryCorridorProduct(editData.countryCorridorProductCode, payload)
        : //@ts-ignore
          await service.createCountryCorridorProduct(payload)

      if (res) {
        showAlert('Success', res?.message || `${editData ? 'Updated' : 'Created'} successfully`)
        refreshList()
        handleClose()
      }
    } catch (e) {
      showAlert('Fail', 'Server Error')
      // handleClose()
    }
  }

  // Get selected product details
  const selectedProduct = products.find((p) => p.productCode === form.productCode)

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Corridor Product' : 'Create Corridor Product'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Country Corridor Code */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={countries?.filter((c: any) => c.active == true) || []}
              getOptionLabel={(o: any) => `${o.countryCorridorCode} (${o.countryCode})`}
              value={countries?.find((c: any) => c.countryCorridorCode === form.countryCorridorCode) || null}
              onChange={(_, val) => handleChange('countryCorridorCode', val?.countryCorridorCode || '')}
              disabled={!!editData}
              renderInput={(params) => (
                <TextField {...params} label="Country" required size="small" error={!!errors.countryCode} helperText={errors.countryCode} />
              )}
            />
          </Grid>

          {/* precidoson */}
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Decimal Precision"
              required
              fullWidth
              size="small"
              value={form.decimalPrecision}
              error={!!errors.decimalPrecision}
              helperText={errors.decimalPrecision}
              onChange={(e) => handleChange('decimalPrecision', e.target.value)}
            >
              {PRECISION_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option} decimal place{option !== 1 ? 's' : ''}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Product Code Dropdown */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={products.filter((p) => p.active)}
              getOptionLabel={(option) => ` ${option?.countryProductCode}-${option.productCode} - ${option.productName}`}
              value={products.find((p) => p.countryProductCode === form.productCode) || null}
              onChange={(_, val) => handleChange('productCode', val?.countryProductCode || '')}
              disabled={!!editData}
              renderInput={(params) => (
                <TextField {...params} label="Product" required size="small" error={!!errors.productCode} helperText={errors.productCode} />
              )}
            />
          </Grid>

          {/* Product Service Code Dropdown */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={filteredServices}
              getOptionLabel={(option) => option.productServiceMapCode}
              value={subServices.find((s) => s.productServiceMapCode === form.productServiceCode) || null}
              onChange={(_, val) => handleChange('productServiceCode', val?.productServiceMapCode || '')}
              disabled={!form.productCode || !!editData}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Product Service Code"
                  required
                  size="small"
                  error={!!errors.productServiceCode}
                  helperText={errors.productServiceCode || (!form.productCode ? 'Select product first' : '')}
                />
              )}
            />
            {form.productCode && filteredServices.length === 0 && <FormHelperText error>No active services found for this product</FormHelperText>}
          </Grid>

          {/* Selected Product Details */}
          {selectedProduct && (
            <Grid item xs={12}>
              <TextField
                label="Product Details"
                fullWidth
                size="small"
                value={`Code: ${selectedProduct.productCode} | Name: ${selectedProduct.productName} | Country: ${selectedProduct.countryProductCode?.substring(0, 2) || ''}`}
                disabled
                variant="filled"
              />
            </Grid>
          )}

          {/* Date Format */}
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Date Format"
              required
              fullWidth
              size="small"
              value={form.dateFormat}
              error={!!errors.dateFormat}
              helperText={errors.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
            >
              {DATE_FORMATS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Time Format */}
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Time Format"
              required
              fullWidth
              size="small"
              value={form.timeFormat}
              error={!!errors.timeFormat}
              helperText={errors.timeFormat}
              onChange={(e) => handleChange('timeFormat', e.target.value)}
            >
              {TIME_FORMATS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Currency Format */}
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Currency Format"
              required
              fullWidth
              size="small"
              value={form.currencyFormat}
              error={!!errors.currencyFormat}
              helperText={errors.currencyFormat}
              onChange={(e) => handleChange('currencyFormat', e.target.value)}
            >
              {CURRENCY_FORMATS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Decimal Round Off */}
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Decimal Round Off"
              required
              fullWidth
              size="small"
              value={form.decimalRoundOff}
              error={!!errors.decimalRoundOff}
              helperText={errors.decimalRoundOff}
              onChange={(e) => handleChange('decimalRoundOff', e.target.value)}
            >
              {ROUND_OFF_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
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
              disabled={!form.effectiveFromDate}
            />
          </Grid>
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
        <Button variant="contained" onClick={handleSubmit} disabled={editData ? isUpdateDisabled : false} sx={{ backgroundColor: '#0061B1' }}>
          {editData ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
