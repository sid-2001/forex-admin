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
const [selectedCountry, setSelectedCountry] = useState<string>('')
const [countries, setCountries] = useRecoilState(countyState)


  useEffect(() => {
    if (editData) {
      setGendercode(editData.gendercode);
      setDescription(editData.description);
      setActive(editData.active);
    } else {
      setGendercode("");
      setDescription("");
      setActive(true);
    }
  }, [editData]);

  const handleSubmit = () => {
    onSubmit({
      gendercode,
      description,
      active
    });
  };

    const handleCountryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const countryCode = event.target.value as string
    
        setSelectedCountry(countryCode)
    
        // Find the selected country
        const selected = countries.find((country) => country.countryCode == countryCode)
        console.log('selected', selected)
    
      }
  

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{editData ? "Update Gender" : "Add Gender"}</DialogTitle>

      <DialogContent>
        <TextField
          label="Gender Code"
          fullWidth
          margin="normal"
          value={gendercode}
          disabled={!!editData}
          onChange={(e) => setGendercode(e.target.value)}
        />

        <TextField
          label="Description"
          fullWidth
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

         
                         
                              <InputLabel>Destination Country</InputLabel>
                              <Select
                                value={selectedCountry}
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
