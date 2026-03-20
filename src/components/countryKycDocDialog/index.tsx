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
import ErrorMessage from '../errorMessage'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

const filter = createFilterOptions({
  matchFrom: 'any',
  stringify: (o: any) => `${o.countryName} ${o.countryCode}`,
})

export default function CountryKycDocDialog({ open, onClose, onSubmit, editData, errMassage }: any) {
  const [countries] = useRecoilState(countyState)

  const initialFormState = {
    countryCode: '',
    countryKycDocDescription: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  }

  const [form, setForm] = useState(initialFormState)
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (editData) {
      setForm({
        ...editData,
        effectiveFromDate: editData.effectiveFromDate?.split('T')[0] || '',
        effectiveToDate: editData.effectiveToDate?.split('T')[0] || '',
      })
    } else {
      setForm(initialFormState)
    }
  }, [editData, open])

  const validate = () => {
    const newErrors: any = {}
    if (!form.countryCode) newErrors.countryCode = 'Required'
    if (!form.countryKycDocDescription) newErrors.countryKycDocDescription = 'Required'
    if (!form.effectiveFromDate) newErrors.effectiveFromDate = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    // Clean payload: Remove primary keys before sending to API
    const { countryKycDocCode, ...cleanData } = form as any

    onSubmit({
      ...cleanData,
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${form.effectiveToDate}T00:00:00`,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>{editData ? 'Edit KYC Document' : 'Add KYC Document'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Autocomplete
              options={countries?.filter((c: any) => c.status === 'A') || []}
              filterOptions={filter}
              getOptionLabel={(o) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c) => c.countryCode === form.countryCode) || null}
              onChange={(_, val) => setForm({ ...form, countryCode: val ? val.countryCode : '' })}
              renderInput={(p) => <TextField {...p} label="Search Country" error={!!errors.countryCode} />}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Document Description (e.g. Passport)"
              value={form.countryKycDocDescription}
              onChange={(e) => setForm({ ...form, countryKycDocDescription: e.target.value })}
              error={!!errors.countryKycDocDescription}
            />
          </Grid>
          {/* <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              label="From Date"
              InputLabelProps={{ shrink: true }}
              value={form.effectiveFromDate}
              onChange={(e) => setForm({ ...form, effectiveFromDate: e.target.value })}
              error={!!errors.effectiveFromDate}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              label="To Date"
              InputLabelProps={{ shrink: true }}
              value={form.effectiveToDate}
              onChange={(e) => setForm({ ...form, effectiveToDate: e.target.value })}
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
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <ErrorMessage errMessage={errMassage} />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>CANCEL</Button>
        <Button variant="contained" onClick={handleSubmit}>
          SAVE
        </Button>
      </DialogActions>
    </Dialog>
  )
}
