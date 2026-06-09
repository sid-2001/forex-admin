import React, { useEffect, useState, useCallback } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete, FormControlLabel, Checkbox } from '@mui/material'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import SequenceApiService from '@/services/sequence.api.service'
import CouponService from '@/services/coupons.service'

export default function CouponDialog({ open, editData, onClose, refreshList, showAlert }: any) {
  const local_service = new LocalStorageService()
  const coupon_service = new CouponService()
  const sequenceService = new SequenceApiService()

  const initialFormState = {
    applicant_id: '',
    couponcode: '',
    description: '',
    amount: 0,
    title: '',
    bgcolor: '',
    expirydays: 0,
    countrycode: '',
    min_balance_required: 0,
    max_redemption_limit: 0,
    active: true,
    effectivefromdate: '',
    effectivetodate: '',
  }

  const [formData, setFormData] = useState<any>(initialFormState)
  const [errors, setErrors] = useState<any>({})
  const [countries, setcountries] = useState([])

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        effectivefromdate: editData?.effectivefromdate?.split('T')[0],
        effectivetodate: editData?.effectivetodate?.split('T')[0],
      })
    } else setFormData(initialFormState)
  }, [editData, open])

  useEffect(() => {
    fetchCountryCodes()
  }, [])

  const fetchCountryCodes = useCallback(async () => {
    const res: any = await sequenceService.getActiveCountryCorridors()
    setcountries(res || [])
  }, [])

  const handleSubmit = async () => {
    const mandatoryFields = ['countrycode', 'title', 'couponcode', 'description', 'effectivefromdate', 'effectivetodate']

    const isFormIncomplete = mandatoryFields.some((field) => !formData[field] || formData[field].toString().trim() === '')

    if (isFormIncomplete) {
      showAlert('error', 'Please fill in all mandatory fields before saving.')
      return
    }

    // 2. Proceed with API call
    try {
      if (editData) {
        const res = await coupon_service.updateCoupon({
          applicant_id: local_service?.get_staff_id(),
          couponcode: formData?.couponcode,
          description: formData?.description,
          amount: formData?.amount,
          title: formData?.title,
          bgcolor: formData?.bgcolor,
          expirydays: formData?.expirydays,
          countrycode: formData?.countrycode,
          min_balance_required: formData?.min_balance_required,
          max_redemption_limit: formData?.max_redemption_limit,
          active: formData?.active,
          effectivefromdate: formData.effectivefromdate + 'T00:00:00',
          effectivetodate: formData.effectivetodate + 'T00:00:00',
        })
        if (res.status === false || !res.status) {
          showAlert('error', res.message)
        }
        if (res.success) {
          showAlert('success', 'Coupon updated successfully')
          refreshList()
          onClose()
        }
      } else {
        console.log(formData, 'formdata')
        let payload = {
          ...formData,
          effectivefromdate: formData.effectivefromdate + 'T00:00:00',
          effectivetodate: formData.effectivetodate + 'T00:00:00',
          applicant_id: local_service?.get_staff_id(),
        }
        const res = await coupon_service.createCoupon(payload)
        console.log(res, 'response')
        if (res.status === false || !res.status) {
          showAlert('error', res.message)
        }
        if (res.success) {
          showAlert('success', 'Coupon created successfully')
          refreshList()
          onClose()
        }
      }
    } catch (error) {
      showAlert('error', 'Operation failed')
    }
  }

  const handleChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value })
    if (errors[key]) {
      setErrors({ ...errors, [key]: '' })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editData ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Coupon Code"
              required
              value={formData.couponcode}
              onChange={(e) => handleChange('couponcode', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Description"
              required
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Title" required value={formData.title} onChange={(e) => handleChange('title', e.target.value)} />
          </Grid>
          <Grid item xs={6}>
            <Autocomplete
              options={countries}
              value={countries.find((c: any) => c.countryCode === formData.countrycode) || null}
              getOptionLabel={(option: any) => `${option.countryName} (${option.countryCode})` || ''}
              isOptionEqualToValue={(option: any, value: any) => option.countryCode === value.countryCode}
              onChange={(_, newValue) => {
                setFormData({ ...formData, countrycode: newValue ? newValue.countryCode : '' })
              }}
              renderInput={(params) => <TextField {...params} label="Country" fullWidth />}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField fullWidth label="Background Color" value={formData.bgcolor} onChange={(e) => handleChange('bgcolor', e.target.value)} />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Expiry Days"
              type="number"
              value={formData.expirydays}
              inputProps={{ min: 0 }}
              onKeyDown={(e) => {
                if (e.key === '-') {
                  e.preventDefault()
                }
              }}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || Number(value) >= 0) {
                  handleChange('expirydays', Number(value))
                }
              }}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Min Balance Required"
              type="number"
              value={formData.min_balance_required}
              inputProps={{ min: 0 }}
              onKeyDown={(e) => {
                if (e.key === '-') {
                  e.preventDefault()
                }
              }}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || Number(value) >= 0) {
                  handleChange('min_balance_required', Number(value))
                }
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Max Redemption Limit"
              type="number"
              value={formData.max_redemption_limit}
              inputProps={{ min: 0 }}
              onKeyDown={(e) => {
                if (e.key === '-') {
                  e.preventDefault()
                }
              }}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || Number(value) >= 0) {
                  handleChange('max_redemption_limit', Number(value))
                }
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              inputProps={{ min: 0 }}
              onKeyDown={(e) => {
                if (e.key === '-') {
                  e.preventDefault()
                }
              }}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || Number(value) >= 0) {
                  handleChange('amount', Number(value))
                }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={formData.effectivefromdate}
              onChange={(val: string) => {
                setFormData({ ...formData, effectivefromdate: val })
              }}
              error={!!errors.effectivefromdate}
              helperText={errors.effectivefromdate}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={formData.effectivetodate}
              minDate={formData.effectivefromdate}
              onChange={(val: string) => {
                setFormData({ ...formData, effectivetodate: val })
              }}
              error={!!errors.effectivetodate}
              helperText={errors.effectivetodate}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={formData.active} onChange={(e) => handleChange('active', e.target.checked)} color="primary" />}
              label="Active Status"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} color="primary">
          {editData ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
