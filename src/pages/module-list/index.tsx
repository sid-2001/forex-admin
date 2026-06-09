import React, { useEffect, useState } from 'react'
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton } from '@mui/x-data-grid'
import { Box, Typography, Button, Modal, Grid, TextField, FormControl, MenuItem, Select } from '@mui/material'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { UserService } from '@/services/user.service'
import { useTheme } from '@emotion/react'
import LoaderUI from '@/components/loader/loader'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Edit } from '@mui/icons-material'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
const user_service = new UserService()
const helper = new HelperService()
const local_service = new LocalStorageService()

const AddUpdateModuleDialog: React.FC<any> = ({ action = 'Add', handleClose, handleSubmit, isOpen, selectedModuleData = {} }) => {
  const [moduleData, setModuleData] = useState<any>({})
  const inputLabelStyle = {
    color: 'black',
    textDecoration: 'bold',
    fontWeight: 800,
    fontStyle: 'bold',
  }

  useEffect(() => {
    if (selectedModuleData?.moduleId) {
      setModuleData(selectedModuleData)
    }
  }, [selectedModuleData])

  const handleModuleSubmit = async () => {
    try {
      let response
      if (selectedModuleData?.moduleId) {
        response = await user_service.updateModule({ ...moduleData, moduleId: selectedModuleData?.moduleId }, local_service.get_staff_id())
      } else {
        response = await user_service.createModule(moduleData, local_service.get_staff_id())
      }
      setModuleData({})
      handleSubmit({ ...response.data })
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: any; value: any }>) => {
    const { name, value } = e.target
    setModuleData((prev: any) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCancelBtn = () => {
    handleClose()
    setModuleData({})
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
          {action} Module
        </Typography>
        <Box mt={4}>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={12}>
              <label style={inputLabelStyle}>Module Name</label>
              <TextField value={moduleData?.moduleName || ''} onChange={handleChange} fullWidth name="moduleName" />
            </Grid>
            <Grid item xs={12} sm={12}>
              <label style={inputLabelStyle}>Module Description</label>
              <TextField value={moduleData?.moduleDescription || ''} onChange={handleChange} fullWidth name="moduleDescription" rows={5} />
            </Grid>
            <Grid item xs={12} sm={12}>
              <label style={inputLabelStyle}>Module Link</label>
              <TextField value={moduleData?.moduleLink || ''} onChange={handleChange} fullWidth name="moduleLink" />
            </Grid>
            <Grid item xs={12} sm={12}>
              <FormControl fullWidth>
                <label style={inputLabelStyle}>Module Status</label>
                <Select
                  variant="outlined"
                  name="moduleStatus"
                  value={moduleData.moduleStatus || ''}
                  onChange={(e) => {
                    setModuleData((prev: any) => ({
                      ...prev,
                      moduleStatus: e.target.value,
                    }))
                  }}
                >
                  <MenuItem value={'active'}>Active</MenuItem>
                  <MenuItem value={'inactive'}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MODULE, 'canCreate')}
            onClick={() => handleModuleSubmit()}
            sx={{ mt: 2 }}
          >
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

const ModuleTable: React.FC = () => {
  const [moduleData, setModuleData] = useState<any>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<any>({})
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>({})

  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)

  const MODULE_COLUMNS = [
    {
      field: 'moduleName',
      headerName: 'Module Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'moduleDescription',
      headerName: 'Module Description',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'moduleLink',
      headerName: 'Module Link',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'createdLocalDateTime',
      headerName: 'Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return helper.convertDateAndTime(params?.row?.createdLocalDateTime)
      },
    },
    {
      field: 'moduleStatus',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return <div>{params.row.moduleStatus}</div>
      },
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<Edit />}
          onClick={() => {
            setSelectedModule(params.row)
            setIsModalOpen(true)
          }}
          disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MODULE, 'canUpdate')}
        >
          Edit
        </Button>
      ),
    },
  ]

  useEffect(() => {
    fetchModuleListingData()
  }, [])

  const fetchModuleListingData = async () => {
    try {
      const response: any = await user_service.getAllModulesData()
      setModuleData(response)
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const handleSavedModule = (data: any) => {
    if (selectedModule?.moduleId) {
      const filteredItems = moduleData.map((x: any) => (x.moduleId === data.moduleId ? data : x))
      setModuleData([...filteredItems])
    } else {
      setModuleData([...moduleData, data])
    }
    setIsModalOpen(false)
    settype('success')
    setText(selectedModule?.moduleId ? 'Module updated successfully!' : 'Module created successfully!')
    setOpen(true)

    setTimeout(() => {
      window.location.reload()
    }, 1200)

    setSelectedModule({})
  }
  const theme = useTheme()
  const CustomToolbar = ({ rows, columns }: any) => {
    const handleDownloadCSV = () => {
      const visibleCols = columns.filter(
        //@ts-ignore
        (col) => columnVisibilityModel[col.field] !== false && col.field !== 'action',
      )
      const headers = visibleCols.map((col: any) => col.headerName)
      const csvRows = [headers.join(','), ...rows.map((row: any) => visibleCols.map((col: any) => `"${row[col.field] || ''}"`).join(','))].join('\n')

      const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', 'modules.csv')
      link.click()
    }

    const handleDownloadPDF = () => {
      const doc = new jsPDF()
      const visibleCols = columns.filter(
        //@ts-ignore
        (col) => columnVisibilityModel[col.field] !== false && col.field !== 'action',
      )
      const tableColumn = visibleCols.map((col: any) => col.headerName)
      const tableRows = rows.map((row: any) => visibleCols.map((col: any) => row[col.field] || ''))

      autoTable(doc, { head: [tableColumn], body: tableRows })
      doc.save('modules.pdf')
    }

    return (
      <GridToolbarContainer sx={{ gap: 1, py: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <Button onClick={handleDownloadCSV} startIcon={<DownloadIcon />} size="small" variant="outlined">
          CSV
        </Button>
        <Button onClick={handleDownloadPDF} startIcon={<PictureAsPdfIcon />} size="small" variant="outlined">
          PDF
        </Button>
        <Button onClick={() => {}} startIcon={<FindReplaceIcon />} size="small" variant="outlined">
          Reset Filters
        </Button>
      </GridToolbarContainer>
    )
  }

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MODULE}>
      <Box sx={{ width: '80vw', height: '70vh' }}>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <Box>
            <Typography variant="h4" gutterBottom>
              <strong>Modules</strong>
            </Typography>
          </Box>
          <Box>
            <Button
              variant="contained"
              disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MODULE, 'canCreate')}
              onClick={() => {
                setIsModalOpen(true)
              }}
            >
              Add Module
            </Button>
          </Box>
        </Box>
        <DataGrid
          columns={MODULE_COLUMNS}
          rows={moduleData}
          getRowId={(row: any) => row.moduleId}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(model) => setColumnVisibilityModel(model)}
          slots={{
            toolbar: () => <CustomToolbar rows={moduleData} columns={MODULE_COLUMNS} />,
            loadingOverlay: LoaderUI.LoadingOverlay,
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 20, page: 0 } },
          }}
          pageSizeOptions={[10]}
          loading={moduleData.length === 0}
          disableColumnMenu
        />
        {isModalOpen && (
          <AddUpdateModuleDialog
            isOpen={isModalOpen}
            handleClose={() => {
              setIsModalOpen(false)
              setSelectedModule({})
            }}
            action={selectedModule?.moduleId ? 'Update' : 'Add'}
            selectedModuleData={selectedModule?.moduleId ? selectedModule : {}}
            handleSubmit={(response: any) => {
              handleSavedModule(response)
            }}
          />
        )}
      </Box>
    </HasPermission>
  )
}

export default ModuleTable
