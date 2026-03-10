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
  Autocomplete,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

export default function ServiceFormDialog({ open, onClose, onSubmit, editData }: any) {
  const [countries] = useRecoilState(countyState)

  const [countryCode, setCountryCode] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [active, setActive] = useState(true)
  const [effectiveFromDate, setEffectiveFromDate] = useState('')
  const [effectiveToDate, setEffectiveToDate] = useState('')

  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (editData) {
      setCountryCode(editData.countryCode || '')
      setServiceDescription(editData.serviceDescription || '')
      setActive(editData.active ?? true)
      setEffectiveFromDate(editData.effectiveFromDate?.split('T')[0] || '')
      setEffectiveToDate(editData.effectiveToDate?.split('T')[0] || '')
    } else {
      setCountryCode('')
      setServiceDescription('')
      setActive(true)
      setEffectiveFromDate('')
      setEffectiveToDate('')
      setErrors({})
    }
  }, [editData, open])

  /* ------------------ Validation ------------------ */
  const validate = () => {
    const newErrors: any = {}

    if (!countryCode) newErrors.countryCode = 'Country is required'

    if (!serviceDescription.trim()) newErrors.serviceDescription = 'Service Description is required'

    if (!effectiveFromDate) newErrors.effectiveFromDate = 'Effective From date is required'

    if (!effectiveToDate) newErrors.effectiveToDate = 'Effective To date is required'

    if (effectiveFromDate && effectiveToDate && new Date(effectiveToDate) < new Date(effectiveFromDate)) {
      newErrors.effectiveToDate = 'Effective To date cannot be before Effective From'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ------------------ Submit ------------------ */
  const handleSubmit = () => {
    if (!validate()) return

    onSubmit({
      countryCode,
      serviceDescription,
      active,
      effectiveFromDate: `${effectiveFromDate}T00:00:00`,
      effectiveToDate: `${effectiveToDate}T00:00:00`,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editData ? 'Update Service' : 'Create Service'}</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {/* Country */}
          {/* <InputLabel required>Country</InputLabel>
          <Select value={countryCode} fullWidth disabled={!!editData} error={!!errors.countryCode} onChange={(e) => setCountryCode(e.target.value)}>
            {countries
              ?.filter((c) => c.status === 'A')
              .map((c) => (
                <MenuItem
                  //@ts-ignore
                  key={c.countryCode}
                  value={c.countryCode}
                >
                  {c.countryName}
                </MenuItem>
              ))}
          </Select>
          {errors.countryCode && <FormHelperText error>{errors.countryCode}</FormHelperText>} */}
          <InputLabel required shrink>
            Country
          </InputLabel>

          <Autocomplete
            disabled={!!editData}
            options={countries?.filter((c) => c.status === 'A') || []}
            getOptionLabel={(option: any) => option.countryName || ''}
            value={countries.find((c) => c.countryCode === countryCode) || null}
            onChange={(_, newValue: any) => {
              setCountryCode(newValue ? newValue.countryCode : '')
            }}
            isOptionEqualToValue={(option: any, value: any) => option.countryCode === value.countryCode}
            renderInput={(params: any) => (
              <TextField
                {...params}
                required
                error={!!errors.countryCode}
                placeholder="Search and select country"
                sx={{
                  marginTop: '8px',
                }}
              />
            )}
          />

          {/* Display your existing error message */}
          {errors.countryCode && <FormHelperText error>{errors.countryCode}</FormHelperText>}

          {/* Service Description */}
          <TextField
            required
            label="Service Description"
            fullWidth
            value={serviceDescription}
            error={!!errors.serviceDescription}
            helperText={errors.serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
          />

          {/* Effective From */}
          {/* <TextField
            required
            type="date"
            label="Effective From"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={effectiveFromDate}
            error={!!errors.effectiveFromDate}
            helperText={errors.effectiveFromDate}
            onChange={(e) => setEffectiveFromDate(e.target.value)}
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
              // setForm({ ...form, effectiveTo: val })
            }}
            error={!!errors.effectiveToDate}
            helperText={errors.effectiveToDate}
            required
          />

          {/* Effective To */}
          {/* <TextField
            required
            type="date"
            label="Effective To"
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: effectiveFromDate }}
            value={effectiveToDate}
            error={!!errors.effectiveToDate}
            helperText={errors.effectiveToDate}
            onChange={(e) => setEffectiveToDate(e.target.value)}
          /> */}

          {/* Active */}
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
