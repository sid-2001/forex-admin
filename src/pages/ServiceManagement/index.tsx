import { Button, Stack, IconButton, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import { useEffect, useState, useMemo } from 'react'

import ServiceFormDialog from '../../components/serviceDialog'
import ServiceMasterService from '../../services/service-master.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { formatTableDate } from '@/helpers/dateformate'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'

export default function ServiceManagement() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const serviceService = useMemo(() => new ServiceMasterService(), [])
  const local_service = useMemo(() => new LocalStorageService(), [])
  const helper = new HelperService()

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
    const id = row.serviceCodeGenerated || row.id

    if (!id) {
      alert('Error: ID not found for this row.')
      return
    }

    try {
      const res = await serviceService.deleteService(id, false)
      fetchData()
    } catch (e) {
      console.error('Network Error during delete:', e)
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
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
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
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Stack direction="row" justifyContent="space-between" mb={2} style={{ marginRight: -75 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            // color: 'text.primary',
            letterSpacing: '-0.02em',
            display: 'grid',
            placeItems: 'center',
            // mb: 5,
            color: '#0061B1',
          }}
        >
          {'Service Master'.toUpperCase()}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setOpen(true)
          }}
          disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
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
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          disableColumnMenu
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
    </HasPermission>
  )
}
