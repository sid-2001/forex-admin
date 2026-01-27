import { useEffect, useState } from "react";
import { Box, Button, IconButton, Stack } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import BopCategoryTypeFormDialog from "../../components/bopcategorytypedialog";
import BopCategoryTypeService from "../../services/bop.category.type.service";
import { LocalStorageService } from "@/helpers/local-storage-service";
import { useRecoilState } from "recoil";
import { alertState, alertTextState, alertTypeState } from "@/states/state";
import { BopCategoryType } from "../../types/bop.type";

export default function BopCategoryTypeMaster() {
  const [rows, setRows] = useState<BopCategoryType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<BopCategoryType | null>(null);

  const [open, setOpen] = useRecoilState(alertState);
  const [text, setText] = useRecoilState(alertTextState);
  const [type, setType] = useRecoilState(alertTypeState);

  const service = new BopCategoryTypeService();
  const localService = new LocalStorageService();

  const fetchData = async () => {
    const res = await service.getAll();
    setRows(res);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (data: any) => {
    const res = await service.create({
      ...data,
      created_by: localService.get_staff_id(),
    });

    if (res?.status) {
      setType("Success");
      setText("BOP Category Type Created Successfully");
    } else {
      setType("Fail");
      setText("Server Error");
    }
    setOpen(true);
    setDialogOpen(false);
    fetchData();
  };

  const handleUpdate = async (data: any) => {
    const res = await service.update(
      editData!.bopCategoryTypeCode,
      {
        ...data,
        modified_by: localService.get_staff_id(),
      }
    );

    if (res?.status) {
      setType("Success");
      setText("BOP Category Type Updated Successfully");
    } else {
      setType("Fail");
      setText("Server Error");
    }
    setOpen(true);
    setDialogOpen(false);
    setEditData(null);
    fetchData();
  };

  const handleDelete = async (row: BopCategoryType) => {
    await service.delete(row.bopCategoryTypeCode);
    fetchData();
  };

  const columns: GridColDef[] = [
    { field: "bopCategoryTypeCode", headerName: "Code", flex: 0.5 , headerClassName: 'super-app-theme--header' },
    { field: "bopCategoryType", headerName: "Type", flex: 0.6, headerClassName: 'super-app-theme--header'  },
    { field: "bopCategoryDescription", headerName: "Description", flex: 1, headerClassName: 'super-app-theme--header'  },
    {
      field: "active",
      headerName: "Active",
      width: 120,
      renderCell: (p) => (p.value ? "Yes" : "No"),
       headerClassName: 'super-app-theme--header' 
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
       headerClassName: 'super-app-theme--header' ,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => {
              setEditData(params.row);
              setDialogOpen(true);
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row)}>
            <DeleteIcon color="error" />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box p={2} sx={{ width: "85vw" }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null);
            setDialogOpen(true);
          }}
        >
          Add Category Type
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.bopCategoryTypeCode}
        autoHeight
        pageSizeOptions={[5, 10]}
        
        
      />

      <BopCategoryTypeFormDialog
        open={dialogOpen}
        editData={editData}
        onClose={() => setDialogOpen(false)}
        onSubmit={editData ? handleUpdate : handleCreate}
      />
    </Box>
  );
}
