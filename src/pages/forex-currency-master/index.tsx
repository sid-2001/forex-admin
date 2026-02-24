import { useEffect, useState } from 'react'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import ForexCurrencyService, { ForexCurrency } from '@/services/forex-currency.service'
import ForexCurrencyDialog from '@/components/forex-currency-dialog'
import { formatTableDate } from '@/helpers/dateformate'

export default function ForexCurrencyMaster() {
  const service = new ForexCurrencyService()

  const [rows, setRows] = useState<ForexCurrency[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<ForexCurrency | null>(null)

  const fetchData = async () => {
    const res = await service.getAll()
    setRows(res)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (data: any) => {
    await service.create(data)
    setDialogOpen(false)
    fetchData()
  }

  const handleUpdate = async (data: any) => {
    if (!editData) return
    await service.update(editData.countryCode, data)
    setEditData(null)
    setDialogOpen(false)
    fetchData()
  }

  const handleDelete = async (row: ForexCurrency) => {
    const res = await service.delete(row.countryCode)

    fetchData()
  }

  const columns: GridColDef[] = [
    { field: 'countryCode', headerName: 'Country', flex: 0.5, headerClassName: 'super-app-theme--header' },
    { field: 'currencyCode', headerName: 'Currency Code', flex: 0.6, headerClassName: 'super-app-theme--header' },
    { field: 'currencyName', headerName: 'Currency Name', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'currencySymbol', headerName: 'Symbol', flex: 0.4, headerClassName: 'super-app-theme--header' },
    {
      field: 'active',
      headerName: 'Active',
      width: 100,
      renderCell: (params) => (params.value ? 'Yes' : 'No'),
      headerClassName: 'super-app-theme--header',
    },
    // {
    //   field: 'effective_from_date',
    //   headerName: 'Effective From',
    //   flex: 0.8,
    //   headerClassName: 'super-app-theme--header',
    //   renderCell: (params) => formatTableDate(params.row?.effectivefromdate || params.row?.effectiveFromDate),
    // },
    // {
    //   field: 'effective_to_date',
    //   headerName: 'Effective To',
    //   flex: 0.8,
    //   headerClassName: 'super-app-theme--header',
    //   renderCell: (params) => formatTableDate(params.row?.effectivetodate || params.row?.effectiveToDate),
    // },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
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

          {/* <IconButton onClick={() => handleDelete(params.row)}>
            <DeleteIcon color="error" />
          </IconButton> */}
        </>
      ),
      headerClassName: 'super-app-theme--header',
    },
  ]

  return (
    <Box p={2} sx={{ width: '85vw' }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          letterSpacing: '-0.02em',
          display: 'grid',
          placeItems: 'center',
          mb: 5,
          color: '#0061B1',
        }}
      >
        {'Currency master'.toUpperCase()}
      </Typography>
      <Stack direction="row" justifyContent="flex-end" mb={2}>
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
          pagination: { paginationModel: { page: 0, pageSize: 5 } },
        }}
      />

      <ForexCurrencyDialog
        open={dialogOpen}
        editData={editData}
        onClose={() => setDialogOpen(false)}
        onSubmit={editData ? handleUpdate : handleCreate}
      />
    </Box>
  )
}
