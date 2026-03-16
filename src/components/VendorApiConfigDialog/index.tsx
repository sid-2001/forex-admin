import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Grid, Autocomplete } from '@mui/material'
import { useState, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import VendorApiConfigService from '../../services/vendorApiConfig.service'
import ForexCurrencyService from '@/services/forex-currency.service'

export default function VendorApiConfigDialog({ open, onClose, editData, refreshList, showAlert, vendors, urlTypes }: any) {
  const service = new VendorApiConfigService()
  const [countries] = useRecoilState(countyState)
  const [currencies, setCurrencies] = useState<any[]>([])
  const [filteredCurrencies, setFilteredCurrencies] = useState<any[]>([])
  const [isFormChanged, setIsFormChanged] = useState(false)
  const [originalFormData, setOriginalFormData] = useState<any>(null)
  const currencyService = new ForexCurrencyService()

  const [form, setForm] = useState<any>({
    vendorCode: '',
    urlCode: '',
    serviceCountry: '',
    serviceCurrency: '',
    token: '',
    apiKey: '',
    secretKey: '',
    url: '',
    effectiveFromDate: '',
    effectiveToDate: '',
    active: true,
    // Add these to hold the object references for Autocomplete UI
    vendor: null,
    urlType: null,
    selectedCurrency: null,
  })

  const [errors, setErrors] = useState<any>({})

  // Fetch currencies on component mount
  useEffect(() => {
    currencyService.getAll().then(data => {
      console.log('Currencies fetched:', data)
      setCurrencies(data || [])
    }).catch(err => {
      console.error('Error fetching currencies:', err)
    })
  }, [])

  // Filter currencies based on selected country
  useEffect(() => {
    if (form.serviceCountry && currencies.length > 0) {
      // Filter currencies by country code
      const filtered = currencies.filter((c: any) => 
        c.countryCode === form.serviceCountry && c.active === true
      )
      setFilteredCurrencies(filtered)
      
      // If current selected currency doesn't belong to the new country, reset it
      if (form.serviceCurrency) {
        const currencyStillValid = filtered.some((c: any) => c.currencyCode === form.serviceCurrency)
        if (!currencyStillValid) {
          setForm((prev: any) => ({
            ...prev,
            serviceCurrency: '',
            selectedCurrency: null
          }))
        }
      }
    } else {
      setFilteredCurrencies([])
      // Reset currency when country is cleared
      if (form.serviceCurrency) {
        setForm((prev: any) => ({
          ...prev,
          serviceCurrency: '',
          selectedCurrency: null
        }))
      }
    }
  }, [form.serviceCountry, currencies])

  // Function to check if form has changed
  const checkFormChanged = (current: any, original: any) => {
    if (!original) return false
    
    return (
      current.vendorCode !== original.vendorCode ||
      current.urlCode !== original.urlCode ||
      current.serviceCountry !== original.serviceCountry ||
      current.serviceCurrency !== original.serviceCurrency ||
      current.token !== original.token ||
      current.apiKey !== original.apiKey ||
      current.secretKey !== original.secretKey ||
      current.url !== original.url ||
      current.effectiveFromDate !== original.effectiveFromDate ||
      current.effectiveToDate !== original.effectiveToDate ||
      current.active !== original.active
    )
  }

  useEffect(() => {
    if (editData && open) {
      console.log('Editing data:', editData)
      const vCode = editData.vendorCode || editData.vendor?.vendorCode || ''
      const uCode = editData.urlCode || editData.urlType?.urlCode || ''

      const selectedVendor = vendors?.find((v: any) => v.vendorCode === vCode)
      const selectedUrlType = urlTypes?.find((u: any) => u.urlCode === uCode)
      
      // Find the currency object for the selected currency code
      const selectedCurrency = currencies?.find((c: any) => 
        c.currencyCode === editData.serviceCurrency && 
        c.countryCode === (editData.serviceCountry || editData.countryCode)
      )

      const newFormData = {
        ...editData,
        vendor: selectedVendor || null,
        urlType: selectedUrlType || null,
        selectedCurrency: selectedCurrency || null,
        vendorCode: vCode,
        urlCode: uCode,
        serviceCountry: editData.serviceCountry || editData.countryCode || '',
        serviceCurrency: editData.serviceCurrency || '',
        effectiveFromDate: editData.effectiveFromDate ? String(editData.effectiveFromDate).split('T')[0] : '',
        effectiveToDate: editData.effectiveToDate ? String(editData.effectiveToDate).split('T')[0] : '',
        active: editData.active ?? true,
      }
      
      setForm(newFormData)
      setOriginalFormData(newFormData)
      setIsFormChanged(false)
    } else {
      const newFormData = {
        vendorCode: '',
        urlCode: '',
        serviceCountry: '',
        serviceCurrency: '',
        token: '',
        apiKey: '',
        secretKey: '',
        url: '',
        effectiveFromDate: '',
        effectiveToDate: '',
        active: true,
        vendor: null,
        urlType: null,
        selectedCurrency: null,
      }
      setForm(newFormData)
      setOriginalFormData(null)
      setIsFormChanged(false)
    }
    setErrors({})
  }, [editData, open, vendors, urlTypes, currencies])

  // Track form changes
  useEffect(() => {
    if (originalFormData) {
      const changed = checkFormChanged(form, originalFormData)
      setIsFormChanged(changed)
    }
  }, [form, originalFormData])

  const validate = () => {
    const newErrors: any = {}
    if (!form.vendorCode) newErrors.vendorCode = 'Required'
    if (!form.urlCode) newErrors.urlCode = 'Required'
    if (!form.serviceCountry) newErrors.serviceCountry = 'Required'
    if (!form.serviceCurrency) newErrors.serviceCurrency = 'Required'
    if (!form.apiKey) newErrors.apiKey = 'Required'
    if (!form.effectiveFromDate) newErrors.effectiveFromDate = 'Required'
    if (!form.effectiveToDate) newErrors.effectiveToDate = 'Required'

    if (form.effectiveFromDate && form.effectiveToDate && new Date(form.effectiveToDate) < new Date(form.effectiveFromDate)) {
      newErrors.effectiveToDate = 'End Date cannot be before Start Date'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    // Create a clean payload (removing the UI-only objects)
    const { vendor, urlType, selectedCurrency, ...cleanForm } = form
    const payload = {
      ...cleanForm,
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00Z`,
      effectiveToDate: `${form.effectiveToDate}T00:00:00Z`,
    }

    try {
      if (editData) {
        await service.update(editData.id, payload)
        showAlert('success', 'Config updated successfully')
      } else {
        await service.create(payload)
        showAlert('success', 'Config created successfully')
      }
      refreshList()
      onClose()
    } catch (err: any) {
      showAlert('error', err.response?.data?.message || 'Operation failed')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Vendor API' : 'Add Vendor API'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* Vendor Selection */}
          <Grid item xs={6}>
            <Autocomplete
              options={vendors || []}
              getOptionLabel={(o: any) => `${o.vendorName} (${o.vendorCode})`}
              value={form.vendor || null}
              isOptionEqualToValue={(option, value) => option?.vendorCode === value?.vendorCode}
              onChange={(_, val) =>
                setForm({
                  ...form,
                  vendor: val,
                  vendorCode: val ? val.vendorCode : '',
                })
              }
              renderInput={(p) => <TextField {...p} label="Vendor" error={!!errors.vendorCode} helperText={errors.vendorCode} required />}
            />
          </Grid>

          {/* URL Type Selection */}
          <Grid item xs={6}>
            <Autocomplete
              options={urlTypes || []}
              getOptionLabel={(o: any) => `${o.urlType} (${o.urlCode})`}
              value={form.urlType || null}
              isOptionEqualToValue={(option, value) => option?.urlCode === value?.urlCode}
              onChange={(_, val) =>
                setForm({
                  ...form,
                  urlType: val,
                  urlCode: val ? val.urlCode : '',
                })
              }
              renderInput={(p) => <TextField {...p} label="URL Type" error={!!errors.urlCode} helperText={errors.urlCode} required />}
            />
          </Grid>

          {/* Country Selection */}
          <Grid item xs={6}>
            <Autocomplete
              options={countries?.filter((c: any) => c.status === 'A') || []}
              getOptionLabel={(o: any) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c: any) => c.countryCode === form.serviceCountry) || null}
              isOptionEqualToValue={(option, value) => option?.countryCode === value?.countryCode}
              onChange={(_, val: any) =>
                setForm({
                  ...form,
                  serviceCountry: val ? val.countryCode : '',
                  // Reset currency when country changes
                  serviceCurrency: '',
                  selectedCurrency: null,
                })
              }
              renderInput={(p) => (
                <TextField {...p} label="Service Country" error={!!errors.serviceCountry} helperText={errors.serviceCountry} required />
              )}
            />
          </Grid>

          {/* Currency Selection - Now a dropdown filtered by selected country */}
          <Grid item xs={6}>
            <Autocomplete
              options={filteredCurrencies}
              getOptionLabel={(o: any) => `${o.currencyCode} - ${o.currencyName} (${o.currencySymbol})`}
              value={form.selectedCurrency || null}
              isOptionEqualToValue={(option, value) => option?.currencyCode === value?.currencyCode}
              onChange={(_, val) =>
                setForm({
                  ...form,
                  selectedCurrency: val,
                  serviceCurrency: val ? val.currencyCode : '',
                })
              }
              disabled={!form.serviceCountry}
              renderInput={(p) => (
                <TextField 
                  {...p} 
                  label="Service Currency" 
                  error={!!errors.serviceCurrency} 
                  helperText={errors.serviceCurrency || (!form.serviceCountry ? 'Select country first' : '')}
                  required 
                />
              )}
            />
          </Grid>

          {/* Endpoint URL */}
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              label="Endpoint URL" 
              value={form.url || ''} 
              onChange={(e) => setForm({ ...form, url: e.target.value })} 
            />
          </Grid>

          {/* API Key */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="API Key"
              value={form.apiKey || ''}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              error={!!errors.apiKey}
              helperText={errors.apiKey}
              required
            />
          </Grid>

          {/* Secret Key */}
          <Grid item xs={6}>
            <TextField 
              fullWidth 
              label="Secret Key" 
              value={form.secretKey || ''} 
              onChange={(e) => setForm({ ...form, secretKey: e.target.value })} 
            />
          </Grid>

          {/* Token */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Token"
              multiline
              rows={2}
              value={form.token || ''}
              onChange={(e) => setForm({ ...form, token: e.target.value })}
            />
          </Grid>

          {/* Effective From Date */}
          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFromDate}
              onChange={(v: any) => setForm({ ...form, effectiveFromDate: v })}
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
              onChange={(v: any) => setForm({ ...form, effectiveToDate: v })}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              required
            />
          </Grid>

          {/* Active Status */}
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={editData ? !isFormChanged : false}
        >
          {editData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}