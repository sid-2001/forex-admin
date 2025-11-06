import React, { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Typography, Button, Modal, Grid, TextField, FormControl, MenuItem, Select, FormHelperText, InputLabel } from '@mui/material'
import { HelperService } from '@/helpers/helper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { FieldValidationService } from '@/services/fieldvalidstion.service'
import { useTheme } from '@emotion/react'
import LoaderUI from '@/components/loader/loader'
import HasPermission from '@/components/permissionWrapper'

const helper = new HelperService()
const local_service = new LocalStorageService()
const field_validation_service = new FieldValidationService()
const numbersArray = Array.from({ length: 35 }, (_, i) => i + 1)
const requiredFormFields = ['errorMessage', 'specialCharacterList', 'maxLength', 'minLength', 'fieldType', 'fieldName']

const AddUpdateFieldValidationDialog: React.FC<any> = ({ action = 'Add', handleClose, handleSubmit, isOpen, selectedFieldData = {} }) => {
  const [formData, setFormData] = useState<any>({})
  const [formErrors, setFormErrors] = useState<any>({})

  useEffect(() => {
    if (selectedFieldData?.id) {
      setFormData(selectedFieldData)
    }
  }, [])

  const validateForm = (formData: any) => {
    const errors: any = {}
    const { minLength, maxLength } = formData

    for (const [key, value] of Object.entries(formData)) {
      if (requiredFormFields.includes(key) && value === '') {
        errors[key] = `Field is required.`
      }
    }
    if (Number(maxLength) <= Number(minLength)) {
      errors['maxLength'] = `Max length must be greater than Min length.`
    }
    return errors // empty object if no errors
  }

  const handleFormSubmit = async (e: any) => {
    try {
      e.preventDefault()
      const errors = validateForm(formData)
      setFormErrors(errors)

      let response
      if (selectedFieldData?.id) {
        response = await field_validation_service.updateFieldvalidation(formData, selectedFieldData?.id)
      } else {
        response = await field_validation_service.createFieldvalidation({
          ...formData,
          country: 'IN',
          product: 'Forex',
          flow: 'Outward',
          specialCharacterBoolean: true,
        })
      }
      setFormData({})
      handleSubmit({ ...response.data })
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: any; value: any }>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCancelBtn = () => {
    handleClose()
    setFormData({})
  }

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        handleClose()
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" gutterBottom>
          {action} Field Validation
        </Typography>
        <form onSubmit={handleFormSubmit} noValidate autoComplete="off">
          <Box mt={4}>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={12}>
                <FormControl fullWidth>
                  <TextField
                    value={formData?.fieldName || ''}
                    error={Boolean(formErrors.fieldName)}
                    helperText={formErrors.fieldName}
                    onChange={handleChange}
                    name="fieldName"
                    required={true}
                    label="Field Name"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12}>
                <FormControl fullWidth>
                  <TextField
                    value={formData?.fieldType || ''}
                    error={Boolean(formErrors.fieldType)}
                    helperText={formErrors.fieldType}
                    onChange={handleChange}
                    name="fieldType"
                    required={true}
                    label="Field Type"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel id="demo-simple-select-label">Min Length</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    name="minLength"
                    value={formData.minLength || ''}
                    error={Boolean(formErrors.minLength)}
                    label="Min Length"
                    onChange={(e) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        minLength: e.target.value,
                      }))
                    }}
                  >
                    {numbersArray.map((item, ind) => (
                      <MenuItem key={ind} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel id="demo-simple-select-label-max">Max Length</InputLabel>

                  <Select
                    labelId="demo-simple-select-label-max"
                    id="demo-simple-select-max"
                    name="maxLength"
                    value={formData.maxLength || ''}
                    onChange={(e) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        maxLength: e.target.value,
                      }))
                    }}
                    label="Max Length"
                    error={Boolean(formErrors.maxLength)}
                  >
                    {numbersArray.map((item, ind) => (
                      <MenuItem key={ind} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText sx={{ color: 'red', margin: 0 }}>{formErrors.maxLength}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12}>
                <FormControl fullWidth>
                  <TextField
                    label="Special Character List"
                    value={formData?.specialCharacterList || ''}
                    required={true}
                    onChange={handleChange}
                    name="specialCharacterList"
                    error={Boolean(formErrors.specialCharacterList)}
                    helperText={formErrors.specialCharacterList}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12}>
                <FormControl fullWidth>
                  <TextField
                    label="Error Message"
                    value={formData?.errorMessage || ''}
                    error={Boolean(formErrors.errorMessage)}
                    helperText={formErrors.errorMessage}
                    required={true}
                    onChange={handleChange}
                    name="errorMessage"
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={
                action === 'Update'
                  ? !helper.checkUserHasPermission(local_service.get_modules()?.FIELD_VALIDATION, 'canUpdate')
                  : !helper.checkUserHasPermission(local_service.get_modules()?.FIELD_VALIDATION, 'canCreate')
              }
              sx={{ mt: 2 }}
            >
              {action}
            </Button>

            <Button variant="outlined" onClick={() => handleCancelBtn()} sx={{ mt: 2, ml: 2 }}>
              Close
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  )
}

