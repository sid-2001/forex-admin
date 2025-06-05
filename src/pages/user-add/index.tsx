import React, { useState, useEffect } from 'react';
import {
  Box, Grid, TextField, Typography, Button, Switch,
  MenuItem
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import HasPermission from '@/components/permissionWrapper';
import { LocalStorageService } from '@/helpers/local-storage-service';

import { Modules, UserService } from '@/services/user.service';
import { StaffProfile } from '@/types/staff.type';
import { alertState, alertTextState, alertTypeState } from '@/states/state';
import { useRecoilState } from 'recoil';
import { HelperService } from '@/helpers/helper';

//@ts-ignore
function sortAscending(arr, key) {
  return [...arr].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];

    // Handle numbers
    if (typeof valA === "number" && typeof valB === "number") {
      return valA - valB;
    }

    // Handle strings (case-insensitive)
    return String(valA).localeCompare(String(valB), undefined, { sensitivity: 'base' });
  });
}

const inputLabelStyle = {
  color: "black", textDecoration: "bold",
  fontWeight: 800, fontStyle: "bold"
}

const UserAdd = () => {

  //@ts-ignore
  const [staffData, setStaffData] = useState<StaffProfile>({ "staffIdNumber": "14-5678-9012", "staffIdType": "Aadhar" })
  const [countrieslist] = useState(['USA', 'Canada', 'India']);
  const [flows] = useState(['Onboarding', 'Approval', 'Checkout']);
  const [roles, setRoles] = useState<any>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [modulePermissons, setModulePermisson] = useState<Array<Modules>>([])
  const [open, setOpen] = useRecoilState(alertState);
  const [text, setText] = useRecoilState(alertTextState);
  const [type, settype] = useRecoilState(alertTypeState);
  const [isEditable, setIsEditable] = useState(true);
  const local_service = new LocalStorageService()
  const user_service = new UserService();
  const helper_service = new HelperService();

  const { staffId } = useParams();


  const navigate = useNavigate()

  const handleToggleChangePermisson = (
    //@ts-ignore
    id, field) => {
    //@ts-ignore

    var new_permisson_data;
    console.log(permissions)
    let full_data = JSON.parse(JSON.stringify(permissions));


    let find_handels = full_data.filter(
      //@ts-ignore
      e => e.id === id)

    if (find_handels.length > 0) {

      let changed_row = find_handels[0]

      changed_row[field] = !changed_row[field]

      let remaning_data = full_data.filter(
        //@ts-ignore
        e => e.id != id)
      if (remaning_data.length > 0) {
        new_permisson_data = [...remaning_data, changed_row]




      }
      else {

        new_permisson_data = [changed_row]

      }

      let sorted = new_permisson_data.sort((a, b) => a.id - b.id);
      console.log(sorted)

      setPermissions(
        //@ts-ignore
        sortAscending(new_permisson_data, id)
      )
    }






    let permisson_data = new_permisson_data?.map((e: any) => ({
      //@ts-ignore
      moduleDescription: e?.responsibility,
      moduleId: e?.id,
      moduleStatus: true,
      access: {
        canCreate: e?.create,
        canRead: e?.read,
        canUpdate: e?.update,
        canDelete: e?.delete // Consider renaming this if 'view' is not truly 'delete'
      }
    }));

    setModulePermisson(permisson_data as any)
    setStaffData({
      ...staffData,
      "roleId": selectedRole,
      //@ts-ignore

      "specialAccessModules": permisson_data, "roleId": Number(selectedRole)
    });
  };


  const columns = [
    {
      field: 'responsibility',
      headerClassName: 'super-app-theme--header'
      ,
      headerName: 'Modules', flex: 1
    },
    ...['create', 'read', 'update', 'delete'].map((field) => ({
      field,
      headerName: field.charAt(0).toUpperCase() + field.slice(1),
      headerClassName: 'super-app-theme--header',
      width: 100,
      //@ts-ignore

      renderCell: (params) => (
        <>
          {/* <span>{ params}</span> */}
          <Switch
            checked={params.row[field]}
            onChange={() => handleToggleChangePermisson(params.row.id, field)}
          />
        </>
      ),
    })),
  ];

  const fetchRolesList = async () => {
    try {
      let response = await user_service.getAllRolesData()
      setRoles(response);

    } catch (error) {
      console.error("Error fetching roles data:", error);
    }
  }
  const fetchStaffDetailsByStaffId = async () => {
    if (!staffId) {
      console.error("Staff ID is missing in the URL");
      return;
    }
    try {
      let response: StaffProfile = await user_service.getStaffDetailsById(staffId)

      setSelectedRole(
        //@ts-ignore
        response?.roleId)

      setStaffData(response);
      setModulePermisson(
        //@ts-ignore
        response?.modules)

      const initialPermissions = response?.modules?.map(
        //@ts-ignore
        (res, index) => ({
          id: res.moduleId,
          //@ts-ignore
          responsibility: res.moduleName,
          create: res.access.canCreate,
          read: res.access.canRead,
          update: res.access.canUpdate,


          delete: res.access.canDelete
        }));

      setPermissions(
        //@ts-ignore
        initialPermissions.sort(e => e.id))

    } catch (error) {
      console.error("Error fetching staff data:", error);
    }
  }

  useEffect(() => {
    fetchRolesList()
  }, [])

  useEffect(() => {
    if (staffId) {
      fetchStaffDetailsByStaffId()
    }
  }, [staffId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: any; value: any }>) => {
    const { name, value } = e.target
    setStaffData((prev: any) => ({
      ...prev,
      [name]: value,
    }))
  }

  const disableButton = () => {
    if (staffId) {
      return !helper_service.checkUserHasPermission(local_service.get_modules()?.STAFF, 'canUpdate')
    } else {
      return !helper_service.checkUserHasPermission(local_service.get_modules()?.STAFF, 'canCreate')
    }
  }


  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.STAFF}>
      <Box sx={{ width: "50vw" }}>
        <Typography mb={2} variant="h5" gutterBottom sx={{ fontWeight: 'bold', }}>
          Staff Details
        </Typography>


        <Box sx={{ width: '80vw' }}>
          <Grid container spacing={2} mb={2} >

            <Grid item xs={12} sm={4}>
              <label style={inputLabelStyle}>First Name</label>
              <TextField
                value={staffData?.staffFirstName || ""}
                onChange={handleChange}
                fullWidth
                name="staffFirstName"
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <label style={inputLabelStyle}>Last Name</label>
              <TextField
                value={staffData?.staffLastName || ""}
                onChange={handleChange}
                name="staffLastName"
                fullWidth
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <label style={inputLabelStyle}>Branch</label>
              <TextField
                value={staffData?.staffBranch || ''}
                onChange={handleChange}
                name="staffBranch"
                fullWidth
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <label style={inputLabelStyle}>Phone</label>
              <TextField
                value={staffData?.staffContactNumber || ""}
                onChange={handleChange}
                name="staffContactNumber"
                fullWidth

                type='number'
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <label style={inputLabelStyle}>Email</label>
              <TextField
                value={staffData?.email || ""}
                onChange={handleChange}
                name="email"
                type='email'
                fullWidth
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <label style={inputLabelStyle}> <b>
                Password
              </b></label>
              <TextField
                fullWidth
                type='password'
                name="password"
                value={
                  //@ts-ignore
                  staffData?.password || ""}
                onChange={handleChange}

                disabled={staffId ? true : false}
              // InputProps={{ readOnly: !isEditable }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <label style={inputLabelStyle}>
                Username
              </label>
              <TextField
                fullWidth
                name='username'
                value={staffData?.username || ""}
                onChange={handleChange}
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>
          </Grid>

        </Box>

        <Box sx={{ width: "80vw" }}>
          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={6}>
              <label style={inputLabelStyle}>
                Address Line 1
              </label>
              <TextField
                fullWidth
                name="staffAddressLine1"
                value={staffData?.staffAddressLine1 || ''}
                onChange={handleChange}
              // InputProps={{ readOnly: !isEditable }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <label style={inputLabelStyle}>
                Address Line 2
              </label>
              <TextField
                fullWidth
                name="staffAddressLine2"
                value={staffData?.staffAddressLine2 || ''}
                onChange={handleChange}
              // InputProps={{ readOnly: !isEditable }}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <label style={inputLabelStyle}>
                Suburb
              </label>
              <TextField
                name="staffSuburb"
                value={staffData?.staffSuburb || ''}
                onChange={handleChange}
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <label style={inputLabelStyle}>
                City
              </label>
              <TextField
                fullWidth
                name="staffCity"
                value={staffData?.staffCity || ''}
                onChange={handleChange}
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <label style={inputLabelStyle}>
                Postal Code
              </label>
              <TextField
                fullWidth
                name="staffPostalCode"
                value={staffData?.staffPostalCode || ''}
                onChange={handleChange}
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <label style={inputLabelStyle}>
                Country
              </label>
              <TextField
                fullWidth
                value={staffData?.staffCountry || ''}
                name="staffCountry"
                onChange={handleChange}
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={2}>
          {/* Role Select */}
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Select Role"
              fullWidth
              variant="filled"
              value={selectedRole}
              onChange={(e) => {

                setSelectedRole(e.target.value)


                user_service.getRole(e?.target?.value).then(data => {

                  console.log(data)
                  const initialPermissions = data?.modules?.map(
                    //@ts-ignore
                    (res, index) => ({
                      id: res.moduleId,
                      responsibility: res.moduleName,
                      create: res.access.canCreate,
                      read: res.access.canRead,
                      update: res.access.canUpdate,

                      delete: res.access.canDelete
                    }));



                  console.log(initialPermissions)


                  setPermissions(initialPermissions.sort(
                    //@ts-ignore
                    e => e.id))


                  let permisson_data = initialPermissions.sort(
                    //@ts-ignore
                    e => e.id).map((e: any) => ({
                      //@ts-ignore
                      moduleDescription: e?.responsibility,
                      moduleId: e?.id,
                      moduleStatus: true,
                      access: {
                        canCreate: e?.create,
                        canRead: e?.read,
                        canUpdate: e?.update,
                        canDelete: e?.delete // Consider renaming this if 'view' is not truly 'delete'
                      }
                    }));


                  setStaffData({
                    ...staffData,
                    //@ts-ignore

                    "specialAccessModules": permisson_data, "roleId": Number(selectedRole)
                  });



                })

              }}
              sx={{
                '& .MuiFilledInput-root': {
                  backgroundColor: 'white',
                },
              }}
            >
              {roles.map((role: any) => (
                <MenuItem key={role.roleId} value={role.roleId}>
                  {role.roleDescription}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Country Select */}
          {/* <Grid item xs={12} sm={4}>
            <TextField
              select
              disabled
              label="Select Country"
              fullWidth
              sx={{
                '& .MuiFilledInput-root': {
                  backgroundColor: 'white',
                },
              }}
              variant="filled"
              defaultValue=""
            >
              {countrieslist.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </TextField>
          </Grid> */}

          {/* Flow Select */}
          {/* <Grid item xs={12} sm={4}>
          <TextField
            select
            disabled
            type='disabled'
            label="Select Flow"
            fullWidth
            variant="filled"
            defaultValue=""
            sx={{
              '& .MuiFilledInput-root': {
                backgroundColor: 'white',
              },
            }}
          >
            {flows.map((flow) => (
              <MenuItem key={flow} value={flow}>
                {flow}
              </MenuItem>
            ))}
          </TextField>
    
    
    
        </Grid> */}
          <Button
            sx={{
              mt: 2,
              ml: 2
            }}
            variant="outlined"
            disabled={disableButton()}
            onClick={() => {



              if (staffId) {

                //@ts-ignore
                delete staffData?.password;

                user_service.editStaff({ ...staffData, "roleId": selectedRole }, staffData?.staffId).then(data => {

                  console.log(data)


                  if (data) {

                    settype('success')
                    setText("Succesfully Updated Staff")



                  }
                  else {

                    setText(data?.message)
                    settype("error")

                    // settype('success')
                  }
                  setTimeout(() => {
                    window.location.reload();
                  }, 1233);

                  setOpen(true)


                })
              }
              else {

                user_service.createStaff({
                  ...staffData, "staffIdNumber": "14-5678-9012",
                  "staffIdType": "Aadhar", "roleId": selectedRole,
                }).then(data => {

                  if (data?.status == "true") {


                    settype('success')
                    setText("Succesfully created Staff")
                    // window.location.reload()
                    navigate("/profile")


                  }
                  else {

                    setText(data?.message)
                    settype("error")

                    settype('success')
                  }
                  setOpen(true)
                })
              }

            }}
          >{staffId ? <>   UPDATE</> : "ADD"}</Button>
        </Grid>

        <Box p={2}>
          {/* DataGrid Appears When a Role Is Selected */}
          {selectedRole && (
            <Box mt={4} height={400} width="80vw">
              <DataGrid
                rows={permissions}
                columns={columns}
                disableRowSelectionOnClick
                hideFooter
                getRowClassName={(params) =>
                  params.indexRelativeToCurrentPage % 2 === 0
                    ? 'even-row'
                    : 'odd-row'
                }
                sx={{
                  '& .even-row': {
                    backgroundColor: '#e3f2fd', // Light blue
                  },
                  '& .odd-row': {
                    backgroundColor: '#ffffff',
                  },

                  '& .super-app-theme--header': {
                    backgroundColor: '#005099',
                    color: 'white',
                  },
                }}
              />
            </Box>
          )}
        </Box>
      </Box>

    </HasPermission>
  );
};

export default UserAdd;
