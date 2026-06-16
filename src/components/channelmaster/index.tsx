import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import ChannelFormDialog from '../channellist'
import ChannelService from '@/services/channel.servive'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import ConfirmModal from '@/components/ConfirmModal'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { getLiveAuditData } from '@/helpers/dynamicLocations'
import { formatTableDate } from '@/helpers/dateformate'
import HasPermission from '../permissionWrapper'
import { HelperService } from '@/helpers/helper'
dayjs.extend(utc)

export default function ChannelManagement() {
  const [rows, setRows] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)

  const [alert, setAlert] = useRecoilState(alertState)
  const [alertText, setAlertText] = useRecoilState(alertTextState)
  const [alertType, setAlertType] = useRecoilState(alertTypeState)

  const local_service = useMemo(() => new LocalStorageService(), [])
  const static_service = useMemo(() => new ChannelService(), [])
  const helper = new HelperService()

  const showAlert = (type: 'Success' | 'Fail', message: string) => {
    setAlertType(type)
    setAlertText(message)
    setAlert(true)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await static_service.getChannelList()
      const responseData = res?.data || res
      setRows(Array.isArray(responseData) ? responseData : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [static_service])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAction = async (data: any, isUpdate: boolean) => {
    if (data.validationError) {
      showAlert('Fail', data.validationError)
      return
    }

    // 1. Get Geolocation
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // 2. Fetch rich audit data using your utility
        const audit = await getLiveAuditData(pos.coords.latitude, pos.coords.longitude)
        const staffId = local_service?.get_staff_id()

        if (!audit) {
          showAlert('Fail', 'Audit data generation failed.')
          return
        }

        const payload = {
          applicant_id: staffId,
          channel_code: data.channelCode?.substring(0, 1).toUpperCase(),
          country_code: data.selectedCountry?.substring(0, 3).toUpperCase(),
          channel_description: data.description?.substring(0, 25),
          active: data.active,
          effective_from_date: `${data.effectiveFrom}T00:00:00.000Z`,
          effective_to_date: `${data.effectiveTo}T00:00:00.000Z`,

          ...(isUpdate
            ? {
                modified_by: staffId,
              }
            : {
                created_by: staffId,
              }),
        }

        try {
          const response: any = isUpdate ? await static_service.updateChannel(payload) : await static_service.createChannel(payload)

          if (response?.success || response?.status === 'Success' || response?.status === true) {
            showAlert('Success', `Channel ${isUpdate ? 'Updated' : 'Created'} Successfully`)
            setOpen(false)
            fetchData()
          } else {
            console.log(response, 'bhanuy')
            showAlert('Fail', response?.error !== undefined ? response.error : 'channel_code must be unique')
          }
        } catch (err: any) {
          showAlert('Fail', err.message || 'Network Error')
        }
      },
      (_) => {
        showAlert('Fail', 'Location access denied. Audit trail is required to save.')
      },
    )
  }

  const columns: GridColDef[] = [
    { field: 'channel_code', headerName: 'Channel Code', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'country_code', headerName: 'Country', flex: 0.8, headerClassName: 'super-app-theme--header' },
    { field: 'channel_description', headerName: 'Description', flex: 2, headerClassName: 'super-app-theme--header' },
    {
      field: 'effective_from_date',
      headerName: 'Effective From',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effective_from_date || params.row?.effectiveFromDate),
    },
    {
      field: 'effective_to_date',
      headerName: 'Effective To',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effective_to_date || params.row?.effectiveToDate),
    },
    {
      field: 'active',
      headerName: 'Active',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (params.value ? 'Yes' : 'No'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            color="primary"
            onClick={() => {
              setEditData(params.row)
              setOpen(true)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
          >
            <EditIcon />
          </IconButton>
        </Stack>
      ),
    },
  ]

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              display: 'grid',
              placeItems: 'center',
              // mb: 5,
              color: '#0061B1',
            }}
          >
            {'Channel Master'.toUpperCase()}
          </Typography>
          <Button
            variant="contained"
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
            onClick={() => {
              setEditData(null)
              setOpen(true)
            }}
          >
            Add
          </Button>
        </Stack>

        <Box sx={{ height: 500, width: '100%', '& .super-app-theme--header': { fontWeight: 'bold' } }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            getRowId={(row) => `${row.channel_code}-${row.country_code}`}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true } }}
            disableColumnMenu
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } },
            }}
          />
        </Box>

        <ChannelFormDialog open={open} onClose={() => setOpen(false)} editData={editData} onSubmit={(data: any) => handleAction(data, !!editData)} />

        <ConfirmModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={async () => {
            await static_service.deleteChannel({
              channel_code: selectedRow.channel_code,
              country_code: selectedRow.country_code,
            })
            showAlert('Success', 'Channel Deleted Successfully')
            setDeleteModalOpen(false)
            fetchData()
          }}
          title="Delete Channel?"
          message={`Are you sure you want to delete channel ${selectedRow?.channel_code}?`}
        />
      </Box>
    </HasPermission>
  )
}
