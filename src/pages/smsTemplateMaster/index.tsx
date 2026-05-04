import { Button, Stack, IconButton, Box, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import { useEffect, useState, useMemo, useCallback } from 'react'

import SmsTemplateDialog from '../../components/smsDialog'
import SmsTemplateService from '../../services/sms.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import dayjs from 'dayjs'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { Success } from '@/assets/images'
import { formatTableDate } from '@/helpers/dateformate'

export default function SmsTemplateManagement() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errMassage, setErrMasage] = useState(null)

  const smsService = useMemo(() => new SmsTemplateService(), [])
  const local_service = useMemo(() => new LocalStorageService(), [])
  const [alertOpen, setAlertOpen] = useRecoilState(alertState)
  const [alertText, setAlertText] = useRecoilState(alertTextState)
  const [alertType, setAlertType] = useRecoilState(alertTypeState)

  // Then add the helper function
  const showAlert = (type: 'Success' | 'Fail', text: string) => {
    setAlertType(type)
    setAlertText(text)
    setAlertOpen(true)
  }

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
        showAlert('Fail', res.message)
        return
      }
      setOpen(false)
      setEditData(null)
      showAlert('Success', res.message)
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
      showAlert('Success', 'Record Updated Successfully')
      setOpen(false)
      setEditData(null)
      fetchData()
    } catch (err) {
      console.error('Update failed:', err)
      showAlert('Fail', 'Please see the fields are correct' + ' ' + err)
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
    // { field: 'effectiveFromDate', headerName: 'Effective From', flex: 1, headerClassName: 'super-app-theme--header' },
    // { field: 'effectiveToDate', headerName: 'Effective To', flex: 1, headerClassName: 'super-app-theme--header' },
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
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.02em',
            display: 'grid',
            placeItems: 'center',
            // mb: 5,
            color: '#0061B1',
          }}
        >
          {'sms master'.toUpperCase()}
        </Typography>
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

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.smsTemplateCode}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          disableColumnMenu
          // pageSizeOptions={[5, 10, 20]}
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
