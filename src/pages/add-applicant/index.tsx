import React, { useState } from 'react'
import { Box, Grid, TextField, Typography, Button, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material'
import { ApplicantService } from '@/services/applicant.service'
import { useNavigate } from 'react-router-dom'
import { GridCloseIcon } from '@mui/x-data-grid'

const applicant_service = new ApplicantService()

const AddApplicant = () => {
  // Defining form data state directly in the component
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    applicantName: '',
    nationality: '',
    residenceCountry: '',
    phone: '',
    email: '',
    physicalAddressLine1: '',
    physicalAddressLine2: '',
    physicalAddressLine3: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    postalAddressLine1: '',
    postalAddressLine2: '',
    postalAddressLine3: '',
    residenceCity: '',
    residencePostalCode: '',
    residenceState: '',
  })

  const [documentFields, setDocumentFields] = useState<any[]>([{ documentType: '', documentPreview: null, showUpload: false }])
  const [errors, setErrors] = useState<any>({})
  const [text, setText] = useState('')
  const [type, setType] = useState('')
  const [open, setOpen] = useState(false)

  const [image, setImage] = useState(null)

  const handleDocumentTypeChange = (index: number, value: string) => {
    const updatedFields = [...documentFields]
    updatedFields[index] = { ...updatedFields[index], documentType: value, showUpload: true }
    setDocumentFields(updatedFields)

    // Update formData state to reflect changes in documents array
    setFormData((prevData: any) => ({
      ...prevData,
      // documents: updatedFields,p
    }))
  }
  const handleImageChange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        //@ts-ignore
        setImage(reader.result) // Store the image as a data URL
      }
      reader.readAsDataURL(file) // Convert image file to data URL
    }
  }

  const handleRemoveImage = () => {
    setImage(null) // Reset the image state
  }

  const handleFileChange = (index: number, file: File | null) => {
    const updatedFields = [...documentFields]
    updatedFields[index] = { ...updatedFields[index], documentPreview: file }
    setDocumentFields(updatedFields)

    // Update formData state to reflect changes in documents array
    setFormData((prevData: any) => ({
      ...prevData,
      documents: updatedFields,
    }))
  }

  const addDocumentSection = () => setDocumentFields([...documentFields, { documentType: '', documentPreview: null, showUpload: false }])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: any; value: any }>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const newErrors: any = {}
    let isValid = true

    Object.keys(formData).forEach((field: any) => {
      //@ts-ignore
      if (!formData[field]) {
        newErrors[field] = 'This field is required'
        isValid = false
      }
    })

    // Specific validation for email format
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async () => {
    const isValid = validateForm()
    if (!isValid) return
    console.log('Dattttaaa', formData)

    try {
      const response = await applicant_service.submitApplicantForm()
      //@ts-ignore
      if (response.status == 200) {
        console.log('200', formData)
        setText('Applicant Successfully Added')
        setType('success')
        setOpen(true)
        alert('Applicant created successfully!')
        navigate('/applicant')
      } else {
        console.log('errorororororo')
        setText('Unable to Submit Applicant')
        setType('error')
        setOpen(true)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setText('Error while submitting form')
      setType('error')
      setOpen(true)
    }
  }

  return (
    <>
      <Box sx={{ width: '50vw' }}>
        <Typography variant="h5" gutterBottom>
          <strong>Add Applicant </strong>
        </Typography>
        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="body1"
            sx={{
              backgroundColor: 'primary.main',
              p: '0.5%',
              color: 'white',
              paddingBlock: 1,
              paddingInline: 1,
              marginBottom: 2,
            }}
          >
            Applicant Id - ________
          </Typography>
        </Box>

        <Grid container alignItems="flex-start" spacing={2} mb={2}>
          <Grid item xs={4} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <Typography>Applicant Picture</Typography>

            {/* Circle Container */}
            <Box
              position="relative"
              width={110}
              height={110}
              border="2px solid #000"
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
              sx={{ cursor: 'pointer' }}
            >
              {/* Display the image if available */}
              {image ? (
                <img src={image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    opacity: 0, // Make file input invisible
                    cursor: 'pointer',
                  }}
                />
              )}
            </Box>

            {/* Remove Image Button (Cross Icon) */}
            {image && (
              <IconButton
                onClick={handleRemoveImage}
                sx={{
                  position: 'absolute',
                  left: 'calc(25% + 40px)', // Positioning to the right of the circle (adjust accordingly)
                  top: '20%',
                  transform: 'translateY(-20%)', // Vertically center the icon
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  padding: 0.5,
                }}
              >
                <GridCloseIcon />
              </IconButton>
            )}
          </Grid>
          <Grid item xs>
            <Grid container spacing={3} direction="column">
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    label="Applicant Name"
                    variant="filled"
                    name="applicantName"
                    value={formData.applicantName}
                    onChange={handleChange}
                    error={Boolean(errors.applicantName)}
                    helperText={errors.applicantName}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Nationality"
                    variant="filled"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    error={Boolean(errors.nationality)}
                    helperText={errors.nationality}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Residence Country"
                    variant="filled"
                    name="residenceCountry"
                    value={formData.residenceCountry}
                    onChange={handleChange}
                    error={Boolean(errors.residenceCountry)}
                    helperText={errors.residenceCountry}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Phone"
                        fullWidth
                        name="phone"
                        variant="filled"
                        value={formData.phone}
                        onChange={handleChange}
                        error={Boolean(errors.phone)}
                        helperText={errors.phone}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Email ID"
                        fullWidth
                        name="email"
                        variant="filled"
                        value={formData.email}
                        onChange={handleChange}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ width: '80vw' }}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ color: 'grey', marginBottom: 1 }}>
            <strong>Postal Address</strong>
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Address Line 1"
                fullWidth
                name="postalAddressLine1"
                value={formData.postalAddressLine1}
                onChange={handleChange}
                error={Boolean(errors.postalAddressLine1)}
                helperText={errors.postalAddressLine1}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Address Line 2"
                fullWidth
                name="postalAddressLine2"
                value={formData.postalAddressLine2}
                onChange={handleChange}
                error={Boolean(errors.postalAddressLine2)}
                helperText={errors.postalAddressLine2}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={6}>
              <TextField
                label="Address Line 3"
                fullWidth
                name="postalAddressLine3"
                value={formData.postalAddressLine3}
                onChange={handleChange}
                error={Boolean(errors.postalAddressLine3)}
                helperText={errors.postalAddressLine3}
              />
            </Grid>
            <Grid item xs={1.5}>
              <TextField
                label="City"
                fullWidth
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={Boolean(errors.city)}
                helperText={errors.physicalCity}
              />
            </Grid>
            <Grid item xs={1.5}>
              <TextField
                label="State"
                fullWidth
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={Boolean(errors.physicalState)}
                helperText={errors.physicalState}
              />
            </Grid>
            <Grid item xs={1.5}>
              <TextField
                label="Zip Code"
                fullWidth
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                error={Boolean(errors.physicalPostalCode)}
                helperText={errors.physicalPostalCode}
              />
            </Grid>
            <Grid item xs={1.5}>
              <TextField
                label="Country"
                fullWidth
                name="country"
                value={formData.country}
                onChange={handleChange}
                error={Boolean(errors.physicalCountry)}
                helperText={errors.physicalCountry}
              />
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ width: '20%', background: 'linear-gradient(to right, #3b82f6 40%, #60a5fa 50%, #ffffff 100%)', height: '3px', marginY: 2 }} />

        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ color: 'grey', marginBottom: 1 }}>
            <strong>Physical Address</strong>
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Address Line 1"
                fullWidth
                name="physicalAddressLine1"
                value={formData.physicalAddressLine1}
                onChange={handleChange}
                error={Boolean(errors.physicalAddressLine1)}
                helperText={errors.physicalAddressLine1}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Address Line 2"
                fullWidth
                name="physicalAddressLine2"
                value={formData.physicalAddressLine2}
                onChange={handleChange}
                error={Boolean(errors.physicalAddressLine2)}
                helperText={errors.physicalAddressLine2}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={6}>
              <TextField
                label="Address Line 3"
                fullWidth
                name="physicalAddressLine3"
                value={formData.physicalAddressLine3}
                onChange={handleChange}
                error={Boolean(errors.physicalAddressLine3)}
                helperText={errors.physicalAddressLine3}
              />
            </Grid>
            <Grid item xs={1.5}>
              <TextField
                label="City"
                fullWidth
                name="residenceCity"
                value={formData.residenceCity}
                onChange={handleChange}
                error={Boolean(errors.postalCity)}
                helperText={errors.postalCity}
              />
            </Grid>
            <Grid item xs={1.5}>
              <TextField
                label="State"
                fullWidth
                name="residenceState"
                value={formData.residenceState}
                onChange={handleChange}
                error={Boolean(errors.residenceState)}
                helperText={errors.residenceState}
              />
            </Grid>
            <Grid item xs={1.5}>
              <TextField
                label="Zip Code"
                fullWidth
                name="residencePostalCode"
                value={formData.residencePostalCode}
                onChange={handleChange}
                error={Boolean(errors.residencePostalCode)}
                helperText={errors.residencePostalCode}
              />
            </Grid>
            <Grid item xs={1.5}>
              <TextField
                label="Country"
                fullWidth
                name="postalCountry"
                value={formData.residenceCountry}
                onChange={handleChange}
                error={Boolean(errors.residenceCountry)}
                helperText={errors.residenceCountry}
              />
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ width: '20%', background: 'linear-gradient(to right, #3b82f6 40%, #60a5fa 50%, #ffffff 100%)', height: '3px', marginY: 2 }} />
        <Typography variant="subtitle1" sx={{ color: 'grey' }}>
          <strong>Documents</strong>
        </Typography>

        {documentFields.map((field, index) => (
          <Grid container spacing={2} mt={1} key={index}>
            {/* Document Type Dropdown */}
            <Grid item xs={2}>
              <FormControl fullWidth>
                <InputLabel>Document Type</InputLabel>
                <Select label="Document Type" value={field.documentType} onChange={(e) => handleDocumentTypeChange(index, e.target.value)}>
                  <MenuItem value="ID">ID</MenuItem>
                  <MenuItem value="Passport">Passport</MenuItem>
                  <MenuItem value="Visa">Visa</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Upload Button (Visible after selecting Document Type) */}
            {field.showUpload && (
              <Grid item xs={2}>
                <Button variant="contained" component="label" fullWidth sx={{ height: '36px' }}>
                  Upload
                  <input type="file" hidden onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)} />
                </Button>
              </Grid>
            )}

            {/* Add Button (Visible after uploading document) */}
            {field.documentPreview && (
              <Grid item xs={2}>
                <Button variant="contained" color="primary" onClick={addDocumentSection} sx={{ height: '36px' }} fullWidth>
                  Add
                </Button>
              </Grid>
            )}
          </Grid>
        ))}

        {/* Submit Button */}
        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Save
          </Button>
          <Button variant="contained" sx={{ marginLeft: '10px', background: 'green' }} onClick={handleSubmit}>
            Save for KYC
          </Button>
        </Box>

        {/* Success/Failure Message */}
        {open && (
          <Box mt={2}>
            <Typography variant="body2" color={type === 'success' ? 'green' : 'red'}>
              {text}
            </Typography>
          </Box>
        )}
      </Box>
    </>
  )
}

export default AddApplicant
