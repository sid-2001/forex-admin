import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Autocomplete,
  createFilterOptions,
  Grid,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'

// Contains search logic for Country
const filter = createFilterOptions({
  matchFrom: 'any',
  stringify: (o: any) => `${o.countryName} ${o.countryCode}`,
})

export default function VerificationPartnerMasterDialog({ open, onClose, onSubmit, editData }: any) {
  const [countries] = useRecoilState(countyState)

  const initialFormState = {
    verificationPartnerCode: '',
    countryCode: '',
    verificationPartnerDescription: '',
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
      setErrors({})
    }
  }, [editData, open])

  const validate = () => {
    const newErrors: any = {}
    if (!form.verificationPartnerCode) newErrors.verificationPartnerCode = 'Partner Code is required'
    if (!form.countryCode) newErrors.countryCode = 'Country is required'
    if (!form.verificationPartnerDescription.trim()) newErrors.verificationPartnerDescription = 'Description is required'
    if (!form.effectiveFromDate) newErrors.effectiveFromDate = 'Required'
    if (!form.effectiveToDate) newErrors.effectiveToDate = 'Required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const payload = {
      verificationPartnerCode: form.verificationPartnerCode,
      countryCode: form.countryCode,
      verificationPartnerDescription: form.verificationPartnerDescription,
      active: form.active,
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${form.effectiveToDate}T23:59:59`,
      // createdBy/modifiedBy usually comes from auth context in the parent component
    }

    onSubmit(payload)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>{editData ? 'Update Verification Partner' : 'Create Verification Partner'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {/* Partner Code */}
          <Grid item xs={12}>
            <TextField
              label="Partner Code"
              fullWidth
              disabled={!!editData}
              value={form.verificationPartnerCode}
              onChange={(e) => setForm({ ...form, verificationPartnerCode: e.target.value })}
              error={!!errors.verificationPartnerCode}
              helperText={errors.verificationPartnerCode}
            />
          </Grid>

          {/* Searchable Country */}
          <Grid item xs={12}>
            <Autocomplete
              options={countries || []}
              filterOptions={filter}
              getOptionLabel={(o) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c) => c.countryCode === form.countryCode) || null}
              disabled={!!editData}
              onChange={(_, val) => {
                setForm({ ...form, countryCode: val ? val.countryCode : '' })
                if (errors.countryCode) setErrors({ ...errors, countryCode: '' })
              }}
              renderInput={(p) => <TextField {...p} label="Search Country" error={!!errors.countryCode} helperText={errors.countryCode} />}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              label="Partner Description (e.g. NSDL)"
              fullWidth
              value={form.verificationPartnerDescription}
              onChange={(e) => setForm({ ...form, verificationPartnerDescription: e.target.value })}
              error={!!errors.verificationPartnerDescription}
              helperText={errors.verificationPartnerDescription}
            />
          </Grid>

          {/* Dates */}
          <Grid item xs={6}>
            <TextField
              type="date"
              label="Effective From"
              fullWidth
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
              InputLabelProps={{ shrink: true }}
              value={form.effectiveToDate}
              onChange={(e) => setForm({ ...form, effectiveToDate: e.target.value })}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
            />
          </Grid>

          {/* Active Status */}
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
              label="Active Status"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editData ? 'Update Partner' : 'Save Partner'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
