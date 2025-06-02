import React from 'react'
import { Autocomplete, TextField, Avatar, Box, Typography } from '@mui/material'

const countries = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
]

export default function FlagSelector() {
  const [selectedCountry, setSelectedCountry] = React.useState(null)

  return (
    <Autocomplete
      options={countries}
      getOptionLabel={(option) => option.name}
      onChange={
         //@ts-ignore
        (event, newValue) => setSelectedCountry(
        
         //@ts-ignore
        newValue)}
      renderInput={(params) => <TextField {...params} label="Select Country" variant="outlined" />}
      renderOption={(props, option) => (
        <Box component="li" {...props} display="flex" alignItems="center">
          <Avatar sx={{ mr: 2 }}>{option.flag}</Avatar>
          <Typography>{option.name}</Typography>
        </Box>
      )}
      value={selectedCountry}
      isOptionEqualToValue={(option, value) => option.code === value.code}
      sx={{ width: 300 }}
    />
  )
}
