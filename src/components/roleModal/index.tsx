import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  OutlinedInput,
  Chip,
  Box,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { UserService } from '@/services/user.service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import { LocalStorageService } from '@/helpers/local-storage-service'

const RoleModal = ({
  //@ts-ignore
  open,
  //@ts-ignore
  setSelectedRole,

  //@ts-ignore
  onClose,
  //@ts-ignore
  initialData,
  //@ts-ignore
  onSave,
}) =>
  //@ts-ignore

  {
    const [roleName, setRoleName] = useState('')
    const [selectedModules, setSelectedModules] = useState([])
    const [permissions, setPermissions] = useState<any>({})
    const [roleId, setRoleId] = useState(null)
    const [openmodal, setOpen] = useRecoilState(alertState)
    const [text, setText] = useRecoilState(alertTextState)
    const [type, settype] = useRecoilState(alertTypeState)
    const [allModules, setAllModules] = useState<any>([])
    const user_service = new UserService()
    const local_service = new LocalStorageService()
    const [selectOpen, setSelectOpen] = useState(false)
    const [inactivitytime, setinactivitytime] = useState(0)

    const getModuleList = () => {
      try {
        user_service.getAllModulesData().then((data) => {
          const active_module = data?.filter((e) => e.moduleStatus === 'active')
          setAllModules([...active_module])
        })
      } catch (err) {}
    }

    useEffect(() => {
      if (initialData) {
        setRoleName(initialData.roleDescription || '')
        setRoleId(initialData.roleId || null)
        setinactivitytime(initialData?.inactivityTime)
        const selected = (initialData.modules || []).map((m: any) => m.moduleId)
        setSelectedModules(selected)
        const perms = {}
        ;(initialData.modules || []).forEach((mod: any) => {
          //@ts-ignore
          perms[mod.moduleId] = {
            create: mod.access.canCreate,
            read: mod.access.canRead,
            update: mod.access.canUpdate,
            delete: mod.access.canDelete,
          }
        })
        setPermissions(perms)
        getModuleList()
      }
    }, [initialData])
    useEffect(() => {
      getModuleList()
    }, [])

    const handleModuleChange = (event: any) => {
      const newSelection = event.target.value
      setSelectedModules(newSelection)

      const updatedPermissions = { ...permissions }
      newSelection.forEach((id: any) => {
        //@ts-ignore
        if (!updatedPermissions[id]) {
          //@ts-ignore
          updatedPermissions[id] = { create: false, read: false, update: false, delete: false }
        }
      })

      // Clean up removed modules
      Object.keys(updatedPermissions).forEach((id) => {
        if (!newSelection.includes(Number(id))) {
          delete updatedPermissions[id]
        }
      })

      setPermissions(updatedPermissions)
    }

    const handleToggle = (id: any, type: string) => {
      setPermissions((prev: any) => {
        const updated = {
          ...prev,
          [id]: {
            ...prev[id],
            [type]: !prev[id][type],
          },
        }
        if (type !== 'read' && updated[id][type]) {
          updated[id].read = true
        }

        return updated
      })
    }

    const columns = [
      { field: 'moduleName', headerName: 'Module Name', width: 200 },
      {
        field: 'create',
        headerName: 'Create',
        flex: 1,
        renderCell: (params: any) => (
          <Checkbox checked={permissions[params.row.moduleId]?.create || false} onChange={() => handleToggle(params.row.moduleId, 'create')} />
        ),
      },
      {
        field: 'read',
        headerName: 'Read',
        flex: 1,
        renderCell: (params: any) => (
          <Checkbox checked={permissions[params.row.moduleId]?.read || false} onChange={() => handleToggle(params.row.moduleId, 'read')} />
        ),
      },
      {
        field: 'update',
        headerName: 'Update',
        flex: 1,
        renderCell: (params: any) => (
          <Checkbox checked={permissions[params.row.moduleId]?.update || false} onChange={() => handleToggle(params.row.moduleId, 'update')} />
        ),
      },
      {
        field: 'delete',
        headerName: 'Delete',
        flex: 1,
        renderCell: (params: any) => (
          <Checkbox checked={permissions[params.row.moduleId]?.delete || false} onChange={() => handleToggle(params.row.moduleId, 'delete')} />
        ),
      },
    ]

    const handleSave = async () => {
      var payload

      if (roleId) {
        payload = {
          roleId,
          roleDescription: roleName,
          roleStatus: true,
          inactivityTime: inactivitytime,

          modules: selectedModules.map((id) => {
            const mod = allModules.find((m: any) => m.moduleId === id)
            return {
              staffModuleId: id,
              staffModuleDescription: `${mod?.moduleName} Screen`,
              access: {
                accessId: 1,
                canCreate: permissions[id]?.create || false,
                canRead: permissions[id]?.read || false,
                canUpdate: permissions[id]?.update || false,
                canDelete: permissions[id]?.delete || false,
              },
            }
          }),
        }
        const res = await user_service.editRoles(local_service.get_staff_id(), { ...payload, roleId: roleId })
      } else {
        payload = {
          roleId,
          roleDescription: roleName,
          inactivityTime: inactivitytime,
          roleStatus: true,
          modules: selectedModules.map((id) => {
            const mod = allModules.find((m: any) => m.moduleId === id)
            return {
              staffModuleId: id,
              staffModuleDescription: `${mod?.moduleName} Screen`,
              access: {
                accessId: 1,
                canCreate: permissions[id]?.create || false,
                canRead: permissions[id]?.read || false,
                canUpdate: permissions[id]?.update || false,
                canDelete: permissions[id]?.delete || false,
              },
            }
          }),
        }

        user_service.addRole(payload, local_service?.get_staff_id())
      }

      settype('success')
      setText(roleId ? 'Role updated succesfully!' : 'Role created succesfully!')
      setOpen(true)
      setSelectedRole(null)
      window.location.reload()
    }
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle> {roleId ? 'Edit Role' : 'Add Role'} </DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="normal" label="Role Name" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
          {/* <TextField fullWidth  type="number" margin="normal" label="Timing" value={inactivitytime} onChange={(e) => setinactivitytime( e.target.value)} /> */}
          <TextField
            fullWidth
            type="number"
            margin="normal"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            value={inactivitytime}
            onChange={(e) =>
              //@ts-ignore
              setinactivitytime(e.target.value)
            }
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="module-select-label">Select Modules</InputLabel>
            <Select
              labelId="module-select-label"
              multiple
              value={selectedModules}
              onChange={handleModuleChange}
              input={<OutlinedInput label="Select Modules" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((id) => {
                    const mod = allModules.find((m: any) => m.moduleId === id)
                    return <Chip key={id} label={mod?.moduleName} />
                  })}
                </Box>
              )}
              open={selectOpen}
              onOpen={() => setSelectOpen(true)}
              onClose={() => setSelectOpen(false)}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 300, padding: 1 }, // add padding for button
                },
              }}
            >
              {allModules.map((mod: any) => (
                <MenuItem key={mod.moduleId} value={mod.moduleId}>
                  {mod.moduleName}
                </MenuItem>
              ))}

              {/* ✅ Done button aligned right, small & filled */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, px: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectOpen(false)
                  }}
                >
                  Done
                </Button>
              </Box>
            </Select>
          </FormControl>

          <div style={{ height: 400, width: '100%', marginTop: 16 }}>
            <DataGrid
              rows={allModules.filter((m: any) =>
                selectedModules.includes(
                  //@ts-ignore
                  m?.moduleId,
                ),
              )}
              columns={columns}
              getRowId={(row) => row.moduleId}
              //@ts-ignore
              pageSize={5}
              disableSelectionOnClick
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogActions>

        <></>
      </Dialog>
    )
  }

export default RoleModal
