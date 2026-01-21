import { Button, Stack, IconButton } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useEffect, useState } from 'react'

import ProductFormDialog from '../../components/productDialog'
import ProductService from '../../services/product.service'
import { LocalStorageService } from '@/helpers/local-storage-service'

export default function ProductManagement() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const productService = new ProductService()
  const local_service = new LocalStorageService()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await productService.getProductList()
      setRows(res.data || res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (data: any) => {
    const payload = {
      productCode: data.productCode,
      productName: data.productName,
      effectiveFromDate: `${data.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${data.effectiveToDate}T00:00:00`,
      createdBy: local_service?.get_staff_id() || 'APSNGGGN3654',
    }

    const res = await productService.createProduct(payload)
    if (res) {
      setOpen(false)
      fetchData()
    }
  }

  const handleUpdate = async (data: any) => {
    const payload = {
      productCode: data.productCode,
      productName: data.productName,
      active: data.active,
      effectiveFromDate: `${data.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${data.effectiveToDate}T00:00:00`,
      modifiedBy: local_service?.get_staff_id() || 'APSNGGGN3624',
      modifiedLocalDateTime: new Date().toISOString().split('.')[0],
      modifiedTimezone: 'Asia/Kolkata',
      modifiedOffset: '+05:30',
    }

    const res = await productService.updateProduct(editData.countryProductCode, payload)
    if (res) {
      setOpen(false)
      fetchData()
    }
  }

  const handleDelete = async (row: any) => {
    await productService.deleteProduct(row.countryProductCode, false)
    console.log('content is deleted')
    fetchData()
  }

  const columns: GridColDef[] = [
    { field: 'productCode', headerName: 'Product Code', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'productName', headerName: 'Description', flex: 2, headerClassName: 'super-app-theme--header' },
    {
      field: 'active',
      headerName: 'Active',
      flex: 1,
      renderCell: (p) => (p.value ? 'Yes' : 'No'),
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'effectiveFromDate',
      headerName: 'EffectiveFrom',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'effectiveToDate',
      headerName: 'EffectiveTo',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            onClick={() => {
              setEditData(params.row)
              setOpen(true)
            }}
          >
            <EditIcon />
          </IconButton>

          <IconButton
            color="error"
            onClick={() => {
              handleDelete(params.row)
              console.log('content is deleted')
            }}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
      headerClassName: 'super-app-theme--header',
    },
  ]

  return (
    <>
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

      <div style={{ height: 500, width: '80vw' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.countryProductCode}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
        />
      </div>

      <ProductFormDialog open={open} onClose={() => setOpen(false)} editData={editData} onSubmit={editData ? handleUpdate : handleCreate} />
    </>
  )
}
