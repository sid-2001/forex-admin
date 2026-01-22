import { useEffect, useState } from "react";
import { Box, Button, IconButton, Stack } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BankTypeDialog from "../../components/bank-type-dialog"
import BankBusinessTypeService, {
  BankBusinessType
} from "../../services/bantypemaster.service";
import { useRecoilState } from "recoil";
import { alertState, alertTextState, alertTypeState } from "@/states/state";

export default function BankTypeMaster() {
  const service = new BankBusinessTypeService();

  const [rows, setRows] = useState<BankBusinessType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<BankBusinessType | null>(null);

  const [open, setOpen] = useRecoilState(alertState);
  const [text, setText] = useRecoilState(alertTextState);
  const [type, setType] = useRecoilState(alertTypeState);

  const fetchData = async () => {
    const res = await service.getList();
    console.log(res)
    setRows(res)
    // if (res?.status) setRows(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (data: any) => {
    const res = await service.create(data);
    setOpen(true);
    setType(res.status ? "Success" : "Fail");
    setText(res.message);
    setDialogOpen(false);
    fetchData();
  };

  const handleUpdate = async (data: any) => {
    const res = await service.update(
      editData!.business_type_code,
      data
    );
    setOpen(true);
    setType(res.status ? "Success" : "Fail");
    setText(res.message);
    setEditData(null);
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (row: BankBusinessType) => {
    await service.delete(row.business_type_code, false);
    fetchData();
  };

  const columns: GridColDef[] = [
    { field: "business_type_code", headerName: "Code", flex: 0.6 },
    { field: "bank_business_name", headerName: "Business Name", flex: 1.2 },
    { field: "business_currency_code", headerName: "Currency", flex: 0.6 },
    { field: "country_code", headerName: "Country", flex: 0.6 },
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
              setDialogOpen(true);
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
    <Box p={2} sx={{ width: "85vw" }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null);
            setDialogOpen(true);
          }}
        >
          Add Bank Type
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        getRowId={(row) =>
    `${row.business_type_code}-${row.created_at ?? Math.random()}`
  }
        columns={columns}
        // getRowId={(row) => row.business_type_code}
        autoHeight
        pageSizeOptions={[5, 10]}
      />

      <BankTypeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editData={editData}
        onSubmit={editData ? handleUpdate : handleCreate}
      />
    </Box>
  );
}
