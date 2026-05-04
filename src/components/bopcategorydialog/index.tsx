import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Autocomplete,
  FormHelperText,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'
import BopCategoryService from '@/services/bop.category.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

// VALIDATION_RULES constants based on entity annotations
const VALIDATION_RULES = {
  countryCode: {
    maxLength: 3,
    required: true,
    message: 'Country code cannot exceed 3 characters',
    pattern: /^[A-Z]{2,3}$/,
    patternMessage: 'Country code should be 2-3 uppercase letters',
  },
  categoryType: {
    maxLength: 10,
    message: 'Category Type cannot exceed 10 characters',
  },
  bopPurposeCode: {
    maxLength: 10,
    pattern: /^[A-Za-z0-9\s]+$/,
    patternMessage: 'Only alphabets and numbers are allowed',
    message: 'Bop Purpose Code cannot exceed 10 characters',
    required: true,
  },
  bopPurposeDescription: {
    maxLength: 50,
    pattern: /^[A-Za-z\s]+$/,
    patternMessage: 'Only alphabets allowed',
    message: 'Bop purpose description cannot exceed 50 characters',
  },
  bopPurposeSubCode: {
    maxLength: 3,
    pattern: /^[0-9]*/,
    patternMessage: 'Only numbers are allowed',
    message: 'Bop purpose sub code cannot exceed 3 characters',
  },
  bopPurposeSubDescription: {
    maxLength: 50,
    pattern: /^[A-Za-z\s]+$/,
    patternMessage: 'Only alphabets allowed',
    message: 'Bop purpose sub description cannot exceed 50 characters',
  },
  effectiveToDate: { required: true, message: 'To Date is required' },
  effectiveFromDate: { required: true, message: 'From Date is required' },
}

