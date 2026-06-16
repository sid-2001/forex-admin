import { Button, Stack, IconButton, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import { useEffect, useState, useMemo } from 'react'

import SubServiceFormDialog from '../../components/subServiceDialog'
import SubServiceService from '../../services/sub-service.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { formatTableDate } from '@/helpers/dateformate'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'

export default function SubServiceManagement() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const subService = useMemo(() => new SubServiceService(), [])
  const local_service = useMemo(() => new LocalStorageService(), [])
  const helper = new HelperService()

  const [alertOpen, setAlertOpen] = useRecoilState(alertState)
  const [alertText, setAlertText] = useRecoilState(alertTextState)
  const [alertType, setAlertType] = useRecoilState(alertTypeState)

  const showAlert = (type: 'Success' | 'Fail', text: string) => {
    setAlertType(type)
    setAlertText(text)
    setAlertOpen(true)
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await subService.getSubServiceList()
      const responseData = res?.data || res
      console.log(responseData)
      setRows(Array.isArray(responseData) ? responseData : [])
    } catch (error) {
      console.error('Error fetching sub-services:', error)
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
        ...data,
        createdBy: local_service?.get_staff_id() || 'APSNGGGN3654',
      }
      let res = await subService.createSubService(payload)
      setOpen(false)
      showAlert('Success', `${res.message}`)
      // showAlert('Success', '✨ Sub-Service added  successfully')
      fetchData()
    } catch (e) {
      console.error(e)
      showAlert('Fail', 'Creation failed' + ' ' + e)
    }
  }

  const handleUpdate = async (data: any) => {
    const id = editData?.subServiceCodeGenerated || editData?.id
    if (!id) return alert('ID missing')

    let res = await subService.updateSubService(id, { ...data, subServiceCode: id, modifiedBy: local_service.get_staff_id() })
    setOpen(false)
    showAlert('Success', `${res.message}`)
    fetchData()
  }

  const handleDelete = async (row: any) => {
    const id = row.subServiceCodeGenerated || row.id
    if (window.confirm(`Delete ${id}?`)) {
      await subService.deleteSubService(id)
      fetchData()
    }
  }

  const columns: GridColDef[] = [
    { field: 'subServiceCodeGenerated', headerName: 'Sub Service Code', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'subServiceName', headerName: 'Sub Service Name', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'countryCode', headerName: 'Country', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'active', headerName: 'Active', flex: 0.7, renderCell: (p) => (p.value ? 'Yes' : 'No'), headerClassName: 'super-app-theme--header' },
    // {
    //   field: 'effective_from_date',
    //   headerName: 'Effective From',
    //   flex: 1,
    //   minWidth: 150,

    //   // formatTableDate(params.row?.effectivefromdate || params.row?.effectiveFromDate)
    //   valueGetter: (params) => {
    //     console.log(params)
    //     const date =
    //       params?.row?.effectivefromdate ||
    //       params?.row?.effectiveFromDate
    //       console.log(date)
    //     return date ? formatTableDate(date) : ''
    //   },
    // },

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
    // {
    //   field: 'effective_to_date',
    //   headerName: 'Effective To',
    //   flex: 1,
    //   minWidth: 150,
    //   valueGetter: (params) => {
    //     const date =
    //       params?.row?.effectivetodate ||
    //       params?.row?.effectiveToDate
    //       console.log(date)
    //     return date ? formatTableDate(date) : ''
    //   },
    // },
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
      <Stack direction="row" justifyContent="space-between" mb={2} mt={2} style={{ marginRight: -75 }}>
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
          {'Sub Service Master'.toUpperCase()}
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
          getRowId={(row) => row.subServiceCodeGenerated || Math.random()}
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

      {open && (
        <SubServiceFormDialog open={open} onClose={() => setOpen(false)} editData={editData} onSubmit={editData ? handleUpdate : handleCreate} />
      )}
    </HasPermission>
  )
}
