import React, { useEffect, useState } from 'react'
import { DataGrid, GridActionsCellItem, gridClasses } from '@mui/x-data-grid'
import { Container, Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { useNavigate } from 'react-router-dom'
import { DriverService } from '@/services/driver.service'
import DeleteIcon from '@mui/icons-material/Delete'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState, loaderState } from '@/states/state'
import { Replay10 } from '@mui/icons-material'
import Replay10Icon from '@mui/icons-material/Replay10'
import { IconButton } from '@mui/material'

const driverService = new DriverService()

const DriverList = () => {
  const [drivers, setDrivers] = useState([])
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [isEditModalOpen, setEditModalOpen] = useState(false)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, setType] = useRecoilState(alertTypeState)
  const [open, setOpen] = useRecoilState(alertState)
  const [commonloader, setcommonloader] = useRecoilState(loaderState)

  useEffect(() => {
    driverService.getDriverList().then((data) => setDrivers(data as any))
  }, [])

  const handleEditClick = (driver: any) => {
    setSelectedDriver(driver)
    setEditModalOpen(true)
  }
  const handleDeleteDriverClick = (id: any) => {
    // console.log(id)

    setcommonloader(true)
    let driver_service = new DriverService()

    driver_service
      .deleteDriver(id)
      .then((data) => {
        console.log(data)
        setText('Deleted Successfully')
        setType('success')
        setOpen(true)
        setTimeout(() => {
          setOpen(false)
          driverService.getDriverList().then((data) => setDrivers(data as any))
        }, 2000)
      })
      .catch((err) => {
        console.log(err)
      })
    setcommonloader(false)
    setOpen(false)

    setOpen(false)
  }

  const handleModalClose = () => {
    setEditModalOpen(false)
    setSelectedDriver(null)
  }

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setSelectedDriver((prev) => ({
      //@ts-ignore

      ...prev,
      //@ts-ignore
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    if (selectedDriver) {
      try {
        console.log(selectedDriver)
        await driverService.updateDriver(
          {
            //@ts-ignore
            name: selectedDriver.name,
            //@ts-ignore
            transaction_count: selectedDriver.transaction_count,
            //@ts-ignore
            description: selectedDriver.description,
            //@ts-ignore
            is_Active: true,
            updated_at: new Date(),
          },
          //@ts-ignore
          selectedDriver?.uid,
        )
        setDrivers((prevDrivers) =>
          prevDrivers.map((driver) =>
            //@ts-ignore
            driver.uid ===
            //@ts-ignore
            selectedDriver.uid
              ? selectedDriver
              : driver,
          ),
        )
        handleModalClose()
      } catch (error) {
        console.error('Failed to update driver:', error)
      }
    }
  }

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, headerAlign: 'center', headerClassName: 'super-app-theme--header' },
    {
      field: 'transaction_count',
      headerName: 'Transaction Count',
      type: 'number',
      flex: 1,
      headerAlign: 'center',
      headerClassName: 'super-app-theme--header',
    },
    { field: 'description', headerName: 'Description', flex: 1, headerAlign: 'center', headerClassName: 'super-app-theme--header' },
    { field: 'is_Active', headerName: 'Active', type: 'boolean', flex: 1, headerAlign: 'center', headerClassName: 'super-app-theme--header' },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      flex: 0.5,
      getActions: (params: any) => [
        <GridActionsCellItem color="primary" icon={<EditIcon />} label="Edit" onClick={() => handleEditClick(params.row)} showInMenu={false} />,
        <GridActionsCellItem
          color="primary"
          icon={<DeleteIcon />}
          label="Edit"
          onClick={() => handleDeleteDriverClick(params.row.uid)}
          showInMenu={false}
        />,
      ],
      headerClassName: 'super-app-theme--header',
    },
  ]

  const navigate = useNavigate()

  return (
    <Box sx={{ minHeight: '100vh', padding: 2 }}>
      <Container sx={{ width: '100%' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" sx={{ color: '#005099' }}>
            Drivers
            <IconButton
              color="primary"
              onClick={
                //@ts-ignore
                (e: any) => {
                  setcommonloader(true)
                  driverService.refreshDriverList().then((data) => {
                    setDrivers(data as any)
                    setcommonloader(false)
                  })
                }
              }
            >
              <Replay10Icon></Replay10Icon>
            </IconButton>
          </Typography>

          <Button
            variant="contained"
            sx={{
              color: 'white',
              '&:hover': { backgroundColor: '#003e73' },
            }}
            onClick={() => navigate('add')}
          >
            Add Driver
          </Button>
        </Box>
        <Box
          sx={{
            borderRadius: 2,
            boxShadow: 3,
            width: '100%',
            '& .super-app-theme--header': {
              backgroundColor: '#005099',
              color: 'white',
            },
          }}
        >
          <DataGrid
            rows={drivers}
            //@ts-ignore
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            getRowId={(row) =>
              //@ts-ignore

              row.uid
            }
            sx={{
              [`& .${gridClasses.menuIcon}`]: {
                visibility: 'visible',
                width: 'auto',
              },
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#005099', color: 'white', fontWeight: 'bold' },
              '& .MuiDataGrid-cell': { color: '#0d47a1', textAlign: 'center' },
              '& .MuiDataGrid-row': { '&:nth-of-type(even)': { backgroundColor: '#bbdefb' } },
              '& .MuiDataGrid-row:hover': { backgroundColor: '#90caf9', color: 'white' },
            }}
            autoHeight
          />
        </Box>
      </Container>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onClose={handleModalClose} fullWidth>
        {/* <DialogTitle>Edit Driver</DialogTitle> */}
        <DialogContent>
          <TextField
            label="Name"
            name="name"
            value={
              //@ts-ignore
              selectedDriver?.name || ''
            }
            onChange={handleInputChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Transaction Counts"
            name="transaction_count"
            type="number"
            value={
              //@ts-ignore

              selectedDriver?.transaction_count || ''
            }
            onChange={handleInputChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Description"
            name="description"
            //@ts-ignore
            value={selectedDriver?.description || ''}
            onChange={handleInputChange}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DriverList
