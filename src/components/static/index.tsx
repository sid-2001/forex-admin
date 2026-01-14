import React, { useState, useEffect } from 'react'
import { DataGrid, GridToolbarContainer, GridToolbarExport, GridActionsCellItem } from '@mui/x-data-grid'
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Box,
  FormControlLabel,
  Checkbox,
  useTheme,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import staticdataService from '@/services/staticdata.service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState, staticTableState } from '@/states/state'
import LoaderUI from '@/components/loader/loader'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { HelperService } from '@/helpers/helper'
import static_list from '@/contants/static.data'

const StaticDataGrid = ({
  //@ts-ignore
  data,
  //@ts-ignore
  apiEndpoint,
  primaryKey = 'id',
  //@ts-ignore
  title = 'Data Grid',
}) => {
  const [rows, setRows] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentRow, setCurrentRow] = useState(null)
  const [formData, setFormData] = useState<any>({})
  const [columns, setColumns] = useState([])
  const [text, setText] = useRecoilState(alertTextState)
  const [type, setType] = useRecoilState(alertTypeState)
  const [open, setOpen] = useRecoilState(alertState)
  const [date, setDate] = useState(null)
  const [staticTable, setStaticTable] = useRecoilState<{
    name: string
    'primary-key': string
    api: string
    listname: string
    updatePrimaryKey: String
  }>(
    //@ts-ignore
    staticTableState,
  )

  // Initialize component with data
  const static_service = new staticdataService()
  const local_service = new LocalStorageService()
  const helper = new HelperService()

  useEffect(() => {
    if (data && data?.length > 0) {
      setRows(data)
      generateColumnsAndFormModel(data[0])
    }
  }, [data])

  useEffect(() => {
    if (!apiEndpoint) return

    setRows([]) // clear previous data while loading new
    static_service
      .staticData(apiEndpoint, {
        action: 'READ_ALL',
      })
      .then((data) => {
        if (data?.data.length > 0) {
          setRows(data.data)
          generateColumnsAndFormModel(data.data[0])
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }, [apiEndpoint]) // 🚨 KEY CHANGE HERE

  // Generate columns and form model based on first data item
  const generateColumnsAndFormModel = (sampleData: any) => {
    const generatedColumns = []
    const formModel = {}

    Object.keys(sampleData).forEach((key) => {
      if (key === 'actions') return

      // Detect field type
      let fieldType = typeof sampleData[key]
      if (key.toLowerCase().includes('is') || key.toLowerCase().includes('has')) fieldType = 'boolean'
      if (key.toLowerCase().includes('date')) {
        generatedColumns.push({
          field: key,
          headerName: formatHeaderName(key),
          width: getColumnWidth(key),
          flex: 1,
          type: 'date',

          editable: key !== primaryKey,
          headerClassName: 'super-app-theme--header',
          valueGetter: (params: any) => (params?.value ? new Date(params.value) : null),
          valueFormatter: (params: any) => (params?.value ? params.value.toLocaleDateString() : ''),
        })
      } else {
        generatedColumns.push({
          field: key,
          headerName: formatHeaderName(key),
          width: getColumnWidth(key),
          flex: 1,
          type: fieldType,
          editable: key !== primaryKey,
          headerClassName: 'super-app-theme--header',
        })
      }
      //@ts-ignore
      formModel[key] = sampleData[key] !== null ? sampleData[key] : ''
    })

    // Add actions column
    generatedColumns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      getActions: (params: any) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          disabled={!helper.checkUserHasPermission(local_service.get_modules()?.STATIC_DATA, 'canUpdate')}
          onClick={() => handleEditClick(params.row)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          disabled={!helper.checkUserHasPermission(local_service.get_modules()?.STATIC_DATA, 'canDelete')}
          onClick={() => handleDeleteClick(params.row[primaryKey])}
        />,
      ],
    })
    //@ts-ignore
    setColumns(generatedColumns)
    setFormData(formModel)
  }

  // Helper function to format header names
  const formatHeaderName = (key: any) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: any) => str.toUpperCase())
  }

  const handleChange = (event: any) => {
    const selectedTable = static_list.find((table: any) => table.name === event.target.value)
    if (selectedTable) {
      setStaticTable(selectedTable)
    }
  }

  // Helper function to determine column width
  const getColumnWidth = (key: any) => {
    const defaultWidths = {
      id: 100,
      name: 150,
      description: 200,
      url: 250,
      email: 200,
      date: 120,
      status: 120,
      amount: 120,
      price: 120,
      default: 150,
    }
    //@ts-ignore
    return defaultWidths[key.toLowerCase()] || defaultWidths.default
  }

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
      </GridToolbarContainer>
    )
  }

  // Generate a simple ID if not provided
  const generateId = () => {
    return `row-${Math.random().toString(36).substr(2, 9)}`
  }

  const handleFormChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEditClick = (row: any) => {
    setEditMode(true)
    setCurrentRow(row)
    setFormData(row)
    setOpenDialog(true)
  }

  const handleDeleteClick = async (id: any) => {
    try {
      await callApi({
        action: 'DELETE',
        data: { [primaryKey]: id },
      })
      setRows(rows.filter((row) => row[primaryKey] !== id))
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleAddClick = () => {
    setEditMode(false)
    // Create empty form with all fields
    const emptyForm = {}
    Object.keys(formData).forEach((key) => {
      //@ts-ignore
      emptyForm[key] = key === primaryKey ? generateId() : ''
    })
    setFormData(emptyForm)
    setOpenDialog(true)
  }

  const handleSubmit = async () => {
    try {
      const action = editMode ? 'UPDATE' : 'CREATE'

      const response = await callApi({
        action,
        data: formData,
      })

      if (editMode) {
        setRows(
          //@ts-ignore
          rows.map((row) => (row[primaryKey] === currentRow[primaryKey] ? formData : row)),
        )
      } else {
        setRows(
          //@ts-ignore
          [...rows, formData],
        )
      }
      setOpenDialog(false)
    } catch (error) {
      console.error('Operation failed:', error)
      setOpenDialog(false)
    }
  }

  const callApi = async (payload: any) => {
    if (primaryKey in payload?.data) {
      let updateprimaryKeyName: any = staticTable?.updatePrimaryKey
      payload[updateprimaryKeyName] = payload?.data[primaryKey]
    }
    const response = await static_service.staticData(apiEndpoint, payload)
    if (!response.status) {
      setType('error')
      setText(`Error in Operating Data`)
      setOpen(true)
      throw new Error('Network response was not ok')
    }
    return response.data
  }

  const renderFormFields = () => {
    return columns.map((column: any) => {
      if (column.field === 'actions') return null
      const fieldValue = formData[column.field] ?? ''

      const commonProps = {
        key: column.field,
        label: column.headerName,
        name: column.field,
        value: fieldValue,
        onChange: handleFormChange,
        fullWidth: true,
        margin: 'normal',
        required: column.field === primaryKey,
        disabled: column.field === primaryKey && editMode,
        sx: { mt: 2 },
      }

      // Handle different field types
      switch (column.type) {
        case 'number':
          //@ts-ignore
          return <TextField {...commonProps} type="number" />

        case 'boolean':
          return (
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(fieldValue)}
                  onChange={(e) =>
                    handleFormChange({
                      target: {
                        //@ts-ignore
                        name: column.field,
                        value: e.target.checked,
                      },
                    })
                  }
                  //@ts-ignore
                  name={column.field}
                />
              }
              label={
                //@ts-ignore
                column.headerName
              }
              sx={{ mt: 2 }}
            />
          )

        case 'date':
          return (
            <TextField
              onChange={(e) => {
                const { name, value } = e.target
                setFormData((prev: any) => ({
                  ...prev,
                  [column.field]: value,
                }))
                //@ts-ignore
                setDate(e.target.value)
              }}
              value={date}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          )

        case 'select':
        case 'dropdown':
          return (
            //@ts-ignore
            <TextField
              {...commonProps}
              select
              SelectProps={{
                native: true,
              }}
            >
              <option value=""></option>

              {
                //@ts-ignore
                column.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              }
            </TextField>
          )

        default:
          return (
            //@ts-ignore
            <TextField
              //@ts-ignore
              {
                //@ts-ignore
                ...commonProps
              }
            />
          )
      }
    })
  }

  return (
    <>
      {staticTable?.listname && (
        <Typography variant="h4" fontWeight={600} gutterBottom>
          {staticTable.listname}
        </Typography>
      )}
      {/* Dropdown */}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <FormControl sx={{ width: '20%' }}>
          <InputLabel>Select Table</InputLabel>
          <Select value={staticTable?.name || ''} label="Select Table" onChange={handleChange}>
            {static_list.map((table: any) => (
              <MenuItem key={table.name} value={table.name}>
                {table.listname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Add />}
          onClick={handleAddClick}
          disabled={!helper.checkUserHasPermission(local_service.get_modules()?.STATIC_DATA, 'canCreate')}
        >
          Add Data
        </Button>
      </Box>

      <Box sx={{ height: 550 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 20, page: 0 },
            },
          }}
          pageSizeOptions={[10]}
          loading={rows.length === 0}
          slots={{
            loadingOverlay: LoaderUI.LoadingOverlay, // custom loader
          }}
          disableRowSelectionOnClick
          //@ts-ignore
          components={{
            Toolbar: CustomToolbar,
          }}
          getRowId={(row) => row[primaryKey]}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#1976d2',
              color: 'white',
              fontSize: '14px',
            },
          }}
        />
      </Box>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Record' : 'Add New Record'}</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { sm: '1fr', md: 'repeat(2, 1fr)' },
              gap: '20px',
              mt: 2,
            }}
          >
            {renderFormFields()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={
              editMode
                ? !helper.checkUserHasPermission(local_service.get_modules()?.STATIC_DATA, 'canUpdate')
                : !helper.checkUserHasPermission(local_service.get_modules()?.STATIC_DATA, 'canCreate')
            }
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default StaticDataGrid
