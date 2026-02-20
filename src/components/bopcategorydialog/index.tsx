// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
//   Checkbox,
//   FormControlLabel,
//   Select,
//   MenuItem,
//   InputLabel,
//   FormHelperText,
//   Box,
// } from '@mui/material'
// import { useEffect, useState } from 'react'
// import { useRecoilState } from 'recoil'
// import { countyState } from '@/states/state'

// export default function BopCategoryFormDialog({ open, onClose, onSubmit, editData, categorylist }: any) {
//   const [countries] = useRecoilState(countyState)

//   const [countryCode, setCountryCode] = useState('')
//   const [selectedCategory, setSelectedCategory] = useState('')
//   const [bopPurposeCode, setBopPurposeCode] = useState('')
//   const [bopPurposeDescription, setBopPurposeDescription] = useState('')
//   const [bopPurposeSubCode, setBopPurposeSubCode] = useState('')
//   const [bopPurposeSubDescription, setBopPurposeSubDescription] = useState('')
//   const [effectiveFrom, setEffectiveFrom] = useState('')
//   const [effectiveTo, setEffectiveTo] = useState('')
//   const [active, setActive] = useState(true)

//   const [errors, setErrors] = useState<any>({})

//   /* ------------------ Edit Mode ------------------ */
//   useEffect(() => {
//     if (editData) {
//       setCountryCode(editData.countryCode)
//       setSelectedCategory(editData.categoryType)
//       setBopPurposeCode(editData.bopPurposeCode)
//       setBopPurposeDescription(editData.bopPurposeDescription)
//       setBopPurposeSubCode(editData.bopPurposeSubCode)
//       setBopPurposeSubDescription(editData.bopPurposeSubDescription)
//       setEffectiveFrom(editData.effective_from_date.split('T')[0])
//       setEffectiveTo(editData.effective_to_date.split('T')[0])
//       setActive(editData.active)
//     }
//   }, [editData])

//   /* ------------------ Validation ------------------ */
//   const validate = () => {
//     const newErrors: any = {}

//     if (!countryCode) newErrors.countryCode = 'Country is required'
//     if (!selectedCategory) newErrors.categoryType = 'Category Type is required'
//     if (!bopPurposeCode.trim()) newErrors.bopPurposeCode = 'Purpose Code is required'
//     if (!bopPurposeDescription.trim()) newErrors.bopPurposeDescription = 'Purpose Description is required'
//     if (!bopPurposeSubCode.trim()) newErrors.bopPurposeSubCode = 'Sub Code is required'
//     if (!bopPurposeSubDescription.trim()) newErrors.bopPurposeSubDescription = 'Sub Description is required'
//     if (!effectiveFrom) newErrors.effectiveFrom = 'Effective From date is required'
//     if (!effectiveTo) newErrors.effectiveTo = 'Effective To date is required'

//     if (effectiveFrom && effectiveTo && new Date(effectiveTo) < new Date(effectiveFrom)) {
//       newErrors.effectiveTo = 'Effective To date cannot be before Effective From'
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   /* ------------------ Submit ------------------ */
//   const handleSubmit = () => {
//     if (!validate()) return

//     onSubmit({
//       countryCode,
//       categoryType: selectedCategory,
//       bopPurposeCode,
//       bopPurposeDescription,
//       bopPurposeSubCode,
//       bopPurposeSubDescription,
//       effectiveFromDate: `${effectiveFrom}T00:00:00`,
//       effectiveToDate: `${effectiveTo}T23:59:59`,
//       active,
//     })
//   }

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
//       <DialogTitle>{editData ? 'Update BOP Category' : 'Add BOP Category'}</DialogTitle>

//       <DialogContent>
//         {/* -------- Country -------- */}
//         <Box mt={1}>
//           <InputLabel required>Country</InputLabel>
//           <Select fullWidth value={countryCode} disabled={!!editData} error={!!errors.countryCode} onChange={(e) => setCountryCode(e.target.value)}>
//             {countries
//               ?.filter((c) => c.status === 'A')
//               .map((c) => (
//                 <MenuItem
//                   //@ts-ignore
//                   key={c.countryCode}
//                   value={c.countryCode}
//                 >
//                   {c.countryName}
//                 </MenuItem>
//               ))}
//           </Select>
//           {errors.countryCode && <FormHelperText error>{errors.countryCode}</FormHelperText>}
//         </Box>

