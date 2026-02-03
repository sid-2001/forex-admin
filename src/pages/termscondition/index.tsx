import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Snackbar,
  Alert,
  Divider
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import TermsConditionsService, {
  TermsConditions
} from "../../services/termsandcondition.service";

const termsService = new TermsConditionsService();

/* ---------- helpers ---------- */
const parseJsonContent = (jsonContent: any) => {
  if (!jsonContent) return { editorData: [] };
  if (typeof jsonContent === "string") {
    try {
      return JSON.parse(jsonContent);
    } catch {
      return { editorData: [] };
    }
  }
  return jsonContent;
};

export default function TermsConditionsGridPage() {
  const [rows, setRows] = useState<TermsConditions[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<TermsConditions | null>(null);

  const [versions, setVersions] = useState<any[]>([]);
  const [editorValue, setEditorValue] = useState("");
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);

  const [editorMode, setEditorMode] = useState<"visual" | "html">("visual");

  /* ---------- snackbar ---------- */
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error"
  });

  const showSuccess = (msg: string) =>
    setSnackbar({ open: true, message: msg, severity: "success" });

  const showError = (msg: string) =>
    setSnackbar({ open: true, message: msg, severity: "error" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await termsService.getAll();
      setRows(res);
    } catch {
      showError("Failed to load Terms & Conditions");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- open editor ---------- */
  const handleView = (row: TermsConditions) => {
    const parsed = parseJsonContent(row.jsonContent);
    const editorData = parsed.editorData || [];
    const active = editorData.find((v: any) => v.active);

    setSelected(row);
    setVersions(editorData);
    setEditorValue(active?.data || "");
    setPreviewVersionId(active?.id || null);
    setEditorMode("visual");
    setOpen(true);
  };

  /* ---------- save (new version) ---------- */
  const handleSave = async () => {
    if (!selected) return;

    try {
      const updated = versions.map(v => ({ ...v, active: false }));
      const newVersion = {
        id: `v${updated.length + 1}`,
        data: editorValue,
        active: true,
        updatedAt: new Date().toISOString()
      };

      const finalEditorData = [...updated, newVersion];

      const jsonContentString = JSON.stringify({
        editorData: finalEditorData
      });

      await termsService.update(selected.termsCode!, {
        termsCode: selected.termsCode,
        countryCode: selected.countryCode,
        channel: selected.channel,
        screen: selected.screen,
        headerSectionCount: selected.headerSectionCount,
        contentCount: selected.contentCount || 0,
        version: selected.version,
        active: selected.active,
        jsonContent: jsonContentString,
        modifiedBy: "ADMIN",
        effectiveFromDate: selected.effectiveFromDate,
        effectiveToDate: selected.effectiveToDate
      });

      showSuccess("Terms updated successfully");
      setOpen(false);
      loadData();
    } catch {
      showError("Failed to save changes");
    }
  };

  /* ---------- revert version ---------- */
  const handleRevert = async (version: any) => {
    if (!selected) return;

    try {
      const updatedVersions = versions.map(v => ({
        ...v,
        active: v.id === version.id
      }));

      const jsonContentString = JSON.stringify({
        editorData: updatedVersions
      });

      await termsService.update(selected.termsCode!, {
        termsCode: selected.termsCode,
        countryCode: selected.countryCode,
        channel: selected.channel,
        screen: selected.screen,
        headerSectionCount: selected.headerSectionCount,
        contentCount: selected.contentCount || 0,
        version: selected.version,
        active: selected.active,
        jsonContent: jsonContentString,
        modifiedBy: "ADMIN",
        effectiveFromDate: selected.effectiveFromDate,
        effectiveToDate: selected.effectiveToDate
      });

      setVersions(updatedVersions);
      setEditorValue(version.data);
      setPreviewVersionId(version.id);
      showSuccess("Reverted to selected version");
    } catch {
      showError("Failed to revert version");
    }
  };

  /* ---------- grid ---------- */
  const columns: GridColDef[] = [
    { field: "termsCode", headerName: "Terms Code", flex: 1 },
    { field: "countryCode", headerName: "Country", flex: 0.7 },
    { field: "channel", headerName: "Channel", flex: 0.6 },
    { field: "screen", headerName: "Screen", flex: 1 },
    { field: "active", headerName: "Active", flex: 0.5 },
    {
      field: "action",
      headerName: "Action",
      sortable: false,
      flex: 1,
      renderCell: params => (
        <Button size="small" variant="outlined" onClick={() => handleView(params.row)}>
          View / Edit
        </Button>
      )
    }
  ];

  return (
    <Box sx={{ height: "100vh", p: 3 }}>
      <Typography variant="h5" mb={2}>
        Terms & Conditions Management
      </Typography>

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={row => row.termsCode!}
        pageSizeOptions={[10, 25, 50]}
      />

      {/* ---------- EDITOR DIALOG ---------- */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit Terms – {selected?.screen}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {selected?.countryCode} | {selected?.channel} | {selected?.termsCode}
            </Typography>

            {/* ---------- Editor Mode Toggle ---------- */}
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              <Button
                variant={editorMode === "visual" ? "contained" : "outlined"}
                onClick={() => setEditorMode("visual")}
              >
                Visual Editor
              </Button>
              <Button
                variant={editorMode === "html" ? "contained" : "outlined"}
                onClick={() => setEditorMode("html")}
              >
                HTML Editor
              </Button>
            </Stack>

            {editorMode === "visual" ? (
              <ReactQuill
                theme="snow"
                value={editorValue}
                onChange={setEditorValue}
                style={{ height: 280 }}
              />
            ) : (
              <textarea
                value={editorValue}
                onChange={e => setEditorValue(e.target.value)}
                style={{
                  width: "100%",
                  height: 280,
                  padding: 8,
                  fontFamily: "monospace",
                  fontSize: 14,
                  border: "1px solid #ccc",
                  borderRadius: 4,
                }}
              />
            )}

            <Divider />

            {/* ---------- VERSION HISTORY ---------- */}
            <Typography variant="subtitle2">Version History</Typography>

            <Stack spacing={1}>
              {[...versions].reverse().map(version => (
                <Box
                  key={version.id}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor:
                      version.id === previewVersionId
                        ? "primary.main"
                        : "divider"
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      {version.id} {version.active && "(Active)"}
                    </Typography>

                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        onClick={() => {
                          setEditorValue(version.data);
                          setPreviewVersionId(version.id);
                        }}
                      >
                        View
                      </Button>

                      {!version.active && (
                        <Button
                          size="small"
                          color="warning"
                          onClick={() => handleRevert(version)}
                        >
                          Revert
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save New Version
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- SNACKBAR ---------- */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
