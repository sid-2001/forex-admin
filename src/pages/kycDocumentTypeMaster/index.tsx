// pages/KycDocumentTypeMaster.tsx
import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack, Typography, Chip } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import DescriptionIcon from '@mui/icons-material/Description'
import KycDocumentTypeFormDialog from '../../components/kycDocumentTypeFormDialog'
import { KycDocumentTypeService } from '@/services/kycdocumenttype.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import ConfirmModal from '@/components/ConfirmModal'
import dayjs from 'dayjs'
import { getLiveAuditData } from '@/helpers/dynamicLocations'
import { formatTableDate } from '@/helpers/dateformate'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'

// Types
interface KycDocumentTypeData {
  kycDocTypeCode: string
  kycDocTypeDescription: string
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
}

export default function KycDocumentTypeMaster() {
  const [rows, setRows] = useState<KycDocumentTypeData[]>([])
  const [dialogopen, setDialogopen] = useState(false)
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<KycDocumentTypeData | null>(null)
  const [editData, setEditData] = useState<KycDocumentTypeData | null>(null)
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate' | null>(null)

  const local_service = useMemo(() => new LocalStorageService(), [])
  const documentService = useMemo(() => new KycDocumentTypeService(), [])
  const helper = new HelperService()

  const fetchData = useCallback(async () => {
    try {
      const response = await documentService.getAllDocumentTypes()
      setRows(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Error fetching document types:', error)
      showAlert('Fail', 'Failed to fetch document types')
    }
  }, [documentService])

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
        // Update existing
        const payload = {
          kycDocTypeDescription: data.kycDocTypeDescription,
          active: data.active,
          effectiveFromDate: data.effectiveFromDate.includes('T') ? data.effectiveFromDate : `${data.effectiveFromDate}T00:00:00`,
          effectiveToDate: data.effectiveToDate.includes('T') ? data.effectiveToDate : `${data.effectiveToDate}T00:00:00`,
          modifiedBy: local_service?.get_staff_id() || 'admin',
        }

        console.log('Sending Update Payload:', payload)

        const response: any = await documentService.updateDocumentType(editData.kycDocTypeCode, payload)
        console.log(response, '-------------')
        if (response?.status === true || response?.success === true) {
          showAlert('Success', 'Document Type Updated Successfully')
          setDialogopen(false)
          fetchData()
        } else {
          showAlert('Fail', response?.message || 'Server Error')
        }
      } else {
        // Create new
        const payload = {
          kycDocTypeDescription: data.kycDocTypeDescription,
          active: data.active,
          effectiveFromDate: data.effectiveFromDate.includes('T') ? data.effectiveFromDate : `${data.effectiveFromDate}T00:00:00`,
          effectiveToDate: data.effectiveToDate.includes('T') ? data.effectiveToDate : `${data.effectiveToDate}T00:00:00`,
          createdBy: local_service?.get_staff_id() || 'admin',
        }

        console.log('Sending Create Payload:', payload)

        const response: any = await documentService.createDocumentType(payload)
        console.log(response, '-------------created')
        if (response?.status === true || response?.success === true) {
          showAlert('Success', 'Document Type Created Successfully')
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
      //@ts-ignore
      await submitPayload(audit)
    }
  }

  const handleStatusToggle = async () => {
    if (!selectedRow || !statusAction) return

    const newStatus = statusAction === 'activate'

    try {
      const response: any = await documentService.updateStatus(selectedRow.kycDocTypeCode, newStatus, local_service?.get_staff_id() || 'admin')

      if (response?.status === true || response?.success === true) {
        showAlert('Success', `Document Type ${newStatus ? 'Activated' : 'Deactivated'} Successfully`)
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
      field: 'kycDocTypeCode',
      headerName: 'Document Code',
      width: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 600,
            backgroundColor: '#eef4fa',
            color: '#1e5f9e',
          }}
        />
      ),
    },
    {
      field: 'kycDocTypeDescription',
      headerName: 'Description',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <DescriptionIcon sx={{ fontSize: 18, color: '#666' }} />
          <Typography>{params.value}</Typography>
        </Stack>
      ),
    },
    {
      field: 'active',
      headerName: 'Status',
      width: 100,
      headerClassName: 'super-app-theme--header',
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
      renderCell: (params) => (params.value === '9999-12-31T23:59:59' ? '∞' : formatTableDate(params.value)),
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
      renderCell: (params) => formatTableDate(params.value),
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
      <Box sx={{ width: '100%' }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              display: 'grid',

              color: '#0061B1',
            }}
          >
            {'KYC Document Type Master'.toUpperCase()}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setEditData(null)
              setDialogopen(true)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
            sx={{
              backgroundColor: '#0061B1',
              '&:hover': {
                backgroundColor: '#004d8c',
              },
            }}
          >
            Add New Document Type
          </Button>
        </Stack>

        <Box>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row: KycDocumentTypeData) => row.kycDocTypeCode}
            autoHeight
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10, 25, 50]}
            slots={{ toolbar: GridToolbar }}
            sx={{}}
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
        </Box>

        <KycDocumentTypeFormDialog
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
          title={statusAction === 'activate' ? 'Activate Document Type?' : 'Deactivate Document Type?'}
          message={`Are you sure you want to ${statusAction} document type "${selectedRow?.kycDocTypeDescription}"?`}
          //@ts-ignore
          confirmText={statusAction === 'activate' ? 'Activate' : 'Deactivate'}
          confirmColor={statusAction === 'activate' ? 'success' : 'warning'}
        />
      </Box>
    </HasPermission>
  )
}
