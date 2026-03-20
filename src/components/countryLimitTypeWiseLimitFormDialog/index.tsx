// components/countryLimitTypeWiseLimitFormDialog.tsx
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
  Box,
  InputAdornment,
  FormHelperText,
  Autocomplete,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import { LocalStorageService } from '@/helpers/local-storage-service'
import dayjs from 'dayjs'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  editData?: any | null
  countries: any[]
  limitTypes: Array<{
    kycLimitTypeCode: string
    limitCode: string
    limitDescription: string
    active: boolean
  }>
}

export default function CountryLimitTypeWiseLimitFormDialog({ 
  open, 
  onClose, 
  onSubmit, 
  editData,
  countries,
  limitTypes
}: Props) {
  const localService = new LocalStorageService()

  const [form, setForm] = useState<any>({
    countryCode: '',
    limitTypeCode: '',
    limitAmount: '',
    active: true,
    effectiveFromDate: dayjs().format('YYYY-MM-DDTHH:mm'),
    effectiveToDate: '9999-12-31T23:59',
  })

  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (editData) {
      setForm({
        countryCode: editData.countryCode || '',
        limitTypeCode: editData.limitTypeCode || '',
        limitAmount: editData.limitAmount || '',
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
        countryCode: '',
        limitTypeCode: '',
        limitAmount: '',
        active: true,
        effectiveFromDate: null,
        effectiveToDate: null,
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
    if (!form.countryCode) newErrors.countryCode = 'Country is required'
    if (!form.limitTypeCode) newErrors.limitTypeCode = 'Limit type is required'
    if (!form.limitAmount) {
      newErrors.limitAmount = 'Limit amount is required'
    } else if (isNaN(parseFloat(form.limitAmount)) || parseFloat(form.limitAmount) <= 0) {
      newErrors.limitAmount = 'Limit amount must be a positive number'
    }
    
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

    const staffId = localService.get_staff_id() || 'ADMIN'
    
    onSubmit({
      ...form,
        effectiveFromDate: dayjs(form.effectiveFromDate).format('YYYY-MM-DDTHH:mm:ss'),
    effectiveToDate: dayjs(form.effectiveToDate).format('YYYY-MM-DDTHH:mm:ss'),
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
        {editData ? 'Update Country Limit' : 'Add Country Limit'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1 }}>
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
            {countries?.filter(e=>e.status=='A')?.map((c) => (
              <MenuItem key={c.countryCode} value={c.countryCode}>
                {c.countryName} ({c.countryCode})
              </MenuItem>
            ))}
          </TextField>

          {/* Limit Type Dropdown - Using KYC Limit Types */}
          <TextField
            select
            required
            label="Limit Type"
            fullWidth
            margin="dense"
            value={form.limitTypeCode}
            disabled={!!editData}
            error={!!errors.limitTypeCode}
            helperText={errors.limitTypeCode}
            onChange={(e) => handleChange('limitTypeCode', e.target.value)}
          >
            {limitTypes
              .filter(limit => limit.active) // Only show active limit types
              .map((limit) => (
                <MenuItem key={limit.kycLimitTypeCode} value={limit.kycLimitTypeCode}>
                  <Box>
                    <Typography variant="body2">
                      <strong>{limit.limitCode}</strong> - {limit.limitDescription}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Code: {limit.kycLimitTypeCode}
                    </Typography>
                  </Box>
                </MenuItem>
            ))}
          </TextField>

          {/* Display selected limit type description */}
          {form.limitTypeCode && !editData && (
            <FormHelperText sx={{ ml: 1, mt: 0.5 }}>
              Selected: {limitTypes.find(l => l.kycLimitTypeCode === form.limitTypeCode)?.limitDescription}
            </FormHelperText>
          )}

          {/* Limit Amount */}
          <TextField
          sx={{mb:2}}
            required
            label="Limit Amount"
            type="number"
            fullWidth
            margin="dense"
            value={form.limitAmount}
            error={!!errors.limitAmount}
            helperText={errors.limitAmount}
            onChange={(e) => handleChange('limitAmount', e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            inputProps={{ 
              step: "0.01",
              min: "0"
            }}
          />

          {/* Effective From Date */}
     <Box mb={2}>

 
     <DynamicDatePicker
  label="Effective From Date"
  value={form.effectiveFromDate}
  onChange={(val: string) => handleChange('effectiveFromDate', val)}
  error={!!errors.effectiveFromDate}
  helperText={errors.effectiveFromDate}
  required
/>
    </Box>


          {/* Effective To Date */}
          <Box >

           <DynamicEndDatePicker
  label="Effective To Date"
  value={form.effectiveToDate}
  minDate={form.effectiveFromDate}
  onChange={(val: string) => handleChange('effectiveToDate', val)}
  error={!!errors.effectiveToDate}
  helperText={errors.effectiveToDate}
  required
  disabled={!form.effectiveFromDate}

/>
  </Box>
    
          {/* Effective To Date */}
     
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