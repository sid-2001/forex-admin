import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel, Box } from "@mui/material";
import { useEffect, useState } from "react";

export default function ServiceFormDialog({ open, onClose, onSubmit, editData }: any) {
  const [countryCode, setCountryCode] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [active, setActive] = useState(true);
  const [effectiveFromDate, setEffectiveFromDate] = useState("");
  const [effectiveToDate, setEffectiveToDate] = useState("");

  useEffect(() => {
    if (editData) {
      setCountryCode(editData.countryCode || "");
      setServiceDescription(editData.serviceDescription || "");
      setActive(editData.active ?? true);
      setEffectiveFromDate(editData.effectiveFromDate?.split("T")[0] || "");
      setEffectiveToDate(editData.effectiveToDate?.split("T")[0] || "");
    } else {
      setCountryCode("");
      setServiceDescription("");
      setActive(true);
      setEffectiveFromDate("");
      setEffectiveToDate("");
    }
  }, [editData, open]);

  const handleSubmit = () => {
    onSubmit({
      countryCode,
      serviceDescription,
      active,
      effectiveFromDate: `${effectiveFromDate}T00:00:00`,
      effectiveToDate: `${effectiveToDate}T23:59:59`,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editData ? "Update Service" : "Create Service"}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Country Code" fullWidth value={countryCode} onChange={(e) => setCountryCode(e.target.value)} />
          <TextField label="Service Description" fullWidth value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} />
          <TextField type="date" label="Effective From" fullWidth InputLabelProps={{ shrink: true }} value={effectiveFromDate} onChange={(e) => setEffectiveFromDate(e.target.value)} />
          <TextField type="date" label="Effective To" fullWidth InputLabelProps={{ shrink: true }} value={effectiveToDate} onChange={(e) => setEffectiveToDate(e.target.value)} />
          <FormControlLabel control={<Checkbox checked={active} onChange={(e) => setActive(e.target.checked)} />} label="Active" />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>{editData ? "Update" : "Save"}</Button>
      </DialogActions>
    </Dialog>
  );
}