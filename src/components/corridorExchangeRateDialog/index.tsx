import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Grid, Autocomplete } from '@mui/material'
import { useState, useEffect, useCallback } from 'react'

import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import SequenceApiService from '@/services/sequence.api.service'
import MasterService from '@/services/master.service'
import { LocalStorageService } from '@/helpers/local-storage-service'

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
  const [countries, setcountries] = useState([])

  const local_service = new LocalStorageService()
  const master_service = new MasterService()
  const sequenceService = new SequenceApiService()

  useEffect(() => {
    if (editData && open) {
      setFormData({
        countryCode: editData.countryCode || '',
        businessCorridorReceivingCountry: editData.businessCorridorReceivingCountry || '',
        exchangeRatePartnerCode: editData.exchangeRatePartnerCode,
        effectiveFromDate: String(editData?.effectiveFromDate).split('T')[0] || '',
        effectiveToDate: String(editData?.effectiveToDate).split('T')[0] || '',
        countryCorridorCode: '',
        active: true,
      })
    } else {
      setFormData(initialForm)
    }
    setErrors({})
  }, [editData, open])

  useEffect(() => {
    fetchCountryCodes()
  }, [])

  const fetchCountryCodes = useCallback(async () => {
    const res: any = await sequenceService.getActiveCountryCorridors()
    setcountries(res || [])
  }, [])

  const validate = () => {
    const newErrors: any = {}

    Object.keys(VALIDATION_RULES).forEach((field) => {
      const rule = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES]
      if (rule.required) {
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
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Group' : 'Add Group'}</DialogTitle>
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
