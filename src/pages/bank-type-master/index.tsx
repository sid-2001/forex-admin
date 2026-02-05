import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BankTypeDialog from '../../components/bank-type-dialog'
import BankBusinessTypeService, { BankBusinessType } from '../../services/bantypemaster.service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'

export default function BankTypeMaster() {
  const service = useMemo(() => new BankBusinessTypeService(), [])
  const [rows, setRows] = useState<BankBusinessType[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<BankBusinessType | null>(null)

  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, setType] = useRecoilState(alertTypeState)

  const showAlert = (alertType: 'Success' | 'Fail', alertText: string) => {
    setType(alertType)
    setText(alertText)
    setOpen(true)
  }

  const fetchData = useCallback(async () => {
    const res: any = await service.getList()
    const responseData = res?.data || res
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
      valueGetter: (p) =>
        //@ts-ignore
        p.row?.businessTypeCode || p.row?.business_type_code || '',
    },
    { field: 'bankBusinessName', headerName: 'Business Name', flex: 1.2, headerClassName: 'super-app-theme--header' },
    { field: 'businessCurrencyCode', headerName: 'Currency', flex: 0.6, headerClassName: 'super-app-theme--header' },
    { field: 'countryCode', headerName: 'Country', flex: 0.6, headerClassName: 'super-app-theme--header' },
    {
      field: 'effective_from_date',
      headerName: 'Effective From',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const val = params.row?.effective_from_date || params.row?.effectivefromdate
        return val ? val.split('T')[0] : ''
      },
    },
    {
      field: 'effective_to_date',
      headerName: 'Effective To',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const val = params.row?.effective_to_date || params.row?.effectivetodate
        return val ? val.split('T')[0] : ''
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
          >
            <EditIcon />
          </IconButton>
          {/* <IconButton color="error" onClick={() => service.delete(params.row.business_type_code, false).then(fetchData)}>
            <DeleteIcon />
          </IconButton> */}
        </Stack>
      ),
    },
  ]

  return (
    <Box p={3} sx={{ width: '100%', '& .super-app-theme--header': { fontWeight: 'bold' } }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setDialogOpen(true)
          }}
        >
          Add Bank Type
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        getRowId={(row) => `${row.business_type_code || row.businessTypeCode}-${row.countryCode || Math.random()}`}
        columns={columns}
        autoHeight
        disableRowSelectionOnClick
      />

      <BankTypeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editData={editData}
        onSubmit={(data: any) => handleAction(data, !!editData)}
      />
    </Box>
  )
}
