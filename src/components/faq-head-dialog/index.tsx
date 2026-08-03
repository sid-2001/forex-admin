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
} from '@mui/material'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import SequenceApiService from '@/services/sequence.api.service'
import MasterService from '@/services/master.service'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import SaveIcon from '@mui/icons-material/Save'
import UpdateIcon from '@mui/icons-material/Update'

export default function FAQHeadDialog({ open, editData, onClose, refreshList, showAlert }: any) {
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
    faqQuestionCount: 0,
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
    createdBy: '',
    faqDetails: [] as any[],
  }

  const [formData, setFormData] = useState<any>(initialFormState)
  const [errors, setErrors] = useState<any>({})
  const [countries, setcountries] = useState([])
  const [faqDetailsErrors, setFaqDetailsErrors] = useState<any>({})
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [updateProgress, setUpdateProgress] = useState<{ total: number; completed: number } | null>(null)

  useEffect(() => {
    if (editData) {
      // For edit, populate from existing data
      setFormData({
        countryCode: editData.countryCode || '',
        faqChannel: editData.faqChannel || '',
        faqSectionLabelName: editData.faqSectionLabelName || '',
        faqSectionDescription: editData.faqSectionDescription || '',
        faqSubSectionLabelName: editData.faqSubSectionLabelName || '',
        faqSubSectionDescription: editData.faqSubSectionDescription || '',
        faqType: editData.faqType || '',
        faqQuestionCount: editData.faqQuestionCount || 0,
        active: editData.active !== undefined ? editData.active : true,
        effectiveFromDate: editData.effectiveFromDate?.split('T')[0] || '',
        effectiveToDate: editData.effectiveToDate?.split('T')[0] || '',
        createdBy: editData.createdBy || local_service?.get_staff_id() || 'admin',
        faqDetails:
          editData.faqDetailMasters?.map((detail: any) => ({
            faqDetailCode: detail.faqDetailCode, // Keep for update
            faqQuestion: detail.faqQuestion || '',
            faqAnswer: detail.faqAnswer || '',
            effectiveFromDate: detail.effectiveFromDate?.split('T')[0] || '',
            effectiveToDate: detail.effectiveToDate?.split('T')[0] || '9999-12-31',
            active: detail.active !== undefined ? detail.active : true,
            isNew: false, // Flag to identify existing records
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
        faqDetails: [],
      })
    }
  }, [editData, open])

  useEffect(() => {
    fetchCountryCodes()
  }, [])

  const fetchCountryCodes = useCallback(async () => {
    const res: any = await sequenceService.getActiveCountryCorridors()
    setcountries(res || [])
  }, [])

  const initializeFaqDetails = (count: number) => {
    const currentDetails = formData.faqDetails || []
    const newDetails = [...currentDetails]

    while (newDetails.length < count) {
      newDetails.push({
        faqQuestion: '',
        faqAnswer: '',
        effectiveFromDate: formData.effectiveFromDate || '',
        effectiveToDate: formData.effectiveToDate || '9999-12-31',
        active: true,
        isNew: true,
      })
    }

    while (newDetails.length > count) {
      newDetails.pop()
    }

    setFormData((prev: any) => ({
      ...prev,
      faqDetails: newDetails,
      faqQuestionCount: count,
    }))
  }

  const handleQuestionCountChange = (value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      const count = parseInt(value) || 0
      setFormData((prev: any) => ({ ...prev, faqQuestionCount: count }))
      initializeFaqDetails(count)
    }
  }

  const handleFaqDetailChange = (index: number, field: string, value: any) => {
    const updatedDetails = [...(formData.faqDetails || [])]
    updatedDetails[index] = { ...updatedDetails[index], [field]: value }
    setFormData({ ...formData, faqDetails: updatedDetails })

    if (faqDetailsErrors[index]?.[field]) {
      const newErrors = { ...faqDetailsErrors }
      delete newErrors[index]?.[field]
      if (Object.keys(newErrors[index] || {}).length === 0) {
        delete newErrors[index]
      }
      setFaqDetailsErrors(newErrors)
    }
  }

  const addFaqDetail = () => {
    const newDetails = [...(formData.faqDetails || [])]
    newDetails.push({
      faqQuestion: '',
      faqAnswer: '',
      effectiveFromDate: formData.effectiveFromDate || '',
      effectiveToDate: formData.effectiveToDate || '9999-12-31',
      active: true,
      isNew: true,
    })
    setFormData({
      ...formData,
      faqDetails: newDetails,
      faqQuestionCount: newDetails.length,
    })
  }

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (deleteIndex !== null) {
      const newDetails = [...(formData.faqDetails || [])]
      newDetails.splice(deleteIndex, 1)
      setFormData({
        ...formData,
        faqDetails: newDetails,
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

  const validateFaqDetails = () => {
    const detailsErrors: any = {}
    let hasErrors = false

    formData.faqDetails?.forEach((detail: any, index: number) => {
      const detailErrors: any = {}

      if (!detail.faqQuestion || detail.faqQuestion.trim() === '') {
        detailErrors.faqQuestion = 'FAQ Question is required'
        hasErrors = true
      }

      if (!detail.faqAnswer || detail.faqAnswer.trim() === '') {
        detailErrors.faqAnswer = 'FAQ Answer is required'
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

    setFaqDetailsErrors(detailsErrors)
    return !hasErrors
  }

  const handleSubmit = async () => {
    const mandatoryFields = [
      'countryCode',
      'faqSectionLabelName',
      'faqSectionDescription',
      'faqSubSectionLabelName',
      'faqSubSectionDescription',
      'faqType',
      'effectiveFromDate',
      'effectiveToDate',
    ]

    const isFormIncomplete = mandatoryFields.some((field) => !formData[field] || formData[field].toString().trim() === '')

    if (isFormIncomplete) {
      showAlert('error', 'Please fill in all mandatory fields before saving.')
      return
    }

    if (!validateFaqDetails()) {
      showAlert('error', 'Please fill in all FAQ questions, answers, and dates.')
      return
    }

    setLoading(true)

    try {
      if (editData) {
        // UPDATE MODE - Update each FAQ Detail individually
        await handleUpdate()
      } else {
        // CREATE MODE - Create new FAQ
        await handleCreate()
      }
    } catch (error: any) {
      console.error('Error saving FAQ:', error)
      showAlert('error', error?.message || error?.toString() || 'Operation failed')
    } finally {
      setLoading(false)
      setUpdateProgress(null)
    }
  }

  const handleCreate = async () => {
    const payload = {
      countryCode: formData.countryCode,
      faqChannel: formData.faqChannel.toUpperCase(),
      faqSectionLabelName: formData.faqSectionLabelName,
      faqSectionDescription: formData.faqSectionDescription,
      faqSubSectionLabelName: formData.faqSubSectionLabelName,
      faqSubSectionDescription: formData.faqSubSectionDescription,
      faqType: formData.faqType,
      faqQuestionCount: Number(formData.faqQuestionCount),
      createdBy: formData.createdBy || 'admin',
      effectiveFromDate: formData.effectiveFromDate + 'T00:00:00',
      effectiveToDate: formData.effectiveToDate + 'T00:00:00',
      faqDetails: formData.faqDetails?.map((detail: any) => ({
        faqQuestion: detail.faqQuestion,
        faqAnswer: detail.faqAnswer,
        effectiveFromDate: detail.effectiveFromDate + 'T00:00:00',
        effectiveToDate: detail.effectiveToDate + 'T00:00:00',
        active: detail.active !== undefined ? detail.active : true,
      })),
    }

    const res = await master_service.createFaq(payload)

    if (res.status) {
      showAlert('success', res.message || 'FAQ created successfully')
      refreshList()
      onClose()
    } else {
      showAlert('error', res.message || 'Failed to create FAQ')
    }
  }

  const handleUpdate = async () => {
    const userId = local_service?.get_staff_id() || 'admin'
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dubai'

    // Separate existing and new FAQ details
    const existingDetails = formData.faqDetails.filter((d: any) => !d.isNew && d.faqDetailCode)
    const newDetails = formData.faqDetails.filter((d: any) => d.isNew || !d.faqDetailCode)

    // Update existing details
    const updatePromises = existingDetails.map(async (detail: any) => {
      const updatePayload = {
        faqQuestion: detail.faqQuestion,
        faqAnswer: detail.faqAnswer,
        active: detail.active !== undefined ? detail.active : true,
        effectiveFromDate: detail.effectiveFromDate + 'T00:00:00',
        effectiveToDate: detail.effectiveToDate + 'T00:00:00',
        modifiedBy: userId,
      }

      try {
        const response = await master_service.updateFaqDetail(detail.faqDetailCode, updatePayload)
        return { success: true, detail, response }
      } catch (error) {
        console.error(`Failed to update FAQ detail ${detail.faqDetailCode}:`, error)
        return { success: false, detail, error }
      }
    })

    // Create new details (you'll need to add this to your MasterService)
    const createPromises = newDetails.map(async (detail: any) => {
      const createPayload = {
        faqHeadCode: editData.faqHeadCode,
        faqQuestion: detail.faqQuestion,
        faqAnswer: detail.faqAnswer,
        active: detail.active !== undefined ? detail.active : true,
        effectiveFromDate: detail.effectiveFromDate + 'T00:00:00',
        effectiveToDate: detail.effectiveToDate + 'T00:00:00',
        createdBy: userId,
      }

      // You'll need to implement this method
      try {
        const response = await master_service.createFaqDetail(createPayload)
        return { success: true, detail, response }
      } catch (error) {
        console.error('Failed to create new FAQ detail:', error)
        return { success: false, detail, error }
      }
    })

    // Execute all updates and creates
    const allPromises = [...updatePromises, ...createPromises]
    setUpdateProgress({ total: allPromises.length, completed: 0 })

    const results = await Promise.allSettled(allPromises)

    const successCount = results.filter((r) => r.status === 'fulfilled' && r.value.success).length
    const failureCount = results.length - successCount

    // Update progress
    results.forEach((_, index) => {
      setUpdateProgress({ total: results.length, completed: index + 1 })
    })

    if (failureCount === 0) {
      showAlert('success', `All ${successCount} FAQ details updated successfully`)
      refreshList()
      onClose()
    } else if (successCount > 0) {
      showAlert('warning', `${successCount} updated successfully, ${failureCount} failed. Please check logs.`)
      refreshList()
      // Optionally keep modal open
    } else {
      showAlert('error', 'Failed to update FAQ details. Please try again.')
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
              Edit FAQ: {editData?.faqHeadCode}
            </>
          ) : (
            'Add New FAQ'
          )}
        </DialogTitle>
        <DialogContent dividers>
          {/* Show update progress if updating */}
          {updateProgress && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Updating FAQ details... {updateProgress.completed}/{updateProgress.total} completed
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
              <TextField
                fullWidth
                label="FAQ Channel"
                required
                value={formData.faqChannel}
                onChange={(e) => handleChange('faqChannel', e.target.value)}
                helperText="Use uppercase: M (Mobile), W (Web), or A (App)"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="FAQ Section Label Name"
                required
                value={formData.faqSectionLabelName}
                onChange={(e) => handleChange('faqSectionLabelName', e.target.value)}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="FAQ Section Description"
                required
                value={formData.faqSectionDescription}
                onChange={(e) => handleChange('faqSectionDescription', e.target.value)}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="FAQ Sub Section Label Name"
                required
                value={formData.faqSubSectionLabelName}
                onChange={(e) => handleChange('faqSubSectionLabelName', e.target.value)}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="FAQ Sub Section Description"
                required
                value={formData.faqSubSectionDescription}
                onChange={(e) => handleChange('faqSubSectionDescription', e.target.value)}
              />
            </Grid>

            <Grid item xs={3}>
              <TextField fullWidth label="FAQ Type" required value={formData.faqType} onChange={(e) => handleChange('faqType', e.target.value)} />
            </Grid>

            <Grid item xs={3}>
              <TextField
                fullWidth
                label="FAQ Question Count"
                value={formData.faqQuestionCount}
                onChange={(e) => handleQuestionCountChange(e.target.value)}
                placeholder="Enter number of questions"
                helperText="Enter the number of FAQ questions"
                disabled={isEditMode} // Disable count change in edit mode
              />
            </Grid>

            <Grid item xs={6}>
              <DynamicDatePicker
                label="Effective From"
                value={formData.effectiveFromDate}
                onChange={(val: string) => {
                  setFormData({ ...formData, effectiveFromDate: val })
                  if (formData.faqDetails) {
                    const updatedDetails = formData.faqDetails.map((detail: any) => ({
                      ...detail,
                      effectiveFromDate: val,
                    }))
                    setFormData((prev: any) => ({ ...prev, faqDetails: updatedDetails }))
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
                  if (formData.faqDetails) {
                    const updatedDetails = formData.faqDetails.map((detail: any) => ({
                      ...detail,
                      effectiveToDate: val,
                    }))
                    setFormData((prev: any) => ({ ...prev, faqDetails: updatedDetails }))
                  }
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

            {/* FAQ Details Section */}
            {formData.faqDetails && formData.faqDetails.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="h6" color="primary">
                    FAQ Questions & Answers
                    {isEditMode && (
                      <Typography component="span" variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                        (Updates will be saved individually)
                      </Typography>
                    )}
                  </Typography>
                </Divider>

                <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
                  {formData.faqDetails.map((detail: any, index: number) => (
                    <Paper
                      key={index}
                      elevation={2}
                      sx={{
                        p: 2,
                        mb: 2,
                        backgroundColor: index % 2 === 0 ? 'background.default' : 'background.paper',
                        border: faqDetailsErrors[index] ? '1px solid #f44336' : 'none',
                        position: 'relative',
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" color="primary">
                              FAQ #{index + 1}
                            </Typography>
                            {detail.faqDetailCode && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '10px' }}>
                                ID: {detail.faqDetailCode}
                              </Typography>
                            )}
                            {detail.isNew && (
                              <Typography variant="caption" sx={{ color: 'success.main', fontSize: '10px' }}>
                                [New]
                              </Typography>
                            )}
                          </Box>
                          <IconButton size="small" color="error" onClick={() => handleDeleteClick(index)} disabled={formData.faqDetails.length <= 1}>
                            <RemoveIcon />
                          </IconButton>
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label={`Question ${index + 1}`}
                            required
                            multiline
                            rows={2}
                            value={detail.faqQuestion}
                            onChange={(e) => handleFaqDetailChange(index, 'faqQuestion', e.target.value)}
                            error={!!faqDetailsErrors[index]?.faqQuestion}
                            helperText={faqDetailsErrors[index]?.faqQuestion}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label={`Answer ${index + 1}`}
                            required
                            multiline
                            rows={3}
                            value={detail.faqAnswer}
                            onChange={(e) => handleFaqDetailChange(index, 'faqAnswer', e.target.value)}
                            error={!!faqDetailsErrors[index]?.faqAnswer}
                            helperText={faqDetailsErrors[index]?.faqAnswer}
                          />
                        </Grid>

                        <Grid item xs={6}>
                          <DynamicDatePicker
                            label={`Effective From (Q${index + 1})`}
                            value={detail.effectiveFromDate}
                            onChange={(val: string) => handleFaqDetailChange(index, 'effectiveFromDate', val)}
                            error={!!faqDetailsErrors[index]?.effectiveFromDate}
                            helperText={faqDetailsErrors[index]?.effectiveFromDate}
                            required
                          />
                        </Grid>

                        <Grid item xs={6}>
                          <DynamicEndDatePicker
                            label={`Effective To (Q${index + 1})`}
                            value={detail.effectiveToDate}
                            minDate={detail.effectiveFromDate}
                            onChange={(val: string) => handleFaqDetailChange(index, 'effectiveToDate', val)}
                            error={!!faqDetailsErrors[index]?.effectiveToDate}
                            helperText={faqDetailsErrors[index]?.effectiveToDate}
                            required
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={detail.active !== false}
                                onChange={(e) => handleFaqDetailChange(index, 'active', e.target.checked)}
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

                <Button variant="outlined" startIcon={<AddIcon />} onClick={addFaqDetail} sx={{ mt: 1 }} fullWidth>
                  Add FAQ Question
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
            {loading ? 'Saving...' : isEditMode ? 'Update All' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <MuiDialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <MuiDialogTitle>Confirm Delete</MuiDialogTitle>
        <MuiDialogContent>
          <Typography>Are you sure you want to delete this FAQ question?</Typography>
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
