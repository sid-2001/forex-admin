import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ScreenFormDialog from '../../components/screenFormDialog'
import ScreenService, { Screen } from '@/services/screen.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import ConfirmModal from '@/components/ConfirmModal'

export default function ScreenMaster() {
  const [rows, setRows] = useState<Screen[]>([])
  const [dialogopen, setDialogopen] = useState(false)
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [editData, setEditData] = useState<Screen | null>(null)

  const local_service = useMemo(() => new LocalStorageService(), [])
  const screen_service = useMemo(() => new ScreenService(), [])

  const fetchData = useCallback(async () => {
    const res = await screen_service.getScreenList()
    // Normalizing API response
    const responseData = res?.data || res
    setRows(Array.isArray(responseData) ? responseData : [])
  }, [screen_service])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const showAlert = (alertType: 'Success' | 'Fail', alertText: string) => {
    settype(alertType)
    setText(alertText)
    setOpen(true)
  }

  const handleAction = async (data: any, isUpdate: boolean) => {
    if (data.validationError) {
      showAlert('Fail', data.validationError)
      return
    }

    const payload = {
      applicant_id: local_service?.get_staff_id() || 'admin',
      screencode: data.screencode,
      screendescription: data.screendescription,
      countrycode: data.selectedCountry,
      active: data.active,
      effectiveFromDate: `${data.fromDate}T00:00:00.000Z`,
      effectivefromdate: `${data.fromDate}T00:00:00.000Z`,
      effectiveToDate: `${data.toDate}T23:59:59.000Z`,
      effectivetodate: `${data.toDate}T23:59:59.000Z`,
    }

    console.log('Sending Payload:', payload)

    try {
      const response = isUpdate ? await screen_service.updateScreen(payload) : await screen_service.createScreen(payload)

      if (response?.success === true || response?.status === 'Success') {
        showAlert('Success', `Screen ${isUpdate ? 'Updated' : 'Created'} Successfully`)
        setDialogopen(false)
        fetchData()
      } else {
        showAlert('Fail', response?.message || 'Server Error (Check naming conventions)')
      }
    } catch (err) {
      showAlert('Fail', 'Network or Server Error')
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedRow) {
      await screen_service.deleteScreen({
        screencode: selectedRow.screencode,
        countrycode: selectedRow.countrycode,
      })
      showAlert('Success', 'Screen Deleted Successfully')
      setDeleteModalOpen(false)
      fetchData()
    }
  }

  const columns: GridColDef[] = [
    { field: 'screencode', headerName: 'Screen Code', flex: 0.6, headerClassName: 'super-app-theme--header' },
    { field: 'screendescription', headerName: 'Description', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'countrycode', headerName: 'Country', flex: 0.5, headerClassName: 'super-app-theme--header' },
    {
      field: 'effectivefromdate',
      headerName: 'From Date',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      valueFormatter: (params) => (params?.value ? params.value.split('T')[0] : ''),
    },
    {
      field: 'effectivetodate',
      headerName: 'To Date',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      valueFormatter: (params) => (params?.value ? params.value.split('T')[0] : ''),
    },
    { field: 'active', headerName: 'Active', width: 100, renderCell: (p) => (p.value ? 'Yes' : 'No'), headerClassName: 'super-app-theme--header' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            onClick={() => {
              setEditData(params.row)
              setDialogopen(true)
            }}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          {/* <IconButton
            onClick={() => {
              setSelectedRow(params.row)
              setDeleteModalOpen(true)
            }}
            color="error"
          >
            <DeleteIcon />
          </IconButton> */}
        </Stack>
      ),
    },
  ]

  return (
    <Box p={3} sx={{ width: '100%', '& .super-app-theme--header': { backgroundColor: 'rgba(0, 0, 0, 0.05)', fontWeight: 'bold' } }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setDialogopen(true)
          }}
        >
          Add Screen
        </Button>
      </Stack>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => `${row.screencode}-${row.countrycode}`}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </div>

      <ScreenFormDialog
        open={dialogopen}
        onClose={() => setDialogopen(false)}
        editData={editData}
        onSubmit={(data: any) => handleAction(data, !!editData)}
      />

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Screen?"
        message={`Are you sure you want to delete screen ${selectedRow?.screencode}?`}
      />
    </Box>
  )
}
