// import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Grid, Autocomplete } from '@mui/material'
// import { useEffect, useState } from 'react'
// import CountryBusinessPayoutPartnerService from '@/services/countryBusinessPayoutPartner.service'
// import ProductBusinessCountryMappingService from '@/services/productBusinessCountryMapping.service'
// import { LocalStorageService } from '@/helpers/local-storage-service'

// const service = new CountryBusinessPayoutPartnerService()
// const productBusinessService = new ProductBusinessCountryMappingService()
// const local_service = new LocalStorageService()

// export default function CountryBusinessPayoutPartnerFormDialog({ open, handleClose, editData, refreshList, showAlert }: any) {
//   const [bussismessmapcode, setBussisnessmapcode] = useState<any[]>([])
//   const [errors, setErrors] = useState<any>({})
//   const [form, setForm] = useState<any>({
//     countryCorridorBusinessMapCode: '',
//     businessTypeCode: '',
//     payoutPartner: '',
//     active: true,
//     effectiveFromDate: '',
//     effectiveToDate: '',
//   })

//   /* ------------------ Fetch Mapping Dropdown ------------------ */
//   useEffect(() => {
//     if (open) {
//       productBusinessService.getList().then((data: any) => {
//         const list = Array.isArray(data) ? data : data?.data || []
//         setBussisnessmapcode(list.filter((item: any) => item.active === true))
//       })
//     }
//   }, [open])

//   /* ------------------ Edit mode & Data Reset ------------------ */
//   useEffect(() => {
//     if (editData && open) {
//       // Split T to ensure datetime-local/date pickers pre-fill correctly
//       const formatDate = (d: string) => (d && d.includes('T') ? d.split('T')[0] : d)

//       setForm({
//         ...editData,
//         countryCorridorBusinessMapCode: editData.countryCorridorBusinessMapCode || '',
//         effective_from_date: formatDate(editData.effective_from_date || editData.effectiveFromDate),
//         effective_to_date: formatDate(editData.effective_to_date || editData.effectiveToDate),
//       })
//     } else {
//       setForm({
//         countryCorridorBusinessMapCode: '',
//         businessTypeCode: '',
//         payoutPartner: '',
//         active: true,
//         effective_from_date: '',
//         effective_to_date: '',
//       })
//     }
//     setErrors({})
//   }, [editData, open])

//   const validate = () => {
//     const errs: any = {}
//     if (!form.countryCorridorBusinessMapCode) errs.countryCorridorBusinessMapCode = 'Required'
//     if (!form.businessTypeCode) errs.businessTypeCode = 'Required'
//     if (!form.payoutPartner) errs.payoutPartner = 'Required'
//     if (!form.effective_from_date) errs.effective_from_date = 'Required'
//     if (!form.effective_to_date) errs.effective_to_date = 'Required'

//     if (new Date(form.effective_to_date) < new Date(form.effective_from_date)) {
//       errs.effective_to_date = 'End date cannot be earlier than start date'
//     }

//     setErrors(errs)
//     return Object.keys(errs).length === 0
//   }

//   const handleSubmit = async () => {
//     if (!validate()) return

//     const payload = {
//       ...form,
//       // Format to ISO strings for backend consistency
//       effectiveFromDate: `${form.effective_from_date}T00:00:00.000Z`,
//       effectiveToDate: `${form.effective_to_date}T23:59:59.000Z`,
//     }

//     try {
//       const res = editData
//         ? await service.update(editData.countryBusinessPayoutPartnerCode, { ...payload, modified_by: local_service.get_staff_id() })
//         : await service.create({ ...payload, created_by: local_service.get_staff_id() })

//       if (res) {
//         showAlert('Success', `Partner ${editData ? 'Updated' : 'Created'} Successfully`)
//         refreshList()
//         handleClose()
//       }
//     } catch (e) {
//       showAlert('Fail', 'Server Error')
//     }
//   }

//   return (
//     <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
//       <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Payout Partner' : 'Create Payout Partner'}</DialogTitle>

