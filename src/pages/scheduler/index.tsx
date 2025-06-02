import * as React from 'react'
import {
  TextField,
  Avatar,
  MenuItem,
  Select,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import axios from 'axios'
import { Schedule, UserService } from '@/services/user.service'
import { theme } from '@/contants/theme'
import { useNavigate } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState, loaderState } from '@/states/state'
// import { User } from '@/pages/user-list'

// const users: User[] = [
//   { id: 1, name: 'Alice', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
//   { id: 2, name: 'Bob', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
//   { id: 3, name: 'Charlie', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
// ]

type ScheduleEntry = {
  startDate: string
  endDate: string
  environment: 'Production' | 'UAT'
   //@ts-ignore
  users: User[]
  shift: string
}

const Scheduler: React.FC = () => {
  const [startDate, setStartDate] = React.useState<Dayjs | null>(dayjs())
  const [endDate, setEndDate] = React.useState<Dayjs | null>(dayjs())
  const [selectedUsers, setSelectedUsers] = React.useState<number[]>([])
  const [environment, setEnvironment] = React.useState<'prod' | 'uat'>('uat')
  const [scheduleEntries, setScheduleEntries] = React.useState<Schedule[]>([])
  const [users, setUsers] = React.useState<any[]>([])
  const [alreadyusers, setAlreadyUsers] = React.useState<any[]>([])

  const navigate = useNavigate()
  const [text, setText] = useRecoilState(alertTextState)
  const [type, setType] = useRecoilState(alertTypeState)
  const [open, setOpen] = useRecoilState(alertState)
  const [commonloader, setcommonloader] = useRecoilState(loaderState)

  const [isDialogOpen, setDialogOpen] = React.useState(false)
  const [selectedSchedule, setSelectedSchedule] = React.useState<Schedule | null>(null)

  const [isNight, setIsNight] = React.useState(false)

  const handleToggle = (val:boolean) => {
    setIsNight(val)
    let shift = !isNight ? 'night' : 'morning'
    user_service.getAvailableUser(String(startDate?.format('YYYY-MM-DD')), String(endDate?.format('YYYY-MM-DD')), shift).then((data) => {
      console.log(data)
      if (data) {
        setUsers(data as any)
      }
    })
  }
  // Function to handle card click
  const handleCardClick = (entry: Schedule) => {
    setSelectedSchedule({ ...entry, users: [] })
    setAlreadyUsers(entry?.users as any)
    setDialogOpen(true)

    let shift = entry.shift
    user_service.getAvailableUser(String(startDate?.format('YYYY-MM-DD')), String(endDate?.format('YYYY-MM-DD')), shift).then((data) => {
      console.log(data)
      if (data) {
        setUsers(data as any)
      }
    })
  }

  // Handle dialog field changes
  const handleDialogFieldChange = (field: string, value: any) => {
    setSelectedSchedule((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  // Handle dialog submission
  const handleDialogSubmit = async () => {
    if (selectedSchedule) {
      try {
        console.log(selectedSchedule)
        let data = {
          ...selectedSchedule,
          users: selectedSchedule.users.map((e) => e.id),
          shift: selectedSchedule.shift,
        }
        user_service.updateSchedule(data, selectedSchedule?.uid).then((data) => {
          if (data.uid) {
            setType('success')
            setText('Schedule updated successfully')
          } else {
            setType('error')
            setText('Failed to update schedule')
          }
          setOpen(true)
        })
        user_service.getScheduleList().then((data) => {
          setScheduleEntries(data)
        })
        setTimeout(() => {
          setOpen(false)

          window.location.reload()
        }, 2000)
      } catch (error) {
        console.error('Failed to update schedule:', error)
        setType('error')
        setText('Failed to update schedule')
      } finally {
        setOpen(true)
      }
    }
    setDialogOpen(false)
  }

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedSchedule(null)
  }

  let user_service = new UserService()

  React.useEffect(() => {
    user_service.getUserList().then((data) => {
      setUsers(data as any)
    })
    user_service.getScheduleList().then((data) => {
      setScheduleEntries(data)
    })

    let shift = isNight ? 'night' : 'morning'
    user_service.getAvailableUser(String(startDate?.format('YYYY-MM-DD')), String(endDate?.format('YYYY-MM-DD')), shift).then((data) => {
      console.log(data)
      if (data) {
        setUsers(data as any)
      }
    })
  }, [])

  const handleSubmit = () => {
    if (startDate && endDate && selectedUsers.length > 0) {
      const newEntry: ScheduleEntry = {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),

        //@ts-ignore
        environment,

        //@ts-ignore
        users: users.filter((user) => selectedUsers.includes(user.id)),
        shift: isNight ? 'night' : 'morning',
      }
      let newData = {
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD'),
        environment,
        //@ts-ignore
        users: users.filter((user) => selectedUsers.includes(user.id)).map((e) => String(e.id)),
        shift: isNight ? 'night' : 'morning',
      }
      user_service.createSchedule(newData).then((data) => {
        setcommonloader(true)
        if (data.uid) {
          setType('success')
          setText('Schedule Created Successfully')
          setOpen(true)
          user_service.getScheduleList().then((data) => {
            setScheduleEntries(data)
          })
        } else {
          setType('error')
          setText('Schedule Creation Failed')
          setOpen(true)
        }

        setTimeout(() => {
          setOpen(false)
          setcommonloader(false)

          window.location.reload()
        }, 2000)
      })

      console.log(newEntry)
      //@ts-ignore
      setScheduleEntries((prevEntries) => [...prevEntries, newEntry])
      setStartDate(null)
      setEndDate(null)
      setSelectedUsers([])
    }
  }

  const handleDeleteUser = (userId: number) => {
    setSelectedUsers((prevUsers) => prevUsers.filter((id) => id !== userId))
  }

  const deleteUserFromEntry = async (entryIndex: number, userId: number) => {
    try {
      user_service
        .deleteParticularScheduleUser(
          //@ts-ignore

          entryIndex,
          userId,
        )
        .then((data) => {
          if (data) {
            setType('success')
            setText('User Deleted successfully')
          } else {
            setType('error')
            setText('Failed to Delete ')
          }
          setOpen(true)
        })

      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const handleDeleteCard = (
    //@ts-ignore
    index,
  ) => {
    console.log(index)
    user_service
      .deleteSchedule(index.uid)
      .then((data) => {
        console.log(data)
        if (data) {
          setType('success')
          setText('Schedule deleted Successfully')
          setOpen(true)
        } else {
          setType('error')
          setText('Schedule deleted Failed')
          setOpen(true)
        }

        user_service.getScheduleList().then((data) => {
          setScheduleEntries(data)
        })
      })
      .catch((err) => {
        console.log(err)
      })
    // Remove card logic
    // Update the state or make API calls as needed
  }

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid container spacing={4} padding={4}>
          {/* Form Section (Left) */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4} sx={{ maxWidth: '100%' }}>
              <Typography variant="h4" align="left" gutterBottom color="primary">
                Scheduler
              </Typography>

              {/* Date Pickers */}
              <Stack direction="row" spacing={1} justifyContent="space-between">
                <DatePicker
                  label="Start Date"
                  //@ts-ignore
                  value={startDate}
                  onChange={(newDate) => setStartDate(newDate)}
                  //@ts-ignore
                  renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newDate) => {
                    newDate?.format('YYYY-MM-DD')
                    let shift = isNight ? 'night' : 'morning'
                    user_service
                      .getAvailableUser(String(startDate?.format('YYYY-MM-DD')), String(newDate?.format('YYYY-MM-DD')), shift)
                      .then((data) => {
                        console.log(data)
                        if (data) {
                          setUsers(data as any)
                        }
                      })
                    setEndDate(newDate)
                  }}
                  //@ts-ignore
                  renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                />
              </Stack>

              {/* User Multi-Select */}
              <Select
                multiple
                value={selectedUsers}
                onChange={(e) => setSelectedUsers(e.target.value as number[])}
                displayEmpty
                fullWidth
                renderValue={(selected) =>
                  selected.length > 0 ? (
                    <Stack direction="row" spacing={1}>
                      {selected.map((id, index) => {
                        const user = users.find(
                          (user) =>
                            //@ts-ignore
                            user.id === id,
                        )
                        return (
                          <Chip
                            key={id}
                            avatar={
                              <Avatar
                                //@ts-ignore
                                src={user?.avatar}
                              >
                                {user?.first_name[0]}
                              </Avatar>
                            }
                            label={String(index + 1) + ') ' + user?.first_name + ' ' + user?.last_name}
                            variant="outlined"
                            sx={{ fontSize: '0.9em' }}
                            onDelete={() => handleDeleteUser(id)}
                            // deleteIcon={<DeleteIcon />}
                          />
                        )
                      })}
                    </Stack>
                  ) : (
                    'Select Users'
                  )
                }
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      //@ts-ignore
                      src={user.avatar}
                      sx={{ marginRight: 1 }}
                    />
                    {user.first_name + ' ' + user.last_name}
                  </MenuItem>
                ))}
              </Select>

              {/* Environment Toggle */}
              <ToggleButtonGroup
                color="primary"
                value={environment}
                exclusive
                //@ts-ignore
                onChange={(e, newEnvironment) => {
                  //@ts-ignore
                  if (newEnvironment !== null) {
                    setEnvironment('uat')
                  }
                }}
                sx={{
                  justifyContent: 'center',
                  // backgroundColor: 'primary.light',
                  borderRadius: 2,
                  '& .MuiToggleButton-root': {
                    padding: '8px 16px',
                  },
                }}
              >
                <ToggleButton value="prod" sx={{ fontSize: '0.875rem' }}>
                  Production
                </ToggleButton>
                <ToggleButton value="uat" sx={{ fontSize: '0.875rem' }}>
                  UAT
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Environment Toggle */}
              <ToggleButtonGroup
                color="primary"
                value={isNight ? 'true' : 'false'}
                exclusive
                //@ts-ignore
                onChange={(e, shift) => {
                  //@ts-ignore
                  if (shift === 'true') {
                    handleToggle(true)
                  }else{
                    handleToggle(false)
                  }
                }}
                sx={{
                  justifyContent: 'center',
                  // backgroundColor: 'primary.light',
                  borderRadius: 2,
                  '& .MuiToggleButton-root': {
                    padding: '8px 16px',
                  },
                }}
              >
                <ToggleButton value='false' sx={{ fontSize: '0.875rem' }}>
                  Morning
                </ToggleButton>
                <ToggleButton value="true" sx={{ fontSize: '0.875rem' }}>
                  Night
                </ToggleButton>
              </ToggleButtonGroup>

              {/* <Box textAlign="center"> */}
                {/* <Typography variant="h4" gutterBottom>
                  {isNight ? 'Night Mode' : 'Morning Mode'}
                </Typography> */}
                {/* <FormControlLabel
                  control={<Switch checked={isNight} onChange={handleToggle} color="primary" />}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      {isNight ? <NightsStayIcon /> : <WbSunnyIcon />}
                      {isNight ? 'Switch to Morning' : 'Switch to Night'}
                    </Box>
                  }
                />
              </Box> */}

              {/* Submit Button */}
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                fullWidth
                sx={{
                  padding: 1.5,
                  fontSize: '1rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                }}
              >
                Submit
              </Button>
            </Stack>
          </Grid>

          {/* Scheduled Entries Display (Right) */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                maxHeight: '600px',
                overflowY: 'auto',
                padding: 2,
                borderRadius: 2,
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                border: '1px solid',
                borderColor: 'primary.main',
                backgroundColor: 'white',
              }}
            >
              {scheduleEntries.map((entry, entryIndex) => (
                <Card
                  key={entryIndex}
                  variant="outlined"
                  onClick={() => handleCardClick(entry)}
                  sx={{
                    borderRadius: 2,
                    marginBottom: 2,
                    padding: 2,
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                    border: '1px solid',
                    borderColor: 'primary.main',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
                    },
                  }}
                >
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation() // Prevent triggering onClick for the card
                      handleDeleteCard(entry)
                    }}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 0, 0, 0.8)', // Optional: Highlight on hover
                      },
                    }}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      <strong>Start Date:</strong> {entry.start_date}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      <strong>End Date:</strong> {entry.end_date}
                    </Typography>

                    <Box sx={{ marginTop: 1 }}>
                      <Chip
                        label={entry.environment}
                        color={entry.environment === 'Production' ? 'primary' : 'secondary'}
                        sx={{ fontSize: '0.8rem' }}
                      />
                      <Chip
                        label={entry.shift}
                        color={'primary'}
                        sx={{ fontSize: '0.8rem', marginLeft: '0.8rem' }}
                      />
                    </Box>
                    <Typography variant="subtitle2" sx={{ marginTop: 1 }}>
                      <strong>Users:</strong>
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {entry.users.map((user) => (
                        <Chip
                          key={user.id}
                          avatar={
                            <Avatar
                              src={
                                //@ts-ignore
                                user.avatar

                                //@ts-ignore
                              }
                              //@ts-ignore
                            />
                          }
                          label={user.first_name}
                          variant="outlined"
                          sx={{ fontSize: '0.75rem', marginBottom: 1 }}
                          // deleteIcon={<DeleteIcon />}
                          onDelete={
                            () =>
                              deleteUserFromEntry(
                                //@ts-ignore

                                entry.uid,
                                user.id,
                              )

                            //@ts-ignore
                          }
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>

          {/* Dialog for editing */}
          <Dialog
            open={isDialogOpen}
            onClose={handleCloseDialog}
            fullWidth
            sx={{ paddingTop: '10px' }}
            //@ts-ignore
            p={2}
          >
            {/* <DialogTitle>Edit Schedule</DialogTitle> */}
            <DialogContent sx={{ paddingTop: '10px' }}>
              {selectedSchedule && (
                <Stack sx={{ padding: '10px' }} spacing={2}>
                  <TextField
                    sx={{
                      marginTop: '10px',
                    }}
                    label="Start Date"
                    type="date"
                    disabled
                    value={selectedSchedule.start_date}
                    onChange={(e) => handleDialogFieldChange('start_date', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="End Date"
                    type="date"
                    disabled
                    value={selectedSchedule.end_date}
                    fullWidth
                    onChange={(e) => {
                      handleDialogFieldChange('end_date', e.target.value)
                      console.log(e.target.value)
                      //@ts-ignore

                      let night = isNight ? 'night' : 'morning'
                      user_service.getAvailableUser(selectedSchedule.start_date, String(e.target.value), night).then((data) => {
                        setUsers(data)
                      })
                    }}
                  />
                  <TextField
                    select
                    label="Environment"
                    value={selectedSchedule.environment}
                    onChange={(e) => handleDialogFieldChange('environment', e.target.value)}
                    fullWidth
                  >
                    <MenuItem value="prod">Production</MenuItem>
                    <MenuItem value="uat">UAT</MenuItem>
                  </TextField>
                  {/* <Stack direction="row" spacing={1} flexWrap="wrap">
                    {alreadyusers.map((user) => (
                      <Chip
                        key={user.id}
                        avatar={<Avatar src={user.avatar} />}
                        label={user.first_name}
                        onDelete={() =>
                          // handleDialogFieldChange(
                          //   'users',
                          //   selectedSchedule.users.filter((u) => u.id !== user.id),
                          // )

                          setAlreadyUsers(selectedSchedule.users.filter((u) => u.id !== user.id))
                        }
                      />
                    ))}
                  </Stack> */}

                  <Select
                    multiple
                    value={selectedSchedule?.users.map((user) => user.id) || []}
                    onChange={(e) => {
                      const updatedUserIds =
                        //@ts-ignore
                        e.target.value as number[]
                      const updatedUsers = users.filter((user) =>
                        //@ts-ignore
                        updatedUserIds.includes(user.id),
                      )
                      handleDialogFieldChange('users', updatedUsers)
                    }}
                    displayEmpty
                    fullWidth
                    renderValue={(selected) =>
                      selected.length > 0 ? (
                        <Stack direction="row" spacing={1}>
                          {selected.map((id) => {
                            const user = users.find((user) => user?.id === id)

                            return (
                              <Chip
                                key={id}
                                avatar={
                                  <Avatar
                                    //@ts-ignore
                                    src={user?.avatar}
                                  >
                                    {user?.first_name[0]}
                                  </Avatar>
                                }
                                label={user?.first_name || ''}
                              />
                            )
                          })}
                        </Stack>
                      ) : (
                        'Select Users'
                      )
                    }
                  >
                    {users.map((user) => {
                      // const isSelected = selectedSchedule?.users.some((selectedUser) => selectedUser.id === user.id)
                      return (
                        <MenuItem key={user.id} value={user.id}>
                          <Avatar
                            //@ts-ignore
                            src={user?.avatar} //@ts-ignore
                            sx={{ marginRight: 1 }}
                          />
                          {user.first_name + ' ' + user.last_name}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </Stack>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="secondary">
                Cancel
              </Button>
              <Button onClick={handleDialogSubmit} variant="contained" color="primary">
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </LocalizationProvider>
    </>
  )
}

export default Scheduler
