import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, FormControlLabel, Checkbox, Autocomplete } from '@mui/material'
import SequenceApiService from '../../services/sequence.api.service'
import { DynamicDatePicker, DynamicEndDatePicker } from '@/helpers/DynamicDatePicker'
import ProductService from '@/services/product.service'
import VendorApiService from '@/services/vendor.api.service'
import { LocalStorageService } from '@/helpers/local-storage-service'

export default function SequenceDialog({ open, editData, onClose, refreshList, showAlert, countryCorridorList }: any) {
  const service = new SequenceApiService()
  const productService = useMemo(() => new ProductService(), [])
  const vendorService = new VendorApiService()
  const local_service = new LocalStorageService()

  const initialFormState = {
    countryCode: '',
    productCode: '',
    vendorCode: '',
    vendorTypeCode: '',
    moduleFeatureCode: '',
    prefix: '',
    intermediate: '',
    suffix: '',
    maxLimitDigit: 5,
    docSeq: '',
    flag: true,
    startSeqNumber: 0,
    currentSeqNumber: 0,
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
    sequenceNumber: '',
  }

  const [formData, setFormData] = useState<any>(initialFormState)
  const [products, setProducts] = useState([])
  const [vendors, setVendors] = useState([])
  const [vendorTypeData, setVendorTypeData] = useState([])
  const [tableMasterList, setTableMasterList] = useState([])

  useEffect(() => {
    if (editData) setFormData(editData)
    else setFormData(initialFormState)
  }, [editData, open])

  const fetchProductsList = useCallback(async () => {
    const res = await productService.getProductList()
    setProducts(res || [])
  }, [productService])

  const fetchVendorsList = useCallback(async () => {
    const res: any = await vendorService.getAll()
    setVendors(res || [])
  }, [])

  const fetchVendorTypeList = useCallback(async () => {
    const res: any = await vendorService.getVendorTypeData()
    setVendorTypeData(res || [])
  }, [])

  const fetchTableTypeList = useCallback(async () => {
    const res: any = await service.getModuleTypeList()
    setTableMasterList(res || [])
  }, [])

  useEffect(() => {
    fetchProductsList()
    fetchVendorsList()
    fetchVendorTypeList()
    fetchTableTypeList()
  }, [])

  const handleSubmit = async () => {
    const mandatoryFields = [
      'countryCode',
      'productCode',
      'vendorCode',
      'vendorTypeCode',
      'moduleFeatureCode',
      'docSeq',
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
        const res = await service.update(editData.sequenceId, {
          countryCode: formData.countryCode,
          productCode: formData.productCode,
          vendorCode: formData.vendorCode,
          vendorTypeCode: formData.vendorTypeCode,
          moduleFeatureCode: formData.moduleFeatureCode,
          prefix: formData.prefix,
          intermediate: formData.intermediate,
          suffix: formData.suffix,
          maxLimitDigit: formData.maxLimitDigit,
          docSeq: formData.docSeq,
          flag: formData.flag,
          startSeqNumber: formData.startSeqNumber,
          currentSeqNumber: formData.currentSeqNumber,
          sequenceNumber: formData.sequenceNumber,
          createdBy: formData.createdBy,
          active: formData.active,
          effectiveFromDate: formData.effectiveFromDate + 'T00:00:00',
          effectiveToDate: formData.effectiveToDate + 'T00:00:00',
          modifiedBy: local_service?.get_staff_id(),
        })
        if (res.status === false) {
          showAlert('fail', res.message)
        } else {
          showAlert('success', 'Sequence updated successfully')
          refreshList()
          onClose()
        }
      } else {
        let payload = {
          ...formData,
          effectiveFromDate: formData.effectiveFromDate + 'T00:00:00',
          effectiveToDate: formData.effectiveToDate + 'T00:00:00',
          createdBy: local_service?.get_staff_id(),
        }
        const res = await service.create(payload)
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
      <DialogTitle>{editData ? 'Edit Sequence' : 'Add New Sequence'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={4}>
            <Autocomplete
              options={countryCorridorList}
              value={countryCorridorList.find((c: any) => c.countryCode === formData.countryCode) || null}
              getOptionLabel={(option: any) => `${option.countryName} (${option.countryCode})` || ''}
              isOptionEqualToValue={(option: any, value: any) => option.countryCode === value.countryCode}
              onChange={(_, newValue) => {
                setFormData({ ...formData, countryCode: newValue ? newValue.countryCode : '' })
              }}
              renderInput={(params) => <TextField {...params} label="Country" fullWidth />}
            />
          </Grid>
          <Grid item xs={4}>
            <Autocomplete
              options={products}
              value={products.find((p: any) => p.productCode === formData.productCode) || null}
              getOptionLabel={(option: any) => `${option.productName} (${option.productCode})` || ''}
              isOptionEqualToValue={(option: any, value: any) => option.productCode === value.productCode}
              onChange={(_, newValue) => {
                setFormData({ ...formData, productCode: newValue ? newValue.productCode : '' })
              }}
              renderInput={(params) => <TextField {...params} label="Product" fullWidth />}
            />
          </Grid>
          <Grid item xs={4}>
            <Autocomplete
              options={vendors}
              value={vendors.find((p: any) => p.vendorCode === formData.vendorCode) || null}
              getOptionLabel={(option: any) => `${option.vendorType} (${option.vendorCode})` || ''}
              isOptionEqualToValue={(option: any, value: any) => option.vendorCode === value.vendorCode}
              onChange={(_, newValue) => {
                setFormData({ ...formData, vendorCode: newValue ? newValue.vendorCode : '' })
              }}
              renderInput={(params) => <TextField {...params} label="Vendor" fullWidth />}
            />
          </Grid>
          <Grid item xs={6}>
            <Autocomplete
              options={vendorTypeData || []}
              value={vendorTypeData.find((v: any) => v.vendorTypeCode === formData.vendorTypeCode) || null}
              getOptionLabel={(option: any) => `${option.vendorType} (${option.vendorTypeCode})` || ''}
              isOptionEqualToValue={(option: any, value: any) => option.vendorTypeCode === value.vendorTypeCode}
              onChange={(_, newValue) => {
                setFormData({ ...formData, vendorTypeCode: newValue ? newValue.vendorTypeCode : '' })
              }}
              renderInput={(params) => <TextField {...params} label="Vendor Type" fullWidth />}
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
              renderInput={(params) => <TextField {...params} label="Module Feature Type" fullWidth />}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField fullWidth label="Prefix" value={formData.prefix} onChange={(e) => setFormData({ ...formData, prefix: e.target.value })} />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Intermediate"
              value={formData.intermediate}
              onChange={(e) => setFormData({ ...formData, intermediate: e.target.value })}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField fullWidth label="Suffix" value={formData.suffix} onChange={(e) => setFormData({ ...formData, suffix: e.target.value })} />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              required
              type="number"
              label="Max Digits"
              value={formData.maxLimitDigit}
              onChange={(e) => setFormData({ ...formData, maxLimitDigit: e.target.value })}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              required
              label="Doc Sequence Pattern"
              value={formData.docSeq}
              onChange={(e) => setFormData({ ...formData, docSeq: e.target.value })}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              type="number"
              label="Start #"
              value={formData.startSeqNumber}
              onChange={(e) => setFormData({ ...formData, startSeqNumber: e.target.value })}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              type="number"
              label="Current #"
              value={formData.currentSeqNumber}
              onChange={(e) => setFormData({ ...formData, currentSeqNumber: e.target.value })}
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
                  name="active"
                  checked={formData.active}
                  onChange={(e: any) => setFormData({ ...formData, active: e.target.checked })}
                  color="primary"
                />
              }
              label="Active"
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
