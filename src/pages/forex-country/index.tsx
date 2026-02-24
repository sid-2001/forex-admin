// pages/forex-country/index.tsx
import { useEffect, useState } from 'react'
import { Box, Button, IconButton, Stack } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ForexCountryService, { ForexCountry } from '../../services/forextcoutnry.service'
import ForexCountryDialog from '../../components/forex-county-dialog'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'

export default function ForexCountryMaster() {
  const service = new ForexCountryService()

  const [rows, setRows] = useState<ForexCountry[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<ForexCountry | null>(null)

  const [, setOpen] = useRecoilState(alertState)
  const [, setText] = useRecoilState(alertTextState)
  const [, setType] = useRecoilState(alertTypeState)

  const fetchData = async () => {
    const res = await service.getAll()
    setRows(res || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (data: any) => {
    const res = await service.create(data)
    setOpen(true)
    setType(res.status ? 'Success' : 'Fail')
    setText(res.message)
    setDialogOpen(false)
    fetchData()
  }

  const handleUpdate = async (data: any) => {
    const res = await service.update(editData!.countryCode, data)
    setOpen(true)
    setType(res.status ? 'Success' : 'Fail')
    setText(res.message)
    setEditData(null)
    setDialogOpen(false)
    fetchData()
  }

  const handleDelete = async (row: ForexCountry) => {
    const res = await service.delete(row.countryCode)
    setOpen(true)
    setType(res.status ? 'Success' : 'Fail')
    setText(res.message || 'Deleted successfully')
    fetchData()
  }

  const columns: GridColDef[] = [
    { field: 'countryCode', headerName: 'Code', flex: 0.5, headerClassName: 'super-app-theme--header' },
    { field: 'countryName', headerName: 'Country', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'countryPhoneCode', headerName: 'Phone Code', flex: 0.6, headerClassName: 'super-app-theme--header' },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (p) => (p.value === 'A' ? 'Active' : 'Inactive'),
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => {
              setEditData(params.row)
              setDialogOpen(true)
            }}
          >
            <EditIcon />
          </IconButton>

          <IconButton onClick={() => handleDelete(params.row)}>
            <DeleteIcon color="error" />
          </IconButton>
        </>
      ),
      headerClassName: 'super-app-theme--header',
    },
  ]

  return (
    <Box p={2} sx={{ width: '85vw' }}>
      <Stack direction="row" justifyContent="right" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setDialogOpen(true)
          }}
        >
          Add
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        getRowId={(row) => row.countryCode}
        columns={columns}
        autoHeight
        pageSizeOptions={[5]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5, // Default to 5
            },
          },
        }}
      />

      <ForexCountryDialog
        open={dialogOpen}
        editData={editData}
        onClose={() => setDialogOpen(false)}
        onSubmit={editData ? handleUpdate : handleCreate}
      />
    </Box>
  )
}
