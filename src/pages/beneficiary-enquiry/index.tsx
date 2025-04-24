import React, { useState } from 'react';
import { Box, Grid, TextField, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BeneficiaryService } from '@/services/beneficiary.service';
import BeneficiaryTable from '@/components/beneficiary-table';

const beneficiary_service = new BeneficiaryService();

const BeneficiaryEnquiry = () => {
  const navigate = useNavigate();
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [applicantId, setApplicantId] = useState('');
  const [filteredBeneficiary, setFilteredBeneficiary] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [errors, setErrors] = useState({
    beneficiaryId: '',
    applicantId: ''
  });

  const handleSearchBeneficiary = async () => {
    try {
      let data;
      if (beneficiaryId && applicantId) {
        data = await beneficiary_service.searchByBeneficiaryIdAndApplicantId(beneficiaryId, applicantId);
      } else if (beneficiaryId) {
        data = await beneficiary_service.searchByBeneficiaryId(beneficiaryId);
        const beneficiaryArray = Array.isArray(data) ? data : [data];
        const formattedData = beneficiaryArray.map((beneficiary, index) =>( {
            id: index + 1,
            beneficiaryId: beneficiary?.beneficiaryId,  
            beneficiaryName: beneficiary?.beneficiaryName,  
            bankName: beneficiary?.bankName,  
            bankBicCode: beneficiary?.bankBicCode,  
            idType: beneficiary?.idType,  
        
        }));
        
         //@ts-ignore
      setFilteredBeneficiary(formattedData);

      } else if (applicantId) {
        data = await beneficiary_service.searchByApplicantId(applicantId);
          const beneficiaryArray = Array.isArray(data) ? data : [data];
         
          const formattedData = beneficiaryArray[0]?.data?.map(
             //@ts-ignore
            (beneficiary, index) =>( {   
              id: index + 1,
              beneficiaryId: beneficiary?.beneficiaryId,  
              beneficiaryName: beneficiary?.beneficiaryName, 
              accountNumber: beneficiary?.accountNumber,  
              bankName: beneficiary?.bankName,  
              bankBicCode: beneficiary?.bankBicCode,  
              idType: beneficiary?.idType,  
            
          }));
          
      setFilteredBeneficiary(formattedData);
      }

      setShowTable(true);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  const handleAddBeneficiaryDetails = () => {
    navigate('/add-beneficiary');
  };

  const handleBeneficiaryIdChange = (e:any) => {
    const value = e.target.value.toUpperCase();
    setBeneficiaryId(value);
  };

  const handleApplicantIdChange = (e:any) => {
    const value = e.target.value.toUpperCase();
    setApplicantId(value);
  };

  return (
    <Box padding={2} sx={{ width: '70vw' }}>
      <Typography variant="h4" gutterBottom>
        <strong>Beneficiary Enquiry</strong>
      </Typography>

      <Grid container spacing={3} marginBottom={2} alignItems="center">
        <Grid item xs={3}>
          <TextField
            variant="standard"
            fullWidth 
            label="Beneficiary ID"
            value={beneficiaryId}
            onChange={handleBeneficiaryIdChange}
            inputProps={{ maxLength: 100 }}
          />
        </Grid>
        <Grid marginInline={4} marginTop={4}>
                  <strong>OR</strong>
          </Grid>

        <Grid item xs={3}>
          <TextField
            variant="standard"
            fullWidth
            label="Applicant ID"
            value={applicantId}
            onChange={handleApplicantIdChange}
            inputProps={{ maxLength: 100 }}
          />
        </Grid>

        <Grid item xs={4} container spacing={2}>
          <Grid item xs={4}>
            <Button variant="contained" sx={{ padding: '4px 20px' }} onClick={handleSearchBeneficiary}>
              Search
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button variant="contained" sx={{ marginLeft: '50px', padding: '4px 20px' }} onClick={handleAddBeneficiaryDetails}>
              Add
            </Button>
          </Grid>
        </Grid>
      </Grid>

      {/* Conditionally render the table if there is data in filteredBeneficiary */}
      {showTable && (
        <BeneficiaryTable beneficiary={filteredBeneficiary} deleteBeneficiary={filteredBeneficiary} applicantId={applicantId} />
      )}
    </Box>
  );
};

export default BeneficiaryEnquiry;
