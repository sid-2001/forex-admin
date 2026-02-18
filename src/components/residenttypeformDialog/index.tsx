// components/residenttypeformDialog.tsx
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel, 
  MenuItem,
  Stack,
  Box
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { countyState } from '@/states/state'
import dayjs from 'dayjs'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  editData?: any | null
}

// Predefined residence code options
const RESIDENCE_CODES = [
  { value: 'N', label: 'National' },
  { value: 'FN', label: 'Foreign National' },
  { value: 'R', label: 'Resident' },
  { value: 'NR', label: 'Non-Resident' },
]

export default function ResidentTypeFormDialog({ open, onClose, onSubmit, editData }: Props) {
  const localService = new LocalStorageService()
  const countries = useRecoilValue(countyState)

  const [form, setForm] = useState<any>({
    residenceCode: '',
    countryCode: '',
    residentTypeDescription: '',
    active: true,
    effectiveFromDate: dayjs().format('YYYY-MM-DDTHH:mm'),
    effectiveToDate: '9999-12-31T23:59',
  })

  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (editData) {
      setForm({
        residenceCode: editData.residenceCode || '',
        countryCode: editData.countryCode || '',
        residentTypeDescription: editData.residentTypeDescription || '',
        active: editData.active || false,
        effectiveFromDate: editData.effectiveFromDate 
          ? dayjs(editData.effectiveFromDate).format('YYYY-MM-DDTHH:mm')
          : dayjs().format('YYYY-MM-DDTHH:mm'),
        effectiveToDate: editData.effectiveToDate === '9999-12-31T23:59:59'
          ? '9999-12-31T23:59'
          : dayjs(editData.effectiveToDate).format('YYYY-MM-DDTHH:mm'),
      })
    } else {
      setForm({
        residenceCode: '',
        countryCode: '',
        residentTypeDescription: '',
        active: true,
        effectiveFromDate: dayjs().format('YYYY-MM-DDTHH:mm'),
        effectiveToDate: '9999-12-31T23:59',
      })
    }
    setErrors({})
  }, [editData, open])

  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value })
    setErrors({ ...errors, [key]: '' })
  }

  const validate = () => {
    const newErrors: any = {}
    if (!form.residenceCode) newErrors.residenceCode = 'Residence code is required'
    if (!form.countryCode) newErrors.countryCode = 'Country is required'
    if (!form.residentTypeDescription?.trim()) newErrors.residentTypeDescription = 'Description is required'
    
    // Date validation
    const fromDate = new Date(form.effectiveFromDate)
    const toDate = new Date(form.effectiveToDate)
    if (fromDate > toDate) {
      newErrors.effectiveFromDate = 'From date cannot be after To date'
      newErrors.effectiveToDate = 'To date cannot be before From date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const staffId = localService.get_staff_id() || 'admin'
    
    onSubmit({
      ...form,
      createdBy: editData ? undefined : staffId,
      modifiedBy: editData ? staffId : undefined,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ 
        backgroundColor: '#f5f5f5',
        color: '#0061B1',
        fontWeight: 600
      }}>
        {editData ? 'Update Resident Type' : 'Add Resident Type'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {/* Residence Code Dropdown */}
          <TextField
            select
            required
            label="Residence Code"
            fullWidth
            margin="dense"
            value={form.residenceCode}
            disabled={!!editData}
            error={!!errors.residenceCode}
            helperText={errors.residenceCode}
            onChange={(e) => handleChange('residenceCode', e.target.value)}
          >
            {RESIDENCE_CODES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label} ({option.value})
              </MenuItem>
            ))}
          </TextField>

          {/* Country Dropdown */}
          <TextField
            select
            required
            label="Country"
            fullWidth
            margin="dense"
            value={form.countryCode}
            disabled={!!editData}
            error={!!errors.countryCode}
            helperText={errors.countryCode}
            onChange={(e) => handleChange('countryCode', e.target.value)}
          >
            {countries.map((c) => (
              <MenuItem
              //@ts-ignore
                key={c.countryCode}
                value={c.countryCode}
              >
                {c.countryName} ({c.countryCode})
              </MenuItem>
            ))}
          </TextField>

          {/* Description */}
          <TextField
            required
            label="Resident Type Description"
            fullWidth
            margin="dense"
            value={form.residentTypeDescription}
            error={!!errors.residentTypeDescription}
            helperText={errors.residentTypeDescription}
            onChange={(e) => handleChange('residentTypeDescription', e.target.value)}
            multiline
            rows={2}
          />

          {/* Effective From Date */}
          <TextField
            required
            label="Effective From Date"
            type="datetime-local"
            fullWidth
            margin="dense"
            value={form.effectiveFromDate}
            error={!!errors.effectiveFromDate}
            helperText={errors.effectiveFromDate}
            onChange={(e) => handleChange('effectiveFromDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {/* Effective To Date */}
          <TextField
            required
            label="Effective To Date"
            type="datetime-local"
            fullWidth
            margin="dense"
            value={form.effectiveToDate}
            error={!!errors.effectiveToDate}
            helperText={errors.effectiveToDate}
            onChange={(e) => handleChange('effectiveToDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {/* Active Status */}
          <FormControlLabel 
            control={
              <Checkbox 
                checked={form.active} 
                onChange={(e) => handleChange('active', e.target.checked)} 
              />
            } 
            label="Active" 
            sx={{ mt: 1 }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: '#fafafa' }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          sx={{ 
            backgroundColor: '#0061B1',
            '&:hover': {
              backgroundColor: '#004d8c',
            }
          }}
        >
          {editData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}