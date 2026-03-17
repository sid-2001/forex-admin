// pages/CountryResProductChannelDocRequiredMaster.tsx
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
import ReceiptIcon from '@mui/icons-material/Receipt'
import DevicesIcon from '@mui/icons-material/Devices'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import NumbersIcon from '@mui/icons-material/Numbers'
import { useNavigate } from 'react-router-dom'
import DocRequiredFormDialog from '../../components/docRequiredFormDialog'
import { CountryResProductChannelDocRequiredService } from '@/services/countryResProductChannelDocRequired.service'
import ProductService  from '@/services/product.service'
//@ts-ignore
import { ChannelService } from '@/services/channel.service'
//@ts-ignore
import { KycDocumentService } from '@/services/kycDocument.service'
import { ResidentTypeService } from '@/services/residentType.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState, useRecoilValue } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { countyState } from '@/states/state'
import ConfirmModal from '@/components/ConfirmModal'
import dayjs from 'dayjs'
import { getLiveAuditData } from '@/helpers/dynamicLocations'

// Types
interface DocRequiredData {
  reqDocCode: string
  countryCode: string
  residenceTypeCode: string
  productCode: string
  channelCode: string
  kycDocCode: string
  docRequirementType: string
  bfa: string
  documentUpload: boolean
  documentNumberRequired: boolean
  docSequence: number
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string
  modifiedBy: string | null
}

interface ProductData {
  productCode: string
  productName: string
  active: boolean
}

interface ChannelData {
  channel_code: string
  channel_description: string
  active: boolean
}

interface ResidentTypeData {
  residentTypeCode: string
  residenceCode: string
  countryCode: string
  residentTypeDescription: string
  active: boolean
}

// Requirement type options
const REQUIREMENT_TYPES = [
  { value: 'M', label: 'Mandatory' },
  { value: 'O', label: 'Optional' },
  { value: 'C', label: 'Conditional' },
]

// BFA options
const BFA_OPTIONS = [
  { value: 'B', label: 'Both' },
  { value: 'F', label: 'Frontend Only' },
  { value: 'A', label: 'Backend Only' },
]