//       <DialogContent dividers>
//         <Grid container spacing={2} sx={{ mt: 1 }}>
//           {/* Corridor Map Code - Searchable Autocomplete */}
//           <Grid item xs={12}>
//             <Autocomplete
//               options={bussismessmapcode}
//               disabled={!!editData}
//               getOptionLabel={(o: any) => o.businessMapCode || ''}
//               value={bussismessmapcode.find((m) => m.businessMapCode === form.countryCorridorBusinessMapCode) || null}
//               onChange={(_, val) => setForm({ ...form, countryCorridorBusinessMapCode: val?.businessMapCode || '' })}
//               renderInput={(p) => (
//                 <TextField
//                   {...p}
//                   label="Country Corridor Business Map Code"
//                   required
//                   error={!!errors.countryCorridorBusinessMapCode}
//                   helperText={errors.countryCorridorBusinessMapCode}
//                 />
//               )}
//             />
//           </Grid>

//           <Grid item xs={12}>
//             <TextField
//               label="Business Type Code"
//               required
//               fullWidth
//               error={!!errors.businessTypeCode}
//               helperText={errors.businessTypeCode}
//               value={form.businessTypeCode}
//               onChange={(e) => setForm({ ...form, businessTypeCode: e.target.value.toUpperCase() })}
//             />
//           </Grid>

//           <Grid item xs={12}>
//             <TextField
//               label="Payout Partner"
//               required
//               fullWidth
//               error={!!errors.payoutPartner}
//               helperText={errors.payoutPartner}
//               value={form.payoutPartner}
//               onChange={(e) => setForm({ ...form, payoutPartner: e.target.value })}
//             />
//           </Grid>

//           <Grid item xs={6}>
//             <TextField
//               type="date"
//               label="Effective From"
//               required
//               fullWidth
//               InputLabelProps={{ shrink: true }}
//               error={!!errors.effective_from_date}
//               helperText={errors.effective_from_date}
//               value={form.effective_from_date}
//               onChange={(e) => setForm({ ...form, effective_from_date: e.target.value })}
//             />
//           </Grid>

//           <Grid item xs={6}>
//             <TextField
//               type="date"
//               label="Effective To"
//               required
//               fullWidth
//               InputLabelProps={{ shrink: true }}
//               error={!!errors.effective_to_date}
//               helperText={errors.effective_to_date}
//               value={form.effective_to_date}
//               inputProps={{ min: form.effective_from_date }}
//               onChange={(e) => setForm({ ...form, effective_to_date: e.target.value })}
//             />
//           </Grid>

//           <Grid item xs={12}>
//             <FormControlLabel
//               control={<Checkbox checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
//               label="Active Status"
//             />
//           </Grid>
//         </Grid>
//       </DialogContent>

//       <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
//         <Button onClick={handleClose} color="inherit">
//           Cancel
//         </Button>
//         <Button variant="contained" onClick={handleSubmit}>
//           {editData ? 'Update' : 'Save'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   )
// }
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Grid, Autocomplete } from '@mui/material'
import { useEffect, useState, useMemo } from 'react'
import CountryBusinessPayoutPartnerService from '@/services/countryBusinessPayoutPartner.service'
import ProductBusinessCountryMappingService from '@/services/productBusinessCountryMapping.service'
import { LocalStorageService } from '@/helpers/local-storage-service'

const service = new CountryBusinessPayoutPartnerService()
const productBusinessService = new ProductBusinessCountryMappingService()
const local_service = new LocalStorageService()

