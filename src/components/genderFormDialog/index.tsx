import { LocalStorageService } from "@/helpers/local-storage-service";
import { countyState } from "@/states/state";
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
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
interface Gender {
  gendercode: string;
  description: string;
  active: boolean;
   created_by:any;
   effectivefromdate:any,
    effectivetodate:any,
   countrycode:any
}
interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: Gender | null;
}

export default function GenderFormDialog({
  open,
  onClose,
  onSubmit,
  editData
}: Props) {
  const [gendercode, setGendercode] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const local_service =new LocalStorageService();
  const [username, setUsername] = useState(local_service?.get_staff_id());
const [effectiveFrom, setEffectiveFrom] = useState("");
const [effectiveTo, setEffectiveTo] = useState("");
const [selectedCountry, setSelectedCountry] = useState<string>('')
const [countries, setCountries] = useRecoilState(countyState)



  useEffect(() => {
    if (editData) {
      setGendercode(editData.gendercode);
      setDescription(editData.description);
      setActive(editData.active);

    setUsername(editData?.created_by);
    setEffectiveFrom(editData?.effectivefromdate.split("T")[0]);
    setEffectiveTo(editData?.effectivetodate.split("T")[0]);
    setSelectedCountry(editData?.countrycode);
    } else {
       setGendercode("");
    setDescription("");
    setActive(true);
    setUsername("");
    setEffectiveFrom("");
    setEffectiveTo("");
    }
  }, [editData]);

  const handleSubmit = () => {
    onSubmit({
       gendercode,
    description,
    active,
    selectedCountry,
    username,
    effectiveFrom,
    effectiveTo
    });
  };

    const handleCountryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const countryCode = event.target.value as string
      console.log(countryCode)
        setSelectedCountry(countryCode)
    
      
        const selected = countries.find((country) => country.countryCode == countryCode)
      
    
      }
  

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{editData ? "Update Gender" : "Add Gender"}</DialogTitle>

      <DialogContent>
        <TextField
          label="Gender Code"
          fullWidth
         inputProps={{ maxLength: 1 }}
          margin="normal"
          required
          value={gendercode}
          disabled={!!editData}
          onChange={(e) => setGendercode(e.target.value)}
        />

        <TextField
          label="Description"
          fullWidth
          required
            inputProps={{ maxLength: 15 }}
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

         
                         
                              <InputLabel>Destination Country</InputLabel>
                            
                              <Select
                              required
                                value={selectedCountry}
                                fullWidth
                                style={{

                                  width:"100%"
                                }}
                                //@ts-ignore
                                  disabled={!!editData}
                                  //@ts-ignore
                                onChange={handleCountryChange}
                                displayEmpty
                              >
                                {
                                  //(userCountry === 'IN' ? countries : countries)
                                  countries
                                    ?.filter((item) => item.status === 'A')
                                    .map((country) => (
                                      <MenuItem
                                        //@ts-ignore
                                        key={country?.countryCode}
                                        value={country.countryCode}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                          <Typography>{country?.countryName}</Typography>
                                        </div>
                                      </MenuItem>
                                    ))
                                }
                              </Select>


<TextField
  label="Effective From Date"
  type="date"
  required
  fullWidth
  margin="normal"
  InputLabelProps={{ shrink: true }}
  value={effectiveFrom}
  defaultValue={effectiveFrom}
  onChange={(e) => setEffectiveFrom(e.target.value)}
  //   inputProps={{
  //   readOnly: true,   // ⬅️ prevents manual typing
  // }}
   inputProps={{
    min: effectiveFrom, // 👈 prevents selecting earlier date
  }}
/>

<TextField
  label="Effective To Date"
  type="date"
  fullWidth
  required
  margin="normal"
  InputLabelProps={{ shrink: true }}
  value={effectiveTo}
  defaultValue={effectiveTo}
  onChange={(e) => setEffectiveTo(e.target.value)}
    inputProps={{
    // readOnly: true, 
    min:effectiveFrom
  }}

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
