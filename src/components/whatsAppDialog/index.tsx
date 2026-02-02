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

const filter = createFilterOptions({ matchFrom: 'any', stringify: (o: any) => `${o.countryName} ${o.countryCode}` })

export default function WhatsappTemplateDialog({ open, onClose, onSubmit, editData }: any) {
  const [countries] = useRecoilState(countyState)
  const [countryCode, setCountryCode] = useState('')
  const [description, setDescription] = useState('')
  const [active, setActive] = useState(true)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (editData) {
      setCountryCode(editData.countryCode || '')
      setDescription(editData.whatsappTemplateDescription || '')
      setActive(editData.active ?? true)
      setFromDate(editData.effectiveFromDate?.split('T')[0] || '')
      setToDate(editData.effectiveToDate?.split('T')[0] || '')
    } else {
      setCountryCode('')
      setDescription('')
      setFromDate('')
      setToDate('')
      setActive(true)
    }
  }, [editData, open])

  const handleSubmit = () => {
    if (!countryCode || !description) {
      setErrors({ countryCode: !countryCode, description: !description })
      return
    }
    onSubmit({
      countryCode,
      whatsappTemplateDescription: description,
      active,
      effectiveFromDate: `${fromDate}T00:00:00`,
      effectiveToDate: `${toDate}T23:59:59`,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editData ? 'Update WhatsApp Template' : 'Create WhatsApp Template'}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Autocomplete
            options={countries || []}
            filterOptions={filter}
            getOptionLabel={(o) => `${o.countryName} (${o.countryCode})`}
            value={countries?.find((c) => c.countryCode === countryCode) || null}
            disabled={!!editData}
            onChange={(_, val) => setCountryCode(val ? val.countryCode : '')}
            renderInput={(p) => <TextField {...p} label="Search Country" error={!!errors.countryCode} />}
          />
          <TextField
            label="Description"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={!!errors.description}
          />
          <TextField
            type="date"
            label="From Date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <TextField
            type="date"
            label="To Date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
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
