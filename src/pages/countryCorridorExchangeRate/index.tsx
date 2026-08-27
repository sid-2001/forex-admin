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
import MasterService from '@/services/master.service'
import CorridorExchangeRateDialog from '@/components/corridorExchangeRateDialog'

export default function CountryCorridorExchangeRateMaster() {
  //   const service = useMemo(() => new BankMasterService(), [])
  const [rows, setRows] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<any | null>(null)

  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, setType] = useRecoilState(alertTypeState)
  const helper = new HelperService()
  const local_service = useMemo(() => new LocalStorageService(), [])
  const master_service = useMemo(() => new MasterService(), [])

  const staffId = local_service?.get_staff_id() || 'admin'

  const showAlert = (alertType: 'Success' | 'Fail', alertText: string) => {
    setType(alertType)
    setText(alertText)
    setOpen(true)
  }

  const fetchCorridorExchangeRatesData = useCallback(async () => {
    try {
      const res: any = await master_service.getAllCountryCorridorExchangeRatesList()
      const responseData = res?.data || res
      setRows(Array.isArray(responseData) ? responseData : [])
    } catch (err) {
      console.error('Fetch Error:', err)
    }
  }, [master_service])

  useEffect(() => {
    fetchCorridorExchangeRatesData()
  }, [fetchCorridorExchangeRatesData])

  const handleAction = async (data: any, isUpdate: boolean) => {
    if (data.validationError) {
      showAlert('Fail', data.validationError)
      return
    }

    const res = isUpdate
      ? await master_service.updateCountryCorridorExchangeRate(editData!.corridorExchangeRateCode, { ...data, modifiedBy: staffId })
      : await master_service.createCountryCorridorExchangeRate({ ...data, createdBy: staffId })

    if (
      res.status ||
      //@ts-ignore
      res.success
    ) {
      showAlert('Success', res.message)
      setDialogOpen(false)
      fetchCorridorExchangeRatesData()
    } else {
      showAlert('Fail', res.message || 'Server Error')
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'corridorExchangeRateCode',
      headerName: 'Corridor Exchange Rate',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return params?.row?.corridorExchangeRateMaster?.corridorExchangeRateCode || ''
      },
    },

    {
      field: 'corridorCode',
      headerName: 'Corridor Code',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return params?.row?.corridorExchangeRateMaster?.countryCorridorMaster?.countryCorridorCode || ''
      },
    },

    { field: 'senderCountry', headerName: 'Sender Country', flex: 1.2, headerClassName: 'super-app-theme--header' },

    { field: 'businessReceivingCountry', headerName: 'Receiving Country', flex: 1.2, headerClassName: 'super-app-theme--header' },
    { field: 'vendorCode', headerName: 'Vendor Code', flex: 0.8, headerClassName: 'super-app-theme--header' },
    {
      field: 'effectiveFromDate',
      headerName: 'Effective From',
      flex: 1,
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      //@ts-ignore
      valueGetter: (value, row) => {
        const date = row?.corridorExchangeRateMaster?.effectiveFromDate

        return date ? formatTableDate(date) : ''
      },
    },
    {
      field: 'effectiveToDate',
      headerName: 'Effective To',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      minWidth: 150,
      //@ts-ignore
      valueGetter: (value, row) => {
        const date = row?.corridorExchangeRateMaster?.effectiveToDate

        return date ? formatTableDate(date) : ''
      },
    },

    {
      field: 'active',
      headerName: 'Active',
      width: 100,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (params?.row?.corridorExchangeRateMaster?.active ? 'Yes' : 'No'),
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
      <Box p={3} sx={{ width: '90vw', '& .super-app-theme--header': { fontWeight: 'bold' } }}>
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
            Country Corridor Exchange Rate Master
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
          getRowId={(row) => row?.corridorExchangeRateMaster?.corridorExchangeRateCode || Math.random()}
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

        <CorridorExchangeRateDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          editData={editData}
          onSubmit={(data: any) => handleAction(data, !!editData)}
        />
      </Box>
    </HasPermission>
  )
}