export default function CountryResProductChannelDocRequiredMaster() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<DocRequiredData[]>([])
  const [products, setProducts] = useState<ProductData[]>([])
  const [channels, setChannels] = useState<ChannelData[]>([])
  const [residentTypes, setResidentTypes] = useState<ResidentTypeData[]>([])
  const [kycDocuments, setKycDocuments] = useState<any[]>([])
  const [dialogopen, setDialogopen] = useState(false)
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<DocRequiredData | null>(null)
  const [editData, setEditData] = useState<DocRequiredData | null>(null)
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate' | null>(null)
  const [loading, setLoading] = useState(false)

  const countries = useRecoilValue(countyState)
  const local_service = useMemo(() => new LocalStorageService(), [])
  const docRequiredService = useMemo(() => new CountryResProductChannelDocRequiredService(), [])
  const productService = useMemo(() => new ProductService(), [])
  const channelService = useMemo(() => new ChannelService(), [])
  const residentService = useMemo(() => new ResidentTypeService(), [])
  const kycDocumentService = useMemo(() => new KycDocumentService(), [])

  const formatTableDate = (dateString: string) => {
    if (!dateString) return ''
    return dayjs(dateString).format('DD/MM/YYYY')
  }

  const getCountryName = (countryCode: string) => {
    const country = countries.find(c => c.countryCode === countryCode)
    return country ? country.countryName : countryCode
  }

  const getProductName = (productCode: string) => {
    const product = products.find(p => p.productCode === productCode)
    return product ? product.productName : productCode
  }

  const getChannelDescription = (channelCode: string) => {
    const channel = channels.find(c => c.channel_code === channelCode)
    return channel ? channel.channel_description : channelCode
  }

  const getResidentTypeDescription = (code: string) => {
    const resident = residentTypes.find(r => r.residentTypeCode === code)
    return resident ? resident.residentTypeDescription : code
  }

  const getKycDocumentDescription = (code: string) => {
    const doc = kycDocuments.find(d => d.kycDocCode === code)
    return doc ? `${doc.docCode} - ${doc.docDescription}` : code
  }

  const getRequirementTypeLabel = (type: string) => {
    const reqType = REQUIREMENT_TYPES.find(r => r.value === type)
    return reqType ? reqType.label : type
  }

  const getBfaLabel = (bfa: string) => {
    const option = BFA_OPTIONS.find(o => o.value === bfa)
    return option ? option.label : bfa
  }

  // Handle reqDocCode click
  const handleReqDocCodeClick = (reqDocCode: string) => {
    navigate(`/document-requirement-details/${reqDocCode}`)
  }

  // Fetch all master data
  const fetchMasterData = useCallback(async () => {
    try {
      const [productsRes, channelsRes, residentRes, kycDocsRes] = await Promise.all([
        //@ts-ignore
        productService.getActiveProducts(),
        channelService.getActiveChannels(),
        residentService.getAllResidentTypes(),
        kycDocumentService.getAllDocumentTypes()
      ])
      
      setProducts(productsRes)
      setChannels(channelsRes)
      setResidentTypes(Array.isArray(residentRes) ? residentRes : [])
      setKycDocuments(kycDocsRes)
    } catch (error) {
      console.error('Error fetching master data:', error)
    }
  }, [productService, channelService, residentService, kycDocumentService])

  // Fetch document requirements
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await docRequiredService.getAllDocRequired()
      // Add serial numbers to rows
      const rowsWithSerial = (Array.isArray(response) ? response : []).map((row, index) => ({
        ...row,
        serialNo: index + 1
      }))
      setRows(rowsWithSerial)
    } catch (error) {
      console.error('Error fetching document requirements:', error)
      showAlert('Fail', 'Failed to fetch document requirements')
    } finally {
      setLoading(false)
    }
  }, [docRequiredService])

  useEffect(() => {
    fetchMasterData()
    fetchData()
  }, [fetchMasterData, fetchData])

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
      finalAudit: typeof audit) => {
      if (isUpdate && editData) {
        // Update existing
        const payload = {
          reqDocCode: editData.reqDocCode,
          countryCode: data.countryCode,
          residenceTypeCode: data.residenceTypeCode,
          productCode: data.productCode,
          channelCode: data.channelCode,
          kycDocCode: data.kycDocCode,
          docRequirementType: data.docRequirementType,
          docSequence: parseInt(data.docSequence),
          bfa: data.bfa,
          documentUpload: data.documentUpload,
          documentNumberRequired: data.documentNumberRequired,
          active: data.active,
         effectiveFromDate: dayjs(data.effectiveFromDate).format('YYYY-MM-DD HH:mm:ss'),
effectiveToDate: dayjs(data.effectiveToDate).format('YYYY-MM-DD HH:mm:ss'),
          modifiedBy: data.modifiedBy || local_service?.get_staff_id() || 'ADMIN',
        }

        console.log('Sending Update Payload:', payload)

        const response: any = await docRequiredService.updateDocRequired(
          editData.reqDocCode,
          payload
        )

        if (response?.status === true || response?.success === true) {
          showAlert('Success', 'Document Requirement Updated Successfully')
          setDialogopen(false)
          fetchData()
        } else {
          showAlert('Fail', response?.message || 'Server Error')
        }
      } else {
        // Create new
        const payload = {
          countryCode: data.countryCode,
          residenceTypeCode: data.residenceTypeCode,
          productCode: data.productCode,
          channelCode: data.channelCode,
          kycDocCode: data.kycDocCode,
          docRequirementType: data.docRequirementType,
          docSequence: parseInt(data.docSequence),
          bfa: data.bfa,
          documentUpload: data.documentUpload,
          documentNumberRequired: data.documentNumberRequired,
          active: data.active,
       effectiveFromDate: dayjs(data.effectiveFromDate).format('YYYY-MM-DD HH:mm:ss'),
effectiveToDate: dayjs(data.effectiveToDate).format('YYYY-MM-DD HH:mm:ss'),
          createdBy: data.createdBy || local_service?.get_staff_id() || 'ADMIN',
        }

        console.log('Sending Create Payload:', payload)

        const response: any = await docRequiredService.createDocRequired(payload)

        if (response?.status === true || response?.success === true) {
          showAlert('Success', 'Document Requirement Created Successfully')
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
      const response: any = await docRequiredService.updateStatus(
        selectedRow.reqDocCode,
        newStatus,
        local_service?.get_staff_id() || 'ADMIN'
      )
      
      if (response?.status === true || response?.success === true) {
        showAlert('Success', `Document Requirement ${newStatus ? 'Activated' : 'Deactivated'} Successfully`)
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
      field: 'serialNo', 
      headerName: 'S. No', 
      width: 70,
      headerClassName: 'super-app-theme--header',
    },
    { 
      field: 'reqDocCode', 
      headerName: 'Req Code', 
      width: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <span
          style={{
            textDecoration: 'underline',
            cursor: 'pointer',
            color: '#0061B1',
            fontWeight: 600,
          }}
          onClick={() => handleReqDocCodeClick(params.value)}
        >
          {params.value}
        </span>
      )
    },
    { 
      field: 'countryCode', 
      headerName: 'Country', 
      width: 100,
      headerClassName: 'super-app-theme--header',
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
      field: 'residenceTypeCode', 
      headerName: 'Residence', 
      width: 100,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Tooltip title={getResidentTypeDescription(params.value)}>
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
      field: 'productCode', 
      headerName: 'Product', 
      width: 100,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Tooltip title={getProductName(params.value)}>
          <Chip 
            label={params.value} 
            size="small"
            icon={<ReceiptIcon />}
            color="primary"
            variant="outlined"
          />
        </Tooltip>
      )
    },
    { 
      field: 'channelCode', 
      headerName: 'Channel', 
      width: 100,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Tooltip title={getChannelDescription(params.value)}>
          <Chip 
            label={params.value} 
            size="small"
            icon={<DevicesIcon />}
            color="secondary"
            variant="outlined"
          />
        </Tooltip>
      )
    },
    { 
      field: 'kycDocCode', 
      headerName: 'KYC Doc', 
      width: 100,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Tooltip title={getKycDocumentDescription(params.value)}>
          <Chip 
            label={params.value} 
            size="small"
            icon={<DescriptionIcon />}
            color="info"
            variant="outlined"
          />
        </Tooltip>
      )
    },
    { 
      field: 'docRequirementType', 
      headerName: 'Req Type', 
      width: 90,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const color = params.value === 'M' ? 'error' : params.value === 'O' ? 'success' : 'warning'
        return (
          <Chip 
            label={getRequirementTypeLabel(params.value)}
            size="small"
            color={color}
            variant="outlined"
          />
        )
      }
    },
    { 
      field: 'bfa', 
      headerName: 'BFA', 
      width: 70,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Tooltip title={getBfaLabel(params.value)}>
          <Chip 
            label={params.value} 
            size="small"
            icon={<SwapHorizIcon />}
            variant="outlined"
          />
        </Tooltip>
      )
    },
    { 
      field: 'docSequence', 
      headerName: 'Seq', 
      width: 60,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small"
          icon={<NumbersIcon />}
          variant="outlined"
        />
      )
    },
    { 
      field: 'documentUpload', 
      headerName: 'Upload', 
      width: 80,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        params.value ? 
          <CheckCircleIcon sx={{ color: '#4caf50' }} /> : 
          <CancelIcon sx={{ color: '#f44336' }} />
      )
    },
    { 
      field: 'documentNumberRequired', 
      headerName: 'Doc No', 
      width: 80,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        params.value ? 
          <CheckCircleIcon sx={{ color: '#4caf50' }} /> : 
          <CancelIcon sx={{ color: '#f44336' }} />
      )
    },
    {
      field: 'active',
      headerName: 'Status',
      width: 90,
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
            width: '70px'
          }}
        />
      ),
    },
    {
      field: 'effectiveFromDate',
      headerName: 'From',
      width: 90,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.value),
    },
    {
      field: 'effectiveToDate',
      headerName: 'To',
      width: 90,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => params.value === '2030-12-31T23:59:59' ? '2030' : formatTableDate(params.value),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
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
    
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: '#0061B1',
          }}
        >
          Country Resident Product Channel Document Required
        </Typography>
       

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
          Add Document Requirement
        </Button>
      </Stack>

      <Paper elevation={2} sx={{ p: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row: DocRequiredData) => row.reqDocCode}
          autoHeight
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25, 50]}
          sx={{
            width: '100%',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#005099',
              color: 'white',
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
                fontSize: '14px',
              },
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#005099',
              color: 'white',
              '&:focus': {
                outline: 'none',
              },
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
              fontSize: '14px',
            },
            '& .MuiDataGrid-cell': {
              fontSize: '13px',
              borderBottom: '1px solid #e0e0e0',
            },
            '& .MuiDataGrid-row:nth-of-type(even)': {
              backgroundColor: '#f0f8ff',
            },
            '& .MuiDataGrid-row:nth-of-type(odd)': {
              backgroundColor: '#ffffff',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#e3f2fd',
            },
            '& .super-app-theme--header': {
              fontSize: '14px',
              fontWeight: 'bold',
            },
            '& .MuiTablePagination-root': {
              backgroundColor: '#f5f5f5',
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

      <DocRequiredFormDialog
        open={dialogopen}
        onClose={() => setDialogopen(false)}
        editData={editData}
        onSubmit={(data: any) => handleAction(data, !!editData)}
        countries={countries}
        residentTypes={residentTypes.filter(r => r.active)}
        products={products}
        channels={channels}
        kycDocuments={kycDocuments}
        requirementTypes={REQUIREMENT_TYPES}
        bfaOptions={BFA_OPTIONS}
      />

      <ConfirmModal
        open={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false)
          setSelectedRow(null)
          setStatusAction(null)
        }}
        onConfirm={handleStatusToggle}
        title={statusAction === 'activate' ? 'Activate Requirement?' : 'Deactivate Requirement?'}
        message={`Are you sure you want to ${statusAction} document requirement "${selectedRow?.reqDocCode}"?`}
        //@ts-ignore
        confirmText={statusAction === 'activate' ? 'Activate' : 'Deactivate'}
        confirmColor={statusAction === 'activate' ? 'success' : 'warning'}
      />
    </Box>
  )
}