import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import RoleModal from '../../components/roleModal';
import axios from 'axios';
import { Box, Button, Grid } from '@mui/material';
import { UserService } from '@/services/user.service';

const RoleManagementPage = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const[open,setOpen]=useState(false)

  let api_service=new UserService()


  const fetchRoles = () => {
    api_service.getRolesList().then(data=>{

        console.log(data)
        setRoles(data)
    })
    // axios.get('/api/roles') 
    //   .then((res) => setRoles(res.data))
    //   .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSave = (updatedRole:any) => {


    api_service.addRole(updatedRole)

    // axios.put(`/api/roles/${updatedRole.roleId}`, updatedRole) // 🔁 Replace with your PUT API
    //   .then(() => {
    //     alert('Role updated successfully');
    //     setSelectedRole(null);
    //     fetchRoles(); // Refresh list
    //   })
    //   .catch((err) => console.error(err));
  };

  return (
    <>
      <h2> Roles</h2>
      <div style={{ height: 400 ,width:'80vw'}}>
        <Grid container>
<Grid xs={12}>

    <Button variant='contained' sx={{mb:2}} onClick={()=>{
setSelectedRole(null)
//@ts-ignore
setSelectedRole("create")

    }}>

         Add Role
    </Button>
</Grid>
        </Grid>
        <Box sx={{

             '& .super-app-theme--header': {
            backgroundColor: '#005099',
            color: 'white',
          
          },
          height:"33vw"
        }}>



        <DataGrid
          rows={roles}
          //@ts-ignore
          columns={[
            { field: 'roleDescription', headerName: 'Role Name', width: 250 ,flex:1, headerClassName: 'super-app-theme--header'},
            { field: 'roleStatus', headerName: 'Status', width: 120 ,flex:1, headerClassName: 'super-app-theme--header'},,
          ]}
          //@ts-ignore//@ts-ignore
          getRowId={(row) => row?.roleId}

            sx={{
              '& .MuiDataGrid-root': {
                border: '1 px solid blue',
              },
              '& .MuiDataGrid-cell': {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
          onRowClick={(params) => setSelectedRole(params.row)}
        />

        </Box>
      </div>

      {selectedRole && (
        <RoleModal
          open={!!selectedRole}
          initialData={selectedRole}
          onClose={() => setSelectedRole(null)}
          onSave={handleSave}
        />
      )}




    </>

    
  );
};

export default RoleManagementPage;
