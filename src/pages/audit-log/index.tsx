import React, { useEffect, useState, useCallback } from 'react'
import { DataGrid, GridFilterModel } from '@mui/x-data-grid'
import { Box, Typography, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { AuditService } from '@/services/audit.services'
import LoaderUI from '@/components/loader/loader'
import moment from 'moment'
import { GridPaginationModel } from '@mui/x-data-grid'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useNavigate, useLocation } from 'react-router-dom'

const AuditLogTable: React.FC = () => {
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
  const [logType, setlogType] = useState('transaction_audit_log')

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
  const logtype = queryParams.get('logtype')

  const auditLogTypes = [
    { label: 'User Audit Log', value: 'user_audit_log' },
    { label: 'Transaction Audit Log', value: 'transaction_audit_log' },
    { label: 'Staff Audit Log', value: 'staff_audit_log' },
    { label: 'Applicant Beneficiary Audit Log', value: 'applicant_beneficiary_audit_log' },
    { label: 'Bop Audit Log', value: 'bop_audit_log' },
  ]

  useEffect(() => {
    if (!logtype) {
      setlogType(auditLogTypes[0]?.value)
    } else {
      setlogType(logtype)
    }
    // fetchAuditListingData()
  }, [logType, paginationModel])

  // const fetchAuditListingData = useCallback(async () => {
  //   try {
  //     setIsLoading(true)
  //     const { page, pageSize } = paginationModel
  //     const response = await auditLogService.getAuditLogsListing(logType, page, pageSize)
  //     setAuditLogData(response.data)
  //     setRowCount(response?.totalItems)
  //     // setPaginationModel({
  //     //   page: 0,
  //     //   pageSize: response?.totalPages,
  //     // })

  //     setIsLoading(false)
  //   } catch (error) {
  //     console.error('There was a problem with the fetch operation:', error)
  //   }
  // }, [logType, paginationModel])

  // handle page or pageSize change
  const handlePaginationChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel)
  }

  const columns = [
    {
      field: 'auditId',
      headerName: 'Audit ID',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'entityId',
      headerName: 'Entity ID',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'errorMessage',
      headerName: 'Error Message',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'eventTime',
      headerName: 'Event Time',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return <div>{moment(params?.row?.eventTime).format('DD-MM-YYYY')}</div>
      },
    },
    {
      field: 'eventType',
      headerName: 'Event Type',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'ipAddress',
      headerName: 'IP',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },

    {
      field: 'performedBy',
      headerName: 'Performed By',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },

    {
      field: 'userAgent',
      headerName: 'Device',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
  ]

  const handleChange = (event: any) => {
    const selectedTable = auditLogTypes.find((table: any) => table.value === event.target.value)
    if (selectedTable) {
      setlogType(selectedTable?.value)
      navigate(`/audit-logs?logtype=${selectedTable?.value}`)
    }
  }

  return (
    <Box sx={{ width: '80vw', height: '70vh' }}>
      <HasPermission permission={'canRead'} module={local_service.get_modules()?.AUDIT_LOGS}>
        <Typography variant="h4" gutterBottom>
          <strong>Audit Logs</strong>
        </Typography>
        <FormControl sx={{ mb: 2, width: '20%', marginTop: '1%' }}>
          <InputLabel>Select Audit Log</InputLabel>
          <Select value={logType || ''} label="Select Audit Log" onChange={handleChange}>
            {auditLogTypes.map((table: any) => (
              <MenuItem key={table.value} value={table.value}>
                {table.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {auditLogData && (
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
            columns={columns}
            rows={auditLogData || []}
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

export default AuditLogTable
