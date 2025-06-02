import React, { useState } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'

const UserPage: React.FC = () => {
  const payload = {
    dataLength: 1,
    success: true,
    data: [
      {
        residentialAddress: {
          address1: 'house no 4 , road streel factory ',
          address2: 'Building no 302',
          city: 'gurugram',
          state: 'Haryana',
          country: 'India',
          zipCode: '987654',
        },
        postalAddress: {
          address1: 'house no 4 , road streel gate ',
          address2: 'Gali  no B - 03',
          city: 'gurugram',
          state: 'haryana',
          country: 'India',
          zipCode: '987654',
        },
        citizenshipDetails: {
          birthCountry: 'India',
          residenceCountry: 'SOUTH AFRICA',
          citizenship: 'INDIAN',
          passportNo: 'S87F8S7F8S7D8F',
        },
        salaryDetails: {
          monthlySalary: '2,33,4443',
          isSalaryAgree: true,
        },
        _id: '67729e446ae77a42f3b56220',
        firstName: 'Pankaj',
        middleName: 'Kumar',
        lastName: 'Sethi',
        email: 'pankaj.tomar@yopmail.com',
        phone: '0909090909',
        gender: 'Female',
        dateOfBirth: '16-Dec-2024',
        role: 'user',
      },
    ],
  }

  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [open, setOpen] = useState(false)

  const handleRowClick = (params: any) => {
    setSelectedUser(params.row)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedUser(null)
  }

  const columns: GridColDef[] = [
    { field: 'firstName', headerName: 'First Name', flex: 1 },
    { field: 'lastName', headerName: 'Last Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    { field: 'gender', headerName: 'Gender', flex: 1 },
    { field: 'role', headerName: 'Role', flex: 1 },
  ]

  const rows = payload.data.map((user) => ({
    id: user._id,
    ...user,
  }))

  return (
    <Box
      p={4}
      sx={{
        // height: '100vh',
        width: '73vw',
        padding: 2,
        '& .super-app-theme--header': {
          backgroundColor: '#005099',
          color: 'white',
        },
        // backgroundColor: theme.palette.primar,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Users
      </Typography>

      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          //@ts-ignore
          pageSize={5}
          onRowClick={handleRowClick}
          sx={{
            '& .MuiDataGrid-row:hover': { backgroundColor: '#f5f5f5' },
          }}
        />
      </Box>

      {/* Modal for User Details */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{selectedUser && `${selectedUser.firstName} ${selectedUser.lastName}'s Details`}</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography variant="h6">Personal Details</Typography>
              <Typography>Gender: {selectedUser.gender}</Typography>
              <Typography>Email: {selectedUser.email}</Typography>
              <Typography>Phone: {selectedUser.phone}</Typography>
              <Typography>Date of Birth: {selectedUser.dateOfBirth}</Typography>

              <Typography variant="h6" mt={2}>
                Residential Address
              </Typography>
              <Typography>
                {selectedUser.residentialAddress.address1}, {selectedUser.residentialAddress.address2}
              </Typography>
              <Typography>
                {selectedUser.residentialAddress.city}, {selectedUser.residentialAddress.state}, {selectedUser.residentialAddress.country},{' '}
                {selectedUser.residentialAddress.zipCode}
              </Typography>

              <Typography variant="h6" mt={2}>
                Citizenship Details
              </Typography>
              <Typography>Citizenship: {selectedUser.citizenshipDetails.citizenship}</Typography>
              <Typography>Passport No: {selectedUser.citizenshipDetails.passportNo}</Typography>

              <Typography variant="h6" mt={2}>
                Salary Details
              </Typography>
              <Typography>Monthly Salary: {selectedUser.salaryDetails.monthlySalary}</Typography>
              <Typography>Agreement: {selectedUser.salaryDetails.isSalaryAgree ? 'Yes' : 'No'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserPage
