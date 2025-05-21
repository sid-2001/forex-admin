import React, { useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Switch, Box, Typography, Grid, Button } from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { Navigate, useNavigate } from 'react-router-dom';

interface User {
  id: number;
  userid: string;
  name: string;
  role: string;
  email: string;
  active: boolean;
}

// Sample data
const initialRows: User[] = [
  { id: 1, userid: 'U001', name: 'Alice', role: 'Admin', email: 'alice@example.com', active: true },
  { id: 2, userid: 'U002', name: 'Bob', role: 'User', email: 'bob@example.com', active: false },
  { id: 3, userid: 'U003', name: 'Charlie', role: 'Editor', email: 'charlie@example.com', active: true },
  { id: 4, userid: 'U004', name: 'Diana', role: 'Viewer', email: 'diana@example.com', active: false },
];

const StyledDataGrid = styled(DataGrid)({
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#1976d2', // Blue header
    color: '#fff',
    fontWeight: 'bold',
  },
  '& .MuiDataGrid-row:nth-of-type(even)': {
    backgroundColor: '#e3f2fd', // Light blue alternate rows
  },


    '& .MuiDataGrid-root': {
      border: '1 px solid blue',
    },
    '& .MuiDataGrid-cell': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    '& .super-app-theme--header': {
        backgroundColor: '#005099',
        color: 'white',
      },
});

const UserTable: React.FC = () => {
  const [rows, setRows] = useState<User[]>(initialRows);

  const toggleActive = (id: number) => {
    setRows(prev =>
      prev.map(row =>
        row.id === id ? { ...row, active: !row.active } : row
      )
    );
  };

  let navigate= useNavigate()
  const columns: GridColDef[] = [
    { field: 'userid', headerName: 'User ID', flex:1,headerClassName:'super-app-theme--header'},
    { field: 'name', headerName: 'Name', flex:1, headerClassName:'super-app-theme--header' },
    { field: 'role', headerName: 'Role', flex:1 ,headerClassName:'super-app-theme--header' },
    { field: 'email', headerName: 'Email', flex:1 ,headerClassName:'super-app-theme--header'},
    {
      field: 'active',
      headerName: 'Active',
      width: 100,
        //@ts-ignore

      valueGetter: (params) => (params?.row?.active ? 'Yes' : 'No'),
       headerClassName:'super-app-theme--header'
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Switch
          checked={params.row.active}
          onChange={() => toggleActive(params.row.id)}
          color="primary"
        />
      )
       ,headerClassName:'super-app-theme--header'
    },
    {
        field: 'viewmore',
        headerName: 'View More',
        width: 120,
        sortable: false,
          //@ts-ignore

        renderCell: (params: GridRenderCellParams) => (
        <Typography
        

        onClick={()=>{
            navigate("add-profile")
            
        }}
        sx={{
            mt:2,

            color:"grey",
        textDecoration:"underline",
        cursor:'pointer'
        }} 

        >View More</Typography>
        )
         ,headerClassName:'super-app-theme--header'
      },
  ];


  return (
    <Box sx={{  width: '80vw' }}>


<Grid item xs={12} sx={{

    mb:2
}}>
          <Button
            variant="contained"
            color="primary"
            
            onClick={()=>{
navigate('/profile/add')


            }}
          >
            Add User
          </Button>
        </Grid>
      <StyledDataGrid
        rows={rows}
        columns={columns}
          //@ts-ignore

        pageSize={5}
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default UserTable;
