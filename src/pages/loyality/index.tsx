import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  useTheme,
  Drawer,
  Grid,
  TextField,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
} from '@mui/material'
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton } from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'
import { PreviewOutlined, Add, Edit } from '@mui/icons-material'
import { TransactionService } from '@/services/transaction.service'
import LoaderUI from '@/components/loader/loader'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { HelperService } from '@/helpers/helper'

const StyledDataGrid = styled(DataGrid)({
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#1976d2',
    color: '#fff',
    fontWeight: 'bold',
  },
  '& .MuiDataGrid-cell': {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  '& .super-app-theme--header': {
    backgroundColor: '#005099',
    color: 'white',
  },
})

const Loyality = () => {
  const theme = useTheme()
  const [loyaltyRecords, setLoyaltyRecords] = useState<any[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const service = new TransactionService()
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const local_service = new LocalStorageService()
  const helper = new HelperService()
  // DataGrid state
  const [filterModel, setFilterModel] = useState<any>({ items: [] })
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<any>({})

  // Form state
  const [formData, setFormData] = useState({
    id: 0,
    userTier: '',
    discountPercentage: 0,
    totalTransactionsRequired: 0,
    totalAmountRequired: 0,
    tierRetentionTransactions: 0,
    tierRetentionAmount: 0,
    timePeriodDays: 0,
    status: true,
    countryCode: 'IN',
  })

  const fetchLoyaltyData = async () => {
    try {
      const data = await service.getLoyaltyMasterData()
      setLoyaltyRecords(data)
    } catch (error) {
      console.error('Failed to fetch loyalty data:', error)
      setText('Error fetching loyalty data')
      setOpen(true)
      settype('error')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await fetchLoyaltyData()
      setIsLoading(false)
    }

    loadData()
  }, [])

  const openDrawer = (data: any) => {
    setSelectedRecord(data)
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedRecord(null)
  }

  const openDialog = (record: any = null) => {
    if (record as any) {
      // Edit mode
      setFormData({
        id: record.id,
        userTier: record.userTier,
        discountPercentage: record.discountPercentage,
        totalTransactionsRequired: record.totalTransactionsRequired,
        totalAmountRequired: record.totalAmountRequired,
        tierRetentionTransactions: record.tierRetentionTransactions,
        tierRetentionAmount: record.tierRetentionAmount,
        timePeriodDays: record.timePeriodDays,
        status: record.status,
        countryCode: record.countryCode,
      })
      setIsEditMode(true)
    } else {
      // Add mode
      setFormData({
        id: 0,
        userTier: '',
        discountPercentage: 0,
        totalTransactionsRequired: 0,
        totalAmountRequired: 0,
        tierRetentionTransactions: 0,
        tierRetentionAmount: 0,
        timePeriodDays: 0,
        status: true,
        countryCode: 'IN',
      })
      setIsEditMode(false)
    }
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        await service.updateLoyaltyTier(formData.id, formData)
        setText('Loyalty tier updated successfully')
      } else {
        await service.createLoyaltyTier(formData)
        setText('Loyalty tier created successfully')
      }
      setOpen(true)
      settype('success')
      closeDialog()
      fetchLoyaltyData() // Refresh the data
    } catch (error) {
      console.error('Failed to save loyalty tier:', error)
      setText('Error saving loyalty tier')
      setOpen(true)
      settype('error')
    }
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', flex: 0.5, headerClassName: 'super-app-theme--header' },
    { field: 'userTier', headerName: 'User Tier', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'discountPercentage', headerName: 'Discount %', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'totalTransactionsRequired', headerName: 'Transactions Required', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'totalAmountRequired', headerName: 'Amount Required', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'tierRetentionTransactions', headerName: 'Retention Transactions', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'tierRetentionAmount', headerName: 'Retention Amount', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'timePeriodDays', headerName: 'Time Period (Days)', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => <Chip label={params.value ? 'Active' : 'Inactive'} color={params.value ? 'success' : 'error'} />,
    },
    { field: 'countryCode', headerName: 'Country Code', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <Box>
          <IconButton onClick={() => openDrawer(params.row)} size="small">
            <PreviewOutlined />
          </IconButton>
          {/* <IconButton onClick={() => openDialog(params.row)} size="small">
            <Edit />
          </IconButton> */}
        </Box>
      ),
    },
  ]

  const handleExportCSV = () => {
    const visibleCols = columns.filter((col) => columnVisibilityModel[col.field] !== false)
    const headers = visibleCols.map((col) => col.headerName).join(',')
    const rows = loyaltyRecords.map((row) => visibleCols.map((col) => row[col.field] ?? '').join(','))
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'Loyalty_Tiers.csv')
    link.click()
  }

  // PDF Export
  const handleExportPDF = () => {
    //@ts-ignore
    const visibleCols = columns.filter((col) => columnVisibilityModel[col.field] !== false)
    const headers = visibleCols.map((col) => col.headerName)
    const data = loyaltyRecords.map((row) => visibleCols.map((col) => row[col.field] ?? ''))
    const doc = new jsPDF({ unit: 'pt' })
    doc.setFontSize(14)
    doc.text('Loyalty Tiers Report', 40, 40)
    autoTable(doc, {
      //@ts-ignore
      head: [headers],
      body: data,
      startY: 60,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [0, 80, 153], textColor: 255 },
    })
    doc.save('Loyalty_Tiers.pdf')
  }

  // Custom Toolbar
  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ justifyContent: 'flex-start', gap: 1, py: 1 }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
        CSV
      </Button>
      <Button variant="outlined" size="small" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF}>
        PDF
      </Button>
      <Button variant="outlined" size="small" startIcon={<FindReplaceIcon />} onClick={() => setFilterModel({ items: [] })}>
        Reset Filters
      </Button>
    </GridToolbarContainer>
  )

  return (
    <Box sx={{ width: '80vw', height: '70vh', p: 2 }}>
      <HasPermission permission={'canRead'} module={local_service.get_modules()?.LOYALTY}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">
            <strong>Loyalty Tiers</strong>
          </Typography>
          <Button
            variant="contained"
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.LOYALTY, 'canCreate')}
            startIcon={<Add />}
            onClick={() => openDialog()}
          >
            Add Tier
          </Button>
        </Box>

        <StyledDataGrid
          rows={loyaltyRecords}
          columns={columns}
          filterModel={filterModel}
          onFilterModelChange={(model) => setFilterModel(model)}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(model) => setColumnVisibilityModel(model)}
          initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          slots={{
            toolbar: CustomToolbar,
            loadingOverlay: LoaderUI.LoadingOverlay,
          }}
          loading={isLoading}
          disableColumnMenu
        />
        {/* Detail Drawer */}
        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={closeDrawer}
          sx={{
            '& .MuiDrawer-paper': {
              width: '30%',
              padding: 2,
            },
          }}
        >
          {selectedRecord && (
            <Box>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  p: '0.5%',
                  color: 'white',
                  paddingLeft: '5%',
                  paddingRight: '5%',
                  marginBottom: 2,
                  width: '70%',
                }}
              >
                TIER: {selectedRecord.userTier}
              </Typography>

              <Chip
                label={selectedRecord.status ? 'ACTIVE' : 'INACTIVE'}
                color={selectedRecord.status ? 'success' : 'error'}
                sx={{ marginBottom: 2 }}
              />

              <Typography variant="subtitle1" fontWeight="bold" sx={{ marginBottom: 2 }}>
                Tier Details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField label="ID" value={selectedRecord.id} fullWidth variant="outlined" size="small" disabled />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="User Tier" value={selectedRecord.userTier} fullWidth variant="outlined" size="small" disabled />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Discount Percentage"
                    value={selectedRecord.discountPercentage}
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Transactions Required"
                    value={selectedRecord.totalTransactionsRequired}
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Amount Required" value={selectedRecord.totalAmountRequired} fullWidth variant="outlined" size="small" disabled />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Retention Transactions"
                    value={selectedRecord.tierRetentionTransactions}
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Retention Amount" value={selectedRecord.tierRetentionAmount} fullWidth variant="outlined" size="small" disabled />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Time Period (Days)" value={selectedRecord.timePeriodDays} fullWidth variant="outlined" size="small" disabled />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Country Code" value={selectedRecord.countryCode} fullWidth variant="outlined" size="small" disabled />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => {
                    closeDrawer()
                    openDialog(selectedRecord)
                  }}
                  fullWidth
                  disabled={!helper.checkUserHasPermission(local_service.get_modules()?.LOYALTY, 'canUpdate')}
                >
                  Edit Tier
                </Button>
              </Box>
            </Box>
          )}
        </Drawer>

        {/* Add/Edit Tier Dialog */}
        <Dialog open={isDialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <b>{isEditMode ? 'Update Loyalty Tier' : 'Add New Loyalty Tier'} </b>{' '}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {isEditMode && (
                <Grid item xs={12} md={6}>
                  <TextField name="id" label="ID" value={formData.id} fullWidth disabled />
                </Grid>
              )}
              <Grid item xs={12} md={isEditMode ? 6 : 12}>
                <TextField name="userTier" label="User Tier" value={formData.userTier} onChange={handleInputChange} fullWidth required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="discountPercentage"
                  label="Discount Percentage"
                  type="number"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="totalTransactionsRequired"
                  label="Transactions Required"
                  type="number"
                  value={formData.totalTransactionsRequired}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="totalAmountRequired"
                  label="Amount Required"
                  type="number"
                  value={formData.totalAmountRequired}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="tierRetentionTransactions"
                  label="Retention Transactions"
                  type="number"
                  value={formData.tierRetentionTransactions}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="tierRetentionAmount"
                  label="Retention Amount"
                  type="number"
                  value={formData.tierRetentionAmount}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="timePeriodDays"
                  label="Time Period (Days)"
                  type="number"
                  value={formData.timePeriodDays}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField name="countryCode" label="Country Code" value={formData.countryCode} onChange={handleInputChange} fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel control={<Switch name="status" checked={formData.status} onChange={handleInputChange} />} label="Active" />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={
                isEditMode
                  ? !helper.checkUserHasPermission(local_service.get_modules()?.LOYALTY, 'canUpdate')
                  : !helper.checkUserHasPermission(local_service.get_modules()?.LOYALTY, 'canCreate')
              }
            >
              {isEditMode ? 'Update Tier' : 'Create Tier'}
            </Button>
          </DialogActions>
        </Dialog>
      </HasPermission>
    </Box>
  )
}

export default Loyality
