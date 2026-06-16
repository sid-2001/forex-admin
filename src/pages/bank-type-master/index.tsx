import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BankTypeDialog from '../../components/bank-type-dialog'
import BankBusinessTypeService, { BankBusinessType } from '../../services/bantypemaster.service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import dayjs from 'dayjs'
import { getLiveAuditData } from '@/helpers/dynamicLocations'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { formatTableDate } from '@/helpers/dateformate'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'

export default function BankTypeMaster() {
  const service = useMemo(() => new BankBusinessTypeService(), [])
  const [rows, setRows] = useState<BankBusinessType[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<BankBusinessType | null>(null)
  const local_service = useMemo(() => new LocalStorageService(), [])
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, setType] = useRecoilState(alertTypeState)

  const showAlert = (alertType: 'Success' | 'Fail', alertText: string) => {
    setType(alertType)
    setText(alertText)
    setOpen(true)
  }
  const helper = new HelperService()

  const fetchData = useCallback(async () => {
    const res: any = await service.getList()
    const responseData = res?.data || res
    console.log(responseData, 'responseData')
    setRows(Array.isArray(responseData) ? responseData : [])
  }, [service])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAction = async (data: any, isUpdate: boolean) => {
    if (data.validationError) {
      showAlert('Fail', data.validationError)
      return
    }

    const res = isUpdate
      ? //@ts-ignore
        await service.update(editData?.businessTypeCode || (editData as any)?.business_type_code, data)
      : await service.create(data)

    if (
      res.status ||
      //@ts-ignore
      res.success
    ) {
      showAlert('Success', `Bank Type ${isUpdate ? 'Updated' : 'Created'} Successfully`)
      setDialogOpen(false)
      fetchData()
    } else {
      showAlert('Fail', res.message || 'Server Error')
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'businessTypeCode',
      headerName: 'Code',
      flex: 0.6,
      headerClassName: 'super-app-theme--header',
      renderCell: (p) => p.row?.businessTypeCode || p.row?.businessTypeCode || '',
    },
    { field: 'bankBusinessName', headerName: 'Business Name', flex: 1.2, headerClassName: 'super-app-theme--header' },
    { field: 'businessCurrencyCode', headerName: 'Currency', flex: 0.6, headerClassName: 'super-app-theme--header' },
    { field: 'countryCode', headerName: 'Country', flex: 0.6, headerClassName: 'super-app-theme--header' },
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
      field: 'active',
      headerName: 'Active',
      width: 100,
      renderCell: (params) => (params.value ? 'Yes' : 'No'),
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            color="primary"
            onClick={() => {
              setEditData(params.row)
              setDialogOpen(true)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
          >
            <EditIcon />
          </IconButton>
        </Stack>
      ),
    },
  ]

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3} sx={{ width: '100%', '& .super-app-theme--header': { fontWeight: 'bold' } }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
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
            {'Bank Type Master'.toUpperCase()}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setEditData(null)
              setDialogOpen(true)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
          >
            Add
          </Button>
        </Stack>

        <DataGrid
          rows={rows}
          getRowId={(row) => `${row.business_type_code || row.businessTypeCode}-${row.countryCode || Math.random()}`}
          columns={columns}
          autoHeight
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
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

        <BankTypeDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          editData={editData}
          onSubmit={(data: any) => handleAction(data, !!editData)}
        />
      </Box>
    </HasPermission>
  )
}
