import { Button, Stack, IconButton, Box, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import { useEffect, useState, useMemo, useCallback } from 'react'

import VerificationPartnerMasterDialog from '../../components/verificationPartnerMasterDialogs'
import VerificationPartnerService from '../../services/verification-partner.service'
import { LocalStorageService } from '@/helpers/local-storage-service'

export default function VerificationPartnerManagement() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errMassage, setErrMassage] = useState(null)

  const partnerService = useMemo(() => new VerificationPartnerService(), [])
  const local_service = useMemo(() => new LocalStorageService(), [])

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
        modifiedBy: local_service?.get_staff_id() || 'APSNGGGN3624',
      })
      if (res.status === false) {
        setErrMassage(res.message)
        return
      }
      setOpen(false)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreate = async (data: any) => {
    try {
      const res = await partnerService.createPartner({
        ...data,
        createdBy: local_service?.get_staff_id() || 'APSNGGGN3624',
      })
      if (res.status === false) {
        setErrMassage(res.message)
        return
      }
      setOpen(false)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const columns: GridColDef[] = [
    { field: 'verificationPartnerCode', headerName: 'Partner Code', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'verificationPartnerDescription', headerName: 'Description', flex: 1.5, headerClassName: 'super-app-theme--header' },
    { field: 'countryCode', headerName: 'Country', flex: 0.8, headerClassName: 'super-app-theme--header' },
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
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          letterSpacing: '-0.02em',
          display: 'grid',
          placeItems: 'center',
          mb: 5,
          color: '#0061B1',
        }}
      >
        {'Verification master'.toUpperCase()}
      </Typography>
      <Stack direction="row" mb={2} justifyContent={'flex-end'}>
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
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.verificationPartnerCode}
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
