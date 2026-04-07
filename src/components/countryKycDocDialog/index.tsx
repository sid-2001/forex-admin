import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Autocomplete,
  createFilterOptions,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { countyState } from '@/states/state'
import ErrorMessage from '../errorMessage'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import { KycDocumentTypeService } from '@/services/kycdocumenttype.service'
import VendorApiService from '@/services/vendor.api.service'

const filter = createFilterOptions({
  matchFrom: 'any',
  stringify: (o: any) => `${o.countryName} ${o.countryCode}`,
})

export default function CountryKycDocDialog({ open, onClose, onSubmit, editData, errMassage }: any) {
  const [countries] = useRecoilState(countyState)
  const [vendorCodes, setVendorCodes] = useState<any>([])
  const [docTypeCodes, setDocTypeCodes] = useState<any>([])
  const kyc_doc_service = new KycDocumentTypeService()
  const vendor_service = new VendorApiService()

  const initialFormState = {
    countryCode: '',
    docTypeCode: '',
    docCode: 'Contract',
    docDescription: 'Contract',
    verificationMode: '',
    // verificationPartnerCode: '',
    appLimit: 0,
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
    createdBy: '',
    docTypeDescription: '',
    vendorCode: '',
  }

  const verificationModes = [
    { label: 'Auto', value: 'A' },
    { label: 'Manual', value: 'M' },
  ]

  const [form, setForm] = useState(initialFormState)
  const [errors, setErrors] = useState<any>({})

  useEffect(() => {
    if (open) {
      kyc_doc_service.getAllDocumentTypes().then((data: any) => {
        const list = Array.isArray(data) ? data : data?.data || []
        setDocTypeCodes(list.filter((item: any) => item.active === true))
      })

      vendor_service.getAll().then((data: any) => {
        const list = Array.isArray(data) ? data : data?.data || []
        setVendorCodes(list.filter((item: any) => item.active === true))
      })
    }
  }, [open])

  useEffect(() => {
    if (editData) {
      setForm({
        ...editData,
        effectiveFromDate: editData.effectiveFromDate?.split('T')[0] || '',
        effectiveToDate: editData.effectiveToDate?.split('T')[0] || '',
      })
    } else {
      setForm(initialFormState)
    }
  }, [editData, open])

  const validate = () => {
    const newErrors: any = {}
    if (!form.countryCode) newErrors.countryCode = 'Required'
    if (!form.docTypeCode) newErrors.docTypeCode = 'Required'
    if (!form.effectiveFromDate) newErrors.effectiveFromDate = 'Required'
    if (!form.vendorCode) newErrors.vendorCode = 'Required'
    if (!form.verificationMode) newErrors.verificationMode = 'Required'
    if (!form.appLimit) newErrors.appLimit = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    // Clean payload: Remove primary keys before sending to API
    const { ...cleanData } = form as any

    onSubmit({
      ...cleanData,
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${form.effectiveToDate}T00:00:00`,
    })
  }

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>{editData ? 'Edit KYC Document' : 'Add KYC Document'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={6}>
            <Autocomplete
              options={countries?.filter((c: any) => c.status === 'A') || []}
              filterOptions={filter}
              getOptionLabel={(o) => `${o.countryName} (${o.countryCode})`}
              value={countries?.find((c) => c.countryCode === form.countryCode) || null}
              onChange={(_, val) => handleChange('countryCode', val?.countryCode || '')}
              renderInput={(p) => <TextField {...p} label="Country" required error={!!errors.countryCode} helperText={errors.countryCode} />}
            />
          </Grid>
          <Grid item xs={6}>
            <Autocomplete
              options={vendorCodes}
              disabled={!!editData}
              getOptionLabel={(o: any) => `${o.vendorName} (${o.vendorCode})`}
              value={vendorCodes.find((m: any) => m.vendorCode === form.vendorCode) || null}
              onChange={(_, val) => handleChange('vendorCode', val?.vendorCode || '')}
              renderInput={(p) => <TextField {...p} label="Vendor Code" required error={!!errors.vendorCode} helperText={errors.vendorCode} />}
            />
          </Grid>

          <Grid item xs={6}>
            <Autocomplete
              options={verificationModes}
              disabled={!!editData}
              getOptionLabel={(o: any) => o.label || ''}
              value={verificationModes.find((m) => m.value === form.verificationMode) || null}
              onChange={(_, val) => handleChange('verificationMode', val?.value || '')}
              renderInput={(p) => (
                <TextField {...p} label="Verification Mode" required error={!!errors.verificationMode} helperText={errors.verificationMode} />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Autocomplete
              options={docTypeCodes}
              disabled={!!editData}
              getOptionLabel={(o: any) => `${o.kycDocTypeDescription} (${o.kycDocTypeCode})` || ''}
              value={docTypeCodes.find((m: any) => m.kycDocTypeCode === form.docTypeCode) || null}
              onChange={(_, val) => {
                setForm({ ...form, docTypeCode: val ? val.kycDocTypeCode : '', docTypeDescription: val ? val.kycDocTypeDescription : '' })
              }}
              renderInput={(p) => (
                <TextField {...p} label="Document Type Code" required error={!!errors.docTypeCode} helperText={errors.docTypeCode} />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Document Description" value={form.docTypeDescription} disabled />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="App Limit"
              value={form.appLimit}
              required
              onChange={(e: any) => handleChange('appLimit', e.target.value || '')}
              error={!!errors.appLimit}
              helperText={errors.appLimit}
            />
          </Grid>
          <Grid item xs={6}>
            <DynamicDatePicker
              label="Effective From"
              value={form.effectiveFromDate}
              onChange={(val: string) => {
                setForm({ ...form, effectiveFromDate: val })
              }}
              error={!!errors.effectiveFromDate}
              helperText={errors.effectiveFromDate}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <DynamicEndDatePicker
              label="Effective To"
              value={form.effectiveToDate}
              minDate={form.effectiveFromDate}
              onChange={(val: string) => {
                setForm({ ...form, effectiveToDate: val })
              }}
              error={!!errors.effectiveToDate}
              helperText={errors.effectiveToDate}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <ErrorMessage errMessage={errMassage} />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>CANCEL</Button>
        <Button variant="contained" onClick={handleSubmit}>
          SAVE
        </Button>
      </DialogActions>
    </Dialog>
  )
}
