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
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilValue } from 'recoil'
import { countyState } from '@/states/state'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import BankBusinessTypeService, { BankBusinessType } from '../../services/bantypemaster.service'
import StateService, { StateMaster } from '../../services/state.service'

const filter = createFilterOptions({
  matchFrom: 'any',
  stringify: (o: any) => `${o.countryName} ${o.countryCode}`,
})

// Validation constants based on entity annotations
const VALIDATION_RULES = {
  countryCode: { max: 3, message: 'Country code cannot exceed 3 characters' },
  currencyCode: { max: 3, message: 'Currency code cannot exceed 3 characters' },
  bankCode: { max: 10, message: 'Bank code cannot exceed 10 characters' },
  bankName: { max: 100, message: 'Bank name cannot exceed 100 characters' },
  bankBranchCode: { max: 10, message: 'Bank branch code cannot exceed 10 characters' },
  bankIfscBicCode: { max: 15, message: 'Bank IFSC/BIC code cannot exceed 15 characters' },
  bankAddress1: { max: 50, message: 'Bank address1 cannot exceed 50 characters' },
  bankAddress2: { max: 50, message: 'Bank address2 cannot exceed 50 characters' },
  bankAddress3: { max: 50, message: 'Bank address3 cannot exceed 50 characters' },
  bankStateProvinceCode: { max: 20, message: 'Bank state/province code cannot exceed 20 characters' },
  bankCity: { max: 50, message: 'Bank city cannot exceed 50 characters' },
  bankPostalCode: { max: 20, message: 'Bank postal code cannot exceed 20 characters' },
  bankType: { max: 10, message: 'Bank type cannot exceed 10 characters' },
  createdBy: { max: 50, message: 'Created by cannot exceed 50 characters' },
  modifiedBy: { max: 50, message: 'Modified by cannot exceed 50 characters' },
}

