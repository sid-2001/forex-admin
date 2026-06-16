import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import KycLimitTypeFormDialog from '../../components/kycLimitTypeFormDialog'

import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import ConfirmModal from '@/components/ConfirmModal'
import dayjs from 'dayjs'
import { getLiveAuditData } from '@/helpers/dynamicLocations'
import { Chip } from '@mui/material'
import { KycLimitTypeService } from '@/services/kycLimitType.service'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'

// Types
interface KycLimitTypeData {
  kycLimitTypeCode: string
  limitCode: string
  limitDescription: string
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string
  modifiedBy: string
  createdLocalDateTime: string
  createdTimezone: string
  createdOffset: string
  modifiedLocalDateTime: string
  modifiedTimezone: string
  modifiedOffset: string
  createdUtcDatetime: string
  modifiedUtcDatetime: string
}

export default function KycLimitTypeMaster() {
  const [rows, setRows] = useState<KycLimitTypeData[]>([])
  const [dialogopen, setDialogopen] = useState(false)
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<KycLimitTypeData | null>(null)
  const [editData, setEditData] = useState<KycLimitTypeData | null>(null)
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate' | null>(null)

  const local_service = useMemo(() => new LocalStorageService(), [])
  const kycLimitTypeService = useMemo(() => new KycLimitTypeService(), [])
  const helper = new HelperService()

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

  const formatDateTime = (dateString: string) => {
    if (!dateString) return ''
    return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
  }

  const fetchData = useCallback(async () => {
    try {
      const response = await kycLimitTypeService.getAllLimitTypes()
      setRows(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Error fetching limit types:', error)
      showAlert('Fail', 'Failed to fetch limit types')
    }
  }, [kycLimitTypeService])

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
      const formatForBackend = (dateVal: string) => {
        if (!dateVal) return ''
        const dateOnly = dateVal.split('T')[0]
        return `${dateOnly}T00:00:00Z`
      }

      if (isUpdate && editData) {
        const payload = {
          limitCode: data.limitCode,
          limitDescription: data.limitDescription,
          active: data.active,
          effectiveFromDate: formatForBackend(data.effectiveFromDate),
          effectiveToDate: formatForBackend(data.effectiveToDate),
          modifiedBy: local_service?.get_staff_id() || 'ADMIN',
        }

        const response: any = await kycLimitTypeService.updateLimitType(editData.kycLimitTypeCode, payload)

        if (response?.status === true || response?.success === true) {
          showAlert('Success', 'Limit Type Updated Successfully')
          setDialogopen(false)
          fetchData()
        } else {
          showAlert('Fail', response?.message || 'Server Error')
        }
      } else {
        const payload = {
          limitCode: data.limitCode,
          limitDescription: data.limitDescription,
          active: data.active,
          effectiveFromDate: formatForBackend(data.effectiveFromDate),
          effectiveToDate: formatForBackend(data.effectiveToDate),
          createdBy: local_service?.get_staff_id() || 'ADMIN',
        }

        const response: any = await kycLimitTypeService.createLimitType(payload)

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
          const liveAudit = await getLiveAuditData(pos.coords.latitude, pos.coords.longitude)
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
      //@ts-ignore
      await submitPayload(audit)
    }
  }

  const handleStatusToggle = async () => {
    if (!selectedRow || !statusAction) return

    const newStatus = statusAction === 'activate'

    const payload = {
      id: selectedRow.kycLimitTypeCode,
      active: newStatus,
      modifiedBy: local_service?.get_staff_id() || 'ADMIN',
    }

    try {
      const response: any = await kycLimitTypeService.updateStatus(payload)

      if (response?.status === true || response?.success === true) {
        showAlert('Success', `Limit Type ${newStatus ? 'Activated' : 'Deactivated'} Successfully`)
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

  const handleDelete = async () => {
    if (!selectedRow) return

    // Using status update for deactivation
    const payload = {
      id: selectedRow.kycLimitTypeCode,
      active: false,
      modifiedBy: local_service?.get_staff_id() || 'ADMIN',
    }

    try {
      const response: any = await kycLimitTypeService.updateStatus(payload)

      if (response?.status === true || response?.success === true) {
        showAlert('Success', 'Limit Type Deactivated Successfully')
        setDeleteModalOpen(false)
        setSelectedRow(null)
        fetchData()
      } else {
        showAlert('Fail', response?.message || 'Server Error')
      }
    } catch (error) {
      showAlert('Fail', 'Failed to deactivate limit type')
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'kycLimitTypeCode',
      headerName: 'Limit Type Code',
      width: 130,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => params.value,
    },
    {
      field: 'limitCode',
      headerName: 'Limit Code',
      width: 100,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => params.value,
    },
    {
      field: 'limitDescription',
      headerName: 'Description',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'active',
      headerName: 'Active',
      width: 100,
      renderCell: (params) => (params.value ? 'Yes' : 'No'),
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'effectiveFromDate',
      headerName: 'Effective From',
      width: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.value),
    },
    {
      field: 'effectiveToDate',
      headerName: 'Effective To',
      width: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (params.value === '9999-12-31T00000z' ? '∞' : formatTableDate(params.value)),
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      width: 120,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'createdLocalDateTime',
      headerName: 'Created At',
      width: 150,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatDateTime(params.value),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      headerClassName: 'super-app-theme--header',
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

          {/* {params.row.active ? (
            <IconButton
              onClick={() => {
                setSelectedRow(params.row)
                setStatusAction('deactivate')
                setStatusModalOpen(true)
              }}
              color="warning"
              size="small"
              title="Deactivate"
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => {
                setSelectedRow(params.row)
                setStatusAction('activate')
                setStatusModalOpen(true)
              }}
              color="success"
              size="small"
              title="Activate"
            >
              <CheckCircleIcon fontSize="small" />
            </IconButton>
          )} */}
        </Stack>
      ),
    },
  ]

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
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
            {'KYC Limit Type Master'.toUpperCase()}
          </Typography>
          <Button
            variant="contained"
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
            Add
          </Button>
        </Stack>

        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row: KycLimitTypeData) => row.kycLimitTypeCode}
          autoHeight
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          // slotProps={{ toolbar: { showQuickFilter: true } }}
          // pageSizeOptions={[5, 10, 25, 50]}
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f9f9f9',
            },
          }}
          // initialState={{
          //   pagination: {
          //     paginationModel: {
          //       pageSize: 10,
          //     },
          //   },
          //   sorting: {
          //     sortModel: [{ field: 'createdLocalDateTime', sort: 'desc' }],
          //   },
          // }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
        />

        <KycLimitTypeFormDialog
          open={dialogopen}
          onClose={() => setDialogopen(false)}
          editData={editData}
          onSubmit={(data: any) => handleAction(data, !!editData)}
        />

        {/* Status Change Confirmation Modal */}
        <ConfirmModal
          open={statusModalOpen}
          onClose={() => {
            setStatusModalOpen(false)
            setSelectedRow(null)
            setStatusAction(null)
          }}
          onConfirm={handleStatusToggle}
          title={statusAction === 'activate' ? 'Activate Limit Type?' : 'Deactivate Limit Type?'}
          message={`Are you sure you want to ${statusAction} limit type "${selectedRow?.kycLimitTypeCode}"?`}
          //@ts-ignore
          confirmText={statusAction === 'activate' ? 'Activate' : 'Deactivate'}
          confirmColor={statusAction === 'activate' ? 'success' : 'warning'}
        />

        {/* Delete/Deactivate Modal */}
        <ConfirmModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Deactivate Limit Type?"
          message={`Are you sure you want to deactivate limit type "${selectedRow?.kycLimitTypeCode}"?`}
          //@ts-ignore
          confirmText="Deactivate"
          confirmColor="error"
        />
      </Box>
    </HasPermission>
  )
}
