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
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

const filter = createFilterOptions({
  matchFrom: 'any',
  stringify: (o: any) => `${o.countryName} ${o.countryCode}`,
})

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  editData?: any | null
}

const VALIDATION_RULES = {
  selectedCountry: {
    max: 3,
    message: 'Country code cannot exceed 3 characters',
    required: true,
    pattern: /^[A-Z]{2,3}$/,
    patternMessage: 'Country code should be 2-3 uppercase letters',
  },
  channelCode: {
    message: 'Channel Code is required',
    required: true,
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

export default function ChannelFormDialog({ open, onClose, onSubmit, editData }: Props) {
  const [form, setForm] = useState({
    channelCode: '',
    description: '',
    selectedCountry: '',
    effectiveFrom: '',
    effectiveTo: '',
    active: true,
  })
  const [errors, setErrors] = useState<any>({})
  const [countries] = useRecoilState(countyState)

  useEffect(() => {
    if (editData && open) {
      // Map both potential underscore and lowercase keys from API
      const fDate = editData.effective_from_date || editData.effectivefromdate || ''
      const tDate = editData.effective_to_date || editData.effectivetodate || ''

      setForm({
        channelCode: editData.channel_code || '',
        description: editData.channel_description || '',
        selectedCountry: editData.country_code || '',
        effectiveFrom: fDate.includes('T') ? fDate.split('T')[0] : fDate,
        effectiveTo: tDate.includes('T') ? tDate.split('T')[0] : tDate,
        active: editData.active ?? true,
      })
    } else {
      setForm({ channelCode: '', description: '', selectedCountry: '', effectiveFrom: '', effectiveTo: '', active: true })
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
        if ((field === 'description' || field === 'countryCode') && rule.pattern && !rule.pattern.test(value)) {
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
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Channel' : 'Create Channel'}</DialogTitle>
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
              renderInput={(p) => <TextField {...p} label="Country" error={!!errors.selectedCountry} helperText={errors.selectedCountry} required />}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Channel Code"
              inputProps={{ maxLength: 1 }}
              value={form.channelCode}
              disabled={!!editData}
              onChange={(e) => {
                const val = e.target.value.toUpperCase()
                if (val === '' || /^[A-Z]$/.test(val)) {
                  setForm({ ...form, channelCode: val })
                }
              }}
              error={!!errors.channelCode}
              helperText={errors.channelCode}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Channel Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              error={!!errors.description}
              helperText={errors.description}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFrom}
              onChange={(val: string) => {
                setForm({ ...form, effectiveFrom: val })
              }}
              minDate={new Date().toISOString().split('T')[0]}
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
