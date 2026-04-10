import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { DataGrid, GridFilterModel } from '@mui/x-data-grid'
import { Box, Typography, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { AuditService } from '@/services/audit.services'
import LoaderUI from '@/components/loader/loader'
import { GridPaginationModel } from '@mui/x-data-grid'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useNavigate, useLocation } from 'react-router-dom'

const AuditScreen: React.FC = () => {
  const [moduleFeatures, setModulefeature] = useState([])
  const [auditLogData, setAuditLogData] = useState([])
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  })

  // filter state
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [],
  })

  const [rowCount, setRowCount] = useState(0)
  const [selectedModule, setSelectedModule] = useState('')

  const { search } = useLocation()
  const navigate = useNavigate()

  const queryParams = new URLSearchParams(search)
  const [isLoading, setIsLoading] = useState(false)

  // handle filter changes
  const handleFilterChange = (newFilterModel: GridFilterModel) => {
    const filter = newFilterModel.items[0]
    if (filter.field == 'id' && filter.value) {
      try {
      } catch (err) {}
    }
    console.log(filter)
    // setFilterModel(newFilterModel);
  }

  const handleResetFilter = () => {
    setFilterModel({ items: [] })
  }

  const auditLogService = new AuditService()
  const local_service = new LocalStorageService()
  //   const logtype = queryParams.get('logtype')

  const fetchModulesFeauture = async () => {
    try {
      const response = await auditLogService.getModulesListing()
      console.log(response, '=================')
      setModulefeature(response?.data || [])
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }
  useEffect(() => {
    fetchModulesFeauture()
    fetchAuditListingData()
  }, [])

  // useEffect(() => {
  // //   if (!logtype) {
  // //     setlogType(auditLogTypes[0]?.value)
  // //   } else {
  // //     setlogType(logtype)
  // //   }

  // }, [logType, paginationModel])

  const fetchAuditListingData = useCallback(async () => {
    try {
      setIsLoading(true)
      // const { page, pageSize } = paginationModel
      const response = await auditLogService.getAuditLogsListing()
      console.log(response, '=================')
      setAuditLogData(Array.isArray(response?.data) ? response.data : [])
      //   setAuditLogData(response.data)
      // setRowCount(response?.totalItems)
      // setPaginationModel({
      //   page: 0,
      //   pageSize: response?.totalPages,
      // })

      setIsLoading(false)
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }, [selectedModule, paginationModel])

  // handle page or pageSize change
  const handlePaginationChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel)
  }

  const columns = useMemo(() => {
    if (!Array.isArray(auditLogData) || auditLogData.length === 0) return []

    return Object.keys(auditLogData[0]).map((key) => ({
      field: key,
      headerName: key.replace(/_/g, ' ').toUpperCase(),
      headerClassName: 'super-app-theme--header',
      flex: 1,
      renderCell: (params: any) => params.value || '-',
    }))
  }, [auditLogData])

  const handleChange = (event: any) => {
    setSelectedModule(event.target.value)
  }

  return (
    <Box sx={{ width: '80vw', height: '70vh' }}>
      <HasPermission permission={'canRead'} module={local_service.get_modules()?.AUDIT_LOGS}>
        <Typography variant="h4" gutterBottom>
          <strong>Audit Logs</strong>
        </Typography>
        <FormControl sx={{ mb: 2, width: '50%', marginTop: '1%' }}>
          <InputLabel>Select Audit Log</InputLabel>
          <Select value={selectedModule || ''} label="Select Audit Log" onChange={handleChange}>
            {moduleFeatures.map((table: any) => (
              <MenuItem key={table.moduleFeatureCode} value={table.moduleFeatureName}>
                {table.moduleFeatureName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {auditLogData && auditLogData.length > 0 && (
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
            columns={columns || []}
            rows={Array.isArray(auditLogData) ? auditLogData : []}
            // initialState={{
            //   pagination: {
            //     paginationModel: { pageSize: 20, page: 0 },
            //   },
            // }}

            pageSizeOptions={[10, 20, 50]}
            paginationMode="server"
            filterMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationChange}
            filterModel={filterModel}
            onFilterModelChange={handleFilterChange}
            rowCount={1000}
            // loading={getLoadingState()}

            loading={isLoading}
            slots={{
              loadingOverlay: LoaderUI.LoadingOverlay, // custom loader
            }}
            getRowId={(row: any) => row.auditId}
          />
        )}
      </HasPermission>
    </Box>
  )
}

export default AuditScreen
