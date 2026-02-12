// import React, { useEffect, useState } from 'react'
// import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControlLabel, Grid, Checkbox } from '@mui/material'
// // import { IVendor } from './types'
// import VendorApiService from '../../services/vendor.api.service'
// interface IVendor {
//   vendorCode: string
//   vendorName: string
//   countryCode: string
//   currencyCode: string
//   vendorAddress1: string
//   vendorAddress2: string
//   vendorCountry: string
//   vendorState: string
//   vendorZipCode: string
//   vendorMobile: string
//   vendorEmail: string
//   vendorType: string
//   active: boolean
// }

// interface FormProps {
//   open: boolean
//   editData: IVendor | null
//   onClose: () => void
//   refreshList: () => void
//   showAlert: (type: string, message: string) => void
// }

// const emptyForm: IVendor = {
//   vendorCode: '',
//   vendorName: '',
//   countryCode: '',
//   currencyCode: '',
//   vendorAddress1: '',
//   vendorAddress2: '',
//   vendorCountry: '',
//   vendorState: '',
//   vendorZipCode: '',
//   vendorMobile: '',
//   vendorEmail: '',
//   vendorType: '',
//   active: true,
// }

// export default function VendorApiFormDialog({ open, editData, onClose, refreshList, showAlert }: FormProps) {
//   const service = new VendorApiService()
//   const [formData, setFormData] = useState<IVendor>(emptyForm)
//   const [errors, setErrors] = useState<Partial<Record<keyof IVendor, string>>>({})

//   useEffect(() => {
//     if (editData && open) {
//       setFormData({ ...editData })
//     } else {
//       setFormData(emptyForm)
//       setErrors({})
//     }
//   }, [editData, open])

//   const handleChange = (field: keyof IVendor, value: any) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//   }

//   const validate = (): boolean => {
//     const errs: Partial<Record<keyof IVendor, string>> = {}
//     if (!formData.vendorCode) errs.vendorCode = 'Required'
//     if (!formData.vendorName) errs.vendorName = 'Required'
//     if (!formData.vendorEmail) errs.vendorEmail = 'Required'
//     setErrors(errs)
//     return Object.keys(errs).length === 0
//   }

//   const handleSubmit = async () => {
//     if (!validate()) return
//     try {
//       if (editData) {
//         await service.update(editData.vendorCode, formData)
//       } else {
//         await service.create(formData)
//       }
//       showAlert('success', `Vendor ${editData ? 'Updated' : 'Created'} Successfully`)
//       refreshList()
//       onClose()
//     } catch (e) {
//       showAlert('error', 'Server Error occurred')
//     }
//   }

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
//       <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Edit Vendor Master' : 'Create Vendor Master'}</DialogTitle>
//       <DialogContent dividers>
//         <Grid container spacing={2} mt={1}>
//           <Grid item xs={4}>
//             <TextField
//               label="Vendor Code"
//               fullWidth
//               required
//               disabled={!!editData}
//               value={formData.vendorCode}
//               error={!!errors.vendorCode}
//               helperText={errors.vendorCode}
//               onChange={(e) => handleChange('vendorCode', e.target.value.toUpperCase())}
//             />
//           </Grid>
//           <Grid item xs={8}>
//             <TextField
//               label="Vendor Name"
//               fullWidth
//               required
//               value={formData.vendorName}
//               error={!!errors.vendorName}
//               onChange={(e) => handleChange('vendorName', e.target.value)}
//             />
//           </Grid>
//           <Grid item xs={4}>
//             <TextField
//               label="Country Code"
//               fullWidth
//               value={formData.countryCode}
//               onChange={(e) => handleChange('countryCode', e.target.value.toUpperCase())}
//             />
//           </Grid>
//           <Grid item xs={4}>
//             <TextField
//               label="Currency Code"
//               fullWidth
//               value={formData.currencyCode}
//               onChange={(e) => handleChange('currencyCode', e.target.value.toUpperCase())}
//             />
//           </Grid>
//           <Grid item xs={4}>
//             <TextField label="Vendor Type" fullWidth value={formData.vendorType} onChange={(e) => handleChange('vendorType', e.target.value)} />
//           </Grid>
//           <Grid item xs={6}>
//             <TextField label="Email" fullWidth value={formData.vendorEmail} onChange={(e) => handleChange('vendorEmail', e.target.value)} />
//           </Grid>
//           <Grid item xs={6}>
//             <TextField label="Mobile" fullWidth value={formData.vendorMobile} onChange={(e) => handleChange('vendorMobile', e.target.value)} />
//           </Grid>
//           <Grid item xs={6}>
//             <TextField label="Address 1" fullWidth value={formData.vendorAddress1} onChange={(e) => handleChange('vendorAddress1', e.target.value)} />
//           </Grid>
//           <Grid item xs={6}>
//             <TextField label="Address 2" fullWidth value={formData.vendorAddress2} onChange={(e) => handleChange('vendorAddress2', e.target.value)} />
//           </Grid>
//           <Grid item xs={4}>
//             <TextField label="State" fullWidth value={formData.vendorState} onChange={(e) => handleChange('vendorState', e.target.value)} />
//           </Grid>
//           <Grid item xs={4}>
//             <TextField label="Zip Code" fullWidth value={formData.vendorZipCode} onChange={(e) => handleChange('vendorZipCode', e.target.value)} />
//           </Grid>
//           <Grid item xs={4}>
//             <TextField
//               label="Country"
//               fullWidth
//               value={formData.vendorCountry}
//               onChange={(e) => handleChange('vendorCountry', e.target.value.toUpperCase())}
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <FormControlLabel
//               control={<Checkbox checked={formData.active} onChange={(e) => handleChange('active', e.target.checked)} />}
//               label="Active Status"
//             />
//           </Grid>
//         </Grid>
//       </DialogContent>
//       <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
//         <Button onClick={onClose} color="inherit">
//           Cancel
//         </Button>
//         <Button variant="contained" onClick={handleSubmit}>
//           {editData ? 'Update' : 'Save'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   )
// }
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
import VendorApiService, { IVendor } from '../../services/vendor.api.service'

