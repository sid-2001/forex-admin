import React, { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Typography, Button, Modal, Grid, TextField, FormControl, MenuItem, Select } from '@mui/material'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { FieldValidationService } from '@/services/fieldvalidstion.service'
import { useTheme } from '@emotion/react'
import LoaderUI from '@/components/loader/loader'

const helper = new HelperService()
const local_service = new LocalStorageService()
const field_validation_service = new FieldValidationService()
const numbersArray = Array.from({ length: 35 }, (_, i) => i + 1)

const AddUpdateFieldValidationDialog: React.FC<any> = ({ action = 'Add', handleClose, handleSubmit, isOpen, selectedFieldData = {} }) => {
  const [formData, setFormData] = useState<any>({})
  const inputLabelStyle = {
    color: 'black',
    textDecoration: 'bold',
    fontWeight: 800,
    fontStyle: 'bold',
  }

  useEffect(() => {
    if (selectedFieldData?.id) {
      setFormData(selectedFieldData)
    }
  }, [])

  const handleFormSubmit = async () => {
    try {
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
        <Box mt={4}>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={12}>
              <label style={inputLabelStyle}>Field Name</label>
              <TextField value={formData?.fieldName || ''} onChange={handleChange} fullWidth name="fieldName" />
            </Grid>
            <Grid item xs={12} sm={12}>
              <label style={inputLabelStyle}>Field Type</label>
              <TextField value={formData?.fieldType || ''} onChange={handleChange} fullWidth name="fieldType" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <label style={inputLabelStyle}>Min Length</label>
              <Select
                variant="outlined"
                name="minLength"
                value={formData.minLength || ''}
                fullWidth
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <label style={inputLabelStyle}>Max Length</label>
              <Select
                variant="outlined"
                name="maxLength"
                fullWidth
                value={formData.maxLength || ''}
                onChange={(e) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    maxLength: e.target.value,
                  }))
                }}
              >
                {numbersArray.map((item, ind) => (
                  <MenuItem key={ind} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={12}>
              <label style={inputLabelStyle}>Special Character List</label>
              <TextField value={formData?.specialCharacterList || ''} onChange={handleChange} fullWidth name="specialCharacterList" />
            </Grid>
            <Grid item xs={12} sm={12}>
              <label style={inputLabelStyle}>Error Message</label>
              <TextField value={formData?.errorMessage || ''} onChange={handleChange} fullWidth name="errorMessage" />
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={() => handleFormSubmit()} sx={{ mt: 2 }}>
            {action}
          </Button>

          <Button variant="outlined" onClick={() => handleCancelBtn()} sx={{ mt: 2, ml: 2 }}>
            Close
          </Button>
        </Box>
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
    // <HasPermission permission={'canRead'} module={local_service.get_modules()?.MODULE}>
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
            // disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MODULE, 'canCreate')}
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
    // </HasPermission>
  )
}

export default FieldValidationTable
