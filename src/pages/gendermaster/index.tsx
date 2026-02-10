// // import { useEffect, useState, useMemo, useCallback } from 'react'
// // import { Box, Button, IconButton, Stack } from '@mui/material'
// // import { DataGrid, GridColDef } from '@mui/x-data-grid'
// // import EditIcon from '@mui/icons-material/Edit'
// // import DeleteIcon from '@mui/icons-material/Delete'
// // import GenderFormDialog from '../../components/genderFormDialog'
// // import GenderService from '@/services/gender.service'
// // import { LocalStorageService } from '@/helpers/local-storage-service'
// // import { useRecoilState } from 'recoil'
// // import { alertState, alertTextState, alertTypeState } from '@/states/state'
// // import ConfirmModal from '@/components/ConfirmModal'

// // export default function GenderMaster() {
// //   const [rows, setRows] = useState<any[]>([])
// //   const [dialogopen, setDialogopen] = useState(false)
// //   const [open, setOpen] = useRecoilState(alertState)
// //   const [text, setText] = useRecoilState(alertTextState)
// //   const [type, settype] = useRecoilState(alertTypeState)
// //   const [deleteModalOpen, setDeleteModalOpen] = useState(false)
// //   const [selectedRow, setSelectedRow] = useState<any>(null)
// //   const [editData, setEditData] = useState<any>(null)

// //   const local_service = useMemo(() => new LocalStorageService(), [])
// //   const static_service = useMemo(() => new GenderService(), [])

// //   const fetchData = useCallback(async () => {
// //     const res: any = await static_service.getGenderList()
// //     const responseData = res?.data || res
// //     setRows(Array.isArray(responseData) ? responseData : [])
// //   }, [static_service])

// //   useEffect(() => {
// //     fetchData()
// //   }, [fetchData])

// //   const showAlert = (alertType: 'Success' | 'Fail', alertText: string) => {
// //     settype(alertType)
// //     setText(alertText)
// //     setOpen(true)
// //   }

// //   const handleAction = async (data: any, isUpdate: boolean) => {
// //     if (data.validationError) {
// //       showAlert('Fail', data.validationError)
// //       return
// //     }

// //     const payload = {
// //       applicant_id: local_service?.get_staff_id(),
// //       gendercode: data.gendercode,
// //       description: data.description,
// //       countrycode: data.selectedCountry,
// //       active: data.active,
// //       effectivefromdate: `${data.effectiveFrom}T00:00:00.000Z`,
// //       effectivetodate: `${data.effectiveTo}T23:59:59.000Z`,
// //     }

// //     //@ts-ignore
// //     const response: any = isUpdate ? await static_service.updateGender(payload) : await static_service.createGender(payload)

// //     if (response?.success === true || response?.status === 'Success') {
// //       showAlert('Success', `Gender ${isUpdate ? 'Updated' : 'Created'} Successfully`)
// //       setDialogopen(false)
// //       fetchData()
// //     } else {
// //       showAlert('Fail', response?.message || 'Server Error')
// //     }
// //   }

// //   const columns: GridColDef[] = [
// //     { field: 'gendercode', headerName: 'Code', width: 80, headerClassName: 'super-app-theme--header' },
// //     { field: 'description', headerName: 'Description', flex: 1, headerClassName: 'super-app-theme--header' },
// //     { field: 'countrycode', headerName: 'Country', width: 100, headerClassName: 'super-app-theme--header' },
// //     {
// //       field: 'effectivefromdate',
// //       headerName: 'Effective From',
// //       flex: 0.7,
// //       headerClassName: 'super-app-theme--header',
// //       // We use renderCell instead of valueFormatter for maximum reliability
// //       renderCell: (params) => {
// //         const val = params.row?.effectivefromdate
// //         return val ? val.split('T')[0] : ''
// //       },
// //     },
// //     {
// //       field: 'effectivetodate',
// //       headerName: 'Effective To',
// //       flex: 0.7,
// //       headerClassName: 'super-app-theme--header',
// //       renderCell: (params) => {
// //         const val = params.row?.effectivetodate
// //         return val ? val.split('T')[0] : ''
// //       },
// //     },
// //     {
// //       field: 'active',
// //       headerName: 'Active',
// //       width: 100,
// //       renderCell: (params) => (params.value ? 'Yes' : 'No'),
// //       headerClassName: 'super-app-theme--header',
// //     },
// //     {
// //       field: 'actions',
// //       headerName: 'Actions',
// //       width: 120,
// //       headerClassName: 'super-app-theme--header',
// //       renderCell: (params) => (
// //         <Stack direction="row" spacing={1}>
// //           <IconButton
// //             onClick={() => {
// //               setEditData(params.row)
// //               setDialogopen(true)
// //             }}
// //             color="primary"
// //           >
// //             <EditIcon />
// //           </IconButton>
// //           {/* <IconButton
// //             onClick={() => {
// //               setSelectedRow(params.row)
// //               setDeleteModalOpen(true)
// //             }}
// //             color="error"
// //           >
// //             <DeleteIcon />
// //           </IconButton> */}
// //         </Stack>
// //       ),
// //     },
// //   ]

