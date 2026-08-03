import React, { useEffect, useState, useCallback } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete, FormControlLabel, Checkbox } from '@mui/material'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import SequenceApiService from '@/services/sequence.api.service'
import MasterService from '@/services/master.service'

export default function MenuItemsDialog({ open, editData, onClose, refreshList, showAlert }: any) {
  const local_service = new LocalStorageService()
  const master_service = new MasterService()
  const sequenceService = new SequenceApiService()

  const initialFormState = {
    countryCode: '',
    faqChannel: '',
    faqSectionLabelName: '',
    faqSectionDescription: '',
    faqSubSectionLabelName: '',
    faqSubSectionDescription: '',
    faqType: '',
    faqQuestion: '',
    faqQuestionCount: 0,
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
    createdBy: 'admin',
  }

  const [formData, setFormData] = useState<any>(initialFormState)
  const [errors, setErrors] = useState<any>({})
  const [countries, setcountries] = useState([])

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        effectiveFromDate: editData?.effectiveFromDate?.split('T')[0],
        effectiveToDate: editData?.effectiveToDate?.split('T')[0],
      })
    } else setFormData(initialFormState)
  }, [editData, open])

  useEffect(() => {
    fetchCountryCodes()
  }, [])

  const fetchCountryCodes = useCallback(async () => {
    const res: any = await sequenceService.getActiveCountryCorridors()
    setcountries(res || [])
  }, [])

  const handleSubmit = async () => {
    const mandatoryFields = [
      'countryCode',
      'faqSectionLabelName',
      'faqSectionDescription',
      'faqSubSectionLabelName',
      'faqSubSectionDescription',
      'faqType',
      'faqQuestion',
      'effectiveFromDate',
      'effectiveToDate',
    ]

    const isFormIncomplete = mandatoryFields.some((field) => !formData[field] || formData[field].toString().trim() === '')

    if (isFormIncomplete) {
      showAlert('error', 'Please fill in all mandatory fields before saving.')
      return
    }

    // 2. Proceed with API call
    try {
      if (editData) {
        // const res = await master_service.updateCoupon({
        //   applicant_id: local_service?.get_staff_id(),
        //   couponcode: formData?.couponcode,
        //   description: formData?.description,
        //   amount: formData?.amount,
        //   title: formData?.title,
        //   bgcolor: formData?.bgcolor,
        //   expirydays: formData?.expirydays,
        //   countryCode: formData?.countryCode,
        //   min_balance_required: formData?.min_balance_required,
        //   max_redemption_limit: formData?.max_redemption_limit,
        //   active: formData?.active,
        //   effectiveFromDate: formData.effectiveFromDate + 'T00:00:00',
        //   effectiveToDate: formData.effectiveToDate + 'T00:00:00',
        //   brand: formData?.brand,
        //   points_required: formData?.points_required,
        //   minimum_points_required: formData?.minimum_points_required,
        //   opening_stock: formData?.opening_stock,
        // })
        // if (res.status === false || !res.status) {
        //   showAlert('error', res.message)
        // }
        // if (res.success) {
        //   showAlert('success', 'Faq updated successfully')
        //   refreshList()
        //   onClose()
        // }
      } else {
        console.log(formData, 'formdata')
        let payload = {
          ...formData,
          effectiveFromDate: formData.effectiveFromDate + 'T00:00:00',
          effectiveToDate: formData.effectiveToDate + 'T00:00:00',
          createdBy: local_service?.get_staff_id(),
        }
        const res = await master_service.createMenuItem(payload)
        console.log(res, 'response')
        if (res.status === false || !res.status) {
          showAlert('error', res.message)
        }
        if (res.success) {
          showAlert('success', 'Menu Item created successfully')
          refreshList()
          onClose()
        }
      }
    } catch (error) {
      showAlert('error', 'Operation failed')
    }
  }

  const handleChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value })
    if (errors[key]) {
      setErrors({ ...errors, [key]: '' })
    }
  }

  // "countryCode": "UAE",
  // "moduleCode": "1",
  // "groupCode": "GRP001",
  // "groupName": "Administration",
  // "groupDisplayName": "Administration",
  // "menuName": "Transaction Outward",
  // "menuDisplayName": "Transaction Outward",
  // "parentMenuCode": "PARENT001",
  // "parentMenuName": "Transaction Outward",
  // "parentMenuDisplayName": "Transaction Outward",
  // "childMenuCode": "CHILD001",
  // "childMenuName": "Manage Users",
  // "path": "/transaction",
  // "icon": "user-icon",
  // "menuType": "MENU",
  // "displayOrder": 1,
  // "isVisible": "Y",
  // "active": true,
  // "createdBy": "APSUAEAUH2026042800002"

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editData ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField fullWidth label="Menu Name" required value={formData.menuName} onChange={(e) => handleChange('menuName', e.target.value)} />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Menu Display Name"
              required
              value={formData.menuDisplayName}
              onChange={(e) => handleChange('menuDisplayName', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <Autocomplete
              options={countries}
              value={countries.find((c: any) => c.countryCode === formData.countryCode) || null}
              getOptionLabel={(option: any) => `${option.countryName} (${option.countryCode})` || ''}
              isOptionEqualToValue={(option: any, value: any) => option.countryCode === value.countryCode}
              onChange={(_, newValue) => {
                setFormData({ ...formData, countryCode: newValue ? newValue.countryCode : '' })
              }}
              renderInput={(params) => <TextField {...params} label="Country" fullWidth />}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField fullWidth label="Group Code" required value={formData.groupCode} onChange={(e) => handleChange('groupCode', e.target.value)} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Group Name" required value={formData.groupName} onChange={(e) => handleChange('groupName', e.target.value)} />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Group Display Name"
              value={formData.groupDisplayName}
              onChange={(e) => handleChange('groupDisplayName', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Parent Menu Code"
              value={formData.parentMenuCode}
              onChange={(e) => handleChange('parentMenuCode', e.target.value)}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              fullWidth
              label="parent Menu Name"
              value={formData.parentMenuName}
              onChange={(e) => handleChange('parentMenuName', e.target.value)}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Parent Menu Display Name"
              value={formData.parentMenuDisplayName}
              onChange={(e) => handleChange('parentMenuDisplayName', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Child Menu Code"
              value={formData.childMenuCode}
              onChange={(e) => {
                handleChange('childMenuCode', e.target.value)
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Child Menu Name"
              value={formData.childMenuName}
              onChange={(e) => {
                handleChange('childMenuName', e.target.value)
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Path"
              value={formData.path}
              onChange={(e) => {
                handleChange('path', e.target.value)
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Menu Type"
              value={formData.menuType}
              onChange={(e) => {
                handleChange('menuType', e.target.value)
              }}
            />
          </Grid>

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
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={formData.active} onChange={(e) => handleChange('active', e.target.checked)} color="primary" />}
              label="Active Status"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} color="primary">
          {editData ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
