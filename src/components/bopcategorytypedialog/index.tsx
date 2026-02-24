import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Grid,
  FormHelperText,
  Checkbox,
} from '@mui/material'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

export interface BopCategoryType {
  bopCategoryTypeCode: string
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
}

const BopCategoryTypeFormDialog: React.FC<Props> = ({ open, editData, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    bopCategoryType: '',
    bopCategoryDescription: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  })

  const [errors, setErrors] = useState<any>({})
  console.log(editData, 'djbnchvy')
  useEffect(() => {
    if (editData) {
      setFormData({
        bopCategoryType: editData.bopCategoryType,
        bopCategoryDescription: editData.bopCategoryDescription,
        active: editData.active,
        effectiveFromDate: editData.effectiveFromDate?.slice(0, 10),
        effectiveToDate: editData.effectiveToDate?.slice(0, 10),
      })
    } else {
      setFormData({
        bopCategoryType: '',
        bopCategoryDescription: '',
        active: true,
        effectiveFromDate: '',
        effectiveToDate: '',
      })
      setErrors({})
    }
  }, [editData])

  /* ------------------ Change Handler ------------------ */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  /* ------------------ Validation ------------------ */
  const validate = () => {
    const newErrors: any = {}

    if (!formData.bopCategoryType.trim()) newErrors.bopCategoryType = 'Category Type is required'

    if (!formData.bopCategoryDescription.trim()) newErrors.bopCategoryDescription = 'Category Description is required'

    if (!formData.effectiveFromDate) newErrors.effectiveFromDate = 'Effective From date is required'

    if (!formData.effectiveToDate) newErrors.effectiveToDate = 'Effective To date is required'

    if (formData.effectiveFromDate && formData.effectiveToDate && new Date(formData.effectiveToDate) < new Date(formData.effectiveFromDate)) {
      newErrors.effectiveToDate = 'Effective To date cannot be before Effective From'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ------------------ Submit ------------------ */
  const handleSubmit = () => {
    if (!validate()) return

    onSubmit({
      ...formData,
      effectiveFromDate: `${formData.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${formData.effectiveToDate}T00:00:00`,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editData ? 'Edit BOP Category Type' : 'Create BOP Category Type'}</DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}>
            <TextField
              label="Category Type"
              name="bopCategoryType"
              fullWidth
              required
              value={formData.bopCategoryType}
              error={!!errors.bopCategoryType}
              helperText={errors.bopCategoryType}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Category Description"
              name="bopCategoryDescription"
              fullWidth
              required
              value={formData.bopCategoryDescription}
              error={!!errors.bopCategoryDescription}
              helperText={errors.bopCategoryDescription}
              onChange={handleChange}
            />
          </Grid>

          {/* <Grid item xs={6}>
            <TextField
              label="Effective From"
              type="date"
              name="effectiveFromDate"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={formData.effectiveFromDate}
              error={!!errors.effectiveFromDate}
              helperText={errors.effectiveFromDate}
              onChange={handleChange}
            />
          </Grid> */}
          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={formData.effectiveFromDate}
              onChange={(val: string) => {
                setFormData({ ...formData, effectiveFromDate: val })
              }}
              error={!!errors.effectiveFromDate}
              helperText={errors.effectiveFromDate}
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
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              required
            />
          </Grid>

          {/* <Grid item xs={6}>
            <TextField
              label="Effective To"
              type="date"
              name="effectiveToDate"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: formData.effectiveFromDate }}
              value={formData.effectiveToDate}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              onChange={handleChange}
            />
          </Grid> */}

          {/* <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                />
              }
              label="Active"
            />
          </Grid> */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                />
              }
              label="Active Status"
            />
          </Grid>
        </Grid>
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

export default BopCategoryTypeFormDialog
