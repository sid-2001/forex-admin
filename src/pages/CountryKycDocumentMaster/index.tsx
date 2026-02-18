// pages/CountryKycDocumentMaster.tsx
import { useEffect, useState, useMemo, useCallback } from 'react'
import { 
  Box, 
  Button, 
  IconButton, 
  Stack, 
  Typography, 
  Chip, 
  Paper,
  Tooltip
} from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PublicIcon from '@mui/icons-material/Public'
import AddIcon from '@mui/icons-material/Add'
import DescriptionIcon from '@mui/icons-material/Description'
import VerifiedIcon from '@mui/icons-material/Verified'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CountryKycDocumentFormDialog from '../../components/countryKycDocDialog'
import  CountryKycDocumentService  from '@/services/country-kyc-doc.service'
import { KycDocumentTypeService } from '@/services/kycdocumenttype.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState, useRecoilValue } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { countyState } from '@/states/state'
import ConfirmModal from '@/components/ConfirmModal'
import dayjs from 'dayjs'
import { getLiveAuditData } from '@/helpers/dynamicLocations'

// Types
interface CountryKycDocumentData {
  kycDocCode: string
  countryCode: string
  docTypeCode: string
  docTypeDescription?: string
  docCode: string
  docDescription: string
  verificationMode: string
  vendorCode: string | null
  appLimit: number
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
}

interface KycDocumentType {
  kycDocTypeCode: string
  kycDocTypeDescription: string
  active: boolean
}

// Verification mode options
const VERIFICATION_MODES = [
  { value: 'A', label: 'Automatic' },
  { value: 'M', label: 'Manual' },
  { value: 'H', label: 'Hybrid' },
]

