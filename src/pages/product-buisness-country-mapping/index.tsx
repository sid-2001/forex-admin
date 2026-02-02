import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
  Chip,
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import ProductBusinessCountryMappingDialog from '../../components/product-buisness-country-mapping-dialog'
import ProductBusinessCountryMappingService from '@/services/productBusinessCountryMapping.service'

const service = new ProductBusinessCountryMappingService()

const ProductBusinessCountryMapping = () => {
  const [rows, setRows] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)

  const fetchList = async () => {
    const res = await service.getList()
    setRows(res)
    // if (res?.status) {
    //   setRows(res.data)
    // }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const columns: GridColDef[] = [
    { field: 'businessMapCode', headerName: 'Code', flex: 1,

           headerClassName: 'super-app-theme--header',
     },
    { field: 'productCode', headerName: 'Product', flex: 1,
           headerClassName: 'super-app-theme--header',
     },
    { field: 'recipientCountry', headerName: 'Country', flex: 1,
           headerClassName: 'super-app-theme--header',
     },
    { field: 'paymentRail', headerName: 'Payment Rail', flex: 1,   headerClassName: 'super-app-theme--header', },
    {
      field: 'active',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Active" color="success" size="small" />
        ) : (
          <Chip label="Inactive" size="small" />
        ),
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
      <Stack
        direction="row"
        justifyContent="space-between"
        mb={2}
      >
        {/* <Typography variant="h6">
          Product Business Country Mapping
        </Typography> */}

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
        getRowId={(row) => row.businessMapCode}
                         initialState={{
    pagination: {
      paginationModel: {
        page: 0,
        pageSize: 5,
      },
    },
  }}
      />

      <ProductBusinessCountryMappingDialog
        open={open}
        handleClose={() => setOpen(false)}
        editData={editData}
        refreshList={fetchList}
      />
    </Box>
  )
}

export default ProductBusinessCountryMapping
