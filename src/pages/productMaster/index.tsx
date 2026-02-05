import { Button, Stack, IconButton, Box } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useEffect, useState, useCallback, useMemo } from 'react'

import ProductFormDialog from '../../components/productDialog'
import ProductService from '../../services/product.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'

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
      field: 'effectiveFromDate',
      headerName: 'Effective From',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (p) => p.row?.effectiveFromDate?.split('T')[0] || '',
    },
    {
      field: 'effectiveToDate',
      headerName: 'Effective To',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (p) => p.row?.effectiveToDate?.split('T')[0] || '',
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
    <Box p={3} sx={{ width: '100%', '& .super-app-theme--header': { backgroundColor: 'rgba(0, 0, 0, 0.05)', fontWeight: 'bold' } }}>
      <Stack direction="row" justifyContent="flex-start" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setOpen(true)
          }}
        >
          Add Product
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
