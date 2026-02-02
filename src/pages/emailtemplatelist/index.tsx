// pages/EmailTemplateMasterPage.tsx
import { useEffect, useState } from "react";
import { Box, Button, IconButton, Stack } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmailTemplateDialog from "../../components/emailtemplatedialog"
import emailTemplateService from "../../services/emailtemplate.service"
import EmailTemplateService from "../../services/emailtemplate.service";

export default function EmailTemplateMasterPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
const emailTemplateService=new EmailTemplateService();
  const fetchList = async () => {
    const res = await emailTemplateService.getEmailTemplateList()
    setRows(res.data || []);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleSubmit = async (payload: any) => {
    if (editData) {
      await emailTemplateService.updateEmailTemplate(editData.emailTemplateCode, payload);
    } else {
      await emailTemplateService.createEmailTemplate(payload);
    }
    setOpen(false);
    setEditData(null);
    fetchList();
  };

  const handleDelete = async (code: string) => {
    await emailTemplateService.deleteEmailTemplate(code);
    fetchList();
  };

  const columns: GridColDef[] = [
    { field: "templateCode", headerName: "Template Code", flex: 1 },
    { field: "templateName", headerName: "Template Name", flex: 1 },
    { field: "countryCode", headerName: "Country", flex: 0.6 },
    { field: "emailSubject", headerName: "Subject", flex: 1.5 },
    {
      field: "active",
      headerName: "Active",
      flex: 0.4
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.6,
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
          <IconButton onClick={() => handleDelete(params.row.emailTemplateCode)}>
            <DeleteIcon />
          </IconButton>
        </>
      )
    }
  ];

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="flex-end" mb={1}>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Email Template
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.emailTemplateCode}
        autoHeight
      />

      <EmailTemplateDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setEditData(null);
        }}
        onSubmit={handleSubmit}
        editData={editData}
      />
    </Box>
  );
}
