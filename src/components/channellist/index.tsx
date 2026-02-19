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

  const handleSubmit = () => {
    const newErrors: any = {}
    if (!form.channelCode.trim()) newErrors.channelCode = 'Required'
    if (!form.description.trim()) newErrors.description = 'Required'
    if (!form.selectedCountry) newErrors.selectedCountry = 'Required'
    if (!form.effectiveFrom) newErrors.effectiveFrom = 'Required'
    if (!form.effectiveTo) newErrors.effectiveTo = 'Required'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    // Logical Date Validation
    if (new Date(form.effectiveTo) < new Date(form.effectiveFrom)) {
      onSubmit({ validationError: 'End Date cannot be earlier than Start Date' })
      return
    }

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
              onChange={(e) => setForm({ ...form, channelCode: e.target.value.toUpperCase() })}
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
                console.log(val, 'kdjhchdvy')
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
