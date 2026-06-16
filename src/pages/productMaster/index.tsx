import { Button, Stack, IconButton, Box, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useEffect, useState, useCallback, useMemo } from 'react'

import ProductFormDialog from '../../components/productDialog'
import ProductService from '../../services/product.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import dayjs from 'dayjs'
import { formatTableDate } from '@/helpers/dateformate'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'

export default function ProductManagement() {
  const productService = useMemo(() => new ProductService(), [])
  const local_service = useMemo(() => new LocalStorageService(), [])
  const helper = new HelperService()

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
    if (res.status == false) {
      showAlert('Fail', `${res.message}`)
    } else if (res) {
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

    { field: 'countryProductCode', headerName: 'Country Product Code', flex: 1, headerClassName: 'super-app-theme--header' },

    { field: 'productCode', headerName: 'Product Code', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'productName', headerName: 'Description', flex: 2, headerClassName: 'super-app-theme--header' },
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
      field: 'effective_from_date',
      headerName: 'Effective From',
      flex: 1,
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      //@ts-ignore
      valueGetter: (value, row) => {
        const date = row?.effectivefromdate || row?.effectiveFromDate

        return date ? formatTableDate(date) : ''
      },
    },
    {
      field: 'effective_to_date',
      headerName: 'Effective To',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      minWidth: 150,
      //@ts-ignore
      valueGetter: (value, row) => {
        const date = row?.effectivetodate || row?.effectiveToDate

        return date ? formatTableDate(date) : ''
      },
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
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
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
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3} sx={{ width: '100%', '& .super-app-theme--header': { fontWeight: 'bold' } }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              // color: 'text.primary',
              letterSpacing: '-0.02em',
              display: 'grid',
              placeItems: 'center',
              // mb: 5,
              color: '#0061B1',
            }}
          >
            {'Product Master'.toUpperCase()}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setEditData(null)
              setOpen(true)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
          >
            Add
          </Button>
        </Stack>

        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.countryProductCode || Math.random()}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          disableColumnMenu
          autoHeight
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 5 } },
          }}
        />

        <ProductFormDialog open={open} onClose={() => setOpen(false)} editData={editData} onSubmit={handleAction} />
      </Box>
    </HasPermission>
  )
}
