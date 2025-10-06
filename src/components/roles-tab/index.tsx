import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { UserService } from '@/services/user.service';
import { LocalStorageService } from '@/helpers/local-storage-service';

const modules = [
  { moduleId: 1, moduleName: 'Transaction Outward', moduleLink: '/admin/users' },
  { moduleId: 2, moduleName: 'Transaction Inward', moduleLink: '/transaction/users' },
  { moduleId: 3, moduleName: 'BOP', moduleLink: '/bop/users' },
  { moduleId: 4, moduleName: 'KYC', moduleLink: '/kyc/users' },
  { moduleId: 5, moduleName: 'Dashboard', moduleLink: '/dashboard/users' },
  { moduleId: 6, moduleName: 'Compliance Monitor', moduleLink: '/compliance/users' },
  { moduleId: 7, moduleName: 'Applicant', moduleLink: '/applicant/users' },
  { moduleId: 8, moduleName: 'Beneficiary', moduleLink: '/beneficiary/users' },
  { moduleId: 9, moduleName: 'Reconcillation', moduleLink: '/reconcillation/users' },
  { moduleId: 10, moduleName: 'Staff', moduleLink: '/reconcillation/users' },
  { moduleId: 11, moduleName: 'Module', moduleLink: '/module' },
];

const RoleModal = (
  //@ts-ignore
   {open,setOpen}) => {
 
  const [roleName, setRoleName] = useState('');
  const [selectedModules, setSelectedModules] = useState([]);
  const [permissions, setPermissions] = useState<any>({});

  const handleSelect = (id:any) => {
    //@ts-ignore
    const alreadySelected = selectedModules.includes(id);
    const updatedModules = alreadySelected
      ? selectedModules.filter((mid) => mid !== id)
      : [...selectedModules, id];
//@ts-ignore
    setSelectedModules(updatedModules);

    if (!alreadySelected) {
      setPermissions((prev:any) => ({
        ...prev,
        [id]: { create: false, read: false, update: false, delete: false },
      }));
    } else {
      const newPermissions = { ...permissions };
      delete newPermissions[id];
      setPermissions(newPermissions);
    }
  };

  const handleToggle = (
  //@ts-ignore
    id, type
 )  => {
    setPermissions((prev:any) => ({
      ...prev,
      [id]: {
        //@ts-ignore
        ...prev[id],
        //@ts-ignore
        [type]: !prev[id][type],
      },
    }));
  };

  const columns = [
    { field: 'moduleName', headerName: 'Module Name', width: 220 },
    {
      field: 'create',
      headerName: 'Create',
      width: 100,
      renderCell: (params:any) => (
        <Checkbox
          checked={permissions[params.row.moduleId]?.create || false}
          onChange={() => handleToggle(params.row.moduleId, 'create')}
        />
      ),
    },
    {
      field: 'read',
      headerName: 'Read',
      width: 100,
      renderCell: (params:any) => (
        <Checkbox
          checked={permissions[params.row.moduleId]?.read || false}
          onChange={() => handleToggle(params.row.moduleId, 'read')}
        />
      ),
    },
    {
      field: 'update',
      headerName: 'Update',
      width: 100,
      renderCell: (params:any) => (
        <Checkbox
          checked={permissions[params.row.moduleId]?.update || false}
          onChange={() => handleToggle(params.row.moduleId, 'update')}
        />
      ),
    },
    {
      field: 'delete',
      headerName: 'Delete',
      width: 100,
      renderCell: (params:any) => (
        <Checkbox
          checked={permissions[params.row.moduleId]?.delete || false}
          onChange={() => handleToggle(params.row.moduleId, 'delete')}
        />
      ),
    },
  ];
  let user_service=new UserService()
  let local_service=new LocalStorageService()

  const handleSave = () => {
    const output = {
      roleDescription: roleName,
      roleStatus: true,
      modules: selectedModules.map((id) => {
        const mod:any = modules.find((m) => m.moduleId === id);
        return {
          staffModuleId: mod.moduleId,
          staffModuleDescription: `${mod.moduleName} Screen`,
          access: {
            accessId: 1,
            canCreate: permissions[id]?.create || false,
            canRead: permissions[id]?.read || false,
            canUpdate: permissions[id]?.update || false,
            canDelete: permissions[id]?.delete || false,
          },
        };
      }),
    };
user_service.addRole(output,local_service?.get_staff_id()).then(data=>{

  console.log(data)
})
    

    console.log('Final Output:', output);
    setOpen(false);
  };

  return (
    <>
  

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle><b>Assign Role to Modules</b></DialogTitle>
        <DialogContent>
          <TextField
            label="Role Name"
            fullWidth
            margin="normal"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />

          <div style={{ margin: '20px 0' }}>
            <strong>Select Modules:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
              {modules.map((mod:any) => (
                <FormControlLabel
                  key={mod.moduleId}
                  control={
                    <Checkbox
                    //@ts-ignore
                      checked={selectedModules.includes(mod?.moduleId)}
                      onChange={() => handleSelect(mod.moduleId)}
                    />
                  }
                  label={mod.moduleName}
                />
              ))}
            </div>
          </div>

          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
            //@ts-ignore
              rows={modules.filter((m:any) => selectedModules.includes(m?.moduleId))}
              columns={columns}
              getRowId={(row) => row.moduleId}
              //@ts-ignore
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save Role
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RoleModal;
