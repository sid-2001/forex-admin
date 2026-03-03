// import { useEffect, useState } from 'react'
// import { Box, Button, IconButton, Stack, Typography, Chip } from '@mui/material'
// import { DataGrid, GridColDef } from '@mui/x-data-grid'
// import EditIcon from '@mui/icons-material/Edit'
// import CountryBusinessPayoutPartnerFormDialog from '../../components/countrybuisnesspayoutformformdialog'
// import CountryBusinessPayoutPartnerService from '@/services/countryBusinessPayoutPartner.service'

// const CountryBusinessPayoutPartner = () => {
//   const [rows, setRows] = useState<any[]>([])
//   const [open, setOpen] = useState(false)
//   const CountryBusinessPayoutPartnerServic = new CountryBusinessPayoutPartnerService()
//   const [editData, setEditData] = useState<any>(null)

//   const fetchData = async () => {
//     const res = await CountryBusinessPayoutPartnerServic.getAll()
//     //@ts-ignore
//     setRows(res || [])
//   }

//   useEffect(() => {
//     fetchData()
//   }, [])

//   const columns: GridColDef[] = [
//     {
//       field: 'countryBusinessPayoutPartnerCode',
//       headerName: 'Code',
//       flex: 1,
//       headerClassName: 'super-app-theme--header',
//     },
//     {
//       field: 'countryCorridorBusinessMapCode',
//       headerName: 'Corridor Business Map',
//       flex: 1,
//       headerClassName: 'super-app-theme--header',
//     },
//     {
//       field: 'businessTypeCode',
//       headerName: 'Business Type',
//       flex: 1,
//       headerClassName: 'super-app-theme--header',
//     },
//     {
//       field: 'payoutPartner',
//       headerName: 'Payout Partner',
//       flex: 1,
//       headerClassName: 'super-app-theme--header',
//     },
//     {
//       field: 'active',
//       headerName: 'Status',
//       flex: 1,
//       renderCell: (params) =>
//         params.value ? <Chip label="Active" color="success" size="small" /> : <Chip label="Inactive" color="default" size="small" />,
//       headerClassName: 'super-app-theme--header',
//     },
//     {
//       field: 'actions',
//       headerName: 'Actions',
//       width: 120,
//       renderCell: (params) => (
//         <IconButton
//           onClick={() => {
//             setEditData(params.row)
//             setOpen(true)
//           }}
//         >
//           <EditIcon />
//         </IconButton>
//       ),
//       headerClassName: 'super-app-theme--header',
//     },
//   ]

//   return (
//     <Box p={2} width="80vw">
//       <Stack direction="row" justifyContent="space-between" mb={2}>
//         <Button
//           variant="contained"
//           onClick={() => {
//             setEditData(null)
//             setOpen(true)
//           }}
//         >
//           Create
//         </Button>
//       </Stack>

//       <DataGrid
//         rows={rows}
//         columns={columns}
//         autoHeight
//         pageSizeOptions={[5, 10]}
//         getRowId={(row) => row.countryBusinessPayoutPartnerCode}
//         initialState={{
//           pagination: {
//             paginationModel: {
//               page: 0,
//               pageSize: 5,
//             },
//           },
//         }}
//       />

//       <CountryBusinessPayoutPartnerFormDialog open={open} handleClose={() => setOpen(false)} editData={editData} refreshList={fetchData} />
//     </Box>
//   )
// }

// export default CountryBusinessPayoutPartner
import { useEffect, useState, useCallback, useMemo } from 'react'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import CountryBusinessPayoutPartnerFormDialog from '../../components/countrybuisnesspayoutformformdialog'
import CountryBusinessPayoutPartnerService from '@/services/countryBusinessPayoutPartner.service'
import dayjs from 'dayjs'

const CountryBusinessPayoutPartner = () => {
  const [rows, setRows] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Recoil Alert States for consistency
  const [, setOpenAlert] = useRecoilState(alertState)
  const [, setAlertText] = useRecoilState(alertTextState)
  const [, setAlertType] = useRecoilState(alertTypeState)

  const service = useMemo(() => new CountryBusinessPayoutPartnerService(), [])

  const showAlert = (type: 'Success' | 'Fail', text: string) => {
    setAlertType(type)
    setAlertText(text)
    setOpenAlert(true)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await service.getAll()
      // Service returns { status, data, message }. We need res.data
      const responseData = res?.data || (Array.isArray(res) ? res : [])
      setRows(responseData)
    } catch (error) {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [service])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const formatDateForTable = (dateStr: any) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  const formatTableDate = (dateString: string) => {
    if (!dateString) return ''
    const storedConfig = localStorage.getItem('countryConfig')
    let format = 'YYYY-MM-DD'

    if (storedConfig) {
      const config = JSON.parse(storedConfig)
      format = config.dateFormat.replace(/d/g, 'D').replace(/y/g, 'Y')
    }
    console.log(format, 'dkjhbcvy')
    return dayjs(dateString).format(format.toUpperCase())
  }

  const columns: GridColDef[] = [
    { field: 'countryBusinessPayoutPartnerCode', headerName: 'Code', flex: 0.7, headerClassName: 'super-app-theme--header' },
    { field: 'countryCorridorBusinessMapCode', headerName: 'Corridor Map', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'businessTypeCode', headerName: 'Business Type', flex: 0.8, headerClassName: 'super-app-theme--header' },
    { field: 'payoutPartner', headerName: 'Partner', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'effective_from_date',
      headerName: 'Effective From',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectivefromdate || params.row?.effectiveFromDate),
    },
    {
      field: 'effective_to_date',
      headerName: 'Effective To',
      flex: 0.8,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectivetodate || params.row?.effectiveToDate),
    },
    {
      field: 'active',
      headerName: 'Active',
      flex: 0.4,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (params.value ? 'Yes' : 'No'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <IconButton
          color="primary"
          size="small"
          onClick={() => {
            setEditData(params.row)
            setOpen(true)
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  return (
    <Box p={3} sx={{ width: '100%', '& .super-app-theme--header': { fontWeight: 'bold' } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
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
          {'Country Business Payout Partner'.toUpperCase()}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {/* Country Business Payout Partner */}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setOpen(true)
          }}
        >
          add
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        autoHeight
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true } }}
        disableColumnMenu
        getRowId={(row) => row.countryBusinessPayoutPartnerCode}
        // initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        // pageSizeOptions={[5, 10]}
      />

      <CountryBusinessPayoutPartnerFormDialog
        open={open}
        handleClose={() => setOpen(false)}
        editData={editData}
        refreshList={fetchData}
        showAlert={showAlert}
      />
    </Box>
  )
}

export default CountryBusinessPayoutPartner
