import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { DataGrid, GridFilterModel } from '@mui/x-data-grid'
import { Box, Typography, FormControl, InputLabel, MenuItem, Select, Button } from '@mui/material'
import { AuditService } from '@/services/audit.services'
import LoaderUI from '@/components/loader/loader'
import { GridPaginationModel } from '@mui/x-data-grid'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import dayjs from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

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
  const [filters, setFilters] = useState({
    id: '',
    name: '',
    status: '',
    fromDate: null,
    toDate: null,
  })

  const isFilterEmpty = !filters.id && !filters.name && !filters.status && !filters.fromDate && !filters.toDate
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dropdownOptionData, setDropdownOptions] = useState({ ids: [], names: [], statuses: ['TRUE'] })

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

  const auditLogService = new AuditService()
  const local_service = new LocalStorageService()

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
  }, [])

  const fetchFiltersData = useCallback(
    async (module: string) => {
      try {
        const response = await auditLogService.getfiltersDataByModuleName(module)
        if (response?.status) {
          console.log(response.data, 'data')
          setDropdownOptions({
            ids: response?.data?.ids,
            names: response?.data?.names,
            statuses: response?.data?.statuses,
          })
        }
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error)
      }
    },
    [selectedModule],
  )

  const fetchAuditListingData = useCallback(
    async (searchStr: string) => {
      try {
        setIsLoading(true)
        // const { page, pageSize } = paginationModel
        console.log(selectedModule, 'module')
        const response = await auditLogService.getAuditLogsListingDataViaModuleName(searchStr)
        console.log(response, '=================')
        setAuditLogData(response.data || [])
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
    },
    [selectedModule, paginationModel],
  )

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
    const { value } = event.target
    setSelectedModule(value)
    fetchAuditListingData(`moduleName=${value}`)
    fetchFiltersData(value)
  }

  const rowsWithFallbackId = (rows: any) =>
    rows.map((row: any, index: any) => ({
      ...row,
      _generatedId: row.id ?? `row-${index}`,
    }))

  const handleFilterValueChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSearch = async () => {
    const payload = {
      ...filters,
      fromDate: filters.fromDate ? dayjs(filters.fromDate).format('YYYY-MM-DD HH:mm:ss.SSS') : '',
      toDate: filters.toDate ? dayjs(filters.toDate).format('YYYY-MM-DD HH:mm:ss.SSS') : '',
      moduleName: selectedModule,
    }
    const queryString = new URLSearchParams(Object.fromEntries(Object.entries(payload).filter(([_, v]) => v))).toString()
    try {
      setLoading(true)
      await fetchAuditListingData(queryString)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setFilters({
      id: '',
      name: '',
      status: '',
      fromDate: null,
      toDate: null,
    })
    fetchAuditListingData(`moduleName=${selectedModule}`)
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

        {selectedModule ? (
          <Box
            mb={2}
            display="flex"
            gap={1}
            alignItems="center"
            flexWrap="wrap"
            sx={{
              background: '#fff',
              padding: 2,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <FormControl sx={{ minWidth: 160 }} size="small">
              <InputLabel id="id-label">Search By Ids</InputLabel>
              <Select
                labelId="id-label"
                value={filters?.id}
                //@ts-ignore
                onChange={(e) => handleFilterValueChange('id', e.target.value)}
                label="Select Id"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300, // limit dropdown height if many options
                    },
                  },
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  //@ts-ignore
                  getContentAnchorEl: null,
                }}
              >
                {dropdownOptionData &&
                  dropdownOptionData?.ids.length > 0 &&
                  //@ts-ignore
                  dropdownOptionData?.ids.map((item: any, index: number) => (
                    <MenuItem key={index} value={item}>
                      {item}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 210 }} size="small">
              <InputLabel id="name-label">Search By Name</InputLabel>
              <Select
                labelId="name-label"
                value={filters?.name}
                //@ts-ignore
                onChange={(e) => handleFilterValueChange('name', e.target.value)}
                label="Select Name"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300, // limit dropdown height if many options
                    },
                  },
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  //@ts-ignore
                  getContentAnchorEl: null,
                }}
              >
                {dropdownOptionData &&
                  dropdownOptionData?.names &&
                  //@ts-ignore
                  dropdownOptionData?.names.map((item: any, index: number) => (
                    <MenuItem key={index} value={item}>
                      {item}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 210 }} size="small">
              <InputLabel id="status-label">Search By Status</InputLabel>
              <Select
                labelId="status-label"
                value={filters?.status}
                //@ts-ignore
                onChange={(e) => handleFilterValueChange('status', e.target.value)}
                label="Select status"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300, // limit dropdown height if many options
                    },
                  },
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                  //@ts-ignore
                  getContentAnchorEl: null,
                }}
              >
                {dropdownOptionData &&
                  dropdownOptionData?.statuses &&
                  //@ts-ignore
                  dropdownOptionData?.statuses.map((item: any, index: number) => (
                    <MenuItem key={index} value={item}>
                      {item}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="From Date"
                //@ts-ignore
                format="YYYY-MM-DD"
                value={filters?.fromDate}
                onChange={(newValue: any) => handleFilterValueChange('fromDate', newValue)}
                slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
                //@ts-ignore
                renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
              />

              <DatePicker
                label="To Date"
                value={filters?.toDate}
                onChange={(newValue: any) => handleFilterValueChange('toDate', newValue)}
                minDate={filters?.fromDate}
                format="YYYY-MM-DD"
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { width: 150 },
                  },
                }}
              />
            </LocalizationProvider>

            <Button variant="contained" onClick={handleSearch} disabled={isFilterEmpty || loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>

            <Button disabled={loading} variant="outlined" onClick={handleClear}>
              Clear
            </Button>

            <Box
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
            ></Box>
          </Box>
        ) : (
          <></>
        )}

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
            rows={rowsWithFallbackId(auditLogData)}
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
            getRowId={(row) => row.id || row._generatedId}
          />
        )}
      </HasPermission>
    </Box>
  )
}

export default AuditScreen
