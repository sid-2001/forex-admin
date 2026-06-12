import React, { useEffect, useState } from 'react'
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridFilterModel, GridColDef } from '@mui/x-data-grid'
import { Box, Typography, IconButton, Chip, Button } from '@mui/material'
import { useNavigate, Link } from 'react-router-dom'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { statusColors } from '@/contants/utils'
import { BopService } from '@/services/bop.services'
import LoaderUI from '@/components/loader/loader'
import { useTheme } from '@emotion/react'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const BopTable: React.FC = () => {
  const [bopData, setBopData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const helper = new HelperService()
  const local_service = new LocalStorageService()
  const bopService = new BopService()
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>({})
  const apiRef = React.useRef<any>(null)
  const userCountry = local_service?.get_staff_country()
  useEffect(() => {
    fetchBopListingData()
  }, [])

  const fetchBopListingData = async () => {
    try {
      setIsLoading(true)
      const response = await bopService.getBopListing()
      setBopData(response)
      setIsLoading(false)
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }
  const renderBeneficiaryFullName = (row: any) => {
    const { benificiary_first_name, benificiary_last_name } = row
    return row?.benificiary_middle_name
      ? `${benificiary_first_name} ${row?.benificiary_middle_name} ${benificiary_last_name}`
      : `${benificiary_first_name} ${benificiary_last_name}`
  }

  const renderStatus = (status: string) => (status === 'IN_PROGRESS' ? 'IN PROGRESS' : status)

  const columns = [
    {
      field: 'transaction_number',
      headerName: 'Transaction No.',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const theme = useTheme()

        return (
          //@ts-ignore
          <Link to={`/transaction-detail/${params?.row?.transaction_number}`} style={{ color: theme.palette.text.primary }}>
            {params?.row?.transaction_number}
          </Link>
        )
      },
    },
    {
      field: 'transaction_attempt',
      headerName: 'Transaction Attempt No',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'name',
      headerName: 'Resident Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'beneficiary_name',
      headerName: 'Non Resident Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return <div>{renderBeneficiaryFullName(params?.row)}</div>
      },
    },
    {
      field: 'transaction_status',
      headerName: 'Transaction Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const status = params?.row?.transaction_status?.toUpperCase?.() || ''

        if (!status) {
          return null // 👈 empty ho toh chip hi na render karo
          // OR return <Chip label="N/A" size="small" />; // fallback chahiye toh
        }

        return (
          <Chip
            label={renderStatus(status)}
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
      field: 'status',
      headerName: 'Bop Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const status = params?.row?.status?.toUpperCase?.() || ''

        if (!status) {
          return null // 👈 empty ho toh chip skip
        }

        return (
          <Chip
            label={renderStatus(status)}
            sx={{
              backgroundColor: statusColors[status] || 'grey',
              color: 'white',
              fontWeight: 'bold',
            }}
            size="small"
          />
        )
      },
    },

    {
      field: 'sap_status',
      headerName: 'Sarb Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const sapStatus = params?.row?.sap_status?.toUpperCase?.() || ''

        if (!sapStatus) {
          return null // 👈 agar empty hai toh chip na dikhe
        }

        return (
          <Chip
            label={sapStatus}
            sx={{
              backgroundColor: statusColors[sapStatus] || 'grey',
              color: 'white',
              fontWeight: 'bold',
            }}
            size="small"
          />
        )
      },
    },

    {
      field: 'created_localdatetime',
      headerName: 'Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return helper.convertDateAndTime(params.row.created_localdatetime)
      },
    },
    {
      field: 'id1',
      headerName: 'Action',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <IconButton
          onClick={() => {
            navigate(`/bop-details/${params.row.transaction_number}/${params.row.transaction_attempt}`)
          }}
        >
          <VisibilityIcon
            style={{
              cursor: 'pointer',
            }}
          />
        </IconButton>
      ),
    },
  ]
  const filteredColumns = (userCountry === 'UAE' && columns.filter((col) => col.field !== 'sap_status' && col.field !== 'status')) || columns

  const getVisibleFilteredRows = () => {
    const visibleCols = filteredColumns.filter(
      (col: any) => columnVisibilityModel[col.field] !== false && col.field !== 'id1' && col.field !== 'transaction_attempt',
    )

    const filteredRows = bopData.filter((row: any) =>
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

    const rows = filteredRows.map((row: any) =>
      visibleCols
        .map((col) => {
          // if (col.field === 'transaction_attempt') return `${row.transaction_attempt}`
          if (col.field === 'beneficiary_name') return renderBeneficiaryFullName(row)
          if (col.field === 'transaction_status') return renderStatus(row.transaction_status)
          if (col.field === 'created_localdatetime') return helper.convertDateAndTime(row.created_localdatetime)
          return row[col.field] || ''
        })
        .join(','),
    )

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
    // const data = filteredRows.map((row: any) => visibleCols.map((col) => row[col.field] || ''))

    const data = filteredRows.map((row: any) =>
      visibleCols.map((col) => {
        // if (col.field === 'transaction_attempt') return `${row.transaction_attempt}`
        if (col.field === 'beneficiary_name') return renderBeneficiaryFullName(row)
        if (col.field === 'transaction_status') return renderStatus(row.transaction_status)
        if (col.field === 'created_localdatetime') return helper.convertDateAndTime(row.created_localdatetime)
        return row[col.field] || ''
      }),
    )

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
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.PAYMENT_INFORMATION}>
      <Box sx={{ width: '80vw', height: '70vh' }}>
        <Typography variant="h4" gutterBottom>
          {userCountry === 'UAE' ? <strong>Payment Information</strong> : <strong>BOP LISTING</strong>}
        </Typography>
        {bopData && (
          <DataGrid
            apiRef={apiRef}
            rows={bopData || []}
            //@ts-ignore
            columns={filteredColumns}
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
    </HasPermission>
  )
}

export default BopTable
