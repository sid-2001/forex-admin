import React, { useEffect, useState } from 'react'
import { Container, TextField, Checkbox, FormControlLabel, Typography, Button, Box } from '@mui/material'
import axios from 'axios'
import { DriverService } from '@/services/driver.service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState, loaderState } from '@/states/state'
import { Navigate, useNavigate } from 'react-router-dom'

const CreateDriver = () => {
  // State to store form data

  let driver_service = new DriverService()
  const [text, setText] = useRecoilState(alertTextState)
  const [type, setType] = useRecoilState(alertTypeState)
  const [open, setOpen] = useRecoilState(alertState)
  const [commonloader, setcommonloader] = useRecoilState(loaderState)
  let navigate = useNavigate()

  useEffect(() => {}, [])

  const [formData, setFormData] = useState({
    name: '',
    transaction_count: 0,
    description: '',
    is_Active: true,
  })

  // Handle input changes
  const handleChange = (
    //@ts-ignore
    e,
    //@ts-ignore
  ) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'transaction_count' ? parseInt(value) : value,
    }))
  }

  // Handle checkbox toggle
  const handleCheckboxChange = (
    //@ts-ignore
    e,

    //@ts-ignore
  ) => {
    const { checked } = e.target
    setFormData((prevData) => ({
      ...prevData,
      is_Active: checked,
    }))
  }

  // Handle form submission
  const handleSubmit = async (
    //@ts-ignore
    e,
    //@ts-ignore
  ) => {
    e.preventDefault()
    try {
      setcommonloader(true)

      // Send form data to API (replace with your endpoint)

      // Reset form after submission if needed
      setFormData({
        name: '',
        transaction_count: 0,
        description: '',
        is_Active: true,
      })

      //@ts-ignore
      driver_service.addDriver(formData).then((data) => {
        if (data.uid) {
          setType('success')
          setText('Driver Added Succesfully')
          setOpen(true)
          setTimeout(() => {
            setOpen(false)
            navigate('/driver')
          }, 2000)
        } else {
          setType('error')
          setText('Driver Added Failed')
          setOpen(false)
          setOpen(true)
          setTimeout(() => {
            setOpen(false)
            navigate('/driver')
          }, 2000)
        }

        setcommonloader(false)
      })
      // driver_service.addDriver(formData)
    } catch (error) {
      console.error('Error creating driver:', error)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" color="primary" gutterBottom>
        Add Driver
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mt: 2,
        }}
      >
        <TextField label="Name" name="name" value={formData.name} onChange={handleChange} fullWidth required />
        <TextField
          label="Transaction Count"
          name="transaction_count"
          type="number"
          value={formData.transaction_count}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField label="Description" name="description" value={formData.description} onChange={handleChange} multiline rows={4} fullWidth />
        <FormControlLabel control={<Checkbox checked={formData.is_Active} onChange={handleCheckboxChange} color="primary" />} label="Active" />
        <Button type="submit" variant="contained" color="primary">
          Create Driver
        </Button>
      </Box>
    </Container>
  )
}

export default CreateDriver
