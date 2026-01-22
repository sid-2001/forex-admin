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
import { BankBusinessType } from "../services/bantypemaster.service";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: BankBusinessType | null;
}

export default function BankTypeDialog({
  open,
  onClose,
  onSubmit,
  editData
}: Props) {
  const localService = new LocalStorageService();

  const [form, setForm] = useState<any>({
    countryCode: "",
    businessCurrencyCode: "INR",
    bankBusinessName: "",
    active: true,
    effective_from_date: "",
    effective_to_date: ""
  });

  useEffect(() => {
    if (editData) {
      setForm({
        countryCode: editData.country_code,
        businessCurrencyCode: editData.business_currency_code,
        bankBusinessName: editData.bank_business_name,
        active: editData.active,
        effective_from_date: editData.effective_from_date.split("T")[0],
        effective_to_date: editData.effective_to_date.split("T")[0]
      });
    } else {
      setForm({
        countryCode: "",
        businessCurrencyCode: "INR",
        bankBusinessName: "",
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editData ? "Update Bank Type" : "Add Bank Type"}
      </DialogTitle>

      <DialogContent>
        <TextField
          label="Business Name"
          fullWidth
          margin="dense"
          value={form.bankBusinessName}
          onChange={(e) =>
            handleChange("bankBusinessName", e.target.value)
          }
        />

        <TextField
          label="Currency"
          fullWidth
          margin="dense"
          value={form.businessCurrencyCode}
          onChange={(e) =>
            handleChange("businessCurrencyCode", e.target.value)
          }
        />

        <TextField
          label="Country"
          fullWidth
          margin="dense"
          value={form.countryCode}
          onChange={(e) =>
            handleChange("countryCode", e.target.value)
          }
        />

        <TextField
          type="date"
          label="Effective From"
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
          value={form.effective_from_date}
          inputProps={{ readOnly: true }}
          onChange={(e) =>
            handleChange("effective_from_date", e.target.value)
          }
        />

        <TextField
          type="date"
          label="Effective To"
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
          value={form.effective_to_date}
          inputProps={{ readOnly: true }}
          onChange={(e) =>
            handleChange("effective_to_date", e.target.value)
          }
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.active}
              onChange={(e) =>
                handleChange("active", e.target.checked)
              }
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
