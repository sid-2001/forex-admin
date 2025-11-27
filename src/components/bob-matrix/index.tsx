import React, { useState } from 'react'
import { FormControl, InputLabel, MenuItem, Select, Button } from '@mui/material'
import FileUploadIcon from '@mui/icons-material/UploadFile'
import { LocalStorageService } from '@/helpers/local-storage-service'

interface RemittanceDetails {
  id: number
  categoryDescription: string
  purchSaleInd: string
  bopCategoryCd: string
  prpsPymtCd: string
  channelName: string
  bopSubCategoryCd: string
  countryName: string
}

interface BobCategoryDropdownProps {
  amount: number
  setAmount: (val: number) => void
  remittanceList: RemittanceDetails[]
  category: any
  setCategory: any
}

const BobCategoryDropdown: React.FC<BobCategoryDropdownProps> = ({ amount, setAmount, remittanceList, category, setCategory }) => {
  // const [category, setCategory] = useState<string>("");
  const [contract, setContract] = useState<File | null>(null)
  const [addressProof, setAddressProof] = useState<File | null>(null)
  const local_service=new LocalStorageService()

  const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    console.log(event)
    setCategory(event.target.value as string)
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(event.target.value))
  }

  const handleContractChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setContract(file)
  }

  const handleAddressProofChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setAddressProof(file)
  }

  const showAddressProof = category === '417' || amount > 50000
    const userCountry = local_service?.get_staff_country()

  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id="bob-category-label">Select
        
        {userCountry=="Ng"||"IN"?"BOP Category":"Purpose Code"} </InputLabel>
        <Select
          labelId="bob-category-label"
          value={category}
          //@ts-ignore
          onChange={handleCategoryChange}
          label="Select BOP Category"
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300, // limit dropdown height if many options
              },
            },
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
            //@ts-ignore
            getContentAnchorEl: null,
          }}
        >
          {remittanceList &&
            remittanceList.length > 0 &&
            remittanceList.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.categoryDescription} ({item.bopCategoryCd})
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {/* Contract Upload */}
      {category === '417' && (
        <div>
          <Button variant="contained" component="label" color="primary" fullWidth startIcon={<FileUploadIcon />} sx={{ mt: 2, mb: 2 }}>
            Upload Salary Contract
            <input type="file" hidden onChange={handleContractChange} />
          </Button>
        </div>
      )}

      {/* Address Proof Upload */}
      {showAddressProof && (
        <div>
          <Button variant="contained" component="label" color="primary" fullWidth startIcon={<FileUploadIcon />}>
            Upload Address Proof
            <input type="file" hidden onChange={handleAddressProofChange} />
          </Button>
        </div>
      )}
    </div>
  )
}

export default BobCategoryDropdown
