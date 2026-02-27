// import React, { useEffect, useState, useMemo } from 'react'
// import { Box, Button, IconButton, Stack, Typography, TextField, InputAdornment } from '@mui/material'
// import { DataGrid, GridColDef } from '@mui/x-data-grid'
// import EditIcon from '@mui/icons-material/Edit'
// import DeleteIcon from '@mui/icons-material/Delete'
// import SearchIcon from '@mui/icons-material/Search'
// import VendorApiFormDialog from '../../components/VendorApiFormDialog'
// import VendorApiService from '../../services/vendor.api.service'
// // import { IVendor } from './types'
// import { useRecoilState } from 'recoil'
// import { alertState, alertTextState, alertTypeState } from '@/states/state'
// interface IVendor {
//   vendorCode: string
//   vendorName: string
//   countryCode: string | null
//   currencyCode: string | null
//   vendorAddress1: string | null
//   vendorAddress2: string | null
//   vendorAddress3: string | null
//   vendorCountry: string | null
//   vendorState: string | null
//   vendorZipCode: string | null
//   vendorMobile: string | null
//   vendorAlternateMobile: string | null
//   vendorEmail: string | null
//   vendorAlternateEmail: string | null
//   vendorReferred: string | null
//   vendorType: string | null
//   active: boolean
//   effectiveFromDate: string | null
//   effectiveToDate: string | null
//   createdLocalDateTime?: string | null
//   utcDateTime?: string | null
// }

// export default function VendorApiMaster() {
//   const [rows, setRows] = useState<IVendor[]>([])
//   const [searchQuery, setSearchQuery] = useState('')
//   const [dialogOpen, setDialogOpen] = useState(false)
//   const [editData, setEditData] = useState<IVendor | null>(null)
//   const [loading, setLoading] = useState(false)

//   const [, setOpen] = useRecoilState(alertState)
//   const [, setText] = useRecoilState(alertTextState)
//   const [, setType] = useRecoilState(alertTypeState)

//   const service = useMemo(() => new VendorApiService(), [])

//   const fetchData = async () => {
//     setLoading(true)
//     const data = await service.getAll()
//     setRows(data)
//     setLoading(false)
//   }

//   useEffect(() => {
//     fetchData()
//   }, [])

//   const handleDelete = async (vendorCode: string) => {
//     if (confirm(`Are you sure you want to deactivate vendor ${vendorCode}?`)) {
//       try {
//         await service.delete(vendorCode)
//         setType('success')
//         setText('Vendor Deactivated')
//         setOpen(true)
//         fetchData()
//       } catch (e) {
//         setType('error')
//         setText('Delete failed')
//         setOpen(true)
//       }
//     }
//   }
//   const formatTableDate = (dateString: string) => {
//     if (!dateString) return ''
//     const storedConfig = localStorage.getItem('countryConfig')
//     let format = 'YYYY-MM-DD'

//     if (storedConfig) {
//       const config = JSON.parse(storedConfig)
//       format = config.dateFormat.replace(/d/g, 'D').replace(/y/g, 'Y')
//     }
//     console.log(format, 'dkjhbcvy')
//     return dayjs(dateString).format(format.toUpperCase())
//   }
//   const columns: GridColDef[] = [
//     { field: 'vendorCode', headerName: 'Code', flex: 0.4, headerClassName: 'super-app-theme--header' },
//     { field: 'vendorName', headerName: 'Vendor Name', flex: 1, headerClassName: 'super-app-theme--header' },
//     { field: 'vendorEmail', headerName: 'Email', flex: 0.8, headerClassName: 'super-app-theme--header' },
//     { field: 'vendorMobile', headerName: 'Mobile', flex: 0.6, headerClassName: 'super-app-theme--header' },
//     {
//       field: 'effectiveFromDate',
//       headerName: 'Effective From',
//       flex: 0.8,
//       headerClassName: 'super-app-theme--header',
//       renderCell: (params) => formatTableDate(params.row?.effectivefromdate || params.row?.effectiveFromDate),
//     },
//     {
//       field: 'effectiveToDate',
//       headerName: 'Effective To',
//       flex: 0.8,
//       headerClassName: 'super-app-theme--header',
//       renderCell: (params) => formatTableDate(params.row?.effectivetodate || params.row?.effectiveToDate),
//     },
//     { field: 'vendorType', headerName: 'Type', flex: 0.5, headerClassName: 'super-app-theme--header' },
//     {
//       field: 'active',
//       headerName: 'Status',
//       flex: 0.3,
//       headerClassName: 'super-app-theme--header',
//       renderCell: (p) => (p.value ? 'Active' : 'Inactive'),
//     },
//     {
//       field: 'actions',
//       headerName: 'Actions',
//       width: 120,
//       headerClassName: 'super-app-theme--header',
//       renderCell: (params) => (
//         <Stack direction="row" spacing={1}>
//           <IconButton
//             color="primary"
//             size="small"
//             onClick={() => {
//               setEditData(params.row)
//               setDialogOpen(true)
//             }}
//           >
//             <EditIcon fontSize="small" />
//           </IconButton>
//           <IconButton color="error" size="small" onClick={() => handleDelete(params.row.vendorCode)}>
//             <DeleteIcon fontSize="small" />
//           </IconButton>
//         </Stack>
//       ),
//     },
//   ]

