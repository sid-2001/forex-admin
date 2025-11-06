import React, { useEffect, useState } from 'react'
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton } from '@mui/x-data-grid'
import { Box, Typography, useTheme, Card, Stack, Button } from '@mui/material'
import { HelperService } from '@/helpers/helper'
import LoaderUI from '@/components/loader/loader'
import { statusColors } from '@/contants/utils'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'

const sarbdata = [
  {
    id: 1,
    transaction_number: 'ZAOWRM250811IN0001',
    created_at: Date.now(),
    error_code: '401',
    error_description: 'Invalid Gender',
    transaction_attempt: 2,
    transaction_status: 'Nack',
  },
  {
    id: 2,
    transaction_number: 'ZAOWRM250811IN0007',
    created_at: Date.now(),
    error_code: '501',
    error_description: 'Invalid and mandatory postal address line 1',
    transaction_attempt: 1,
    transaction_status: 'Ack',
  },
]

const SarbErrorsListing: React.FC = () => {
  const [sarbData, setSarbData] = useState(sarbdata)
  const helper = new HelperService()
  const local_service = new LocalStorageService()

  // DataGrid state
  const [filterModel, setFilterModel] = useState<any>({ items: [] })
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<any>({})

  useEffect(() => {
    // fetchSarbErrorsData()
  }, [])

  const fetchSarbErrorsData = async () => {
    try {
      // const response = await service.getSarbErrors()
      // setSarbData(response)
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const columns = [
    {
      field: 'transaction_number',
      headerName: 'Transaction No.',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'created_at',
      headerName: 'Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => helper.convertDateAndTime(params.row.created_at),
    },
    {
      field: 'error_code',
      headerName: 'Error Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'error_description',
      headerName: 'Error Description',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'transaction_attempt',
      headerName: 'Attempt No',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'transaction_status',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <span
          style={{
            color: 'white',
            padding: '4px 16px',
            borderRadius: '6px',
            background: statusColors[params?.row?.transaction_status?.toUpperCase()],
          }}
        >
          {params?.row?.transaction_status?.toUpperCase()}
        </span>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: () => <a>View More</a>,
    },
  ]

  // CSV export
  const handleExportCSV = () => {
    const visibleCols = columns.filter((col) => columnVisibilityModel[col.field] !== false)
    const headers = visibleCols.map((col) => col.headerName).join(',')
    //@ts-ignore
    const rows = sarbData.map((row) => visibleCols.map((col) => row[col.field] ?? '').join(','))
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'SarbErrors.csv')
    link.click()
  }

  // PDF export
  const handleExportPDF = () => {
    const visibleCols = columns.filter((col) => columnVisibilityModel[col.field] !== false)
    const headers = visibleCols.map((col) => col.headerName)
    //@ts-ignore
    const data = sarbData.map((row) => visibleCols.map((col) => row[col.field] ?? ''))
    const doc = new jsPDF({ unit: 'pt' })
    doc.setFontSize(14)
    doc.text('Sarb Errors Report', 40, 40)
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 60,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [0, 80, 153], textColor: 255 },
    })
    doc.save('SarbErrors.pdf')
  }

  // Custom Toolbar
  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ justifyContent: 'flex-start', gap: 1, py: 1 }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
        CSV
      </Button>
      <Button variant="outlined" size="small" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF}>
        PDF
      </Button>
      <Button variant="outlined" size="small" startIcon={<FindReplaceIcon />} onClick={() => setFilterModel({ items: [] })}>
        Reset Filters
      </Button>
    </GridToolbarContainer>
  )

  return (
    <Box sx={{ width: '80vw', height: '70vh' }}>
      <HasPermission permission={'canRead'} module={local_service.get_modules()?.ERROR_CODES}>
        <Typography variant="h4" gutterBottom>
          <strong>Ack/Nack</strong>
        </Typography>

        <Stack direction="row" spacing={2} mb={2}>
          {/* Cards */}
          <Card
            sx={{
              width: 240,
              height: 120,
              background: 'linear-gradient(135deg, rgb(164, 216, 228), rgb(15, 98, 165))',
              color: 'white',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 2,
            }}
          >
            <Typography variant="body2" fontWeight={1000} fontSize={20}>
              Total Transactions
            </Typography>
            <Typography variant="h6" fontWeight="bold" align="right">
              R2
            </Typography>
          </Card>

          <Card
            sx={{
              width: 240,
              height: 120,
              background: 'linear-gradient(135deg, #21CBF3 , #4CAF50)',
              color: 'white',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 2,
            }}
          >
            <Typography variant="body2" fontWeight={1000} fontSize={20}>
              Ack
            </Typography>
            <Typography variant="h6" fontWeight="bold" align="right">
              R1
            </Typography>
          </Card>

          <Card
            sx={{
              width: 240,
              height: 120,
              background: 'linear-gradient(135deg,rgb(93, 206, 231), #ff416c)',
              color: 'white',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 2,
            }}
          >
            <Typography variant="body2" fontWeight={1000} fontSize={20}>
              Nack
            </Typography>
            <Typography variant="h6" fontWeight="bold" align="right">
              R1
            </Typography>
          </Card>
        </Stack>

        {sarbData && (
          <DataGrid
            sx={{
              width: '100%',
              '& .MuiDataGrid-columnHeaders': { '& .super-app-theme--header': { backgroundColor: '#005099', color: 'white' } },
              '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
              '& .MuiDataGrid-cell': { fontSize: '14px' },
              '& .super-app-theme--header': { fontSize: '16px' },
            }}
            columns={columns}
            rows={sarbData}
            filterModel={filterModel}
            onFilterModelChange={(model) => setFilterModel(model)}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(model) => setColumnVisibilityModel(model)}
            initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
            pageSizeOptions={[10, 20, 50]}
            loading={sarbData.length === 0}
            getRowId={(row: any) => row.id}
            slots={{
              toolbar: CustomToolbar,
              loadingOverlay: LoaderUI.LoadingOverlay,
            }}
            disableColumnMenu
          />
        )}
      </HasPermission>
    </Box>
  )
}

export default SarbErrorsListing
