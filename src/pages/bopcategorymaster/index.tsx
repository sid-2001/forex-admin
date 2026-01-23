import { useEffect, useState } from "react";
import { Box, Button, IconButton, Stack } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BopCategoryFormDialog from "../../components/bopcategorydialog";
import BopCategoryService from "../../services/bop.category.service";
import { LocalStorageService } from "@/helpers/local-storage-service";
import { useRecoilState } from "recoil";
import { alertState, alertTextState, alertTypeState } from "@/states/state";

export interface BopCategory {
  bopPurposeCategoryCode: string;
  countryCode: string;
  categoryType: string;
  bopPurposeCode: string;
  bopPurposeDescription: string;
  bopPurposeSubCode: string;
  bopPurposeSubDescription: string;
  active: boolean;
  effective_from_date: string;
  effective_to_date: string;
}

export default function BopCategoryMaster() {
  const [rows, setRows] = useState<BopCategory[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<BopCategory | null>(null);

  const [open, setOpen] = useRecoilState(alertState);
  const [text, setText] = useRecoilState(alertTextState);
  const [type, setType] = useRecoilState(alertTypeState);

  const service = new BopCategoryService();
  const localService = new LocalStorageService();

  const fetchData = async () => {
    const res = await service.getAll();
    // if (res?.status) {
    
      setRows(res);
    // }
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
      setText("BOP Category Created Successfully");
    } else {
      setType("Fail");
      setText("Server Error");
    }
    setOpen(true);
    setDialogOpen(false);
    fetchData();
  };

  const handleUpdate = async (data: any) => {
    const res = await service.update(data);

    if (res?.status) {
      setType("Success");
      setText("BOP Category Updated Successfully");
    } else {
      setType("Fail");
      setText("Server Error");
    }
    setOpen(true);
    setEditData(null);
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (row: BopCategory) => {
    await service.delete({
      bopPurposeCategoryCode: row.bopPurposeCategoryCode,
      countryCode: row.countryCode,
    });
    fetchData();
  };

  const columns: GridColDef[] = [
    { field: "bopPurposeCategoryCode", headerName: "Category Code", flex: 0.6 },
    { field: "countryCode", headerName: "Country", flex: 0.4 },
    { field: "categoryType", headerName: "Category Type", flex: 0.6 },
    { field: "bopPurposeCode", headerName: "Purpose Code", flex: 0.5 },
    { field: "bopPurposeDescription", headerName: "Purpose Description", flex: 1 },
    { field: "bopPurposeSubCode", headerName: "Sub Code", flex: 0.5 },
    { field: "bopPurposeSubDescription", headerName: "Sub Description", flex: 1 },
    {
      field: "active",
      headerName: "Active",
      width: 120,
      renderCell: (p) => (p.value ? "Yes" : "No"),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
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
          Add BOP Category
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.bopPurposeCategoryCode}
        autoHeight
        pageSizeOptions={[5, 10]}
      />

      <BopCategoryFormDialog
        open={dialogOpen}
        editData={editData}
        onClose={() => setDialogOpen(false)}
        onSubmit={editData ? handleUpdate : handleCreate}
      />
    </Box>
  );
}
