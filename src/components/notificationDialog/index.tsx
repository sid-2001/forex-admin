import React, { useEffect, useState, useCallback } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, FormControlLabel, Checkbox, Autocomplete } from '@mui/material'
import { LocalStorageService } from '@/helpers/local-storage-service'
import NotificationService from '@/services/notification.service'
import { UserService } from '@/services/user.service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'

export default function NotificationDialog({ open, editData, onClose, refreshList, showAlert, countryCorridorList }: any) {
  const local_service = new LocalStorageService()
  const notificationservice = new NotificationService()
  const user_service = new UserService()

  const initialFormState = {
    countryCode: '',
    module: '',
    action: '',
    subject: '',
    notificationContent: '',
    activeStatus: true,
    createdBy: '',
    effectiveFromDate: '',
    effectiveToDate: '',
  }

  const [formData, setFormData] = useState<any>(initialFormState)
  const [modules, setAllModules] = useState<any>([])

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        effectiveFromDate: editData.effectiveFromDate?.split('T')[0] || '',
        effectiveToDate: editData.effectiveToDate?.split('T')[0] || '',
      })
    } else setFormData(initialFormState)
  }, [editData, open])

  const fetchModulesList = useCallback(async () => {
    try {
      const res = await user_service.getAllModulesData()
      const active_modules = res?.filter((e) => e.moduleStatus === 'active')
      setAllModules(active_modules || [])
    } catch (err) {}
  }, [])

  useEffect(() => {
    fetchModulesList()
  }, [])

  const handleSubmit = async () => {
    const mandatoryFields = ['countryCode', 'module', 'action', 'notificationContent', 'subject', 'effectiveFromDate', 'effectiveToDate']

    const isFormIncomplete = mandatoryFields.some((field) => !formData[field] || formData[field].toString().trim() === '')

    if (isFormIncomplete) {
      showAlert('error', 'Please fill in all mandatory fields before saving.')
      return
    }

    // 2. Proceed with API call
    try {
      if (editData) {
        const res = await notificationservice.updateNotification(editData.notificationTypeCode, {
          countryCode: formData.countryCode,
          module: formData.module,
          action: formData.action,
          subject: formData.subject,
          notificationContent: formData.notificationContent,
          activeStatus: formData.activeStatus,
          effectiveFromDate: formData.effectiveFromDate + 'T00:00:00',
          effectiveToDate: formData.effectiveToDate + 'T00:00:00',
          modifiedBy: local_service?.get_staff_id(),
        })
        if (res.status === false) {
          showAlert('fail', res.message)
        } else {
          showAlert('success', 'Notification updated successfully')
          refreshList()
          onClose()
        }
      } else {
        let payload = {
          ...formData,
          createdBy: local_service?.get_staff_id(),
          effectiveFromDate: formData.effectiveFromDate + 'T00:00:00',
          effectiveToDate: formData.effectiveToDate + 'T00:00:00',
        }
        const res = await notificationservice.createNotification(payload)
        if (res.status === false) {
          showAlert('fail', res.message)
        } else {
          showAlert('success', res.message)
          refreshList()
          onClose()
        }
      }
    } catch (error) {
      showAlert('error', 'Operation failed')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editData ? 'Edit Notification' : 'Add Notification'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <Autocomplete
              options={countryCorridorList}
              value={countryCorridorList.find((c: any) => c.countryCode === formData.countryCode) || null}
              getOptionLabel={(option: any) => `${option.countryName} (${option.countryCode})` || ''}
              isOptionEqualToValue={(option: any, value: any) => option.countryCode === value.countryCode}
              onChange={(_, newValue) => {
                setFormData({ ...formData, countryCode: newValue ? newValue.countryCode : '' })
              }}
              renderInput={(params) => <TextField {...params} required label="Country" fullWidth />}
            />
          </Grid>
          <Grid item xs={6}>
            <Autocomplete
              options={modules}
              value={modules.find((p: any) => p.moduleName === formData.module) || null}
              getOptionLabel={(option: any) => `${option.moduleName} (${option.moduleId})` || ''}
              isOptionEqualToValue={(option: any, value: any) => option.moduleName === value.moduleName}
              onChange={(_, newValue) => {
                setFormData({ ...formData, module: newValue ? newValue.moduleName : '' })
              }}
              renderInput={(params) => <TextField required {...params} label="Module" fullWidth />}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Subject"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Action"
              required
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notification Content"
              required
              value={formData.notificationContent}
              multiline={true}
              onChange={(e) => setFormData({ ...formData, notificationContent: e.target.value })}
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={formData.effectiveFromDate}
              onChange={(val: string) => setFormData({ ...formData, effectiveFromDate: val })}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={formData.effectiveToDate}
              minDate={formData.effectiveFromDate}
              onChange={(val: string) => setFormData({ ...formData, effectiveToDate: val })}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="Status"
                  checked={formData.activeStatus}
                  onChange={(e: any) => setFormData({ ...formData, activeStatus: e.target.checked })}
                  color="primary"
                />
              }
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