//         {/* -------- Category Type -------- */}
//         <Box mt={2}>
//           <InputLabel required>Category Type</InputLabel>
//           <Select
//             fullWidth
//             value={selectedCategory}
//             disabled={!!editData}
//             error={!!errors.categoryType}
//             onChange={(e) => setSelectedCategory(e.target.value)}
//           >
//             {categorylist?.map((c: any) => (
//               <MenuItem key={c.bopCategoryTypeCode} value={c.bopCategoryTypeCode}>
//                 {c.bopCategoryType}
//               </MenuItem>
//             ))}
//           </Select>
//           {errors.categoryType && <FormHelperText error>{errors.categoryType}</FormHelperText>}
//         </Box>

//         <TextField
//           label="Purpose Code"
//           fullWidth
//           required
//           margin="normal"
//           value={bopPurposeCode}
//           error={!!errors.bopPurposeCode}
//           helperText={errors.bopPurposeCode}
//           onChange={(e) => setBopPurposeCode(e.target.value)}
//         />

//         <TextField
//           label="Purpose Description"
//           fullWidth
//           required
//           margin="normal"
//           value={bopPurposeDescription}
//           error={!!errors.bopPurposeDescription}
//           helperText={errors.bopPurposeDescription}
//           onChange={(e) => setBopPurposeDescription(e.target.value)}
//         />

//         <TextField
//           label="Sub Code"
//           fullWidth
//           required
//           margin="normal"
//           value={bopPurposeSubCode}
//           error={!!errors.bopPurposeSubCode}
//           helperText={errors.bopPurposeSubCode}
//           onChange={(e) => setBopPurposeSubCode(e.target.value)}
//         />

//         <TextField
//           label="Sub Description"
//           fullWidth
//           required
//           margin="normal"
//           value={bopPurposeSubDescription}
//           error={!!errors.bopPurposeSubDescription}
//           helperText={errors.bopPurposeSubDescription}
//           onChange={(e) => setBopPurposeSubDescription(e.target.value)}
//         />

//         <TextField
//           type="date"
//           label="Effective From"
//           fullWidth
//           required
//           margin="normal"
//           InputLabelProps={{ shrink: true }}
//           value={effectiveFrom}
//           error={!!errors.effectiveFrom}
//           helperText={errors.effectiveFrom}
//           onChange={(e) => setEffectiveFrom(e.target.value)}
//         />

//         <TextField
//           type="date"
//           label="Effective To"
//           fullWidth
//           required
//           margin="normal"
//           InputLabelProps={{ shrink: true }}
//           inputProps={{ min: effectiveFrom }}
//           value={effectiveTo}
//           error={!!errors.effectiveTo}
//           helperText={errors.effectiveTo}
//           onChange={(e) => setEffectiveTo(e.target.value)}
//         />

//         <FormControlLabel control={<Checkbox checked={active} onChange={(e) => setActive(e.target.checked)} />} label="Active" />
//       </DialogContent>

//       <DialogActions>
//         <Button onClick={onClose}>Cancel</Button>
//         <Button variant="contained" onClick={handleSubmit}>
//           {editData ? 'Update' : 'Create'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   )
// }
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Grid, Autocomplete } from '@mui/material'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'
import BopCategoryService from '@/services/bop.category.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

