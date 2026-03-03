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

export default function StateFormDialog({ open, onClose, onSubmit, editData }: Props) {
  const [form, setForm] = useState({
    stateCode: '',
    description: '',
    countryCode: '',
    effectiveFrom: '',
    effectiveTo: '',
    active: true,
  })
  const [errors, setErrors] = useState<any>({})
  const [countries] = useRecoilState(countyState)

  useEffect(() => {
    if (editData && open) {
      setForm({
        stateCode: editData.StateCode || '',
        description: editData.StateDescription || '',
        countryCode: editData.CountryCode || '',
        effectiveFrom: editData.EffectiveFromDate ? editData.EffectiveFromDate.split('T')[0] : '',
        effectiveTo: editData.EffectiveToDate ? editData.EffectiveToDate.split('T')[0] : '',
        active: editData.Active ?? true,
      })
    } else {
      setForm({ stateCode: '', description: '', countryCode: '', effectiveFrom: '', effectiveTo: '', active: true })
    }
    setErrors({})
  }, [editData, open])

  const handleSubmit = () => {
    const newErrors: any = {}
    if (!form.stateCode.trim()) newErrors.stateCode = 'Required'
    if (!form.description.trim()) newErrors.description = 'Required'
    if (!form.countryCode) newErrors.countryCode = 'Required'
    if (!form.effectiveFrom) newErrors.effectiveFrom = 'Required'
    if (!form.effectiveTo) newErrors.effectiveTo = 'Required'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    if (new Date(form.effectiveTo) < new Date(form.effectiveFrom)) {
      onSubmit({ validationError: 'End Date cannot be earlier than Start Date' })
      return
    }

    onSubmit(form)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update State' : 'Create State'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Autocomplete
              options={countries?.filter((c: any) => c.status === 'A') || []}
              filterOptions={filter}
              getOptionLabel={(o: any) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c: any) => c.countryCode === form.countryCode) || null}
              disabled={!!editData}
              onChange={(_, val) => setForm({ ...form, countryCode: val ? val.countryCode : '' })}
              renderInput={(p) => <TextField {...p} label="Country" error={!!errors.countryCode} helperText={errors.countryCode} required />}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="State Code"
              inputProps={{ maxLength: 10 }}
              value={form.stateCode}
              disabled={!!editData}
              onChange={(e) => {
                const val = e.target.value.toUpperCase()
                if (/^[A-Z]{0,10}$/.test(val)) {
                  setForm({ ...form, stateCode: val })
                }
              }}
              error={!!errors.stateCode}
              helperText={errors.stateCode}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="State Description"
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
                console.log(val, 'kdjhchdvy')
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
