import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Grid, Autocomplete } from '@mui/material'
import { useState, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'

export default function ScreenFormDialog({ open, onClose, onSubmit, editData }: any) {
  const [countries] = useRecoilState(countyState)
  const [form, setForm] = useState({
    screencode: '',
    description: '',
    selectedCountry: '',
    fromDate: '',
    toDate: '',
    active: true,
  })

  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (open) {
      if (editData) {
        setForm({
          screencode: editData.screencode || '',
          description: editData.screendescription || '',
          selectedCountry: editData.countrycode || '',
          fromDate: editData.effectivefromdate?.split('T')[0] || '',
          toDate: editData.effectivetodate?.split('T')[0] || '',
          active: editData.active ?? true,
        })
      } else {
        setForm({
          screencode: '',
          description: '',
          selectedCountry: '',
          fromDate: '',
          toDate: '',
          active: true,
        })
      }
      setErrors({})
    }
  }, [editData, open])

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      //@ts-ignore
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const validate = () => {
    const newErrors: any = {}
    if (!form.selectedCountry) newErrors.selectedCountry = 'Required'
    if (!form.screencode.trim()) newErrors.screencode = 'Required'
    if (!form.description.trim()) newErrors.description = 'Required'
    if (!form.fromDate) newErrors.fromDate = 'Required'
    if (!form.toDate) newErrors.toDate = 'Required'

    if (form.fromDate && form.toDate) {
      if (new Date(form.toDate) < new Date(form.fromDate)) {
        newErrors.toDate = 'End date cannot be earlier than start date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    onSubmit({
      screencode: form.screencode,
      screendescription: form.description,
      active: form.active,
      selectedCountry: form.selectedCountry,
      fromDate: form.fromDate,
      toDate: form.toDate,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Screen' : 'Add Screen'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Autocomplete
              options={countries?.filter((c) => c.status === 'A') || []}
              getOptionLabel={(o) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c) => c.countryCode === form.selectedCountry) || null}
              disabled={!!editData}
              onChange={(_, val) => handleChange('selectedCountry', val ? val.countryCode : '')}
              renderInput={(p) => (
                <TextField {...p} label="Destination Country" required error={!!errors.selectedCountry} helperText={errors.selectedCountry} />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Screen Code"
              required
              disabled={!!editData}
              value={form.screencode}
              onChange={(e) => handleChange('screencode', e.target.value.toUpperCase())}
              error={!!errors.screencode}
              helperText={errors.screencode}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              required
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              label="Effective From"
              required
              InputLabelProps={{ shrink: true }}
              value={form.fromDate}
              onChange={(e) => handleChange('fromDate', e.target.value)}
              error={!!errors.fromDate}
              helperText={errors.fromDate}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              label="Effective To"
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: form.fromDate }}
              value={form.toDate}
              onChange={(e) => handleChange('toDate', e.target.value)}
              error={!!errors.toDate}
              helperText={errors.toDate}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.active} onChange={(e) => handleChange('active', e.target.checked)} />}
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
