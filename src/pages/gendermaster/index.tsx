import { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// import {
//   getGenders,
//   createGender,
//   updateGender,
//   deleteGender
// } from "./genderApi";

import GenderFormDialog from "../../components/genderFormDialog";
import staticdataService from "@/services/staticdata.service";
import GenderService from "@/services/gender.service";

interface Gender {
  gendercode: string;
  description: string;
  active: boolean;
}
export default function GenderMaster() {
  const [rows, setRows] = useState<Gender[]>([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<Gender | null>(null);
const static_service=new GenderService();

  const fetchData = async () => {
    const res = await static_service.getGenderList()
    setRows(res.data.data);
  };


  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (data: any) => {
    await static_service.createGender({
      username: "SIT_ADMIN_01",
      gendercode: data.gendercode,
      description: data.description,
      countrycode: "IN",
      active: data.active,
      effectivefromdate: "2026-01-01T00:00:00Z",
      effectivetodate: "2030-12-31T23:59:59Z"
    });
    setOpen(false);
    fetchData();
  };

  const handleUpdate = async (data: any) => {
    await static_service.updateGender({
      username: "SIT_MANAGER_02",
      gendercode: editData?.gendercode,
      countrycode: "IN",
      description: data.description
    });
    setEditData(null);
    setOpen(false);
    fetchData();
  };

  const handleDelete = async (row: Gender) => {
    await static_service.deleteGender({
      gendercode: row.gendercode,
      countrycode: "IN"
    });
    fetchData();
  };

  const columns: GridColDef[] = [
    { field: "gendercode", headerName: "Gender Code", width: 150 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "active",
      headerName: "Active",
      width: 120,
      renderCell: (params) => (params.value ? "Yes" : "No")
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => {
              setEditData(params.row);
              setOpen(true);
            }}
          >
            <EditIcon />
          </IconButton>

          <IconButton onClick={() => handleDelete(params.row)}>
            <DeleteIcon color="error" />
          </IconButton>
        </>
      )
    }
  ];

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null);
            setOpen(true);
          }}
        >
          Add Gender
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.gendercode}
        autoHeight
        pageSizeOptions={[5, 10]}
      />

      <GenderFormDialog
        open={open}
        onClose={() => setOpen(false)}
        editData={editData}
        onSubmit={editData ? handleUpdate : handleCreate}
      />
    </Box>
  );
}
