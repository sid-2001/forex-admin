import { Button, Stack, IconButton, Box, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import { useEffect, useState, useMemo, useCallback } from 'react'
import CountryKycDocDialog from '../../components/countryKycDocDialog'
import CountryKycDocService from '../../services/country-kyc-doc.service'
import { formatTableDate } from '@/helpers/dateformate'

export default function CountryKycDocManagement() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errMassage, setErrMassage] = useState(null)

  const docService = useMemo(() => new CountryKycDocService(), [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await docService.getDocList()
      // Correctly handle the response structure
      const responseData = res?.data || res
      setRows(Array.isArray(responseData) ? responseData : [])
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [docService])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleUpdate = async (data: any) => {
    // The ID for the URL parameter
    const id = editData?.countryKycDocCode
    try {
      // Switched to PUT pattern from your EmailTemplate reference
      const res = await docService.updateDoc(id, { ...data, modifiedBy: 'APSNGGGN3624' })
      if (res.status === false) {
        setErrMassage(res.message)
      } else {
        setOpen(false)
        fetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreate = async (data: any) => {
    try {
      const res = await docService.createDoc({ ...data, createdBy: 'APSNGGGN3624' })
      if (res.status === false) {
        setErrMassage(res.message)
      } else {
        setOpen(false)
        fetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'countryKycDocCode',
      headerName: 'Doc Code',
      flex: 1,
      headerClassName: 'super-app-theme--header', // Added for Blue Header
    },
    {
      field: 'countryCode',
      headerName: 'Country',
      flex: 0.7,
      headerClassName: 'super-app-theme--header', // Added for Blue Header
    },
    {
      field: 'countryKycDocDescription',
      headerName: 'Description',
      flex: 1.5,
      headerClassName: 'super-app-theme--header', // Added for Blue Header
    },
    {
      field: 'effective_from_date',
      headerName: 'Effective From',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectivefromdate || params.row?.effectiveFromDate),
    },
    {
      field: 'effective_to_date',
      headerName: 'Effective To',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectivetodate || params.row?.effectiveToDate),
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
            setErrMassage(null)
          }}
        >
          Add
        </Button>
      </Stack>
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(r) => r.countryKycDocCode}
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
          onClose={() => setOpen(false)}
          editData={editData}
          onSubmit={editData ? handleUpdate : handleCreate}
          errMassage={errMassage}
        />
      )}
    </Box>
  )
}
