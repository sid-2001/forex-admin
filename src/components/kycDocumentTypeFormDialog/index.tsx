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
  Checkbox,
  Grid,
  Typography,
  IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

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

const VALIDATION_RULES = {
  kycDocTypeDescription: {
    message: 'KYC Document Type Description is required',
    pattern: /^[A-Za-z\s]+$/,
    patternMessage: 'Only alphabets allowed',
    required: true,
  },

  effectiveToDate: { required: true, message: 'To Date is required' },
  effectiveFromDate: { required: true, message: 'From Date is required' },
}

export default function KycDocumentTypeFormDialog({ open, onClose, editData, onSubmit }: KycDocumentTypeFormDialogProps) {
  const initialFormState = {
    kycDocTypeDescription: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  }

  const [formData, setFormData] = useState<FormData>(initialFormState)
  const [originalData, setOriginalData] = useState<FormData | null>(null)
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        effectiveFromDate: editData.effectiveFromDate?.split('T')[0] || '',
        effectiveToDate: editData.effectiveToDate?.split('T')[0] || '',
      })
    } else {
      setFormData(formData)
    }
  }, [editData, open])

  useEffect(() => {
    let newData: FormData

    if (editData) {
      newData = {
        ...editData,
        effectiveFromDate: editData.effectiveFromDate?.split('T')[0] || '',
        effectiveToDate: editData.effectiveToDate?.split('T')[0] || '',
      }
    } else {
      newData = formData
    }

    setFormData(newData)
    setOriginalData(newData)
  }, [editData, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const isFormChanged = () => {
    if (!originalData) return true

    return (
      formData.kycDocTypeDescription !== originalData.kycDocTypeDescription ||
      formData.active !== originalData.active ||
      formData.effectiveFromDate !== originalData.effectiveFromDate ||
      formData.effectiveToDate !== originalData.effectiveToDate
    )
  }

  const validate = () => {
    const newErrors: any = {}

    Object.keys(VALIDATION_RULES).forEach((field) => {
      const rule = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES]
      const value = formData[field as keyof typeof formData]

      if (value) {
        // Max length validation
        //@ts-ignore
        if (rule.max && value.length > rule.max) {
          newErrors[field] = rule.message
        }

        //@ts-ignore
        if (field === 'kycDocTypeDescription' && rule.pattern && !rule.pattern.test(value)) {
          //@ts-ignore
          newErrors[field] = rule.patternMessage
        }
      } else if (
        //@ts-ignore
        rule.required
      ) {
        newErrors[field] = 'This field is required'
      }
    })

    if (formData.effectiveFromDate && formData.effectiveToDate) {
      const fromDate = new Date(formData.effectiveFromDate)
      const toDate = new Date(formData.effectiveToDate)

      if (toDate <= fromDate) {
        newErrors.effectiveToDate = 'Effective To date must be after Effective From date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const { ...cleanData } = formData as any
    onSubmit({ ...cleanData })
    setFormData(initialFormState)
  }

  const handleCloseButton = () => {
    setErrors({})
    setFormData(initialFormState)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleCloseButton}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      {/* HEADER */}
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
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#0061B1' }}>
          {editData ? 'Edit Document Type' : 'Create New Document Type'}
        </Typography>

        <IconButton onClick={handleCloseButton}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* BODY */}
      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Grid container spacing={2}>
            {/* DESCRIPTION */}
            <Grid item xs={12}>
              <TextField
                name="kycDocTypeDescription"
                label="Document Type Description"
                value={formData.kycDocTypeDescription}
                onChange={handleChange}
                fullWidth
                size="small"
                required
                placeholder="e.g., Pan Card, Aadhar Card, Passport"
                multiline
                rows={2}
                error={!!errors.kycDocTypeDescription}
                helperText={errors.kycDocTypeDescription}
              />
            </Grid>

            {/* EFFECTIVE FROM */}
            <Grid item xs={12} md={6}>
              <DynamicDatePicker
                label="Effective From Date"
                value={formData.effectiveFromDate}
                onChange={(val: string) =>
                  setFormData((prev) => ({
                    ...prev,
                    effectiveFromDate: val,
                  }))
                }
                required
                error={!!errors.effectiveFromDate}
                helperText={errors.effectiveFromDate}
              />
            </Grid>

            {/* EFFECTIVE TO */}
            <Grid item xs={12} md={6}>
              <DynamicEndDatePicker
                label="Effective To Date"
                value={formData.effectiveToDate}
                minDate={formData.effectiveFromDate}
                onChange={(val: string) =>
                  setFormData((prev) => ({
                    ...prev,
                    effectiveToDate: val,
                  }))
                }
                required
                error={!!errors.effectiveToDate}
                helperText={errors.effectiveToDate}
              />
            </Grid>

            {/* ACTIVE STATUS */}
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />}
                label="Active"
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      {/* FOOTER */}
      <DialogActions
        sx={{
          p: 2,
          backgroundColor: '#fafafa',
        }}
      >
        <Button onClick={handleCloseButton} variant="outlined" sx={{ borderRadius: 2 }}>
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={editData ? !isFormChanged() : false}
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
