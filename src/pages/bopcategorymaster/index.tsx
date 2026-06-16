import { useEffect, useState, useCallback, useMemo } from 'react'
import { Box, Button, IconButton, Stack, Typography, TextField, InputAdornment } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import BopCategoryFormDialog from '../../components/bopcategorydialog'
import BopCategoryService from '../../services/bop.category.service'
import BopCategoryTypeService from '@/services/bop.category.type.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import dayjs from 'dayjs'
import { formatTableDate } from '@/helpers/dateformate'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'

export default function BopCategoryMaster() {
  const [rows, setRows] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [categorylist, setCategorylist] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [, setOpen] = useRecoilState(alertState)
  const [, setText] = useRecoilState(alertTextState)
  const [, setType] = useRecoilState(alertTypeState)

  const service = useMemo(() => new BopCategoryService(), [])
  const bopcategorytypeservice = useMemo(() => new BopCategoryTypeService(), [])
  const local_service = useMemo(() => new LocalStorageService(), [])
  const helper = new HelperService()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await service.getAll()
      // Ensure we handle both {data: []} and raw [] formats
      const data = Array.isArray(res) ? res : res?.data || []
      setRows(data)
    } catch (error) {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [service])

  useEffect(() => {
    bopcategorytypeservice.getAll().then((data) => {
      setCategorylist(Array.isArray(data) ? data : data?.data || [])
      fetchData()
    })
  }, [bopcategorytypeservice, fetchData])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => Object.values(row).some((val) => String(val).toLowerCase().includes(searchQuery.toLowerCase())))
  }, [rows, searchQuery])

  const columns: GridColDef[] = [
    { field: 'bopPurposeCategoryCode', headerName: 'Category Code', flex: 0.7, headerClassName: 'super-app-theme--header' },
    { field: 'countryCode', headerName: 'Country', flex: 0.4, headerClassName: 'super-app-theme--header' },
    { field: 'categoryType', headerName: 'Type', flex: 0.6, headerClassName: 'super-app-theme--header' },
    { field: 'bopPurposeDescription', headerName: 'Description', flex: 1, headerClassName: 'super-app-theme--header' },
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
    { field: 'active', headerName: 'Active', flex: 0.4, headerClassName: 'super-app-theme--header', renderCell: (p) => (p.value ? 'Yes' : 'No') },
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
            setDialogOpen(true)
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
            {'Bop Category Master'.toUpperCase()}
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
          rows={filteredRows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.bopPurposeCategoryCode}
          autoHeight
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          disableColumnMenu
          // initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          // pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
        />

        <BopCategoryFormDialog
          open={dialogOpen}
          editData={editData}
          categorylist={categorylist}
          onClose={() => setDialogOpen(false)}
          refreshList={fetchData}
          showAlert={(type: any, text: any) => {
            setType(type)
            setText(text)
            setOpen(true)
          }}
        />
      </Box>
    </HasPermission>
  )
}
