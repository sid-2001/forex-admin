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
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilValue } from 'recoil'
import { countyState } from '@/states/state'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import BankBusinessTypeService, { BankBusinessType } from '../../services/bantypemaster.service'
import StateService, { StateMaster } from '../../services/state.service'
import ForexCurrencyService, { ForexCurrency } from '@/services/forex-currency.service'
import dayjs from 'dayjs'

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
  bankPostalCode: { max: 10, message: 'Bank postal code cannot exceed 10 characters' },
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
  const [currencies, setCurrencies] = useState<ForexCurrency[]>([])
  const [filteredCurrencies, setFilteredCurrencies] = useState<ForexCurrency[]>([])
  const [loadingCurrencies, setLoadingCurrencies] = useState(false)

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

  const forexCurrencyService = new ForexCurrencyService()

  // Fetch all currencies when component mounts
  useEffect(() => {
    const fetchCurrencies = async () => {
      setLoadingCurrencies(true)
      try {
        const response = await forexCurrencyService.getAll()
        setCurrencies(response)
      } catch (error) {
        console.error('Error fetching currencies:', error)
      } finally {
        setLoadingCurrencies(false)
      }
    }

    fetchCurrencies()
  }, [])

  // Filter currencies based on selected country
  useEffect(() => {
    if (!form.countryCode) {
      setFilteredCurrencies([])
      return
    }

    const filtered = currencies.filter((currency) => currency.countryCode === form.countryCode && currency.active === true)

    setFilteredCurrencies(filtered)

    // Auto select if only one currency
    if (filtered.length === 1) {
      handleFieldChange('currencyCode', filtered[0].currencyCode)
    }
  }, [form.countryCode, currencies])

  // Filter currencies based on selected country
  // useEffect(() => {
  //   if (!form.countryCode || !currencies.length) {
  //     setFilteredCurrencies([])
  //     return
  //   }

  //   // Find the selected country from countries list
  //   const selectedCountry = countries?.find((c: any) => c.countryCode === form.countryCode)

  //   if (selectedCountry) {
  //     // Get the country's currency code (adjust property name based on your data structure)
  //     const countryCurrencyCode = selectedCountry.currencyCode || selectedCountry.currency

  //     if (countryCurrencyCode) {
  //       // Filter currencies that match the country's currency code and are active
  //       const filtered = currencies.filter(
  //         (currency) => currency.currencyCode === countryCurrencyCode && currency.active === true
  //       )

  //       console.log('Filtered currencies:', filtered)
  //       setFilteredCurrencies(filtered)

  //       // Auto-select the currency if only one matches and it's different from current
  //       if (filtered.length === 1 && filtered[0].currencyCode !== form.currencyCode) {
  //         handleFieldChange('currencyCode', filtered[0].currencyCode)
  //       }
  //     } else {
  //       // If country doesn't have a specific currency, show all active currencies
  //       setFilteredCurrencies(currencies.filter((c) => c.active))
  //     }
  //   } else {
  //     setFilteredCurrencies(currencies.filter((c) => c.active))
  //   }
  // }, [form.countryCode, currencies, countries])

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
        if (response as any) {
          // Filter business types by country code and active status
          const filteredTypes = response
            //@ts-ignore
            ?.filter(
              (type: BankBusinessType) =>
                //@ts-ignore
                type.countryCode === form.countryCode && type.active === true,
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
          const filteredStates = response
            //@ts-ignore
            .filter(
              (state: StateMaster) =>
                //@ts-ignore
                state.CountryCode === form.countryCode &&
                //@ts-ignore
                state.Active === true,
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
      [field]: error,
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
    const newErrors: any = {}

    // Validate all required fields and length constraints
    requiredFields.forEach((field) => {
      const error = validateField(field, form[field])
      if (error) newErrors[field] = error
    })

    // Validate optional fields for length constraints
    Object.keys(VALIDATION_RULES).forEach((field) => {
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
    const offsetStr = (offset >= 0 ? '+' : '-') + String(offsetHours).padStart(2, '0') + ':' + String(offsetMinutes).padStart(2, '0')

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
      effectiveToDate: `${form.effective_to_date}T00:00:00`,
      createdBy: '',
    }

    // IMPORTANT: Add identifier for update
    if (editData) {
      // Use the correct identifier field name (adjust based on your API)
      payload.bankMasterCode = editData.bankMasterCode || editData.bankCode
      payload.modifiedBy = localService.get_staff_id()
    } else {
      payload.createdBy = localService.get_staff_id()
    }

    console.log('Submitting payload for', editData ? 'update' : 'create', ':', payload)
    onSubmit(payload)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Bank' : 'Add Bank'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* Country Selection */}
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
                  bankStateProvinceCode: '',
                }))
                // Validate after state update
                setTimeout(() => {
                  handleFieldChange('countryCode', newCountryCode)
                }, 0)
              }}
              disabled={!!editData}
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
            <Autocomplete
              options={filteredCurrencies}
              loading={loadingCurrencies}
              getOptionLabel={(option: ForexCurrency) => `${option.currencyName} (${option.currencyCode})`}
              value={filteredCurrencies.find((currency) => currency.currencyCode === form.currencyCode) || null}
              onChange={(_, selectedValue) => {
                const newCurrencyCode = selectedValue?.currencyCode || ''
                setForm((prev: any) => ({
                  ...prev,
                  currencyCode: newCurrencyCode,
                }))
                setTimeout(() => {
                  handleFieldChange('currencyCode', newCurrencyCode)
                }, 0)
              }}
              disabled={!!editData || !form.countryCode || filteredCurrencies.length === 0}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Currency"
                  required
                  error={!!errors.currencyCode}
                  helperText={
                    errors.currencyCode || (filteredCurrencies.length === 0 && form.countryCode ? 'No currencies available for this country' : '')
                  }
                  placeholder={
                    !form.countryCode ? 'Select a country first' : filteredCurrencies.length === 0 ? 'No currencies available' : 'Select currency'
                  }
                  disabled={!!editData || !form.countryCode || filteredCurrencies.length === 0}
                  inputProps={{
                    ...params.inputProps,
                    maxLength: VALIDATION_RULES.currencyCode.max,
                  }}
                />
              )}
              noOptionsText={
                !form.countryCode
                  ? 'Please select a country first'
                  : loadingCurrencies
                    ? 'Loading currencies...'
                    : 'No currencies available for this country'
              }
            />

            {/* Error and info messages */}
            {errors.currencyCode && <p style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{errors.currencyCode}</p>}

            {form.countryCode && filteredCurrencies.length === 0 && !errors.currencyCode && !loadingCurrencies && (
              <p style={{ color: '#666', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>No active currencies found for this country</p>
            )}

            {/* Show current selection info */}
            {form.countryCode && filteredCurrencies.length > 0 && form.currencyCode && !errors.currencyCode && (
              <p style={{ color: '#4caf50', fontSize: 12, marginTop: 4 }}>
                ✓ Currency selected for {countries?.find((c: any) => c.countryCode === form.countryCode)?.countryName}
              </p>
            )}
          </Grid>

          {/* Bank Code */}
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

          {/* Bank Name */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Bank Name"
              required
              value={form.bankName}
              onChange={(e) => {
                const value = e.target.value
                setForm({ ...form, bankName: value })

                if (!/^[A-Za-z\s]+$/.test(value)) {
                  setErrors({
                    ...errors,
                    bankName: 'Only alphabets allowed',
                  })
                } else {
                  setErrors({
                    ...errors,
                    bankName: '',
                  })
                }
              }}
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
                `${
                  //@ts-ignore
                  option.bankBusinessName
                } (${option.businessTypeCode})`
              }
              value={businessTypes.find((type: BankBusinessType) => type.businessTypeCode == form.bankType) || null}
              onChange={(_, selectedValue) => {
                setForm((prev: any) => ({
                  ...prev,
                  bankTypeCode: selectedValue?.businessTypeCode || '',
                  bankType: selectedValue?.businessTypeCode || '',
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
                  helperText={
                    errors.bankTypeCode || (businessTypes.length === 0 && form.countryCode ? 'No bank types available for this country' : '')
                  }
                  placeholder={!form.countryCode ? 'Select country first' : 'Select bank type'}
                  disabled={!!editData || !form.countryCode || businessTypes.length === 0}
                />
              )}
              disabled={!form.countryCode || businessTypes.length === 0}
              noOptionsText={!form.countryCode ? 'Please select a country first' : loadingBusinessTypes ? 'Loading...' : 'No bank types available'}
            />
          </Grid>

          {/* Branch Code */}
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

          {/* IFSC / BIC Code */}
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

          {/* City */}
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

          {/* State Selection */}
          <Grid item xs={4}>
            <Autocomplete
              options={states}
              loading={loadingStates}
              getOptionLabel={(option: StateMaster) =>
                //@ts-ignore
                `${option.StateDescription} (${option.StateCode})`
              }
              value={
                states.find(
                  (state: StateMaster) =>
                    //@ts-ignore
                    state.StateCode === form.bankStateProvinceCode,
                ) || null
              }
              onChange={(_, selectedValue) => {
                //@ts-ignore
                const newStateCode = selectedValue?.StateCode || ''
                setForm((prev: any) => ({
                  ...prev,
                  bankStateProvinceCode: newStateCode,
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
              noOptionsText={!form.countryCode ? 'Please select a country first' : loadingStates ? 'Loading...' : 'No states available'}
            />
          </Grid>

          {/* Postal Code */}
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Postal Code"
              required
              value={form.bankPostalCode}
              onChange={(e) => {
                const value = e.target.value
                setForm({ ...form, bankPostalCode: value })

                if (!/^\d+$/.test(value)) {
                  setErrors({
                    ...errors,
                    bankPostalCode: 'Only digits are allowed',
                  })
                } else {
                  setErrors({
                    ...errors,
                    bankPostalCode: '',
                  })
                }
              }}
              error={!!errors.bankPostalCode}
              helperText={errors.bankPostalCode || `Max ${VALIDATION_RULES.bankPostalCode.max} characters`}
              inputProps={{ maxLength: VALIDATION_RULES.bankPostalCode.max }}
            />
          </Grid>

          {/* Effective From Date */}
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

          {/* Effective To Date */}
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

          {/* Active Status */}
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
