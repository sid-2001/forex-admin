// pages/CountryLimitTypeWiseLimitMaster.tsx
import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack, Typography, Chip, Paper, Tooltip } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PublicIcon from '@mui/icons-material/Public'
import AddIcon from '@mui/icons-material/Add'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CountryLimitTypeWiseLimitFormDialog from '../../components/countryLimitTypeWiseLimitFormDialog'
import { CountryLimitTypeWiseLimitService } from '@/services/countryLimitTypeWiseLimit.service'
import { KycLimitTypeService } from '@/services/kycLimitType.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState, useRecoilValue } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { countyState } from '@/states/state'
import ConfirmModal from '@/components/ConfirmModal'
import dayjs from 'dayjs'
import { getLiveAuditData } from '@/helpers/dynamicLocations'

// Types
interface CountryLimitTypeWiseLimitData {
  countryLimitTypeLimitCode: string
  countryCode: string
  limitTypeCode: string
  limitAmount: number
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string
  modifiedBy: string | null
  createdLocalDateTime: string
  createdTimezone: string
  createdOffset: string
  modifiedLocalDateTime: string | null
  modifiedTimezone: string | null
  modifiedOffset: string | null
  createdUtcDatetime: string
  modifiedUtcDatetime: string | null
}

// KYC Limit Type interface
interface KycLimitType {
  kycLimitTypeCode: string
  limitCode: string
  limitDescription: string
  active: boolean
}

