import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import BankMasterDialog from '../../components/bank-dialog/BankMasterDialog'
import BankMasterService, { BankMaster } from '../../services/bankmaster.service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { formatTableDate } from '@/helpers/dateformate'
import HasPermission from '@/components/permissionWrapper'
import { HelperService } from '@/helpers/helper'
import { LocalStorageService } from '@/helpers/local-storage-service'

export default function BankMasterScreen() {
  const service = useMemo(() => new BankMasterService(), [])
  const [rows, setRows] = useState<BankMaster[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<BankMaster | null>(null)

  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, setType] = useRecoilState(alertTypeState)
  const helper = new HelperService()
  const local_service = useMemo(() => new LocalStorageService(), [])

  const showAlert = (alertType: 'Success' | 'Fail', alertText: string) => {
    setType(alertType)
    setText(alertText)
    setOpen(true)
  }

  const fetchData = useCallback(async () => {
    try {
      const res: any = await service.getBankList()
      const responseData = res?.data || res
      setRows(Array.isArray(responseData) ? responseData : [])
    } catch (err) {
      console.error('Fetch Error:', err)
    }
  }, [service])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAction = async (data: any, isUpdate: boolean) => {
    if (data.validationError) {
      showAlert('Fail', data.validationError)
      return
    }

    const res = isUpdate ? await service.updateBank(editData!.bankMasterCode, data) : await service.createBank(data)

    if (
      res.status ||
      //@ts-ignore
      res.success
    ) {
      showAlert('Success', `Bank ${isUpdate ? 'Updated' : 'Created'} Successfully`)
      setDialogOpen(false)
      fetchData()
    } else {
      showAlert('Fail', res.message || 'Server Error')
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'bankCode',
      headerName: 'Bank Code',
      flex: 0.7,

      headerClassName: 'super-app-theme--header',
    },
    { field: 'bankName', headerName: 'Bank Name', flex: 1.2, headerClassName: 'super-app-theme--header' },
    { field: 'bankBranchCode', headerName: 'Branch Code', flex: 0.8, headerClassName: 'super-app-theme--header' },
    { field: 'bankIfscBicCode', headerName: 'IFSC/BIC', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'bankCity', headerName: 'City', flex: 0.7, headerClassName: 'super-app-theme--header' },
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
    { field: 'countryCode', headerName: 'Country', flex: 0.6, headerClassName: 'super-app-theme--header' },
    {
      field: 'active',
      headerName: 'Active',
      width: 100,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (params.row?.active ? 'Yes' : 'No'),
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
              letterSpacing: '-0.02em',
              display: 'grid',
              placeItems: 'center',
              color: '#0061B1',
            }}
          >
            {'Bank  Master'.toUpperCase()}
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
          columns={columns}
          getRowId={(row) => row.bankMasterCode || Math.random()}
          autoHeight
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          disableColumnMenu
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5, // Default to 5
              },
            },
          }}
        />

        <BankMasterDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          editData={editData}
          onSubmit={(data: any) => handleAction(data, !!editData)}
        />
      </Box>
    </HasPermission>
  )
}
