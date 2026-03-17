// components/kycLimitTypeFormDialog.tsx
import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Switch,
  Grid,
  Typography,
  IconButton,
  Box,
  Checkbox,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import dayjs from 'dayjs'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

interface FormData {
  limitCode: string
  limitDescription: string
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  validationError?: string
}

interface KycLimitTypeFormDialogProps {
  open: boolean
  onClose: () => void
  editData?: any
  onSubmit: (data: FormData) => void
}

export default function KycLimitTypeFormDialog({ open, onClose, editData, onSubmit }: KycLimitTypeFormDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    limitCode: '',
    limitDescription: '',
    active: true,
    //@ts-ignore
    effectiveFromDate: null,
    //@ts-ignore
    effectiveToDate: null,
  })

  useEffect(() => {
    if (editData) {
      setFormData({
        limitCode: editData.limitCode || '',
        limitDescription: editData.limitDescription || '',
        active: editData.active || false,
        effectiveFromDate: editData.effectiveFromDate
          ? dayjs(editData.effectiveFromDate).format('YYYY-MM-DDTHH:mm')
          : dayjs().format('YYYY-MM-DDTHH:mm'),
        effectiveToDate:
          editData.effectiveToDate === '9999-12-31T23:59:59' ? '9999-12-31T23:59' : dayjs(editData.effectiveToDate).format('YYYY-MM-DDTHH:mm'),
      })
    } else {
      setFormData({
        limitCode: '',
        limitDescription: '',
        active: true,
        effectiveFromDate: dayjs().format('YYYY-MM-DDTHH:mm'),
        effectiveToDate: '2028-12-31T23:59',
      })
    }
  }, [editData, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = () => {
    // Validation
    if (!formData.limitCode.trim()) {
      onSubmit({ ...formData, validationError: 'Limit Code is required' })
      return
    }
    if (!formData.limitDescription.trim()) {
      onSubmit({ ...formData, validationError: 'Limit Description is required' })
      return
    }

    const fromDate = new Date(formData.effectiveFromDate)
    const toDate = new Date(formData.effectiveToDate)

    if (fromDate > toDate) {
      onSubmit({ ...formData, validationError: 'Effective From date cannot be after Effective To date' })
      return
    }

    onSubmit(formData)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#0061B1' }}>
          {editData ? 'Edit Limit Type' : 'Create New Limit Type'}
        </Typography>
        <IconButton aria-label="close" onClick={onClose} sx={{ color: '#666' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                name="limitCode"
                label="Limit Code *"
                value={formData.limitCode}
                onChange={handleChange}
                fullWidth
                size="small"
                required
                placeholder="e.g., DL, ML, YL"
                helperText="Unique code for the limit type"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="limitDescription"
                label="Limit Description *"
                value={formData.limitDescription}
                onChange={handleChange}
                fullWidth
                size="small"
                required
                placeholder="e.g., Daily Limit, Monthly Limit"
              />
            </Grid>

            {/* <Grid item xs={12} md={6}>
              <TextField
                name="effectiveFromDate"
                label="Effective From Date *"
                type="datetime-local"
                value={formData.effectiveFromDate}
                onChange={handleChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid> */}
            <Grid item xs={6}>
              <DynamicDatePicker
                label="Effective From"
                value={formData.effectiveFromDate}
                onChange={(val: string) => {
                  console.log(val, 'kdjhchdvy')
                  setFormData({ ...formData, effectiveFromDate: val })
                }}
                // error={!!errors.effectiveFromDate}
                // helperText={errors.effectiveFromDate}
                required
              />
            </Grid>

            <Grid item xs={6}>
              <DynamicEndDatePicker
                label="Effective To"
                value={formData.effectiveToDate}
                minDate={formData.effectiveFromDate}
                onChange={(val: string) => {
                  setFormData({ ...formData, effectiveToDate: val })
                }}
                // error={!!errors.effectiveToDate}
                // helperText={errors.effectiveToDate}
                required
              />
            </Grid>

            {/* <Grid item xs={12} md={6}>
              <TextField
                name="effectiveToDate"
                label="Effective To Date *"
                type="datetime-local"
                value={formData.effectiveToDate}
                onChange={handleChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid> */}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {/* <FormControlLabel
                  control={<Switch name="active" checked={formData.active} onChange={handleChange} color="success" />}
                  label="Active Status"
                /> */}
                <FormControlLabel
                  control={<Checkbox checked={formData.active} onChange={(e: any) => setFormData({ ...formData, active: e.target.checked })} />}
                  label="Active Status"
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                  {formData.active ? 'Limit type is active and can be used' : 'Limit type is inactive'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                * Required fields
              </Typography>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: '#fafafa' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            borderRadius: 2,
            backgroundColor: '#0061B1',
            '&:hover': {
              backgroundColor: '#004d8c',
            },
          }}
        >
          {editData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
