import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ChannelFormDialog from '../channellist'
import ChannelService from '@/services/channel.servive'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import ConfirmModal from '@/components/ConfirmModal'

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

    const payload = {
      applicant_id: local_service?.get_staff_id(),
      channel_code: data.channelCode,
      country_code: data.selectedCountry,
      channel_description: data.description,
      active: data.active,
      effective_from_date: `${data.effectiveFrom}T00:00:00.000Z`,
      effective_to_date: `${data.effectiveTo}T23:59:59.000Z`,
    }

    const response: any = isUpdate ? await static_service.updateChannel(payload) : await static_service.createChannel(payload)

    if (response?.success === true || response?.status === 'Success') {
      showAlert('Success', `Channel ${isUpdate ? 'Updated' : 'Created'} Successfully`)
      setOpen(false)
      fetchData()
    } else {
      showAlert('Fail', response?.message || 'Server Error')
    }
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
      renderCell: (params) => {
        const val = params.row?.effective_from_date || params.row?.effectivefromdate
        return val ? val.split('T')[0] : ''
      },
    },
    {
      field: 'effective_to_date',
      headerName: 'Effective To',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const val = params.row?.effective_to_date || params.row?.effectivetodate
        return val ? val.split('T')[0] : ''
      },
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
          >
            <EditIcon />
          </IconButton>
          {/* <IconButton
            color="error"
            onClick={() => {
              setSelectedRow(params.row)
              setDeleteModalOpen(true)
            }}
          >
            <DeleteIcon />
          </IconButton> */}
        </Stack>
      ),
    },
  ]

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setOpen(true)
          }}
        >
          Add Channel
        </Button>
      </Stack>

      <Box sx={{ height: 500, width: '100%', '& .super-app-theme--header': { backgroundColor: 'rgba(0, 0, 0, 0.05)', fontWeight: 'bold' } }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => `${row.channel_code}-${row.country_code}`}
          disableRowSelectionOnClick
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
  )
}
