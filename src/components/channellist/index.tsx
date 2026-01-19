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
import { LocalStorageService } from "@/helpers/local-storage-service";

export interface Channel {
  channel_code: string;
  country_code: string;
  channel_description: string;
  active: boolean;
}


interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: any | null;
}

export default function ChannelFormDialog({
  open,
  onClose,
  onSubmit,
  editData
}: Props) {
  const [channelCode, setChannelCode] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [applicantId, setApplicantId] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");

  const [countries] = useRecoilState(countyState);
  const local_service =new LocalStorageService()

  useEffect(() => {
    if (editData) {
      setChannelCode(editData.channel_code);
      setDescription(editData.channel_description);
      setSelectedCountry(editData.country_code);
      setActive(editData.active);
       setApplicantId(editData?.applicant_id);
      setEffectiveFrom(editData?.effective_from_date);
      setEffectiveTo(editData?.effective_to_date);

    } else {
      setChannelCode("");
      setDescription("");
      setSelectedCountry("");
      setActive(false);
      setApplicantId("");
      setEffectiveFrom("");
      setEffectiveTo("");
    }
  }, [editData]);

  const handleSubmit = () => {
    onSubmit({
      applicantId,
      channelCode,
      description,
      selectedCountry,
      active,
      effectiveFrom,
      effectiveTo
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        {editData ? "Update Channel" : "Create Channel"}
      </DialogTitle>

      <DialogContent>
        {/* <TextField
          label="Applicant ID"
          fullWidth
          di
          margin="normal"
          value={applicantId}
          onChange={(e) => setApplicantId(e.target.value)}
        /> */}

        <TextField
          label="Channel Code"
          fullWidth
          margin="normal"
          inputProps={{maxlength:1}}
          value={channelCode}
          disabled={!!editData}
          onChange={(e) => setChannelCode(e.target.value)}
        />

        <TextField
          label="Channel Description"
          fullWidth
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <InputLabel>Country</InputLabel>
        <Select

          disabled={!!editData}
          fullWidth
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value as string)}
        >
          {countries
            ?.filter((c) => c.status === "A")
            .map((country) => (
              <MenuItem
              //@ts-ignore
                key={country.countryCode}
                value={country.countryCode}
              >
                <Typography>{country.countryName}</Typography>
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
              onChange={(e) => {  
              console.log("the new check vali is ",(e.target.checked));
                 
                setActive(e.target.checked)}}
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
