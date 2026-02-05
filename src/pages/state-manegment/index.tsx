import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import StateFormDialog from '../../components/stateformDialog'
import StateService from '@/services/state.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import ConfirmModal from '@/components/ConfirmModal'

export default function StateManagement() {
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
  const stateService = useMemo(() => new StateService(), [])

  const showAlert = (type: 'Success' | 'Fail', message: string) => {
    setAlertType(type)
    setAlertText(message)
    setAlert(true)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await stateService.getStateList()
      const responseData = res?.data || res
      setRows(Array.isArray(responseData) ? responseData : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [stateService])

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
      statecode: data.stateCode,
      statedescription: data.description,
      countrycode: data.countryCode,
      active: data.active,
      effectivefromdate: `${data.effectiveFrom}T00:00:00.000Z`,
      effectivetodate: `${data.effectiveTo}T23:59:59.000Z`,
    }

    try {
      const response: any = isUpdate ? await stateService.updateState(payload) : await stateService.createState(payload)

      if (response?.success === true || response?.status === 'Success') {
        showAlert('Success', `State ${isUpdate ? 'Updated' : 'Created'} Successfully`)
        setOpen(false)
        fetchData()
      } else {
        showAlert('Fail', response?.message || 'Server Error')
      }
    } catch (error) {
      showAlert('Fail', 'Connection Error')
    }
  }

  const columns: GridColDef[] = [
    { field: 'statecode', headerName: 'State Code', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'statedescription', headerName: 'Description', flex: 2, headerClassName: 'super-app-theme--header' },
    { field: 'countrycode', headerName: 'Country', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'effectivefromdate',
      headerName: 'Effective From',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const val = params.row?.effectivefromdate
        return val ? val.split('T')[0] : ''
      },
    },
    {
      field: 'effectivetodate',
      headerName: 'Effective To',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const val = params.row?.effectivetodate
        return val ? val.split('T')[0] : ''
      },
    },
    {
      field: 'active',
      headerName: 'Active',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      renderCell: (p) => (p.value ? 'Yes' : 'No'),
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
      <Stack direction="row" justifyContent="flex-start" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setOpen(true)
          }}
        >
          Add State
        </Button>
      </Stack>

      <Box sx={{ height: 500, width: '100%', '& .super-app-theme--header': { backgroundColor: 'rgba(0, 0, 0, 0.05)', fontWeight: 'bold' } }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => `${row.statecode}-${row.countrycode}`}
          disableRowSelectionOnClick
        />
      </Box>

      <StateFormDialog open={open} onClose={() => setOpen(false)} editData={editData} onSubmit={(data: any) => handleAction(data, !!editData)} />

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          await stateService.deleteState({ statecode: selectedRow.statecode, countrycode: selectedRow.countrycode })
          showAlert('Success', 'State Deleted Successfully')
          setDeleteModalOpen(false)
          fetchData()
        }}
        title="Delete State?"
        message={`Are you sure you want to delete ${selectedRow?.statecode}?`}
      />
    </Box>
  )
}