// //   return (
// //     <Box p={3} sx={{ width: '100%' }}>
// //       <Stack direction="row" justifyContent="space-between" mb={2}>
// //         <Button
// //           variant="contained"
// //           onClick={() => {
// //             setEditData(null)
// //             setDialogopen(true)
// //           }}
// //         >
// //           Add Gender
// //         </Button>
// //       </Stack>

// //       <DataGrid rows={rows} columns={columns} getRowId={(row: any) => `${row.gendercode}-${row.countrycode}`} autoHeight disableRowSelectionOnClick />

// //       <GenderFormDialog
// //         open={dialogopen}
// //         onClose={() => setDialogopen(false)}
// //         editData={editData}
// //         onSubmit={(data: any) => handleAction(data, !!editData)}
// //       />

// //       <ConfirmModal
// //         open={deleteModalOpen}
// //         onClose={() => setDeleteModalOpen(false)}
// //         onConfirm={async () => {
// //           await static_service.deleteGender({ gendercode: selectedRow.gendercode, countrycode: selectedRow.countrycode })
// //           showAlert('Success', 'Deleted Successfully')
// //           setDeleteModalOpen(false)
// //           fetchData()
// //         }}
// //         title="Delete Gender?"
// //         message={`Delete ${selectedRow?.gendercode}?`}
// //       />
// //     </Box>
// //   )
// // }
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
//   Checkbox,
//   FormControlLabel,
//   Grid,
//   Autocomplete,
//   createFilterOptions,
// } from '@mui/material'
// import { useState, useEffect, useMemo } from 'react'
// import { useRecoilState } from 'recoil'
// import { countyState } from '@/states/state'
// import dayjs from 'dayjs'

// const filter = createFilterOptions({
//   matchFrom: 'any',
//   stringify: (o: any) => `${o.countryName} ${o.countryCode}`,
// })

// export default function GenderFormDialog({ open, onClose, onSubmit, editData }: any) {
//   const [countries] = useRecoilState(countyState)

//   // Get dynamic date format for display hints
//   const displayDateFormat = useMemo(() => {
//     const storedConfig = localStorage.getItem('countryConfig')
//     if (storedConfig) {
//       const config = JSON.parse(storedConfig)
//       return config.dateFormat // e.g., "dd-MM-yyyy"
//     }
//     return 'yyyy-mm-dd'
//   }, [])

//   const [form, setForm] = useState({
//     gendercode: '',
//     description: '',
//     selectedCountry: '',
//     effectiveFrom: '',
//     effectiveTo: '',
//     active: true,
//   })

//   const [errors, setErrors] = useState<any>({})

//   useEffect(() => {
//     if (editData && open) {
//       const fDate = editData.effectivefromdate || editData.effectiveFromDate || ''
//       const tDate = editData.effectivetodate || editData.effectiveToDate || ''

//       setForm({
//         gendercode: editData.gendercode || '',
//         description: editData.description || '',
//         selectedCountry: editData.countrycode || '',
//         // HTML5 Date input strictly requires YYYY-MM-DD
//         effectiveFrom: fDate ? dayjs(fDate).format('YYYY-MM-DD') : '',
//         effectiveTo: tDate ? dayjs(tDate).format('YYYY-MM-DD') : '',
//         active: editData.active ?? true,
//       })
//     } else {
//       setForm({ gendercode: '', description: '', selectedCountry: '', effectiveFrom: '', effectiveTo: '', active: true })
//     }
//     setErrors({})
//   }, [editData, open])

