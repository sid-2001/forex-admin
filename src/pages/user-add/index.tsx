import React, { useState, useEffect } from 'react'
import { Box, Grid, TextField, Typography, Button, Switch, MenuItem, CircularProgress, ListItemText, ListItemIcon } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { DataGrid } from '@mui/x-data-grid'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { Modules, UserService } from '@/services/user.service'
import { StaffProfile } from '@/types/staff.type'
import { alertState, alertTextState, alertTypeState, countyState } from '@/states/state'
import { useRecoilState } from 'recoil'
import { HelperService } from '@/helpers/helper'
import { useTheme } from '@emotion/react'
import { Chip } from '@mui/material'
import { CheckIcon } from 'lucide-react'
// import PhoneInput from 'react-phone-number-input'

//@ts-ignore
function sortAscending(arr, key) {
  return [...arr].sort((a, b) => {
    const valA = a[key]
    const valB = b[key]

    // Handle numbers
    if (typeof valA === 'number' && typeof valB === 'number') {
      return valA - valB
    }

    // Handle strings (case-insensitive)
    return String(valA).localeCompare(String(valB), undefined, { sensitivity: 'base' })
  })
}

const UserAdd = () => {
  const theme: any = useTheme() // ✅ Move this INSIDE the component

  const inputLabelStyle = {
    color: theme.palette.text.primary,
    fontWeight: 800,
  }
  //@ts-ignore
  const [staffData, setStaffData] = useState<StaffProfile>({ staffIdType: 'Aadhar' })
  const [roles, setRoles] = useState<any>([])
  const [selectedRole, setSelectedRole] = useState('')
  const [permissions, setPermissions] = useState([])
  const [modulePermissons, setModulePermisson] = useState<Array<Modules>>([])
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const [isEditable, setIsEditable] = useState(true)
  const local_service = new LocalStorageService()
  const user_service = new UserService()
  const helper_service = new HelperService()
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [countryList, setCountryList] = useRecoilState(countyState)
  const [branchList, setBranchList] = useState([])
  const userCountry = local_service?.get_staff_country()
  const [loading, setLoading] = useState(true) // ✅ loader state
  const [isbuttondisabled, setIsbuttondisabled] = useState(true)

  const { staffId } = useParams()
  const navigate = useNavigate()
  const postalCodeMaxLengthMap: { [key: string]: number } = {
    IN: 6,
    ZA: 4,
    GR: 5, // Example for Greece
    UAE: 5,
  }

  const handleToggleChangePermisson = (
    //@ts-ignore
    id,
    //@ts-ignore
    field,
  ) => {
    //@ts-ignore

    var new_permisson_data
    let full_data = JSON.parse(JSON.stringify(permissions))

    let find_handels = full_data.filter(
      //@ts-ignore
      (e) => e.id === id,
    )

    if (find_handels.length > 0) {
      let changed_row = find_handels[0]

      changed_row[field] = !changed_row[field]

      let remaning_data = full_data.filter(
        //@ts-ignore
        (e) => e.id != id,
      )
      if (remaning_data.length > 0) {
        new_permisson_data = [...remaning_data, changed_row]
      } else {
        new_permisson_data = [changed_row]
      }

      let sorted = new_permisson_data.sort((a, b) => a.id - b.id)

      setPermissions(
        //@ts-ignore
        sortAscending(new_permisson_data, id),
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
        canDelete: e?.delete, // Consider renaming this if 'view' is not truly 'delete'
      },
    }))
    setIsbuttondisabled(false)

    setModulePermisson(permisson_data as any)
    setStaffData({
      ...staffData,
      roleId: selectedRole,
      //@ts-ignore
      specialAccessModules: permisson_data,
      //@ts-ignore
      roleId: Number(selectedRole),
    })
  }

  const columns = [
    {
      field: 'responsibility',
      headerClassName: 'super-app-theme--header',
      headerName: 'Modules',
      flex: 1,
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
          <Switch checked={params.row[field]} onChange={() => handleToggleChangePermisson(params.row.id, field)} />
        </>
      ),
    })),
  ]

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchRolesList(),
        fetchCountries(),
        //  fetchBranches(),
        staffId ? fetchStaffDetailsByStaffId() : Promise.resolve(),
      ])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchAllData()
  }, [staffId])

  const fetchRolesList = async () => {
    try {
      let response = await user_service.getAllRolesData()
      setRoles(response)
    } catch (error) {
      console.error('Error fetching roles data:', error)
    }
  }
  const fetchStaffDetailsByStaffId = async () => {
    if (!staffId) {
      console.error('Staff ID is missing in the URL')
      return
    }
    try {
      let response: StaffProfile = await user_service.getStaffDetailsById(staffId)

      setSelectedRole(
        //@ts-ignore
        response?.roleId,
      )

      setStaffData(response)
      setModulePermisson(
        //@ts-ignore
        response?.modules,
      )
      fetchBranches(response?.staffCountry)

      const initialPermissions = response?.modules?.map(
        //@ts-ignore
        (res, index) => ({
          id: res.moduleId,
          //@ts-ignore
          responsibility: res.moduleName,
          create: res.access.canCreate,
          read: res.access.canRead,
          update: res.access.canUpdate,

          delete: res.access.canDelete,
        }),
      )

      setPermissions(
        //@ts-ignore
        initialPermissions.sort((e) => e.id),
      )
    } catch (error) {
      console.error('Error fetching staff data:', error)
    }
  }

  const fetchCountries = async () => {
    try {
      const response = await user_service.getCountriesList()
      const filtered = response?.filter((country: any) => country.status === 'A')
      setCountryList(filtered || [])
    } catch (err) {
      console.error('Error fetching countries:', err)
    }
  }

  const fetchBranches = async (country: string) => {
    try {
      const response = await user_service.BranchList(country)
      setBranchList(response || [])
    } catch (err) {
      console.error('Error fetching branches:', err)
    }
  }

  const handleRegexChange = (e: any, regex: any) => {
    const value = e.target.value
    if (regex.test(value)) {
      return value
    }
    return null // Return null if the value doesn't match the regex
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: any; value: any }>) => {
    const { name, value } = e.target
    if (name === 'staffCountry') {
      fetchBranches(value)
    }

    if (name == 'staffCountries') {
      setStaffData((prev: any) => ({
        ...prev,
        [name]: typeof value === 'string' ? value.split(',') : value,
      }))
    } else {
      setStaffData((prev: any) => ({
        ...prev,
        [name]: value,
      }))
    }

    setIsbuttondisabled(false)
  }

  const handleAddUpdateUser = () => {
    if (staffId) {
      //@ts-ignore
      delete staffData?.password

      user_service
        .editStaff(
          { ...staffData, roleId: selectedRole, staffID: staffData?.staffId, modified_by: local_service.get_staff_id() },
          local_service.get_staff_id(),
        )
        .then((data) => {
          if (data) {
            settype('success')
            setText('Staff updated successfully!')
            navigate('/profile')
          } else {
            settype('error')
            setText(data?.message)
          }
          setOpen(true)
        })
    } else {
      user_service
        .createStaff({
          ...staffData,
          staffIdType: 'Aadhar',
          roleId: selectedRole,
          createdBy: local_service.get_staff_id(),
        })
        .then((data) => {
          if (data.status) {
            settype('success')
            setText('Staff created successfully!')
            navigate('/profile')
          } else {
            setText(data?.message)
            settype('error')
          }
          setOpen(true)
        })
    }
  }

  const disableButton = () => {
    const requiredFields = [
      staffData?.staffFirstName,
      staffData?.staffLastName,
      staffData?.staffContactNumber,
      staffData?.staffCountry,
      staffData?.staffBranch,
      staffData?.staffCity,
      staffData?.staffPostalCode,
      staffData?.staffSuburb,
      staffData?.staffAddressLine1,
      staffData?.staffAddressLine2,
      staffData?.email,
      staffData?.username,
      staffData?.password,
      selectedRole,
      // Add other required fields here if needed
    ]

    const isAnyFieldEmpty = requiredFields.some((field) => !field || field.toString().trim() === '')

    const hasPermission = staffId
      ? helper_service.checkUserHasPermission(local_service.get_modules()?.STAFF, 'canUpdate')
      : helper_service.checkUserHasPermission(local_service.get_modules()?.STAFF, 'canCreate')

    return !hasPermission || isAnyFieldEmpty
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '70vh',
          width: '80vw',
        }}
      >
        <CircularProgress size={70} color="primary" />
      </Box>
    )
  }

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.STAFF}>
      <Box sx={{ width: '50vw' }}>
        <Typography
          mb={2}
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 'bold',
          }}
        >
          Staff Details
        </Typography>

        <Box sx={{ width: '80vw' }}>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={4}>
              <label style={inputLabelStyle}>First Name</label>
              <TextField
                name="staffFirstName"
                fullWidth
                value={staffData?.staffFirstName || ''}
                onChange={(e) => {
                  const value = handleRegexChange(e, /^[a-zA-Z]*$/)
                  if (value !== null) handleChange(e)
                }}
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <label style={inputLabelStyle}>Last Name</label>
              <TextField
                value={staffData?.staffLastName || ''}
                onChange={(e) => {
                  const value = handleRegexChange(e, /^[a-zA-Z]*$/)
                  if (value !== null) handleChange(e)
                }}
                name="staffLastName"
                fullWidth
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <label style={inputLabelStyle}>Phone</label>
              <TextField
                value={staffData?.staffContactNumber || ''}
                onChange={(e) => {
                  const value = handleRegexChange(e, /^\d{0,10}$/) // Allow only numbers and limit to 10 digits
                  if (value !== null) handleChange(e)
                }}
                name="staffContactNumber"
                fullWidth
                type="text" // Use text instead of number to enforce length
              />
            </Grid>
            {/* <Grid item xs={12} sm={3}>
              <label style={inputLabelStyle}>
                In
              </label>
              <TextField
                value={staffData?.staffContactNumber || ''}
                onChange={(e) => {
                  const value = handleRegexChange(e, /^\d{0,10}$/) // Allow only numbers and limit to 10 digits
                  if (value !== null) handleChange(e)
                }}
                name="staffContactNumber"
                fullWidth
                type="text" // Use text instead of number to enforce length
              />
            </Grid> */}

            <Grid item xs={12} sm={3}>
              <label style={inputLabelStyle}>Email</label>
              <TextField
                value={staffData?.email || ''}
                onChange={(e) => {
                  const value = e.target.value
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

                  // Validate and update
                  if (!emailRegex.test(value)) {
                    setEmailError('Invalid email format')
                  } else {
                    setEmailError('')
                  }
                  handleChange(e) // Call your existing handler
                }}
                name="email"
                type="email"
                fullWidth
                InputProps={{ readOnly: !isEditable }}
                error={!!emailError}
                helperText={emailError}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <label style={inputLabelStyle}>
                <b>Password</b>
              </label>
              <TextField
                fullWidth
                type="password"
                name="password"
                value={staffData?.password || ''}
                onChange={(e) => {
                  const value = e.target.value
                  const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value)
                  if (!isValid && value !== '') {
                    setPasswordError('Min 8 chars, include upper, lower, number & special char')
                  } else {
                    setPasswordError('')
                  }
                  handleChange(e)
                }}
                disabled={!!staffId} // shorthand for: staffId ? true : false
                error={!!passwordError}
                helperText={passwordError}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <label style={inputLabelStyle}>Username</label>
              <TextField
                fullWidth
                name="username"
                value={staffData?.username || ''}
                onChange={(e) => {
                  const value = handleRegexChange(e, /^[a-zA-Z0-9]*$/) // ALLOW ONLY UPPER AND LOWER CASE LETTERS
                  if (value !== null) handleChange(e)
                }}
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ width: '80vw' }}>
          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={6}>
              <label style={inputLabelStyle}>Address Line 1</label>
              <TextField
                fullWidth
                name="staffAddressLine1"
                value={staffData?.staffAddressLine1 || ''}
                onChange={(e) => {
                  const value = handleRegexChange(e, /^[a-zA-Z0-9\s,.\-]*$/)
                  if (value !== null) handleChange(e)
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <label style={inputLabelStyle}>Address Line 2</label>
              <TextField
                fullWidth
                name="staffAddressLine2"
                value={staffData?.staffAddressLine2 || ''}
                onChange={(e) => {
                  const value = handleRegexChange(e, /^[a-zA-Z0-9\s,.\-]*$/)
                  if (value !== null) handleChange(e)
                }}
                // InputProps={{ readOnly: !isEditable }}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <label style={inputLabelStyle}>Suburb</label>
              <TextField
                fullWidth
                name="staffSuburb"
                value={staffData?.staffSuburb || ''}
                onChange={handleChange}
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <label style={inputLabelStyle}>City</label>
              <TextField
                fullWidth
                name="staffCity"
                value={staffData?.staffCity || ''}
                onChange={handleChange}
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <label style={inputLabelStyle}>Residence Country</label>
              <TextField
                select
                fullWidth
                name="staffCountry"
                value={staffData?.staffCountry || ''}
                onChange={handleChange}
                InputProps={{ readOnly: !isEditable }}
                SelectProps={{ native: true }}
              >
                <option value="">-- Select Country --</option>
                {countryList.map((country: any) => (
                  <option key={country.countryCode} value={country.countryCode}>
                    {country.countryName}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={2}>
              <label style={inputLabelStyle}>Access Country</label>

              <TextField
                select
                fullWidth
                name="staffCountries"
                //@ts-ignore
                value={staffData?.staffCountries || []}
                onChange={handleChange}
                InputProps={{ readOnly: !isEditable }}
                SelectProps={{
                  multiple: true,

                  renderValue: (selected: any) => (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 0.5,
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        flexWrap: 'nowrap',
                        scrollbarWidth: 'thin',
                        '&::-webkit-scrollbar': {
                          height: 6,
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: '#bdbdbd',
                          borderRadius: 10,
                        },
                      }}
                    >
                      {countryList
                        .filter((c: any) => selected.includes(c.countryCode))
                        .map((c: any) => (
                          <Chip key={c.countryCode} label={c.countryName} size="small" sx={{ flexShrink: 0 }} />
                        ))}
                    </Box>
                  ),
                }}
              >
                {countryList.map((country: any) => {
                  //@ts-ignore
                  const isSelected = staffData?.staffCountries?.includes(country.countryCode)

                  return (
                    <MenuItem key={country.countryCode} value={country.countryCode}>
                      <ListItemIcon
                        sx={{
                          minWidth: 30,
                          color: isSelected ? 'primary.main' : 'transparent',
                        }}
                      >
                        <CheckIcon fontSize="small" />
                      </ListItemIcon>

                      <ListItemText primary={country.countryName} />
                    </MenuItem>
                  )
                })}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <label style={inputLabelStyle}>Postal Code</label>
              <TextField
                fullWidth
                name="staffPostalCode"
                value={staffData?.staffPostalCode || ''}
                onChange={(e) => {
                  const value = e.target.value
                  const country = staffData?.staffCountry
                  const maxLength = postalCodeMaxLengthMap[country] || 0
                  if (value.length <= maxLength) {
                    handleChange(e)
                  }
                }}
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <label style={inputLabelStyle}>Branch</label>
              <TextField
                select
                fullWidth
                name="staffBranch"
                label
                value={staffData?.staffBranch || ''}
                onChange={handleChange}
                InputProps={{ readOnly: !isEditable }}
                SelectProps={{ native: true }}
              >
                <option value="">-- Select Branch --</option>
                {branchList.map((branch: any) => (
                  <option key={branch.id} value={branch.branchCode}>
                    {branch.city} ({branch.branchCode})
                  </option>
                ))}
              </TextField>
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
                setIsbuttondisabled(false)
                user_service.getRole(e?.target?.value).then((data) => {
                  const initialPermissions = data?.modules?.map(
                    //@ts-ignore
                    (res, index) => ({
                      id: res.moduleId,
                      responsibility: res.moduleName,
                      create: res.access.canCreate,
                      read: res.access.canRead,
                      update: res.access.canUpdate,

                      delete: res.access.canDelete,
                    }),
                  )
                  setPermissions(
                    initialPermissions.sort(
                      //@ts-ignore
                      (e) => e.id,
                    ),
                  )

                  let permisson_data = initialPermissions
                    .sort(
                      //@ts-ignore
                      (e) => e.id,
                    )
                    .map((e: any) => ({
                      //@ts-ignore
                      moduleDescription: e?.responsibility,
                      moduleId: e?.id,
                      moduleStatus: true,
                      access: {
                        canCreate: e?.create,
                        canRead: e?.read,
                        canUpdate: e?.update,
                        canDelete: e?.delete, // Consider renaming this if 'view' is not truly 'delete'
                      },
                    }))

                  setStaffData({
                    ...staffData,
                    //@ts-ignore
                    specialAccessModules: permisson_data,
                    roleId: Number(selectedRole),
                  })
                })
              }}
            >
              {roles.map((role: any) => (
                <MenuItem key={role.roleId} value={role.roleId}>
                  {role.roleDescription}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Button
            sx={{
              mt: 2,
              ml: 2,
            }}
            variant="outlined"
            disabled={isbuttondisabled}
            // disabled={disableButton()}
            onClick={() => handleAddUpdateUser()}
          >
            {staffId ? 'UPDATE' : 'ADD'}
          </Button>
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
                getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row')}
                sx={{
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
  )
}

export default UserAdd