const filter = createFilterOptions({
  matchFrom: 'any',
  stringify: (o: any) => `${o.countryName} ${o.countryCode}`,
})

export default function VendorApiFormDialog({ open, onClose, editData, refreshList, showAlert }: any) {
  const [countries] = useRecoilState(countyState)
  const service = new VendorApiService()

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
    // Required Field Validations
    if (!form.selectedCountry) newErrors.selectedCountry = 'Required'
    if (!form.vendorCode.trim()) newErrors.vendorCode = 'Required'
    if (!form.vendorName.trim()) newErrors.vendorName = 'Required'
    if (!form.vendorEmail.trim()) newErrors.vendorEmail = 'Required'
    if (!form.vendorMobile.trim()) newErrors.vendorMobile = 'Required'
    if (!form.vendorAddress1.trim()) newErrors.vendorAddress1 = 'Required'
    if (!form.effectiveFromDate) newErrors.effectiveFromDate = 'Required'
    if (!form.effectiveToDate) newErrors.effectiveToDate = 'Required'

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (form.vendorEmail && !emailRegex.test(form.vendorEmail)) {
      newErrors.vendorEmail = 'Invalid Email'
    }

    // Date logic check (from your reference)
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
      // Construct the payload and format the dates
      const payload = {
        ...form,
        countryCode: form.selectedCountry,
        vendorCountry: form.selectedCountry,
        // Append the time string to match YYYY-MM-DDTHH:mm:ss
        effectiveFromDate: form.effectiveFromDate ? `${form.effectiveFromDate}T00:00:00` : null,
        effectiveToDate: form.effectiveToDate ? `${form.effectiveToDate}T00:00:00` : null,
      }

      // Remove the helper field 'selectedCountry' if the API doesn't expect it
      delete (payload as any).selectedCountry

      if (editData) {
        await service.update(form.vendorCode, payload)
        showAlert('success', 'Vendor updated successfully')
      } else {
        await service.create(payload)
        showAlert('success', 'Vendor created successfully')
      }

      refreshList()
      onClose()
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
            <TextField fullWidth label="Currency Code" value={form.currencyCode} />
          </Grid>

          <Grid item xs={12} sm={4}>
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
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Vendor Name"
              value={form.vendorName}
              onChange={(e) => setForm({ ...form, vendorName: e.target.value })}
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
              onChange={(e) => setForm({ ...form, vendorMobile: e.target.value })}
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

          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="State" value={form.vendorState} onChange={(e) => setForm({ ...form, vendorState: e.target.value })} />
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
