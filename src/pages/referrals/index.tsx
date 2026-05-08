import React, { useEffect, useState } from 'react'
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridRenderCellParams,
  GridToolbarFilterButton,
  GridFilterModel,
  GridColDef,
} from '@mui/x-data-grid'
import { Box, Typography, Chip, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { statusColors } from '@/contants/utils'
import LoaderUI from '@/components/loader/loader'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { KycService } from '@/services/kyc.service'

const ReferralTable: React.FC = () => {
  const [referralData, setReferralData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const helper = new HelperService()
  const local_service = new LocalStorageService()
  const kyc_service = new KycService()

  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>({})
  const apiRef = React.useRef<any>(null)

  useEffect(() => {
    fetchReferralListingData()
  }, [])

  const fetchReferralListingData = async () => {
    try {
      setIsLoading(true)
      const response = await kyc_service.getAllReferrals()
      setReferralData(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const columns = [
    {
      field: 'countryCode',
      headerName: 'Country Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'code',
      headerName: 'Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const status = params?.row?.status?.toUpperCase?.() || ''

        if (!status) {
          return null // 👈 empty ho toh chip hi na render karo
          // OR return <Chip label="N/A" size="small" />; // fallback chahiye toh
        }

        return (
          <Chip
            label={status}
            sx={{
              backgroundColor: statusColors[status] || 'grey',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        )
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },

    {
      field: 'applicantId',
      headerName: 'Applicant ID',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(`/applicant-details/${params.value}`)}>
          {params.value}
        </span>
      ),
    },
    {
      field: 'createdLocalDateTime',
      headerName: 'Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => helper.convertDateAndTime(params?.row?.createdLocalDateTime),
    },
  ]

  const getVisibleFilteredRows = () => {
    const visibleCols = columns.filter((col) => columnVisibilityModel[col.field] !== false && col.field !== 'id1')

    const filteredRows = referralData.filter((row: any) =>
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
    doc.text('Referral Listing Report', 40, 40)
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 60,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [0, 80, 153], textColor: 255 },
    })
    doc.save('Referral_List.pdf')
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
    // <HasPermission permission={'canRead'} module={local_service.get_modules()?.BOP}>
    //     </HasPermission>
    <Box sx={{ width: '80vw', height: '70vh' }}>
      <Typography variant="h4" gutterBottom>
        <strong>Referral Listing </strong>
      </Typography>
      {referralData && (
        <DataGrid
          apiRef={apiRef}
          rows={referralData || []}
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
          getRowId={(row: any) => row.id}
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
  )
}

export default ReferralTable
