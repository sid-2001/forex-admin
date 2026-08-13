import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useState, useEffect, useMemo } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'
import dayjs from 'dayjs'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

const VALIDATION_RULES = {
  groupShortName: {
    message: 'Group Short Name is required',
    required: true,
    pattern: /^[A-Z]+$/,
    patternMessage: 'Only alphabets allowed',
  },
  groupName: {
    message: 'Group Name is required',
    required: true,
    pattern: /^[A-Za-z\s]+$/,
    patternMessage: 'Only alphabets allowed',
  },
  groupDisplayName: {
    message: 'Group Display Name is required',
    pattern: /^[A-Za-z\s]+$/,
    patternMessage: 'Only alphabets allowed',
    required: true,
  },

  effectiveToDate: { required: true, message: 'To Date is required' },
  effectiveFromDate: { required: true, message: 'From Date is required' },
}

const initialForm = {
  groupShortName: '',
  groupName: '',
  groupDisplayName: '',
  active: true,
  effectiveFromDate: '',
  effectiveToDate: '',
}

export default function GroupDialog({ open, onClose, onSubmit, editData }: any) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (editData && open) {
      const fDate = editData.effectiveFromDate || ''
      const tDate = editData.effectiveToDate || ''

      setForm({
        groupShortName: editData.groupShortName || '',
        groupName: editData.groupName || '',
        groupDisplayName: editData.groupDisplayName,
        effectiveFromDate: fDate ? String(fDate).split('T')[0] : '',
        effectiveToDate: tDate ? String(tDate).split('T')[0] : '',
        active: editData.active ?? true,
      })
    } else {
      setForm(initialForm)
    }
    setErrors({})
  }, [editData, open])

  const validate = () => {
    const newErrors: any = {}

    Object.keys(VALIDATION_RULES).forEach((field) => {
      const rule = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES]
      const value = form[field as keyof typeof form]

      if (value) {
        // Max length validation
        //@ts-ignore
        if (rule.max && value.length > rule.max) {
          newErrors[field] = rule.message
        }

        //@ts-ignore
        if (
          (field === 'groupShortName' || field === 'groupName' || field === 'groupDisplayName') &&
          //@ts-ignore
          rule?.pattern &&
          //@ts-ignore
          !rule?.pattern.test(value)
        ) {
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

    // Date validation: effectiveToDate must be after effectiveFromDate
    if (form.effectiveFromDate && form.effectiveToDate) {
      const fromDate = new Date(form.effectiveFromDate)
      const toDate = new Date(form.effectiveToDate)

      if (toDate <= fromDate) {
        newErrors.effectiveTo = 'Effective To date must be after Effective From date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit(form)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update Group' : 'Add Group'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Group Short Name"
              inputProps={{ maxLength: 10 }}
              value={form.groupShortName}
              required
              onChange={(e) => setForm({ ...form, groupShortName: e.target.value.toUpperCase() })}
              error={!!errors.groupShortName}
              helperText={errors.groupShortName}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Group Name"
              required
              inputProps={{ maxLength: 15 }}
              value={form.groupName}
              onChange={(e) => setForm({ ...form, groupName: e.target.value })}
              error={!!errors.groupName}
              helperText={errors.groupName}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Group Display Name"
              required
              inputProps={{ maxLength: 15 }}
              value={form.groupDisplayName}
              onChange={(e) => setForm({ ...form, groupDisplayName: e.target.value })}
              error={!!errors.groupDisplayName}
              helperText={errors.groupDisplayName}
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFromDate}
              onChange={(val: string) => {
                setForm({ ...form, effectiveFromDate: val })
              }}
              error={!!errors.effectiveFrom}
              helperText={errors.effectiveFrom}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={form.effectiveToDate}
              minDate={form.effectiveFromDate}
              onChange={(val: string) => {
                setForm({ ...form, effectiveToDate: val })
              }}
              error={!!errors.effectiveTo}
              helperText={errors.effectiveTo}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
              label="Active Status"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
