import { Button, Stack, IconButton, Box, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useEffect, useState, useCallback, useMemo } from 'react'

import ProductFormDialog from '../../components/productDialog'
import ProductService from '../../services/product.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import dayjs from 'dayjs'

export default function ProductManagement() {
  const productService = useMemo(() => new ProductService(), [])
  const local_service = useMemo(() => new LocalStorageService(), [])

  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [alertOpen, setAlertOpen] = useRecoilState(alertState)
  const [alertText, setAlertText] = useRecoilState(alertTextState)
  const [alertType, setAlertType] = useRecoilState(alertTypeState)

  const showAlert = (type: 'Success' | 'Fail', text: string) => {
    setAlertType(type)
    setAlertText(text)
    setAlertOpen(true)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productService.getProductList()
      // Note: Removed the .filter(active) so we can see all records,
      // similar to other master screens.
      setRows(Array.isArray(res) ? res : [])
    } finally {
      setLoading(false)
    }
  }, [productService])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAction = async (data: any) => {
    if (data.validationError) {
      showAlert('Fail', data.validationError)
      return
    }

    const isUpdate = !!editData
    const res = isUpdate
      ? await productService.updateProduct(editData.countryProductCode, {
          ...data,
          modifiedBy: local_service.get_staff_id(),
          modifiedLocalDateTime: new Date().toISOString().split('.')[0],
          modifiedTimezone: 'Asia/Kolkata',
          modifiedOffset: '+05:30',
        })
      : await productService.createProduct({
          ...data,
          createdBy: local_service.get_staff_id(),
        })

    if (res) {
      showAlert('Success', `Product ${isUpdate ? 'Updated' : 'Created'} Successfully`)
      setOpen(false)
      fetchData()
    }
  }

  const handleDelete = async (row: any) => {
    try {
      await productService.deleteProduct(row.countryProductCode, false)
      showAlert('Success', 'Product deleted successfully')
      fetchData()
    } catch (err) {
      showAlert('Fail', 'Delete failed')
    }
  }
  const formatTableDate = (dateString: string) => {
    if (!dateString) return ''
    const storedConfig = localStorage.getItem('countryConfig')
    let format = 'YYYY-MM-DD'

    if (storedConfig) {
      const config = JSON.parse(storedConfig)
      format = config.dateFormat.replace(/d/g, 'D').replace(/y/g, 'Y')
    }
    console.log(format, 'dkjhbcvy')
    return dayjs(dateString).format(format.toUpperCase())
  }

  const columns: GridColDef[] = [
    // {
    //   field: 'productCode',
    //   headerName: 'Product Code',
    //   flex: 1,
    //   headerClassName: 'super-app-theme--header',
    //   valueGetter: (p) => p.row?.productCode || '',
    // },
    { field: 'productCode', headerName: 'Product Code', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'productName', headerName: 'Description', flex: 2, headerClassName: 'super-app-theme--header' },
    {
      field: 'effective_from_date',
      headerName: 'Effective From',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectivefromdate || params.row?.effectiveFromDate),
    },
    {
      field: 'effective_to_date',
      headerName: 'Effective To',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectivetodate || params.row?.effectiveToDate),
    },
    {
      field: 'active',
      headerName: 'Active',
      flex: 0.8,
      renderCell: (p) => (p.row?.active ? 'Yes' : 'No'),
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
            color="primary"
            onClick={() => {
              setEditData(params.row)
              setOpen(true)
            }}
          >
            <EditIcon />
          </IconButton>
          {/* <IconButton color="error" onClick={() => handleDelete(params.row)}>
            <DeleteIcon />
          </IconButton> */}
        </Stack>
      ),
    },
  ]

  return (
    <Box p={3} sx={{ width: '100%', '& .super-app-theme--header': { fontWeight: 'bold' } }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          // color: 'text.primary',
          letterSpacing: '-0.02em',
          display: 'grid',
          placeItems: 'center',
          mb: 5,
          color: '#0061B1',
        }}
      >
        {'Product Master'.toUpperCase()}
      </Typography>
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setOpen(true)
          }}
        >
          Add
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.countryProductCode || Math.random()}
        autoHeight
        initialState={{
          pagination: { paginationModel: { page: 0, pageSize: 5 } },
        }}
      />

      <ProductFormDialog open={open} onClose={() => setOpen(false)} editData={editData} onSubmit={handleAction} />
    </Box>
  )
}
