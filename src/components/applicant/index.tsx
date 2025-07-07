import React from 'react'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'

interface Applicant {
  applicantId: string
  firstName: string
  lastName: string
  gender: string
  dob: string
  residenceCountry: string
  applicantCreatedDate: string
}

interface Props {
  data: {
    applicant: Applicant
  }[]
}

const ApplicantDataGrid: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate()

  // Convert the input into DataGrid rows
  const rows = data.map((item) => ({
    id: item.applicant.applicantId,
    ...item.applicant,
  }))

  const columns: GridColDef[] = [
    {
      field: 'applicantId',
      headerName: 'Applicant ID',
      flex: 1,
      headerClassName: 'super-app-theme--header',

      renderCell: (params: GridRenderCellParams) => (
        <span style={{ color: '#1976d2', cursor: 'pointer' }} onClick={() => navigate(`/applicant-details/${params.value}`)}>
          {params.value}
        </span>
      ),
    },
    {
      field: 'firstName',
      headerName: 'First Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    { field: 'lastName', headerName: 'Last Name', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'gender', headerName: 'Gender', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'dob',
      headerName: 'DOB',
      flex: 1,
      valueFormatter: (params) =>
        //@ts-ignore
        params.value,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'residenceCountry',
      headerName: 'Residence Country',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
  ]

  return (
    <Box
      sx={{
        width: '80vw',
        height: '70vh',
        '& .super-app-theme--header': {
          backgroundColor: '#005099',
          color: 'white',
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        pageSizeOptions={[10]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10, page: 0 } },
        }}
      />
    </Box>
  )
}

export default ApplicantDataGrid
