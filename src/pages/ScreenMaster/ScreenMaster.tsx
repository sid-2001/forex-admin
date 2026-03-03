import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import ScreenFormDialog from '../../components/screenFormDialog'
import ScreenService, { Screen } from '@/services/screen.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import dayjs from 'dayjs'
import { getLiveAuditData } from '@/helpers/dynamicLocations'

export default function ScreenMaster() {
  const [rows, setRows] = useState<Screen[]>([])
  const [dialogopen, setDialogopen] = useState(false)
  const [editData, setEditData] = useState<Screen | null>(null)

  const [, setAlertOpen] = useRecoilState(alertState)
  const [, setAlertText] = useRecoilState(alertTextState)
  const [, setAlertType] = useRecoilState(alertTypeState)

  const local_service = useMemo(() => new LocalStorageService(), [])
  const screen_service = useMemo(() => new ScreenService(), [])

  const fetchData = useCallback(async () => {
    try {
      const res: any = await screen_service.getScreenList()
      const responseData = res?.data || res
      setRows(Array.isArray(responseData) ? responseData : [])
    } catch (err) {
      setRows([])
    }
  }, [screen_service])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const showAlert = (type: 'Success' | 'Fail', text: string) => {
    setAlertType(type)
    setAlertText(text)
    setAlertOpen(true)
  }

  const handleAction = async (data: any, isUpdate: boolean) => {
    if (data.validationError) {
      showAlert('Fail', data.validationError)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const audit = await getLiveAuditData(pos.coords.latitude, pos.coords.longitude)
        const staffId = local_service?.get_staff_id()

        if (!audit) {
          showAlert('Fail', 'Audit trail generation failed.')
          return
        }

        const payload = {
          applicant_id: staffId,
          ScreenCode: data.screencode?.toUpperCase(),
          ScreenDescription: data.screendescription,
          CountryCode: data.selectedCountry?.toUpperCase(),
          Active: data.active,
          EffectiveFromDate: `${data.fromDate}T00:00:00.000Z`,
          EffectiveToDate: `${data.toDate}T00:00:00.000Z`,

          ...(isUpdate
            ? {
                ModifiedBy: staffId,
                Modified_TimeZone: audit.timeZone,
                Modified_Offset: audit.offset,
                Modified_UTCDateTime: audit.utcDateTime,
                Modified_LocalDateTime: audit.localDateTime,
              }
            : {
                CreatedBy: staffId,
                Created_TimeZone: audit.timeZone,
                Created_Offset: audit.offset,
                Created_UTCDateTime: audit.utcDateTime,
                Created_LocalDateTime: audit.localDateTime,
              }),
        }

        try {
          const response: any = isUpdate ? await screen_service.updateScreen(payload as any) : await screen_service.createScreen(payload as any)

          if (response?.success || response?.status === 'Success') {
            showAlert('Success', `Screen ${isUpdate ? 'Updated' : 'Created'} Successfully`)
            setDialogopen(false)
            fetchData()
          } else {
            showAlert('Fail', response?.message || 'Please select unique screen code')
          }
        } catch (error: any) {
          showAlert('Fail', error.message || 'Connection Error')
        }
      },
      (geoError) => {
        showAlert('Fail', 'Location permission is required for audit compliance.')
        console.error('Geo Error:', geoError)
      },
    )
  }

  const formatDateForTable = (dateStr: any) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
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
    {
      field: 'ScreenCode',
      headerName: 'Screen Code',
      flex: 0.6,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'ScreenDescription',
      headerName: 'Description',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'CountryCode',
      headerName: 'Country',
      flex: 0.4,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'EffectiveFromDate',
      headerName: 'Effective From',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.value),
    },
    {
      field: 'EffectiveToDate',
      headerName: 'Effective To',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.value),
    },
    {
      field: 'Active',
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
      renderCell: (params) => (
        <IconButton
          onClick={() => {
            setEditData(params.row)
            setDialogopen(true)
          }}
          color="primary"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  return (
    <Box p={3} sx={{ width: '100%', '& .super-app-theme--header': { fontWeight: 'bold' } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.02em',
            display: 'grid',
            placeItems: 'center',
            // mb: 5,
            color: '#0061B1',
          }}
        >
          {'Screen master'.toUpperCase()}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setDialogopen(true)
          }}
        >
          Add
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row: any) => `${row.ScreenCode}-${row.CountryCode}`}
        autoHeight
        density="standard"
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true } }}
        disableColumnMenu
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

      <ScreenFormDialog
        open={dialogopen}
        onClose={() => setDialogopen(false)}
        editData={editData}
        onSubmit={(data: any) => handleAction(data, !!editData)}
      />
    </Box>
  )
}