const FieldValidationTable: React.FC = () => {
  const [fieldValidationsData, setFieldValidationsData] = useState<any>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedField, setSelectedField] = useState<any>({})
  const parseData = local_service.get_staff_access()
  const userLoggedInCountry = parseData?.staffCountry

  const FIELD_COLUMNS = [
    {
      field: 'fieldName',
      headerName: 'Field Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'fieldType',
      headerName: 'Field Type',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'minLength',
      headerName: 'Min Length',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'maxLength',
      headerName: 'Max Length',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'specialCharacterList',
      headerName: 'Special Characters',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'errorMessage',
      headerName: 'Error Message',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
  ]

  useEffect(() => {
    fetchFieldValidationListingData()
  }, [])

  const fetchFieldValidationListingData = async () => {
    try {
      const response: any = await field_validation_service.getFieldValidationListing(userLoggedInCountry)
      setFieldValidationsData(response)
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const handleSavedFieldValidation = (data: any) => {
    if (selectedField?.id) {
      const filteredItems = fieldValidationsData.map((x: any) => (x.id === data.id ? data : x))
      setFieldValidationsData([...filteredItems])
    } else {
      setFieldValidationsData([...fieldValidationsData, data])
    }
    setIsModalOpen(false)
    setSelectedField({})
  }
  const theme = useTheme()

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.FIELD_VALIDATION}>
      <Box sx={{ width: '80vw', height: '70vh' }}>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <Box>
            <Typography variant="h4" gutterBottom>
              <strong>Field Validations</strong>
            </Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              disabled={!helper.checkUserHasPermission(local_service.get_modules()?.FIELD_VALIDATION, 'canCreate')}
              onClick={() => {
                setIsModalOpen(true)
              }}
            >
              Add Field Validation
            </Button>
          </Box>
        </Box>
        <DataGrid
          sx={{
            width: '100%',
            '& .MuiDataGrid-columnHeaders': {
              '& .super-app-theme--header': {
                backgroundColor: '#005099',
                color: 'white',
              },
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-cell': {
              fontSize: '14px',
            },
            '& .super-app-theme--header': {
              fontSize: '16px',
            },
          }}
          columns={FIELD_COLUMNS}
          rows={fieldValidationsData}
          //@ts-ignore
          initialState={{
            pagination: {
              paginationModel: { pageSize: 20, page: 0 },
            },
          }}
          pageSizeOptions={[10]}
          loading={fieldValidationsData.length === 0}
          slots={{
            loadingOverlay: LoaderUI.LoadingOverlay, // custom loader
          }}
          getRowId={(row: any) => row.id} // Ensure proper row ID handling
          onRowClick={(params) => {
            setIsModalOpen(true)
            setSelectedField(params.row)
          }}
        />
        {isModalOpen && (
          <AddUpdateFieldValidationDialog
            isOpen={isModalOpen}
            handleClose={() => {
              setIsModalOpen(false)
              setSelectedField({})
            }}
            action={selectedField?.id ? 'Update' : 'Add'}
            selectedFieldData={selectedField?.id ? selectedField : {}}
            handleSubmit={(response: any) => {
              handleSavedFieldValidation(response)
            }}
          />
        )}
      </Box>
    </HasPermission>
  )
}

export default FieldValidationTable
