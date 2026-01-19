import { Button, Stack, IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";

import StateFormDialog from "../../components/stateformDialog";
import StateService from "@/services/state.service";
import { LocalStorageService } from "@/helpers/local-storage-service";

export default function StateManagement() {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const stateService = new StateService();
  const local_service=new LocalStorageService();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await stateService.getStateList();
      //@ts-ignore
      setRows(res)
      // if (res?.success) {
      //   setRows(res.data);
      // }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (data: any) => {
    await stateService.createState({
      applicant_id: local_service?.get_staff_id(),
      statecode: data.stateCode,
      statedescription: data.description,
      countrycode: data.countryCode,
      active: data.active,
      effectivefromdate: `${data.effectiveFrom}T00:00:00Z`,
      effectivetodate: `${data.effectiveTo}T23:59:59Z`
    });
    setOpen(false);
    fetchData();
  };

  const handleUpdate = async (data: any) => {
    await stateService.updateState({
      applicant_id:  local_service?.get_staff_id(),
      statecode: data.stateCode,
      statedescription: data.description,
      //@ts-ignore
      countrycode: data.countryCode,
        //@ts-ignore
       active: data.active,
    });
    setOpen(false);
    fetchData();
  };

  const handleDelete = async (row: any) => {
    await stateService.deleteState({
      statecode: row.statecode,
      countrycode: row.countrycode
    });
    fetchData();
  };

  const columns: GridColDef[] = [
    { field: "statecode", headerName: "State Code", flex: 1 },
    { field: "statedescription", headerName: "Description", flex: 2 },
    { field: "countrycode", headerName: "Country", flex: 1 },
    {
      field: "active",
      headerName: "Active",
      flex: 1,
      renderCell: (p) => (p.value ? "Yes" : "No")
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            onClick={() => {
              setEditData(params.row);
              setOpen(true);
            }}
          >
            <EditIcon />
          </IconButton>

          <IconButton
            color="error"
            onClick={() =>{ handleDelete(params.row)

              console.log("content is deleted")
            }}
          >
            <DeleteIcon />
          </IconButton>
        </>
      )
    }
  ];

  return (
    <>
      <Stack direction="row" justifyContent="flex-start" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null);
            setOpen(true);
          }}
        >
          Add State
        </Button>
      </Stack>

      <div style={{ height: 500, width: "80vw" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => `${row.statecode}-${row.countrycode}`}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
        />
      </div>

      <StateFormDialog
        open={open}
        onClose={() => setOpen(false)}
        editData={editData}
        onSubmit={editData ? handleUpdate : handleCreate}
      />
    </>
  );
}