export default function BopCategoryFormDialog({ open, onClose, editData, categorylist, refreshList, showAlert }: any) {
  const [countries] = useRecoilState(countyState)
  const service = new BopCategoryService()
  const localService = new LocalStorageService()

  const [form, setForm] = useState<any>({
    countryCode: '',
    categoryType: '',
    bopPurposeCode: '',
    bopPurposeDescription: '',
    bopPurposeSubCode: '',
    bopPurposeSubDescription: '',
    effectiveFromDate: '',
    effectiveToDate: '',
    active: true,
  })

  const [errors, setErrors] = useState<any>({})

  // Null-safe date formatter to prevent .split() crash
  const formatDate = (dateStr: any) => {
    if (!dateStr) return ''
    const str = String(dateStr)
    return str.includes('T') ? str.split('T')[0] : str
  }

  useEffect(() => {
    if (open) {
      if (editData) {
        setForm({
          ...editData,
          // Handle potential spelling differences from API
          effectiveFromDate: formatDate(editData.effectiveFromDate || editData.effective_from_date),
          effectiveToDate: formatDate(editData.effectiveToDate || editData.effective_to_date),
          active: editData.active ?? true,
        })
      } else {
        setForm({
          countryCode: '',
          categoryType: '',
          bopPurposeCode: '',
          bopPurposeDescription: '',
          bopPurposeSubCode: '',
          bopPurposeSubDescription: '',
          effectiveFromDate: '',
          effectiveToDate: '',
          active: true,
        })
      }
      setErrors({})
    }
  }, [editData, open])

  const validate = () => {
    const errs: any = {}
    if (!form.countryCode) errs.countryCode = 'Required'
    if (!form.categoryType) errs.categoryType = 'Required'
    if (!form.bopPurposeCode) errs.bopPurposeCode = 'Required'
    if (!form.effectiveFromDate) errs.effectiveFromDate = 'Required'
    if (!form.effectiveToDate) errs.effectiveToDate = 'Required'

    if (form.effectiveFromDate && form.effectiveToDate) {
      if (new Date(form.effectiveFromDate) > new Date(form.effectiveToDate)) {
        errs.effectiveToDate = 'End date cannot be earlier than start date'
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    const staffId = localService.get_staff_id() || 'admin'
    const payload = {
      ...form,
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${form.effectiveToDate}T00:00:00`,
    }

    try {
      const res = editData ? await service.update({ ...payload, modified_by: staffId }) : await service.create({ ...payload, created_by: staffId })

      if (res?.status === true || res) {
        showAlert('Success', `Category ${editData ? 'Updated' : 'Created'} Successfully`)
        refreshList()
        onClose()
      } else {
        showAlert('Fail', res?.message || 'Operation failed')
      }
    } catch (e) {
      showAlert('Fail', 'Server Error')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update BOP Category' : 'Add BOP Category'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Autocomplete
              options={countries?.filter((c) => c.status === 'A') || []}
              getOptionLabel={(option) => (option.countryName as string) || ('' as string)}
              disabled={!!editData}
              value={countries.find((c) => c.countryCode === form.countryCode) || null}
              onChange={(_, val) => setForm({ ...form, countryCode: val?.countryCode || '' })}
              renderInput={(params) => <TextField {...params} label="Country" required error={!!errors.countryCode} />}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              options={categorylist || []}
              getOptionLabel={(option) => option.bopCategoryType || ''}
              value={categorylist.find((c: any) => c.bopCategoryTypeCode === form.categoryType) || null}
              onChange={(_, val) => setForm({ ...form, categoryType: val?.bopCategoryTypeCode || '' })}
              renderInput={(params) => <TextField {...params} label="Category Type" required error={!!errors.categoryType} />}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Purpose Code"
              fullWidth
              value={form.bopPurposeCode}
              onChange={(e) => setForm({ ...form, bopPurposeCode: e.target.value })}
              error={!!errors.bopPurposeCode}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Sub Code"
              fullWidth
              value={form.bopPurposeSubCode}
              onChange={(e) => setForm({ ...form, bopPurposeSubCode: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth
              value={form.bopPurposeDescription}
              onChange={(e) => setForm({ ...form, bopPurposeDescription: e.target.value })}
              error={!!errors.bopPurposeDescription}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Sub Description"
              fullWidth
              value={form.bopPurposeSubDescription}
              onChange={(e) => setForm({ ...form, bopPurposeSubDescription: e.target.value })}
            />
          </Grid>
          {/* <Grid item xs={6}>
            <TextField
              type="date"
              label="Effective From"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.effectiveFromDate}
              onChange={(e) => setForm({ ...form, effectiveFromDate: e.target.value })}
              error={!!errors.effectiveFromDate}
            />
          </Grid> */}
          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFromDate}
              onChange={(val: string) => {
                console.log(val, 'kdjhchdvy')
                setForm({ ...form, effectiveFromDate: val })
              }}
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
              onChange={(val: string) => {
                setForm({ ...form, effectiveToDate: val })
              }}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              required
            />
          </Grid>
          {/* <Grid item xs={6}>
            <TextField
              type="date"
              label="Effective To"
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: form.effectiveFromDate }}
              value={form.effectiveToDate}
              onChange={(e) => setForm({ ...form, effectiveToDate: e.target.value })}
              error={!!errors.effectiveToDate}
            />
          </Grid> */}
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
          {editData ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
