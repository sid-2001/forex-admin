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
  MenuItem,
  Autocomplete,
} from '@mui/material'
import { useEffect, useState, useCallback } from 'react'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import SequenceApiService from '@/services/sequence.api.service'

export default function SubServiceFormDialog({ open, onClose, onSubmit, editData }: any) {
  const [countries, setcountries] = useState([])

  const [countryCode, setCountryCode] = useState('')
  const [subServiceName, setSubServiceName] = useState('')
  const [active, setActive] = useState(true)
  const [effectiveFromDate, setEffectiveFromDate] = useState('')
  const [effectiveToDate, setEffectiveToDate] = useState('')
  const [errors, setErrors] = useState<any>({})

  const sequenceService = new SequenceApiService()

  const fetchCountryCodes = useCallback(async () => {
    const res: any = await sequenceService.getActiveCountryCorridors()
    setcountries(res || [])
  }, [])

  useEffect(() => {
    fetchCountryCodes()
  }, [])

  useEffect(() => {
    if (editData) {
      setCountryCode(editData.countryCode || '')
      setSubServiceName(editData.subServiceName || '')
      setActive(editData.active ?? true)
      setEffectiveFromDate(editData.effectiveFromDate?.split('T')[0] || '')
      setEffectiveToDate(editData.effectiveToDate?.split('T')[0] || '')
    } else {
      resetForm()
    }
    setErrors({})
  }, [editData, open])

  const resetForm = () => {
    setCountryCode('')
    setSubServiceName('')
    setActive(true)
    setEffectiveFromDate('')
    setEffectiveToDate('')
  }

  const validate = () => {
    const newErrors: any = {}

    if (!countryCode) newErrors.countryCode = 'Country is required'
    if (!subServiceName.trim()) newErrors.subServiceName = 'Sub Service Name is required'
    if (!effectiveFromDate) newErrors.effectiveFromDate = 'Effective From date is required'
    if (!effectiveToDate) newErrors.effectiveToDate = 'Effective To date is required'

    if (effectiveFromDate && effectiveToDate && new Date(effectiveFromDate) > new Date(effectiveToDate)) {
      newErrors.effectiveToDate = 'Effective To must be after Effective From'
    }
    if (subServiceName && !/^[A-Za-z\s]+$/.test(subServiceName)) newErrors.subServiceName = 'Only alphabets are allowed'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    onSubmit({
      countryCode,
      subServiceName,
      active,
      effectiveFromDate: `${effectiveFromDate}T00:00:00`,
      effectiveToDate: `${effectiveToDate}T00:00:00`,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editData ? 'Update Sub Service' : 'Create Sub Service'}</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Autocomplete
            fullWidth
            options={countries?.filter((item: any) => item.status === 'A') || []}
            //@ts-ignore
            getOptionLabel={(option: any) => option.countryName + ` (${option.countryCode})` || ''}
            value={countries.find((c: any) => c.countryCode === countryCode) || null}
            onChange={(_, newValue: any) => {
              setCountryCode(newValue ? newValue.countryCode : '')
            }}
            renderInput={(params) => <TextField {...params} required label="Country" error={!!errors.countryCode} helperText={errors.countryCode} />}
          />

          <TextField
            required
            label="Sub Service Name"
            value={subServiceName}
            onChange={(e) => setSubServiceName(e.target.value)}
            error={!!errors.subServiceName}
            helperText={errors.subServiceName}
            fullWidth
          />

          <DynamicDatePicker
            label="Effective From"
            value={effectiveFromDate}
            onChange={(val: string) => {
              console.log(val, 'kdjhchdvy')
              setEffectiveFromDate(val)
            }}
            error={!!errors.effectiveFromDate}
            helperText={errors.effectiveFromDate}
            required
          />

          <DynamicEndDatePicker
            label="Effective To"
            value={effectiveToDate}
            minDate={effectiveFromDate}
            onChange={(val: string) => {
              setEffectiveToDate(val)
            }}
            error={!!errors.effectiveToDate}
            helperText={errors.effectiveToDate}
            required
          />
          <FormControlLabel control={<Checkbox checked={active} onChange={(e) => setActive(e.target.checked)} />} label="Active" />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editData ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
