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
import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { countyState } from '@/states/state'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

export default function SubServiceFormDialog({ open, onClose, onSubmit, editData }: any) {
  const countries = useRecoilValue(countyState)

  const [countryCode, setCountryCode] = useState('')
  const [subServiceName, setSubServiceName] = useState('')
  const [active, setActive] = useState(true)
  const [effectiveFromDate, setEffectiveFromDate] = useState('')
  const [effectiveToDate, setEffectiveToDate] = useState('')
  const [errors, setErrors] = useState<any>({})

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
          {/* <TextField
            select
            required
            label="Country"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            error={!!errors.countryCode}
            helperText={errors.countryCode}
            fullWidth
          >
            {countries
              ?.filter((item) => item.status === 'A')
              .map((c: any) => (
                <MenuItem key={c.countryCode} value={c.countryCode}>
                  {c.countryName}
                </MenuItem>
              ))}
          </TextField> */}
          <Autocomplete
            fullWidth
            // 1. Filter the list exactly like you did in the MenuItem
            options={countries?.filter((item) => item.status === 'A') || []}
            // 2. Tell Autocomplete which property to show in the list
            getOptionLabel={(option) => option.countryName || ''}
            // 3. Handle the value (match by countryCode)
            value={countries.find((c) => c.countryCode === countryCode) || null}
            // 4. Update the state when a user selects an item
            onChange={(_, newValue: any) => {
              setCountryCode(newValue ? newValue.countryCode : '')
            }}
            // 5. Render the input (replaces your current TextField)
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
          {/* 
          <TextField
            required
            type="date"
            label="Effective From"
            InputLabelProps={{ shrink: true }}
            value={effectiveFromDate}
            onChange={(e) => setEffectiveFromDate(e.target.value)}
            error={!!errors.effectiveFromDate}
            helperText={errors.effectiveFromDate}
            fullWidth
          /> */}
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

          {/* <TextField
            required
            type="date"
            label="Effective To"
            InputLabelProps={{ shrink: true }}
            value={effectiveToDate}
            onChange={(e) => setEffectiveToDate(e.target.value)}
            error={!!errors.effectiveToDate}
            helperText={errors.effectiveToDate}
            fullWidth
          /> */}

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
