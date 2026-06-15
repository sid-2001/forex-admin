import React, { useEffect, useState } from 'react'
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridRenderCellParams,
  GridToolbarFilterButton,
  GridFilterModel,
  GridColDef,
} from '@mui/x-data-grid'
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  DialogTitle,
  MenuItem,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { statusColors } from '@/contants/utils'
import LoaderUI from '@/components/loader/loader'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { KycService } from '@/services/kyc.service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'

const ReferralTable: React.FC = () => {
  const [referralData, setReferralData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const helper = new HelperService()
  const local_service = new LocalStorageService()
  const kyc_service = new KycService()

  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>({})
  const [actionModal, setActionModal] = useState(false)
  const initialFormState = { action: '', actionBy: local_service?.get_staff_id(), remarks: '', id: 0 }
  const [formData, setFormData] = useState(initialFormState)
  const apiRef = React.useRef<any>(null)

  const [, setAlertOpen] = useRecoilState(alertState)
  const [, setAlertText] = useRecoilState(alertTextState)
  const [, setAlertType] = useRecoilState(alertTypeState)
  const [errors, setErrors] = useState<any>({})

  const showAlert = (type: 'Success' | 'Fail', text: string) => {
    setAlertType(type)
    setAlertText(text)
    setAlertOpen(true)
  }

  useEffect(() => {
    fetchReferralListingData()
  }, [])

  const fetchReferralListingData = async () => {
    try {
      setIsLoading(true)
      const response = await kyc_service.getAllReferrals()
      setReferralData(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const columns = [
    {
      field: 'countryCode',
      headerName: 'Country Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'code',
      headerName: 'Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const status = params?.row?.status?.toUpperCase?.() || ''

        if (!status) {
          return null // 👈 empty ho toh chip hi na render karo
          // OR return <Chip label="N/A" size="small" />; // fallback chahiye toh
        }

        return (
          <Chip
            label={status}
            sx={{
              backgroundColor: statusColors[status] || 'grey',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        )
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },

    {
      field: 'applicantId',
      headerName: 'Applicant ID',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(`/applicant-details/${params.value}`)}>
          {params.value}
        </span>
      ),
    },
    {
      field: 'createdLocalDateTime',
      headerName: 'Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => helper.convertDateAndTime(params?.row?.createdLocalDateTime),
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <>
          {params?.row?.status === 'PENDING' && (
            <Box
              style={{ fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => {
                setActionModal(true)
                setFormData((prev) => ({ ...prev, id: params?.row?.id }))
              }}
            >
              Approve / Reject
            </Box>
          )}
        </>
      ),
    },
  ]

  const getVisibleFilteredRows = () => {
    const visibleCols = columns.filter((col) => columnVisibilityModel[col.field] !== false && col.field !== 'action')

    const filteredRows = referralData.filter((row: any) =>
      filterModel.items.every((filter) => {
        if (!filter.value) return true
        const cellValue = row[filter.field]?.toString().toLowerCase() || ''
        return cellValue.includes(filter.value.toLowerCase())
      }),
    )

    return { visibleCols, filteredRows }
  }

  const handleExportCSV = () => {
    const { visibleCols, filteredRows } = getVisibleFilteredRows()

    if (!filteredRows.length) {
      alert('No matching rows to export!')
      return
    }

    const headers = visibleCols.map((col) => col.headerName).join(',')
    const rows = filteredRows.map((row: any) => visibleCols.map((col) => `"${row[col.field] || ''}"`).join(','))

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'Referral_Reward_List.csv')
    link.click()
  }

  const handleExportPDF = () => {
    const { visibleCols, filteredRows } = getVisibleFilteredRows()

    if (!filteredRows.length) {
      alert('No matching rows to export!')
      return
    }

    const headers = visibleCols.map((col) => col.headerName)
    const data = filteredRows.map((row: any) => visibleCols.map((col) => row[col.field] || ''))

    const doc = new jsPDF({ unit: 'pt' })
    doc.setFontSize(14)
    doc.text('Referral Reward Listing Report', 40, 40)
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 60,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [0, 80, 153], textColor: 255 },
    })
    doc.save('Referral_List.pdf')
  }
  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ justifyContent: 'flex-start', gap: 1, py: 1 }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />

      <Button variant="outlined" color="primary" size="small" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
        CSV
      </Button>

      <Button variant="outlined" color="primary" size="small" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF}>
        PDF
      </Button>

      <Button variant="outlined" color="primary" size="small" startIcon={<FindReplaceIcon />} onClick={() => setFilterModel({ items: [] })}>
        Reset Filters
      </Button>
    </GridToolbarContainer>
  )

  const handleAcceptRejectReferral = async () => {
    try {
      const response = await kyc_service.handleReferralAction(formData)

      if (response.status !== false) {
        showAlert('Success', `${response?.message || 'Operation completed successfully'}`)
        setActionModal(false)
        setFormData(initialFormState)

        fetchReferralListingData()
      } else {
        showAlert('Fail', response.message || 'Server Error')
      }
    } catch (e) {
      showAlert('Fail', 'Connection Error')
    }
  }

  const handleCloseActionDialog = async () => {
    setActionModal(false)
    setFormData(initialFormState)
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.REWARDS}>
      <Box sx={{ width: '80vw', height: '70vh' }}>
        <Typography variant="h4" gutterBottom>
          <strong>Reward Redemption</strong>
        </Typography>
        {referralData && (
          <DataGrid
            apiRef={apiRef}
            rows={referralData || []}
            columns={columns}
            filterModel={filterModel}
            onFilterModelChange={(model) => setFilterModel(model)}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(model) => setColumnVisibilityModel(model)}
            initialState={{
              pagination: { paginationModel: { pageSize: 20, page: 0 } },
            }}
            pageSizeOptions={[10, 20, 50]}
            disableRowSelectionOnClick
            loading={isLoading}
            getRowId={(row: any) => row.id}
            slots={{
              toolbar: CustomToolbar,
              loadingOverlay: LoaderUI.LoadingOverlay,
            }}
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#005099',
                color: 'white',
              },
              '& .MuiDataGrid-cell': { fontSize: '14px' },
              '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold', fontSize: '16px' },
            }}
            disableColumnMenu
          />
        )}

        {actionModal && (
          <Dialog open={actionModal} onClose={() => handleCloseActionDialog()} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Approve/Reject Referral Reward</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth required error={!!errors.action}>
                    <InputLabel id="referral-action">Select Action</InputLabel>
                    <Select
                      labelId="referral-action"
                      value={formData?.action}
                      //@ts-ignore
                      onChange={(e: any) => handleChange('action', e.target.value)}
                      label="Select Action"
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300, // limit dropdown height if many options
                          },
                        },
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                        //@ts-ignore
                        getContentAnchorEl: null,
                      }}
                    >
                      <MenuItem value={'REJECT'}>REJECT</MenuItem>
                      <MenuItem value={'APPROVE'}>APPROVE</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Remarks"
                    value={formData.remarks}
                    multiline
                    onChange={(e: any) => handleChange('remarks', e.target.value)}
                    required
                    error={!!errors.remarks}
                    helperText={errors.remarks}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Button onClick={() => handleCloseActionDialog()}>Cancel</Button>
              <Button variant="contained" disabled={!(formData?.action && formData?.remarks)} onClick={() => handleAcceptRejectReferral()}>
                Save
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>{' '}
    </HasPermission>
  )
}

export default ReferralTable
