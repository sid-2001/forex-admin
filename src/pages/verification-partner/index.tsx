import { Button, Stack, IconButton, Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar, GridToolbarExport } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import { useEffect, useState, useMemo, useCallback } from 'react'

import VerificationPartnerMasterDialog from '../../components/verificationPartnerMasterDialogs'
import VerificationPartnerService from '../../services/verification-partner.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { formatTableDate } from '@/helpers/dateformate'

export default function VerificationPartnerManagement() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errMassage, setErrMassage] = useState(null)
  const [pageSize, setPageSize] = useState(5)
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  })

  const partnerService = useMemo(() => new VerificationPartnerService(), [])
  const local_service = useMemo(() => new LocalStorageService(), [])

  const [alertOpen, setAlertOpen] = useRecoilState(alertState)
  const [alertText, setAlertText] = useRecoilState(alertTextState)
  const [alertType, setAlertType] = useRecoilState(alertTypeState)

  const showAlert = (type: 'Success' | 'Fail', text: string) => {
    setAlertType(type)
    setAlertText(text)
    setAlertOpen(true)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await partnerService.getPartnerList()
      const responseData = res?.data || res
      if (Array.isArray(responseData)) {
        setRows([...responseData])
      } else {
        setRows([])
      }
    } catch (error) {
      console.error('Error fetching partners:', error)
    } finally {
      setLoading(false)
    }
  }, [partnerService])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleUpdate = async (data: any) => {
    const id = editData?.verificationPartnerCode
    try {
      const res = await partnerService.updatePartner(id, {
        ...data,
        modifiedBy: local_service?.get_staff_id(),
      })
      if (res.status === false) {
        setErrMassage(res.message)
        return
      }
      setOpen(false)
      showAlert('Success', 'Record Updated Successfully')
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreate = async (data: any) => {
    try {
      const res = await partnerService.createPartner({
        ...data,
        createdBy: local_service?.get_staff_id(),
      })
      showAlert('Success', errMassage || 'Record Created Successfully')
      if (res.status === false) {
        setErrMassage(res.message)
        return
      }
      setOpen(false)
      fetchData()
    } catch (err) {
      console.error(err)
      showAlert('Fail', 'Please verify the fields')
    }
  }

  const columns: GridColDef[] = [
    { field: 'verificationPartnerCode', headerName: 'Partner Code', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'verificationPartnerDescription', headerName: 'Description', flex: 1.5, headerClassName: 'super-app-theme--header' },
    { field: 'countryCode', headerName: 'Country', flex: 0.8, headerClassName: 'super-app-theme--header' },
    {
      field: 'effective_from_date',
      headerName: 'Effective From',
      flex: 1,
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      //@ts-ignore
      valueGetter: (value, row) => {
        const date = row?.effectivefromdate || row?.effectiveFromDate

        return date ? formatTableDate(date) : ''
      },
    },
    {
      field: 'effective_to_date',
      headerName: 'Effective To',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      minWidth: 150,
      //@ts-ignore
      valueGetter: (value, row) => {
        const date = row?.effectivetodate || row?.effectiveToDate

        return date ? formatTableDate(date) : ''
      },
    },
    { field: 'active', headerName: 'Active', headerClassName: 'super-app-theme--header', flex: 0.6, renderCell: (p) => (p.value ? 'Yes' : 'No') },
    {
      field: 'actions',
      headerName: 'Actions',
      headerClassName: 'super-app-theme--header',
      width: 80,
      renderCell: (params) => (
        <IconButton
          color="primary"
          onClick={() => {
            setEditData(params.row)
            setOpen(true)
            setErrMassage(null)
          }}
        >
          <EditIcon />
        </IconButton>
      ),
    },
  ]

  return (
    <Box p={3}>
      <Stack direction="row" mb={2} justifyContent={'space-between'} alignItems="center">
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.02em',
            display: 'grid',
            placeItems: 'center',
            color: '#0061B1',
          }}
        >
          {'Verification Partner master'.toUpperCase()}
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          {/* Rows per page selector */}
          {/* <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="rows-per-page-label">Rows per page</InputLabel>
            <Select
              labelId="rows-per-page-label"
              value={paginationModel.pageSize}
              label="Rows per page"
              onChange={(e) => {
                const newPageSize = Number(e.target.value)
                setPaginationModel({ ...paginationModel, pageSize: newPageSize })
                setPageSize(newPageSize)
              }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl> */}

          <Button
            variant="contained"
            onClick={() => {
              setEditData(null)
              setOpen(true)
              setErrMassage(null)
            }}
          >
            Add
          </Button>
        </Stack>
      </Stack>

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.verificationPartnerCode}
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
          disableColumnMenu
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          checkboxSelection={false}
          disableRowSelectionOnClick
        />
      </div>

      {open && (
        <VerificationPartnerMasterDialog
          key={editData ? editData.verificationPartnerCode : 'new'}
          open={open}
          onClose={() => setOpen(false)}
          editData={editData}
          onSubmit={editData ? handleUpdate : handleCreate}
          errMassage={errMassage}
        />
      )}
    </Box>
  )
}
