import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import StateFormDialog from '../../components/stateformDialog'
import StateService from '@/services/state.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import ConfirmModal from '@/components/ConfirmModal'
import { getLiveAuditData } from '@/helpers/dynamicLocations'
import { formatTableDate } from '@/helpers/dateformate'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'

export default function StateManagement() {
  const [rows, setRows] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)

  const [alert, setAlert] = useRecoilState(alertState)
  const [alertText, setAlertText] = useRecoilState(alertTextState)
  const [alertType, setAlertType] = useRecoilState(alertTypeState)

  const local_service = useMemo(() => new LocalStorageService(), [])
  const stateService = useMemo(() => new StateService(), [])
  const helper = new HelperService()

  const showAlert = (type: 'Success' | 'Fail', message: string) => {
    setAlertType(type)
    setAlertText(message)
    setAlert(true)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await stateService.getStateList()
      const responseData = res?.data || res
      setRows(Array.isArray(responseData) ? responseData : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [stateService])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAction = async (data: any, isUpdate: boolean) => {
    if (data.validationError) {
      showAlert('Fail', data.validationError)
      return
    }

    // 1. Get Geolocation
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // 2. Fetch rich audit data using the utility
        const audit = await getLiveAuditData(pos.coords.latitude, pos.coords.longitude)
        const staffId = local_service?.get_staff_id()

        if (!audit) {
          showAlert('Fail', 'Failed to generate audit trail.')
          return
        }

        // 3. Construct Payload using PascalCase to match DB columns
        const payload = {
          applicant_id: staffId,
          StateCode: data.stateCode?.toUpperCase(),
          StateDescription: data.description,
          CountryCode: data.countryCode?.toUpperCase(),
          Active: data.active,
          EffectiveFromDate: data.effectiveFromDate,
          EffectiveToDate: data.effectiveToDate,

          ...(isUpdate
            ? {
                ModifiedBy: staffId,
              }
            : {
                CreatedBy: staffId,
              }),
        }

        try {
          const response: any = isUpdate ? await stateService.updateState(payload as any) : await stateService.createState(payload as any)

          if (response?.success || response?.status === 'Success' || response?.status === true) {
            showAlert('Success', `State ${isUpdate ? 'Updated' : 'Created'} Successfully`)
            setOpen(false)
            fetchData()
          } else {
            showAlert('Fail', response?.message || 'Please select unique state code')
          }
        } catch (error: any) {
          showAlert('Fail', error.message || 'Connection Error')
        }
      },
      (_) => {
        showAlert('Fail', 'Location access is required for auditing. Please enable it.')
      },
    )
  }

  const columns: GridColDef[] = [
    { field: 'StateCode', headerName: 'State Code', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'StateDescription', headerName: 'Description', flex: 2, headerClassName: 'super-app-theme--header' },
    { field: 'CountryCode', headerName: 'Country', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'EffectiveFromDate',
      headerName: 'Effective From',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.value),
    },
    {
      field: 'EffectiveToDate',
      headerName: 'Effective To',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.value),
    },
    {
      field: 'Active',
      headerName: 'Active',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      renderCell: (p) => (p.value ? 'Yes' : 'No'),
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
        </Stack>
      ),
    },
  ]

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
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
            {'State Master'.toUpperCase()}
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

        <Box sx={{ height: 500, width: '100%', '& .super-app-theme--header': { fontWeight: 'bold' } }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            getRowId={(row) => `${row.StateCode}-${row.CountryCode}`}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
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
        </Box>

        <StateFormDialog open={open} onClose={() => setOpen(false)} editData={editData} onSubmit={(data: any) => handleAction(data, !!editData)} />

        <ConfirmModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={async () => {
            await stateService.deleteState({ statecode: selectedRow.statecode, countrycode: selectedRow.countrycode })
            showAlert('Success', 'State Deleted Successfully')
            setDeleteModalOpen(false)
            fetchData()
          }}
          title="Delete State?"
          message={`Are you sure you want to delete ${selectedRow?.statecode}?`}
        />
      </Box>
    </HasPermission>
  )
}