export default function CountryBusinessPayoutPartnerFormDialog({ open, handleClose, editData, refreshList, showAlert }: any) {
  const [bussismessmapcode, setBussisnessmapcode] = useState<any[]>([])
  const [errors, setErrors] = useState<any>({})

  // Initial state uses camelCase
  const [form, setForm] = useState<any>({
    countryCorridorBusinessMapCode: '',
    businessTypeCode: '',
    payoutPartner: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  })

  useEffect(() => {
    if (open) {
      productBusinessService.getList().then((data: any) => {
        const list = Array.isArray(data) ? data : data?.data || []
        setBussisnessmapcode(list.filter((item: any) => item.active === true))
      })
    }
  }, [open])

  useEffect(() => {
    if (open) {
      if (editData) {
        // Edit Mode: Map incoming snake_case or camelCase to our form state
        const formatDate = (d: string) => (d && d.includes('T') ? d.split('T')[0] : d)
        setForm({
          ...editData,
          countryCorridorBusinessMapCode: editData.countryCorridorBusinessMapCode || '',
          effectiveFromDate: formatDate(editData.effectiveFromDate || editData.effective_from_date),
          effectiveToDate: formatDate(editData.effectiveToDate || editData.effective_to_date),
        })
      } else {
        // Create Mode: Explicitly blank dates
        setForm({
          countryCorridorBusinessMapCode: '',
          businessTypeCode: '',
          payoutPartner: '',
          active: true,
          effectiveFromDate: '',
          effectiveToDate: '',
        })
      }
      setErrors({})
    }
  }, [editData, open])

  const validate = () => {
    const errs: any = {}
    if (!form.countryCorridorBusinessMapCode) errs.countryCorridorBusinessMapCode = 'Required'
    if (!form.businessTypeCode) errs.businessTypeCode = 'Required'
    if (!form.payoutPartner) errs.payoutPartner = 'Required'
    if (!form.effectiveFromDate) errs.effectiveFromDate = 'Required'
    if (!form.effectiveToDate) errs.effectiveToDate = 'Required'

    // Date logical validation
    if (form.effectiveFromDate && form.effectiveToDate) {
      if (new Date(form.effectiveFromDate) > new Date(form.effectiveToDate)) {
        errs.effectiveFromDate = 'Start date cannot be after end date'
        errs.effectiveToDate = 'End date cannot be before start date'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    const staffId = local_service.get_staff_id()
    const payload = {
      ...form,
      // Sending back to API with correct spelling and time suffix
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${form.effectiveToDate}T23:59:59`,
    }

    try {
      const res = editData
        ? await service.update(editData.countryBusinessPayoutPartnerCode, { ...payload, modified_by: staffId })
        : await service.create({ ...payload, created_by: staffId })

      if (res && res.status === true) {
        showAlert('Success', `Partner ${editData ? 'Updated' : 'Created'} Successfully`)
        refreshList()
        handleClose()
      } else {
        showAlert('Fail', res?.message || 'Operation failed')
      }
    } catch (e) {
      showAlert('Fail', 'Server Error')
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Payout Partner' : 'Create Payout Partner'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Autocomplete
              options={bussismessmapcode}
              disabled={!!editData}
              getOptionLabel={(o: any) => o.businessMapCode || ''}
              value={bussismessmapcode.find((m) => m.businessMapCode === form.countryCorridorBusinessMapCode) || null}
              onChange={(_, val) => setForm({ ...form, countryCorridorBusinessMapCode: val?.businessMapCode || '' })}
              renderInput={(p) => (
                <TextField
                  {...p}
                  label="Corridor Business Map Code"
                  required
                  error={!!errors.countryCorridorBusinessMapCode}
                  helperText={errors.countryCorridorBusinessMapCode}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Business Type Code"
              fullWidth
              required
              value={form.businessTypeCode}
              onChange={(e) => setForm({ ...form, businessTypeCode: e.target.value.toUpperCase() })}
              error={!!errors.businessTypeCode}
              helperText={errors.businessTypeCode}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Payout Partner"
              fullWidth
              required
              value={form.payoutPartner}
              onChange={(e) => setForm({ ...form, payoutPartner: e.target.value })}
              error={!!errors.payoutPartner}
              helperText={errors.payoutPartner}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              type="date"
              label="Effective From"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={form.effectiveFromDate}
              onChange={(e) => setForm({ ...form, effectiveFromDate: e.target.value })}
              error={!!errors.effectiveFromDate}
              helperText={errors.effectiveFromDate}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              type="date"
              label="Effective To"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={form.effectiveToDate}
              onChange={(e) => setForm({ ...form, effectiveToDate: e.target.value })}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              inputProps={{ min: form.effectiveFromDate }}
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
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editData ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
