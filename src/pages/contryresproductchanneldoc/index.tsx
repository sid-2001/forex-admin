// pages/CountryResProductChannelDocRequiredMaster.tsx
import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack, Typography, Chip, Paper, Tooltip } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PublicIcon from '@mui/icons-material/Public'
import AddIcon from '@mui/icons-material/Add'
import DescriptionIcon from '@mui/icons-material/Description'
import ReceiptIcon from '@mui/icons-material/Receipt'
import DevicesIcon from '@mui/icons-material/Devices'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import NumbersIcon from '@mui/icons-material/Numbers'
import DocRequiredFormDialog from '../../components/docRequiredFormDialog'
import { CountryResProductChannelDocRequiredService } from '@/services/countryResProductChannelDocRequired.service'
import ProductService from '@/services/product.service'
import ChannelService from '@/services/channel.servive'
import { KycDocumentTypeService } from '@/services/kycdocumenttype.service'
// import { KycDocumentTypeService } from '@/services/kycdocumenttype.service'
import { ResidentTypeService } from '@/services/residentType.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState, useRecoilValue } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { countyState } from '@/states/state'
import ConfirmModal from '@/components/ConfirmModal'
import dayjs from 'dayjs'
import { getLiveAuditData } from '@/helpers/dynamicLocations'
import { formatTableDate } from '@/helpers/dateformate'
import { CountryKycDocumentService } from '@/services/countryKycDocument.service'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'

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
  const kycDocumentServicee = useMemo(() => new KycDocumentTypeService(), [])
  const helper = new HelperService()

  const getCountryName = (countryCode: string) => {
    const country = countries.find((c) => c.countryCode === countryCode)
    return country ? country.countryName : countryCode
  }

  const getProductName = (productCode: string) => {
    const product = products.find((p) => p.productCode === productCode)
    return product ? product.productName : productCode
  }

  const getChannelDescription = (channelCode: string) => {
    const channel = channels.find((c) => c.channel_code === channelCode)
    return channel ? channel.channel_description : channelCode
  }

  const getResidentTypeDescription = (code: string) => {
    const resident = residentTypes.find((r) => r.residentTypeCode === code)
    return resident ? resident.residentTypeDescription : code
  }

  const getKycDocumentDescription = (code: string) => {
    const doc = kycDocuments.find((d) => d.kycDocCode === code)
    return doc ? `${doc.docCode} - ${doc.docDescription}` : code
  }

  const getRequirementTypeLabel = (type: string) => {
    const reqType = REQUIREMENT_TYPES.find((r) => r.value === type)
    return reqType ? reqType.label : type
  }

  const getBfaLabel = (bfa: string) => {
    const option = BFA_OPTIONS.find((o) => o.value === bfa)
    return option ? option.label : bfa
  }
  let country_kyc_doc_service = new CountryKycDocumentService()

  // Fetch all master data
  const fetchMasterData = useCallback(async () => {
    try {
      const [productsRes, channelsRes, residentRes, kycDocsRes] = await Promise.all([
        productService.getProductList(),
        channelService.getChannelList(),
        residentService.getAllResidentTypes(),
        country_kyc_doc_service.getAllKycDocuments(),
      ])
      console.log(kycDocsRes)
      setProducts(productsRes)
      //@ts-ignore
      setChannels(channelsRes)
      setResidentTypes(Array.isArray(residentRes) ? residentRes : [])

      setKycDocuments(kycDocsRes)
    } catch (error) {
      console.error('Error fetching master data:', error)
    }
  }, [productService, channelService, residentService, kycDocumentServicee])

  useEffect(() => {
    console.log(kycDocuments)
  }, [])
  // Fetch document requirements
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await docRequiredService.getAllDocRequired()
      setRows(Array.isArray(response) ? response : [])
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
      finalAudit: any,
    ) => {
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
          effectiveFromDate: data.effectiveFromDate,
          effectiveToDate: data.effectiveToDate,
          modifiedBy: data.modifiedBy || local_service?.get_staff_id() || 'ADMIN',
        }

        console.log('Sending Update Payload:', payload)

        const response: any = await docRequiredService.updateDocRequired(editData.reqDocCode, payload)

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
          effectiveFromDate: data.effectiveFromDate,
          effectiveToDate: data.effectiveToDate,
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
      const response: any = await docRequiredService.updateStatus(selectedRow.reqDocCode, newStatus, local_service?.get_staff_id() || 'ADMIN')

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
      field: 'reqDocCode',
      headerName: 'Req Code',
      width: 120,
      flex: 1,
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
      field: 'countryCode',
      headerName: 'Country',
      width: 80,
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <PublicIcon sx={{ fontSize: 16, color: '#666' }} />
          <Tooltip title={getCountryName(params.value)}>
            <Typography>{params.value}</Typography>
          </Tooltip>
        </Stack>
      ),
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'residenceTypeCode',
      headerName: 'Residence',
      flex: 1,

      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Tooltip title={getResidentTypeDescription(params.value)}>
          <Chip label={params.value} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
        </Tooltip>
      ),
    },
    {
      field: 'productCode',
      headerName: 'Product',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Tooltip title={getProductName(params.value)}>
          <Chip label={params.value} size="small" icon={<ReceiptIcon />} color="primary" variant="outlined" />
        </Tooltip>
      ),
    },
    {
      field: 'channelCode',
      headerName: 'Channel',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Tooltip title={getChannelDescription(params.value)}>
          <Chip label={params.value} size="small" icon={<DevicesIcon />} color="secondary" variant="outlined" />
        </Tooltip>
      ),
    },
    {
      field: 'kycDocCode',
      headerName: 'KYC Doc',
      headerClassName: 'super-app-theme--header',
      flex: 1,
      renderCell: (params) => (
        <Tooltip title={getKycDocumentDescription(params.value)}>
          <Chip label={params.value} size="small" icon={<DescriptionIcon />} color="info" variant="outlined" />
        </Tooltip>
      ),
    },
    {
      field: 'docRequirementType',
      headerClassName: 'super-app-theme--header',
      headerName: 'Req Type',
      flex: 1,
      renderCell: (params) => {
        const color = params.value === 'M' ? 'error' : params.value === 'O' ? 'success' : 'warning'
        return <Chip label={getRequirementTypeLabel(params.value)} size="small" color={color} variant="outlined" />
      },
    },
    {
      field: 'bfa',
      headerClassName: 'super-app-theme--header',
      headerName: 'BFA',
      flex: 1,
      renderCell: (params) => (
        <Tooltip title={getBfaLabel(params.value)}>
          <Chip label={params.value} size="small" icon={<SwapHorizIcon />} variant="outlined" />
        </Tooltip>
      ),
    },
    {
      field: 'docSequence',
      headerClassName: 'super-app-theme--header',
      headerName: 'Seq',
      flex: 1,
      renderCell: (params) => <Chip label={params.value} size="small" icon={<NumbersIcon />} variant="outlined" />,
    },
    {
      field: 'documentUpload',
      headerClassName: 'super-app-theme--header',
      headerName: 'Upload',
      flex: 1,
      renderCell: (params) => (params.value ? <CheckCircleIcon sx={{ color: '#4caf50' }} /> : <CancelIcon sx={{ color: '#f44336' }} />),
    },
    {
      field: 'documentNumberRequired',
      headerClassName: 'super-app-theme--header',
      headerName: 'Doc No',
      flex: 1,
      renderCell: (params) => (params.value ? <CheckCircleIcon sx={{ color: '#4caf50' }} /> : <CancelIcon sx={{ color: '#f44336' }} />),
    },
    {
      field: 'active',
      headerClassName: 'super-app-theme--header',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          icon={params.value ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <CancelIcon sx={{ fontSize: 16 }} />}
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            backgroundColor: params.value ? '#e2f0e6' : '#ffece5',
            color: params.value ? '#0f6a3b' : '#b13e2d',
            fontWeight: 600,
            width: '70px',
          }}
        />
      ),
    },
    {
      field: 'effectiveFromDate',
      headerClassName: 'super-app-theme--header',
      headerName: 'From',

      flex: 1,
      renderCell: (params) => formatTableDate(params.value),
    },
    {
      field: 'effectiveToDate',
      headerClassName: 'super-app-theme--header',
      headerName: 'To',
      flex: 1,
      width: 90,
      renderCell: (params) => (params.value === '2030-12-31T23:59:59' ? '2030' : formatTableDate(params.value)),
    },
    {
      field: 'actions',
      headerClassName: 'super-app-theme--header',
      headerName: 'Actions',
      width: 100,
      flex: 1,
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
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: '#0061B1',
          }}
        >
          Country Resident Product Channel Document Required
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Configure document requirements by country, residence type, product, and channel
        </Typography>

        <Stack direction="row" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
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
            Add Document Requirement
          </Button>
        </Stack>

        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row: DocRequiredData) => row.reqDocCode}
          autoHeight
          loading={loading}
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
          }}
        />

        <DocRequiredFormDialog
          open={dialogopen}
          onClose={() => setDialogopen(false)}
          editData={editData}
          onSubmit={(data: any) => handleAction(data, !!editData)}
          countries={countries}
          residentTypes={residentTypes.filter((r) => r.active)}
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
    </HasPermission>
  )
}
