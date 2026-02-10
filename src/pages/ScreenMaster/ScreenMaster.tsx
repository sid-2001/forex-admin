import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import ScreenFormDialog from '../../components/screenFormDialog'
import ScreenService, { Screen } from '@/services/screen.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import dayjs from 'dayjs'

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
    const payload = {
      applicant_id: local_service?.get_staff_id() || 'admin',
      screencode: data.screencode,
      screendescription: data.screendescription,
      countrycode: data.selectedCountry,
      active: data.active,
      effectivefromdate: `${data.fromDate}T00:00:00`,
      effectivetodate: `${data.toDate}T23:59:59`,
    }

    const response: any = isUpdate ? await screen_service.updateScreen(payload) : await screen_service.createScreen(payload)

    if (response?.success === true || response?.status === 'Success') {
      showAlert('Success', `Screen ${isUpdate ? 'Updated' : 'Created'} Successfully`)
      setDialogopen(false)
      fetchData()
    } else {
      showAlert('Fail', response?.message || 'Server Error')
    }
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
    { field: 'screencode', headerName: 'Screen Code', flex: 0.6, headerClassName: 'super-app-theme--header' },
    { field: 'screendescription', headerName: 'Description', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'countrycode', headerName: 'Country', flex: 0.4, headerClassName: 'super-app-theme--header' },
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
          onClick={() => {
            setEditData(params.row)
            setDialogopen(true)
          }}
          color="primary"
          size="small"
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
        {'Screen master'.toUpperCase()}
      </Typography>
      <Stack direction="row" justifyContent="flex-end" alignItems="center" mb={3}>
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
        getRowId={(row: any) => `${row.screencode}-${row.countrycode}`}
        autoHeight
        density="standard"
        disableRowSelectionOnClick
        // initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
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
