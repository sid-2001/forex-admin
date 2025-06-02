import React, { useState } from "react";
import { Box, Button, CircularProgress, TextField, Grid, MenuItem, Select, InputLabel, FormControl, Autocomplete, Snackbar, SnackbarCloseReason } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { ChargesService } from "@/services/charges.service";
import { loaderStateNew } from "@/states/state";
import { RecoilState,useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";



const ChargesDataGridTable = () => {
  const [commonloader, setcommonloader] = useRecoilState(loaderStateNew)
  const [newRecord, setNewRecord] = useState<any>({
    sendingCountry: "",
    receivingCountry: "",
    productCode: "",
    speed: "",
    speedCodeForCountry: "",
    lowerSlab: 0,
    upperSlab: 0,
    minimumCharges: 0,
    percentageCutOffAmount: 0,
    percentageToBeApplied: 0,
    effectiveStartDate: dayjs(),
    effectiveEndDate: dayjs(),
    marketSegment: "",
    calculatedCharge: 0,
  });


  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (

    //@ts-ignore
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const speedOptions = [
    { label: "Slow", value: "s" },
    { label: "Fast", value: "f" },
  ];
  
  const generateId = () => Date.now();

  const countries = ["SA", "IN","US","MX"]; // Example countries for the dropdown
  let navigate=useNavigate()
  // Handle Add New Record and API Call
  const handleAddRecord = () => {
    // Simulating API Call

    setcommonloader(true)


    let charges_service=new ChargesService()
    const payload = {
      ...newRecord,
    //   effectiveStartDate: newRecord.effectiveStartDate?.format(),
    //   effectiveEndDate: newRecord.effectiveEndDate?.format(),
    effectiveStartDate: newRecord.effectiveStartDate ? newRecord.effectiveStartDate.format("YYYY-MM-DDTHH:mm:ss") : null,
    effectiveEndDate: newRecord.effectiveEndDate ? newRecord.effectiveEndDate.format("YYYY-MM-DDTHH:mm:ss") : null,
   
      id:generateId(),
      speed:newRecord.speed.value

    };
    console.log(payload)

   


    charges_service.AddCharges(payload).then(data=>{

   console.log(data)

   setcommonloader(false)
   setOpen(true);
   navigate('/configuration?tab=charges')
   

    }).catch(err=>{

        console.log(err)

        setcommonloader(false)


    })




    setTimeout(() => {
      console.log("Created Record:", payload);
      // Reset new record fields after adding
      setNewRecord({
        sendingCountry: "",
        receivingCountry: "",
        productCode: "",
        speed: "",
        speedCodeForCountry: "",
        lowerSlab: 0,
        upperSlab: 0,
        minimumCharges: 0,
        percentageCutOffAmount: 0,
        percentageToBeApplied: 0,
        effectiveStartDate: dayjs(),
        effectiveEndDate: dayjs(),
        marketSegment: "",
        calculatedCharge: 0,
      });

      setOpen(false)
    }, 1500);
  };



  
  return (
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={2}>
        {/* Sending Country Dropdown */}
        <Grid item xs={6} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Sending Country</InputLabel>
            <Select
              value={newRecord.sendingCountry}
              onChange={(e) => setNewRecord({ ...newRecord, sendingCountry: e.target.value })}
              label="Sending Country"
            >
              {countries.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Receiving Country Dropdown */}
        <Grid item xs={6} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Receiving Country</InputLabel>
            <Select
              value={newRecord.receivingCountry}
              onChange={(e) => setNewRecord({ ...newRecord, receivingCountry: e.target.value })}
              label="Receiving Country"
            >
              {countries.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} sm={4}>
          <TextField
            fullWidth
            label="Product Code"
            variant="outlined"
            value={newRecord.productCode}
            onChange={(e) => setNewRecord({ ...newRecord, productCode: e.target.value })}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
  <Autocomplete
   
    options={speedOptions}
    getOptionLabel={(option) => option.label}
    value={newRecord.speed}
    //@ts-ignore
    onChange={(event, newValue) => setNewRecord({ ...newRecord, speed: newValue })}
    renderInput={(params) => <TextField {...params} label="Speed" variant="outlined" fullWidth />}
  />
</Grid>;
        <Grid item xs={6} sm={4}>
          <TextField
            fullWidth
            label="Speed Code"
            variant="outlined"
            value={newRecord.speedCodeForCountry}
            onChange={(e) => setNewRecord({ ...newRecord, speedCodeForCountry: e.target.value })}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="Lower Slab"
            variant="outlined"
            value={newRecord.lowerSlab}
            onChange={(e) => setNewRecord({ ...newRecord, lowerSlab: parseFloat(e.target.value) })}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="Upper Slab"
            variant="outlined"
            value={newRecord.upperSlab}
            onChange={(e) => setNewRecord({ ...newRecord, upperSlab: parseFloat(e.target.value) })}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="Minimum Charges"
            variant="outlined"
            value={newRecord.minimumCharges}
            onChange={(e) => setNewRecord({ ...newRecord, minimumCharges: parseFloat(e.target.value) })}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="Cut-off %"
            variant="outlined"
            value={newRecord.percentageCutOffAmount}
            onChange={(e) => setNewRecord({ ...newRecord, percentageCutOffAmount: parseFloat(e.target.value) })}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="Apply %"
            variant="outlined"
            value={newRecord.percentageToBeApplied}
            onChange={(e) => setNewRecord({ ...newRecord, percentageToBeApplied: parseFloat(e.target.value) })}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField
            fullWidth
            label="Market Segment"
            variant="outlined"
            value={newRecord.marketSegment}
            onChange={(e) => setNewRecord({ ...newRecord, marketSegment: e.target.value })}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <TextField
            fullWidth
            type="number"
            label="Calculated Charge"
            variant="outlined"
            value={newRecord.calculatedCharge}
            onChange={(e) => setNewRecord({ ...newRecord, calculatedCharge: parseFloat(e.target.value) })}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Effective Start Date & Time"
              value={newRecord.effectiveStartDate}
              onChange={(newValue) => setNewRecord({ ...newRecord, effectiveStartDate: newValue })}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={6} sm={4}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Effective End Date & Time"
              value={newRecord.effectiveEndDate}
              onChange={(newValue) => setNewRecord({ ...newRecord, effectiveEndDate: newValue })}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
      <Box sx={{ marginTop: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddRecord}
          startIcon={<SaveIcon />}
          disabled={!newRecord.sendingCountry || !newRecord.receivingCountry || !newRecord.productCode}
        >
          Create Record
        </Button>



        <Snackbar
  open={open}
  autoHideDuration={6000}
  onClose={handleClose}
  message="Note archived"



/>
      </Box>


  
    </Box>
  );
};

export default ChargesDataGridTable;


