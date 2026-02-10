// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
//   Checkbox,
//   FormControlLabel,
//   Grid,
//   Autocomplete,
//   createFilterOptions,
// } from '@mui/material'
// import { useState, useEffect } from 'react'
// import { useRecoilState } from 'recoil'
// import { countyState } from '@/states/state'

// const filter = createFilterOptions({
//   matchFrom: 'any',
//   stringify: (o: any) => `${o.countryName} ${o.countryCode}`,
// })

// export default function GenderFormDialog({ open, onClose, onSubmit, editData }: any) {
//   const [countries] = useRecoilState(countyState)
//   const [form, setForm] = useState({
//     gendercode: '',
//     description: '',
//     selectedCountry: '',
//     effectiveFrom: '',
//     effectiveTo: '',
//     active: true,
//   })
//   const [errors, setErrors] = useState<any>({})

//   useEffect(() => {
//     if (editData && open) {
//       // Map multiple naming conventions to local form state
//       const fDate = editData.effectivefromdate || editData.effectiveFromDate || ''
//       const tDate = editData.effectivetodate || editData.effectiveToDate || ''

//       setForm({
//         gendercode: editData.gendercode || '',
//         description: editData.description || '',
//         selectedCountry: editData.countrycode || '',
//         effectiveFrom: fDate.includes('T') ? fDate.split('T')[0] : fDate,
//         effectiveTo: tDate.includes('T') ? tDate.split('T')[0] : tDate,
//         active: editData.active ?? true,
//       })
//     } else {
//       setForm({ gendercode: '', description: '', selectedCountry: '', effectiveFrom: '', effectiveTo: '', active: true })
//     }
//     setErrors({})
//   }, [editData, open])

//   const handleSubmit = () => {
//     const newErrors: any = {}
//     if (!form.gendercode.trim()) newErrors.gendercode = 'Required'
//     if (!form.description.trim()) newErrors.description = 'Required'
//     if (!form.selectedCountry) newErrors.selectedCountry = 'Required'
//     if (!form.effectiveFrom) newErrors.effectiveFrom = 'Required'
//     if (!form.effectiveTo) newErrors.effectiveTo = 'Required'

//     setErrors(newErrors)
//     if (Object.keys(newErrors).length > 0) return

//     // Validate that 'To Date' is after 'From Date'
//     if (new Date(form.effectiveTo) < new Date(form.effectiveFrom)) {
//       onSubmit({ validationError: 'End Date cannot be less than Start Date' })
//       return
//     }

//     onSubmit(form)
//   }

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Gender' : 'Add Gender'}</DialogTitle>
//       <DialogContent dividers>
//         <Grid container spacing={2} sx={{ mt: 0.5 }}>
//           <Grid item xs={12}>
//             <Autocomplete
//               options={countries?.filter((c: any) => c.status === 'A') || []}
//               filterOptions={filter}
//               getOptionLabel={(o: any) => `${o.countryName} (${o.countryCode})`}
//               value={countries?.find((c: any) => c.countryCode === form.selectedCountry) || null}
//               disabled={!!editData}
//               onChange={(_, val) => setForm({ ...form, selectedCountry: val ? val.countryCode : '' })}
//               renderInput={(p) => <TextField {...p} label="Country" error={!!errors.selectedCountry} helperText={errors.selectedCountry} />}
//             />
//           </Grid>

//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label="Gender Code"
//               inputProps={{ maxLength: 1 }}
//               value={form.gendercode}
//               disabled={!!editData}
//               onChange={(e) => setForm({ ...form, gendercode: e.target.value.toUpperCase() })}
//               error={!!errors.gendercode}
//               helperText={errors.gendercode}
//             />
//           </Grid>

//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label="Description"
//               inputProps={{ maxLength: 15 }}
//               value={form.description}
//               onChange={(e) => setForm({ ...form, description: e.target.value })}
//               error={!!errors.description}
//               helperText={errors.description}
//             />
//           </Grid>

//           <Grid item xs={6}>
//             <TextField
//               fullWidth
//               type="date"
//               label="Effective From"
//               InputLabelProps={{ shrink: true }}
//               value={form.effectiveFrom}
//               onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
//               error={!!errors.effectiveFrom}
//               helperText={errors.effectiveFrom}
//             />
//           </Grid>

