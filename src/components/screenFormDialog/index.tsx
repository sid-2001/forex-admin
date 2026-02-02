import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  FormControl,
  FormHelperText,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  editData?: any
}

export default function ScreenFormDialog({ open, onClose, onSubmit, editData }: Props) {
  const [screencode, setScreencode] = useState('')
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [countries] = useRecoilState(countyState)

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (editData) {
      setScreencode(editData.screencode)
      setDescription(editData.screendescription)
      setActive(editData.active)
      setSelectedCountry(editData.countrycode)
    } else {
      setScreencode('')
      setDescription('')
      setActive(true)
      setSelectedCountry('')
    }
    setErrors({})
  }, [editData, open])

  const handleSubmit = () => {
    const newErrors: { [key: string]: boolean } = {
      screencode: !screencode.trim(),
      description: !description.trim(),
      selectedCountry: !selectedCountry,
    }

    setErrors(newErrors)

    if (Object.values(newErrors).some((error) => error)) {
      return
    }

    onSubmit({
      screencode,
      screendescription: description,
      active,
      selectedCountry,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{editData ? 'Update Screen' : 'Add Screen'}</DialogTitle>

      <DialogContent>
        <TextField
          label="Screen Code"
          fullWidth
          margin="normal"
          value={screencode}
          disabled={!!editData}
          onChange={(e) => setScreencode(e.target.value)}
          error={errors.screencode}
          helperText={errors.screencode ? 'Screen Code is required' : ''}
        />

        <TextField
          label="Description"
          fullWidth
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          helperText={errors.description ? 'Description is required' : ''}
        />

        <FormControl fullWidth margin="normal" error={errors.selectedCountry}>
          <InputLabel>Destination Country</InputLabel>
          <Select
            value={selectedCountry}
            disabled={!!editData}
            onChange={(e) => setSelectedCountry(e.target.value as string)}
            label="Destination Country"
          >
            {countries
              ?.filter((item) => item.status === 'A')
              .map((country) => (
                <MenuItem 
                //@ts-ignore
                key={country?.countryCode} value={country.countryCode}>
                  {country?.countryName}
                </MenuItem>
              ))}
          </Select>
          {errors.selectedCountry && <FormHelperText>Please select a country</FormHelperText>}
        </FormControl>

        <FormControlLabel sx={{ mt: 1 }} control={<Checkbox checked={active} onChange={(e) => setActive(e.target.checked)} />} label="Active" />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
