import { useEffect, useState } from 'react'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'

import BopCategoryTypeFormDialog from '../../components/bopcategorytypedialog'
import BopCategoryTypeService from '../../services/bop.category.type.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { BopCategoryType } from '../../types/bop.type'
import { formatTableDate } from '@/helpers/dateformate'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'

export default function BopCategoryTypeMaster() {
  const [rows, setRows] = useState<BopCategoryType[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<BopCategoryType | any>(null)
  const [isFormChanged, setIsFormChanged] = useState(false)

  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, setType] = useRecoilState(alertTypeState)

  const service = new BopCategoryTypeService()
  const localService = new LocalStorageService()
  const helper = new HelperService()

  // Then add the helper function
  const showAlert = (type: 'Success' | 'Fail') => {
    //@ts-ignore
    setAlertType(type)
    //@ts-ignore

    setAlertOpen(true)
  }

  const fetchData = async () => {
    const res = await service.getAll()
    setRows(res)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (data: any) => {
    const res = await service.create({
      ...data,
      createdBy: localService.get_staff_id(),
    })

    if (res?.status) {
      setType('Success')
      setText(res?.message)
    } else {
      setType('Fail')
      setText('Server Error')
    }
    setOpen(true)
    setDialogOpen(false)
    setIsFormChanged(false)
    fetchData()
  }

  const handleUpdate = async (data: any) => {
    const res = await service.update(editData!.bopCategoryTypeCode, {
      ...data,
      modifiedBy: localService.get_staff_id(),
    })

    if (res?.status) {
      setType('Success')
      setText('BOP Category Type Updated Successfully')
    } else {
      setType('Fail')
      setText('Server Error')
    }
    setOpen(true)
    setDialogOpen(false)
    setEditData(null)
    setIsFormChanged(false)
    fetchData()
  }

  const handleDelete = async (row: BopCategoryType) => {
    await service.delete(row.bopCategoryTypeCode)
    fetchData()
  }

  // Function to handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false)
    setIsFormChanged(false)
    setEditData(null)
  }

  // Function to handle form data changes from dialog
  const handleFormChange = (changed: boolean) => {
    setIsFormChanged(changed)
  }

  // Function to download CSV
  const downloadCSV = () => {
    if (!rows || rows.length === 0) {
      //@ts-ignore
      showAlert('Fail', 'No data to export')
      return
    }

    // Define CSV headers
    const headers = ['Code', 'Type', 'Description', 'Active', 'Effective From', 'Effective To']

    // Map data to CSV rows
    const csvRows = rows.map((row) => [
      row.bopCategoryTypeCode,
      row.bopCategoryType,
      row.bopCategoryDescription,
      row.active ? 'Yes' : 'No',
      //@ts-ignore
      formatTableDate(row.effectiveFromDate || row.effectivefromdate),
      //@ts-ignore
      formatTableDate(row.effectiveToDate || row.effectivetodate),
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')), // Wrap cells in quotes to handle commas in content
    ].join('\n')

    // Create and download the file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }) // Add BOM for UTF-8
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `bop_category_types_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    //@ts-ignore

    showAlert('Success', 'CSV downloaded successfully')
  }

  const columns: GridColDef[] = [
    { field: 'bopCategoryTypeCode', headerName: 'Code', flex: 0.5, headerClassName: 'super-app-theme--header' },
    { field: 'bopCategoryType', headerName: 'Type', flex: 0.6, headerClassName: 'super-app-theme--header' },
    { field: 'bopCategoryDescription', headerName: 'Description', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'active',
      headerName: 'Active',
      width: 120,
      renderCell: (p) => (p.value ? 'Yes' : 'No'),
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'effective_from_date',
      headerName: 'Effective From',
      flex: 1,
      minWidth: 150,
      headerClassName: 'super-app-theme--header',
      //@
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
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => {
              setEditData(params.row)
              setDialogOpen(true)
              setIsFormChanged(false)
            }}
            disabled={!helper.checkUserHasPermission(localService.get_modules()?.MASTER_DATA, 'canUpdate')}
          >
            <EditIcon />
          </IconButton>
          {/* <IconButton onClick={() => handleDelete(params.row)}>
            <DeleteIcon color="error" />
          </IconButton> */}
        </>
      ),
    },
  ]

  // Custom toolbar with CSV download button
  const CustomToolbar = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
        <GridToolbar />
      </Box>
    )
  }

  return (
    <HasPermission permission={'canRead'} module={localService.get_modules()?.MASTER_DATA}>
      <Box p={2} sx={{ width: '85vw' }}>
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
            {'Bop Category Type Master'.toUpperCase()}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setEditData(null)
              setDialogOpen(true)
              setIsFormChanged(false)
            }}
            disabled={!helper.checkUserHasPermission(localService.get_modules()?.MASTER_DATA, 'canCreate')}
          >
            Add
          </Button>
        </Stack>

        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.bopCategoryTypeCode}
          autoHeight
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

        <BopCategoryTypeFormDialog
          open={dialogOpen}
          editData={editData}
          onClose={handleDialogClose}
          onSubmit={editData ? handleUpdate : handleCreate}
          onFormChange={handleFormChange}
          isUpdateDisabled={editData ? !isFormChanged : false}
        />
      </Box>
    </HasPermission>
  )
}