//   const handleSubmit = () => {
//     const newErrors: any = {}
//     if (!form.gendercode.trim()) newErrors.gendercode = 'Required'
//     if (!form.description.trim()) newErrors.description = 'Required'
//     if (!form.selectedCountry) newErrors.selectedCountry = 'Required'
//     if (!form.effectiveFrom) newErrors.effectiveFrom = 'Required'
//     if (!form.effectiveTo) newErrors.effectiveTo = 'Required'

//     setErrors(newErrors)
//     if (Object.keys(newErrors).length > 0) return

//     if (new Date(form.effectiveTo) < new Date(form.effectiveFrom)) {
//       onSubmit({ validationError: 'End Date cannot be less than Start Date' })
//       return
//     }

//     onSubmit(form)
//   }

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
//         {editData ? 'Update Gender' : 'Add Gender'}
//       </DialogTitle>
//       <DialogContent dividers>
//         <Grid container spacing={2} sx={{ mt: 0.5 }}>
//           <Grid item xs={12}>
//             <Autocomplete
//               options={countries?.filter((c: any) => c.status === 'A') || []}
//               filterOptions={filter}
//               getOptionLabel={(o: any) => `${o.countryName} (${o.countryCode})`}
//               value={countries?.find((c: any) => c.countryCode === form.selectedCountry) || null}
//               disabled={!!editData}
//               onChange={(_, val) => setForm({ ...form, selectedCountry: val ? val.countryCode : '' })}
//               renderInput={(p) => (
//                 <TextField
//                   {...p}
//                   label="Country"
//                   error={!!errors.selectedCountry}
//                   helperText={errors.selectedCountry}
//                 />
//               )}
//             />
//           </Grid>

//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label="Gender Code"
//               inputProps={{ maxLength: 1 }}
//               value={form.gendercode}
//               disabled={!!editData}
//               onChange={(e) => setForm({ ...form, gendercode: e.target.value.toUpperCase() })}
//               error={!!errors.gendercode}
//               helperText={errors.gendercode}
//             />
//           </Grid>

//           <Grid item xs={12}>
//             <TextField
//               fullWidth
//               label="Description"
//               inputProps={{ maxLength: 15 }}
//               value={form.description}
//               onChange={(e) => setForm({ ...form, description: e.target.value })}
//               error={!!errors.description}
//               helperText={errors.description}
//             />
//           </Grid>

//           <Grid item xs={6}>
//             <TextField
//               fullWidth
//               type="date"
//               label="Effective From"
//               InputLabelProps={{ shrink: true }}
//               value={form.effectiveFrom}
//               onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
//               error={!!errors.effectiveFrom}
//               // Displaying the dynamic format as a hint to the user
//               helperText={errors.effectiveFrom || `Format: ${displayDateFormat}`}
//             />
//           </Grid>

//           <Grid item xs={6}>
//             <TextField
//               fullWidth
//               type="date"
//               label="Effective To"
//               InputLabelProps={{ shrink: true }}
//               value={form.effectiveTo}
//               onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })}
//               error={!!errors.effectiveTo}
//               helperText={errors.effectiveTo || `Format: ${displayDateFormat}`}
//               inputProps={{ min: form.effectiveFrom }}
//             />
//           </Grid>

//           <Grid item xs={12}>
//             <FormControlLabel
//               control={
//                 <Checkbox
//                   checked={form.active}
//                   onChange={(e) => setForm({ ...form, active: e.target.checked })}
//                 />
//               }
//               label="Active Status"
//             />
//           </Grid>
//         </Grid>
//       </DialogContent>
//       <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
//         <Button onClick={onClose} color="inherit">
//           Cancel
//         </Button>
//         <Button variant="contained" onClick={handleSubmit}>
//           {editData ? 'Update' : 'Create'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   )
// }
import { useEffect, useState, useMemo, useCallback } from 'react'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import GenderFormDialog from '../../components/genderFormDialog'
import GenderService from '@/services/gender.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import ConfirmModal from '@/components/ConfirmModal'
import dayjs from 'dayjs'

