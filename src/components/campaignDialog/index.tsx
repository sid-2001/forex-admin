import React, { useEffect, useState, useCallback } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Autocomplete } from '@mui/material'
import { LocalStorageService } from '@/helpers/local-storage-service'
import NotificationService from '@/services/notification.service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import SequenceApiService from '@/services/sequence.api.service'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { targetTypes, freqTypes, notificationStatus } from '@/contants/utils'

export default function NotificationCampaignDialog({ open, editData, onClose, refreshList, showAlert }: any) {
  const local_service = new LocalStorageService()
  const notificationservice = new NotificationService()
  const sequenceService = new SequenceApiService()

  const initialFormState = {
    campaignName: '',
    notificationTypeCode: '',
    targetType: '',
    startDate: '',
    endDate: '',
    frequencyType: '',
    maxRetryCount: 0,
    countryCode: '',
    targetCountry: 'IN',
    frequencyValue: 0,
    frequencyUnit: '',
    scheduledAt: '',
    // status: '',
  }

  const [formData, setFormData] = useState<any>(initialFormState)
  const [countriesData, setCountryCorridorsData] = useState([])
  const [notificationsData, setNotificationsData] = useState([])
  const [errors, setErrors] = useState<any>({})
  const frequencyUnitList = [
    { label: 'HOURS', value: 'HOURS' },
    { label: 'DAYS', value: 'DAYS' },
  ]

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        scheduledAt: editData?.schedule?.scheduledAt?.split('T').join(' '),
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
    const mandatoryFields = [
      'countryCode',
      'endDate',
      'startDate',
      'campaignName',
      'notificationTypeCode',
      'targetType',
      'frequencyType',
      'maxRetryCount',
      'targetCountry',
      //   'frequencyValue',
      //   'frequencyUnit',
      'scheduledAt',
    ]

    const isFormIncomplete = mandatoryFields.some((field) => !formData[field] || formData[field].toString().trim() === '')

    if (isFormIncomplete) {
      showAlert('error', 'Please fill in all mandatory fields before saving.')
      return
    }

    // 2. Proceed with API call
    try {
      if (editData) {
        const res = await notificationservice.updateNotificationCampaign(editData.campaignId, {
          campaignName: formData?.campaignName,
          notificationTypeCode: formData?.notificationTypeCode,
          targetType: formData?.targetType,
          startDate: formData?.startDate,
          endDate: formData?.endDate,
          frequencyType: formData?.frequencyType,
          maxRetryCount: formData?.maxRetryCount,
          countryCode: formData?.countryCode,
          targetCountry: formData?.targetCountry,
          frequencyValue: formData?.frequencyValue,
          frequencyUnit: formData?.frequencyUnit,
          modifiedBy: local_service?.get_staff_id(),
          scheduledAt: formData.scheduledAt?.format('YYYY-MM-DDTHH:mm:ss'),
          //  status: formData?.status,
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
          scheduledAt: formData.scheduledAt?.format('YYYY-MM-DDTHH:mm:ss'),
        }
        const res = await notificationservice.createNotificationCampaign(payload)
        console.log(res, 'response')
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

          <Grid item xs={4}>
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
          <Grid item xs={4}>
            <Autocomplete
              options={countriesData}
              value={countriesData.find((c: any) => c.countryCode === formData.targetCountry) || null}
              getOptionLabel={(option: any) => `${option.countryName} (${option.countryCode})` || ''}
              isOptionEqualToValue={(option: any, value: any) => option.countryCode === value.countryCode}
              onChange={(_, newValue) => {
                handleChange('targetCountry', newValue?.countryCode)
              }}
              renderInput={(params) => <TextField {...params} required label="Target Country" fullWidth />}
            />
          </Grid>
          <Grid item xs={4}>
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
          <Grid item xs={6}>
            <Autocomplete
              options={notificationsData}
              value={notificationsData.find((p: any) => p.notificationTypeCode === formData.notificationTypeCode) || null}
              getOptionLabel={(option: any) => `${option.notificationContent} (${option.notificationTypeCode})`}
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
            <DynamicDatePicker label="Start Date" value={formData.startDate} onChange={(val: string) => handleChange('startDate', val)} required />
          </Grid>

          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="End Date"
              value={formData.endDate}
              minDate={formData.startDate}
              onChange={(val: string) => handleChange('endDate', val)}
              required
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Max Retry Count"
              required
              value={formData.maxRetryCount}
              type="number"
              inputProps={{ min: 0 }}
              onKeyDown={(e) => {
                if (e.key === '-') {
                  e.preventDefault()
                }
              }}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || Number(value) >= 0) {
                  handleChange('maxRetryCount', Number(value))
                }
              }}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Frequency Value"
              type="number"
              value={formData.frequencyValue}
              inputProps={{ min: 0 }}
              onKeyDown={(e) => {
                if (e.key === '-') {
                  e.preventDefault()
                }
              }}
              disabled={formData?.frequencyType !== 'INTERVAL'}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || Number(value) >= 0) {
                  handleChange('frequencyValue', Number(value))
                }
              }}
            />
          </Grid>

          <Grid item xs={4}>
            <Autocomplete
              options={frequencyUnitList}
              value={frequencyUnitList.find((c: any) => c.value === formData.frequencyUnit) || null}
              getOptionLabel={(option: any) => option.label}
              isOptionEqualToValue={(option: any, value: any) => option.value === value.value}
              disabled={formData?.frequencyType !== 'INTERVAL'}
              onChange={(_, newValue) => {
                setFormData({ ...formData, frequencyUnit: newValue ? newValue.value : '' })
              }}
              renderInput={(params) => <TextField {...params} required label="Frequency Unit" fullWidth />}
            />
          </Grid>

          <Grid item xs={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Select Scheduled Date and Time"
                value={formData?.scheduledAt ? dayjs(formData.scheduledAt) : null}
                onChange={(newValue) => handleChange('scheduledAt', dayjs(newValue))}
                disablePast
                views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                ampm={false}
                format="YYYY-MM-DD HH:mm:ss"
                timeSteps={{
                  hours: 1,
                  minutes: 1,
                  seconds: 1,
                }}
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true,
                    // error: !formData?.scheduledAt,
                    // helperText: !formData?.scheduledAt ? 'Date & Time is required' : '',
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={6}>
            <Autocomplete
              options={notificationStatus}
              value={notificationStatus.find((c: any) => c.value === formData.status) || null}
              getOptionLabel={(option: any) => option.label}
              isOptionEqualToValue={(option: any, value: any) => option.value === value.value}
              onChange={(_, newValue) => {
                handleChange('status', newValue?.value)
              }}
              disabled={!editData}
              renderInput={(params) => <TextField {...params} required label="Status" fullWidth />}
              getOptionDisabled={(option) => option.disabled}
              renderOption={(props, option) => (
                <li
                  {...props}
                  style={{
                    opacity: option.disabled ? 0.5 : 1,
                  }}
                >
                  {option.label}
                </li>
              )}
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
