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
import { formatTableDate } from '@/helpers/dateformate'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'

export default function ScreenMaster() {
  const [rows, setRows] = useState<Screen[]>([])
  const [dialogopen, setDialogopen] = useState(false)
  const [editData, setEditData] = useState<Screen | null>(null)

  const [, setAlertOpen] = useRecoilState(alertState)
  const [, setAlertText] = useRecoilState(alertTextState)
  const [, setAlertType] = useRecoilState(alertTypeState)

  const local_service = useMemo(() => new LocalStorageService(), [])
  const screen_service = useMemo(() => new ScreenService(), [])
  const helper = new HelperService()
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
              }
            : {
                CreatedBy: staffId,
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
          disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
          color="primary"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
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
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
          >
            Add
          </Button>
        </Stack>

        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row: any) => `${row.ScreenCode}-${row.CountryCode}`}
          autoHeight
          // density="standard"
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
    </HasPermission>
  )
}
