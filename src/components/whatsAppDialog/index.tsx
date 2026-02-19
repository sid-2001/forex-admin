import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Grid, Autocomplete } from '@mui/material'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

export default function WhatsappTemplateDialog({ open, onClose, onSubmit, editData }: any) {
  const [countries] = useRecoilState(countyState)
  const [form, setForm] = useState({
    countryCode: '',
    description: '',
    fromDate: '',
    toDate: '',
    active: true,
  })
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (open) {
      if (editData) {
        setForm({
          countryCode: editData.countryCode || '',
          description: editData.whatsappTemplateDescription || '',
          fromDate: editData.effectiveFromDate?.split('T')[0] || '',
          toDate: editData.effectiveToDate?.split('T')[0] || '',
          active: editData.active ?? true,
        })
      } else {
        setForm({
          countryCode: '',
          description: '',
          fromDate: '',
          toDate: '',
          active: true,
        })
      }
      setErrors({})
    }
  }, [editData, open])

  const validate = () => {
    const newErrors: any = {}
    if (!form.countryCode) newErrors.countryCode = 'Required'
    if (!form.description.trim()) newErrors.description = 'Required'
    if (!form.fromDate) newErrors.fromDate = 'Required'
    if (!form.toDate) newErrors.toDate = 'Required'

    if (form.fromDate && form.toDate && new Date(form.toDate) < new Date(form.fromDate)) {
      newErrors.toDate = 'End date cannot be earlier than start date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({
      countryCode: form.countryCode,
      whatsappTemplateDescription: form.description,
      active: form.active,
      effectiveFromDate: `${form.fromDate}T00:00:00`,
      effectiveToDate: `${form.toDate}T23:59:59`,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update WhatsApp Template' : 'Create WhatsApp Template'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Autocomplete
              options={countries || []}
              getOptionLabel={(o) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c) => c.countryCode === form.countryCode) || null}
              disabled={!!editData}
              onChange={(_, val) =>
                setForm({
                  ...form,
                  //@ts-ignore
                  countryCode: val ? val.countryCode : '',
                })
              }
              renderInput={(p) => <TextField {...p} label="Country" required error={!!errors.countryCode} helperText={errors.countryCode} />}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>
          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.fromDate}
              onChange={(val: string) => {
                console.log(val, 'kdjhchdvy')
                setForm({ ...form, fromDate: val })
              }}
              error={!!errors.fromDate}
              helperText={errors.fromDate}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={form.toDate}
              minDate={form.fromDate}
              onChange={(val: string) => {
                setForm({ ...form, toDate: val })
              }}
              error={!!errors.effectiveTo}
              helperText={errors.effectiveTo}
              required
            />
          </Grid>
          {/* <Grid item xs={6}>
            <TextField
              type="date"
              label="Effective From"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={form.fromDate}
              onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
              error={!!errors.fromDate}
              helperText={errors.fromDate}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              type="date"
              label="Effective To"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: form.fromDate }}
              value={form.toDate}
              onChange={(e) => setForm({ ...form, toDate: e.target.value })}
              error={!!errors.toDate}
              helperText={errors.toDate}
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
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
