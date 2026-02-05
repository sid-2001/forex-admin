import React, { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControlLabel, Switch, Grid, FormHelperText } from '@mui/material'

export interface BopCategoryType {
  bopCategoryTypeCode: string
  bopCategoryType: string
  bopCategoryDescription: string
  active: boolean
  effective_from_date: string
  effective_to_date: string
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
    effective_from_date: '',
    effective_to_date: '',
  })

  const [errors, setErrors] = useState<any>({})

  /* ------------------ Edit Mode ------------------ */
  useEffect(() => {
    if (editData) {
      setFormData({
        bopCategoryType: editData.bopCategoryType,
        bopCategoryDescription: editData.bopCategoryDescription,
        active: editData.active,
        effective_from_date: editData.effective_from_date?.slice(0, 10),
        effective_to_date: editData.effective_to_date?.slice(0, 10),
      })
    } else {
      setFormData({
        bopCategoryType: '',
        bopCategoryDescription: '',
        active: true,
        effective_from_date: '',
        effective_to_date: '',
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

    if (!formData.effective_from_date) newErrors.effective_from_date = 'Effective From date is required'

    if (!formData.effective_to_date) newErrors.effective_to_date = 'Effective To date is required'

    if (formData.effective_from_date && formData.effective_to_date && new Date(formData.effective_to_date) < new Date(formData.effective_from_date)) {
      newErrors.effective_to_date = 'Effective To date cannot be before Effective From'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ------------------ Submit ------------------ */
  const handleSubmit = () => {
    if (!validate()) return

    onSubmit({
      ...formData,
      effectiveFromDate: `${formData.effective_from_date}T00:00:00`,
      effectiveToDate: `${formData.effective_to_date}T23:59:59`,
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

          <Grid item xs={6}>
            <TextField
              label="Effective From"
              type="date"
              name="effective_from_date"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={formData.effective_from_date}
              error={!!errors.effective_from_date}
              helperText={errors.effective_from_date}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Effective To"
              type="date"
              name="effective_to_date"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: formData.effective_from_date }}
              value={formData.effective_to_date}
              error={!!errors.effective_to_date}
              helperText={errors.effective_to_date}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
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
