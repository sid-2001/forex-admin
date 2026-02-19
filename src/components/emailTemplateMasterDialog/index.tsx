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

export default function EmailTemplateMasterDialog({ open, onClose, onSubmit, editData, errMassage }: any) {
  const [countries] = useRecoilState(countyState)

  const initialFormState = {
    countryCode: '',
    templateCode: '',
    templateName: '',
    fromName: '',
    fromEmail: '',
    emailSubject: '',
    emailBodyHtml: '',
    emailBodyText: '',
    emailTemplateDescription: '',
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

  const handleChange = (e: any) => {
    const { name, value, checked, type } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const validate = () => {
    const newErrors: any = {}
    const requiredFields = ['countryCode', 'templateName', 'fromEmail', 'emailSubject', 'effectiveFromDate', 'effectiveToDate']

    requiredFields.forEach((field) => {
      if (!form[field as keyof typeof form]) {
        newErrors[field] = 'This field is required'
      }
    })

    if (form.fromEmail && !/\S+@\S+\.\S+/.test(form.fromEmail)) {
      newErrors.fromEmail = 'Invalid email format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      const cleanPayload = {
        countryCode: form.countryCode,
        templateCode: form.templateCode,
        templateName: form.templateName,
        emailSubject: form.emailSubject,
        emailBodyHtml: form.emailBodyHtml,
        emailBodyText: form.emailBodyText,
        fromName: form.fromName,
        fromEmail: form.fromEmail,
        emailTemplateDescription: form.emailTemplateDescription || 'Email Template',
        active: form.active,
        effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
        effectiveToDate: `${form.effectiveToDate}T23:59:59`,
      }
      onSubmit(cleanPayload)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 'bold' }}>{editData ? 'Edit Email Template' : 'Add Email Template'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* Searchable Country Autocomplete */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={countries || []}
              filterOptions={filter}
              getOptionLabel={(option) => `${option.countryName} (${option.countryCode})`}
              value={countries?.find((c) => c.countryCode === form.countryCode) || null}
              disabled={!!editData}
              onChange={(_event, newValue) => {
                setForm({ ...form, countryCode: newValue ? newValue.countryCode : '' })
                if (errors.countryCode) setErrors({ ...errors, countryCode: '' })
              }}
              renderInput={(params) => (
                <TextField {...params} label="Search Country" required error={!!errors.countryCode} helperText={errors.countryCode} />
              )}
            />
          </Grid>

          {/* <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Template Code"
              name="templateCode"
              value={form.templateCode}
              onChange={handleChange}
              error={!!errors.templateCode}
              helperText={errors.templateCode}
              disabled={!!editData}
            />
          </Grid> */}

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Template Name"
              name="templateName"
              value={form.templateName}
              onChange={handleChange}
              error={!!errors.templateName}
              helperText={errors.templateName}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="From Name" name="fromName" value={form.fromName} onChange={handleChange} />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="From Email"
              name="fromEmail"
              value={form.fromEmail}
              onChange={handleChange}
              error={!!errors.fromEmail}
              helperText={errors.fromEmail}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Subject"
              name="emailSubject"
              value={form.emailSubject}
              onChange={handleChange}
              error={!!errors.emailSubject}
              helperText={errors.emailSubject}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth multiline rows={4} label="HTML Body" name="emailBodyHtml" value={form.emailBodyHtml} onChange={handleChange} />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth multiline rows={2} label="Text Body" name="emailBodyText" value={form.emailBodyText} onChange={handleChange} />
          </Grid>

          {/* <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="From Date"
              name="effectiveFromDate"
              InputLabelProps={{ shrink: true }}
              value={form.effectiveFromDate}
              onChange={handleChange}
              error={!!errors.effectiveFromDate}
              helperText={errors.effectiveFromDate}
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
          {/* <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="To Date"
              name="effectiveToDate"
              InputLabelProps={{ shrink: true }}
              value={form.effectiveToDate}
              onChange={handleChange}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
            />
          </Grid> */}

          <Grid item xs={12}>
            <FormControlLabel control={<Checkbox name="active" checked={form.active} onChange={handleChange} color="primary" />} label="Active" />
          </Grid>
        </Grid>
      </DialogContent>
      {/* <p style={{ textAlign: 'center', color: 'red' }}>{errMassage ? errMassage : ''}</p> */}
      <ErrorMessage errMessage={errMassage} />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: 'grey.600' }}>
          CANCEL
        </Button>
        <Button variant="contained" onClick={handleSubmit} sx={{ px: 4 }}>
          SAVE
        </Button>
      </DialogActions>
    </Dialog>
  )
}
