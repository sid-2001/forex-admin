import { Button, Stack, IconButton, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useEffect, useState, useMemo } from 'react'

import ServiceFormDialog from '../../components/serviceDialog'
import ServiceMasterService from '../../services/service-master.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import dayjs from 'dayjs'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'

export default function ServiceManagement() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const serviceService = useMemo(() => new ServiceMasterService(), [])
  const local_service = useMemo(() => new LocalStorageService(), [])
  // Inside your function component at the top
  const [alertOpen, setAlertOpen] = useRecoilState(alertState)
  const [alertText, setAlertText] = useRecoilState(alertTextState)
  const [alertType, setAlertType] = useRecoilState(alertTypeState)

  // Then add the helper function
  const showAlert = (type: 'Success' | 'Fail', text: string) => {
    setAlertType(type)
    setAlertText(text)
    setAlertOpen(true)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await serviceService.getServiceList()
      const responseData = res?.data || res
      if (Array.isArray(responseData)) {
        setRows(responseData)
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
        active: data.active || true,
      }
      await serviceService.createService(payload)
      showAlert('Success', '✨ Service created successfully!')
      setOpen(false)
      fetchData()
    } catch (e: any) {
      console.error(e)
      showAlert('Fail', e.message || 'Operation failed')
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
        showAlert('Success', 'Service updated successfully!')
        fetchData()
      }
    } catch (err) {
      console.error('Update API failed:', err)
      showAlert('Fail', 'Unable to update record' + ' ' + err)
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

    try {
      console.log('Calling API with ID:', id)
      const res = await serviceService.deleteService(id, false)
      console.log('Delete Response:', res)
      fetchData()
    } catch (e) {
      console.error('Network Error during delete:', e)
    }
  }
  const formatTableDate = (dateString: string) => {
    if (!dateString) return ''
    const storedConfig = localStorage.getItem('countryConfig')
    let format = 'YYYY-MM-DD'

    if (storedConfig) {
      const config = JSON.parse(storedConfig)
      format = config.dateFormat.replace(/d/g, 'D').replace(/y/g, 'Y')
    }
    console.log(format, 'dkjhbcvy')
    return dayjs(dateString).format(format.toUpperCase())
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
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          // color: 'text.primary',
          letterSpacing: '-0.02em',
          display: 'grid',
          placeItems: 'center',
          mb: 5,
          color: '#0061B1',
        }}
      >
        {'Service Master'.toUpperCase()}
      </Typography>
      <Stack direction="row" justifyContent="flex-end" mb={2} style={{ marginRight: -75 }}>
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
