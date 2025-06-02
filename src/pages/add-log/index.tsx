import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Container, TextField, Typography, CircularProgress } from '@mui/material'
import axios from 'axios'

const NewLog: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    driver_name: '',
    transaction_count: 0,
    reason_of_abend: '',
    raised_at: new Date().toISOString(),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'transaction_count' ? parseInt(value, 10) : value,
    }))
  }

  // Submit the form data to the API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await axios.post('/api/driver-log', formData) // Replace '/api/driver-log' with actual endpoint
      navigate('/driver-list') // Redirect to the driver list after submission
    } catch (err) {
      setError('Failed to create a new log. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Box
        sx={{
          p: 4,
          boxShadow: 4,
          borderRadius: 3,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h5" mb={3} sx={{ fontWeight: 'bold', color: '#005099' }}>
          Create New Driver Log
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Driver Name"
            name="driver_name"
            value={formData.driver_name}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            sx={{ mb: 2 }}
          />

          <TextField
            label="Transaction Count"
            name="transaction_count"
            type="number"
            value={formData.transaction_count}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            sx={{ mb: 2 }}
          />

          <TextField
            label="Reason of Abend"
            name="reason_of_abend"
            value={formData.reason_of_abend}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            sx={{ mb: 2 }}
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              backgroundColor: '#005099',
              color: 'white',
              '&:hover': { backgroundColor: '#003e73' },
              py: 1.5,
              fontSize: '1rem',
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Add Log'}
          </Button>
        </form>
      </Box>
    </Container>
  )
}

export default NewLog
