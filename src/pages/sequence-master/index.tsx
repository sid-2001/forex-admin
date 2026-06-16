import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Grid,
  Select,
  MenuItem,
} from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid'
import ConfirmationModal from '@/components/logout/logout.component'

import SequenceApiService from '../../services/sequence.api.service'
import SequenceDialog from '../../components/sequence-dialog'
import { formatTableDate } from '@/helpers/dateformate'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { HelperService } from '@/helpers/helper'

function CustomToolbar({ selectedRows, clearSelection, onClickCopy }: { selectedRows: any; clearSelection: any; onClickCopy: any }) {
  if (selectedRows.length > 0) {
    return (
      <GridToolbarContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Typography fontWeight={600}>{selectedRows.length} selected</Typography>

          <Button size="small" onClick={onClickCopy}>
            Copy
          </Button>

          {/* <Button size="small" color="error">
            Delete
          </Button>

          <Button size="small">Export Selected</Button> */}

          <Button size="small" onClick={clearSelection}>
            Clear
          </Button>
        </Box>
      </GridToolbarContainer>
    )
  }

  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  )
}

export default function SequenceMasterTable() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)

  const [, setOpen] = useRecoilState(alertState)
  const [, setText] = useRecoilState(alertTextState)
  const [, setType] = useRecoilState(alertTypeState)
  const [selectedRows, setSelectedRows] = useState([])
  const [openCopyConfirmDialog, setOpenCopyConfirmDialog] = useState(false)
  const [showCountrySelectionModal, setShowCountryModal] = useState(false)
  const [countriesData, setCountryCorridorsData] = useState([])
  const [copiedCountry, setCopiedCountry] = useState(null)

  const sequenceService = useMemo(() => new SequenceApiService(), [])
  const helper = new HelperService()
  const local_service = new LocalStorageService()

  const showAlert = (t: 'success' | 'error', m: string) => {
    setType(t)
    setText(m)
    setOpen(true)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const res: any = await sequenceService.getAll()
      const actualData = res?.data || res
      if (Array.isArray(actualData)) {
        setRows(actualData as any)
      } else {
        setRows([])
      }
    } catch (error) {
      showAlert('error', 'Failed to load sequences')
    } finally {
      setLoading(false)
    }
  }

  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows
    const query = searchQuery.toLowerCase()
    return rows.filter(
      (row: any) =>
        row.sequenceNumber?.toLowerCase().includes(query) || row.product?.toLowerCase().includes(query) || row.docType?.toLowerCase().includes(query),
    )
  }, [rows, searchQuery])

  const fetchCountryCodes = useCallback(async () => {
    const res: any = await sequenceService.getActiveCountryCorridors()
    setCountryCorridorsData(res || [])
  }, [])

  useEffect(() => {
    fetchData()
    fetchCountryCodes()
  }, [])

  const handleCopyApiCall = async () => {
    const selectedMappedData = rows
      .filter((r: any) =>
        //@ts-ignore
        selectedRows.includes(r.sequenceId),
      )
      .map((m: any) => {
        return {
          countryCode: copiedCountry,
          productCode: m.productCode,
          vendorCode: m.vendorCode,
          vendorTypeCode: m.vendorTypeCode,
          moduleFeatureCode: m.moduleFeatureCode,
          prefix: m.prefix,
          intermediate: m.intermediate,
          suffix: m.suffix,
          maxLimitDigit: m.maxLimitDigit,
          docSeq: m.docSeq,
          flag: m.flag,
          startSeqNumber: m.startSeqNumber,
          currentSeqNumber: m.currentSeqNumber,
          active: m.active,
          effectiveFromDate: m.effectiveFromDate,
          effectiveToDate: m.effectiveToDate,
          sequenceNumber: m.sequenceNumber,
          createdBy: 'admin',
        }
      })

    const res = await sequenceService.createBulkSequence(selectedMappedData)
    setCopiedCountry(null)
    setSelectedRows([])
    setShowCountryModal(false)
    showAlert('success', 'Sequence copied successfully')
    fetchData()
  }

  const columns: GridColDef[] = [
    { field: 'sequenceId', headerName: 'Current Sequence', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'countryCode', headerName: 'Country', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'productCode', headerName: 'Product', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'moduleFeatureCode', headerName: 'Doc Type', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'prefix', headerName: 'Prefix', flex: 0.6, headerClassName: 'super-app-theme--header' },
    { field: 'currentSeqNumber', headerName: 'Current #', flex: 0.7, headerClassName: 'super-app-theme--header' },
    {
      field: 'effectiveFromDate',
      headerName: 'Effective From',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.value),
    },
    {
      field: 'effectiveToDate',
      headerName: 'Effective To',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.value),
    },
    {
      field: 'active',
      headerName: 'Status',
      flex: 0.6,
      headerClassName: 'super-app-theme--header',
      renderCell: (p) => (p.value ? 'Active' : 'Inactive'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => {
            setEditData(params.row)
            setDialogOpen(true)
          }}
          disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3} sx={{ width: '100%', '& .header-bg': { fontWeight: 'bold', bgcolor: '#f5f5f5' } }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0061B1', textAlign: 'center' }}>
            GENERATE SEQUENCE MASTER
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setEditData(null)
              setDialogOpen(true)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
          >
            Add
          </Button>
        </Stack>

        <Box sx={{ height: 400, width: '100%', bgcolor: 'white' }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.sequenceId}
            slots={{
              toolbar: () => (
                <CustomToolbar
                  selectedRows={selectedRows}
                  clearSelection={() => setSelectedRows([])}
                  onClickCopy={() => setOpenCopyConfirmDialog(true)}
                />
              ),
            }}
            slotProps={{ toolbar: { showQuickFilter: true } }}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            checkboxSelection
            disableRowSelectionOnClick
            rowSelectionModel={selectedRows}
            onRowSelectionModelChange={(ids: any) => {
              setSelectedRows(ids)
            }}
          />
        </Box>

        <SequenceDialog
          open={dialogOpen}
          countryCorridorList={countriesData}
          editData={editData}
          onClose={() => setDialogOpen(false)}
          refreshList={fetchData}
          showAlert={showAlert}
        />
        <ConfirmationModal
          showIcon={false}
          confirmBtnText={'Yes, Copy'}
          isOpen={openCopyConfirmDialog}
          message={'Do you want to copy ' + `${selectedRows.length}` + `${selectedRows.length > 1 ? ' records' : ' record'}`}
          handleConfirm={() => {
            // open new dialog box
            setShowCountryModal(true)
            setOpenCopyConfirmDialog(false)
          }}
          handleClose={() => {
            setOpenCopyConfirmDialog(false)
            setSelectedRows([])
          }}
        />
        <Dialog
          open={showCountrySelectionModal}
          onClose={() => {
            setShowCountryModal(false)
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Select Country To Proceed</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <FormControl sx={{ minWidth: 210 }} size="small">
                  <InputLabel id="country-label">Select Country</InputLabel>
                  <Select
                    labelId="country-label"
                    value={copiedCountry}
                    //@ts-ignore
                    onChange={(e) => setCopiedCountry(e.target.value)}
                    label="Select Country"
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
                    {countriesData &&
                      countriesData.map((item: any, index: number) => (
                        <MenuItem key={index} value={item.countryCode}>
                          {item.countryName} {item.countryCode}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setShowCountryModal(false)
                setSelectedRows([])
                setCopiedCountry(null)
              }}
              color="inherit"
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleCopyApiCall} color="primary">
              Proceed
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </HasPermission>
  )
}
