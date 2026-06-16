import { Button, Stack, IconButton, Box, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import { useEffect, useState, useMemo, useCallback } from 'react'

import EmailTemplateMasterDialog from '../../components/emailTemplateMasterDialog'
import EmailTemplateService from '../../services/email-template.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { formatTableDate } from '@/helpers/dateformate'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'

export default function EmailTemplateManagement() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errMassage, setErrMasage] = useState(null)

  const emailService = useMemo(() => new EmailTemplateService(), [])
  const local_service = useMemo(() => new LocalStorageService(), [])
  const helper = new HelperService()
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
      showAlert('Success', 'Updated successfully')
      setOpen(false)
      fetchData()
    } catch (err) {
      showAlert('Fail', 'Please see the fields' + err)
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
      showAlert('Success', res.message)
      setOpen(false)
      fetchData()
    } catch (err) {
      console.error(err)
      showAlert('Fail', 'Please see the fields' + err)
    }
  }

  const columns: GridColDef[] = [
    { field: 'emailTemplateCode', headerName: 'Code', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'templateName', headerName: 'Name', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'emailSubject', headerName: 'Subject', flex: 1.5, headerClassName: 'super-app-theme--header' },
    { field: 'fromEmail', headerName: 'From', flex: 1.2, headerClassName: 'super-app-theme--header' },
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
          disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
        >
          <EditIcon />
        </IconButton>
      ),
    },
  ]

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box>
        <Stack direction="row" mb={2} mt={2} justifyContent={'space-between'}>
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
            {'Email master'.toUpperCase()}
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
        <div style={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.emailTemplateCode}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true } }}
            disableColumnMenu
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
    </HasPermission>
  )
}