export default function BankMasterDialog({ open, onClose, onSubmit, editData }: any) {
  const localService = new LocalStorageService()
  const countries = useRecoilValue(countyState)
  const [errors, setErrors] = useState<any>({})
  const [businessTypes, setBusinessTypes] = useState<BankBusinessType[]>([])
  const [loadingBusinessTypes, setLoadingBusinessTypes] = useState(false)
  const [states, setStates] = useState<StateMaster[]>([])
  const [loadingStates, setLoadingStates] = useState(false)

  const [form, setForm] = useState<any>({
    countryCode: '',
    currencyCode: 'INR',
    bankCode: '',
    bankName: '',
    bankBranchCode: '',
    bankIfscBicCode: '',
    bankAddress1: '',
    bankAddress2: '',
    bankAddress3: '',
    bankStateProvinceCode: '',
    bankCity: '',
    bankPostalCode: '',
    bankType: '',
    bankTypeCode: '',
    active: true,
    effective_from_date: '',
    effective_to_date: '',
    createdBy: '',
  })

  // Fetch business types when component mounts or when country changes
  useEffect(() => {
    const fetchBusinessTypes = async () => {
      if (!form.countryCode) {
        setBusinessTypes([])
        return
      }

      setLoadingBusinessTypes(true)
      try {
        const service = new BankBusinessTypeService()
        const response = await service.getList()
        
        console.log(response)
        if (response) {
          // Filter business types by country code and active status
          const filteredTypes = response.filter(
            (type: BankBusinessType) => 
              type.countryCode === form.countryCode && 
              type.active === true
          )
          setBusinessTypes(filteredTypes)
        }
      } catch (error) {
        console.error('Error fetching business types:', error)
        setBusinessTypes([])
      } finally {
        setLoadingBusinessTypes(false)
      }
    }

    fetchBusinessTypes()
  }, [form.countryCode])

  // Fetch states when component mounts or when country changes
  useEffect(() => {
    const fetchStates = async () => {
      if (!form.countryCode) {
        setStates([])
        return
      }

      setLoadingStates(true)
      try {
        const service = new StateService()
        const response = await service.getStateList()
        
        console.log('States response:', response)
        if (response) {
          // Filter states by country code and active status
          const filteredStates = response.filter(
            (state: StateMaster) => 
              state.CountryCode === form.countryCode && 
              state.Active === true
          )
          setStates(filteredStates)
        }
      } catch (error) {
        console.error('Error fetching states:', error)
        setStates([])
      } finally {
        setLoadingStates(false)
      }
    }

    fetchStates()
  }, [form.countryCode])

  useEffect(() => {
    if (editData && open) {
      const fDate = editData.effective_from_date || editData.effectiveFromDate || editData.effectivefromdate || ''
      const tDate = editData.effective_to_date || editData.effectiveToDate || editData.effectivetodate || ''

      setForm({
        ...editData,
        bankAddress1: editData.bankAddress1 || '',
        bankAddress2: editData.bankAddress2 || '',
        bankAddress3: editData.bankAddress3 || '',
        effective_from_date: fDate.includes('T') ? fDate.split('T')[0] : fDate,
        effective_to_date: tDate.includes('T') ? tDate.split('T')[0] : tDate,
      })
    } else {
      setForm({
        countryCode: '',
        currencyCode: 'INR',
        bankCode: '',
        bankName: '',
        bankBranchCode: '',
        bankIfscBicCode: '',
        bankAddress1: '',
        bankAddress2: '',
        bankAddress3: '',
        bankStateProvinceCode: '',
        bankCity: '',
        bankPostalCode: '',
        bankType: '',
        bankTypeCode: '',
        active: true,
        effective_from_date: '',
        effective_to_date: '',
        createdBy: localService.get_staff_id() || '',
      })
    }
    setErrors({})
  }, [editData, open])

  // Validate a single field
  const validateField = (name: string, value: any): string => {
    if (!value && requiredFields.includes(name)) {
      return 'Required'
    }

    if (value && VALIDATION_RULES[name as keyof typeof VALIDATION_RULES]) {
      const rule = VALIDATION_RULES[name as keyof typeof VALIDATION_RULES]
      if (value.length > rule.max) {
        return rule.message
      }
    }

    return ''
  }

  // Handle field change with validation
  const handleFieldChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
    
    // Validate the field and update errors
    const error = validateField(field, value)
    setErrors((prev: any) => ({
      ...prev,
      [field]: error
    }))
  }

  const requiredFields = [
    'countryCode',
    'bankCode',
    'bankName',
    'bankBranchCode',
    'bankIfscBicCode',
    'bankAddress1',
    'bankCity',
    'bankStateProvinceCode',
    'bankPostalCode',
    'bankTypeCode',
    'effective_from_date',
    'effective_to_date',
  ]

  const handleSubmit = () => {
    console.log("i m gettin fucked")
    const newErrors: any = {}
    
    // Validate all required fields and length constraints
    requiredFields.forEach((field) => {
      const error = validateField(field, form[field])
      if (error) newErrors[field] = error
    })

    // Validate optional fields for length constraints
    Object.keys(VALIDATION_RULES).forEach(field => {
      if (!requiredFields.includes(field) && form[field]) {
        const error = validateField(field, form[field])
        if (error) newErrors[field] = error
      }
    })

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    // Date Validation (using @AssertTrue equivalent)
    const fromDate = new Date(form.effective_from_date)
    const toDate = new Date(form.effective_to_date)
    
    if (toDate <= fromDate) {
      onSubmit({ validationError: 'effectiveToDate must be after effectiveFromDate' })
      return
    }

    // Get current date/time for audit fields
    const now = new Date()
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const offset = -now.getTimezoneOffset()
    const offsetHours = Math.floor(Math.abs(offset) / 60)
    const offsetMinutes = Math.abs(offset) % 60
    const offsetStr = (offset >= 0 ? '+' : '-') + 
                      String(offsetHours).padStart(2, '0') + ':' + 
                      String(offsetMinutes).padStart(2, '0')

    // Format the payload according to the API requirements with all entity fields
    const payload: any = {
      countryCode: form.countryCode,
      currencyCode: form.currencyCode,
      bankCode: form.bankCode,
      bankName: form.bankName,
      bankBranchCode: form.bankBranchCode,
      bankIfscBicCode: form.bankIfscBicCode,
      bankAddress1: form.bankAddress1,
      bankAddress2: form.bankAddress2 || '',
      bankAddress3: form.bankAddress3 || '',
      bankStateProvinceCode: form.bankStateProvinceCode,
      bankCity: form.bankCity,
      bankPostalCode: form.bankPostalCode,
      bankType: form.bankType,
      active: form.active,
      effectiveFromDate: `${form.effective_from_date}T00:00:00`,
      effectiveToDate: `${form.effective_to_date}T23:59:59`,
    }

    // IMPORTANT: Add identifier for update
    if (editData) {
      // Use the correct identifier field name (adjust based on your API)
      payload.bankMasterCode = editData.bankMasterCode || editData.bankCode
      payload.modifiedBy = localService.get_staff_id()
      
      // Add modified audit fields
      Object.assign(payload, {
        modifiedLocalDateTime: now.toISOString(),
        modifiedTimeZone: timezone,
        modifiedOffset: offsetStr,
        modifiedUtcDateTime: new Date().toISOString()
      })
    } else {
      payload.createdBy = localService.get_staff_id()
      
      // Add created audit fields
      Object.assign(payload, {
        createdLocalDateTime: now.toISOString(),
        createdTimeZone: timezone,
        createdOffset: offsetStr,
        createdUtcDateTime: new Date().toISOString()
      })
    }

    console.log('Submitting payload for', editData ? 'update' : 'create', ':', payload)
    onSubmit(payload)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Bank' : 'Add Bank'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={6}>
            <Autocomplete
              options={countries?.filter((c: any) => c.status === 'A') || []}
              filterOptions={filter}
              getOptionLabel={(o: any) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c: any) => c.countryCode === form.countryCode) || null}
              onChange={(_, val) => {
                const newCountryCode = val ? val.countryCode : ''
                setForm((prev: any) => ({ 
                  ...prev, 
                  countryCode: newCountryCode, 
                  bankType: '', 
                  bankTypeCode: '', 
                  bankStateProvinceCode: '' 
                }))
                // Validate after state update
                setTimeout(() => {
                  handleFieldChange('countryCode', newCountryCode)
                }, 0)
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

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Currency Code"
              required
              value={form.currencyCode}
              onChange={(e) => handleFieldChange('currencyCode', e.target.value)}
              error={!!errors.currencyCode}
              helperText={errors.currencyCode || `Max ${VALIDATION_RULES.currencyCode.max} characters`}
              inputProps={{ maxLength: VALIDATION_RULES.currencyCode.max }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Bank Code"
              required
              disabled={!!editData} // Bank code should be disabled in edit mode
              value={form.bankCode}
              onChange={(e) => handleFieldChange('bankCode', e.target.value)}
              error={!!errors.bankCode}
              helperText={errors.bankCode || `Max ${VALIDATION_RULES.bankCode.max} characters`}
              inputProps={{ maxLength: VALIDATION_RULES.bankCode.max }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Bank Name"
              required
              value={form.bankName}
              onChange={(e) => handleFieldChange('bankName', e.target.value)}
              error={!!errors.bankName}
              helperText={errors.bankName || `Max ${VALIDATION_RULES.bankName.max} characters`}
              inputProps={{ maxLength: VALIDATION_RULES.bankName.max }}
            />
          </Grid>

          {/* Bank Type Autocomplete Field */}
          <Grid item xs={6}>
            <Autocomplete
              options={businessTypes}
              loading={loadingBusinessTypes}
              getOptionLabel={(option: BankBusinessType) => 
                `${option.bankBusinessName} (${option.businessTypeCode})`
              }
              value={businessTypes.find((type: BankBusinessType) => 
                type.businessTypeCode == form.bankType
              ) || null}
              onChange={(_, selectedValue) => {
                setForm((prev: any) => ({ 
                  ...prev, 
                  bankTypeCode: selectedValue?.businessTypeCode || '',
                  bankType: selectedValue?.businessTypeCode || ''
                }))
                // Validate after state update
                setTimeout(() => {
                  handleFieldChange('bankTypeCode', selectedValue?.businessTypeCode || '')
                  handleFieldChange('bankType', selectedValue?.businessTypeCode || '')
                }, 0)
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Bank Type"
                  required
                  error={!!errors.bankTypeCode}
                  helperText={errors.bankTypeCode || (businessTypes.length === 0 && form.countryCode ? 'No bank types available for this country' : '')}
                  placeholder={!form.countryCode ? 'Select country first' : 'Select bank type'}
                  disabled={!form.countryCode || businessTypes.length === 0}
                />
              )}
              disabled={!form.countryCode || businessTypes.length === 0}
              noOptionsText={
                !form.countryCode 
                  ? 'Please select a country first' 
                  : loadingBusinessTypes 
                    ? 'Loading...' 
                    : 'No bank types available'
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Branch Code"
              required
              value={form.bankBranchCode}
              onChange={(e) => handleFieldChange('bankBranchCode', e.target.value)}
              error={!!errors.bankBranchCode}
              helperText={errors.bankBranchCode || `Max ${VALIDATION_RULES.bankBranchCode.max} characters`}
              inputProps={{ maxLength: VALIDATION_RULES.bankBranchCode.max }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="IFSC / BIC Code"
              required
              value={form.bankIfscBicCode}
              onChange={(e) => handleFieldChange('bankIfscBicCode', e.target.value)}
              error={!!errors.bankIfscBicCode}
              helperText={errors.bankIfscBicCode || `Max ${VALIDATION_RULES.bankIfscBicCode.max} characters`}
              inputProps={{ maxLength: VALIDATION_RULES.bankIfscBicCode.max }}
            />
          </Grid>

          {/* Address Fields */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address Line 1"
              required
              value={form.bankAddress1}
              onChange={(e) => handleFieldChange('bankAddress1', e.target.value)}
              error={!!errors.bankAddress1}
              helperText={errors.bankAddress1 || `Max ${VALIDATION_RULES.bankAddress1.max} characters`}
              inputProps={{ maxLength: VALIDATION_RULES.bankAddress1.max }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Address Line 2"
              value={form.bankAddress2}
              onChange={(e) => handleFieldChange('bankAddress2', e.target.value)}
              error={!!errors.bankAddress2}
              helperText={errors.bankAddress2 || `Max ${VALIDATION_RULES.bankAddress2.max} characters`}
              inputProps={{ maxLength: VALIDATION_RULES.bankAddress2.max }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Address Line 3"
              value={form.bankAddress3}
              onChange={(e) => handleFieldChange('bankAddress3', e.target.value)}
              error={!!errors.bankAddress3}
              helperText={errors.bankAddress3 || `Max ${VALIDATION_RULES.bankAddress3.max} characters`}
              inputProps={{ maxLength: VALIDATION_RULES.bankAddress3.max }}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="City"
              required
              value={form.bankCity}
              onChange={(e) => handleFieldChange('bankCity', e.target.value)}
              error={!!errors.bankCity}
              helperText={errors.bankCity || `Max ${VALIDATION_RULES.bankCity.max} characters`}
              inputProps={{ maxLength: VALIDATION_RULES.bankCity.max }}
            />
          </Grid>

          <Grid item xs={4}>
            <Autocomplete
              options={states}
              loading={loadingStates}
              getOptionLabel={(option: StateMaster) => 
                `${option.StateDescription} (${option.StateCode})`
              }
              value={states.find((state: StateMaster) => 
                state.StateCode === form.bankStateProvinceCode
              ) || null}
              onChange={(_, selectedValue) => {
                const newStateCode = selectedValue?.StateCode || ''
                setForm((prev: any) => ({ 
                  ...prev, 
                  bankStateProvinceCode: newStateCode
                }))
                setTimeout(() => {
                  handleFieldChange('bankStateProvinceCode', newStateCode)
                }, 0)
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="State"
                  required
                  error={!!errors.bankStateProvinceCode}
                  helperText={errors.bankStateProvinceCode || (states.length === 0 && form.countryCode ? 'No states available for this country' : '')}
                  placeholder={!form.countryCode ? 'Select country first' : 'Select state'}
                  disabled={!form.countryCode || states.length === 0}
                  inputProps={{ ...params.inputProps, maxLength: VALIDATION_RULES.bankStateProvinceCode.max }}
                />
              )}
              disabled={!form.countryCode || states.length === 0}
              noOptionsText={
                !form.countryCode 
                  ? 'Please select a country first' 
                  : loadingStates 
                    ? 'Loading...' 
                    : 'No states available'
              }
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Postal Code"
              required
              value={form.bankPostalCode}
              onChange={(e) => handleFieldChange('bankPostalCode', e.target.value)}
              error={!!errors.bankPostalCode}
              helperText={errors.bankPostalCode || `Max ${VALIDATION_RULES.bankPostalCode.max} characters`}
              inputProps={{ maxLength: VALIDATION_RULES.bankPostalCode.max }}
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effective_from_date}
              onChange={(val: string) => {
                handleFieldChange('effective_from_date', val)
              }}
              error={!!errors.effective_from_date}
              helperText={errors.effective_from_date}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={form.effective_to_date}
              minDate={form.effective_from_date}
              onChange={(val: string) => {
                handleFieldChange('effective_to_date', val)
              }}
              error={!!errors.effective_to_date}
              helperText={errors.effective_to_date}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.active} onChange={(e) => setForm((prev: any) => ({ ...prev, active: e.target.checked }))} />}
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