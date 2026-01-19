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
import GenderFormDialog from "../../components/genderFormDialog";
import staticdataService from "@/services/staticdata.service";
import GenderService from "@/services/gender.service";
import { LocalStorageService } from "@/helpers/local-storage-service";
import { useRecoilState } from "recoil";
import { alertState, alertTextState, alertTypeState } from "@/states/state";

interface Gender {
  gendercode: string;
  description: string;
  active: boolean;
}
export default function GenderMaster() {
  const [rows, setRows] = useState<Gender[]>([]);
  const [dialogopen, setDialogopen] = useState(false);
    const [open, setOpen] = useRecoilState(alertState)
    const [text, setText] = useRecoilState(alertTextState)
    const [type, settype] = useRecoilState(alertTypeState)
  const local_service=new LocalStorageService();

  const [editData, setEditData] = useState<Gender | null>(null);
   const static_service=new GenderService();

  const fetchData = async () => {
    const res = await static_service.getGenderList()
    //@ts-ignore
    setRows(res);
  };


  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (data: any) => {
 const genderresponse=   await static_service.createGender({
      applicant_id: local_service?.get_staff_id(),
      gendercode: data.gendercode,
      description: data.description,
      countrycode: data?.selectedCountry,
      active: data?.active,
      effectivefromdate: data?.effectiveFrom,
      effectivetodate: data?. effectiveTo
    });
  
    if(
      //@ts-ignore
      genderresponse?.success==true){

      setOpen(true);
      settype("Success");
      setText("Gender Created Successfully")
    }
    else{

      setOpen(true);
      settype("Fail");
      setText("Server Error")


    }
    setDialogopen(false);
    fetchData();
  };

  const handleUpdate = async (data: any) => {
    console.log("the data to be updated is ",data);
    const genderresponse=  await static_service.updateGender({
      //@ts-ignore
      applicant_id:local_service?.get_staff_id(),
      gendercode: data?.gendercode,
      countrycode: data?.selectedCountry,
      description: data.description,
      effectivefromdate: data?.effectiveFrom,
      effectivetodate: data?. effectiveTo
      
    });


        if(
          //@ts-ignore
          genderresponse?.success==true){

      setOpen(true);
      settype("Success");
      setText("Gender Updated Succesfully");
    }
    else{

      setOpen(true);
      settype("Fail");
      setText("Server Error")


    }
    setEditData(null);
    setDialogopen(false);
    fetchData();
  };

  const handleDelete = async (row: Gender) => {
    await static_service.deleteGender({
      gendercode: row.gendercode,
      //@ts-ignore
      countrycode: row?.countrycode
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
              console.log(params.row)
              setEditData(params.row);
              setDialogopen(true);
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
    <Box p={2} sx={{
      width:"80vw"
    }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null);
            setDialogopen(true);
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
        open={dialogopen}
        //@ts-ignore
        onClose={() => setDialogopen(false)}
        //@ts-ignore
        editData={editData}
        onSubmit={editData ? handleUpdate : handleCreate}
      />
    </Box>
  );
}
