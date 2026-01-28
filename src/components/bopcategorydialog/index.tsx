import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormHelperText,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { countyState } from "@/states/state";

export default function BopCategoryFormDialog({
  open,
  onClose,
  onSubmit,
  editData,
  categorylist,
}: any) {
  const [countries] = useRecoilState(countyState);

  const [countryCode, setCountryCode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [bopPurposeCode, setBopPurposeCode] = useState("");
  const [bopPurposeDescription, setBopPurposeDescription] = useState("");
  const [bopPurposeSubCode, setBopPurposeSubCode] = useState("");
  const [bopPurposeSubDescription, setBopPurposeSubDescription] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [active, setActive] = useState(true);

  const [errors, setErrors] = useState<any>({});

  /* ------------------ Edit Mode ------------------ */
  useEffect(() => {
    if (editData) {
      setCountryCode(editData.countryCode);
      setSelectedCategory(editData.categoryType);
      setBopPurposeCode(editData.bopPurposeCode);
      setBopPurposeDescription(editData.bopPurposeDescription);
      setBopPurposeSubCode(editData.bopPurposeSubCode);
      setBopPurposeSubDescription(editData.bopPurposeSubDescription);
      setEffectiveFrom(editData.effective_from_date.split("T")[0]);
      setEffectiveTo(editData.effective_to_date.split("T")[0]);
      setActive(editData.active);
    }
  }, [editData]);

  /* ------------------ Validation ------------------ */
  const validate = () => {
    const newErrors: any = {};

    if (!countryCode) newErrors.countryCode = "Country is required";
    if (!selectedCategory) newErrors.categoryType = "Category Type is required";
    if (!bopPurposeCode.trim())
      newErrors.bopPurposeCode = "Purpose Code is required";
    if (!bopPurposeDescription.trim())
      newErrors.bopPurposeDescription = "Purpose Description is required";
    if (!bopPurposeSubCode.trim())
      newErrors.bopPurposeSubCode = "Sub Code is required";
    if (!bopPurposeSubDescription.trim())
      newErrors.bopPurposeSubDescription = "Sub Description is required";
    if (!effectiveFrom)
      newErrors.effectiveFrom = "Effective From date is required";
    if (!effectiveTo)
      newErrors.effectiveTo = "Effective To date is required";

    if (
      effectiveFrom &&
      effectiveTo &&
      new Date(effectiveTo) < new Date(effectiveFrom)
    ) {
      newErrors.effectiveTo =
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
      categoryType: selectedCategory,
      bopPurposeCode,
      bopPurposeDescription,
      bopPurposeSubCode,
      bopPurposeSubDescription,
      effective_from_date: `${effectiveFrom}T00:00:00`,
      effective_to_date: `${effectiveTo}T23:59:59`,
      active,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {editData ? "Update BOP Category" : "Add BOP Category"}
      </DialogTitle>

      <DialogContent>
        {/* -------- Country -------- */}
        <Box mt={1}>
          <InputLabel required>Country</InputLabel>
          <Select
            fullWidth
            value={countryCode}
            disabled={!!editData}
            error={!!errors.countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          >
            {countries
              ?.filter((c) => c.status === "A")
              .map((c) => (
                <MenuItem
                //@ts-ignore
                key={c.countryCode} value={c.countryCode}>
                  {c.countryName}
                </MenuItem>
              ))}
          </Select>
          {errors.countryCode && (
            <FormHelperText error>{errors.countryCode}</FormHelperText>
          )}
        </Box>

        {/* -------- Category Type -------- */}
        <Box mt={2}>
          <InputLabel required>Category Type</InputLabel>
          <Select
            fullWidth
            value={selectedCategory}
            disabled={!!editData}
            error={!!errors.categoryType}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categorylist?.map((c: any) => (
              <MenuItem
                key={c.bopCategoryTypeCode}
                value={c.bopCategoryTypeCode}
              >
                {c.bopCategoryType}
              </MenuItem>
            ))}
          </Select>
          {errors.categoryType && (
            <FormHelperText error>{errors.categoryType}</FormHelperText>
          )}
        </Box>

        <TextField
          label="Purpose Code"
          fullWidth
          required
          margin="normal"
          value={bopPurposeCode}
          error={!!errors.bopPurposeCode}
          helperText={errors.bopPurposeCode}
          onChange={(e) => setBopPurposeCode(e.target.value)}
        />

        <TextField
          label="Purpose Description"
          fullWidth
          required
          margin="normal"
          value={bopPurposeDescription}
          error={!!errors.bopPurposeDescription}
          helperText={errors.bopPurposeDescription}
          onChange={(e) => setBopPurposeDescription(e.target.value)}
        />

        <TextField
          label="Sub Code"
          fullWidth
          required
          margin="normal"
          value={bopPurposeSubCode}
          error={!!errors.bopPurposeSubCode}
          helperText={errors.bopPurposeSubCode}
          onChange={(e) => setBopPurposeSubCode(e.target.value)}
        />

        <TextField
          label="Sub Description"
          fullWidth
          required
          margin="normal"
          value={bopPurposeSubDescription}
          error={!!errors.bopPurposeSubDescription}
          helperText={errors.bopPurposeSubDescription}
          onChange={(e) =>
            setBopPurposeSubDescription(e.target.value)
          }
        />

        <TextField
          type="date"
          label="Effective From"
          fullWidth
          required
          margin="normal"
          InputLabelProps={{ shrink: true }}
          value={effectiveFrom}
          error={!!errors.effectiveFrom}
          helperText={errors.effectiveFrom}
          onChange={(e) => setEffectiveFrom(e.target.value)}
        />

        <TextField
          type="date"
          label="Effective To"
          fullWidth
          required
          margin="normal"
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: effectiveFrom }}
          value={effectiveTo}
          error={!!errors.effectiveTo}
          helperText={errors.effectiveTo}
          onChange={(e) => setEffectiveTo(e.target.value)}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
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
