import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import GenderFormDialog from '../../components/genderFormDialog'
import GenderService from '@/services/gender.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import ConfirmModal from '@/components/ConfirmModal'

export default function GenderMaster() {
  const [rows, setRows] = useState<any[]>([])
  const [dialogopen, setDialogopen] = useState(false)
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [editData, setEditData] = useState<any>(null)

  const local_service = useMemo(() => new LocalStorageService(), [])
  const static_service = useMemo(() => new GenderService(), [])

  const fetchData = useCallback(async () => {
    const res: any = await static_service.getGenderList()
    const responseData = res?.data || res
    setRows(Array.isArray(responseData) ? responseData : [])
  }, [static_service])

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
      applicant_id: local_service?.get_staff_id(),
      gendercode: data.gendercode,
      description: data.description,
      countrycode: data.selectedCountry,
      active: data.active,
      effectivefromdate: `${data.effectiveFrom}T00:00:00.000Z`,
      effectivetodate: `${data.effectiveTo}T23:59:59.000Z`,
    }


    //@ts-ignore
    const response: any = isUpdate ? await static_service.updateGender(payload) : await static_service.createGender(payload)

    if (response?.success === true || response?.status === 'Success') {
      showAlert('Success', `Gender ${isUpdate ? 'Updated' : 'Created'} Successfully`)
      setDialogopen(false)
      fetchData()
    } else {
      showAlert('Fail', response?.message || 'Server Error')
    }
  }

  const columns: GridColDef[] = [
    { field: 'gendercode', headerName: 'Code', width: 80, headerClassName: 'super-app-theme--header' },
    { field: 'description', headerName: 'Description', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'countrycode', headerName: 'Country', width: 100, headerClassName: 'super-app-theme--header' },
    {
      field: 'effectivefromdate',
      headerName: 'Effective From',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      // We use renderCell instead of valueFormatter for maximum reliability
      renderCell: (params) => {
        const val = params.row?.effectivefromdate
        return val ? val.split('T')[0] : ''
      },
    },
    {
      field: 'effectivetodate',
      headerName: 'Effective To',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const val = params.row?.effectivetodate
        return val ? val.split('T')[0] : ''
      },
    },
    {
      field: 'active',
      headerName: 'Active',
      width: 100,
      renderCell: (params) => (params.value ? 'Yes' : 'No'),
      headerClassName: 'super-app-theme--header',
    },
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
    <Box p={3} sx={{ width: '100%' }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setDialogopen(true)
          }}
        >
          Add Gender
        </Button>
      </Stack>

      <DataGrid rows={rows} columns={columns} getRowId={(row: any) => `${row.gendercode}-${row.countrycode}`} autoHeight disableRowSelectionOnClick />

      <GenderFormDialog
        open={dialogopen}
        onClose={() => setDialogopen(false)}
        editData={editData}
        onSubmit={(data: any) => handleAction(data, !!editData)}
      />

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          await static_service.deleteGender({ gendercode: selectedRow.gendercode, countrycode: selectedRow.countrycode })
          showAlert('Success', 'Deleted Successfully')
          setDeleteModalOpen(false)
          fetchData()
        }}
        title="Delete Gender?"
        message={`Delete ${selectedRow?.gendercode}?`}
      />
    </Box>
  )
}
