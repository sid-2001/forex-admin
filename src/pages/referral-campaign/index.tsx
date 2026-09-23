import React, { useCallback, useEffect, useState } from 'react'
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridFilterModel, GridColDef } from '@mui/x-data-grid'
import { Box, Typography, Button } from '@mui/material'
import { UserService } from '@/services/user.service'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { HelperService } from '@/helpers/helper'
import RoleModal from '@/components/roleModal'
import LoaderUI from '@/components/loader/loader'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Edit } from '@mui/icons-material'
import MasterService from '@/services/master.service'
import dayjs from 'dayjs'

const ReferralCampaign: React.FC = () => {
  const [referralData, setReferralData] = useState<any>([])
  const [selectedData, setSelectedData] = useState<any>(null)
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>({})
  const apiRef = React.useRef<any>(null)

  const api_service = new UserService()
  const local_service = new LocalStorageService()
  const helper_service = new HelperService()
  const master_service = new MasterService()

  const fetchReferralCampaignList = useCallback(async () => {
    const { data } = await master_service.getAllReferralCampaign()
    console.log(data, '-=-=-=-=-=')
    setReferralData(data || [])
  }, [])

  useEffect(() => {
    // fetchReferralCampaignList()
  }, [])

  const handleSave = () => {
    // master_service.addRole(updatedRole, local_service.get_staff_id())
    // setSelectedData(null)
    // window.location.reload()
  }

  const columns: GridColDef[] = [
    { field: 'campaignName', headerName: 'Campaign Name', flex: 150, headerClassName: 'super-app-theme--header' },
    { field: 'description', headerName: 'Description', width: 200, headerClassName: 'super-app-theme--header' },
    {
      field: 'startDateTime',
      headerName: 'Start Date & Time',
      flex: 150,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (params.row?.startDateTime ? dayjs(params.row?.startDateTime).format('YYYY-MM-DD') : ''),
    },
    {
      field: 'endDateTime',
      headerName: 'End Date & Time',
      flex: 150,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (params.row?.endDateTime ? dayjs(params.row?.endDateTime).format('YYYY-MM-DD') : ''),
    },
    { field: 'countryCode', headerName: 'Country Code', flex: 150, headerClassName: 'super-app-theme--header' },
    { field: 'referralCode', headerName: 'Referral Code', flex: 150, headerClassName: 'super-app-theme--header' },
    { field: 'conversionRate', headerName: 'Conversion Rate', flex: 150, headerClassName: 'super-app-theme--header' },
    { field: 'points', headerName: 'Points', flex: 150, headerClassName: 'super-app-theme--header' },
    { field: 'marketSegmentCode', headerName: 'Market Segment Code', flex: 150, headerClassName: 'super-app-theme--header' },
  ]

  const getVisibleFilteredRows = () => {
    const visibleCols = columns.filter((col) => columnVisibilityModel[col.field] !== false && col.field !== 'action')
    const filteredRows = referralData.filter((row: any) =>
      filterModel.items.every((filter) => {
        if (!filter.value) return true
        const cellValue = (row as any)[filter.field]?.toString().toLowerCase() || ''
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
          if (col.field === 'totalModules') return `${row.modules.length}`
          return row[col.field] || ''
        })
        .join(','),
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'Roles_List.csv')
    link.click()
  }

  const handleExportPDF = () => {
    const { visibleCols, filteredRows } = getVisibleFilteredRows()
    if (!filteredRows.length) {
      alert('No matching rows to export!')
      return
    }

    const headers = visibleCols.map((col) => col.headerName)

    const data = filteredRows.map((row: any) =>
      visibleCols.map((col) => {
        if (col.field === 'totalModules') return `${row.modules.length}`
        return row[col.field] || ''
      }),
    )
    const doc = new jsPDF({ unit: 'pt' })
    doc.setFontSize(14)
    doc.text('Roles Report', 40, 40)

    autoTable(doc, {
      //@ts-ignore
      head: [headers],
      body: data,
      startY: 60,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [0, 80, 153], textColor: 255 },
    })
    doc.save('Roles_List.pdf')
  }

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
    <HasPermission module={local_service.get_modules()?.MASTER_DATA} permission="canRead">
      <Box sx={{ width: '90vw', height: '75vh' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">
            <strong>Referral Campaigns</strong>
          </Typography>
          <Button
            variant="contained"
            disabled={!helper_service.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
            // onClick={() => setSelectedRole('create')}
          >
            Add Referral Campaign
          </Button>
        </Box>

        <DataGrid
          apiRef={apiRef}
          rows={referralData || []}
          columns={columns}
          getRowId={(row) => row.id}
          filterModel={filterModel}
          onFilterModelChange={(model) => setFilterModel(model)}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(model) => setColumnVisibilityModel(model)}
          initialState={{ pagination: { paginationModel: { pageSize: 20, page: 0 } } }}
          pageSizeOptions={[10, 20, 50, 100]}
          disableRowSelectionOnClick
          loading={referralData.length === 0}
          slots={{ toolbar: CustomToolbar, loadingOverlay: LoaderUI.LoadingOverlay }}
          sx={{
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#005099', color: 'white' },
            '& .MuiDataGrid-cell': { fontSize: '14px' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', fontSize: '16px' },
          }}
          disableColumnMenu
        />
        {/* 
        {selectedData && (
          <RoleModal
            setSelectedRole={setSelectedRole}
            open={!!selectedRole}
            initialData={selectedRole === 'create' ? null : selectedRole}
            onClose={() => setSelectedRole(null)}
            onSave={handleSave}
          />
        )} */}
      </Box>
    </HasPermission>
  )
}

export default ReferralCampaign
