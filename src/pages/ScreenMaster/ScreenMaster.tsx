import { useEffect, useState } from 'react'
import { Box, Button, IconButton, Stack } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ScreenFormDialog from '../../components/screenFormDialog'
import ScreenService, { Screen } from '@/services/screen.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'

export default function ScreenMaster() {
  const [rows, setRows] = useState<Screen[]>([])
  const [dialogopen, setDialogopen] = useState(false)
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)

  const local_service = new LocalStorageService()
  const [editData, setEditData] = useState<Screen | null>(null)
  const screen_service = new ScreenService()

  const fetchData = async () => {
    const res = await screen_service.getScreenList()
    // Assuming res returns an array or an object with a data array
    //@ts-ignore
    setRows(Array.isArray(res) ? res : res?.data || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (data: any) => {
    const response = await screen_service.createScreen({
      applicant_id: local_service?.get_staff_id() || 'admin',
      screencode: data.screencode,
      screendescription: data.screendescription,
      countrycode: data.selectedCountry,
      active: data.active,
    })

    //@ts-ignore
    if (response?.success === true) {
      setOpen(true)
      settype('Success')
      setText('Screen Created Successfully')
    } else {
      setOpen(true)
      settype('Fail')
      setText('Server Error')
    }
    setDialogopen(false)
    fetchData()
  }

  const handleUpdate = async (data: any) => {
    const response = await screen_service.updateScreen({
      applicant_id: local_service?.get_staff_id() || 'admin_user',
      screencode: data.screencode,
      countrycode: data.selectedCountry,
      screendescription: data.screendescription,
      active: data.active,
    })

    //@ts-ignore
    if (response?.success === true) {
      setOpen(true)
      settype('Success')
      setText('Screen Updated Successfully')
    } else {
      setOpen(true)
      settype('Fail')
      setText('Server Error')
    }
    setEditData(null)
    setDialogopen(false)
    fetchData()
  }

  //   const handleDelete = async (row: Screen) => {
  //     const response = await screen_service.deleteScreen({
  //       screencode: row.screencode,
  //       countrycode: row.countrycode,
  //     })
  //     console.log(response, 'bhanu')
  //     //@ts-ignore
  //     if (response?.success === true) {
  //       fetchData()
  //     }
  //   }

  const handleDelete = async (row: any) => {
    if (window.confirm('Are you sure?')) {
      await screen_service.deleteScreen({
        screencode: row.screencode,
        countrycode: row.countrycode,
      })
      fetchData()
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'screencode',
      headerName: 'Screen Code',
      flex: 0.5,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'screendescription',
      headerName: 'Description',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'countrycode',
      headerName: 'Country',
      flex: 0.5,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'active',
      headerName: 'Active',
      width: 120,
      renderCell: (params) => (params.value ? 'Yes' : 'No'),
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => {
              setEditData(params.row)
              setDialogopen(true)
            }}
          >
            <EditIcon />
          </IconButton>

          <IconButton onClick={() => handleDelete(params.row)}>
            <DeleteIcon color="error" />
          </IconButton>
        </>
      ),
    },
  ]

  return (
    <Box
      p={2}
      sx={{
        width: '80vw',
        '& .super-app-theme--header': {
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
        },
      }}
    >
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

      <DataGrid rows={rows} columns={columns} getRowId={(row) => `${row.screencode}-${row.countrycode}`} autoHeight pageSizeOptions={[5, 10]} />

      <ScreenFormDialog
        open={dialogopen}
        onClose={() => setDialogopen(false)}
        editData={editData}
        onSubmit={editData ? handleUpdate : handleCreate}
      />
    </Box>
  )
}