//           <Grid item xs={6}>
//             <TextField
//               fullWidth
//               type="date"
//               label="Effective To"
//               InputLabelProps={{ shrink: true }}
//               value={form.effectiveTo}
//               onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })}
//               error={!!errors.effectiveTo}
//               helperText={errors.effectiveTo}
//               inputProps={{ min: form.effectiveFrom }}
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
//         <Button onClick={onClose} color="inherit">
//           Cancel
//         </Button>
//         <Button variant="contained" onClick={handleSubmit}>
//           {editData ? 'Update' : 'Create'}
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
import { useState, useEffect, useMemo } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'
import dayjs from 'dayjs'

const filter = createFilterOptions({
  matchFrom: 'any',
  stringify: (o: any) => `${o.countryName} ${o.countryCode}`,
})

export default function GenderFormDialog({ open, onClose, onSubmit, editData }: any) {
  const [countries] = useRecoilState(countyState)

  // Get dynamic date format for display hints
  const displayDateFormat = useMemo(() => {
    const storedConfig = localStorage.getItem('countryConfig')
    if (storedConfig) {
      const config = JSON.parse(storedConfig)
      return config.dateFormat // e.g., "dd-MM-yyyy"
    }
    return 'yyyy-mm-dd'
  }, [])

  const [form, setForm] = useState({
    gendercode: '',
    description: '',
    selectedCountry: '',
    effectiveFrom: '',
    effectiveTo: '',
    active: true,
  })

  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (editData && open) {
      const fDate = editData.effectivefromdate || editData.effectiveFromDate || ''
      const tDate = editData.effectivetodate || editData.effectiveToDate || ''

      setForm({
        gendercode: editData.gendercode || '',
        description: editData.description || '',
        selectedCountry: editData.countrycode || '',
        // HTML5 Date input strictly requires YYYY-MM-DD
        effectiveFrom: fDate ? dayjs(fDate).format('YYYY-MM-DD') : '',
        effectiveTo: tDate ? dayjs(tDate).format('YYYY-MM-DD') : '',
        active: editData.active ?? true,
      })
    } else {
      setForm({ gendercode: '', description: '', selectedCountry: '', effectiveFrom: '', effectiveTo: '', active: true })
    }
    setErrors({})
  }, [editData, open])

  const handleSubmit = () => {
    const newErrors: any = {}
    if (!form.gendercode.trim()) newErrors.gendercode = 'Required'
    if (!form.description.trim()) newErrors.description = 'Required'
    if (!form.selectedCountry) newErrors.selectedCountry = 'Required'
    if (!form.effectiveFrom) newErrors.effectiveFrom = 'Required'
    if (!form.effectiveTo) newErrors.effectiveTo = 'Required'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    if (new Date(form.effectiveTo) < new Date(form.effectiveFrom)) {
      onSubmit({ validationError: 'End Date cannot be less than Start Date' })
      return
    }

    onSubmit(form)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Gender' : 'Add Gender'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Autocomplete
              options={countries?.filter((c: any) => c.status === 'A') || []}
              filterOptions={filter}
              getOptionLabel={(o: any) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c: any) => c.countryCode === form.selectedCountry) || null}
              disabled={!!editData}
              onChange={(_, val) => setForm({ ...form, selectedCountry: val ? val.countryCode : '' })}
              renderInput={(p) => <TextField {...p} label="Country" error={!!errors.selectedCountry} helperText={errors.selectedCountry} />}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Gender Code"
              inputProps={{ maxLength: 1 }}
              value={form.gendercode}
              disabled={!!editData}
              onChange={(e) => setForm({ ...form, gendercode: e.target.value.toUpperCase() })}
              error={!!errors.gendercode}
              helperText={errors.gendercode}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              inputProps={{ maxLength: 15 }}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              label="Effective From"
              InputLabelProps={{ shrink: true }}
              value={form.effectiveFrom}
              onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
              error={!!errors.effectiveFrom}
              // Displaying the dynamic format as a hint to the user
              helperText={errors.effectiveFrom || `Format: ${displayDateFormat}`}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              label="Effective To"
              InputLabelProps={{ shrink: true }}
              value={form.effectiveTo}
              onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })}
              error={!!errors.effectiveTo}
              helperText={errors.effectiveTo || `Format: ${displayDateFormat}`}
              inputProps={{ min: form.effectiveFrom }}
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
