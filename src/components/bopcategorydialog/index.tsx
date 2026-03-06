import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Grid, Autocomplete, FormHelperText } from '@mui/material'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'
import BopCategoryService from '@/services/bop.category.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

// Validation constants based on entity annotations
const VALIDATION = {
  COUNTRY_CODE: {
    maxLength: 3,
    required: true,
    message: 'Country code cannot exceed 3 characters'
  },
  CATEGORY_TYPE: {
    maxLength: 10,
    message: 'Category Type cannot exceed 10 characters'
  },
  BOP_PURPOSE_CODE: {
    maxLength: 10,
    message: 'Bop Purpose Code cannot exceed 10 characters'
  },
  BOP_PURPOSE_DESCRIPTION: {
    maxLength: 50,
    message: 'Bop purpose description cannot exceed 50 characters'
  },
  BOP_PURPOSE_SUB_CODE: {
    maxLength: 3,
    message: 'Bop purpose sub code cannot exceed 3 characters'
  },
  BOP_PURPOSE_SUB_DESCRIPTION: {
    maxLength: 50,
    message: 'Bop purpose sub description cannot exceed 50 characters'
  },
  CREATED_BY: {
    maxLength: 50,
    message: 'Created by cannot exceed 50 characters'
  },
  MODIFIED_BY: {
    maxLength: 50,
    message: 'Modified by cannot exceed 50 characters'
  },
  TIMEZONE: {
    maxLength: 50,
    message: 'Timezone cannot exceed 50 characters'
  },
  OFFSET: {
    maxLength: 10,
    message: 'Offset cannot exceed 10 characters'
  }
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

  // Helper to format timezone offset
  const formatTimezoneOffset = () => {
    const offset = -new Date().getTimezoneOffset()
    const sign = offset >= 0 ? '+' : '-'
    const hours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0')
    const minutes = (Math.abs(offset) % 60).toString().padStart(2, '0')
    return `${sign}${hours}:${minutes}`
  }

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
    const errs: any = {}

    // Country Code validation
    if (!form.countryCode) {
      errs.countryCode = 'Country code must not be blank'
    } else if (form.countryCode.length > VALIDATION.COUNTRY_CODE.maxLength) {
      errs.countryCode = VALIDATION.COUNTRY_CODE.message
    }

    // Category Type validation
    if (form.categoryType && form.categoryType.length > VALIDATION.CATEGORY_TYPE.maxLength) {
      errs.categoryType = VALIDATION.CATEGORY_TYPE.message
    }

    // BOP Purpose Code validation
    if (!form.bopPurposeCode) {
      errs.bopPurposeCode = 'Bop Purpose Code is required'
    } else if (form.bopPurposeCode.length > VALIDATION.BOP_PURPOSE_CODE.maxLength) {
      errs.bopPurposeCode = VALIDATION.BOP_PURPOSE_CODE.message
    }

    // BOP Purpose Description validation
    if (form.bopPurposeDescription && form.bopPurposeDescription.length > VALIDATION.BOP_PURPOSE_DESCRIPTION.maxLength) {
      errs.bopPurposeDescription = VALIDATION.BOP_PURPOSE_DESCRIPTION.message
    }

    // BOP Purpose Sub Code validation
    if (form.bopPurposeSubCode && form.bopPurposeSubCode.length > VALIDATION.BOP_PURPOSE_SUB_CODE.maxLength) {
      errs.bopPurposeSubCode = VALIDATION.BOP_PURPOSE_SUB_CODE.message
    }

    // BOP Purpose Sub Description validation
    if (form.bopPurposeSubDescription && form.bopPurposeSubDescription.length > VALIDATION.BOP_PURPOSE_SUB_DESCRIPTION.maxLength) {
      errs.bopPurposeSubDescription = VALIDATION.BOP_PURPOSE_SUB_DESCRIPTION.message
    }

    // Effective From Date validation
    if (!form.effectiveFromDate) {
      errs.effectiveFromDate = 'Effective from date must not be null'
    }

    // Effective To Date validation
    if (!form.effectiveToDate) {
      errs.effectiveToDate = 'Effective to date must not be null'
    }

    // Date range validation (AssertTrue)
    if (form.effectiveFromDate && form.effectiveToDate) {
      const fromDate = new Date(form.effectiveFromDate)
      const toDate = new Date(form.effectiveToDate)
      
      if (toDate <= fromDate) {
        errs.effectiveToDate = 'Effective To date must be after Effective From date'
      }
    }

    // Active status validation
    if (form.active === undefined || form.active === null) {
      errs.active = 'Active status must not be null'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    
    const staffId = localService.get_staff_id() || 'admin'
    const now = new Date().toISOString()
    
    const payload = {
      ...form,
      bopPurposeCategoryCode: form.bopPurposeCategoryCode || null,
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${form.effectiveToDate}T00:00:00`,
      createdBy: editData ? undefined : staffId,
      modifiedBy: staffId,
      createdLocalDateTime: editData ? undefined : now,
      modifiedLocalDateTime: now,
      createdTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      modifiedTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      createdOffset: formatTimezoneOffset(),
      modifiedOffset: formatTimezoneOffset(),
      createdUtcDateTime: editData ? undefined : new Date().toISOString(),
      modifiedUtcDateTime: new Date().toISOString(),
    }

    try {
      const res = editData 
        ? await service.update(payload) 
        : await service.create(payload)

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
      countryCode: VALIDATION.COUNTRY_CODE,
      categoryType: VALIDATION.CATEGORY_TYPE,
      bopPurposeCode: VALIDATION.BOP_PURPOSE_CODE,
      bopPurposeDescription: VALIDATION.BOP_PURPOSE_DESCRIPTION,
      bopPurposeSubCode: VALIDATION.BOP_PURPOSE_SUB_CODE,
      bopPurposeSubDescription: VALIDATION.BOP_PURPOSE_SUB_DESCRIPTION
    }
    
    const validation = validationMap[field]
    if (!validation) return customMessage || ''
    
    const currentLength = value?.length || 0
    return `${currentLength}/${validation.maxLength} characters`
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
        {editData ? 'Update BOP Category' : 'Add BOP Category'}
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Country Field */}
          <Grid item xs={12}>
            <Autocomplete
              options={countries?.filter((c) => c.status === 'A') || []}
              getOptionLabel={(option) => (option.countryName as string) || ''}
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
              inputProps={{ maxLength: VALIDATION.BOP_PURPOSE_CODE.maxLength }}
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
              inputProps={{ maxLength: VALIDATION.BOP_PURPOSE_SUB_CODE.maxLength }}
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
              inputProps={{ maxLength: VALIDATION.BOP_PURPOSE_DESCRIPTION.maxLength }}
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
              inputProps={{ maxLength: VALIDATION.BOP_PURPOSE_SUB_DESCRIPTION.maxLength }}
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