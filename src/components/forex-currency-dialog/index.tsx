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
import { ForexCurrency } from "@/services/forex-currency.service";
import { countyState } from "@/states/state";
// import        from "../../states/state";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: ForexCurrency | null;
}

export default function ForexCurrencyDialog({
  open,
  onClose,
  onSubmit,
  editData
}: Props) {
  const localService = new LocalStorageService();
  const countries = useRecoilValue(countyState);

  const [form, setForm] = useState<any>({
    countryCode: "",
    currencyCode: "",
    currencyName: "",
    currencySymbol: "",
    active: true
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (editData) {
      setForm({ ...editData });
    } else {
      setForm({
        countryCode: "",
        currencyCode: "",
        currencyName: "",
        currencySymbol: "",
        active: true
      });
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
    if (!form.currencyCode) newErrors.currencyCode = "Currency code is required";
    if (!form.currencyName) newErrors.currencyName = "Currency name is required";
    if (!form.currencySymbol) newErrors.currencySymbol = "Symbol is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        {editData ? "Update Currency" : "Add Currency"}
      </DialogTitle>

      <DialogContent>
        {/* Country Dropdown */}
        <TextField
          select
          required
          label="Country"
          fullWidth
          margin="dense"
          value={form.countryCode}
          disabled={!!editData}
          error={!!errors.countryCode}
          helperText={errors.countryCode}
          onChange={(e) => handleChange("countryCode", e.target.value)}
        >
          {countries.map((c) => (
            <MenuItem key={c.countryCode} value={c.countryCode}>
              {c.countryName} ({c.countryCode})
            </MenuItem>
          ))}
        </TextField>

        <TextField
          required
          label="Currency Code"
          fullWidth
          margin="dense"
          value={form.currencyCode}
          error={!!errors.currencyCode}
          helperText={errors.currencyCode}
          onChange={(e) => handleChange("currencyCode", e.target.value)}
        />

        <TextField
          required
          label="Currency Name"
          fullWidth
          margin="dense"
          value={form.currencyName}
          error={!!errors.currencyName}
          helperText={errors.currencyName}
          onChange={(e) => handleChange("currencyName", e.target.value)}
        />

        <TextField
          required
          label="Currency Symbol"
          fullWidth
          margin="dense"
          value={form.currencySymbol}
          error={!!errors.currencySymbol}
          helperText={errors.currencySymbol}
          onChange={(e) => handleChange("currencySymbol", e.target.value)}
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
