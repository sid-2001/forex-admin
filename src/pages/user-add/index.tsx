import React, { useState, useEffect } from 'react';
import {
  Box, Grid, TextField, Typography, Button, Switch,
  MenuItem,
} from '@mui/material';
import { useParams } from 'react-router-dom';
// import GradientDivider from '@/components/divider';
import { DataGrid } from '@mui/x-data-grid';
import { UserService } from '@/services/user.service';
import HasPermission from '@/components/permissionWrapper';
import { LocalStorageService } from '@/helpers/local-storage-service';

const local_service = new LocalStorageService();
const user_service = new UserService();

const responsibilities = [
  'Dashboard',
  'Users',
  'Reports',
  'Settings',
];

const inputLabelStyle = {
  color: "black", textDecoration: "bold",
  fontWeight: 800, fontStyle: "bold"
}

const UserAdd = () => {
  const initialPermissions = responsibilities.map((res, index) => ({
    id: index,
    responsibility: res,
    create: false,
    read: false,
    update: false,
    view: false,
  }));
  //@ts-ignore
  const handleToggleChangePermisson = (id, field) => {
    setPermissions((prev) =>
      prev.map((row) =>
        //@ts-ignore
        row.id === id ? { ...row, [field]: !row[field] } : row
      )
    );
  };

  const columns = [
    {
      field: 'responsibility',
      headerClassName: 'super-app-theme--header'
      ,
      headerName: 'Modules', flex: 1
    },
    ...['Create', 'Read', 'Update', 'Delete'].map((field) => ({
      field,
      headerName: field.charAt(0).toUpperCase() + field.slice(1),
      headerClassName: 'super-app-theme--header',
      width: 100,
      //@ts-ignore

      renderCell: (params) => (
        <Switch
          checked={params.row[field]}
          onChange={() => handleToggleChangePermisson(params.row.id, field)}
        />
      ),
    })),
  ];

  const [countrieslist] = useState(['USA', 'Canada', 'India']);
  const [flows] = useState(['Onboarding', 'Approval', 'Checkout']);
  const [roles, setRoles] = useState<any>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [permissions, setPermissions] = useState(initialPermissions);
  const [isEditable, setIsEditable] = useState(true);
  const [isChanged, setIsChanged] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [staffData, setStaffData] = useState<any>({})

  const { staffId } = useParams();

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
      let response = await user_service.getStaffDetailsById(staffId)
      setStaffData(response);

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

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setIsEditable(true);
    } else {
      if (isChanged) {
        setOpenConfirmationDialog(true);
      } else {
        setIsEditable(false);
      }
    }
  };

  const handleSaveChanges = () => {
    if (isChanged) {
      setOpenSaveDialog(true); // Show save confirmation dialog
    } else {
      alert('No changes made to save!');
    }
  };

  const handleSaveConfirm = () => {
    setOpenSaveDialog(false);
    setIsEditable(false);
    console.log("Saved applicant data");
  };

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
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <label style={inputLabelStyle}>Email</label>
              <TextField
                value={staffData?.email || ""}
                onChange={handleChange}
                name="email"
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
                name="password"
                value={staffData?.password || ""}
                onChange={handleChange}
                InputProps={{ readOnly: !isEditable }}
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
                name="staffAddressLine2"
                value={staffData?.staffAddressLine1 || ''}
                onChange={handleChange}
                InputProps={{ readOnly: !isEditable }}
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
                InputProps={{ readOnly: !isEditable }}
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
                name="city"
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

          {/* <GradientDivider
          gradient='#1C58F2,white'
          //@ts-ignore
          width='20'
        ></GradientDivider> */}

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
              onChange={(e) => setSelectedRole(e.target.value)}
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
          <Grid item xs={12} sm={4}>
            <TextField
              select
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
          </Grid>

          {/* Flow Select */}
          <Grid item xs={12} sm={4}>
            <TextField
              select
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
          </Grid>
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
