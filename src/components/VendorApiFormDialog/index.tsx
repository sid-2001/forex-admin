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
import { useState, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import VendorApiService from '../../services/vendor.api.service'
import ForexCurrencyService from '@/services/forex-currency.service'
import StateService from '@/services/state.service'
import { LocalStorageService } from '@/helpers/local-storage-service'

const filter = createFilterOptions({
  matchFrom: 'any',
  stringify: (o: any) => `${o.countryName} ${o.countryCode}`,
})

export default function VendorApiFormDialog({ open, onClose, editData, refreshList, showAlert }: any) {
  const [countries] = useRecoilState(countyState)
  const service = new VendorApiService()
  const forexService = new ForexCurrencyService()
  const stateService = new StateService()
  const localService = new LocalStorageService()
  const [currencies, setCurrencies] = useState<any[]>([])
  const [form, setForm] = useState({
    vendorCode: '',
    vendorName: '',
    selectedCountry: '',
    currencyCode: '',
    vendorAddress1: '',
    vendorAddress2: '',
    vendorState: '',
    vendorZipCode: '',
    vendorMobile: '',
    vendorEmail: '',
    vendorType: '',
    effectiveFromDate: '',
    effectiveToDate: '',
    active: true,
  })

  const [errors, setErrors] = useState<any>({})
  const [statesList, setStatesList] = useState<any[]>([]) // Add this
  const [loadingStates, setLoadingStates] = useState(false)

  const fetchStates = async () => {
    setLoadingStates(true)
    try {
      // Replace with your actual service call
      const res = await stateService.getStateList()
      const data = res?.data || res
      setStatesList(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching states', err)
    } finally {
      setLoadingStates(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchCurrencies()
      fetchStates()
    }
  }, [open])

  const fetchCurrencies = async () => {
    try {
      const res = await forexService.getAll()
      console.log(res, 'bhanu')

      if (res && Array.isArray(res)) {
        setCurrencies(res)
      } else if (res && (res as any).data) {
        setCurrencies((res as any).data)
      }
    } catch (err) {
      console.error('Error fetching currencies', err)
    }
  }

  useEffect(() => {
    if (open) {
      fetchCurrencies()
    }
  }, [open])

  useEffect(() => {
    if (editData && open) {
      setForm({
        vendorCode: editData.vendorCode || '',
        vendorName: editData.vendorName || '',
        selectedCountry: editData.countryCode || '',
        currencyCode: editData.currencyCode || '',
        vendorAddress1: editData.vendorAddress1 || '',
        vendorAddress2: editData.vendorAddress2 || '',
        vendorState: editData.vendorState || '',
        vendorZipCode: editData.vendorZipCode || '',
        vendorMobile: editData.vendorMobile || '',
        vendorEmail: editData.vendorEmail || '',
        vendorType: editData.vendorType || '',
        effectiveFromDate: editData.effectiveFromDate ? String(editData.effectiveFromDate).split('T')[0] : '',
        effectiveToDate: editData.effectiveToDate ? String(editData.effectiveToDate).split('T')[0] : '',
        active: editData.active ?? true,
      })
    } else {
      setForm({
        vendorCode: '',
        vendorName: '',
        selectedCountry: '',
        currencyCode: '',
        vendorAddress1: '',
        vendorAddress2: '',
        vendorState: '',
        vendorZipCode: '',
        vendorMobile: '',
        vendorEmail: '',
        vendorType: '',
        effectiveFromDate: '',
        effectiveToDate: '',
        active: true,
      })
    }
    setErrors({})
  }, [editData, open])

  const validate = () => {
    const newErrors: any = {}
    if (!form.selectedCountry) newErrors.selectedCountry = 'Required'
    if (!form.currencyCode) newErrors.currencyCode = 'Required'
    // if (!form.vendorCode.trim()) newErrors.vendorCode = 'Required'
    if (!form.vendorName.trim()) newErrors.vendorName = 'Required'
    if (!form.vendorEmail.trim()) newErrors.vendorEmail = 'Required'
    if (!form.vendorMobile.trim()) newErrors.vendorMobile = 'Required'
    if (!form.vendorAddress1.trim()) newErrors.vendorAddress1 = 'Required'
    if (!form.effectiveFromDate) newErrors.effectiveFromDate = 'Required'
    if (!form.effectiveToDate) newErrors.effectiveToDate = 'Required'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (form.vendorEmail && !emailRegex.test(form.vendorEmail)) {
      newErrors.vendorEmail = 'Invalid Email'
    }

    if (form.effectiveFromDate && form.effectiveToDate) {
      if (new Date(form.effectiveToDate) < new Date(form.effectiveFromDate)) {
        newErrors.effectiveToDate = 'End Date cannot be before Start Date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      const payload = {
        ...form,
        countryCode: form.selectedCountry,
        vendorCountry: form.selectedCountry,
        effectiveFromDate: form.effectiveFromDate ? `${form.effectiveFromDate}T00:00:00` : null,
        effectiveToDate: form.effectiveToDate ? `${form.effectiveToDate}T00:00:00` : null,
        createdBy: editData ? null : localService.get_staff_id(),
      }

      delete (payload as any).selectedCountry
      let res
      if (editData) {
        res = await service.update(form.vendorCode, payload)
        showAlert('success', res?.message)
      } else {
        res = await service.create(payload)
        showAlert('success', res?.message)
      }

      if (res.status) {
        refreshList()
        onClose()
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Server Error')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Vendor' : 'Add Vendor'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={countries?.filter((c: any) => c.status === 'A') || []}
              filterOptions={filter}
              getOptionLabel={(o: any) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c: any) => c.countryCode === form.selectedCountry) || null}
              disabled={!!editData}
              onChange={(_, val) => {
                setForm({ ...form, selectedCountry: val ? val.countryCode : '', currencyCode: val ? val.currencyCode : '' })
              }}
              renderInput={(p) => <TextField {...p} label="Country" error={!!errors.selectedCountry} helperText={errors.selectedCountry} required />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Autocomplete
              disablePortal // Important: ensures the list renders on top of the Dialog
              options={currencies || []}
              getOptionLabel={(option) => (option.currencyCode ? `${option.currencyCode} - ${option.currencyName}` : '')}
              isOptionEqualToValue={(option, value) => option.currencyCode === value.currencyCode}
              // Correctly finds the object in the list based on the string code in form state
              value={currencies.find((c) => c.currencyCode === form.currencyCode) || null}
              onChange={(_, newValue) => {
                setForm({ ...form, currencyCode: newValue ? newValue.currencyCode : '' })
              }}
              renderInput={(params) => (
                <TextField {...params} label="Currency Code" required error={!!errors.currencyCode} helperText={errors.currencyCode} />
              )}
            />
          </Grid>

          {/* <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Vendor Code"
              value={form.vendorCode}
              disabled={!!editData}
              onChange={(e) => setForm({ ...form, vendorCode: e.target.value.toUpperCase() })}
              error={!!errors.vendorCode}
              helperText={errors.vendorCode}
              required
            />
          </Grid> */}
          <Grid item xs={12} sm={12}>
            <TextField
              fullWidth
              label="Vendor Name"
              value={form.vendorName}
              onChange={(e) => {
                const value = e.target.value
                setForm({ ...form, vendorName: value })

                if (!/^[A-Za-z\s]+$/.test(value)) {
                  setErrors({
                    ...errors,
                    vendorName: 'Only alphabets allowed',
                  })
                } else {
                  setErrors({
                    ...errors,
                    vendorName: '',
                  })
                }
              }}
              error={!!errors.vendorName}
              helperText={errors.vendorName}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={form.vendorEmail}
              onChange={(e) => setForm({ ...form, vendorEmail: e.target.value })}
              error={!!errors.vendorEmail}
              helperText={errors.vendorEmail}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Mobile"
              value={form.vendorMobile}
              onChange={(e) => {
                const value = e.target.value
                setForm({ ...form, vendorMobile: value })

                if (!/^\d+$/.test(value)) {
                  setErrors({
                    ...errors,
                    vendorMobile: 'Only digits are allowed',
                  })
                } else {
                  setErrors({
                    ...errors,
                    vendorMobile: '',
                  })
                }
              }}
              error={!!errors.vendorMobile}
              helperText={errors.vendorMobile}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address Line 1"
              value={form.vendorAddress1}
              onChange={(e) => setForm({ ...form, vendorAddress1: e.target.value })}
              error={!!errors.vendorAddress1}
              helperText={errors.vendorAddress1}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address Line 2"
              value={form.vendorAddress2}
              onChange={(e) => setForm({ ...form, vendorAddress2: e.target.value })}
            />
          </Grid>

          {/* <Grid item xs={12} sm={4}>
            <TextField fullWidth label="State" value={form.vendorState} onChange={(e) => setForm({ ...form, vendorState: e.target.value })} />
          </Grid> */}
          <Grid item xs={12} sm={4}>
            <Autocomplete
              options={statesList}
              loading={loadingStates}
              value={statesList.find((s) => s.StateCode === form.vendorState) || null}
              getOptionLabel={(option) => option.StateDescription || ''}
              isOptionEqualToValue={(option, value) => option.StateCode === value.StateCode}
              onChange={(_, newValue) => {
                setForm({ ...form, vendorState: newValue ? newValue.StateCode : '' })
              }}
              renderInput={(params) => <TextField {...params} label="State" fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Zip Code" value={form.vendorZipCode} onChange={(e) => setForm({ ...form, vendorZipCode: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Vendor Type"
              placeholder="e.g. Wholesale"
              value={form.vendorType}
              onChange={(e) => setForm({ ...form, vendorType: e.target.value })}
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFromDate}
              onChange={(v: string) => setForm({ ...form, effectiveFromDate: v })}
              error={!!errors.effectiveFromDate}
              helperText={errors.effectiveFromDate}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={form.effectiveToDate}
              minDate={form.effectiveFromDate}
              onChange={(v: string) => setForm({ ...form, effectiveToDate: v })}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
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
