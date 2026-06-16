import React, { useEffect, useState } from 'react'
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridFilterModel, GridColDef } from '@mui/x-data-grid'
import { Box, Typography, Button, Stack, Chip, IconButton } from '@mui/material'
import { Navigate, useNavigate } from 'react-router-dom'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import LoaderUI from '@/components/loader/loader'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import NotificationService from '@/services/notification.service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { Edit } from '@mui/icons-material'
import NotificationCampaignDialog from '@/components/campaignDialog'
import { freqTypeMap, targetTypeMap, getNotificationStatusColor, getNotificationStatusLabel } from '@/contants/utils'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'

const NotificationCampaign: React.FC = () => {
  const [notificationCampaignData, setNotificationCampaignData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const helper = new HelperService()
  const local_service = new LocalStorageService()
  const notificationService = new NotificationService()
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>({})
  const apiRef = React.useRef<any>(null)

  const [openCampaignModal, setOpenCampaignModal] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [, setOpen] = useRecoilState(alertState)
  const [, setText] = useRecoilState(alertTextState)
  const [, setType] = useRecoilState(alertTypeState)

  const showAlert = (t: 'success' | 'error', m: string) => {
    setType(t)
    setText(m)
    setOpen(true)
  }

  useEffect(() => {
    fetchNotificationCampaignListingData()
  }, [])

  const fetchNotificationCampaignListingData = async () => {
    try {
      setIsLoading(true)
      const response = await notificationService.getAllNotificationCampaign()
      setNotificationCampaignData(response?.data)
      setIsLoading(false)
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const columns = [
    {
      field: 'campaignId',
      headerName: 'Campaign Id',
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'campaignName',
      headerName: 'Campaign Name',
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
      field: 'startDate',
      headerName: 'Start Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'frequencyType',
      headerName: 'Frequency Type',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return freqTypeMap[params?.row?.frequencyType]
      },
    },
    {
      field: 'targetType',
      headerName: 'Target Type',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return targetTypeMap[params?.row?.targetType]
      },
    },
    {
      field: 'frequencyUnit',
      headerName: 'Frequency Unit',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'frequencyValue',
      headerName: 'Frequency Value',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'maxRetryCount',
      headerName: 'Retry Count',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },

    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const value = params?.row?.status?.toUpperCase()
        if (!value) return null
        return (
          <Chip
            label={getNotificationStatusLabel(value)}
            sx={{
              backgroundColor: getNotificationStatusColor(value),
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '8px',
            }}
          />
        )
      },
    },

    {
      field: 'scheduledAt',
      headerName: 'Scheduled At',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return helper.convertDateAndTime(params?.row?.schedule?.scheduledAt)
      },
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

    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <Stack direction="row" padding={'8px 0px'}>
          <IconButton
            onClick={() => {
              setEditData(params.row)
              setOpenCampaignModal(true)
            }}
            color="primary"
            size="small"
            title="Edit Campaign"
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
          >
            <EditIcon
              fontSize="small"
              style={{
                cursor: 'pointer',
              }}
            />
          </IconButton>

          <IconButton
            onClick={() => {
              navigate(`/campaign-delivery/${params?.row?.campaignId}`)
            }}
            color="primary"
            size="small"
            title="View Notification Delivery"
          >
            <VisibilityIcon
              fontSize="small"
              style={{
                cursor: 'pointer',
              }}
            />
          </IconButton>
        </Stack>
      ),
    },
  ]

  const getVisibleFilteredRows = () => {
    const visibleCols = columns.filter((col) => columnVisibilityModel[col.field] !== false && col.field !== 'id1')

    const filteredRows = notificationCampaignData.filter((row: any) =>
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
    link.setAttribute('download', 'notification_campaign.csv')
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
    doc.text('Campaign Listing Report', 40, 40)
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 60,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [0, 80, 153], textColor: 255 },
    })
    doc.save('Campaign_List.pdf')
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
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3} sx={{ width: '90vw', height: '80vh' }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0061B1', textAlign: 'center' }}>
            NOTIFICATION CAMPAIGN LISTING
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setEditData(null)
              setOpenCampaignModal(true)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
          >
            Add
          </Button>
        </Stack>

        {notificationCampaignData && (
          <DataGrid
            apiRef={apiRef}
            rows={notificationCampaignData || []}
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
            getRowId={(row: any) => row.campaignId}
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

        <NotificationCampaignDialog
          open={openCampaignModal}
          editData={editData}
          onClose={() => setOpenCampaignModal(false)}
          refreshList={fetchNotificationCampaignListingData}
          showAlert={showAlert}
        />
      </Box>
    </HasPermission>
  )
}

export default NotificationCampaign
