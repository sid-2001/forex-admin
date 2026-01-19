import { Button, Stack, IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";

import ChannelFormDialog from "../channellist";
import ChannelService from "@/services/channel.servive";
import { LocalStorageService } from "@/helpers/local-storage-service";

export default function ChannelManagement() {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const local_service=new LocalStorageService();
  const static_service = new ChannelService();

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await static_service.getChannelList();
      //@ts-ignore
      setRows(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= CREATE ================= */
  const handleCreate = async (data: any) => {
    await static_service.createChannel({
      applicant_id: local_service?.get_staff_id(),
      channel_code: data.channelCode,
      country_code: data.selectedCountry,
      channel_description: data.description,
      active: data.active,
      effective_from_date: `${data.effectiveFrom}`,
      effective_to_date: `${data.effectiveTo}`
    });

    setOpen(false);
    fetchData();
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async (data: any) => {
    await static_service.updateChannel({
      applicant_id: local_service?.get_staff_id(),
      channel_code: data.channelCode,
      country_code: data.selectedCountry,
      channel_description: data.description,
      //@ts-ignore
       active: data.active,
        effective_from_date: `${data.effectiveFrom}`,
      effective_to_date: `${data.effectiveTo}`
    });

    setOpen(false);
    fetchData();
  };

  /* ================= DELETE ================= */
  const handleDelete = async (row: any) => {
    await static_service.deleteChannel({
      channel_code: row.channel_code,
      country_code: row.country_code
    });

    fetchData();
  };

  /* ================= DATAGRID COLUMNS ================= */
  const columns: GridColDef[] = [
    {
      field: "channel_code",
      headerName: "Channel Code",
      flex: 1
    },
    {
      field: "country_code",
      headerName: "Country",
      flex: 1
    },
    {
      field: "channel_description",
      headerName: "Description",
      flex: 2
    },
    {
      field: "active",
      headerName: "Active",
      flex: 1,
      renderCell: (params) => (params.value ? "Yes" : "No")
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
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
            onClick={() => handleDelete(params.row)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      )
    }
  ];

  return (
    <>
      {/* ================= HEADER ================= */}
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Button
          variant="contained"
          onClick={() => {
            setEditData(null);
            setOpen(true);
          }}
        >
          Add Channel
        </Button>
      </Stack>

      {/* ================= DATAGRID ================= */}
      <div style={{  width: "80vw" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) =>
            `${row.channel_code}-${row.country_code}`
          }
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
        />
      </div>

      {/* ================= DIALOG ================= */}
      <ChannelFormDialog
        open={open}
        onClose={() => setOpen(false)}
        editData={editData}
        onSubmit={editData ? handleUpdate : handleCreate}
      />
    </>
  );
}
