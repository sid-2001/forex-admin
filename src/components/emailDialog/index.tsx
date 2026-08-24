import React, { useEffect, useState, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  IconButton,
  Paper,
  Typography,
  Divider,
  Box,
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  Alert,
  MenuItem,
} from '@mui/material'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import SequenceApiService from '@/services/sequence.api.service'
import MasterService from '@/services/master.service'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import SaveIcon from '@mui/icons-material/Save'
import UpdateIcon from '@mui/icons-material/Update'

export default function ReportEmailDialog({ open, editData, onClose, refreshList, showAlert }: any) {
  const local_service = new LocalStorageService()
  const master_service = new MasterService()
  const sequenceService = new SequenceApiService()

  const initialFormState = {
    countryCode: '',
    reportName: '',
    subject: '',
    action: '',
    moduleFeatureCode: '',
    emailCount: 0,
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
    createdBy: '',
    emailDetails: [] as any[],
  }

  const [formData, setFormData] = useState<any>(initialFormState)
  const [errors, setErrors] = useState<any>({})
  const [countries, setcountries] = useState([])
  const [emailDetailsErrors, setEmailDetailsErrors] = useState<any>({})
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [updateProgress, setUpdateProgress] = useState<{ total: number; completed: number } | null>(null)
  const [tableMasterList, setTableMasterList] = useState([])

  useEffect(() => {
    if (editData) {
      console.log(editData, 'bhanu')
      // Extract just the country code from "UAE (United Arab Emirates)"
      let countryCode = editData.countryCode || ''
      // If countryCode contains parentheses, extract just the code
      if (countryCode.includes('(')) {
        countryCode = countryCode.split('(')[0].trim()
      }

      // For edit, populate from existing data
      setFormData({
        ...editData,
        countryCode: countryCode, // Use the extracted code
        emailCount: editData.emailDetails.length || 0,
        effectiveFromDate: editData.effectiveFromDate?.split('T')[0] || '',
        effectiveToDate: editData.effectiveToDate?.split('T')[0] || '',
        emailDetails:
          editData.emailDetails?.map((detail: any) => ({
            ...detail,
            effectiveFromDate: detail.effectiveFromDate?.split('T')[0] || '',
            effectiveToDate: detail.effectiveToDate?.split('T')[0] || '9999-12-31',
            // active: detail.active !== undefined ? detail.active : true,
          })) || [],
      })
    } else {
      // For new FAQ
      const staffId = local_service?.get_staff_id() || 'admin'
      setFormData({
        ...initialFormState,
        createdBy: staffId,
        effectiveFromDate: '',
        effectiveToDate: '',
        emailDetails: [],
      })
    }
  }, [editData, open])

  useEffect(() => {
    fetchCountryCodes()
    fetchTableTypeList()
  }, [])

  const fetchTableTypeList = useCallback(async () => {
    const res: any = await sequenceService.getModuleTypeList()
    setTableMasterList(res || [])
  }, [])

  const fetchCountryCodes = useCallback(async () => {
    const res: any = await sequenceService.getActiveCountryCorridors()
    setcountries(res || [])
  }, [])

  const initializeEmailReportDetails = (count: number) => {
    const currentDetails = formData.emailDetails || []
    const newDetails = [...currentDetails]

    while (newDetails.length < count) {
      newDetails.push({
        firstName: '',
        lastName: '',
        middleName: '',
        emailId: '',
        fullName: '',
        effectiveFromDate: formData.effectiveFromDate || '',
        effectiveToDate: formData.effectiveToDate || '9999-12-31',
        active: true,
      })
    }

    while (newDetails.length > count) {
      newDetails.pop()
    }

    setFormData((prev: any) => ({
      ...prev,
      emailDetails: newDetails,
      emailCount: count,
    }))
  }

  const handleEmailCountChange = (value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      const count = parseInt(value) || 0
      setFormData((prev: any) => ({ ...prev, emailCount: count }))
      initializeEmailReportDetails(count)
    }
  }

  const handleEmailDetailChange = (index: number, field: string, value: any) => {
    const updatedDetails = [...(formData.emailDetails || [])]
    updatedDetails[index] = { ...updatedDetails[index], [field]: value }
    setFormData({ ...formData, emailDetails: updatedDetails })

    if (emailDetailsErrors[index]?.[field]) {
      const newErrors = { ...emailDetailsErrors }
      delete newErrors[index]?.[field]
      if (Object.keys(newErrors[index] || {}).length === 0) {
        delete newErrors[index]
      }
      setEmailDetailsErrors(newErrors)
    }
  }

  const addEmailDetail = () => {
    const newDetails = [...(formData.emailDetails || [])]
    newDetails.push({
      effectiveFromDate: formData.effectiveFromDate || '',
      effectiveToDate: formData.effectiveToDate || '9999-12-31',
      active: false,
      salutation: '',
      firstName: '',
      middleName: '',
      lastName: '',
      fullName: '',
      emailId: '',
    })
    setFormData({
      ...formData,
      emailDetails: newDetails,
      emailCount: newDetails.length,
    })
  }

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (deleteIndex !== null) {
      const newDetails = [...(formData.emailDetails || [])]
      newDetails.splice(deleteIndex, 1)
      setFormData({
        ...formData,
        emailDetails: newDetails,
        faqQuestionCount: newDetails.length,
      })
      setDeleteConfirmOpen(false)
      setDeleteIndex(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false)
    setDeleteIndex(null)
  }

  const validateEmailDetails = () => {
    const detailsErrors: any = {}
    let hasErrors = false

    formData.emailDetails?.forEach((detail: any, index: number) => {
      const detailErrors: any = {}

      if (!detail.salutation || detail.salutation.trim() === '') {
        detailErrors.salutation = 'Salutation is required'
        hasErrors = true
      }

      if (!detail.firstName || detail.firstName.trim() === '') {
        detailErrors.firstName = 'FirstName is required'
        hasErrors = true
      }

      if (!detail.lastName || detail.lastName.trim() === '') {
        detailErrors.lastName = 'LastName is required'
        hasErrors = true
      }
      if (!detail.fullName || detail.fullName.trim() === '') {
        detailErrors.fullName = 'FullName is required'
        hasErrors = true
      }
      if (!detail.emailId || detail.emailId.trim() === '') {
        detailErrors.emailId = 'Email Id is required'
        hasErrors = true
      }

      if (!detail.effectiveFromDate || detail.effectiveFromDate.trim() === '') {
        detailErrors.effectiveFromDate = 'Effective From date is required'
        hasErrors = true
      }

      if (!detail.effectiveToDate || detail.effectiveToDate.trim() === '') {
        detailErrors.effectiveToDate = 'Effective To date is required'
        hasErrors = true
      }

      if (Object.keys(detailErrors).length > 0) {
        detailsErrors[index] = detailErrors
      }
    })

    setEmailDetailsErrors(detailsErrors)
    return !hasErrors
  }

  const handleSubmit = async () => {
    const mandatoryFields = ['countryCode', 'reportName', 'subject', 'moduleFeatureCode', 'action', 'effectiveFromDate', 'effectiveToDate']

    const isFormIncomplete = mandatoryFields.some((field) => !formData[field] || formData[field].toString().trim() === '')

    if (isFormIncomplete) {
      showAlert('error', 'Please fill in all mandatory fields before saving.')
      return
    }

    // if (!validateEmailDetails()) {
    //   showAlert('error', 'Please fill in all details and dates.')
    //   return
    // }

    setLoading(true)

    try {
      if (editData) {
        // UPDATE MODE - Update the entire FAQ head
        await handleUpdate()
      } else {
        // CREATE MODE - Create new FAQ
        await handleCreate()
      }
    } catch (error: any) {
      console.error('Error saving details:', error)
      showAlert('error', error?.message || error?.toString() || 'Operation failed')
    } finally {
      setLoading(false)
      setUpdateProgress(null)
    }
  }

  const handleCreate = async () => {
    console.log(formData, '--------------')
    const payload = {
      ...formData,
      createdBy: formData.createdBy || 'admin',
      effectiveFromDate: formData.effectiveFromDate + 'T00:00:00',
      effectiveToDate: formData.effectiveToDate + 'T00:00:00',
      emailDetails: formData.emailDetails?.map((detail: any) => ({
        ...detail,
        effectiveFromDate: detail.effectiveFromDate + 'T00:00:00',
        effectiveToDate: detail.effectiveToDate + 'T00:00:00',
        active: detail.active !== undefined ? detail.active : true,
      })),
    }

    delete payload.emailCount

    const res = await master_service.createEmailDetail(payload)

    if (res.status) {
      showAlert('success', res.message)
      refreshList()
      onClose()
    } else {
      showAlert('error', res.message || 'Failed to create Details')
    }
  }

  const handleUpdate = async () => {
    // Build payload matching the working curl structure
    const userId = local_service?.get_staff_id() || 'admin'
    const updatePayload = {
      ...formData,
      modifiedBy: userId,
      effectiveFromDate: formData.effectiveFromDate + 'T00:00:00',
      effectiveToDate: formData.effectiveToDate + 'T00:00:00',
      emailDetails: formData.emailDetails?.map((detail: any) => ({
        ...detail,
        effectiveFromDate: detail.effectiveFromDate + 'T00:00:00',
        effectiveToDate: detail.effectiveToDate + 'T00:00:00',
        active: detail.active !== undefined ? detail.active : true,
      })),
    }

    try {
      // Use master_service instead of direct fetch
      const response = await master_service.updateEmailDetail(editData.countryModuleReportEmailHeadCode, updatePayload)

      console.log('Update response:', response)

      if (response && response.status !== false) {
        showAlert('success', response.message)
        refreshList()
        onClose()
      } else {
        showAlert('error', response?.message || 'Failed to update Details')
      }
    } catch (error: any) {
      console.error('Error updating details:', error)
      showAlert('error', error?.message || 'Operation failed')
    }
  }

  const handleChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value })
    if (errors[key]) {
      setErrors({ ...errors, [key]: '' })
    }
  }

  // Determine if this is edit mode
  const isEditMode = !!editData

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isEditMode ? (
            <>
              <UpdateIcon color="primary" />
              Edit Module Report: {editData?.countryModuleReportEmailHeadCode}
            </>
          ) : (
            'Add New Module Report'
          )}
        </DialogTitle>
        <DialogContent dividers>
          {/* Show update progress if updating */}
          {updateProgress && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Updating Module Report Details... {updateProgress.completed}/{updateProgress.total} completed
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Autocomplete
                options={countries}
                value={countries.find((c: any) => c.countryCode === formData.countryCode) || null}
                getOptionLabel={(option: any) => `${option.countryName} (${option.countryCode})` || ''}
                isOptionEqualToValue={(option: any, value: any) => option.countryCode === value.countryCode}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, countryCode: newValue ? newValue.countryCode : '' })
                }}
                renderInput={(params) => <TextField {...params} label="Country" fullWidth required />}
              />
            </Grid>

            <Grid item xs={6}>
              <Autocomplete
                options={tableMasterList}
                value={tableMasterList.find((c: any) => c.moduleFeatureCode === formData.moduleFeatureCode) || null}
                getOptionLabel={(option: any) => `${option.moduleFeatureName} (${option.moduleFeatureCode})` || ''}
                isOptionEqualToValue={(option: any, value: any) => option.moduleFeatureCode === value.moduleFeatureCode}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, moduleFeatureCode: newValue ? newValue.moduleFeatureCode : '' })
                }}
                renderInput={(params) => <TextField {...params} label="Module Feature Type" fullWidth required />}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Report Name"
                required
                value={formData.reportName}
                inputProps={{ maxLength: 50 }}
                onChange={(e) => handleChange('reportName', e.target.value)}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Action"
                required
                value={formData.action}
                onChange={(e) => handleChange('action', e.target.value)}
                helperText="Select action"
              >
                <MenuItem value="M">Manual (M)</MenuItem>
                <MenuItem value="A">Auto (A)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                required
                value={formData.subject}
                inputProps={{ maxLength: 100 }}
                onChange={(e) => handleChange('subject', e.target.value)}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Email Count"
                value={formData.emailCount}
                onChange={(e) => handleEmailCountChange(e.target.value)}
                placeholder="Enter number of email report count details"
                // helperText="Enter the number of email report count details"
                //  disabled={isEditMode} // Disable count change in edit mode
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={<Checkbox checked={formData.active} onChange={(e) => handleChange('active', e.target.checked)} color="primary" />}
                label="Active Status"
              />
            </Grid>

            <Grid item xs={6}>
              <DynamicDatePicker
                label="Effective From"
                value={formData.effectiveFromDate}
                onChange={(val: string) => {
                  setFormData({ ...formData, effectiveFromDate: val })
                  if (formData.emailDetails) {
                    const updatedDetails = formData.emailDetails.map((detail: any) => ({
                      ...detail,
                      effectiveFromDate: val,
                    }))
                    setFormData((prev: any) => ({ ...prev, emailDetails: updatedDetails }))
                  }
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
                  if (formData.emailDetails) {
                    const updatedDetails = formData.emailDetails.map((detail: any) => ({
                      ...detail,
                      effectiveToDate: val,
                    }))
                    setFormData((prev: any) => ({ ...prev, emailDetails: updatedDetails }))
                  }
                }}
                error={!!errors.effectiveToDate}
                helperText={errors.effectiveToDate}
                required
              />
            </Grid>

            {/* FAQ Details Section */}
            {formData.emailDetails && formData.emailDetails.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="h6" color="primary">
                    Email Details
                    {isEditMode && (
                      <Typography component="span" variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                        (Updates will be saved individually)
                      </Typography>
                    )}
                  </Typography>
                </Divider>

                <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
                  {formData.emailDetails.map((detail: any, index: number) => (
                    <Paper
                      key={index}
                      elevation={2}
                      sx={{
                        p: 2,
                        mb: 2,
                        backgroundColor: index % 2 === 0 ? 'background.default' : 'background.paper',
                        border: emailDetailsErrors[index] ? '1px solid #f44336' : 'none',
                        position: 'relative',
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" color="primary">
                              Module Report #{index + 1}
                            </Typography>
                            {detail.faqDetailCode && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '10px' }}>
                                ID: {detail.countryModuleReportEmailDetailCode}
                              </Typography>
                            )}
                          </Box>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(index)}
                            disabled={formData.emailDetails.length <= 1}
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Grid>

                        <Grid item xs={3}>
                          <TextField
                            select
                            fullWidth
                            label="Salutation"
                            required
                            value={formData.salutation}
                            onChange={(e) => handleEmailDetailChange(index, 'salutation', e.target.value)}
                            helperText="Select salutation"
                          >
                            <MenuItem value="Mr">Mr</MenuItem>
                            <MenuItem value="Mrs">Mrs</MenuItem>
                          </TextField>
                        </Grid>

                        <Grid item xs={3}>
                          <TextField
                            fullWidth
                            label={`First Name`}
                            required
                            value={detail.firstName}
                            inputProps={{ maxLength: 50 }}
                            onChange={(e) => handleEmailDetailChange(index, 'firstName', e.target.value)}
                            error={!!emailDetailsErrors[index]?.firstName}
                            helperText={emailDetailsErrors[index]?.firstName}
                          />
                        </Grid>

                        <Grid item xs={3}>
                          <TextField
                            fullWidth
                            label={`Middle Name`}
                            value={detail.middleName}
                            inputProps={{ maxLength: 50 }}
                            onChange={(e) => handleEmailDetailChange(index, 'middleName', e.target.value)}
                            error={!!emailDetailsErrors[index]?.middleName}
                            helperText={emailDetailsErrors[index]?.middleName}
                          />
                        </Grid>

                        <Grid item xs={3}>
                          <TextField
                            fullWidth
                            label={`Last Name`}
                            required
                            value={detail.lastName}
                            inputProps={{ maxLength: 50 }}
                            onChange={(e) => handleEmailDetailChange(index, 'lastName', e.target.value)}
                            error={!!emailDetailsErrors[index]?.lastName}
                            helperText={emailDetailsErrors[index]?.lastName}
                          />
                        </Grid>

                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label={`Full Name ${index + 1}`}
                            required
                            value={detail.fullName}
                            inputProps={{ maxLength: 100 }}
                            onChange={(e) => handleEmailDetailChange(index, 'fullName', e.target.value)}
                            error={!!emailDetailsErrors[index]?.fullName}
                            helperText={emailDetailsErrors[index]?.fullName}
                          />
                        </Grid>

                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label={`Email ${index + 1}`}
                            required
                            value={detail.emailId}
                            inputProps={{ maxLength: 100 }}
                            // onChange={(e) => handleEmailDetailChange(index, 'emailId', e.target.value)}
                            onChange={(e) => {
                              const value = e.target.value
                              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

                              // Validate and update
                              if (!emailRegex.test(value)) {
                                setEmailDetailsErrors({ emailId: 'Invalid email format' })
                              } else {
                                setEmailDetailsErrors({ emailId: '' })
                              }
                              handleEmailDetailChange(index, 'emailId', e.target.value) // Call your existing handler
                            }}
                            type="email"
                            error={!!emailDetailsErrors[index]?.emailId}
                            helperText={emailDetailsErrors[index]?.emailId}
                          />
                        </Grid>

                        <Grid item xs={6}>
                          <DynamicDatePicker
                            label={`Effective From`}
                            value={detail.effectiveFromDate}
                            onChange={(val: string) => handleEmailDetailChange(index, 'effectiveFromDate', val)}
                            error={!!emailDetailsErrors[index]?.effectiveFromDate}
                            helperText={emailDetailsErrors[index]?.effectiveFromDate}
                            required
                          />
                        </Grid>

                        <Grid item xs={6}>
                          <DynamicEndDatePicker
                            label={`Effective To`}
                            value={detail.effectiveToDate}
                            minDate={detail.effectiveFromDate}
                            onChange={(val: string) => handleEmailDetailChange(index, 'effectiveToDate', val)}
                            error={!!emailDetailsErrors[index]?.effectiveToDate}
                            helperText={emailDetailsErrors[index]?.effectiveToDate}
                            required
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={detail.active !== false}
                                onChange={(e) => handleEmailDetailChange(index, 'active', e.target.checked)}
                                color="primary"
                                size="small"
                              />
                            }
                            label="Active"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Box>

                <Button variant="outlined" startIcon={<AddIcon />} onClick={addEmailDetail} sx={{ mt: 1 }} fullWidth>
                  Add Email Detail
                </Button>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit" disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            color="primary"
            disabled={loading}
            startIcon={isEditMode ? <UpdateIcon /> : <SaveIcon />}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <MuiDialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <MuiDialogTitle>Confirm Delete</MuiDialogTitle>
        <MuiDialogContent>
          <Typography>Are you sure you want to delete this Email Detail?</Typography>
        </MuiDialogContent>
        <MuiDialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            No
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Yes, Delete
          </Button>
        </MuiDialogActions>
      </MuiDialog>
    </>
  )
}
