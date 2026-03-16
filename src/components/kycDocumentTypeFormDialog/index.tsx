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

export default function KycDocumentTypeFormDialog({
  open,
  onClose,
  editData,
  onSubmit,
}: KycDocumentTypeFormDialogProps) {

  const [formData, setFormData] = useState<FormData>({
    kycDocTypeDescription: '',
    active: true,
    effectiveFromDate: dayjs().format('YYYY-MM-DD'),
    effectiveToDate: '9999-12-31',
  })
const [originalData, setOriginalData] = useState<FormData | null>(null)
  useEffect(() => {
    if (editData) {
      setFormData({
        kycDocTypeDescription: editData.kycDocTypeDescription || '',
        active: editData.active ?? true,
        effectiveFromDate: editData.effectiveFromDate
          ? dayjs(editData.effectiveFromDate).format('YYYY-MM-DD')
          : dayjs().format('YYYY-MM-DD'),
        effectiveToDate:
          editData.effectiveToDate === '9999-12-31T23:59:59'
            ? '9999-12-31'
            : dayjs(editData.effectiveToDate).format('YYYY-MM-DD'),
      })
    } else {
      setFormData({
        kycDocTypeDescription: '',
        active: true,
        effectiveFromDate:null,
        effectiveToDate: null,
      })
    }
  }, [editData, open])



  useEffect(() => {
  let newData: FormData

  if (editData) {
    newData = {
      kycDocTypeDescription: editData.kycDocTypeDescription || '',
      active: editData.active ?? true,
      effectiveFromDate: editData.effectiveFromDate
        ? dayjs(editData.effectiveFromDate).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD'),
      effectiveToDate:
        editData.effectiveToDate === '9999-12-31T23:59:59'
          ? '9999-12-31'
          : dayjs(editData.effectiveToDate).format('YYYY-MM-DD'),
    }
  } else {
    newData = {
      kycDocTypeDescription: '',
      active: true,
      effectiveFromDate: dayjs().format('YYYY-MM-DD'),
      effectiveToDate: '9999-12-31',
    }
  }

  setFormData(newData)
  setOriginalData(newData)

}, [editData, open])
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
  const handleSubmit = () => {

    if (!formData.kycDocTypeDescription.trim()) {
      onSubmit({
        ...formData,
        validationError: 'Document Type Description is required',
      })
      return
    }

    const fromDate = dayjs(formData.effectiveFromDate)
    const toDate = dayjs(formData.effectiveToDate)

    if (fromDate.isAfter(toDate)) {
      onSubmit({
        ...formData,
        validationError:
          'Effective From date cannot be after Effective To date',
      })
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
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: '#0061B1' }}
        >
          {editData
            ? 'Edit Document Type'
            : 'Create New Document Type'}
        </Typography>

        <IconButton onClick={onClose}>
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

            {/* EFFECTIVE FROM */}
            <Grid item xs={12} md={6}>
              <DynamicDatePicker
                label="Effective From Date"
                value={formData.effectiveFromDate}
                onChange={(val: string) =>
                  setFormData(prev => ({
                    ...prev,
                    effectiveFromDate: val,
                  }))
                }
                required
              />
            </Grid>

            {/* EFFECTIVE TO */}
            <Grid item xs={12} md={6}>
              <DynamicEndDatePicker
                label="Effective To Date"
                value={formData.effectiveToDate}
                minDate={formData.effectiveFromDate}
                onChange={(val: string) =>
                  setFormData(prev => ({
                    ...prev,
                    effectiveToDate: val,
                  }))
                }
                required
              />
            </Grid>

            {/* ACTIVE STATUS */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mt: 1,
                }}
              >
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

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 2 }}
                >
                  {formData.active
                    ? 'Document type is active and can be used'
                    : 'Document type is inactive'}
                </Typography>
              </Box>
            </Grid>

            {/* REQUIRED NOTE */}
            <Grid item xs={12}>
              <Typography
                variant="caption"
                color="text.secondary"
              >
                * Required fields
              </Typography>
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
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
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