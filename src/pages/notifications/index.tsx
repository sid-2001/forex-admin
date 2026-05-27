import React, { useEffect, useState } from 'react'
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridFilterModel, GridColDef } from '@mui/x-data-grid'
import { Box, Typography, IconButton, Chip, Button } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { statusColors } from '@/contants/utils'
import LoaderUI from '@/components/loader/loader'
import { useTheme } from '@emotion/react'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import NotificationService from '@/services/notification.service'

const Notifications: React.FC = () => {
  const [notificationData, setNotificationData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const helper = new HelperService()
  const local_service = new LocalStorageService()
  const notificationService = new NotificationService()
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>({})
  const apiRef = React.useRef<any>(null)

  useEffect(() => {
    fetchNotificationListingData()
  }, [])

  const fetchNotificationListingData = async () => {
    try {
      setIsLoading(true)
      const response = await notificationService.getAll()
      setNotificationData(response?.data)
      setIsLoading(false)
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const columns = [
    {
      field: 'notificationTypeCode',
      headerName: 'Notification Type Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'module',
      headerName: 'Module',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'countryCode',
      headerName: 'Country Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'notificationContent',
      headerName: 'Notification Content',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'subject',
      headerName: 'Subject',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },

    {
      field: 'createdLocalDateTime',
      headerName: 'Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return helper.convertDateAndTime(params.row.createdLocalDateTime)
      },
    },
    // {
    //   field: 'id1',
    //   headerName: 'Action',
    //   flex: 1,
    //   headerClassName: 'super-app-theme--header',
    //   renderCell: (params: any) => (
    //     <IconButton
    //       onClick={() => {
    //         navigate(`/bop-details/${params.row.transaction_number}/${params.row.transaction_attempt}`)
    //       }}
    //     >
    //       <VisibilityIcon
    //         style={{
    //           cursor: 'pointer',
    //         }}
    //       />
    //     </IconButton>
    //   ),
    // },
  ]
  const getVisibleFilteredRows = () => {
    const visibleCols = columns.filter((col) => columnVisibilityModel[col.field] !== false && col.field !== 'id1')

    const filteredRows = notificationData.filter((row: any) =>
      filterModel.items.every((filter) => {
        if (!filter.value) return true
        const cellValue = row[filter.field]?.toString().toLowerCase() || ''
        return cellValue.includes(filter.value.toLowerCase())
      }),
    )

    return { visibleCols, filteredRows }
  }
  const handleExportCSV = () => {
    const { visibleCols, filteredRows } = getVisibleFilteredRows()

    if (!filteredRows.length) {
      alert('No matching rows to export!')
      return
    }

    const headers = visibleCols.map((col) => col.headerName).join(',')
    const rows = filteredRows.map((row: any) => visibleCols.map((col) => `"${row[col.field] || ''}"`).join(','))

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'BOP_List.csv')
    link.click()
  }

  const handleExportPDF = () => {
    const { visibleCols, filteredRows } = getVisibleFilteredRows()

    if (!filteredRows.length) {
      alert('No matching rows to export!')
      return
    }

    const headers = visibleCols.map((col) => col.headerName)
    const data = filteredRows.map((row: any) => visibleCols.map((col) => row[col.field] || ''))

    const doc = new jsPDF({ unit: 'pt' })
    doc.setFontSize(14)
    doc.text('BOP Listing Report', 40, 40)
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 60,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [0, 80, 153], textColor: 255 },
    })
    doc.save('BOP_List.pdf')
  }
  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ justifyContent: 'flex-start', gap: 1, py: 1 }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />

      <Button variant="outlined" color="primary" size="small" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
        CSV
      </Button>

      <Button variant="outlined" color="primary" size="small" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF}>
        PDF
      </Button>

      <Button variant="outlined" color="primary" size="small" startIcon={<FindReplaceIcon />} onClick={() => setFilterModel({ items: [] })}>
        Reset Filters
      </Button>
    </GridToolbarContainer>
  )

  return (
    <Box sx={{ width: '80vw', height: '70vh' }}>
      <Typography variant="h4" gutterBottom>
        <strong>NOTIFICATION LISTING</strong>
      </Typography>
      {notificationData && (
        <DataGrid
          apiRef={apiRef}
          rows={notificationData || []}
          //@ts-ignore
          columns={columns}
          filterModel={filterModel}
          onFilterModelChange={(model) => setFilterModel(model)}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(model) => setColumnVisibilityModel(model)}
          initialState={{
            pagination: { paginationModel: { pageSize: 20, page: 0 } },
          }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          loading={isLoading}
          getRowId={(row: any) => row.notificationTypeCode}
          slots={{
            toolbar: CustomToolbar,
            loadingOverlay: LoaderUI.LoadingOverlay,
          }}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#005099',
              color: 'white',
            },
            '& .MuiDataGrid-cell': { fontSize: '14px' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', fontSize: '16px' },
          }}
          disableColumnMenu
        />
      )}
    </Box>
    // <HasPermission permission={'canRead'} module={local_service.get_modules()?.BOP}>
    // </HasPermission>
  )
}

export default Notifications
