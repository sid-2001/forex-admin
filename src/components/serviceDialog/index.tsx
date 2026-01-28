import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { countyState } from "@/states/state";

export default function ServiceFormDialog({
  open,
  onClose,
  onSubmit,
  editData,
}: any) {
  const [countries] = useRecoilState(countyState);

  const [countryCode, setCountryCode] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [active, setActive] = useState(true);
  const [effectiveFromDate, setEffectiveFromDate] = useState("");
  const [effectiveToDate, setEffectiveToDate] = useState("");

  const [errors, setErrors] = useState<any>({});

  /* ------------------ Populate Edit Data ------------------ */
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
      setErrors({});
    }
  }, [editData, open]);

  /* ------------------ Validation ------------------ */
  const validate = () => {
    const newErrors: any = {};

    if (!countryCode) newErrors.countryCode = "Country is required";

    if (!serviceDescription.trim())
      newErrors.serviceDescription = "Service Description is required";

    if (!effectiveFromDate)
      newErrors.effectiveFromDate = "Effective From date is required";

    if (!effectiveToDate)
      newErrors.effectiveToDate = "Effective To date is required";

    if (
      effectiveFromDate &&
      effectiveToDate &&
      new Date(effectiveToDate) < new Date(effectiveFromDate)
    ) {
      newErrors.effectiveToDate =
        "Effective To date cannot be before Effective From";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ------------------ Submit ------------------ */
  const handleSubmit = () => {
    if (!validate()) return;

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
      <DialogTitle>
        {editData ? "Update Service" : "Create Service"}
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {/* Country */}
          <InputLabel required>Country</InputLabel>
          <Select
            value={countryCode}
            fullWidth
            disabled={!!editData}
            error={!!errors.countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          >
            {countries
              ?.filter((c) => c.status === "A")
              .map((c) => (
                <MenuItem
                  //@ts-ignore
                  key={c.countryCode}
                  value={c.countryCode}
                >
                  {c.countryName}
                </MenuItem>
              ))}
          </Select>
          {errors.countryCode && (
            <FormHelperText error>{errors.countryCode}</FormHelperText>
          )}

          {/* Service Description */}
          <TextField
            required
            label="Service Description"
            fullWidth
            value={serviceDescription}
            error={!!errors.serviceDescription}
            helperText={errors.serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
          />

          {/* Effective From */}
          <TextField
            required
            type="date"
            label="Effective From"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={effectiveFromDate}
            error={!!errors.effectiveFromDate}
            helperText={errors.effectiveFromDate}
            onChange={(e) => setEffectiveFromDate(e.target.value)}
          />

          {/* Effective To */}
          <TextField
            required
            type="date"
            label="Effective To"
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: effectiveFromDate }}
            value={effectiveToDate}
            error={!!errors.effectiveToDate}
            helperText={errors.effectiveToDate}
            onChange={(e) => setEffectiveToDate(e.target.value)}
          />

          {/* Active */}
          <FormControlLabel
            control={
              <Checkbox
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
            }
            label="Active"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {editData ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
