import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Switch, Box, Typography, Grid, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { UserService } from '@/services/user.service';
import HasPermission from '@/components/permissionWrapper';
import { LocalStorageService } from '@/helpers/local-storage-service';
import { HelperService } from '@/helpers/helper';

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
  const [staffList, setStaffList] = useState<any>([]);

  let navigate = useNavigate()
  const user_service = new UserService();
  const local_service = new LocalStorageService();
  const helper_service = new HelperService();

  // const toggleActive = (id: number) => {
  //   setRows(prev =>
  //     prev.map(row =>
  //       row.id === id ? { ...row, active: !row.active } : row
  //     )
  //   );
  // };

  const fetchAllStaffList = async () => {
    try {
      const response = await user_service.getAllStaffList()
      setStaffList(response);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  useEffect(() => {
    fetchAllStaffList()
  }, [])

  const columns: GridColDef[] = [
    { field: 'staffId', headerName: 'Staff ID', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'id1', headerName: 'Name', flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => { return `${params.row.staffFirstName} ${params.row.staffLastName}` }
    },
    { field: 'roleDescription', headerName: 'Role', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'staffBranch', headerName: 'Staff Branch', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'staffContactNumber', headerName: 'Contact', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'staffCountry', headerName: 'Country', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'username', headerName: 'Username', flex: 1, headerClassName: 'super-app-theme--header' },

    { field: 'email', headerName: 'Email', flex: 1, headerClassName: 'super-app-theme--header' },
    // {
    //   field: 'active',
    //   headerName: 'Active',
    //   width: 100,
    //   //@ts-ignore

    //   valueGetter: (params) => (params?.row?.active ? 'Yes' : 'No'),
    //   headerClassName: 'super-app-theme--header'
    // },
    // {
    //   field: 'action',
    //   headerName: 'Action',
    //   width: 120,
    //   sortable: false,
    //   renderCell: (params: GridRenderCellParams) => (
    //     <Switch
    //       checked={params.row.active}
    //       onChange={() => toggleActive(params.row.id)}
    //       color="primary"
    //     />
    //   )
    //   , headerClassName: 'super-app-theme--header'
    // },
    {
      field: 'viewmore',
      headerName: 'View More',
      width: 120,
      sortable: false,
      //@ts-ignore
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          onClick={() => {
            navigate(`/profile/edit/${params.row.staffId}`)
          }}
          sx={{
            mt: 2,
            color: "grey",
            textDecoration: "underline",
            cursor: 'pointer'
          }}

        >View More</Typography>
      )
      , headerClassName: 'super-app-theme--header'
    },
  ];

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.STAFF}>
      <Box sx={{ width: '80vw' }}>
      <Grid item xs={12} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          disabled={!helper_service.checkUserHasPermission(local_service.get_modules()?.STAFF,'canCreate')}
          onClick={() => {
            navigate('/profile/add')
          }}>
          Add User
        </Button>
      </Grid>
      <StyledDataGrid
        rows={staffList || []}
        columns={columns}
        //@ts-ignore
        pageSize={5}
        disableRowSelectionOnClick
        getRowId={(row) => row.staffId}
      />
    </Box>
    </HasPermission>
  );
};

export default UserTable;
