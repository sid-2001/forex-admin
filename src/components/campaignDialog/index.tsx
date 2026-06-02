import React, { useEffect, useState, useCallback } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete } from '@mui/material'
import { LocalStorageService } from '@/helpers/local-storage-service'
import NotificationService from '@/services/notification.service'
import { UserService } from '@/services/user.service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import SequenceApiService from '@/services/sequence.api.service'

export default function NotificationCampaignDialog({ open, editData, onClose, refreshList, showAlert }: any) {
  const local_service = new LocalStorageService()
  const notificationservice = new NotificationService()
  const user_service = new UserService()
  const sequenceService = new SequenceApiService()

  const targetTypes = [
    { label: 'COUNTRY', value: 'COUNTRY' },
    { label: 'TARGET COUNTRY', value: 'TARGET_COUNTRY' },
    { label: 'ALL', value: 'ALL' },
  ]
  const freqTypes = [
    { label: 'INTERVAL', value: 'INTERVAL' },
    { label: 'DAILY', value: 'DAILY' },
    { label: 'ONE TIME', value: 'ONE_TIME' },
  ]

  const initialFormState = {
    campaignName: '',
    notificationTypeCode: '',
    targetType: '',
    startDate: '',
    endDate: '',
    frequencyType: '',
    maxRetryCount: 0,
    countryCode: '',
    targetCountry: '',
    frequencyValue: 0,
    frequencyUnit: 0,
    scheduledAt: '',
  }

  const [formData, setFormData] = useState<any>(initialFormState)
  const [countriesData, setCountryCorridorsData] = useState([])
  const [notificationsData, setNotificationsData] = useState([])
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        effectiveFromDate: editData.effectiveFromDate?.split('T')[0] || '',
        effectiveToDate: editData.effectiveToDate?.split('T')[0] || '',
      })
    } else setFormData(initialFormState)
  }, [editData, open])

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationservice.getAll()
      setNotificationsData(response?.data || [])
    } catch (err) {}
  }, [])

  const fetchCountryCodes = useCallback(async () => {
    const res: any = await sequenceService.getActiveCountryCorridors()
    setCountryCorridorsData(res || [])
  }, [])

  useEffect(() => {
    fetchNotifications()
    fetchCountryCodes()
  }, [])

  const handleSubmit = async () => {
    const mandatoryFields = ['countryCode', 'endDate', 'startDate']

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
        console.log(formData, 'formdata')
        let payload = {
          ...formData,
          createdBy: local_service?.get_staff_id(),
          scheduledAt: '2026-06-02T13:48:00',
          frequencyUnit: Number(formData?.frequencyUnit),
          frequencyValue: Number(formData?.frequencyValue),
          maxRetryCount: Number(formData?.maxRetryCount),

          //   effectiveFromDate: formData.effectiveFromDate + 'T00:00:00',
          //   effectiveToDate: formData.effectiveToDate + 'T00:00:00',
        }
        const res = await notificationservice.createNotificationCampaign(payload)
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

  const handleChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value })
    if (errors[key]) {
      setErrors({ ...errors, [key]: '' })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editData ? 'Edit Notification Campaign' : 'Add Notification Campaign'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Campaign Name"
              required
              value={formData.campaignName}
              onChange={(e) => handleChange('campaignName', e.target.value)}
            />
          </Grid>

          <Grid item xs={6}>
            <Autocomplete
              options={targetTypes}
              value={targetTypes.find((c: any) => c.value === formData.targetType) || null}
              getOptionLabel={(option: any) => option.label}
              isOptionEqualToValue={(option: any, value: any) => option.value === value.value}
              onChange={(_, newValue) => {
                handleChange('targetType', newValue?.value)
              }}
              renderInput={(params) => <TextField {...params} required label="Target Type" fullWidth />}
            />
          </Grid>
          <Grid item xs={6}>
            <Autocomplete
              options={notificationsData}
              value={notificationsData.find((p: any) => p.notificationTypeCode === formData.notificationTypeCode) || null}
              getOptionLabel={(option: any) => option.notificationTypeCode}
              isOptionEqualToValue={(option: any, value: any) => option.notificationTypeCode === value.notificationTypeCode}
              onChange={(_, newValue) => {
                setFormData({ ...formData, notificationTypeCode: newValue ? newValue.notificationTypeCode : '' })
              }}
              renderInput={(params) => <TextField required {...params} label="Notification Type" fullWidth />}
            />
          </Grid>

          <Grid item xs={6}>
            <Autocomplete
              options={countriesData}
              value={countriesData.find((c: any) => c.countryCode === formData.countryCode) || null}
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
              options={freqTypes}
              value={freqTypes.find((c: any) => c.value === formData.frequencyType) || null}
              getOptionLabel={(option: any) => option.label}
              isOptionEqualToValue={(option: any, value: any) => option.value === value.value}
              onChange={(_, newValue) => {
                handleChange('frequencyType', newValue?.value)
              }}
              renderInput={(params) => <TextField {...params} required label="Frequency Type" fullWidth />}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Max Retry Count"
              required
              value={formData.maxRetryCount}
              type="number"
              onChange={(e) => handleChange('maxRetryCount', e.target.value)}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Frequency Value"
              required
              type="number"
              value={formData.frequencyValue}
              onChange={(e) => handleChange('frequencyValue', e.target.value)}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Frequency Unit"
              required
              type="number"
              value={formData.frequencyUnit}
              onChange={(e) => handleChange('frequencyUnit', e.target.value)}
            />
          </Grid>

          {/* <Grid item xs={12}>
            <TextField
              fullWidth
              label="Frequency Value"
              required
              value={formData.frequencyValue}
              multiline={true}
              onChange={(e) => handleChange('frequencyValue', e.target.value)}
            />
          </Grid> */}

          <Grid item xs={6}>
            <DynamicDatePicker label="Start Date" value={formData.startDate} onChange={(val: string) => handleChange('startDate', val)} required />
          </Grid>

          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="End Date"
              value={formData.endDate}
              minDate={formData.endDate}
              onChange={(val: string) => handleChange('endDate', val)}
              required
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