export default function BopCategoryFormDialog({ open, onClose, editData, categorylist, refreshList, showAlert }: any) {
  const [countries] = useRecoilState(countyState)
  const service = new BopCategoryService()
  const localService = new LocalStorageService()

  const [form, setForm] = useState<any>({
    countryCode: '',
    categoryType: '',
    bopPurposeCode: '',
    bopPurposeDescription: '',
    bopPurposeSubCode: '',
    bopPurposeSubDescription: '',
    effectiveFromDate: '',
    effectiveToDate: '',
    active: true,
  })

  const [errors, setErrors] = useState<any>({})

  // Null-safe date formatter to prevent .split() crash
  const formatDate = (dateStr: any) => {
    if (!dateStr) return ''
    const str = String(dateStr)
    return str.includes('T') ? str.split('T')[0] : str
  }

  useEffect(() => {
    if (open) {
      if (editData) {
        setForm({
          ...editData,
          countryCode: editData.countryCode || '',
          categoryType: editData.categoryType || '',
          bopPurposeCode: editData.bopPurposeCode || '',
          bopPurposeDescription: editData.bopPurposeDescription || '',
          bopPurposeSubCode: editData.bopPurposeSubCode || '',
          bopPurposeSubDescription: editData.bopPurposeSubDescription || '',
          effectiveFromDate: formatDate(editData.effectiveFromDate || editData.effective_from_date),
          effectiveToDate: formatDate(editData.effectiveToDate || editData.effective_to_date),
          active: editData.active ?? true,
        })
      } else {
        setForm({
          countryCode: '',
          categoryType: '',
          bopPurposeCode: '',
          bopPurposeDescription: '',
          bopPurposeSubCode: '',
          bopPurposeSubDescription: '',
          effectiveFromDate: '',
          effectiveToDate: '',
          active: true,
        })
      }
      setErrors({})
    }
  }, [editData, open])

  const validate = () => {
    const newErrors: any = {}

    Object.keys(VALIDATION_RULES).forEach((field) => {
      const rule = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES]
      const value = form[field as keyof typeof form]

      if (value) {
        // Max length validation
        //@ts-ignore
        if (rule.maxLength && value.length > rule.maxLength) {
          newErrors[field] = rule.message
        }

        //@ts-ignore
        if (
          (field === 'bopPurposeSubDescription' ||
            field === 'bopPurposeCode' ||
            field === 'bopPurposeDescription' ||
            field === 'bopPurposeSubCode' ||
            field === 'categoryType' ||
            field === 'countryCode') &&
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
        newErrors.effectiveToDate = 'Effective To date must be after Effective From date'
      }
    }

    // Active status validation
    if (form.active === undefined || form.active === null) {
      newErrors.active = 'Active status must not be null'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    const staffId = localService.get_staff_id() || 'admin'

    const payload = {
      ...form,
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${form.effectiveToDate}T00:00:00`,
      createdBy: editData ? undefined : staffId,
      modifiedBy: !editData ? undefined : staffId,
    }

    try {
      const res = editData ? await service.update(payload) : await service.create(payload)

      if (res?.status === true || res) {
        showAlert('Success', `${res?.message}`)
        refreshList()
        onClose()
      } else {
        showAlert('Fail', res?.message || 'Operation failed')
      }
    } catch (e) {
      showAlert('Fail', 'Server Error')
    }
  }

  // Helper to get helper text with character limit
  const getHelperText = (field: string, value: string, customMessage?: string) => {
    const validationMap: any = {
      countryCode: VALIDATION_RULES.countryCode,
      categoryType: VALIDATION_RULES.categoryType,
      bopPurposeCode: VALIDATION_RULES.bopPurposeCode,
      bopPurposeDescription: VALIDATION_RULES.bopPurposeDescription,
      bopPurposeSubCode: VALIDATION_RULES.bopPurposeSubCode,
      bopPurposeSubDescription: VALIDATION_RULES.bopPurposeSubDescription,
    }

    const validation = validationMap[field]
    if (!validation) return customMessage || ''

    const currentLength = value?.length || 0
    return `${currentLength}/${validation.maxLength} characters`
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editData ? 'Update BOP Category' : 'Add BOP Category'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Country Field */}
          <Grid item xs={12}>
            <Autocomplete
              options={countries?.filter((c) => c.status === 'A') || []}
              getOptionLabel={(o) => `${o.countryName} (${o.countryCode})`}
              disabled={!!editData}
              value={countries.find((c) => c.countryCode === form.countryCode) || null}
              onChange={(_, val) => {
                setForm({ ...form, countryCode: val?.countryCode || '' })
                if (errors.countryCode) setErrors({ ...errors, countryCode: '' })
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Country"
                  required
                  error={!!errors.countryCode}
                  helperText={errors.countryCode || getHelperText('countryCode', form.countryCode)}
                />
              )}
            />
          </Grid>

          {/* Category Type Field */}
          <Grid item xs={12}>
            <Autocomplete
              options={categorylist || []}
              getOptionLabel={(option) => option.bopCategoryType || ''}
              value={categorylist.find((c: any) => c.bopCategoryTypeCode === form.categoryType) || null}
              onChange={(_, val) => {
                setForm({ ...form, categoryType: val?.bopCategoryTypeCode || '' })
                if (errors.categoryType) setErrors({ ...errors, categoryType: '' })
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category Type"
                  error={!!errors.categoryType}
                  helperText={errors.categoryType || getHelperText('categoryType', form.categoryType)}
                />
              )}
            />
          </Grid>

          {/* Purpose Code Field */}
          <Grid item xs={6}>
            <TextField
              label="Purpose Code"
              fullWidth
              required
              value={form.bopPurposeCode}
              onChange={(e) => {
                setForm({ ...form, bopPurposeCode: e.target.value })
                if (errors.bopPurposeCode) setErrors({ ...errors, bopPurposeCode: '' })
              }}
              error={!!errors.bopPurposeCode}
              helperText={errors.bopPurposeCode || getHelperText('bopPurposeCode', form.bopPurposeCode)}
              inputProps={{ maxLength: VALIDATION_RULES.bopPurposeCode.maxLength }}
            />
          </Grid>

          {/* Sub Code Field */}
          <Grid item xs={6}>
            <TextField
              label="Sub Code"
              fullWidth
              value={form.bopPurposeSubCode}
              onChange={(e) => {
                setForm({ ...form, bopPurposeSubCode: e.target.value })
                if (errors.bopPurposeSubCode) setErrors({ ...errors, bopPurposeSubCode: '' })
              }}
              error={!!errors.bopPurposeSubCode}
              helperText={errors.bopPurposeSubCode || getHelperText('bopPurposeSubCode', form.bopPurposeSubCode)}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: VALIDATION_RULES.bopPurposeSubCode.maxLength }}
            />
          </Grid>

          {/* Description Field */}
          <Grid item xs={12}>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={form.bopPurposeDescription}
              onChange={(e) => {
                setForm({ ...form, bopPurposeDescription: e.target.value })
                if (errors.bopPurposeDescription) setErrors({ ...errors, bopPurposeDescription: '' })
              }}
              error={!!errors.bopPurposeDescription}
              helperText={errors.bopPurposeDescription || getHelperText('bopPurposeDescription', form.bopPurposeDescription)}
              inputProps={{ maxLength: VALIDATION_RULES.bopPurposeDescription.maxLength }}
            />
          </Grid>

          {/* Sub Description Field */}
          <Grid item xs={12}>
            <TextField
              label="Sub Description"
              fullWidth
              multiline
              rows={2}
              value={form.bopPurposeSubDescription}
              onChange={(e) => {
                setForm({ ...form, bopPurposeSubDescription: e.target.value })
                if (errors.bopPurposeSubDescription) setErrors({ ...errors, bopPurposeSubDescription: '' })
              }}
              error={!!errors.bopPurposeSubDescription}
              helperText={errors.bopPurposeSubDescription || getHelperText('bopPurposeSubDescription', form.bopPurposeSubDescription)}
              inputProps={{ maxLength: VALIDATION_RULES.bopPurposeSubDescription.maxLength }}
            />
          </Grid>

          {/* Effective From Date */}
          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFromDate}
              onChange={(val: string) => {
                setForm({ ...form, effectiveFromDate: val })
                if (errors.effectiveFromDate) setErrors({ ...errors, effectiveFromDate: '' })
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
              value={form.effectiveToDate}
              minDate={form.effectiveFromDate}
              onChange={(val: string) => {
                setForm({ ...form, effectiveToDate: val })
                if (errors.effectiveToDate) setErrors({ ...errors, effectiveToDate: '' })
              }}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate || 'Required, must be after Effective From'}
              required
            />
          </Grid>

          {/* Active Status */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.active}
                  onChange={(e) => {
                    setForm({ ...form, active: e.target.checked })
                    if (errors.active) setErrors({ ...errors, active: '' })
                  }}
                />
              }
              label="Active Status"
            />
            {errors.active && <FormHelperText error>{errors.active}</FormHelperText>}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editData ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
