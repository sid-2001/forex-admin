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
  Select,
  MenuItem,
  InputLabel,
  FormHelperText,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'

export default function SmsTemplateDialog({ open, onClose, onSubmit, editData }: any) {
  const [countries] = useRecoilState(countyState)

  const [countryCode, setCountryCode] = useState('')
  const [smsTemplateDescription, setSmsTemplateDescription] = useState('')
  const [active, setActive] = useState(true)
  const [effectiveFromDate, setEffectiveFromDate] = useState('')
  const [effectiveToDate, setEffectiveToDate] = useState('')

  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (editData) {
      setCountryCode(editData.countryCode || '')
      setSmsTemplateDescription(editData.smsTemplateDescription || '')
      setActive(editData.active ?? true)
      setEffectiveFromDate(editData.effectiveFromDate?.split('T')[0] || '')
      setEffectiveToDate(editData.effectiveToDate?.split('T')[0] || '')
    }
  }, [editData])

  const validate = () => {
    const newErrors: any = {}
    if (!countryCode) newErrors.countryCode = 'Required'
    if (!smsTemplateDescription.trim()) newErrors.smsTemplateDescription = 'Required'
    if (!effectiveFromDate) newErrors.effectiveFromDate = 'Required'
    if (!effectiveToDate) newErrors.effectiveToDate = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit({
      countryCode,
      smsTemplateDescription,
      active,
      effectiveFromDate: `${effectiveFromDate}T00:00:00`,
      effectiveToDate: `${effectiveToDate}T23:59:59`,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editData ? 'Update SMS Template' : 'Add SMS Template'}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <InputLabel>Country</InputLabel>
          <Select value={countryCode} fullWidth disabled={!!editData} onChange={(e) => setCountryCode(e.target.value)} error={!!errors.countryCode}>
            {countries?.map((c: any) => (
              <MenuItem key={c.countryCode} value={c.countryCode}>
                {c.countryName}
              </MenuItem>
            ))}
          </Select>

          <TextField
            label="SMS Description"
            fullWidth
            value={smsTemplateDescription}
            onChange={(e) => setSmsTemplateDescription(e.target.value)}
            error={!!errors.smsTemplateDescription}
            helperText={errors.smsTemplateDescription}
          />

          <TextField
            type="date"
            label="Effective From"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={effectiveFromDate}
            onChange={(e) => setEffectiveFromDate(e.target.value)}
            error={!!errors.effectiveFromDate}
          />

          <TextField
            type="date"
            label="Effective To"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={effectiveToDate}
            onChange={(e) => setEffectiveToDate(e.target.value)}
            error={!!errors.effectiveToDate}
          />

          <FormControlLabel control={<Checkbox checked={active} onChange={(e) => setActive(e.target.checked)} />} label="Active" />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
