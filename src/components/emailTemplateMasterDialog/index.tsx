import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  FormControl,
  FormHelperText,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'

export default function EmailTemplateMasterDialog({ open, onClose, onSubmit, editData }: any) {
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
    }
  }, [editData, open])

  const handleChange = (e: any) => {
    const { name, value, checked, type } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const validate = () => {
    const newErrors: any = {}
    const requiredFields = [
      'countryCode',
      'templateCode',
      'templateName',
      'fromName',
      'fromEmail',
      'emailSubject',
      'emailBodyHtml',
      'emailBodyText',
      'effectiveFromDate',
      'effectiveToDate',
    ]

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
      // FIX: Constructing an explicit payload to match your working CURL exactly.
      // This prevents "Internal Server Error" caused by sending extra ID fields to the Create API.
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
          {/* Row 1: Country and Template Code */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.countryCode}>
              <InputLabel id="country-select-label">Country</InputLabel>
              <Select labelId="country-select-label" label="Country" name="countryCode" value={form.countryCode} onChange={handleChange}>
                {countries?.map((c: any) => (
                  <MenuItem key={c.countryCode} value={c.countryCode}>
                    {c.countryName}
                  </MenuItem>
                ))}
              </Select>
              {errors.countryCode && <FormHelperText>{errors.countryCode}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Template Code"
              name="templateCode"
              value={form.templateCode}
              onChange={handleChange}
              error={!!errors.templateCode}
              helperText={errors.templateCode}
              disabled={!!editData} // Code should usually be immutable on update
            />
          </Grid>

          {/* Row 2: Template Name and From Name */}
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

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="From Name"
              name="fromName"
              value={form.fromName}
              onChange={handleChange}
              error={!!errors.fromName}
              helperText={errors.fromName}
            />
          </Grid>

          {/* Row 3: From Email */}
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

          {/* Row 4: Subject */}
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

          {/* Row 5: HTML Body */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="HTML Body"
              name="emailBodyHtml"
              placeholder="<html><body>...</body></html>"
              value={form.emailBodyHtml}
              onChange={handleChange}
              error={!!errors.emailBodyHtml}
              helperText={errors.emailBodyHtml}
            />
          </Grid>

          {/* Row 6: Text Body */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Text Body"
              name="emailBodyText"
              value={form.emailBodyText}
              onChange={handleChange}
              error={!!errors.emailBodyText}
              helperText={errors.emailBodyText}
            />
          </Grid>

          {/* Row 7: Dates */}
          <Grid item xs={12} sm={6}>
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
          </Grid>
          <Grid item xs={12} sm={6}>
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
          </Grid>

          {/* Row 8: Active Status */}
          <Grid item xs={12}>
            <FormControlLabel control={<Checkbox name="active" checked={form.active} onChange={handleChange} color="primary" />} label="Active" />
          </Grid>
        </Grid>
      </DialogContent>

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
