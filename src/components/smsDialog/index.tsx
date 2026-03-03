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

export default function SmsTemplateDialog({ open, onClose, onSubmit, editData, errMassage }: any) {
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
    } else {
      // Reset state when opening a fresh "Add" dialog
      setCountryCode('')
      setSmsTemplateDescription('')
      setActive(true)
      setEffectiveFromDate('')
      setEffectiveToDate('')
      setErrors({})
    }
  }, [editData, open])

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
      effectiveToDate: `${effectiveToDate}T00:00:00`,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editData ? 'Update SMS Template' : 'Add SMS Template'}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Autocomplete
            options={countries?.filter((c) => c.status === 'A') || []}
            filterOptions={filter}
            getOptionLabel={(o) => `${o.countryName} (${o.countryCode})`}
            value={countries?.find((c) => c.countryCode === countryCode) || null}
            disabled={!!editData}
            onChange={(_, val) => {
              setCountryCode(val ? val.countryCode : '')
              if (errors.countryCode) setErrors({ ...errors, countryCode: '' })
            }}
            renderInput={(p) => <TextField {...p} label="Search Country" required error={!!errors.countryCode} helperText={errors.countryCode} />}
          />

          <TextField
            label="SMS Description"
            fullWidth
            required
            value={smsTemplateDescription}
            onChange={(e) => setSmsTemplateDescription(e.target.value)}
            error={!!errors.smsTemplateDescription}
            helperText={errors.smsTemplateDescription}
          />

          {/* <TextField
            type="date"
            label="Effective From"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            value={effectiveFromDate}
            onChange={(e) => setEffectiveFromDate(e.target.value)}
            error={!!errors.effectiveFromDate}
            helperText={errors.effectiveFromDate}
          /> */}
          <DynamicDatePicker
            label="Effective From"
            value={effectiveFromDate}
            onChange={(val: string) => {
              console.log(val, 'kdjhchdvy')
              setEffectiveFromDate(val)
            }}
            error={!!errors.effectiveFrom}
            helperText={errors.effectiveFrom}
            required
          />

          <DynamicEndDatePicker
            label="Effective To"
            value={effectiveToDate}
            minDate={effectiveFromDate}
            onChange={(val: string) => {
              setEffectiveToDate(val)
            }}
            error={!!errors.effectiveTo}
            helperText={errors.effectiveTo}
            required
          />

          {/* <TextField
            type="date"
            label="Effective To"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            value={effectiveToDate}
            onChange={(e) => setEffectiveToDate(e.target.value)}
            error={!!errors.effectiveToDate}
            helperText={errors.effectiveToDate}
          /> */}

          <FormControlLabel control={<Checkbox checked={active} onChange={(e) => setActive(e.target.checked)} />} label="Active" />
        </Box>
      </DialogContent>
      <ErrorMessage errMessage={errMassage} />
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
