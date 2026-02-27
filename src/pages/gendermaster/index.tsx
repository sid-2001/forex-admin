import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import GenderFormDialog from '../../components/genderFormDialog'
import GenderService from '@/services/gender.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import ConfirmModal from '@/components/ConfirmModal'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { GridToolbar } from '@mui/x-data-grid'

dayjs.extend(utc)
dayjs.extend(timezone)

dayjs.extend(utc)
import { getLiveAuditData } from '@/helpers/dynamicLocations'

export default function GenderMaster() {
  const [rows, setRows] = useState<any[]>([])
  const [dialogopen, setDialogopen] = useState(false)
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [editData, setEditData] = useState<any>(null)

  const local_service = useMemo(() => new LocalStorageService(), [])
  const static_service = useMemo(() => new GenderService(), [])

  const formatTableDate = (dateString: string) => {
    if (!dateString) return ''

    const cleanDate = String(dateString).split('T')[0]

    const storedConfig = localStorage.getItem('countryConfig')
    let format = 'YYYY-MM-DD'

    if (storedConfig) {
      const config = JSON.parse(storedConfig)
      format = config.dateFormat.replace(/d/g, 'D').replace(/y/g, 'Y')
    }

    return dayjs(cleanDate).format(format.toUpperCase())
  }

  const fetchData = useCallback(async () => {
    const res: any = await static_service.getGenderList()
    const responseData = res?.data || res
    setRows(Array.isArray(responseData) ? responseData : [])
  }, [static_service])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const showAlert = (alertType: 'Success' | 'Fail', alertText: string) => {
    settype(alertType)
    setText(alertText)
    setOpen(true)
  }

  // const handleAction = async (data: any, isUpdate: boolean) => {
  //   if (data.validationError) {
  //     showAlert('Fail', data.validationError)
  //     return
  //   }

  //   const now = dayjs()

  //   const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  //   const auditTime = {
  //     timeZone: userTimeZone,
  //     offset: dayjs().tz(userTimeZone).format('Z'),
  //     utcDateTime: dayjs().utc().format('YYYY-MM-DD HH:mm:ss.SSS'),
  //     localDateTime: dayjs().tz(userTimeZone).format('YYYY-MM-DD HH:mm:ss.SSS'),
  //   }
  //   console.log(auditTime, 'bhanu', auditTime.localDateTime)

  //   const payload = {
  //     applicant_id: local_service?.get_staff_id(),
  //     gendercode: data.gendercode?.substring(0, 1).toUpperCase(),
  //     countrycode: data.selectedCountry?.substring(0, 3).toUpperCase(),
  //     description: data.description?.substring(0, 25),
  //     active: data.active,
  //     effectivefromdate: `${data.effectiveFrom}T00:00:00.000Z`,
  //     effectivetodate: `${data.effectiveTo}T00:00:00.000Z`,

  //     ...(isUpdate
  //       ? {
  //           modified_time: auditTime.timeZone,
  //           modified_off: auditTime.offset,
  //           Modified_UTCDateTime: auditTime.utcDateTime,
  //           modified_local_date_time: auditTime.localDateTime,
  //           modifiedby: local_service?.get_staff_id(),
  //         }
  //       : {
  //           created_time: auditTime.timeZone,
  //           created_off: auditTime.offset,
  //           Created_UTCDateTime: auditTime.utcDateTime,
  //           created_local_date_time: auditTime.localDateTime, // Correct Local Time
  //           createdby: local_service?.get_staff_id(),
  //         }),
  //   }

  //   try {
  //     const response: any = isUpdate ? await static_service.updateGender(payload as any) : await static_service.createGender(payload)

  //     if (response?.success || response?.status === 'Success' || response?.status === true) {
  //       showAlert('Success', `Gender ${isUpdate ? 'Updated' : 'Created'} Successfully`)
  //       setDialogopen(false)
  //       fetchData()
  //     } else {
  //       showAlert('Fail', response?.error || response?.message || 'Server Error')
  //     }
  //   } catch (err: any) {
  //     showAlert('Fail', err.message || 'Network Error')
  //   }
  // }
  const handleAction = async (data: any, isUpdate: boolean) => {
    if (data.validationError) {
      showAlert('Fail', data.validationError)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        const audit = await getLiveAuditData(latitude, longitude)

        if (!audit) {
          showAlert('Fail', 'Failed to generate audit trail. Please check your connection.')
          return
        }

        const staffId = local_service?.get_staff_id()

        const payload = {
          applicant_id: staffId,
          gendercode: data.gendercode?.substring(0, 1).toUpperCase(),
          countrycode: data.selectedCountry?.substring(0, 3).toUpperCase(),
          description: data.description?.substring(0, 25),
          active: data.active,
          effectivefromdate: `${data.effectiveFrom}T00:00:00.000Z`,
          effectivetodate: `${data.effectiveTo}T00:00:00.000Z`,

          ...(isUpdate
            ? {
                modifiedby: staffId,
                modified_local_date_time: audit.localDateTime,
                Modified_UTCDateTime: audit.utcDateTime,
                modified_time: audit.timeZone,
                modified_off: audit.offset,
              }
            : {
                createdby: staffId,
                created_local_date_time: audit.localDateTime,
                Created_UTCDateTime: audit.utcDateTime,
                created_time: audit.timeZone,
                created_off: audit.offset,
              }),
        }

        try {
          const response: any = isUpdate ? await static_service.updateGender(payload as any) : await static_service.createGender(payload)

          if (response?.success || response?.status === 'Success' || response?.status === true) {
            showAlert('Success', `Gender ${isUpdate ? 'Updated' : 'Created'} Successfully`)
            setDialogopen(false)
            fetchData()
          } else {
            console.error(response)
            showAlert('Fail', 'Please select unique gender code')
          }
        } catch (err: any) {
          showAlert('Fail', err.message || 'Network Error')
        }
      },
      (geoError) => {
        showAlert('Fail', 'Location access is required for audit purposes.')
        console.error('Geolocation Error:', geoError)
      },
    )
  }
  const columns: GridColDef[] = [
    { field: 'gendercode', headerName: 'Code', width: 80, headerClassName: 'super-app-theme--header' },
    { field: 'description', headerName: 'Description', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'countrycode', headerName: 'Country', width: 100, headerClassName: 'super-app-theme--header' },
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
      headerName: 'Actions',
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
          >
            <EditIcon />
          </IconButton>
        </Stack>
      ),
    },
  ]

  return (
    <Box p={3} sx={{ width: '100%' }}>
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
          {'Gender Master'.toUpperCase()}
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
        getRowId={(row: any) => `${row.gendercode}-${row.countrycode}`}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[5]}
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: false } }}
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

      <GenderFormDialog
        open={dialogopen}
        onClose={() => setDialogopen(false)}
        editData={editData}
        onSubmit={(data: any) => handleAction(data, !!editData)}
      />

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          await static_service.deleteGender({ gendercode: selectedRow.gendercode, countrycode: selectedRow.countrycode })
          showAlert('Success', 'Deleted Successfully')
          setDeleteModalOpen(false)
          fetchData()
        }}
        title="Delete Gender?"
        message={`Delete ${selectedRow?.gendercode}?`}
      />
    </Box>
  )
}
