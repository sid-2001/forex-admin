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

  //   navigator.geolocation.getCurrentPosition(
  //     async (pos) => {
  //       const audit = await getLiveAuditData(pos.coords.latitude, pos.coords.longitude)

  //       if (!audit) {
  //         showAlert('Fail', 'Could not retrieve location/time data.')
  //         return
  //       }

  //       const payload = {
  //         applicant_id: local_service?.get_staff_id(),
  //         gendercode: data.gendercode,
  //         description: data.description,
  //         countrycode: data.selectedCountry,
  //         active: data.active,
  //         effectivefromdate: `${data.effectiveFrom}T00:00:00.000Z`,
  //         effectivetodate: `${data.effectiveTo}T00:00:00.000Z`,

  //         ...(isUpdate
  //           ? {
  //               modified_loc: new Date(Date.now()).toLocaleString(),
  //               modified_time: audit.timeZone,
  //               modified_off: audit.offset,
  //               Modified_UTCDateTime: audit.utcDateTime,
  //               modified_loc_time: audit.localDateTime,
  //             }
  //           : {
  //               created_loc: new Date(Date.now()).toLocaleString(),
  //               created_time: audit.timeZone,
  //               created_off: audit.offset,
  //               Created_UTCDateTime: audit.utcDateTime,
  //               created_loc_time: audit.localDateTime,
  //             }),
  //       }

  //       //@ts-ignore
  //       console.log(payload, 'jdhbcyh')
  //       const response: any = isUpdate ? await static_service.updateGender(payload as any) : await static_service.createGender(payload)

  //       if (response?.success === true || response?.status === 'Success') {
  //         showAlert('Success', `Gender ${isUpdate ? 'Updated' : 'Created'} Successfully`)
  //         setDialogopen(false)
  //         fetchData()
  //       } else {
  //         showAlert('Fail', response?.message || 'Server Error')
  //       }
  //     },
  //     () => {
  //       showAlert('Fail', 'Location access is required for auditing.')
  //     },
  //   )
  // }
  const handleAction = async (data: any, isUpdate: boolean) => {
    if (data.validationError) {
      showAlert('Fail', data.validationError)
      return
    }

    const now = dayjs()
    const ianaTZ = Intl.DateTimeFormat().resolvedOptions().timeZone
    let audit = {
      location: 'GURUGRAM, HARYANA, INDIA', // Default
      timeZone: ianaTZ,
      offset: now.format('Z'),
      utcDateTime: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
      localDateTime: now.format('YYYY-MM-DD HH:mm:ss'),
    }

    // 2. Helper function to actually hit the API
    const submitPayload = async (finalAudit: typeof audit) => {
      const payload = {
        applicant_id: local_service?.get_staff_id(),
        gendercode: data.gendercode,
        description: data.description,
        countrycode: data.selectedCountry,
        active: data.active,
        effectivefromdate: `${data.effectiveFrom}T00:00:00.000Z`,
        effectivetodate: `${data.effectiveTo}T00:00:00.000Z`,

        ...(isUpdate
          ? {
              modified_loc: new Date().toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                fractionalSecondDigits: 3,
                hour12: false,
              } as any),
              modified_time: finalAudit.timeZone,
              modified_off: finalAudit.offset,
              Modified_UTCDateTime: finalAudit.utcDateTime,
              modified_loc_time: finalAudit.localDateTime,
              modifiedby: local_service?.get_staff_id(),
            }
          : {
              created_loc: new Date().toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                fractionalSecondDigits: 3,
                hour12: false,
              } as any),
              created_time: finalAudit.timeZone,
              created_off: finalAudit.offset,
              Created_UTCDateTime: finalAudit.utcDateTime,
              created_loc_time: finalAudit.localDateTime,
              createdby: local_service?.get_staff_id(),
            }),
      }

      console.log('Sending Payload:', payload)

      const response: any = isUpdate ? await static_service.updateGender(payload as any) : await static_service.createGender(payload)

      if (response?.success === true || response?.status === 'Success' || response?.status === true) {
        showAlert('Success', `Gender ${isUpdate ? 'Updated' : 'Created'} Successfully`)
        setDialogopen(false)
        fetchData()
      } else {
        showAlert('Fail', response?.message || 'Server Error')
      }
    }

    // 3. Try Geolocation, but don't let it block the app
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const liveAudit = await getLiveAuditData(pos.coords.latitude, pos.coords.longitude)
          if (liveAudit) {
            await submitPayload(liveAudit)
          } else {
            await submitPayload(audit) // Use fallback if API fails
          }
        },
        async (_) => {
          console.warn('Location denied, using fallback.')
          await submitPayload(audit) // Use fallback if user denies
        },
        { timeout: 5000 }, // Wait max 5 seconds for location
      )
    } else {
      await submitPayload(audit)
    }
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
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          // color: 'text.primary',
          letterSpacing: '-0.02em',
          display: 'grid',
          placeItems: 'center',
          mb: 5,
          color: '#0061B1',
        }}
      >
        {'Gender Master'.toUpperCase()}
      </Typography>

      <Stack direction="row" justifyContent="flex-end" mb={2}>
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
