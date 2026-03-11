import { Button, Stack, IconButton, Box, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DownloadIcon from '@mui/icons-material/Download'
import { useEffect, useState, useMemo, useCallback } from 'react'
import WhatsappTemplateDialog from '../../components/whatsAppDialog'
import WhatsappTemplateService from '../../services/whatsapp.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import dayjs from 'dayjs'
import { formatTableDate } from '@/helpers/dateformate'

export default function WhatsappTemplateManagement() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isFormChanged, setIsFormChanged] = useState(false)

  const [, setAlertOpen] = useRecoilState(alertState)
  const [, setAlertText] = useRecoilState(alertTextState)
  const [, setAlertType] = useRecoilState(alertTypeState)

  const templateService = useMemo(() => new WhatsappTemplateService(), [])
  const local_service = useMemo(() => new LocalStorageService(), [])

  const showAlert = (type: 'Success' | 'Fail', text: string) => {
    setAlertType(type)
    setAlertText(text)
    setAlertOpen(true)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await templateService.getTemplateList()
      const responseData = res?.data || res
      console.log(responseData, 'dknhicb')
      setRows(Array.isArray(responseData) ? responseData : [])
    } catch (error) {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [templateService])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAction = async (data: any, isUpdate: boolean) => {
    try {
      // Original payload structure preserved exactly
      const payload = {
        countryCode: data.countryCode,
        whatsappTemplateDescription: data.whatsappTemplateDescription,
        active: data.active,
        effectiveFromDate: data.effectiveFromDate,
        effectiveToDate: data.effectiveToDate,
        [isUpdate ? 'modifiedBy' : 'createdBy']: local_service?.get_staff_id() || 'admin',
      }

      const res = isUpdate
        ? await templateService.updateTemplate(editData?.whatsappTemplateCode, payload)
        : await templateService.createTemplate(payload)

      if (res.status !== false) {
        showAlert('Success', `${res?.mess || res?.message || 'Operation completed successfully'}`)
        setOpen(false)
        setEditData(null)
        setIsFormChanged(false)
        fetchData()
      } else {
        showAlert('Fail', res.message || 'Server Error')
      }
    } catch (e) {
      showAlert('Fail', 'Connection Error')
    }
  }

  // Function to download CSV with all fields
  const downloadCSV = () => {
    if (!rows || rows.length === 0) {
      showAlert('Fail', 'No data to export')
      return
    }

    // Define CSV headers based on available fields
    const headers = ['Template Code', 'Description', 'Country Code', 'Active', 'Effective From', 'Effective To']

    // Map data to CSV rows - using only fields that exist in the data
    const csvRows = rows.map((row) => [
      row.whatsappTemplateCode || '',
      row.whatsappTemplateDescription || '',
      row.countryCode || '',
      row.active ? 'Yes' : 'No',
      formatTableDate(row.effectiveFromDate || row.effective_from_date),
      formatTableDate(row.effectiveToDate || row.effective_to_date),
    ])

    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n')

    // Create and download the file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `whatsapp_templates_${new Date().toISOString().split('T')[0]}.csv`)
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
    { field: 'whatsappTemplateCode', headerName: 'Template Code', flex: 0.8, headerClassName: 'super-app-theme--header' },
    { field: 'whatsappTemplateDescription', headerName: 'Description', flex: 1.5, headerClassName: 'super-app-theme--header' },
    { field: 'countryCode', headerName: 'Country', flex: 0.5, headerClassName: 'super-app-theme--header' },
    {
      field: 'effective_from_date',
      headerName: 'Effective From',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectiveFromDate || params.row?.effective_from_date),
    },
    {
      field: 'effective_to_date',
      headerName: 'Effective To',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectiveToDate || params.row?.effective_to_date),
    },
    {
      field: 'active',
      headerName: 'Active',
      flex: 0.4,
      headerClassName: 'super-app-theme--header',
      renderCell: (p) => (p.value ? 'Yes' : 'No'),
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
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  return (
    <Box p={3} sx={{ width: '100%', '& .super-app-theme--header': { fontWeight: 'bold' } }}>
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
          {'WhatsApp Master'.toUpperCase()}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setOpen(true)
            setIsFormChanged(false)
          }}
        >
          Add
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.whatsappTemplateCode || Math.random()}
        autoHeight
        disableRowSelectionOnClick
        slots={{ toolbar: CustomToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true } }}
        disableColumnMenu
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
      />

      <WhatsappTemplateDialog
        open={open}
        onClose={handleDialogClose}
        editData={editData}
        onSubmit={(data: any) => handleAction(data, !!editData)}
        onFormChange={handleFormChange}
        isUpdateDisabled={editData ? !isFormChanged : false}
      />
    </Box>
  )
}
