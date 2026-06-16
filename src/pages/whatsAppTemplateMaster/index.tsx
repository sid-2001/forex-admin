import { Button, Stack, IconButton, Box, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DownloadIcon from '@mui/icons-material/Download'
import { useEffect, useState, useMemo, useCallback } from 'react'
import WhatsappTemplateDialog from '../../components/whatsAppDialog'
import WhatsappTemplateService from '../../services/whatsapp.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { formatTableDate } from '@/helpers/dateformate'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'

export default function WhatsappTemplateManagement() {
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isFormChanged, setIsFormChanged] = useState(false)

  const [, setAlertOpen] = useRecoilState(alertState)
  const [, setAlertText] = useRecoilState(alertTextState)
  const [, setAlertType] = useRecoilState(alertTypeState)

  const templateService = useMemo(() => new WhatsappTemplateService(), [])
  const local_service = useMemo(() => new LocalStorageService(), [])
  const helper = new HelperService()

  const showAlert = (type: 'Success' | 'Fail', text: string) => {
    setAlertType(type)
    setAlertText(text)
    setAlertOpen(true)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await templateService.getTemplateList()
      const responseData = res?.data || res
      console.log(responseData, 'dknhicb')
      setRows(Array.isArray(responseData) ? responseData : [])
    } catch (error) {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [templateService])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAction = async (data: any, isUpdate: boolean) => {
    try {
      // Original payload structure preserved exactly
      const payload = {
        countryCode: data.countryCode,
        whatsappTemplateDescription: data.whatsappTemplateDescription,
        active: data.active,
        effectiveFromDate: data.effectiveFromDate,
        effectiveToDate: data.effectiveToDate,
        [isUpdate ? 'modifiedBy' : 'createdBy']: local_service?.get_staff_id() || 'admin',
      }

      const res = isUpdate
        ? await templateService.updateTemplate(editData?.whatsappTemplateCode, payload)
        : await templateService.createTemplate(payload)

      if (res.status !== false) {
        showAlert('Success', `${res?.message || 'Operation completed successfully'}`)
        setOpen(false)
        setEditData(null)
        setIsFormChanged(false)
        fetchData()
      } else {
        showAlert('Fail', res.message || 'Server Error')
      }
    } catch (e) {
      showAlert('Fail', 'Connection Error')
    }
  }

  // Custom toolbar with CSV download button
  const CustomToolbar = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
        <GridToolbar />
      </Box>
    )
  }

  const handleDialogClose = () => {
    setOpen(false)
    setIsFormChanged(false)
    setEditData(null)
  }

  const handleFormChange = (changed: boolean) => {
    setIsFormChanged(changed)
  }

  const columns: GridColDef[] = [
    { field: 'whatsappTemplateCode', headerName: 'Template Code', flex: 0.8, headerClassName: 'super-app-theme--header' },
    { field: 'whatsappTemplateDescription', headerName: 'Description', flex: 1.5, headerClassName: 'super-app-theme--header' },
    { field: 'countryCode', headerName: 'Country', flex: 0.5, headerClassName: 'super-app-theme--header' },
    {
      field: 'effective_from_date',
      headerName: 'Effective From',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectiveFromDate || params.row?.effective_from_date),
    },
    {
      field: 'effective_to_date',
      headerName: 'Effective To',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectiveToDate || params.row?.effective_to_date),
    },
    {
      field: 'active',
      headerName: 'Active',
      flex: 0.4,
      headerClassName: 'super-app-theme--header',
      renderCell: (p) => (p.value ? 'Yes' : 'No'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      headerClassName: 'super-app-theme--header',
      sortable: false,
      renderCell: (params) => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => {
            setEditData(params.row)
            setOpen(true)
            setIsFormChanged(false)
          }}
          disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3} sx={{ width: '100%', '& .super-app-theme--header': { fontWeight: 'bold' } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.02em',
              display: 'grid',
              placeItems: 'center',
              color: '#0061B1',
            }}
          >
            {'WhatsApp Master'.toUpperCase()}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setEditData(null)
              setOpen(true)
              setIsFormChanged(false)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
          >
            Add
          </Button>
        </Stack>

        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.whatsappTemplateCode || Math.random()}
          autoHeight
          disableRowSelectionOnClick
          slots={{ toolbar: CustomToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          disableColumnMenu
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
        />

        <WhatsappTemplateDialog
          open={open}
          onClose={handleDialogClose}
          editData={editData}
          onSubmit={(data: any) => handleAction(data, !!editData)}
          onFormChange={handleFormChange}
          isUpdateDisabled={editData ? !isFormChanged : false}
        />
      </Box>
    </HasPermission>
  )
}
