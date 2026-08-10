import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { GridToolbar } from '@mui/x-data-grid'
import { HelperService } from '@/helpers/helper'
import { formatTableDate } from '@/helpers/dateformate'
import HasPermission from '@/components/permissionWrapper'
import MasterService from '@/services/master.service'
import GroupDialog from '@/components/groupDialog'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(utc)

export default function Group() {
  const [rows, setRows] = useState<any[]>([])
  const [dialogopen, setDialogopen] = useState(false)
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const [editData, setEditData] = useState<any>(null)

  const local_service = useMemo(() => new LocalStorageService(), [])
  const master_service = useMemo(() => new MasterService(), [])
  const helper = new HelperService()
  const staffId = local_service?.get_staff_id()
  const showAlert = (alertType: 'Success' | 'Fail', alertText: string) => {
    settype(alertType)
    setText(alertText)
    setOpen(true)
  }

  const fetchData = useCallback(async () => {
    const res: any = await master_service.getAllGroups()
    const responseData = res?.data || res
    setRows(Array.isArray(responseData) ? responseData : [])
  }, [master_service])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAction = async (data: any, isUpdate: boolean) => {
    if (data.validationError) {
      showAlert('Fail', data.validationError)
      return
    }

    const payload = {
      ...data,
      effectiveFromDate: `${data.effectiveFromDate}T00:00:00.000Z`,
      effectiveToDate: `${data.effectiveToDate}T00:00:00.000Z`,

      ...(isUpdate
        ? {
            modifiedBy: staffId,
          }
        : {
            createdBy: staffId,
          }),
    }

    try {
      const response: any = isUpdate
        ? await master_service.updateGroup(editData.groupCode, payload as any)
        : await master_service.createGroup(payload)

      if (response?.success || response?.status === 'Success' || response?.status === true) {
        showAlert('Success', `Group ${isUpdate ? 'Updated' : 'Created'} Successfully`)
        setDialogopen(false)
        fetchData()
      } else {
        console.error(response)
        showAlert('Fail', 'Please select unique code')
      }
    } catch (err: any) {
      showAlert('Fail', err.message || 'Network Error')
    }
  }
  const columns: GridColDef[] = [
    { field: 'groupCode', headerName: 'Group Code', width: 80, headerClassName: 'super-app-theme--header' },
    { field: 'groupShortName', headerName: 'Group Short Name', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'groupName', headerName: 'Group Name', width: 100, headerClassName: 'super-app-theme--header' },
    { field: 'groupDisplayName', headerName: 'Group Display Name', width: 100, headerClassName: 'super-app-theme--header' },
    {
      field: 'effectivefromdate',
      headerName: 'Effective From',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectivefromdate || params.row?.effectiveFromDate),
    },
    {
      field: 'effectivetodate',
      headerName: 'Effective To',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectivetodate || params.row?.effectiveToDate),
    },
    {
      field: 'active',
      headerName: 'Active',
      width: 100,
      renderCell: (params) => (params.value ? 'Yes' : 'No'),
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'actions',
      headerName: 'Action',
      width: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            onClick={() => {
              setEditData(params.row)
              setDialogopen(true)
            }}
            color="primary"
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
      <Box p={3} sx={{ width: '90vw' }}>
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
            {'Group Master'.toUpperCase()}
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
          getRowId={(row: any) => `${row.groupShortCode}`}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[5]}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          disableColumnMenu
          sx={{
            '& .super-app-theme--header': {
              fontWeight: 'bold',
            },
          }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
        />

        <GroupDialog
          open={dialogopen}
          onClose={() => setDialogopen(false)}
          editData={editData}
          onSubmit={(data: any) => handleAction(data, !!editData)}
        />
      </Box>
    </HasPermission>
  )
}
