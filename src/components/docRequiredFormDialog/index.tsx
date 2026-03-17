// components/docRequiredFormDialog.tsx
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel, 
  MenuItem,
  Box,
  Grid,
  FormHelperText,
  Divider,
  Typography,
  FormControl,
  InputLabel,
  Select,
  Switch
} from '@mui/material'
import { useEffect, useState } from 'react'
import { LocalStorageService } from '@/helpers/local-storage-service'
import dayjs from 'dayjs'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import { json } from 'stream/consumers'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  editData?: any | null
  countries: any[]
  residentTypes: any[]
  products: any[]
  channels: any[]
  kycDocuments: any[]
  requirementTypes: Array<{ value: string; label: string }>
  bfaOptions: Array<{ value: string; label: string }>
}

export default function DocRequiredFormDialog({ 
  open, 
  onClose, 
  onSubmit, 
  editData,
  countries,
  residentTypes,
  products,
  channels,
  kycDocuments,
  requirementTypes,
  bfaOptions
}: Props) {
  const localService = new LocalStorageService()

  const [form, setForm] = useState<any>({
    countryCode: '',
    residenceTypeCode: '',
    productCode: '',
    channelCode: '',
    kycDocCode: '',
    docRequirementType: 'M',
    docSequence: 1,
    bfa: 'B',
    documentUpload: true,
    documentNumberRequired: true,
    active: true,
    effectiveFromDate: null,
    effectiveToDate: null,
  })

  const [errors, setErrors] = useState<any>({})
  const [filteredKycDocs, setFilteredKycDocs] = useState<any[]>([])

  useEffect(() => {
    if (editData) {
      setForm({
        countryCode: editData.countryCode || '',
        residenceTypeCode: editData.residenceTypeCode || '',
        productCode: editData.productCode || '',
        channelCode: editData.channelCode || '',
        kycDocCode: editData.kycDocCode || '',
        docRequirementType: editData.docRequirementType || 'M',
        docSequence: editData.docSequence || 1,
        bfa: editData.bfa || 'B',
        documentUpload: editData.documentUpload !== undefined ? editData.documentUpload : true,
        documentNumberRequired: editData.documentNumberRequired !== undefined ? editData.documentNumberRequired : true,
        active: editData.active || false,
        effectiveFromDate: editData.effectiveFromDate 
          ? dayjs(editData.effectiveFromDate).format('YYYY-MM-DDTHH:mm')
          : dayjs().format('YYYY-MM-DDTHH:mm'),
        effectiveToDate: editData.effectiveToDate === '2030-12-31T23:59:59'
          ? '2030-12-31T23:59'
          : dayjs(editData.effectiveToDate).format('YYYY-MM-DDTHH:mm'),
      })
    } else {
      setForm({
        countryCode: '',
        residenceTypeCode: '',
        productCode: '',
        channelCode: '',
        kycDocCode: '',
        docRequirementType: 'M',
        docSequence: 1,
        bfa: 'B',
        documentUpload: true,
        documentNumberRequired: true,
        active: true,
        effectiveFromDate: null,
        effectiveToDate: null,
      })
    }
    setErrors({})
  }, [editData, open])

  // Filter KYC documents based on selected country
  useEffect(() => {
    if (form.countryCode && kycDocuments.length > 0) {
      const filtered = kycDocuments.filter((doc: any) => 
       doc.countryCode == form.countryCode
      )
      console.log(filtered)
     
      setFilteredKycDocs(filtered)
    } else {
      setFilteredKycDocs([])
    }
  }, [form.countryCode, kycDocuments])

  // Filter resident types based on selected country
  const filteredResidentTypes = form.countryCode 
    ? residentTypes.filter(r => r.countryCode === form.countryCode && r.active === true)
    : []

  // Filter products based on selected country (if product has country association)
  const filteredProducts = products.filter(p => p.active === true)

  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value })
    setErrors({ ...errors, [key]: '' })

    // Reset dependent fields when country changes
    if (key === 'countryCode') {
      setForm
      
      (
        //@ts-ignore
        prev => ({
        ...prev,
        residenceTypeCode: '',
        kycDocCode: '',
        countryCode: value
      }))
    }
  }

  const validate = () => {
    const newErrors: any = {}
    if (!form.countryCode) newErrors.countryCode = 'Country is required'
    if (!form.residenceTypeCode) newErrors.residenceTypeCode = 'Residence type is required'
    if (!form.productCode) newErrors.productCode = 'Product is required'
    if (!form.channelCode) newErrors.channelCode = 'Channel is required'
    if (!form.kycDocCode) newErrors.kycDocCode = 'KYC document is required'
    if (!form.docRequirementType) newErrors.docRequirementType = 'Requirement type is required'
    if (!form.docSequence) {
      newErrors.docSequence = 'Document sequence is required'
    } else if (isNaN(parseInt(form.docSequence)) || parseInt(form.docSequence) < 1) {
      newErrors.docSequence = 'Sequence must be a positive number'
    }
    if (!form.bfa) newErrors.bfa = 'BFA option is required'
    
    // Date validation
    const fromDate = new Date(form.effectiveFromDate)
    const toDate = new Date(form.effectiveToDate)
    if (fromDate > toDate) {
      newErrors.effectiveFromDate = 'From date cannot be after To date'
      newErrors.effectiveToDate = 'To date cannot be before From date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

const handleSubmit = () => {
  if (!validate()) return

  const staffId = localService.get_staff_id() || 'ADMIN'

  onSubmit({
    ...form,

    effectiveFromDate: form.effectiveFromDate
      ? dayjs(form.effectiveFromDate).format('YYYY-MM-DDTHH:mm:ss')
      : null,

    effectiveToDate: form.effectiveToDate
      ? dayjs(form.effectiveToDate).format('YYYY-MM-DDTHH:mm:ss')
      : null,

    createdBy: editData ? undefined : staffId,
    modifiedBy: editData ? staffId : undefined,
  })
}
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ 
        backgroundColor: '#f5f5f5',
        color: '#0061B1',
        fontWeight: 600
      }}>
        {editData ? 'Update Document Requirement' : 'Add Document Requirement'}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              {/* Country Dropdown */}
              <TextField
                select
                required
                label="Country"
                fullWidth
                size="small"
                margin="dense"
                value={form.countryCode}
                disabled={!!editData}
                error={!!errors.countryCode}
                helperText={errors.countryCode}
                onChange={(e) => handleChange('countryCode', e.target.value)}
              >
                {countries?.filter(e=>e?.status=="A")?.map((c) => (
                  <MenuItem key={c.countryCode} value={c.countryCode}>
                   
                    {c.countryName} ({c.countryCode})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Residence Type Dropdown */}
              <TextField
                select
                required
                label="Residence Type"
                fullWidth
                size="small"
                margin="dense"
                value={form.residenceTypeCode}
                disabled={!form.countryCode || !!editData}
                error={!!errors.residenceTypeCode}
                helperText={errors.residenceTypeCode || (!form.countryCode ? 'Select country first' : '')}
                onChange={(e) => handleChange('residenceTypeCode', e.target.value)}
              >
                {filteredResidentTypes.map((r) => (
                  <MenuItem key={r.residentTypeCode} value={r.residentTypeCode}>
                    {r.residentTypeDescription} ({r.residentTypeCode})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Product Dropdown */}
              <TextField
                select
                required
                label="Product"
                fullWidth
                size="small"
                margin="dense"
                value={form.productCode}
                error={!!errors.productCode}
                helperText={errors.productCode}
                onChange={(e) => handleChange('productCode', e.target.value)}
              >
                {filteredProducts.map((p) => (
                  <MenuItem key={p.productCode} value={p.productCode}>
                    {p.productName} ({p.productCode})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Channel Dropdown */}
              <TextField
                select
                required
                label="Channel"
                fullWidth
                size="small"
                margin="dense"
                value={form.channelCode}
                error={!!errors.channelCode}
                helperText={errors.channelCode}
                onChange={(e) => handleChange('channelCode', e.target.value)}
              >
                {channels.map((c) => (
                  <MenuItem key={c.channel_code} value={c.channel_code}>
                    {c.channel_description} ({c.channel_code})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* KYC Document Dropdown */}
              <TextField
                select
                required
                label="KYC Document"
                fullWidth
                size="small"
                margin="dense"
                value={form.kycDocCode}
                disabled={!form.countryCode}
                error={!!errors.kycDocCode}
                helperText={errors.kycDocCode || (!form.countryCode ? 'Select country first' : '')}
                onChange={(e) => handleChange('kycDocCode', e.target.value)}
              >
                {filteredKycDocs.map((doc) => (
                  <MenuItem key={doc.kycDocCode} value={doc.kycDocCode}>

                    {/* {JSON.stringify(doc)} */}
                    {doc.kycDocCode} - {doc.docTypeDescription} 
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Requirement Type Dropdown */}
              <TextField
                select
                required
                label="Requirement Type"
                fullWidth
                size="small"
                margin="dense"
                value={form.docRequirementType}
                error={!!errors.docRequirementType}
                helperText={errors.docRequirementType}
                onChange={(e) => handleChange('docRequirementType', e.target.value)}
              >
                {requirementTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label} ({type.value})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Document Sequence */}
              <TextField
                required
                label="Document Sequence"
                type="number"
                fullWidth
                size="small"
                margin="dense"
                value={form.docSequence}
                error={!!errors.docSequence}
                helperText={errors.docSequence}
                onChange={(e) => handleChange('docSequence', e.target.value)}
                inputProps={{ min: 1, step: 1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              {/* BFA Dropdown */}
              <TextField
                select
                required
                label="BFA"
                fullWidth
                size="small"
                margin="dense"
                value={form.bfa}
                error={!!errors.bfa}
                helperText={errors.bfa}
                onChange={(e) => handleChange('bfa', e.target.value)}
              >
                {bfaOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label} ({opt.value})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Document Upload Checkbox */}
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={form.documentUpload} 
                    onChange={(e) => handleChange('documentUpload', e.target.checked)} 
                  />
                } 
                label="Document Upload Required" 
              />
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Document Number Required Checkbox */}
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={form.documentNumberRequired} 
                    onChange={(e) => handleChange('documentNumberRequired', e.target.checked)} 
                  />
                } 
                label="Document Number Required" 
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Validity Period
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Effective From Date */}
             <DynamicDatePicker
    label="Effective From Date"
    value={form.effectiveFromDate}
    onChange={(val: string) => handleChange('effectiveFromDate', val)}
    error={!!errors.effectiveFromDate}
    helperText={errors.effectiveFromDate}
    required
  />
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Effective To Date */}
             <DynamicEndDatePicker
    label="Effective To Date"
    value={form.effectiveToDate}
    minDate={form.effectiveFromDate}
    onChange={(val: string) => handleChange('effectiveToDate', val)}
    error={!!errors.effectiveToDate}
    helperText={errors.effectiveToDate}
    required
    disabled={!form.effectiveFromDate}
  />
            </Grid>

            <Grid item xs={12}>
              {/* Active Status */}
              <FormControlLabel 
                control={
                  <Switch 
                    checked={form.active} 
                    onChange={(e) => handleChange('active', e.target.checked)} 
                    color="success"
                  />
                } 
                label="Active" 
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: '#fafafa' }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          sx={{ 
            backgroundColor: '#0061B1',
            '&:hover': {
              backgroundColor: '#004d8c',
            }
          }}
        >
          {editData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}