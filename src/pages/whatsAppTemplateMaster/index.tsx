import { Button, Stack, IconButton, Box, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import { useEffect, useState, useMemo, useCallback } from 'react'
import WhatsappTemplateDialog from '../../components/whatsAppDialog'
import WhatsappTemplateService from '../../services/whatsapp.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import dayjs from 'dayjs'

export default function WhatsappTemplateManagement() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

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
        showAlert('Success', `Template ${isUpdate ? 'Updated' : 'Created'} Successfully`)
        setOpen(false)
        fetchData()
      } else {
        showAlert('Fail', res.message || 'Server Error')
      }
    } catch (e) {
      showAlert('Fail', 'Connection Error')
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

  const formatDateForTable = (dateStr: any) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
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
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
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
          letterSpacing: '-0.02em',
          display: 'grid',
          placeItems: 'center',
          mb: 5,
          color: '#0061B1',
        }}
      >
        {'whatsApp master'.toUpperCase()}
      </Typography>
      <Stack direction="row" justifyContent="flex-end" alignItems="center" mb={2}>
        {/* <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          WhatsApp Template Management
        </Typography> */}
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
        getRowId={(row) => row.whatsappTemplateCode}
        autoHeight
        disableRowSelectionOnClick
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        // pageSizeOptions={[5, 10, 20]}
      />

      <WhatsappTemplateDialog
        open={open}
        onClose={() => setOpen(false)}
        editData={editData}
        onSubmit={(data: any) => handleAction(data, !!editData)}
      />
    </Box>
  )
}
