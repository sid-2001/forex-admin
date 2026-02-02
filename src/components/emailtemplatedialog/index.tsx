// components/EmailTemplateDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

import { LocalStorageService } from "@/helpers/local-storage-service";
import { countyState } from "@/states/state";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: any | null;
}

const initialForm = {
  countryCode: "",
  templateCode: "",
  templateName: "",
  emailSubject: "",
  emailBodyHtml: "",
  emailBodyText: "",
  fromName: "",
  fromEmail: "",
  emailTemplateDescription: "",
  active: true,
  effectiveFromDate: "",
  effectiveToDate: ""
};

export default function EmailTemplateDialog({
  open,
  onClose,
  onSubmit,
  editData
}: Props) {
  const countries = useRecoilValue(countyState)
  const localService = new LocalStorageService();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (editData) {
      setForm({
        ...editData,
        effectiveFromDate: editData.effectiveFromDate?.split("T")[0],
        effectiveToDate: editData.effectiveToDate?.split("T")[0]
      });
    } else {
      setForm(initialForm);
    }
    setErrors({});
  }, [editData, open]);

  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
    setErrors({ ...errors, [key]: "" });
  };

  const validate = () => {
    const newErrors: any = {};

    if (!form.countryCode) newErrors.countryCode = "Country is required";
    if (!form.templateCode) newErrors.templateCode = "Template Code is required";
    if (!form.templateName) newErrors.templateName = "Template Name is required";
    if (!form.emailSubject) newErrors.emailSubject = "Email Subject is required";
    if (!form.fromEmail) newErrors.fromEmail = "From Email is required";
    if (!form.effectiveFromDate) newErrors.effectiveFromDate = "Effective From Date is required";
    if (!form.effectiveToDate) newErrors.effectiveToDate = "Effective To Date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      ...form,
      createdBy: editData ? undefined : localService.get_staff_id(),
      modifiedBy: editData ? localService.get_staff_id() : undefined,
      effectiveFromDate: `${form.effectiveFromDate}T00:00:00`,
      effectiveToDate: `${form.effectiveToDate}T23:59:59`
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {editData ? "Update Email Template" : "Create Email Template"}
      </DialogTitle>

      <DialogContent>
        <TextField
          select
          label="Country"
          fullWidth
          margin="dense"
          value={form.countryCode}
          error={!!errors.countryCode}
          helperText={errors.countryCode}
          onChange={(e) => handleChange("countryCode", e.target.value)}
        >
          {countries.map((c) => (
            <MenuItem
            //@ts-ignore
            key={c.countryCode} value={c.countryCode}>
              {c.countryName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Template Code"
          fullWidth
          margin="dense"
          value={form.templateCode}
          error={!!errors.templateCode}
          helperText={errors.templateCode}
          onChange={(e) => handleChange("templateCode", e.target.value)}
        />

        <TextField
          label="Template Name"
          fullWidth
          margin="dense"
          value={form.templateName}
          error={!!errors.templateName}
          helperText={errors.templateName}
          onChange={(e) => handleChange("templateName", e.target.value)}
        />

        <TextField
          label="Email Subject"
          fullWidth
          margin="dense"
          value={form.emailSubject}
          error={!!errors.emailSubject}
          helperText={errors.emailSubject}
          onChange={(e) => handleChange("emailSubject", e.target.value)}
        />

        <TextField
          label="Email Body (HTML)"
          fullWidth
          margin="dense"
          multiline
          rows={3}
          value={form.emailBodyHtml}
          onChange={(e) => handleChange("emailBodyHtml", e.target.value)}
        />

        <TextField
          label="Email Body (Text)"
          fullWidth
          margin="dense"
          multiline
          rows={2}
          value={form.emailBodyText}
          onChange={(e) => handleChange("emailBodyText", e.target.value)}
        />

        <TextField
          label="From Name"
          fullWidth
          margin="dense"
          value={form.fromName}
          onChange={(e) => handleChange("fromName", e.target.value)}
        />

        <TextField
          label="From Email"
          fullWidth
          margin="dense"
          value={form.fromEmail}
          error={!!errors.fromEmail}
          helperText={errors.fromEmail}
          onChange={(e) => handleChange("fromEmail", e.target.value)}
        />

        <TextField
          label="Description"
          fullWidth
          margin="dense"
          value={form.emailTemplateDescription}
          onChange={(e) =>
            handleChange("emailTemplateDescription", e.target.value)
          }
        />

        <TextField
          type="date"
          label="Effective From"
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
          error={!!errors.effectiveFromDate}
          helperText={errors.effectiveFromDate}
          value={form.effectiveFromDate}
          onChange={(e) => handleChange("effectiveFromDate", e.target.value)}
        />

        <TextField
          type="date"
          label="Effective To"
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
          error={!!errors.effectiveToDate}
          helperText={errors.effectiveToDate}
          value={form.effectiveToDate}
          onChange={(e) => handleChange("effectiveToDate", e.target.value)}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.active}
              onChange={(e) => handleChange("active", e.target.checked)}
            />
          }
          label="Active"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editData ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
