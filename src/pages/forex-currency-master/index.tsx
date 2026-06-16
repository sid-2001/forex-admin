import { useEffect, useState, useCallback, useMemo } from 'react'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DownloadIcon from '@mui/icons-material/Download'

import ForexCurrencyService, { ForexCurrency } from '@/services/forex-currency.service'
import ForexCurrencyDialog from '@/components/forex-currency-dialog'
import { formatTableDate } from '@/helpers/dateformate'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import dayjs from 'dayjs'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { HelperService } from '@/helpers/helper'

export default function ForexCurrencyMaster() {
  const service = useMemo(() => new ForexCurrencyService(), [])

  const [rows, setRows] = useState<ForexCurrency[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<ForexCurrency | null>(null)
  const [isFormChanged, setIsFormChanged] = useState(false)

  // Inside your function component at the top
  const [alertOpen, setAlertOpen] = useRecoilState(alertState)
  const [alertText, setAlertText] = useRecoilState(alertTextState)
  const [alertType, setAlertType] = useRecoilState(alertTypeState)

  // Then add the helper function
  const showAlert = (type: 'Success' | 'Fail', text: string) => {
    setAlertType(type)
    setAlertText(text)
    setAlertOpen(true)
  }

  const local_service = useMemo(() => new LocalStorageService(), [])
  const helper = new HelperService()

  const fetchData = useCallback(async () => {
    const res = await service.getAll()
    setRows(res)
  }, [service])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Function to download CSV with all fields
  const downloadCSV = () => {
    if (!rows || rows.length === 0) {
      showAlert('Fail', 'No data to export')
      return
    }

    // Define CSV headers based on entity fields
    const headers = [
      'Country Code',
      'Currency Code',
      'Currency Name',
      'Currency Symbol',
      'Active',
      'Effective From',
      'Effective To',
      'Created By',
      'Created Date',
      'Modified By',
      'Modified Date',
    ]

    // Map data to CSV rows
    const csvRows = (rows as any).map(
      //@ts-ignore
      (row) => [
        row.countryCode || '',
        row.currencyCode || '',
        row.currencyName || '',
        row.currencySymbol || '',
        row.active ? 'Yes' : 'No',
        formatTableDate(row.effectiveFromDate || row.effectivefromdate),
        formatTableDate(row.effectiveToDate || row.effectivetodate),
        row.createdBy || '',
        row.createdLocaldatetime ? dayjs(row.createdLocaldatetime).format('YYYY-MM-DD HH:mm') : '',
        row.modifiedBy || '',
        row.modifiedLocaldatetime ? dayjs(row.modifiedLocaldatetime).format('YYYY-MM-DD HH:mm') : '',
      ],
    )

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      //@ts-ignore
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    // Create and download the file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `forex_currency_${new Date().toISOString().split('T')[0]}.csv`)
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

  const handleCreate = async (data: any) => {
    try {
      const res = await service.create(data)
      setDialogOpen(false)
      showAlert('Success', res?.message)
      fetchData()
    } catch (e) {
      showAlert('Fail', 'Please check the fields')
    }
  }

  const handleUpdate = async (data: any) => {
    if (!editData) return
    let res = await service.update(editData.countryCode, data)
    showAlert('Success', res.message)
    setEditData(null)
    setDialogOpen(false)
    setIsFormChanged(false)
    fetchData()
  }

  const handleDelete = async (row: ForexCurrency) => {
    const res = await service.delete(row.countryCode)
    fetchData()
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setIsFormChanged(false)
    setEditData(null)
  }

  const handleFormChange = (changed: boolean) => {
    setIsFormChanged(changed)
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
              setIsFormChanged(false)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
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
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={2} sx={{ width: '85vw' }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
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
            {'Currency master'.toUpperCase()}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setEditData(null)
              setDialogOpen(true)
              setIsFormChanged(false)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
          >
            Add
          </Button>
        </Stack>

        <DataGrid
          rows={rows}
          getRowId={(row) => row.countryCode}
          columns={columns}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          disableColumnMenu
          pageSizeOptions={[5]}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 5 } },
          }}
        />

        <ForexCurrencyDialog
          open={dialogOpen}
          editData={editData}
          onClose={handleDialogClose}
          onSubmit={editData ? handleUpdate : handleCreate}
          onFormChange={handleFormChange}
          isUpdateDisabled={editData ? !isFormChanged : false}
        />
      </Box>
    </HasPermission>
  )
}
