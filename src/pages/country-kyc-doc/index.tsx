import { Button, Stack, IconButton, Box, Typography, Alert, Snackbar } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import { useEffect, useState, useMemo, useCallback } from 'react'
import CountryKycDocDialog from '../../components/countryKycDocDialog'
import CountryKycDocService from '../../services/country-kyc-doc.service'
import { formatTableDate } from '@/helpers/dateformate'
import { LocalStorageService } from '@/helpers/local-storage-service'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'

export default function CountryKycDocManagement() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errMessage, setErrMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  const docService = useMemo(() => new CountryKycDocService(), [])
  const local_service = new LocalStorageService()
  const helper = new HelperService()

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    setSnackbarOpen(true)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await docService.getDocList()
      // Correctly handle the response structure
      const responseData = res?.data || res
      setRows(Array.isArray(responseData) ? responseData : [])
      setErrMessage(null)
    } catch (error: any) {
      console.error('Fetch error:', error)
      setErrMessage(error?.response?.data?.message || error?.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [docService])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleUpdate = async (data: any) => {
    try {
      // Switched to PUT pattern from your EmailTemplate reference
      const res = await docService.updateDoc(editData?.kycDocCode, { ...data, modifiedBy: local_service?.get_staff_id() })
      console.log(res, 'response updatd')
      if (res.status === false) {
        setErrMessage(res.message)
        setSnackbarOpen(true)
        setOpen(false)
        setEditData(null)
      } else {
        setOpen(false)
        setEditData(null)
        setErrMessage(null)
        showSuccessMessage(res.message)
        await fetchData()
      }
    } catch (err: any) {
      console.error(err)
      setErrMessage(err?.response?.data?.message || err?.message || 'Failed to update document')
    }
  }

  const handleCreate = async (data: any) => {
    try {
      const res = await docService.createDoc({ ...data, createdBy: local_service?.get_staff_id() })
      console.log(res, 'respnse')
      if (res.status === false) {
        setErrMessage(res.message)
        setSnackbarOpen(true)
        setOpen(false)
        setEditData(null)
      } else {
        setOpen(false)
        setEditData(null)
        setErrMessage(null)
        showSuccessMessage(res.message)
        await fetchData()
      }
    } catch (err: any) {
      console.error(err)
      setErrMessage(err?.response?.data?.message || err?.message || 'Failed to create document')
    }
  }

  const handleCloseSnackbar = (
    //@ts-ignore
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
    setSuccessMessage(null)
    setErrMessage(null)
  }

  const columns: GridColDef[] = [
    {
      field: 'kycDocCode',
      headerName: 'kyc Doc Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'countryCode',
      headerName: 'Country',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'docTypeCode',
      headerName: 'Doc Type Code',
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
    },

    {
      field: 'docTypeDescription',
      headerName: 'Doc Type Description',
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'docCode',
      headerName: 'Doc Code',
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'docDescription',
      headerName: 'Doc Description',
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'vendorCode',
      headerName: 'Vendor Code',
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'verificationMode',
      headerName: 'Verification Mode',
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
      renderCell: (p) => (p.value === 'A' ? 'Auto' : p.value === 'M' ? 'Manual' : ''),
    },
    {
      field: 'appLimit',
      headerName: 'App limit',
      flex: 1.5,
      headerClassName: 'super-app-theme--header',
    },

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
    {
      field: 'active',
      headerName: 'Active',
      flex: 0.5,
      renderCell: (p) => (p.value ? 'Yes' : 'No'),
      headerClassName: 'super-app-theme--header', // Added for Blue Header
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      headerClassName: 'super-app-theme--header', // Added for Blue Header
      renderCell: (params) => (
        <IconButton
          color="primary"
          onClick={() => {
            setEditData(params.row)
            setOpen(true)
            setErrMessage(null)
          }}
          disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
        >
          <EditIcon />
        </IconButton>
      ),
    },
  ]

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3}>
        <Stack direction="row" mb={2} justifyContent={'space-between'}>
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
            {'kyc master'.toUpperCase()}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setEditData(null)
              setOpen(true)
              setErrMessage(null)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
          >
            Add
          </Button>
        </Stack>

        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            getRowId={(r) => r.kycDocCode}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true } }}
            disableColumnMenu
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
          />
        </div>

        {open && (
          <CountryKycDocDialog
            key={editData ? editData.countryKycDocCode : 'new'}
            open={open}
            onClose={() => {
              setOpen(false)
              setErrMessage(null)
            }}
            editData={editData}
            onSubmit={editData ? handleUpdate : handleCreate}
            errMassage={errMessage}
          />
        )}

        {/* Success Snackbar */}
        <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Display error message if exists */}
        <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {errMessage}
          </Alert>
        </Snackbar>
      </Box>
    </HasPermission>
  )
}
