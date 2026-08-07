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
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  Typography,
  MenuItem,
  Divider,
  Box,
  Paper,
  IconButton,
} from '@mui/material'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import SequenceApiService from '@/services/sequence.api.service'
import MasterService from '@/services/master.service'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { UserService } from '@/services/user.service'

export default function MenuItemsDialog({ open, editData, onClose, refreshList, showAlert }: any) {
  const local_service = new LocalStorageService()
  const master_service = new MasterService()
  const sequenceService = new SequenceApiService()
  const user_service = new UserService()

  const staffId = local_service.get_staff_id()

  const initialFormState = {
    moduleCode: '',
    countryCode: '',
    groupCode: '',
    groupName: '',
    groupDisplayName: '',
    menuName: '',
    menuDisplayName: '',
    parentMenuName: '',
    parentMenuDisplayName: '',
    parentDisplayOrder: 9,
    isVisible: 'Y',
    menuType: '',
    effectiveFromDate: '',
    effectiveToDate: '',
    icon: '',
    childCount: 0,
    path: '',
    children: [] as any[],
  }

  const [formData, setFormData] = useState<any>(initialFormState)
  const [errors, setErrors] = useState<any>({})
  const [countries, setcountries] = useState([])
  const [childMenuErrors, setChildMenuErrors] = useState<any>({})
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [groups, setGroups] = useState([])
  const [moduleData, setModuleData] = useState<any>([])

  useEffect(() => {
    if (editData) {
      let countryCode = editData.countryCode || ''
      // If countryCode contains parentheses, extract just the code
      if (countryCode.includes('(')) {
        countryCode = countryCode.split('(')[0].trim()
      }
      setFormData({
        ...editData,
        countryCode: countryCode, // Use the extracted code

        effectiveFromDate: editData.effectiveFromDate?.split('T')[0] || '',
        effectiveToDate: editData.effectiveToDate?.split('T')[0] || '',
        children:
          editData.children?.map((detail: any) => ({
            isNew: false,
            childDisplayOrder: detail.childDisplayOrder,
            childMenuName: detail.childMenuName,
            icon: detail.icon,
            path: detail.path,
          })) || [],
      })
    } else {
      setFormData({
        ...initialFormState,
        effectiveFromDate: '',
        effectiveToDate: '',
        children: [],
      })
    }
  }, [editData, open])

  useEffect(() => {
    fetchCountryCodes()
    fetchGroups()
    fetchModuleListingData()
  }, [])

  const fetchCountryCodes = useCallback(async () => {
    const res: any = await sequenceService.getActiveCountryCorridors()
    setcountries(res || [])
  }, [])

  const fetchGroups = useCallback(async () => {
    const res: any = await master_service.getAllGroups()
    setGroups(res?.data || [])
  }, [])

  const fetchModuleListingData = async () => {
    try {
      const response: any = await user_service.getAllModulesData()
      setModuleData(response)
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const handleChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value })
    if (errors[key]) {
      setErrors({ ...errors, [key]: '' })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false)
    setDeleteIndex(null)
  }

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (deleteIndex !== null) {
      const newDetails = [...(formData.children || [])]
      newDetails.splice(deleteIndex, 1)
      setFormData({
        ...formData,
        children: newDetails,
      })
      setDeleteConfirmOpen(false)
      setDeleteIndex(null)
    }
  }

  const addChildren = () => {
    const newDetails = [...(formData.children || [])]
    newDetails.push({
      icon: '',
      path: '',
      childMenuName: '',
      childDisplayOrder: '',
      // effectiveFromDate: formData.effectiveFromDate || '',
      // effectiveToDate: formData.effectiveToDate || '9999-12-31',
      // active: true,
      isNew: true,
    })
    setFormData({
      ...formData,
      children: newDetails,
      childCount: newDetails.length,
    })
  }

  const handleChildMenuChange = (index: number, field: string, value: any) => {
    const updatedDetails = [...(formData.children || [])]
    updatedDetails[index] = { ...updatedDetails[index], [field]: value }
    setFormData({ ...formData, children: updatedDetails })

    if (childMenuErrors[index]?.[field]) {
      const newErrors = { ...childMenuErrors }
      delete newErrors[index]?.[field]
      if (Object.keys(newErrors[index] || {}).length === 0) {
        delete newErrors[index]
      }
      setChildMenuErrors(newErrors)
    }
  }

  const initializeChildMenuDetails = (count: number) => {
    const currentDetails = formData.children || []
    const newDetails = [...currentDetails]

    while (newDetails.length < count) {
      newDetails.push({
        icon: '',
        path: '',
        childMenuName: '',
        childDisplayOrder: '',
        // effectiveFromDate: formData.effectiveFromDate || '',
        // effectiveToDate: formData.effectiveToDate || '9999-12-31',
        // active: true,
        isNew: true,
      })
    }

    while (newDetails.length > count) {
      newDetails.pop()
    }

    setFormData((prev: any) => ({
      ...prev,
      children: newDetails,
      childCount: count,
    }))
  }

  const handleChildCountChange = (value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      const count = parseInt(value) || 0
      setFormData((prev: any) => ({ ...prev, childCount: count, path: '' }))
      initializeChildMenuDetails(count)
    }
  }

  const validateFaqDetails = () => {
    const detailsErrors: any = {}
    let hasErrors = false

    formData.children?.forEach((detail: any, index: number) => {
      const detailErrors: any = {}

      if (!detail.childMenuName || detail.childMenuName.trim() === '') {
        detailErrors.childMenuName = 'child Menu is required'
        hasErrors = true
      }

      if (!detail.path || detail.path.trim() === '') {
        detailErrors.path = 'Path is required'
        hasErrors = true
      }

      if (Object.keys(detailErrors).length > 0) {
        detailsErrors[index] = detailErrors
      }
    })

    setChildMenuErrors(detailsErrors)
    return !hasErrors
  }

  const handleSubmit = async () => {
    const mandatoryFields = ['countryCode', 'moduleCode', 'groupCode', 'menuName', 'parentMenuName', 'effectiveFromDate', 'effectiveToDate']

    const isFormIncomplete = mandatoryFields.some((field) => !formData[field] || formData[field].toString().trim() === '')

    if (isFormIncomplete) {
      showAlert('error', 'Please fill in all mandatory fields before saving.')
      return
    }

    if (!validateFaqDetails()) {
      showAlert('error', 'Please fill in all Form fields.')
      return
    }

    try {
      if (editData) {
        await handleUpdate()
      } else {
        await handleCreate()
      }
    } catch (error: any) {
      console.error('Error saving Menu:', error)
      showAlert('error', error?.message || error?.toString() || 'Operation failed')
    } finally {
    }
  }

  const handleCreate = async () => {
    const payload = {
      ...formData,
      //createdBy: staffId || 'admin',
      effectiveFromDate: formData.effectiveFromDate + 'T00:00:00',
      effectiveToDate: formData.effectiveToDate + 'T00:00:00',
      children: formData.children?.map((detail: any) => ({
        childDisplayOrder: detail.childDisplayOrder,
        childMenuName: detail.childMenuName,
        icon: detail.icon,
        path: detail.path,
      })),
      // path: formData.children > 0 ? '' : formData.path,
    }

    delete payload.childCount
    if (payload.children > 0) delete payload.path
    console.log(payload, '-------------')

    const res = await master_service.createMenu(payload)

    if (res.status) {
      showAlert('success', res.message || 'Menu created successfully')
      refreshList()
      onClose()
    } else {
      showAlert('error', res.message || 'Failed to create Menu')
    }
  }

  const handleUpdate = async () => {
    // Build payload matching the working curl structure
    const updatePayload = {
      ...formData,
      modifiedBy: staffId,
      effectiveFromDate: formData.effectiveFromDate + 'T00:00:00',
      effectiveToDate: formData.effectiveToDate + 'T00:00:00',
      children: formData.children?.map((detail: any) => ({
        childDisplayOrder: detail.childDisplayOrder,
        childMenuName: detail.childMenuName,
        icon: detail.icon,
        path: detail.path,
      })),
    }

    try {
      // Use master_service instead of direct fetch
      const response = await master_service.updateFaqHead(editData.menuCode, updatePayload)

      console.log('Update response:', response)

      if (response && response.status !== false) {
        showAlert('success', response.message || 'Menu updated successfully')
        refreshList()
        onClose()
      } else {
        showAlert('error', response?.message || 'Failed to update Menu')
      }
    } catch (error: any) {
      console.error('Error updating menu:', error)
      showAlert('error', error?.message || 'Operation failed')
    }
  }

  // Determine if this is edit mode
  const isEditMode = !!editData

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{editData ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Autocomplete
                options={moduleData}
                value={moduleData.find((c: any) => c.moduleId === formData.moduleCode) || null}
                getOptionLabel={(option: any) => `${option.moduleName} (${option.moduleId})` || ''}
                isOptionEqualToValue={(option: any, value: any) => option.moduleId === value.moduleId}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, moduleCode: newValue ? newValue.moduleId : '' })
                }}
                renderInput={(params) => <TextField {...params} label="Module" fullWidth />}
              />
            </Grid>
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
              <Autocomplete
                options={groups}
                value={groups.find((c: any) => c.groupCode === formData.groupCode) || null}
                getOptionLabel={(option: any) => `${option.groupName} (${option.groupCode})` || ''}
                isOptionEqualToValue={(option: any, value: any) => option.groupCode === value.groupCode}
                onChange={(_, newValue) => {
                  setFormData({
                    ...formData,
                    groupName: newValue.groupName || '',
                    groupDisplayName: newValue.groupDisplayName || '',
                    groupCode: newValue ? newValue.groupCode : '',
                  })
                }}
                renderInput={(params) => <TextField {...params} label="Group Code" fullWidth />}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Parent Menu Name"
                value={formData.parentMenuName}
                onChange={(e) => handleChange('parentMenuName', e.target.value)}
              />
            </Grid>

            <Grid item xs={6}>
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
                label="Path"
                value={formData.path}
                disabled={formData.childCount > 0}
                onChange={(e) => {
                  handleChange('path', e.target.value)
                }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Menu Type"
                required
                value={formData.menuType}
                onChange={(e) => handleChange('menuType', e.target.value)}
                helperText="Select Menu Type"
              >
                <MenuItem value="Menu">Menu</MenuItem>
                <MenuItem value="Submenu">Submenu</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Child Menu Count"
                required
                value={formData.childCount}
                onChange={(e) => handleChildCountChange(e.target.value)}
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
            {/* <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox checked={formData.active} onChange={(e) => handleChange('active', e.target.checked)} color="primary" />}
                label="Active Status"
              />
            </Grid> */}

            {formData.children && formData.children.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="h6" color="primary">
                    Child Menus
                    {isEditMode && (
                      <Typography component="span" variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                        (Updates will be saved individually)
                      </Typography>
                    )}
                  </Typography>
                </Divider>

                <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
                  {formData.children.map((detail: any, index: number) => (
                    <Paper
                      key={index}
                      elevation={2}
                      sx={{
                        p: 2,
                        mb: 2,
                        backgroundColor: index % 2 === 0 ? 'background.default' : 'background.paper',
                        border: childMenuErrors[index] ? '1px solid #f44336' : 'none',
                        position: 'relative',
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" color="primary">
                              Child Menu #{index + 1}
                            </Typography>
                          </Box>
                          <IconButton size="small" color="error" onClick={() => handleDeleteClick(index)} disabled={formData.children.length <= 1}>
                            <RemoveIcon />
                          </IconButton>
                        </Grid>

                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label={`Child Menu ${index + 1}`}
                            required
                            value={detail.childMenuName}
                            inputProps={{ maxLength: 255 }}
                            onChange={(e) => handleChildMenuChange(index, 'childMenuName', e.target.value)}
                            error={!!childMenuErrors[index]?.childMenuName}
                            helperText={childMenuErrors[index]?.childMenuName}
                          />
                        </Grid>

                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label={`Path ${index + 1}`}
                            required
                            value={detail.path}
                            inputProps={{ maxLength: 255 }}
                            onChange={(e) => handleChildMenuChange(index, 'path', e.target.value)}
                            error={!!childMenuErrors[index]?.path}
                            helperText={childMenuErrors[index]?.path}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label={`Icon ${index + 1}`}
                            value={detail.icon}
                            inputProps={{ maxLength: 255 }}
                            onChange={(e) => handleChildMenuChange(index, 'icon', e.target.value)}
                            error={!!childMenuErrors[index]?.icon}
                            helperText={childMenuErrors[index]?.icon}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Box>

                <Button variant="outlined" startIcon={<AddIcon />} onClick={addChildren} sx={{ mt: 1 }} fullWidth>
                  Add Children
                </Button>
              </Grid>
            )}
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

      <MuiDialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <MuiDialogTitle>Confirm Delete</MuiDialogTitle>
        <MuiDialogContent>
          <Typography>Are you sure you want to delete this Child Menu?</Typography>
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