//   const filteredRows = rows.filter((row) => Object.values(row).some((val) => String(val).toLowerCase().includes(searchQuery.toLowerCase())))

//   return (
//     <Box p={3} sx={{ width: '100%', '& .header-bg': { fontWeight: 'bold' } }}>
//       <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#0061B1', textAlign: 'center' }}>
//         VENDOR MASTER MANAGEMENT
//       </Typography>

//       <Stack direction="row" justifyContent="felx-end" mb={2}>
//         {/* <TextField
//           size="small"
//           placeholder="Search vendors..."
//           onChange={(e) => setSearchQuery(e.target.value)}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <SearchIcon />
//               </InputAdornment>
//             ),
//           }}
//         /> */}
//         {/* <T></> */}
//         <Button
//           variant="contained"
//           onClick={() => {
//             setEditData(null)
//             setDialogOpen(true)
//           }}
//         >
//           Add
//         </Button>
//       </Stack>

//       <DataGrid
//         rows={filteredRows}
//         columns={columns}
//         loading={loading}
//         getRowId={(row) => row.vendorCode}
//         autoHeight
//         initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
//       />

//       <VendorApiFormDialog
//         open={dialogOpen}
//         editData={editData}
//         onClose={() => setDialogOpen(false)}
//         refreshList={fetchData}
//         showAlert={(t: any, msg: any) => {
//           setType(t)
//           setText(msg)
//           setOpen(true)
//         }}
//       />
//     </Box>
//   )
// }

import React, { useEffect, useState, useMemo } from 'react'
import { Box, Button, IconButton, Stack, Typography, TextField, InputAdornment } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import VendorApiService, { IVendor } from '../../services/vendor.api.service'
import VendorApiFormDialog from '../../components/VendorApiFormDialog'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'

export default function VendorApiMaster() {
  const [rows, setRows] = useState<IVendor[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<IVendor | null>(null)

  const [, setOpen] = useRecoilState(alertState)
  const [, setText] = useRecoilState(alertTextState)
  const [, setType] = useRecoilState(alertTypeState)

  const service = useMemo(() => new VendorApiService(), [])

  const fetchData = async () => {
    setLoading(true)
    const data = await service.getAll()
    setRows(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const columns: GridColDef[] = [
    { field: 'vendorCode', headerName: 'Code', flex: 0.4, headerClassName: 'super-app-theme--header' },
    { field: 'vendorName', headerName: 'Vendor Name', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'vendorEmail', headerName: 'Email', flex: 0.8, headerClassName: 'super-app-theme--header' },
    {
      field: 'effectiveFromDate',
      headerName: 'Effective From',
      flex: 0.5,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (params.value ? String(params.value).split('T')[0] : '-'),
    },
    {
      field: 'effectiveToDate',
      headerName: 'Effective to',
      flex: 0.5,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (params.value ? String(params.value).split('T')[0] : '-'),
    },
    {
      field: 'active',
      headerName: 'Status',
      flex: 0.4,
      headerClassName: 'super-app-theme--header',
      renderCell: (p) => (p.value ? 'Active' : 'Inactive'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              setEditData(params.row)
              setDialogOpen(true)
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          {/* <IconButton
            color="error"
            size="small"
            onClick={async () => {
              if (confirm(`Deactivate ${params.row.vendorCode}?`)) {
                await service.delete(params.row.vendorCode)
                setType('success')
                setText('Deactivated')
                setOpen(true)
                fetchData()
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton> */}
        </Stack>
      ),
    },
  ]

  const filteredRows = rows.filter((row) => Object.values(row).some((val) => String(val).toLowerCase().includes(searchQuery.toLowerCase())))

  return (
    <Box p={3} sx={{ width: '100%', '& .header-bg': { fontWeight: 'bold', bgcolor: '#f5f5f5' } }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0061B1', textAlign: 'center' }}>
          VENDOR MASTER
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setDialogOpen(true)
          }}
        >
          Add
        </Button>
      </Stack>

      <DataGrid
        rows={filteredRows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.vendorCode}
        autoHeight
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true } }}
        disableColumnMenu
        // initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        sx={{ bgcolor: 'white' }}
      />

      <VendorApiFormDialog
        open={dialogOpen}
        editData={editData}
        onClose={() => setDialogOpen(false)}
        refreshList={fetchData}
        showAlert={(t: any, m: any) => {
          setType(t)
          setText(m)
          setOpen(true)
        }}
      />
    </Box>
  )
}
