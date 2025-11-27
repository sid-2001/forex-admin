import React, { useEffect, useState } from 'react'
import { Grid, TextField, Menu, MenuItem, IconButton, Avatar, ListItemText, ListItemIcon } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

const BeneficiaryForm = ({
  //@ts-ignore
  choosedBenificiary,
  //@ts-ignore
  beneficiaries,
  //@ts-ignore
  beneficiaryId,
  //@ts-ignore
  handleSetBenificiaryData,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    bank: '',
    ifscCode: '',
    benificaryId: '',
  })

  useEffect(() => {
       setFormData({ ...choosedBenificiary })
    if (beneficiaryId) {
      setFormData({ ...choosedBenificiary })
      setAnchorEl(null)
    }
  }, [beneficiaryId, choosedBenificiary])

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!beneficiaryId) {
      setAnchorEl(event.currentTarget)
    }
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleSelectBeneficiary = (beneficiary: (typeof beneficiaries)[0]) => {
    setFormData({ ...beneficiary })
    handleSetBenificiaryData({ ...beneficiary })
    setAnchorEl(null)
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          label="Account Holder Name"
          variant="filled"
          fullWidth
          disabled
          placeholder="Enter Account Holder Name"
          value={formData.accountHolderName}
          InputProps={
            beneficiaries && beneficiaries.length > 0
              ? {
                  endAdornment: (
                    <IconButton onClick={handleOpenMenu}>
                      <PersonAddIcon />
                    </IconButton>
                  ),
                }
              : {}
          }
        />
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
          {beneficiaries && beneficiaries.length > 0 ? (
            beneficiaries.map(
              //@ts-ignore
              (beneficiary, index) => (
                <MenuItem key={index} onClick={() => handleSelectBeneficiary(beneficiary)}>
                  <ListItemIcon sx={{p:1}}>
                    <Avatar>{beneficiary?.name?.charAt(0)} </Avatar>
                  </ListItemIcon>
                  <ListItemText primary={beneficiary?.name} />
                </MenuItem>
              ),
            )
          ) : (
            <MenuItem>No Beneficiary added</MenuItem>
          )}
        </Menu>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField label="Account Number" variant="filled" fullWidth placeholder="Enter Account Number" value={formData.accountNumber} disabled />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField label="Bank" variant="filled" fullWidth placeholder="Enter Bank Name" value={formData.bank} disabled />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField label="IFSC Code" variant="filled" fullWidth placeholder="Enter IFSC Code" value={formData.ifscCode} disabled />
      </Grid>
    </Grid>
  )
}

export default BeneficiaryForm
