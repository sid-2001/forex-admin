import { Button, Stack, IconButton, Box } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import { useEffect, useState, useMemo, useCallback } from 'react'

import SmsTemplateDialog from '../../components/smsDialog'
import SmsTemplateService from '../../services/sms.service'
import { LocalStorageService } from '@/helpers/local-storage-service'

export default function SmsTemplateManagement() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errMassage, setErrMasage] = useState(null)

  const smsService = useMemo(() => new SmsTemplateService(), [])
  const local_service = useMemo(() => new LocalStorageService(), [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await smsService.getTemplateList()
      const responseData = res?.data || res
      if (Array.isArray(responseData)) {
        setRows([...responseData])
      } else {
        setRows([])
      }
    } catch (error) {
      console.error('Error fetching SMS templates:', error)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [smsService])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreate = async (data: any) => {
    try {
      const payload = {
        ...data,
        createdBy: local_service?.get_staff_id() || 'APSNGGGN3624',
      }
      const res = await smsService.createTemplate(payload)
      if (res.status == false) {
        setErrMasage(res.message)
        return
      }
      setOpen(false)
      setEditData(null)
      fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdate = async (data: any) => {
    const id = editData?.smsTemplateCode
    const payload = {
      ...data,
      modifiedBy: local_service?.get_staff_id() || 'APSNGGGN3624',
    }

    try {
      await smsService.updateTemplate(id, payload)
      setOpen(false)
      setEditData(null)
      fetchData()
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const columns: GridColDef[] = [
    { field: 'smsTemplateCode', headerName: 'SMS Code', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'smsTemplateDescription', headerName: 'Description', flex: 2, headerClassName: 'super-app-theme--header' },
    { field: 'countryCode', headerName: 'Country', flex: 0.8, headerClassName: 'super-app-theme--header' },
    {
      field: 'active',
      headerName: 'Active',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      renderCell: (p) => (p.value ? 'Yes' : 'No'),
    },
    { field: 'effectiveFromDate', headerName: 'From', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'effectiveToDate', headerName: 'To', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <IconButton
          color="primary"
          onClick={() => {
            setEditData(params.row)
            setOpen(true)
          }}
        >
          <EditIcon />
        </IconButton>
      ),
    },
  ]

  return (
    <Box sx={{ p: 0 }}>
      <Stack direction="row" justifyContent="flex-start" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setOpen(true)
          }}
        >
          Add SMS Template
        </Button>
      </Stack>

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.smsTemplateCode}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
        />
      </Box>

      {open && (
        <SmsTemplateDialog
          key={editData ? editData.smsTemplateCode : 'new-sms'}
          open={open}
          onClose={() => {
            setOpen(false)
            setEditData(null)
          }}
          editData={editData}
          onSubmit={editData ? handleUpdate : handleCreate}
          errMassage={errMassage}
        />
      )}
    </Box>
  )
}
