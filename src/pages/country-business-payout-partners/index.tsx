import { useEffect, useState } from 'react'
import { Box, Button, IconButton, Stack, Typography, Chip } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import CountryBusinessPayoutPartnerFormDialog from '../../components/countrybuisnesspayoutformformdialog'
import CountryBusinessPayoutPartnerService from '@/services/countryBusinessPayoutPartner.service'

const CountryBusinessPayoutPartner = () => {
  const [rows, setRows] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const CountryBusinessPayoutPartnerServic = new CountryBusinessPayoutPartnerService()
  const [editData, setEditData] = useState<any>(null)

  const fetchData = async () => {
    const res = await CountryBusinessPayoutPartnerServic.getAll()
    //@ts-ignore
    setRows(res || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  const columns: GridColDef[] = [
    {
      field: 'countryBusinessPayoutPartnerCode',
      headerName: 'Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'countryCorridorBusinessMapCode',
      headerName: 'Corridor Business Map',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'businessTypeCode',
      headerName: 'Business Type',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'payoutPartner',
      headerName: 'Payout Partner',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'active',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) =>
        params.value ? <Chip label="Active" color="success" size="small" /> : <Chip label="Inactive" color="default" size="small" />,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <IconButton
          onClick={() => {
            setEditData(params.row)
            setOpen(true)
          }}
        >
          <EditIcon />
        </IconButton>
      ),
      headerClassName: 'super-app-theme--header',
    },
  ]

  return (
    <Box p={2} width="80vw">
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setOpen(true)
          }}
        >
          Create
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        pageSizeOptions={[5, 10]}
        getRowId={(row) => row.countryBusinessPayoutPartnerCode}
        initialState={{
          pagination: {
            paginationModel: {
              page: 0,
              pageSize: 5,
            },
          },
        }}
      />

      <CountryBusinessPayoutPartnerFormDialog open={open} handleClose={() => setOpen(false)} editData={editData} refreshList={fetchData} />
    </Box>
  )
}

export default CountryBusinessPayoutPartner
