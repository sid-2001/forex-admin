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
  Select,
  Typography,
  InputLabel,
} from '@mui/material'
import { useEffect, useState } from 'react'
import ProductBusinessCountryMappingService from '@/services/productBusinessCountryMapping.service'
import { useRecoilState } from 'recoil'

import { countyState } from "@/states/state";
import { LocalStorageService } from '@/helpers/local-storage-service';
const service = new ProductBusinessCountryMappingService()
const local_service=new LocalStorageService();

interface Props {
  open: boolean
  handleClose: () => void
  editData?: any
  refreshList: () => void
}

const ProductBusinessCountryMappingDialog = ({
  open,
  handleClose,
  editData,
  refreshList,
}: Props) => {
  const [form, setForm] = useState<any>({
    productCode: '',
    recipientCountry: '',
    paymentRail: '',
    active: true,
    effectiveFromDate: '',
    effectiveToDate: '',
  })
const [selectedCountry, setSelectedCountry] = useState<string>('')
const [countries, setCountries] = useRecoilState(countyState)
const [errors, setErrors] = useState<any>({})


const validateForm = () => {
  const newErrors: any = {}

  if (!form.productCode) newErrors.productCode = 'Product Code is required'
  if (!selectedCountry) newErrors.recipientCountry = 'Destination Country is required'
  if (!form.paymentRail) newErrors.paymentRail = 'Payment Rail is required'
  if (!form.effectiveFromDate) newErrors.effectiveFromDate = 'Effective From date is required'
  if (!form.effectiveToDate) newErrors.effectiveToDate = 'Effective To date is required'

  if (
    form.effectiveFromDate &&
    form.effectiveToDate &&
    new Date(form.effectiveToDate) < new Date(form.effectiveFromDate)
  ) {
    newErrors.effectiveToDate = 'Effective To must be after Effective From'
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}


    const handleCountryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const countryCode = event.target.value as string
      console.log(countryCode)
        setSelectedCountry(countryCode)
    
      
        const selected = countries.find((country) => country.countryCode == countryCode)
      
    
      }
  
  useEffect(() => {
    if (editData) {
      setForm(editData)
       setSelectedCountry(editData.recipientCountry)
    }
  }, [editData])

  const handleSubmit = async () => {
         console.log(selectedCountry)
     if (!validateForm()) return
     console.log(selectedCountry)
    if (editData) {
      await service.update(editData.businessMapCode, {
        productCode: form.productCode,
        recipientCountry: selectedCountry,
        paymentRail: form.paymentRail,
        active: form.active,
        effectiveFromDate: form.effectiveFromDate,
        effectiveToDate: form.effectiveToDate,
        modifiedBy: local_service.get_staff_id(),
      })
      setSelectedCountry(form.recipientCountry)
    } else {
      await service.create({
        productCode: form.productCode,
        recipientCountry: selectedCountry,
        paymentRail: form.paymentRail,
        active: form.active,
        effectiveFromDate: form.effectiveFromDate,
        effectiveToDate: form.effectiveToDate,
        createdBy: local_service.get_staff_id(),
        modifiedBy: local_service.get_staff_id()
      })
    }

    refreshList()
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editData ? 'Update' : 'Create'} Product Business Country Mapping
      </DialogTitle>

      <DialogContent>
        <TextField
          label="Product Code"
          fullWidth
           error={!!errors.productCode}
          required
          margin="dense"
          value={form.productCode}
          onChange={(e) =>
            setForm({ ...form, productCode: e.target.value })
          }
        />


    <InputLabel>Destination Country</InputLabel>

             <Select
                                      required
                                        value={selectedCountry}
                                        
                                        error={!!errors.recipientCountry}
                                        fullWidth
                                        style={{
        
                                          width:"100%"
                                        }}
                                        //@ts-ignore
                                          disabled={!!editData}
                                          //@ts-ignore
                                        onChange={handleCountryChange}
                                        displayEmpty
                                      >
                                        {
                                          //(userCountry === 'IN' ? countries : countries)
                                          countries
                                            ?.filter((item) => item.status === 'A')
                                            .map((country) => (
                                              <MenuItem
                                                //@ts-ignore
                                                key={country?.countryCode}
                                                value={country.countryCode}
                                              >
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                  <Typography>{country?.countryName}</Typography>
                                                </div>
                                              </MenuItem>
                                            ))
                                        }
                                      </Select>

        <TextField
          label="Payment Rail"
        error={!!errors.paymentRail}
  helperText={errors.paymentRail}
          fullWidth
          margin="dense"
          value={form.paymentRail}
          onChange={(e) =>
            setForm({ ...form, paymentRail: e.target.value })
          }
        />

        <TextField
          type="datetime-local"
          label="Effective From"
          fullWidth
          error={!!errors.effectiveFromDate}
  helperText={errors.effectiveFromDate}
          margin="dense"
          InputLabelProps={{ shrink: true }}
          value={form.effectiveFromDate}
          onChange={(e) =>
            setForm({ ...form, effectiveFromDate: e.target.value })
          }
        />

        <TextField
          type="datetime-local"
          label="Effective To"
          fullWidth
          margin="dense"
           error={!!errors.effectiveToDate}
  helperText={errors.effectiveToDate}
          InputLabelProps={{ shrink: true ,
            
            //@ts-ignore
            min:form.effectiveFromDate}}
          value={form.effectiveToDate}
          onChange={(e) =>
            setForm({ ...form, effectiveToDate: e.target.value })
          }
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.active}
              onChange={(e) =>
                setForm({ ...form, active: e.target.checked })
              }
            />
          }
          label="Active"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProductBusinessCountryMappingDialog
