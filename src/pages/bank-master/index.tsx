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
import BankMasterDialog from "../../components/bank-dialog/BankMasterDialog";
import BankMasterService, { BankMaster } from "../../services/bankmaster.service";
import { useRecoilState } from "recoil";
import { alertState, alertTextState, alertTypeState } from "@/states/state";


export default function BankMasterScreen() {
  const service = new BankMasterService();

  const [rows, setRows] = useState<BankMaster[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<BankMaster | null>(null);

  const [open, setOpen] = useRecoilState(alertState);
  const [text, setText] = useRecoilState(alertTextState);
  const [type, setType] = useRecoilState(alertTypeState);

  const fetchData = async () => {
    const res = await service.getBankList();
    //@ts-ignore
     setRows(res);
   
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (data: any) => {
    const res = await service.createBank(data);
    setOpen(true);
    setType(res.status ? "Success" : "Fail");
    setText(res.message);
    setDialogOpen(false);
    fetchData();
  };

  const handleUpdate = async (data: any) => {
    const res = await service.updateBank(editData!.bankMasterCode, data);
    setOpen(true);
    setType(res.status ? "Success" : "Fail");
    setText(res.message);
    setEditData(null);
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (row: BankMaster) => {
    await service.deleteBank(row.bankMasterCode, false);
    fetchData();
  };

  const columns: GridColDef[] = [
    { field: "bankCode", headerName: "Bank Code", flex: 0.7

         , headerClassName: 'super-app-theme--header' 
     },
    { field: "bankName", headerName: "Bank Name", flex: 1.2 

         , headerClassName: 'super-app-theme--header' 
    },
    { field: "bankBranchCode", headerName: "Branch Code", flex: 0.8
         , headerClassName: 'super-app-theme--header' 
     },
    { field: "bankIfscBicCode", headerName: "IFSC/BIC", flex: 1 
         , headerClassName: 'super-app-theme--header' 
    },
    { field: "bankCity", headerName: "City", flex: 0.7 
         , headerClassName: 'super-app-theme--header' 
    },
    { field: "countryCode", headerName: "Country", flex: 0.6
         , headerClassName: 'super-app-theme--header' 
     },
    {
      field: "active",
      headerName: "Active",
      width: 120,
      renderCell: (params) => (params.value ? "Yes" : "No")
       , headerClassName: 'super-app-theme--header' 
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
       , headerClassName: 'super-app-theme--header' 
    }
  ];

  return (
    <Box p={2} sx={{ width: "75vw" }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null);
            setDialogOpen(true);
          }}
        >
          Add Bank
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.bankMasterCode}
        autoHeight
        pageSizeOptions={[5, 10]}
      />

      <BankMasterDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editData={editData}
        onSubmit={editData ? handleUpdate : handleCreate}
      />
    </Box>
  );
}
