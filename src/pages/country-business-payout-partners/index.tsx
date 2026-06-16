import { useEffect, useState, useCallback, useMemo } from 'react'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DownloadIcon from '@mui/icons-material/Download'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import CountryBusinessPayoutPartnerFormDialog from '../../components/countrybuisnesspayoutformformdialog'
import CountryBusinessPayoutPartnerService from '@/services/countryBusinessPayoutPartner.service'
import dayjs from 'dayjs'
import { formatTableDate } from '@/helpers/dateformate'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'
import { LocalStorageService } from '@/helpers/local-storage-service'

const CountryBusinessPayoutPartner = () => {
  const [rows, setRows] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isFormChanged, setIsFormChanged] = useState(false)

  // Recoil Alert States for consistency
  const [, setOpenAlert] = useRecoilState(alertState)
  const [, setAlertText] = useRecoilState(alertTextState)
  const [, setAlertType] = useRecoilState(alertTypeState)

  const service = useMemo(() => new CountryBusinessPayoutPartnerService(), [])
  const local_service = useMemo(() => new LocalStorageService(), [])
  const helper = new HelperService()

  const showAlert = (type: 'Success' | 'Fail', text: string) => {
    setAlertType(type)
    setAlertText(text)
    setOpenAlert(true)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await service.getAll()
      const responseData = res?.data || (Array.isArray(res) ? res : [])
      setRows(responseData)
    } catch (error) {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [service])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Function to download CSV with all fields
  const downloadCSV = () => {
    if (!rows || rows.length === 0) {
      showAlert('Fail', 'No data to export')
      return
    }

    // Define CSV headers based on entity fields
    const headers = [
      'Payout Partner Code',
      'Corridor Business Map Code',
      'Business Type Code',
      'Payout Partner',
      'Active',
      'Effective From',
      'Effective To',
      'Created By',
      'Created Date',
      'Modified By',
      'Modified Date',
    ]

    // Map data to CSV rows
    const csvRows = rows.map((row) => [
      row.countryBusinessPayoutPartnerCode || '',
      row.countryCorridorBusinessMapCode || '',
      row.businessTypeCode || '',
      row.payoutPartner || '',
      row.active ? 'Yes' : 'No',
      formatTableDate(row.effectiveFromDate || row.effective_from_date),
      formatTableDate(row.effectiveToDate || row.effective_to_date),
      row.createdBy || '',
      row.createdLocalDateTime ? dayjs(row.createdLocalDateTime).format('YYYY-MM-DD HH:mm') : '',
      row.modifiedBy || '',
      row.modifiedLocalDateTime ? dayjs(row.modifiedLocalDateTime).format('YYYY-MM-DD HH:mm') : '',
    ])

    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n')

    // Create and download the file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `payout_partner_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showAlert('Success', 'CSV downloaded successfully')
  }

  // Custom toolbar with CSV download button
  const CustomToolbar = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
        <GridToolbar />
        <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={downloadCSV} sx={{ ml: 2 }}>
          Export CSV
        </Button>
      </Box>
    )
  }

  const handleDialogClose = () => {
    setOpen(false)
    setIsFormChanged(false)
    setEditData(null)
  }

  const handleFormChange = (changed: boolean) => {
    setIsFormChanged(changed)
  }

  const columns: GridColDef[] = [
    { field: 'countryBusinessPayoutPartnerCode', headerName: 'Code', flex: 0.7, headerClassName: 'super-app-theme--header' },
    { field: 'countryCorridorBusinessMapCode', headerName: 'Corridor Map', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'businessTypeCode', headerName: 'Business Type', flex: 0.8, headerClassName: 'super-app-theme--header' },
    { field: 'payoutPartner', headerName: 'Partner', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'effective_from_date',
      headerName: 'Effective From',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectiveFromDate || params.row?.effective_from_date),
    },
    {
      field: 'effective_to_date',
      headerName: 'Effective To',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectiveToDate || params.row?.effective_to_date),
    },
    {
      field: 'active',
      headerName: 'Active',
      flex: 0.4,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (params.value ? 'Yes' : 'No'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => {
            setEditData(params.row)
            setOpen(true)
            setIsFormChanged(false)
          }}
          disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3} sx={{ width: '100%', '& .super-app-theme--header': { fontWeight: 'bold' } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              display: 'grid',
              placeItems: 'center',
              color: '#0061B1',
            }}
          >
            {'Country Business Railand Payout Mapping'.toUpperCase()}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setEditData(null)
              setOpen(true)
              setIsFormChanged(false)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'cancreate')}
          >
            Add
          </Button>
        </Stack>

        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          disableColumnMenu
          getRowId={(row) => row.countryBusinessPayoutPartnerCode || Math.random()}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
        />

        <CountryBusinessPayoutPartnerFormDialog
          open={open}
          handleClose={handleDialogClose}
          editData={editData}
          refreshList={fetchData}
          showAlert={showAlert}
          onFormChange={handleFormChange}
          isUpdateDisabled={editData ? !isFormChanged : false}
        />
      </Box>
    </HasPermission>
  )
}

export default CountryBusinessPayoutPartner
