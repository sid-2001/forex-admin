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
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { countyState } from "@/states/state";

export default function BopCategoryFormDialog({
  open,
  onClose,
  onSubmit,
  editData,
}: any) {
  const [countries] = useRecoilState(countyState);

  const [countryCode, setCountryCode] = useState("");
  const [categoryType, setCategoryType] = useState("");
  const [bopPurposeCode, setBopPurposeCode] = useState("");
  const [bopPurposeDescription, setBopPurposeDescription] = useState("");
  const [bopPurposeSubCode, setBopPurposeSubCode] = useState("");
  const [bopPurposeSubDescription, setBopPurposeSubDescription] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (editData) {
      setCountryCode(editData.countryCode);
      setCategoryType(editData.categoryType);
      setBopPurposeCode(editData.bopPurposeCode);
      setBopPurposeDescription(editData.bopPurposeDescription);
      setBopPurposeSubCode(editData.bopPurposeSubCode);
      setBopPurposeSubDescription(editData.bopPurposeSubDescription);
      setEffectiveFrom(editData.effective_from_date.split("T")[0]);
      setEffectiveTo(editData.effective_to_date.split("T")[0]);
      setActive(editData.active);
    }
  }, [editData]);

  const handleSubmit = () => {
    onSubmit({
      countryCode,
      categoryType,
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
      <DialogTitle>{editData ? "Update BOP Category" : "Add BOP Category"}</DialogTitle>

      <DialogContent>
        <InputLabel>Country</InputLabel>
        <Select
          fullWidth
          value={countryCode}
          disabled={!!editData}
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

        <TextField label="Category Type" fullWidth margin="normal" value={categoryType} onChange={(e) => setCategoryType(e.target.value)} />
        <TextField label="Purpose Code" fullWidth margin="normal" value={bopPurposeCode} onChange={(e) => setBopPurposeCode(e.target.value)} />
        <TextField label="Purpose Description" fullWidth margin="normal" value={bopPurposeDescription} onChange={(e) => setBopPurposeDescription(e.target.value)} />
        <TextField label="Sub Code" fullWidth margin="normal" value={bopPurposeSubCode} onChange={(e) => setBopPurposeSubCode(e.target.value)} />
     
        <TextField type="date" label="Effective From" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
       
         <TextField type="date" label="Effective To" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={effectiveTo} onChange={(e) => setEffectiveTo(e.target.value)} />
     

        <TextField label="Sub Description" fullWidth margin="normal" value={bopPurposeSubDescription} onChange={(e) => setBopPurposeSubDescription(e.target.value)} />

   
        <FormControlLabel control={<Checkbox checked={active} onChange={(e) => setActive(e.target.checked)} />} label="Active" />
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