export default function GenderMaster() {
  const [rows, setRows] = useState<any[]>([])
  const [dialogopen, setDialogopen] = useState(false)
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [editData, setEditData] = useState<any>(null)

  const local_service = useMemo(() => new LocalStorageService(), [])
  const static_service = useMemo(() => new GenderService(), [])

  // 1. Dynamic Date Formatter based on LocalStorage
  const formatTableDate = (dateString: string) => {
    if (!dateString) return ''
    const storedConfig = localStorage.getItem('countryConfig')
    let format = 'YYYY-MM-DD' // Default fallback

    if (storedConfig) {
      const config = JSON.parse(storedConfig)
      // Convert backend "dd-MM-yyyy" to dayjs "DD-MM-YYYY"
      format = config.dateFormat.replace(/d/g, 'D').replace(/y/g, 'Y')
    }
    return dayjs(dateString).format(format)
  }

  const fetchData = useCallback(async () => {
    const res: any = await static_service.getGenderList()
    const responseData = res?.data || res
    setRows(Array.isArray(responseData) ? responseData : [])
  }, [static_service])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const showAlert = (alertType: 'Success' | 'Fail', alertText: string) => {
    settype(alertType)
    setText(alertText)
    setOpen(true)
  }

  const handleAction = async (data: any, isUpdate: boolean) => {
    if (data.validationError) {
      showAlert('Fail', data.validationError)
      return
    }

    const payload = {
      applicant_id: local_service?.get_staff_id(),
      gendercode: data.gendercode,
      description: data.description,
      countrycode: data.selectedCountry,
      active: data.active,
      effectivefromdate: `${data.effectiveFrom}T00:00:00.000Z`,
      effectivetodate: `${data.effectiveTo}T23:59:59.000Z`,
    }

    //@ts-ignore
    const response: any = isUpdate ? await static_service.updateGender(payload) : await static_service.createGender(payload)

    if (response?.success === true || response?.status === 'Success' || response?.status === true) {
      showAlert('Success', `Gender ${isUpdate ? 'Updated' : 'Created'} Successfully`)
      setDialogopen(false)
      fetchData()
    } else {
      showAlert('Fail', response?.message || 'Server Error')
    }
  }

  const columns: GridColDef[] = [
    { field: 'gendercode', headerName: 'Code', width: 80, headerClassName: 'super-app-theme--header' },
    { field: 'description', headerName: 'Description', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'countrycode', headerName: 'Country', width: 100, headerClassName: 'super-app-theme--header' },
    {
      field: 'effectivefromdate',
      headerName: 'Effective From',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectivefromdate || params.row?.effectiveFromDate),
    },
    {
      field: 'effectivetodate',
      headerName: 'Effective To',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => formatTableDate(params.row?.effectivetodate || params.row?.effectiveToDate),
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
            onClick={() => {
              setEditData(params.row)
              setDialogopen(true)
            }}
            color="primary"
          >
            <EditIcon />
          </IconButton>
        </Stack>
      ),
    },
  ]

  return (
    <Box p={3} sx={{ width: '100%' }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          // color: 'text.primary',
          letterSpacing: '-0.02em',
          display: 'grid',
          placeItems: 'center',
          mb: 5,
          color: '#0061B1',
        }}
      >
        {'Gender Master'.toUpperCase()}
      </Typography>
      {/* <Stack direction="row" justifyContent="space-between" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setDialogopen(true)
          }}
        >
          Add Gender
        </Button>
      </Stack> */}
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null)
            setDialogopen(true)
          }}
        >
          Add
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row: any) => `${row.gendercode}-${row.countrycode}`}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[5]}
        sx={{
          '& .super-app-theme--header': {
            // backgroundColor: 'rgba(0, 0, 0, 0.05)',
            fontWeight: 'bold',
          },
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5, // Default to 5
            },
          },
        }}
      />

      <GenderFormDialog
        open={dialogopen}
        onClose={() => setDialogopen(false)}
        editData={editData}
        onSubmit={(data: any) => handleAction(data, !!editData)}
      />

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          await static_service.deleteGender({ gendercode: selectedRow.gendercode, countrycode: selectedRow.countrycode })
          showAlert('Success', 'Deleted Successfully')
          setDeleteModalOpen(false)
          fetchData()
        }}
        title="Delete Gender?"
        message={`Delete ${selectedRow?.gendercode}?`}
      />
    </Box>
  )
}
