import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const UtilizationEnquiryForm: React.FC = () => {
  const [apiType, setApiType] = useState('');
  const [enquiryType, setEnquiryType] = useState('');
  const [searchBy, setSearchBy] = useState<'applicantId' | 'nationalId'>('applicantId');
  const [applicantId, setApplicantId] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  const applicant = {
    name: 'John Doe',
    permit: 'Work Permit A',
    residentStatus: 'Resident',
    salary: 5000
  };

  const limits = {
    min: 1000,
    max: 10000,
    available: 4500
  };

  const transactions = [
    { id: 1, date: '2025-05-01', description: 'Purchase A', amount: 200 },
    { id: 2, date: '2025-05-05', description: 'Purchase B', amount: 300 },
    { id: 3, date: '2025-05-10', description: 'Utility Bill', amount: 150 }
  ];

  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', width: 70 },
    { field: 'date', headerName: 'Date', width: 150 },
    { field: 'description', headerName: 'Description', width: 200 },
    { field: 'amount', headerName: 'Amount ($)', width: 150 }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" textAlign="center">
        Limit Utilization Enquiry
      </Typography>

      <Grid container spacing={2}>
        {/* Left side: Form */}
        <Grid item xs={12} md={4} sx={{width:"50vw"}} >
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal" 
            sx={{

              width:"100%"
            }}
            >
              <InputLabel id="api-type-label">API Type</InputLabel>
              <Select
                labelId="api-type-label"
                value={apiType}
                fullWidth
                onChange={(e: SelectChangeEvent) => setApiType(e.target.value)}
              >
                <MenuItem value="type1">Type 1</MenuItem>
                <MenuItem value="type2">Type 2</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="enquiry-type-label">Enquiry Type</InputLabel>
              <Select
                labelId="enquiry-type-label"
                value={enquiryType}
                onChange={(e: SelectChangeEvent) => setEnquiryType(e.target.value)}
              >
                <MenuItem value="utilization">Utilization</MenuItem>
                <MenuItem value="limit">Limit</MenuItem>
              </Select>
            </FormControl>

            <FormControl component="fieldset" margin="normal">
              <RadioGroup
                row
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value as 'applicantId' | 'nationalId')}
              >
                <FormControlLabel value="applicantId" control={<Radio />} label="Applicant ID" />
                <FormControlLabel value="nationalId" control={<Radio />} label="National ID" />
              </RadioGroup>
            </FormControl>
            {searchBy === 'applicantId' ? (
  <TextField
    label="Applicant ID"
    fullWidth
    margin="normal"
    value={applicantId}
    onChange={(e) => setApplicantId(e.target.value)}
  />
) : (
  <>
    <FormControl fullWidth margin="normal">
      <InputLabel id="national-id-label">Select National ID</InputLabel>
      <Select
        labelId="national-id-label"
        value={nationalId}
        onChange={(e: SelectChangeEvent) => setNationalId(e.target.value)}
      >
        <MenuItem value="NAT123">NAT123</MenuItem>
        <MenuItem value="NAT456">NAT456</MenuItem>
      </Select>
    </FormControl>

    {nationalId && (
      <TextField
        label="National ID Number"
        fullWidth
        margin="normal"
        value={nationalId}
       
      />
    )}
  </>
)}


            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Submit
            </Button>
          </form>
        </Grid>

        {/* Right side: Result Panel */}
        {showResults && (
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Applicant Info</Typography>
                    <Typography>Name: {applicant.name}</Typography>
                    <Typography>Permit: {applicant.permit}</Typography>
                    <Typography>Status: {applicant.residentStatus}</Typography>
                    <Typography>Monthly Salary: ${applicant.salary}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Limits</Typography>
                    <Typography>Min Limit: ${limits.min}</Typography>
                    <Typography>Max Limit: ${limits.max}</Typography>
                    <Typography>Available: ${limits.available}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Transactions
                </Typography>
                <Box sx={{ height: 300, width: '100%' }}>
                  <DataGrid
                    rows={transactions}
                    columns={columns}
                      //@ts-ignore

                    pageSize={5}
                    disableRowSelectionOnClick
                    sx={{
                      '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#1976d2',
                        color: '#fff',
                        fontWeight: 'bold'
                      }
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default UtilizationEnquiryForm;
