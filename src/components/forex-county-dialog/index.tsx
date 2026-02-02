// components/forex-country-dialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem
} from "@mui/material";
import { useEffect, useState } from "react";
import { LocalStorageService } from "@/helpers/local-storage-service";
import { ForexCountry } from "../../services/forextcoutnry.service";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: ForexCountry | null;
}

export default function ForexCountryDialog({
  open,
  onClose,
  onSubmit,
  editData
}: Props) {
  const localService = new LocalStorageService();

  const [form, setForm] = useState<any>({
    countryCode: "",
    countryName: "",
    status: "A",
    countryFlag: "",
    countryFlagUrl: "",
    countryPhoneCode: ""
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (editData) {
      setForm(editData);
    } else {
      setForm({
        countryCode: "",
        countryName: "",
        status: "A",
        countryFlag: "",
        countryFlagUrl: "",
        countryPhoneCode: ""
      });
    }
    setErrors({});
  }, [editData, open]);

  const validate = () => {
    const e: any = {};
    if (!form.countryCode) e.countryCode = "Required";
    if (!form.countryName) e.countryName = "Required";
    if (!form.countryPhoneCode) e.countryPhoneCode = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      ...form,
      createdBy: localService.get_staff_id(),
      modifiedBy: editData ? localService.get_staff_id() : undefined
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editData ? "Update Forex Country" : "Add Forex Country"}
      </DialogTitle>

      <DialogContent>
        <TextField
          label="Country Code"
          fullWidth
          margin="dense"
          disabled={!!editData}
          value={form.countryCode}
          error={!!errors.countryCode}
          helperText={errors.countryCode}
          onChange={(e) =>
            setForm({ ...form, countryCode: e.target.value })
          }
        />

        <TextField
          label="Country Name"
          fullWidth
          margin="dense"
          value={form.countryName}
          error={!!errors.countryName}
          helperText={errors.countryName}
          onChange={(e) =>
            setForm({ ...form, countryName: e.target.value })
          }
        />

        <TextField
          label="Phone Code"
          fullWidth
          margin="dense"
          value={form.countryPhoneCode}
          error={!!errors.countryPhoneCode}
          helperText={errors.countryPhoneCode}
          onChange={(e) =>
            setForm({ ...form, countryPhoneCode: e.target.value })
          }
        />

        <TextField
          label="Country Flag"
          fullWidth
          margin="dense"
          value={form.countryFlag}
          onChange={(e) =>
            setForm({ ...form, countryFlag: e.target.value })
          }
        />

        <TextField
          label="Flag URL"
          fullWidth
          margin="dense"
          value={form.countryFlagUrl}
          onChange={(e) =>
            setForm({ ...form, countryFlagUrl: e.target.value })
          }
        />

        <TextField
          select
          label="Status"
          fullWidth
          margin="dense"
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value })
          }
        >
          <MenuItem value="A">Active</MenuItem>
          <MenuItem value="I">Inactive</MenuItem>
        </TextField>
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
