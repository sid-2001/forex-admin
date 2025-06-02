import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowModel } from "@mui/x-data-grid";
import SaveIcon from "@mui/icons-material/Save";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { ChargesService } from "@/services/charges.service";

const ListCharges = () => {
  const [charges, setCharges] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const countries = ["SA", "IN","US","MX"]; // Example countries for dropdown

  // Simulate fetching data from an API
  useEffect(() => {
    setLoading(true);
  
    chages_service.GetCharges().then(data=>{

        console.log(data)


        setCharges(data)
            setLoading(false);
        
            }).catch(err=>{
        
        console.log(err)
            })

  }, []);

  // Handle Save for each row
  const handleSaveRecord = (record: any) => {
    const payload = {
      ...record,
      effectiveStartDate: record.effectiveStartDate?.format(),
      effectiveEndDate: record.effectiveEndDate?.format(),
    };

    // Simulate API Save
    setTimeout(() => {
      console.log("Updated Record:", payload);
    }, 1500);
  };

  const columns: GridColDef[] = [
    {
      field: "sendingCountry",
      headerName: "Sending Country",
      width: 180,
      headerClassName: 'super-app-theme--header',
      editable: true,
      renderCell: (params) => (
        <FormControl fullWidth>
          <Select
            value={params.value}
            onChange={(e) => {
              const updatedRows = [...charges];
              //@ts-ignore
              updatedRows[params.rowIndex].sendingCountry = e.target.value;
              setCharges(updatedRows);
            }}
          >
            {countries.map((country) => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ),
    },
    {
      field: "receivingCountry",
      headerName: "Receiving Country",
      width: 180,
      editable: true,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <FormControl fullWidth>
          <Select
            value={params.value}
            onChange={(e) => {
              const updatedRows = [...charges];
              //@ts-ignore
              updatedRows[params.rowIndex].receivingCountry = e.target.value;
              setCharges(updatedRows);
            }}
          >
            {countries.map((country) => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ),
    },
    {
      field: "productCode",
      headerName: "Product Code",
      width: 150,
      editable: true,
      headerClassName: 'super-app-theme--header'
    },
    {
      field: "speed",
      headerName: "Speed",
      width: 150,
      editable: true,
      headerClassName: 'super-app-theme--header'
    },
    {
      field: "speedCodeForCountry",
      headerName: "Speed Code",
      width: 150,
      editable: true,
      headerClassName: 'super-app-theme--header'
    },
    {
      field: "lowerSlab",
      headerName: "Lower Slab",
      width: 150,
      editable: true,
      type: "number",
      headerClassName: 'super-app-theme--header'
    },
    {
      field: "upperSlab",
      headerName: "Upper Slab",
      width: 150,
      editable: true,
      type: "number",
      headerClassName: 'super-app-theme--header'
    },
    {
      field: "minimumCharges",
      headerName: "Minimum Charges",
      width: 180,
      editable: true,
      type: "number",
      headerClassName: 'super-app-theme--header'
    },
    {
      field: "percentageCutOffAmount",
      headerName: "Cut-off %",
      width: 180,
      editable: true,
      type: "number",
      headerClassName: 'super-app-theme--header'
    },
    {
      field: "percentageToBeApplied",
      headerName: "Apply %",
      width: 180,
      editable: true,
      type: "number",
      headerClassName: 'super-app-theme--header'
    },
    {
      field: "effectiveStartDate",
      headerName: "Start Date & Time",
      width: 220,
      headerClassName: 'super-app-theme--header',
      editable: false,

    },
    {
      field: "effectiveEndDate",
      headerName: "End Date & Time",
      width: 220,
      headerClassName: 'super-app-theme--header',
      editable: false,
   
    },
    {
      field: "marketSegment",
      headerName: "Market Segment",
      width: 180,
      editable: true,
      headerClassName: 'super-app-theme--header'
    },
    {
      field: "calculatedCharge",
      headerName: "Calculated Charge",
      width: 180,
      editable: true,
      type: "number",
      headerClassName: 'super-app-theme--header'
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Button
          onClick={() => handleSaveRecord(params.row)}
          startIcon={<SaveIcon />}
          variant="contained"
        >
          Save
        </Button>
      ),
    },
  ];




  let navigate=useNavigate()
  let chages_service=new ChargesService()

  const handleAddCharge=()=>{

 
  navigate('/charges/add')

  }

  return (
    <Box sx={{ height: '50vh', width: "70vw",
       
        '& .super-app-theme--header': {
            backgroundColor: '#005099',
            color: 'white',
          } 
          
          }}>


<Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleAddCharge}>
          Add Charges
        </Button>
      </Box>

            
      {loading ? (
        <CircularProgress />
      ) : (
        <DataGrid
          rows={charges}
          columns={columns}
          //@ts-ignore
          pageSize={5}
         
          disableSelectionOnClick
        />
      )}
    </Box>
  );
};

export default ListCharges;
