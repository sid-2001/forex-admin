import { Button, Stack, IconButton, Box, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import { useEffect, useState, useMemo, useCallback } from 'react'

import EmailTemplateMasterDialog from '../../components/emailTemplateMasterDialog'
import EmailTemplateService from '../../services/email-template.service'
import { LocalStorageService } from '@/helpers/local-storage-service'

export default function EmailTemplateManagement() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errMassage, setErrMasage] = useState(null)

  const emailService = useMemo(() => new EmailTemplateService(), [])
  const local_service = useMemo(() => new LocalStorageService(), [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await emailService.getTemplateList()
      const responseData = res?.data || res
      if (Array.isArray(responseData)) {
        setRows([...responseData])
      } else {
        setRows([])
      }
    } catch (error) {
      console.error('Error fetching email templates:', error)
    } finally {
      setLoading(false)
    }
  }, [emailService])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleUpdate = async (data: any) => {
    // Note: API uses the EMTNG... code for the URL parameter
    const id = editData?.emailTemplateCode
    try {
      await emailService.updateTemplate(id, { ...data, modifiedBy: local_service?.get_staff_id() || 'APSNGGGN3624' })
      setOpen(false)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreate = async (data: any) => {
    try {
      const res = await emailService.createTemplate({ ...data, createdBy: local_service?.get_staff_id() || 'APSNGGGN3624' })
      if (res.status == false) {
        setErrMasage(res.message)
        return
      }
      setOpen(false)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const columns: GridColDef[] = [
    { field: 'emailTemplateCode', headerName: 'Code', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'templateName', headerName: 'Name', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'emailSubject', headerName: 'Subject', flex: 1.5, headerClassName: 'super-app-theme--header' },
    { field: 'fromEmail', headerName: 'From', flex: 1.2, headerClassName: 'super-app-theme--header' },
    { field: 'active', headerName: 'Active', flex: 0.6, renderCell: (p) => (p.value ? 'Yes' : 'No'), headerClassName: 'super-app-theme--header' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
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
    <Box>
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
        {'Email master'.toUpperCase()}
      </Typography>
      <Stack direction="row" mb={2} mt={2} justifyContent={'flex-end'}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setOpen(true)
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
          getRowId={(row) => row.emailTemplateCode}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
        />
      </div>
      {open && (
        <EmailTemplateMasterDialog
          key={editData ? editData.emailTemplateCode : 'new'}
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
