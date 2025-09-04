import React, { useState } from 'react'
import { Grid, TextField, Menu, MenuItem, IconButton, Avatar, ListItemText, ListItemIcon } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

const BeneficiaryForm = ({
  //@ts-ignore
  setselectedBenficiary,
  //@ts-ignore
  beneficiaries,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    bank: '',
    ifscCode: '',
  })

  // Dummy beneficiary data

  console.log(beneficiaries, '===========')

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleSelectBeneficiary = (beneficiary: (typeof beneficiaries)[0]) => {
    setFormData({
      accountHolderName: beneficiary.name,
      accountNumber: beneficiary.accountNumber,
      bank: beneficiary.bank,
      ifscCode: beneficiary.ifscCode,
    })

    setselectedBenficiary({
      accountHolderName: beneficiary.name,
      accountNumber: beneficiary.accountNumber,
      bank: beneficiary.bank,
      ifscCode: beneficiary.ifscCode,
      benificaryId: beneficiary?.benificaryId,
    })
    setAnchorEl(null)
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          label="Account Holder Name"
          variant="filled"
          fullWidth
          placeholder="Enter Account Holder Name"
          value={formData.accountHolderName}
          InputProps={{
            endAdornment: (
              <IconButton onClick={handleOpenMenu}>
                <PersonAddIcon />
              </IconButton>
            ),
          }}
        />
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
          {beneficiaries && beneficiaries.length > 0 ? (
            beneficiaries.map(
              //@ts-ignore
              (beneficiary, index) => (
                <MenuItem key={index} onClick={() => handleSelectBeneficiary(beneficiary)}>
                  <ListItemIcon>
                    <Avatar>{beneficiary?.name?.charAt(0)}</Avatar>
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
        <TextField
          label="Account Number"
          variant="filled"
          fullWidth
          placeholder="Enter Account Number"
          value={formData.accountNumber}
          disabled
          // onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Bank"
          variant="filled"
          fullWidth
          placeholder="Enter Bank Name"
          value={formData.bank}
          disabled
          // onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="IFSC Code"
          variant="filled"
          fullWidth
          placeholder="Enter IFSC Code"
          value={formData.ifscCode}
          disabled
          // onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
        />
      </Grid>
    </Grid>
  )
}

export default BeneficiaryForm
