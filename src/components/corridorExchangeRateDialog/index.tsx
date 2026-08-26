import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Grid, Autocomplete } from '@mui/material'
import { useState, useEffect, useCallback } from 'react'

import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import SequenceApiService from '@/services/sequence.api.service'
import VendorApiService from '@/services/vendor.api.service'
import ForexCountryService from '@/services/forextcoutnry.service'
import { CountryCorridorService } from '@/services/countryCorridor.service'

const VALIDATION_RULES = {
  countryCorridorCode: {
    message: 'Country Corridor Code is required',
    required: true,
  },
  countryCode: {
    message: 'Country Code is required',
    required: true,
  },
  businessCorridorReceivingCountry: {
    message: 'Business Corridor Receiving Country is required',
    required: true,
  },
  exchangeRatePartnerCode: {
    message: 'Exchange Rate Partner Code is required',
    required: true,
  },
  effectiveToDate: { required: true, message: 'To Date is required' },
  effectiveFromDate: { required: true, message: 'From Date is required' },
}

const initialForm = {
  countryCorridorCode: '',
  countryCode: '',
  businessCorridorReceivingCountry: '',
  exchangeRatePartnerCode: '',
  effectiveFromDate: '',
  effectiveToDate: '',
  active: true,
}

export default function CorridorExchangeRateDialog({ open, onClose, onSubmit, editData }: any) {
  const [formData, setFormData] = useState(initialForm)
  const [errors, setErrors] = useState<any>({})
  const [countries, setcountries] = useState<any>([])
  const [allCountriesData, setAllCountriesData] = useState<any>([])

  const [partners, setPartners] = useState<any>([])
  const [countryCorridors, setCountryCorridors] = useState<any>([])

  const sequenceService = new SequenceApiService()
  const vendorService = new VendorApiService()
  const countryService = new ForexCountryService()
  const corridorService = new CountryCorridorService()

  useEffect(() => {
    if (editData && open) {
      setFormData({
        countryCode: editData?.senderCountry || '',
        businessCorridorReceivingCountry: editData.businessReceivingCountry || '',
        exchangeRatePartnerCode: editData.vendorCode,
        effectiveFromDate: String(editData?.corridorExchangeRateMaster?.effectiveFromDate).split('T')[0] || '',
        effectiveToDate: String(editData?.corridorExchangeRateMaster?.effectiveToDate).split('T')[0] || '',
        countryCorridorCode: editData?.corridorExchangeRateMaster?.countryCorridorMaster?.countryCorridorCode,
        active: editData?.corridorExchangeRateMaster?.active,
      })
    } else {
      setFormData(initialForm)
    }
    setErrors({})
  }, [editData, open])

  useEffect(() => {
    fetchMasterData()
  }, [])

  const fetchMasterData = useCallback(async () => {
    try {
      const [activeCountryList, rateVendorList, allCountries, corridorsList] = await Promise.all([
        sequenceService.getActiveCountryCorridors(),
        vendorService.getExchangeRateVendorsList(),
        countryService.getAll(),
        corridorService.getAllCorridors(),
      ])
      setcountries(activeCountryList || [])
      //@ts-ignore
      setPartners(rateVendorList) || []
      setAllCountriesData(allCountries.filter((item: any) => item.status === 'A') || [])
      setCountryCorridors(corridorsList || [])
    } catch (err) {
      console.error('Error fetching master data:', err)
    }
  }, [sequenceService, vendorService])

  const validate = () => {
    const newErrors: any = {}

    Object.keys(VALIDATION_RULES).forEach((field) => {
      const rule = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES]
      const value = formData[field as keyof typeof formData]

      if (!value && rule.required) {
        newErrors[field] = 'This field is required'
      }
    })

    // Date validation: effectiveToDate must be after effectiveFromDate
    if (formData.effectiveFromDate && formData.effectiveToDate) {
      const fromDate = new Date(formData.effectiveFromDate)
      const toDate = new Date(formData.effectiveToDate)

      if (toDate <= fromDate) {
        newErrors.effectiveTo = 'Effective To date must be after Effective From date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    let payload = {
      ...formData,
      effectiveFromDate: formData.effectiveFromDate + 'T00:00:00',
      effectiveToDate: formData.effectiveToDate + 'T00:00:00',
      countryCorridorMaster: {
        countryCorridorCode: formData?.countryCorridorCode,
      },
    }
    //@ts-ignore
    delete payload.countryCorridorCode
    onSubmit(payload)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
        {editData ? 'Update Country Corridor Exchange Rate' : 'Add Country Corridor Exchange Rate'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={6}>
            <Autocomplete
              options={countries}
              value={countries.find((c: any) => c.countryCode === formData.countryCode) || null}
              getOptionLabel={(option: any) => `${option.countryName} (${option.countryCode})` || ''}
              isOptionEqualToValue={(option: any, value: any) => option.countryCode === value.countryCode}
              onChange={(_, newValue) => {
                setFormData({ ...formData, countryCode: newValue ? newValue.countryCode : '' })
              }}
              renderInput={(params) => <TextField {...params} label="Country" fullWidth required />}
            />
          </Grid>

          <Grid item xs={6}>
            <Autocomplete
              options={partners}
              value={partners.find((c: any) => c.vendorCode === formData.exchangeRatePartnerCode) || null}
              getOptionLabel={(option: any) => `${option.vendorName} (${option.vendorCode})` || ''}
              isOptionEqualToValue={(option: any, value: any) => option.vendorCode === value.vendorCode}
              onChange={(_, newValue) => {
                setFormData({ ...formData, exchangeRatePartnerCode: newValue ? newValue.vendorCode : '' })
              }}
              renderInput={(params) => <TextField {...params} label="Exchange Rate Partner Code" fullWidth required />}
            />
          </Grid>

          <Grid item xs={6}>
            <Autocomplete
              options={allCountriesData}
              value={allCountriesData.find((c: any) => c.countryCode === formData.businessCorridorReceivingCountry) || null}
              getOptionLabel={(option: any) => `${option.countryName} (${option.countryCode})` || ''}
              isOptionEqualToValue={(option: any, value: any) => option.countryCode === value.countryCode}
              onChange={(_, newValue) => {
                setFormData({ ...formData, businessCorridorReceivingCountry: newValue ? newValue.countryCode : '' })
              }}
              renderInput={(params) => <TextField {...params} label="Business Corridor Receiving Country" fullWidth required />}
            />
          </Grid>

          <Grid item xs={6}>
            <Autocomplete
              options={countryCorridors}
              value={countryCorridors.find((c: any) => c.countryCorridorCode === formData.countryCorridorCode) || null}
              getOptionLabel={(option: any) => option.countryCorridorCode}
              isOptionEqualToValue={(option: any, value: any) => option.countryCorridorCode === value.countryCorridorCode}
              onChange={(_, newValue) => {
                setFormData({ ...formData, countryCorridorCode: newValue ? newValue.countryCorridorCode : '' })
              }}
              renderInput={(params) => <TextField {...params} label="Country Corridor Code" fullWidth required />}
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={formData.effectiveFromDate}
              onChange={(val: string) => {
                setFormData({ ...formData, effectiveFromDate: val })
              }}
              error={!!errors.effectiveFrom}
              helperText={errors.effectiveFrom}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={formData.effectiveToDate}
              minDate={formData.effectiveFromDate}
              onChange={(val: string) => {
                setFormData({ ...formData, effectiveToDate: val })
              }}
              error={!!errors.effectiveTo}
              helperText={errors.effectiveTo}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />}
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