export default function CountryLimitTypeWiseLimitMaster() {
  const [rows, setRows] = useState<CountryLimitTypeWiseLimitData[]>([])
  const [limitTypes, setLimitTypes] = useState<KycLimitType[]>([])
  const [dialogopen, setDialogopen] = useState(false)
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<CountryLimitTypeWiseLimitData | null>(null)
  const [editData, setEditData] = useState<CountryLimitTypeWiseLimitData | null>(null)
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate' | null>(null)
  const [loading, setLoading] = useState(false)

  const countries = useRecoilValue(countyState)
  const local_service = useMemo(() => new LocalStorageService(), [])
  const limitService = useMemo(() => new CountryLimitTypeWiseLimitService(), [])
  const kycLimitTypeService = useMemo(() => new KycLimitTypeService(), [])

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

  const getLimitTypeDescription = (limitCode: string) => {
    const limit = limitTypes.find(l => l.limitCode === limitCode)
    return limit ? limit.limitDescription : limitCode
  }

  // Fetch KYC Limit Types
  const fetchLimitTypes = useCallback(async () => {
    try {
      const response = await kycLimitTypeService.getAllLimitTypes()
      // Filter only active limit types
      const activeLimits = response.filter((limit: KycLimitType) => limit.active)
      setLimitTypes(activeLimits)
    } catch (error) {
      console.error('Error fetching limit types:', error)
    }
  }, [kycLimitTypeService])

  // Fetch Country Limits
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await limitService.getAllCountryLimits()
      setRows(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Error fetching country limits:', error)
      showAlert('Fail', 'Failed to fetch country limits')
    } finally {
      setLoading(false)
    }
  }, [limitService])

  useEffect(() => {
    fetchLimitTypes()
    fetchData()
  }, [fetchLimitTypes, fetchData])

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

    const submitPayload = async (finalAudit: typeof audit) => {
      if (isUpdate && editData) {
        // Update existing
        const payload = {
          countryCode: data.countryCode,
          limitTypeCode: data.limitTypeCode,
          limitAmount: parseFloat(data.limitAmount),
          active: data.active,
          effectiveFromDate: data.effectiveFromDate,
          effectiveToDate: data.effectiveToDate,
          modifiedBy: data.modifiedBy || local_service?.get_staff_id() || 'ADMIN',
        }

        console.log('Sending Update Payload:', payload)

        const response: any = await limitService.updateCountryLimit(
          editData.countryLimitTypeLimitCode,
          payload
        )

        if (response?.status === true || response?.success === true) {
          showAlert('Success', 'Country Limit Updated Successfully')
          setDialogopen(false)
          fetchData()
        } else {
          showAlert('Fail', response?.message || 'Server Error')
        }
      } else {
        // Create new
        const payload = {
          countryCode: data.countryCode,
          limitTypeCode: data.limitTypeCode,
          limitAmount: parseFloat(data.limitAmount),
          active: data.active,
          effectiveFromDate: data.effectiveFromDate,
          effectiveToDate: data.effectiveToDate,
          createdBy: data.createdBy || local_service?.get_staff_id() || 'ADMIN',
        }

        console.log('Sending Create Payload:', payload)

        const response: any = await limitService.createCountryLimit(payload)

        if (response?.status === true || response?.success === true) {
          showAlert('Success', 'Country Limit Created Successfully')
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
      const response: any = await limitService.updateStatus(
        selectedRow.countryLimitTypeLimitCode,
        newStatus,
        local_service?.get_staff_id() || 'ADMIN'
      )
      
      if (response?.status === true || response?.success === true) {
        showAlert('Success', `Country Limit ${newStatus ? 'Activated' : 'Deactivated'} Successfully`)
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
      field: 'countryLimitTypeLimitCode', 
      headerName: 'Limit Code', 
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
      width: 120,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <PublicIcon sx={{ fontSize: 16, color: '#666' }} />
          <Typography>{getCountryName(params.value)}</Typography>
        </Stack>
      )
    },
    { 
      field: 'limitTypeCode', 
      headerName: 'Limit Type', 
      width: 150,
      renderCell: (params) => (
        <Tooltip title={getLimitTypeDescription(params.value)}>
          <Chip 
            label={params.value} 
            size="small"
            variant="outlined"
            sx={{ 
              fontWeight: 500,
              backgroundColor: '#f0f0f0'
            }}
          />
        </Tooltip>
      )
    },
    { 
      field: 'limitAmount', 
      headerName: 'Limit Amount', 
      width: 130,
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
            width: '80px'
          }}
        />
      ),
    },
    {
      field: 'effectiveFromDate',
      headerName: 'From',
      width: 100,
      renderCell: (params) => formatTableDate(params.value),
    },
    {
      field: 'effectiveToDate',
      headerName: 'To',
      width: 100,
      renderCell: (params) => params.value === '9999-12-31T23:59:59' ? '∞' : formatTableDate(params.value),
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      width: 120,
    },
    {
      field: 'actions',
      headerName: 'Actions',
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
          Country Limit Type Wise Limit Master
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Configure country-specific limits for different KYC limit types
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
          Add Country Limit
        </Button>
      </Stack>

      <Paper elevation={2} sx={{ p: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row: CountryLimitTypeWiseLimitData) => row.countryLimitTypeLimitCode}
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
            sorting: {
              sortModel: [{ field: 'createdLocalDateTime', sort: 'desc' }],
            },
          }}
        />
      </Paper>

      <CountryLimitTypeWiseLimitFormDialog
        open={dialogopen}
        onClose={() => setDialogopen(false)}
        editData={editData}
        onSubmit={(data: any) => handleAction(data, !!editData)}
        countries={countries}
        limitTypes={limitTypes}
      />

      <ConfirmModal
        open={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false)
          setSelectedRow(null)
          setStatusAction(null)
        }}
        onConfirm={handleStatusToggle}
        title={statusAction === 'activate' ? 'Activate Country Limit?' : 'Deactivate Country Limit?'}
        message={`Are you sure you want to ${statusAction} country limit "${selectedRow?.countryLimitTypeLimitCode}"?`}
        confirmText={statusAction === 'activate' ? 'Activate' : 'Deactivate'}
        confirmColor={statusAction === 'activate' ? 'success' : 'warning'}
      />
    </Box>
  )
}