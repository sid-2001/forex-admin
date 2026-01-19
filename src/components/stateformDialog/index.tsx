import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { countyState } from "@/states/state";
import { kMaxLength } from "buffer";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: any | null;
}

export default function StateFormDialog({
  open,
  onClose,
  onSubmit,
  editData
}: Props) {
  const [stateCode, setStateCode] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [countryCode, setCountryCode] = useState("");
  const [applicantId, setApplicantId] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");

  const [countries] = useRecoilState(countyState);

  useEffect(() => {
    if (editData) {
      setStateCode(editData.statecode);
      setDescription(editData.statedescription);
      setCountryCode(editData.countrycode);
      setActive(editData.active);
    } else {
      setStateCode("");
      setDescription("");
      setCountryCode("");
      setActive(true);
      setApplicantId("");
      setEffectiveFrom("");
      setEffectiveTo("");
    }
  }, [editData]);

  const handleSubmit = () => {
    onSubmit({
      applicantId,
      stateCode,
      description,
      countryCode,
      active,
      effectiveFrom,
      effectiveTo
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {editData ? "Update State" : "Create State"}
      </DialogTitle>

      <DialogContent>
        {/* <TextField
          label="Applicant ID"
          fullWidth
          margin="normal"
          value={applicantId}
          onChange={(e) => setApplicantId(e.target.value)}
        /> */}

        <TextField
          label="State Code"
          fullWidth

           inputProps={{ maxLength: 2 }}
          margin="normal"
          value={stateCode}
          disabled={!!editData}
          onChange={(e) => setStateCode(e.target.value)}
        />

        <TextField
          label="State Description"
          fullWidth
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <InputLabel>Country</InputLabel>
        <Select
          fullWidth
           disabled={!!editData}
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value as string)}
        >
          {countries
            ?.filter((c) => c.status === "A")
            .map((c) => (
              <MenuItem
              //@ts-ignore
              key={c.countryCode} value={c.countryCode}>
                <Typography>{c.countryName}</Typography>
              </MenuItem>
            ))}
        </Select>

        {!editData && (
          <>
            <TextField
              type="date"
              label="Effective From"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
            />

            <TextField
              type="date"
              label="Effective To"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={effectiveTo}
              onChange={(e) => setEffectiveTo(e.target.value)}
            />
          </>
        )}

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
