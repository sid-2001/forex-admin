import { Button, Stack, IconButton } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useEffect, useState, useMemo } from 'react'

import ServiceFormDialog from '../../components/serviceDialog'
import ServiceMasterService from '../../services/service-master.service'
import { LocalStorageService } from '@/helpers/local-storage-service'

export default function ServiceManagement() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const serviceService = useMemo(() => new ServiceMasterService(), [])
  const local_service = useMemo(() => new LocalStorageService(), [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await serviceService.getServiceList()
      const responseData = res?.data || res
      if (Array.isArray(responseData)) {
        setRows(responseData.filter((res) => res.active))
      } else {
        setRows([])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
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
        serviceDescription: data.serviceDescription,
        effectiveFromDate: `${data.effectiveFromDate}`,
        effectiveToDate: `${data.effectiveToDate}`,
        createdBy: local_service?.get_staff_id() || 'APSNGGGN3624',
      }
      await serviceService.createService(payload)
      setOpen(false)
      fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdate = async (data: any) => {
    const id = editData?.serviceCodeGenerated || editData?.id

    if (!id) {
      console.error('Cannot update: Service Code is undefined', editData)
      alert('Error: Service Code is missing from this record.')
      return
    }

    const payload = {
      countryCode: data.countryCode,
      serviceDescription: data.serviceDescription,
      active: data.active,
      effectiveFromDate: `${data.effectiveFromDate}`,
      effectiveToDate: `${data.effectiveToDate}`,
      modifiedBy: local_service?.get_staff_id(),
      modifiedLocalDateTime: new Date().toISOString().split('.')[0],
      modifiedTimezone: 'Asia/Kolkata',
      modifiedOffset: '+05:30',
    }

    try {
      const res = await serviceService.updateService(id, payload)
      if (res) {
        setOpen(false)
        fetchData()
      }
    } catch (err) {
      console.error('Update API failed:', err)
    }
  }

  const handleDelete = async (row: any) => {
    console.log('Row object received for deletion:', row)

    const id = row.serviceCodeGenerated || row.id

    if (!id) {
      console.error('Delete failed: No ID found in row object', row)
      alert('Error: ID not found for this row.')
      return
    }

    if (window.confirm(`Are you sure you want to delete ${id}?`)) {
      try {
        console.log('Calling API with ID:', id)
        const res = await serviceService.deleteService(id, false)
        console.log('Delete Response:', res)
        fetchData()
      } catch (e) {
        console.error('Network Error during delete:', e)
      }
    }
  }

  const columns: GridColDef[] = [
    { field: 'serviceCodeGenerated', headerName: 'Service Code', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'serviceDescription', headerName: 'Description', flex: 2, headerClassName: 'super-app-theme--header' },
    { field: 'countryCode', headerName: 'Country', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'active',
      headerName: 'Active',
      flex: 1,
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
          <IconButton color="error" onClick={() => handleDelete(params.row)}>
            <DeleteIcon />
          </IconButton>
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
          Add Service
        </Button>
      </Stack>

      <div style={{ height: 500, width: '80vw' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.serviceCodeGenerated}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
                  initialState={{
    pagination: {
      paginationModel: {
        page: 0,
        pageSize: 5,
      },
    },
  }}
        />
      </div>

      {open && <ServiceFormDialog open={open} onClose={() => setOpen(false)} editData={editData} onSubmit={editData ? handleUpdate : handleCreate} />}
    </>
  )
}
