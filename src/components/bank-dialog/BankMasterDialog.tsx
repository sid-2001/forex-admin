import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import { useEffect, useState } from "react";
import { LocalStorageService } from "@/helpers/local-storage-service";
import { BankMaster } from "../../services/bankmaster.service";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: BankMaster | null;
}

export default function BankMasterDialog({
  open,
  onClose,
  onSubmit,
  editData
}: Props) {
  const localService = new LocalStorageService();

  const [form, setForm] = useState<any>({
    countryCode: "",
    currencyCode: "INR",
    bankCode: "",
    bankName: "",
    bankBranchCode: "",
    bankIfscBicCode: "",
    bankAddress1: "",
    bankAddress2: "",
    bankAddress3: "",
    bankStateProvinceCode: "",
    bankCity: "",
    bankPostalCode: "",
    active: true,
    effective_from_date: "",
    effective_to_date: ""
  });

  useEffect(() => {
    if (editData) {
      setForm({
        ...editData,
        effective_from_date: editData.effective_from_date.split("T")[0],
        effective_to_date: editData.effective_to_date.split("T")[0]
      });
    } else {
      setForm({
        countryCode: "",
        currencyCode: "INR",
        bankCode: "",
        bankName: "",
        bankBranchCode: "",
        bankIfscBicCode: "",
        bankAddress1: "",
        bankAddress2: "",
        bankAddress3: "",
        bankStateProvinceCode: "",
        bankCity: "",
        bankPostalCode: "",
        active: true,
        effective_from_date: "",
        effective_to_date: ""
      });
    }
  }, [editData]);

  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = () => {
    onSubmit({
      ...form,
      created_by: localService.get_staff_id(),
      modified_by: editData ? localService.get_staff_id() : undefined,
      effective_from_date: `${form.effective_from_date}T00:00:00`,
      effective_to_date: `${form.effective_to_date}T23:59:59`
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {editData ? "Update Bank" : "Add Bank"}
      </DialogTitle>

      <DialogContent>
        <TextField label="Bank Code" fullWidth margin="dense"
          value={form.bankCode}
          disabled={!!editData}
          onChange={(e) => handleChange("bankCode", e.target.value)}
        />

        <TextField label="Bank Name" fullWidth margin="dense"
          value={form.bankName}
          onChange={(e) => handleChange("bankName", e.target.value)}
        />

        <TextField label="Branch Code" fullWidth margin="dense"
          value={form.bankBranchCode}
          onChange={(e) => handleChange("bankBranchCode", e.target.value)}
        />

        <TextField label="IFSC / BIC" fullWidth margin="dense"
          value={form.bankIfscBicCode || ""}
          onChange={(e) => handleChange("bankIfscBicCode", e.target.value)}
        />

        <TextField label="City" fullWidth margin="dense"
          value={form.bankCity}
          onChange={(e) => handleChange("bankCity", e.target.value)}
        />

        <TextField label="State" fullWidth margin="dense"
          value={form.bankStateProvinceCode}
          onChange={(e) => handleChange("bankStateProvinceCode", e.target.value)}
        />

        <TextField label="Postal Code" fullWidth margin="dense"
          value={form.bankPostalCode}
          onChange={(e) => handleChange("bankPostalCode", e.target.value)}
        />

        <TextField
          label="Effective From"
          type="date"
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
          value={form.effective_from_date}
          inputProps={{ readOnly: true }}
          onChange={(e) => handleChange("effective_from_date", e.target.value)}
        />

        <TextField
          label="Effective To"
          type="date"
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
          value={form.effective_to_date}
          inputProps={{ readOnly: true }}
          onChange={(e) => handleChange("effective_to_date", e.target.value)}
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
