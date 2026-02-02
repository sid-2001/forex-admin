import { Button, Stack, IconButton } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useEffect, useState, useMemo } from 'react'

import WhatsappTemplateDialog from '../../components/whatsAppDialog'
import WhatsappTemplateService from '../../services/whatsapp.service'
import { LocalStorageService } from '@/helpers/local-storage-service'

export default function WhatsappTemplateManagement() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const templateService = useMemo(() => new WhatsappTemplateService(), [])
  const local_service = useMemo(() => new LocalStorageService(), [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await templateService.getTemplateList()
      const responseData = res?.data || res
      if (Array.isArray(responseData)) {
        setRows(responseData)
        console.log(responseData, 'jdhgvydg')
      } else {
        setRows([])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (data: any) => {
    try {
      const payload = {
        countryCode: data.countryCode,
        whatsappTemplateDescription: data.whatsappTemplateDescription,
        active: data.active,
        effectiveFromDate: data.effectiveFromDate,
        effectiveToDate: data.effectiveToDate,
        createdBy: local_service?.get_staff_id() || 'APSNGGGN3624',
      }
      await templateService.createTemplate(payload)
      setOpen(false)
      fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  // const handleUpdate = async (data: any) => {
  //   const id = editData?.whatsappTemplateCode

  //   const payload = {
  //     whatsappTemplateDescription: data.whatsappTemplateDescription,
  //     active: data.active,
  //     effectiveFromDate: data.effectiveFromDate,
  //     effectiveToDate: data.effectiveToDate,
  //     modifiedBy: local_service?.get_staff_id() || 'APSNGGGN3624',
  //   }

  //   try {
  //     await templateService.updateTemplate(id, payload)
  //     setOpen(false)
  //     fetchData()
  //   } catch (err) {
  //     console.error('Update failed:', err)
  //   }
  // }
  const handleUpdate = async (data: any) => {
    const id = editData?.whatsappTemplateCode

    const payload = {
      countryCode: data.countryCode,
      whatsappTemplateDescription: data.whatsappTemplateDescription,
      active: data.active,
      effectiveFromDate: data.effectiveFromDate,
      effectiveToDate: data.effectiveToDate,
      modifiedBy: local_service?.get_staff_id() || 'APSNGGGN3624',
    }

    try {
      await templateService.updateTemplate(id, payload)
      setOpen(false)
      fetchData()
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const handleDelete = async (row: any) => {
    const id = row.whatsappTemplateCode
    try {
      await templateService.deleteTemplate(id, false)
      fetchData()
    } catch (e) {
      console.error('Delete failed:', e)
    }
  }

  const columns: GridColDef[] = [
    { field: 'whatsappTemplateCode', headerName: 'Template Code', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'whatsappTemplateDescription', headerName: 'Description', flex: 2, headerClassName: 'super-app-theme--header' },
    { field: 'countryCode', headerName: 'Country', flex: 0.8, headerClassName: 'super-app-theme--header' },
    {
      field: 'active',
      headerName: 'Active',
      flex: 0.7,
      renderCell: (p) => (p.value ? 'Yes' : 'No'),
      headerClassName: 'super-app-theme--header',
    },
    { field: 'effectiveFromDate', headerName: 'From', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'effectiveToDate', headerName: 'To', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            color="primary"
            onClick={() => {
              setEditData(params.row)
              setOpen(true)
            }}
          >
            <EditIcon />
          </IconButton>
          {/* <IconButton color="error" onClick={() => handleDelete(params.row)}>
            <DeleteIcon />
          </IconButton> */}
        </Stack>
      ),
    },
  ]

  return (
    <>
      <Stack direction="row" justifyContent="flex-start" mb={2} mt={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setOpen(true)
          }}
        >
          Add WhatsApp Template
        </Button>
      </Stack>

      <div style={{ height: 500, width: '80vw' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.whatsappTemplateCode}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 5 } },
          }}
        />
      </div>

      {open && (
        <WhatsappTemplateDialog open={open} onClose={() => setOpen(false)} editData={editData} onSubmit={editData ? handleUpdate : handleCreate} />
      )}
    </>
  )
}
