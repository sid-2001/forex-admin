// components/kycDocumentTypeFormDialog.tsx
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
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import dayjs from 'dayjs'

interface FormData {
  kycDocTypeDescription: string
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  validationError?: string
}

interface KycDocumentTypeFormDialogProps {
  open: boolean
  onClose: () => void
  editData?: any
  onSubmit: (data: FormData) => void
}

export default function KycDocumentTypeFormDialog({
  open,
  onClose,
  editData,
  onSubmit,
}: KycDocumentTypeFormDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    kycDocTypeDescription: '',
    active: true,
    effectiveFromDate: dayjs().format('YYYY-MM-DDTHH:mm'),
    effectiveToDate: '9999-12-31T23:59',
  })

  useEffect(() => {
    if (editData) {
      setFormData({
        kycDocTypeDescription: editData.kycDocTypeDescription || '',
        active: editData.active || false,
        effectiveFromDate: editData.effectiveFromDate 
          ? dayjs(editData.effectiveFromDate).format('YYYY-MM-DDTHH:mm')
          : dayjs().format('YYYY-MM-DDTHH:mm'),
        effectiveToDate: editData.effectiveToDate === '9999-12-31T23:59:59'
          ? '9999-12-31T23:59'
          : dayjs(editData.effectiveToDate).format('YYYY-MM-DDTHH:mm'),
      })
    } else {
      setFormData({
        kycDocTypeDescription: '',
        active: true,
        effectiveFromDate: dayjs().format('YYYY-MM-DDTHH:mm'),
        effectiveToDate: '9999-12-31T23:59',
      })
    }
  }, [editData, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = () => {
    // Validation
    if (!formData.kycDocTypeDescription.trim()) {
      onSubmit({ ...formData, validationError: 'Document Type Description is required' })
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
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2, 
        backgroundColor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#0061B1' }}>
          {editData ? 'Edit Document Type' : 'Create New Document Type'}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: '#666' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="kycDocTypeDescription"
                label="Document Type Description *"
                value={formData.kycDocTypeDescription}
                onChange={handleChange}
                fullWidth
                size="small"
                required
                placeholder="e.g., Pan Card, Aadhar Card, Passport"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
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
            </Grid>

            <Grid item xs={12} md={6}>
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
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                      color="success"
                    />
                  }
                  label="Active Status"
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                  {formData.active ? 'Document type is active and can be used' : 'Document type is inactive'}
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
            }
          }}
        >
          {editData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}