export default function CountryKycDocumentMaster() {
  const [rows, setRows] = useState<CountryKycDocumentData[]>([])
  const [documentTypes, setDocumentTypes] = useState<KycDocumentType[]>([])
  const [dialogopen, setDialogopen] = useState(false)
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<CountryKycDocumentData | null>(null)
  const [editData, setEditData] = useState<CountryKycDocumentData | null>(null)
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate' | null>(null)
  const [loading, setLoading] = useState(false)

  const countries = useRecoilValue(countyState)
  const local_service = useMemo(() => new LocalStorageService(), [])
  const documentService = useMemo(() => new CountryKycDocumentService(), [])
  const docTypeService = useMemo(() => new KycDocumentTypeService(), [])

  const formatTableDate = (dateString: string) => {
    if (!dateString) return ''
    return dayjs(dateString).format('DD/MM/YYYY')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getCountryName = (countryCode: string) => {
    const country = countries.find(c => c.countryCode === countryCode)
    return country ? country.countryName : countryCode
  }

  const getVerificationModeLabel = (mode: string) => {
    const modeObj = VERIFICATION_MODES.find(m => m.value === mode)
    return modeObj ? modeObj.label : mode
  }

  const getDocumentTypeDescription = (docTypeCode: string) => {
    const docType = documentTypes.find(d => d.kycDocTypeCode === docTypeCode)
    return docType ? docType.kycDocTypeDescription : docTypeCode
  }

  // Fetch KYC Document Types
  const fetchDocumentTypes = useCallback(async () => {
    try {
      const response = await docTypeService.getAllDocumentTypes()
      const activeTypes = response.filter((type: KycDocumentType) => type.active)
      setDocumentTypes(activeTypes)
    } catch (error) {
      console.error('Error fetching document types:', error)
    }
  }, [docTypeService])

  // Fetch Country KYC Documents
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await documentService.getDocList()
      setRows(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Error fetching country KYC documents:', error)
      showAlert('Fail', 'Failed to fetch country KYC documents')
    } finally {
      setLoading(false)
    }
  }, [documentService])

  useEffect(() => {
    fetchDocumentTypes()
    fetchData()
  }, [fetchDocumentTypes, fetchData])

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

    const submitPayload = async (
        
        //@ts-ignore
        finalAudit: any) => {
      if (isUpdate && editData) {
        // Update existing
        const payload = {
          countryCode: data.countryCode,
          docTypeCode: data.docTypeCode,
          docCode: data.docCode,
          docDescription: data.docDescription,
          verificationMode: data.verificationMode,
          verificationPartnerCode: data.verificationPartnerCode,
          appLimit: parseFloat(data.appLimit),
          active: data.active,
          effectiveFromDate: data.effectiveFromDate,
          effectiveToDate: data.effectiveToDate,
          modifiedBy: data.modifiedBy || local_service?.get_staff_id() || 'ADMIN',
        }

        console.log('Sending Update Payload:', payload)

        const response: any = await documentService.updateDoc(
          editData.kycDocCode,
          payload
        )

        if (response?.status === true || response?.success === true) {
          showAlert('Success', 'Country KYC Document Updated Successfully')
          setDialogopen(false)
          fetchData()
        } else {
          showAlert('Fail', response?.message || 'Server Error')
        }
      } else {
        // Create new
        const payload = {
          countryCode: data.countryCode,
          docTypeCode: data.docTypeCode,
          docCode: data.docCode,
          docDescription: data.docDescription,
          verificationMode: data.verificationMode,
          verificationPartnerCode: data.verificationPartnerCode,
          appLimit: parseFloat(data.appLimit),
          active: data.active,
          effectiveFromDate: data.effectiveFromDate,
          effectiveToDate: data.effectiveToDate,
          createdBy: data.createdBy || local_service?.get_staff_id() || 'ADMIN',
        }

        console.log('Sending Create Payload:', payload)

        const response: any = await documentService.createDoc(payload)

        if (response?.status === true || response?.success === true) {
          showAlert('Success', 'Country KYC Document Created Successfully')
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
            await submitPayload(liveAudit)
          } else {
            await submitPayload(audit)
          }
        },
        async (_) => {
          console.warn('Location denied, using fallback.')
          await submitPayload(audit)
        },
        { timeout: 5000 },
      )
    } else {
      await submitPayload(audit)
    }
  }

  const handleStatusToggle = async () => {
    if (!selectedRow || !statusAction) return

    const newStatus = statusAction === 'activate'
    
    try {
      const response: any = await documentService.updateDoc(
        selectedRow.kycDocCode,
        newStatus,
        //@ts-ignore
        local_service?.get_staff_id() || 'ADMIN'
      )
      
      if (response?.status === true || response?.success === true) {
        showAlert('Success', `Country KYC Document ${newStatus ? 'Activated' : 'Deactivated'} Successfully`)
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
      field: 'kycDocCode', 
      headerName: 'Document Code', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small"
          sx={{ 
            fontFamily: 'monospace',
            fontWeight: 600,
            backgroundColor: '#eef4fa',
            color: '#0061B1'
          }}
        />
      )
    },
    { 
      field: 'countryCode', 
      headerName: 'Country', 
      width: 100,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <PublicIcon sx={{ fontSize: 16, color: '#666' }} />
          <Tooltip title={getCountryName(params.value)}>
            <Typography>{params.value}</Typography>
          </Tooltip>
        </Stack>
      )
    },
    { 
      field: 'docTypeCode', 
      headerName: 'Document Type', 
      width: 120,
      renderCell: (params) => (
        <Tooltip title={getDocumentTypeDescription(params.value)}>
          <Chip 
            label={params.value} 
            size="small"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Tooltip>
      )
    },
    { 
      field: 'docCode', 
      headerName: 'Doc Code', 
      width: 100,
      renderCell: (params) => (
        <Typography fontWeight={600}>{params.value}</Typography>
      )
    },
    { 
      field: 'docDescription', 
      headerName: 'Description', 
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <DescriptionIcon sx={{ fontSize: 16, color: '#666' }} />
          <Typography>{params.value}</Typography>
        </Stack>
      )
    },
    { 
      field: 'verificationMode', 
      headerName: 'Verification', 
      width: 100,
      renderCell: (params) => {
        const mode = VERIFICATION_MODES.find(m => m.value === params.value)
        return (
          <Chip 
            label={mode?.label || params.value}
            size="small"
            icon={<VerifiedIcon />}
            color={params.value === 'A' ? 'success' : params.value === 'M' ? 'warning' : 'info'}
            variant="outlined"
          />
        )
      }
    },
    { 
      field: 'appLimit', 
      headerName: 'App Limit', 
      width: 110,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <AttachMoneyIcon sx={{ fontSize: 16, color: '#4caf50' }} />
          <Typography fontWeight={600}>{formatCurrency(params.value)}</Typography>
        </Stack>
      )
    },
    {
      field: 'active',
      headerName: 'Status',
      width: 90,
      renderCell: (params) => (
        <Chip
          icon={params.value ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <CancelIcon sx={{ fontSize: 16 }} />}
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            backgroundColor: params.value ? '#e2f0e6' : '#ffece5',
            color: params.value ? '#0f6a3b' : '#b13e2d',
            fontWeight: 600,
            width: '75px'
          }}
        />
      ),
    },
    {
      field: 'effectiveFromDate',
      headerName: 'From',
      width: 90,
      renderCell: (params) => formatTableDate(params.value),
    },
    {
      field: 'effectiveToDate',
      headerName: 'To',
      width: 90,
      renderCell: (params) => params.value === '2030-12-31T23:59:59' ? '2030' : formatTableDate(params.value),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
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
          >
            <EditIcon fontSize="small" />
          </IconButton>
          
          {params.row.active ? (
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
          )}
        </Stack>
      ),
    },
  ]

  return (
    <Box p={3}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: '#f5f5f5' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: '#0061B1',
          }}
        >
          Country KYC Document Master
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Configure country-specific KYC documents with verification modes and limits
        </Typography>
      </Paper>

      <Stack direction="row" justifyContent="flex-end" mb={2}>
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
            }
          }}
        >
          Add Country KYC Document
        </Button>
      </Stack>

      <Paper elevation={2} sx={{ p: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row: CountryKycDocumentData) => row.kycDocCode}
          autoHeight
          loading={loading}
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
          }}
        />
      </Paper>

      <CountryKycDocumentFormDialog
        open={dialogopen}
        onClose={() => setDialogopen(false)}
        editData={editData}
        onSubmit={(data: any) => handleAction(data, !!editData)}
        countries={countries}
        documentTypes={documentTypes}
        verificationModes={VERIFICATION_MODES}
      />

      <ConfirmModal
        open={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false)
          setSelectedRow(null)
          setStatusAction(null)
        }}
        onConfirm={handleStatusToggle}
        title={statusAction === 'activate' ? 'Activate Document?' : 'Deactivate Document?'}
        message={`Are you sure you want to ${statusAction} document "${selectedRow?.docCode} - ${selectedRow?.docDescription}"?`}
        //@ts-ignore
        confirmText={statusAction === 'activate' ? 'Activate' : 'Deactivate'}
        confirmColor={statusAction === 'activate' ? 'success' : 'warning'}
      />
    </Box>
  )
}