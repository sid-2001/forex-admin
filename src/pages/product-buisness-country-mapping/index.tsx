import { useEffect, useState, useCallback, useMemo } from 'react'
import { Box, Button, IconButton, Stack, Chip, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DownloadIcon from '@mui/icons-material/Download'
import ProductBusinessCountryMappingDialog from '../../components/product-buisness-country-mapping-dialog'
import ProductBusinessCountryMappingService from '@/services/productBusinessCountryMapping.service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import dayjs from 'dayjs'
import ProductService from '@/services/product.service'
import { formatTableDate } from '@/helpers/dateformate'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { HelperService } from '@/helpers/helper'

export default function ProductBusinessCountryMapping() {
  const service = useMemo(() => new ProductBusinessCountryMappingService(), [])
  const [rows, setRows] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [isFormChanged, setIsFormChanged] = useState(false)
  const [productlist, setProductlist] = useState([])

  const [, setAlertOpen] = useRecoilState(alertState)
  const [, setAlertText] = useRecoilState(alertTextState)
  const [, setAlertType] = useRecoilState(alertTypeState)

  const showAlert = (type: 'Success' | 'Fail', text: string) => {
    setAlertType(type)
    setAlertText(text)
    setAlertOpen(true)
  }
  const product_service = new ProductService()
  const local_service = useMemo(() => new LocalStorageService(), [])
  const helper = new HelperService()

  const fetchList = useCallback(async () => {
    try {
      const res: any = await service.getList()
      console.log('Fetched Data Sample:', res[0])
      product_service.getProductsData().then((data) => {
        setProductlist(data)
      })
      setRows(Array.isArray(res) ? res : res?.data || [])
    } catch (err) {
      setRows([])
    }
  }, [service])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  // Function to download CSV with all fields
  const downloadCSV = () => {
    if (!rows || rows.length === 0) {
      showAlert('Fail', 'No data to export')
      return
    }

    // Define CSV headers based on entity fields
    const headers = [
      'Business Map Code',
      'Country Product Code',
      'Recipient Country',
      'Payment Rail',
      'Active',
      'Effective From',
      'Effective To',
      'Created By',
      'Created Date',
      'Modified By',
      'Modified Date',
    ]

    // Map data to CSV rows
    const csvRows = rows.map((row) => [
      row.businessMapCode || '',
      row.countryCorridorProductCode || row.productCode || '',
      row.recipientCountry || '',
      row.paymentRail || '',
      row.active ? 'Yes' : 'No',
      formatTableDate(row.effectiveFromDate || row.effective_from_date),
      formatTableDate(row.effectiveToDate || row.effective_to_date),
      row.createdBy || '',
      row.createdLocalDateTime ? dayjs(row.createdLocalDateTime).format('YYYY-MM-DD HH:mm') : '',
      row.modifiedBy || '',
      row.modifiedLocalDateTime ? dayjs(row.modifiedLocalDateTime).format('YYYY-MM-DD HH:mm') : '',
    ])

    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n')

    // Create and download the file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `product_mapping_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showAlert('Success', 'CSV downloaded successfully')
  }

  // Custom toolbar with CSV download button
  const CustomToolbar = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
        <GridToolbar />
        <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={downloadCSV} sx={{ ml: 2 }}>
          Export CSV
        </Button>
      </Box>
    )
  }

  const handleDialogClose = () => {
    setOpen(false)
    setIsFormChanged(false)
    setEditData(null)
  }

  const handleFormChange = (changed: boolean) => {
    setIsFormChanged(changed)
  }

  const columns: GridColDef[] = [
    { field: 'businessMapCode', headerName: 'Code', flex: 0.8, headerClassName: 'super-app-theme--header' },
    { field: 'countryCorridorProductCode', headerName: 'Product', flex: 0.8, headerClassName: 'super-app-theme--header' },
    { field: 'recipientCountry', headerName: 'Country', flex: 0.5, headerClassName: 'super-app-theme--header' },
    { field: 'paymentRail', headerName: 'Payment Rail', flex: 0.8, headerClassName: 'super-app-theme--header' },
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
      flex: 0.5,
      renderCell: (params) => (params.row?.active ? 'Yes' : 'No'),
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      headerClassName: 'super-app-theme--header',
      sortable: false,
      renderCell: (params) => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => {
            setEditData(params.row)
            setOpen(true)
            setIsFormChanged(false)
          }}
          disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3} sx={{ width: '100%', '& .super-app-theme--header': { backgroundColor: '#f5f5f5', fontWeight: 'bold' } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              display: 'grid',
              placeItems: 'center',
              color: '#0061B1',
            }}
          >
            {'Product Business Country Mapping'.toUpperCase()}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setEditData(null)
              setOpen(true)
              setIsFormChanged(false)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
          >
            Add
          </Button>
        </Stack>

        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.businessMapCode || Math.random()}
          autoHeight
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          disableColumnMenu
          // density="standard"
          //@ts-ignore
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              showDensitySelector: true, // ✅ enable density
            },
          }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          sx={{
            boxShadow: 2,
            border: 2,
            borderColor: '#f5f5f5',
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
          }}
        />

        <ProductBusinessCountryMappingDialog
          open={open}
          handleClose={handleDialogClose}
          editData={editData}
          refreshList={fetchList}
          showAlert={showAlert}
          onFormChange={handleFormChange}
          isUpdateDisabled={editData ? !isFormChanged : false}
          productList={productlist}
        />
      </Box>
    </HasPermission>
  )
}
