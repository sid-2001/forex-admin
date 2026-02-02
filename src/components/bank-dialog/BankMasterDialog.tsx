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
import { LocalStorageService } from "@/helpers/local-storage-service";
import { BankMaster } from "../../services/bankmaster.service";
import { useRecoilValue } from "recoil";
import { countyState } from "@/states/state";

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
  const countries = useRecoilValue(countyState);

  const [form, setForm] = useState<any>({
    countryCode: "",
    currencyCode: "INR",
    bankCode: "",
    bankName: "",
    bankBranchCode: "",
    bankIfscBicCode: "",
    bankStateProvinceCode: "",
    bankCity: "",
    bankPostalCode: "",
    active: true,
    effective_from_date: "",
    effective_to_date: ""
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (editData) {
      setForm({
        ...editData,
        effective_from_date: editData.effective_from_date?.split("T")[0],
        effective_to_date: editData.effective_to_date?.split("T")[0]
      });
    } else {
      resetForm();
    }
    setErrors({});
  }, [editData, open]);

  const resetForm = () => {
    setForm({
      countryCode: "",
      currencyCode: "INR",
      bankCode: "",
      bankName: "",
      bankBranchCode: "",
      bankIfscBicCode: "",
      bankStateProvinceCode: "",
      bankCity: "",
      bankPostalCode: "",
      active: true,
      effective_from_date: "",
      effective_to_date: ""
    });
  };

  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const validate = () => {
    const newErrors: any = {};

    if (!form.countryCode) newErrors.countryCode = "Country is required";
    if (!form.bankCode) newErrors.bankCode = "Bank Code is required";
    if (!form.bankName) newErrors.bankName = "Bank Name is required";
    if (!form.bankBranchCode) newErrors.bankBranchCode = "Branch Code is required";
    if (!form.bankIfscBicCode) newErrors.bankIfscBicCode = "IFSC / BIC is required";
    if (!form.bankCity) newErrors.bankCity = "City is required";
    if (!form.bankStateProvinceCode) newErrors.bankStateProvinceCode = "State is required";
    if (!form.bankPostalCode) newErrors.bankPostalCode = "Postal Code is required";
    if (!form.effective_from_date) newErrors.effective_from_date = "Effective From is required";
    if (!form.effective_to_date) newErrors.effective_to_date = "Effective To is required";

    if (
      form.effective_from_date &&
      form.effective_to_date &&
      new Date(form.effective_from_date) > new Date(form.effective_to_date)
    ) {
      newErrors.effective_to_date = "Effective To must be after Effective From";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

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
      <DialogTitle>{editData ? "Update Bank" : "Add Bank"}</DialogTitle>

      <DialogContent>
        {/* Country */}
        <TextField
          select
          label="Country"
          required
          fullWidth
          margin="dense"
          value={form.countryCode}
          error={!!errors.countryCode}
          helperText={errors.countryCode}
          onChange={(e) => handleChange("countryCode", e.target.value)}
        >
          {countries?.map((c: any) => (
            <MenuItem key={c.countryCode} value={c.countryCode}>
              {c.countryName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Bank Code"
          fullWidth
          margin="dense"
          required
          disabled={!!editData}
          value={form.bankCode}
          error={!!errors.bankCode}
          helperText={errors.bankCode}
          onChange={(e) => handleChange("bankCode", e.target.value)}
        />

        <TextField
          label="Bank Name"
          fullWidth
          margin="dense"
          required
          value={form.bankName}
          error={!!errors.bankName}
          helperText={errors.bankName}
          onChange={(e) => handleChange("bankName", e.target.value)}
        />

        <TextField
          label="Branch Code"
          fullWidth
          margin="dense"
          required
          value={form.bankBranchCode}
          error={!!errors.bankBranchCode}
          helperText={errors.bankBranchCode}
          onChange={(e) => handleChange("bankBranchCode", e.target.value)}
        />

        <TextField
          label="IFSC / BIC"
          fullWidth
          margin="dense"
          required
          value={form.bankIfscBicCode}
          error={!!errors.bankIfscBicCode}
          helperText={errors.bankIfscBicCode}
          onChange={(e) => handleChange("bankIfscBicCode", e.target.value)}
        />

        <TextField
          label="City"
          fullWidth
          margin="dense"
          required
          value={form.bankCity}
          error={!!errors.bankCity}
          helperText={errors.bankCity}
          onChange={(e) => handleChange("bankCity", e.target.value)}
        />

        <TextField
          label="State"
          fullWidth
          margin="dense"
          required
          value={form.bankStateProvinceCode}
          error={!!errors.bankStateProvinceCode}
          helperText={errors.bankStateProvinceCode}
          onChange={(e) => handleChange("bankStateProvinceCode", e.target.value)}
        />

        <TextField
          label="Postal Code"
          fullWidth
          margin="dense"
          required
          value={form.bankPostalCode}
          error={!!errors.bankPostalCode}
          helperText={errors.bankPostalCode}
          onChange={(e) => handleChange("bankPostalCode", e.target.value)}
        />

        <TextField
          label="Effective From"
          type="date"
          fullWidth
          margin="dense"
          required
          InputLabelProps={{ shrink: true }}
          value={form.effective_from_date}
          error={!!errors.effective_from_date}
          helperText={errors.effective_from_date}
          onChange={(e) => handleChange("effective_from_date", e.target.value)}
        />

        <TextField
          label="Effective To"
          type="date"
          fullWidth
          margin="dense"
          required
          InputLabelProps={{ shrink: true }}
          value={form.effective_to_date}
          error={!!errors.effective_to_date}
          helperText={errors.effective_to_date}
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
