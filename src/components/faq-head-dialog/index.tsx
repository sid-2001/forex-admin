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
} from '@mui/material'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import SequenceApiService from '@/services/sequence.api.service'
import MasterService from '@/services/master.service'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

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

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        effectiveFromDate: editData?.effectiveFromDate?.split('T')[0],
        effectiveToDate: editData?.effectiveToDate?.split('T')[0],
        faqDetails: editData?.faqDetailMasters || [],
      })
    } else {
      // Get staff ID for createdBy - use the correct format
      const staffId = local_service?.get_staff_id() || 'APSUAEAUH2026073000002'
      setFormData({
        ...initialFormState,
        createdBy: staffId,
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

  // Initialize FAQ details based on count
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
      // Get the staff ID - ensure it's in the correct format
      const staffId = local_service?.get_staff_id() || 'APSUAEAUH2026073000002'

      // Prepare payload
      const payload = {
        countryCode: formData.countryCode,
        faqChannel: formData.faqChannel.toLowerCase(), // Make sure it's lowercase
        faqSectionLabelName: formData.faqSectionLabelName,
        faqSectionDescription: formData.faqSectionDescription,
        faqSubSectionLabelName: formData.faqSubSectionLabelName,
        faqSubSectionDescription: formData.faqSubSectionDescription,
        faqType: formData.faqType,
        faqQuestionCount: formData.faqQuestionCount,
        createdBy: staffId,
        effectiveFromDate: formData.effectiveFromDate + 'T00:00:00',
        effectiveToDate: formData.effectiveToDate + 'T00:00:00',
        faqDetails: formData.faqDetails?.map((detail: any) => ({
          faqQuestion: detail.faqQuestion,
          faqAnswer: detail.faqAnswer,
          effectiveFromDate: detail.effectiveFromDate + 'T00:00:00',
          effectiveToDate: detail.effectiveToDate + 'T00:00:00',
        })),
      }

      console.log('Sending payload:', JSON.stringify(payload, null, 2))

      if (editData) {
        // Update logic here
      } else {
        const res = await master_service.createFaq(payload)

        console.log('Response:', res)

        if (res.status === false || !res.status) {
          // Show the actual error message from the API
          showAlert('error', res.message || 'Failed to create FAQ')
        }
        if (res.status) {
          showAlert('success', res.message || 'FAQ created successfully')
          refreshList()
          onClose()
        }
      }
    } catch (error: any) {
      console.error('Error creating FAQ:', error)
      // Show the actual error message
      showAlert('error', error?.message || error?.toString() || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value })
    if (errors[key]) {
      setErrors({ ...errors, [key]: '' })
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{editData ? 'Edit Faq' : 'Add Faq'}</DialogTitle>
        <DialogContent dividers>
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
                label="Faq Channel"
                required
                value={formData.faqChannel}
                onChange={(e) => handleChange('faqChannel', e.target.value)}
                helperText="Use lowercase letters (e.g., 'm' for mobile)"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Faq Section Label Name"
                required
                value={formData.faqSectionLabelName}
                onChange={(e) => handleChange('faqSectionLabelName', e.target.value)}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Faq Section Description"
                required
                value={formData.faqSectionDescription}
                onChange={(e) => handleChange('faqSectionDescription', e.target.value)}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Faq Sub Section Label Name"
                required
                value={formData.faqSubSectionLabelName}
                onChange={(e) => handleChange('faqSubSectionLabelName', e.target.value)}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Faq Sub Section Description"
                required
                value={formData.faqSubSectionDescription}
                onChange={(e) => handleChange('faqSubSectionDescription', e.target.value)}
              />
            </Grid>

            <Grid item xs={3}>
              <TextField fullWidth label="Faq Type" required value={formData.faqType} onChange={(e) => handleChange('faqType', e.target.value)} />
            </Grid>

            <Grid item xs={3}>
              <TextField
                fullWidth
                label="Faq Question Count"
                value={formData.faqQuestionCount}
                onChange={(e) => handleQuestionCountChange(e.target.value)}
                placeholder="Enter number of questions"
                helperText="Enter the number of FAQ questions"
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
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" color="primary">
                            FAQ #{index + 1}
                          </Typography>
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
                            sx={{
                              '& .MuiInputBase-root': {
                                height: '80px',
                              },
                            }}
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
                            sx={{
                              '& .MuiInputBase-root': {
                                height: '80px',
                              },
                            }}
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
          <Button variant="contained" onClick={handleSubmit} color="primary" disabled={loading}>
            {loading ? 'Saving...' : editData ? 'Update' : 'Save'}
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
