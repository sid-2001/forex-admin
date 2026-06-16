// pages/ResidentTypeMaster.tsx
import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack, Typography, Chip, Paper } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PublicIcon from '@mui/icons-material/Public'
import AddIcon from '@mui/icons-material/Add'
import ResidentTypeFormDialog from '../../components/residenttypeformDialog'
import { ResidentTypeService } from '@/services/residentType.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState, useRecoilValue } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { countyState } from '@/states/state'
import ConfirmModal from '@/components/ConfirmModal'
import dayjs from 'dayjs'
import { getLiveAuditData } from '@/helpers/dynamicLocations'
import { formatTableDate } from '@/helpers/dateformate'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'

// Types
interface ResidentTypeData {
  residentTypeCode: string
  residenceCode: string
  countryCode: string
  residentTypeDescription: string
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string
  modifiedBy: string | null
  createdLocalDateTime: string
  createdTimeZone: string
  createdOffset: string
  modifiedLocalDateTime: string | null
  modifiedTimeZone: string | null
  modifiedOffset: string | null
  createdUtcDateTime: string
  modifiedUtcDateTime: string | null
  effectiveDateValid: boolean
}

export default function ResidentTypeMaster() {
  const [rows, setRows] = useState<ResidentTypeData[]>([])
  const [dialogopen, setDialogopen] = useState(false)
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<ResidentTypeData | null>(null)
  const [editData, setEditData] = useState<ResidentTypeData | null>(null)
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate' | null>(null)

  const countries = useRecoilValue(countyState)
  const local_service = useMemo(() => new LocalStorageService(), [])
  const residentService = useMemo(() => new ResidentTypeService(), [])
  const helper = new HelperService()

  const getCountryName = (countryCode: string) => {
    const country = countries.find((c) => c.countryCode === countryCode)
    return country ? country.countryName : countryCode
  }

  const fetchData = useCallback(async () => {
    try {
      const response = await residentService.getAllResidentTypes()
      setRows(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Error fetching resident types:', error)
      showAlert('Fail', 'Failed to fetch resident types')
    }
  }, [residentService])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const showAlert = (alertType: 'Success' | 'Fail', alertText: string) => {
    settype(alertType)
    setText(alertText)
    setOpen(true)
  }

  const handleAction = async (data: any, isUpdate: boolean) => {
    if (data.validationError) {
      showAlert('Fail', data.validationError)
      return
    }

    const now = dayjs()
    const ianaTZ = Intl.DateTimeFormat().resolvedOptions().timeZone
    let audit = {
      location: 'GURUGRAM, HARYANA, INDIA',
      timeZone: ianaTZ,
      offset: now.format('Z'),
      utcDateTime: dayjs.utc().format('YYYY-MM-DD HH:mm:ss.SSS'),
      localDateTime: now.format('YYYY-MM-DD HH:mm:ss.SSS'),
    }

    const submitPayload = async () => {
      if (isUpdate && editData) {
        const payload = {
          // residentTypeCode: editData.residentTypeCode,
          residenceCode: data.residenceCode,
          // countryCode: data.countryCode,
          residentTypeDescription: data.residentTypeDescription,
          active: data.active,
          effectiveFromDate: data.effectiveFromDate,
          effectiveToDate: data.effectiveToDate,
          modifiedBy: data.modifiedBy || local_service?.get_staff_id() || 'admin',
        }

        const response: any = await residentService.updateResidentType(
          editData.residentTypeCode,
          //@ts-ignore
          payload,
        )

        if (response?.status === true || response?.success === true) {
          showAlert('Success', response?.message)
          setDialogopen(false)
          fetchData()
        } else {
          showAlert('Fail', response?.message || 'Server Error')
        }
      } else {
        const payload = {
          residenceCode: data.residenceCode,
          countryCode: data.countryCode,
          residentTypeDescription: data.residentTypeDescription,
          active: data.active,
          effectiveFromDate: data.effectiveFromDate,
          effectiveToDate: data.effectiveToDate,
          createdBy: data.createdBy || local_service?.get_staff_id() || 'admin',
        }

        const response: any = await residentService.createResidentType(payload)

        if (response?.status === true || response?.success === true) {
          showAlert('Success', response?.message)
          setDialogopen(false)
          fetchData()
        } else {
          showAlert('Fail', response?.message || 'Server Error')
        }
      }
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const liveAudit: any = await getLiveAuditData(pos.coords.latitude, pos.coords.longitude)
          if (liveAudit) {
            //@ts-ignore
            await submitPayload(liveAudit)
          } else {
            //@ts-ignore
            await submitPayload(audit)
          }
        },
        async (_) => {
          console.warn('Location denied, using fallback.')
          //@ts-ignore
          await submitPayload(audit)
        },
        { timeout: 5000 },
      )
    } else {
      //@ts-i
      await submitPayload(
        //@ts-ignore
        audit,
      )
    }
  }

  const handleStatusToggle = async () => {
    if (!selectedRow || !statusAction) return

    const newStatus = statusAction === 'activate'

    try {
      const response: any = await residentService.updateStatus(selectedRow.residentTypeCode, newStatus, local_service?.get_staff_id() || 'admin')

      if (response?.status === true || response?.success === true) {
        showAlert('Success', `Resident Type ${newStatus ? 'Activated' : 'Deactivated'} Successfully`)
        setStatusModalOpen(false)
        setSelectedRow(null)
        setStatusAction(null)
        fetchData()
      } else {
        showAlert('Fail', response?.message || 'Server Error')
      }
    } catch (error) {
      showAlert('Fail', 'Failed to update status')
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'residentTypeCode',
      headerName: 'Type Code',
      width: 130,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 600,
            backgroundColor: '#eef4fa',
            color: '#0061B1',
          }}
        />
      ),
    },
    {
      field: 'residenceCode',
      headerName: 'Residence',
      width: 100,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        return <Typography>{params.value}</Typography>
      },
    },
    {
      field: 'countryCode',
      headerName: 'Country',
      width: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <PublicIcon sx={{ fontSize: 16, color: '#666' }} />
          <Typography>{getCountryName(params.value)}</Typography>
        </Stack>
      ),
    },
    {
      field: 'residentTypeDescription',
      headerName: 'Description',
      headerClassName: 'super-app-theme--header',
      flex: 1,
    },
    {
      field: 'active',
      headerName: 'Status',
      headerClassName: 'super-app-theme--header',
      width: 100,
      renderCell: (params) => (
        <Chip
          icon={params.value ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <CancelIcon sx={{ fontSize: 16 }} />}
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            backgroundColor: params.value ? '#e2f0e6' : '#ffece5',
            color: params.value ? '#0f6a3b' : '#b13e2d',
            fontWeight: 600,
            width: '80px',
          }}
        />
      ),
    },
    {
      field: 'effectiveFromDate',
      headerName: 'From',
      headerClassName: 'super-app-theme--header',
      width: 100,
      renderCell: (params) => formatTableDate(params.value),
    },
    {
      field: 'effectiveToDate',
      headerName: 'To',
      headerClassName: 'super-app-theme--header',
      width: 100,
      renderCell: (params) => (params.value === '9999-12-31T23:59:59' ? '∞' : formatTableDate(params.value)),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      headerClassName: 'super-app-theme--header',
      width: 120,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            onClick={() => {
              setEditData(params.row)
              setDialogopen(true)
            }}
            color="primary"
            size="small"
            title="Edit"
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
          >
            <EditIcon fontSize="small" />
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
            variant="h5"
            sx={{
              fontWeight: 800,
              color: '#0061B1',
            }}
          >
            Resident Type Master
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditData(null)
              setDialogopen(true)
            }}
            sx={{
              backgroundColor: '#0061B1',
              '&:hover': {
                backgroundColor: '#004d8c',
              },
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
          >
            Add Resident Type
          </Button>
        </Stack>

        <Paper elevation={2} sx={{ p: 2 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row: ResidentTypeData) => row.residentTypeCode}
            autoHeight
            slots={{ toolbar: GridToolbar }}
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10, 25, 50]}
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
              },
            }}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
              sorting: {
                sortModel: [{ field: 'createdLocalDateTime', sort: 'desc' }],
              },
            }}
          />
        </Paper>

        <ResidentTypeFormDialog
          open={dialogopen}
          onClose={() => setDialogopen(false)}
          editData={editData}
          onSubmit={(data: any) => handleAction(data, !!editData)}
        />

        <ConfirmModal
          open={statusModalOpen}
          onClose={() => {
            setStatusModalOpen(false)
            setSelectedRow(null)
            setStatusAction(null)
          }}
          onConfirm={handleStatusToggle}
          title={statusAction === 'activate' ? 'Activate Resident Type?' : 'Deactivate Resident Type?'}
          message={`Are you sure you want to ${statusAction} resident type "${selectedRow?.residentTypeCode}"?`}
          //@ts-ignore
          confirmText={statusAction === 'activate' ? 'Activate' : 'Deactivate'}
          confirmColor={statusAction === 'activate' ? 'success' : 'warning'}
        />
      </Box>
    </HasPermission>
  )
}
