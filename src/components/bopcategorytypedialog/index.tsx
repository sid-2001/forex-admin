import React, { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControlLabel, Grid, Checkbox, FormHelperText } from '@mui/material'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import { LocalStorageService } from '@/helpers/local-storage-service'

export interface BopCategoryType {
  bopCategoryType: string
  bopCategoryDescription: string
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
}

interface Props {
  open: boolean
  editData: BopCategoryType | null
  onClose: () => void
  onSubmit: (data: any) => void
  onFormChange?: (changed: boolean) => void // New prop
  isUpdateDisabled?: boolean // New prop
}

// Validation constants based on entity annotations
const VALIDATION = {
  BOP_CATEGORY_TYPE_CODE: {
    maxLength: 10,
    message: 'Bop category type Code cannot exceed 10 characters',
  },
  BOP_CATEGORY_TYPE: {
    maxLength: 10,
    required: true,
    message: 'Bop category type cannot exceed 10 characters',
  },
  BOP_CATEGORY_DESCRIPTION: {
    maxLength: 50,
    required: true,
    message: 'Bop Category description cannot exceed 50 characters',
  },
}

const BopCategoryTypeFormDialog: React.FC<Props> = ({ open, editData, onClose, onSubmit, onFormChange, isUpdateDisabled }) => {
  const local_service = new LocalStorageService()
  const staffData = local_service.get_staff_access()

  const [formData, setFormData] = useState({
    bopCategoryType: '',
    bopCategoryDescription: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  })

  const [originalData, setOriginalData] = useState<any>(null)
  const [errors, setErrors] = useState<any>({})

  // Check if form data has changed from original
  const checkFormChanged = (current: any, original: any) => {
    if (!original) return false

    return (
      current.bopCategoryType !== original.bopCategoryType ||
      current.bopCategoryDescription !== original.bopCategoryDescription ||
      current.active !== original.active ||
      current.effectiveFromDate !== original.effectiveFromDate ||
      current.effectiveToDate !== original.effectiveToDate
    )
  }

  // Reset form when dialog opens/closes or editData changes
  useEffect(() => {
    if (open) {
      if (editData) {
        const newFormData = {
          bopCategoryType: editData.bopCategoryType || '',
          bopCategoryDescription: editData.bopCategoryDescription || '',
          active: editData.active ?? true,
          effectiveFromDate: editData.effectiveFromDate?.slice(0, 10) || '',
          effectiveToDate: editData.effectiveToDate?.slice(0, 10) || '',
        }
        setFormData(newFormData)
        setOriginalData(newFormData)
      } else {
        const newFormData = {
          bopCategoryType: '',
          bopCategoryDescription: '',
          active: true,
          effectiveFromDate: '',
          effectiveToDate: '',
        }
        setFormData(newFormData)
        setOriginalData(null)
      }
      setErrors({})
    }
  }, [editData, open])

  // Notify parent component when form changes
  useEffect(() => {
    if (onFormChange && originalData) {
      const changed = checkFormChanged(formData, originalData)
      onFormChange(changed)
    }
  }, [formData, originalData, onFormChange])

  /* ------------------ Change Handler ------------------ */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }))
    }
  }

  /* ------------------ Validation ------------------ */
  const validate = () => {
    const newErrors: any = {}

    // BOP Category Type validation
    if (!formData.bopCategoryType.trim()) {
      newErrors.bopCategoryType = 'Bop category type is required'
    } else if (formData.bopCategoryType.length > VALIDATION.BOP_CATEGORY_TYPE.maxLength) {
      newErrors.bopCategoryType = VALIDATION.BOP_CATEGORY_TYPE.message
    }

    // BOP Category Description validation
    if (!formData.bopCategoryDescription.trim()) {
      newErrors.bopCategoryDescription = 'Bop Category description must not be blank'
    } else if (formData.bopCategoryDescription.length > VALIDATION.BOP_CATEGORY_DESCRIPTION.maxLength) {
      newErrors.bopCategoryDescription = VALIDATION.BOP_CATEGORY_DESCRIPTION.message
    }

    // Effective From Date validation
    if (!formData.effectiveFromDate) {
      newErrors.effectiveFromDate = 'Effective from date must not be null'
    }

    // Effective To Date validation
    if (!formData.effectiveToDate) {
      newErrors.effectiveToDate = 'Effective to date must not be null'
    }

    // Date range validation (AssertTrue validation from entity)
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

  /* ------------------ Submit ------------------ */
  const handleSubmit = () => {
    if (!validate()) return

    const now = new Date().toISOString()
    const submitData = {
      ...formData,
      effectiveFromDate: `${formData.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${formData.effectiveToDate}T00:00:00`,
      // createdBy: editData ? undefined : staffData?.staffId,
      // modifiedBy: staffData?.staffId,
      // createdLocalDateTime: editData ? undefined : now,
      // modifiedLocalDateTime: now,
      // createdTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      // modifiedTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      // createdOffset: formatTimezoneOffset(),
      // modifiedOffset: formatTimezoneOffset(),
      // createdUtcDateTime: editData ? undefined : new Date().toISOString(),
      // modifiedUtcDateTime: new Date().toISOString(),
    }

    onSubmit(submitData)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editData ? 'Edit BOP Category Type' : 'Create BOP Category Type'}</DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* BOP Category Type Code */}

          {/* BOP Category Type */}
          <Grid item xs={12}>
            <TextField
              label="Category Type"
              name="bopCategoryType"
              fullWidth
              required
              value={formData.bopCategoryType}
              error={!!errors.bopCategoryType}
              helperText={errors.bopCategoryType || `Required, max ${VALIDATION.BOP_CATEGORY_TYPE.maxLength} characters`}
              onChange={handleChange}
              inputProps={{ maxLength: VALIDATION.BOP_CATEGORY_TYPE.maxLength }}
              size="small"
            />
          </Grid>

          {/* BOP Category Description */}
          <Grid item xs={12}>
            <TextField
              label="Category Description"
              name="bopCategoryDescription"
              fullWidth
              required
              multiline
              rows={3}
              value={formData.bopCategoryDescription}
              error={!!errors.bopCategoryDescription}
              helperText={errors.bopCategoryDescription || `Required, max ${VALIDATION.BOP_CATEGORY_DESCRIPTION.maxLength} characters`}
              onChange={handleChange}
              inputProps={{ maxLength: VALIDATION.BOP_CATEGORY_DESCRIPTION.maxLength }}
              size="small"
            />
          </Grid>

          {/* Effective From Date */}
          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={formData.effectiveFromDate}
              onChange={(val: string) => {
                setFormData({ ...formData, effectiveFromDate: val })
                if (errors.effectiveFromDate) {
                  setErrors((prev: any) => ({ ...prev, effectiveFromDate: '' }))
                }
              }}
              error={!!errors.effectiveFromDate}
              helperText={errors.effectiveFromDate || 'Required'}
              required
            />
          </Grid>

          {/* Effective To Date */}
          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={formData.effectiveToDate}
              minDate={formData.effectiveFromDate}
              onChange={(val: string) => {
                setFormData({ ...formData, effectiveToDate: val })
                if (errors.effectiveToDate) {
                  setErrors((prev: any) => ({ ...prev, effectiveToDate: '' }))
                }
              }}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate || 'Required, must be after Effective From'}
              required
            />
          </Grid>

          {/* Active Status */}
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={formData.active} onChange={handleChange} name="active" color="primary" />}
              label="Active Status"
            />
            {errors.active && <FormHelperText error>{errors.active}</FormHelperText>}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={editData ? isUpdateDisabled : false} // Disable if no changes in edit mode
        >
          {editData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BopCategoryTypeFormDialog
