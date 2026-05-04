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
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

const filter = createFilterOptions({
  matchFrom: 'any',
  stringify: (o: any) => `${o.countryName} ${o.countryCode}`,
})

const VALIDATION_RULES = {
  selectedCountry: {
    max: 3,
    message: 'Country code cannot exceed 3 characters',
    required: true,
    pattern: /^[A-Z]{2,3}$/,
    patternMessage: 'Country code should be 2-3 uppercase letters',
  },
  gendercode: {
    message: 'Gender Code is required',
    required: true,
    pattern: /^[A-Z]+$/,
    patternMessage: 'Only alphabets allowed',
  },
  description: {
    message: 'Description is required',
    pattern: /^[A-Za-z\s]+$/,
    patternMessage: 'Only alphabets allowed',
    required: true,
  },
  effectiveTo: { required: true, message: 'To Date is required' },
  effectiveFrom: { required: true, message: 'From Date is required' },
}

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
        effectiveFrom: fDate ? String(fDate).split('T')[0] : '',
        effectiveTo: tDate ? String(tDate).split('T')[0] : '',
        active: editData.active ?? true,
      })
    } else {
      setForm({ gendercode: '', description: '', selectedCountry: '', effectiveFrom: '', effectiveTo: '', active: true })
    }
    setErrors({})
  }, [editData, open])

  const validate = () => {
    const newErrors: any = {}

    Object.keys(VALIDATION_RULES).forEach((field) => {
      const rule = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES]
      const value = form[field as keyof typeof form]

      if (value) {
        // Max length validation
        //@ts-ignore
        if (rule.max && value.length > rule.max) {
          newErrors[field] = rule.message
        }

        //@ts-ignore
        if ((field === 'description' || field === 'gendercode' || field === 'countryCode') && rule.pattern && !rule.pattern.test(value)) {
          //@ts-ignore
          newErrors[field] = rule.patternMessage
        }
      } else if (
        //@ts-ignore
        rule.required
      ) {
        newErrors[field] = 'This field is required'
      }
    })

    // Date validation: effectiveToDate must be after effectiveFromDate
    if (form.effectiveFrom && form.effectiveTo) {
      const fromDate = new Date(form.effectiveFrom)
      const toDate = new Date(form.effectiveTo)

      if (toDate <= fromDate) {
        newErrors.effectiveTo = 'Effective To date must be after Effective From date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
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
              renderInput={(p) => <TextField {...p} required label="Country" error={!!errors.selectedCountry} helperText={errors.selectedCountry} />}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Gender Code"
              inputProps={{ maxLength: 1 }}
              value={form.gendercode}
              disabled={!!editData}
              required
              // onChange={(e) => setForm({ ...form, gendercode: e.target.value.toUpperCase() })}
              onChange={(e) => {
                const val = e.target.value.toUpperCase()
                if (val === '' || /^[A-Z]$/.test(val)) {
                  setForm({ ...form, gendercode: val })
                }
              }}
              error={!!errors.gendercode}
              helperText={errors.gendercode}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              required
              inputProps={{ maxLength: 15 }}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFrom}
              onChange={(val: string) => {
                setForm({ ...form, effectiveFrom: val })
              }}
              error={!!errors.effectiveFrom}
              helperText={errors.effectiveFrom}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={form.effectiveTo}
              minDate={form.effectiveFrom}
              onChange={(val: string) => {
                setForm({ ...form, effectiveTo: val })
              }}
              error={!!errors.effectiveTo}
              helperText={errors.effectiveTo}
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
