import React, { useCallback, useEffect, useState } from 'react';
import { Box, Grid, TextField, Typography, Button, Switch, FormControlLabel } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import TransactionTable from '../transaction-table';
import { BeneficiaryService } from '@/services/beneficiary.service';

const beneficiary_service = new BeneficiaryService();

const BeneficiaryDetailPage = () => {
  const navigate = useNavigate();
  const {beneficiaryId} = useParams();
  
  const [formData, setFormData] = useState<any>([]);
  const [isEditable, setIsEditable] = useState(false);
  const [tempData, setTempData] = useState<any>([]);
  const [isChanged, setIsChanged] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]); // Ensure this is an array
  const [showTransactionTable, setShowTransactionTable] = useState(false);
  const [isSearchClicked, setIsSearchClicked] = useState(false);  // Track if search has been clicked

  useEffect(() => {
    const fetchBeneficiaryData = async () => {
      if (!beneficiaryId) {
        console.error("Beneficiary Id is missing");
        return;
      }
      try {
        const data = await beneficiary_service.searchByBeneficiaryId(beneficiaryId);
        setFormData(data);
        setTempData(data);
      } catch (err) {
        console.error("Error fetching data");
      }
    };
    fetchBeneficiaryData();
  }, [beneficiaryId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTempData((
      //@ts-ignore
      prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setIsChanged(true);
  };

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setIsEditable(true);
      setTempData(formData);
    } else {
      setIsEditable(false);
      if (isChanged) {
        const confirmDiscardChanges = window.confirm('You have unsaved changes. Are you sure you want to discard them?');
        if (confirmDiscardChanges) {
          setTempData(formData);
          setIsChanged(false);
          console.log("Changes discarded");
        }
      } else {
        setTempData(formData);
        console.log(formData);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (isChanged) {
      const confirmSave = window.confirm('Are you sure you want to save the changes?');
      if (confirmSave) {
        try {
          const updatedData = { ...tempData }; // Collect the data to be updated
          console.log("Updated Data", updatedData);
          const response = await beneficiary_service.updateBeneficiaryForm(updatedData);
          
          setFormData(updatedData); 
          setIsChanged(false); 
          setIsEditable(false); 
          alert('Changes saved successfully!');
        } catch (error) {
          alert('Failed to save changes. Please try again later.');
        }
      }
    } else {
      alert('No changes made to save!');
    }
  };

  const fetchTransactions = useCallback(async () => {
    if (!beneficiaryId) return;

    try {
      const data = await beneficiary_service.getTransactionsByBeneficiaryId(beneficiaryId);
      const transactionArray = Array.isArray(data) ? data : [data];

      const formattedData = transactionArray[0].transactionDetailsList?.map((transaction: any, index:number) => ({
          id:index+1,
        transactionNumber: transaction?.transactionOutward?.transactionNumber,
       sendCountry: transaction?.transactionOutward?.sendCountry,
        receiveCountry: transaction?.transactionOutward?.receiveCountry,
        beneficiaryName: transaction?.beneficiary?.beneficiaryName,
        amount: transaction?.transactionOutward?.principalAmount,
        transactionStatus: transaction?.transactionOutward?.transactionStatus,
      }));

      setTransactions(formattedData || []);
      setShowTransactionTable(true); 
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [beneficiaryId]);

  const handleSearchTransaction = async () => {
    setIsSearchClicked(true);  // Indicate search was clicked
    setShowTransactionTable(true); // Show the table once button is clicked
  
    try {
      await fetchTransactions();  // Fetch the transactions
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleBack = () => {
    navigate('/beneficiary');
  };
  
  return (
    <Box sx={{ width: "50vw" }} >
      <Box  display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Beneficiary Details
            </Typography>
            <FormControlLabel
              control={<Switch disabled checked={isEditable} onChange={handleToggleChange} />}
              label="Edit Mode"
            />
       </Box>
       <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
              <Typography
                variant="body1"
                sx={{
                  backgroundColor: 'primary.main',
                  p: '0.5%',
                  color: 'white',
                  paddingBlock: 1,
                  paddingInline: 1,
                }}
              >
                Beneficiary Id - {beneficiaryId}
              </Typography>
            </Box>
      {/* Beneficiary Information Form */}
      <Box >
        <Grid container spacing={2} marginBottom={1}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Applicant ID"
              variant="filled"
              name="applicantId"
              fullWidth
              value={tempData.applicant || ''}
              InputProps={{
                readOnly: !isEditable,
              }}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} marginBottom={1}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Beneficiary Name"
              variant="filled"
              name="beneficiaryName"
              fullWidth
              value={tempData.beneficiaryName || ''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            
            <TextField
              label="Nationality"
              variant="filled"
              name="nationality"
              fullWidth
              value={tempData.nationality || ''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Resident Country"
              variant="filled"
              name="residenceCountry"
              fullWidth
              value={tempData.residenceCountry||''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} marginBottom={1}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Phone"
              variant="filled"
              name="phone"
              fullWidth
              value={tempData.phone || ''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Email"
              variant="filled"
              name="email"
              fullWidth
              value={tempData.email || ''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="ID Type"
              variant="filled"
              name="idType"
              fullWidth
              value={tempData.idType || ''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Address Section */}
      <Box mb={3} sx={{ width: "80vw" }}>
        <Typography variant="subtitle1" sx={{ color: 'grey', marginBottom: 1 }}><strong>Address</strong></Typography>
        <Grid container spacing={2} marginBottom={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Address Line 1"
              name="physicalAddressLine1"
              value={tempData?.physicalAddressLine1 || ''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Address Line 2"
              name="addressLine2"
              value={tempData.physicalAddressLine2 || ''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} marginBottom={2}>
          {/* <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Address Line 3"
              name="addressLine3"
              value={tempData.physicalAddressLine3 || ''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid> */}
          <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Suburb"
                name="suburb"
                value={tempData.suburb || ''}
                onChange={handleChange}
              />
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={tempData.city || ''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <TextField
              fullWidth
              label="State/Province"
              name="state"
              value={tempData.beneficiaryState || ''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <TextField
              fullWidth
              label="ZipCode"
              name="postCode"
              value={tempData.postCode || ''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={tempData.country || ''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Bank Account Section */}
      <Box  sx={{ width: "80vw" }} mb={3}>
        <Typography variant="subtitle1" sx={{ color: 'grey', marginBottom: 1 }}><strong>Bank Details</strong></Typography>
        <Grid container spacing={2} marginBottom={2}>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Account Holder Name"
              name="beneficiaryName"
              value={tempData.beneficiaryName || ''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Account Number"
              name="accountNumber"
              value={tempData.accountNumber || ''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Bank Name"
              name="bankName"
              value={tempData.bankName || ''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="BIC Code/ IFSC Code"
              name="bankBicCode"
              value={tempData?.bankBicCode|| ''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
           
        </Grid>
        <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Bank Location"
              name="bankLocation"
              value={tempData?.bankLocation|| ''}
              onChange={handleChange}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
        </Grid>
      </Box>

        <Grid container spacing={2} marginBottom={1}>
        <Grid item xs={12} sm={4}>
          {/* <Button variant="contained" fullWidth onClick={handleSearchTransaction}>
            Show Transaction
          </Button> */}
        </Grid>
      </Grid> 

     {showTransactionTable && transactions.length > 0 && (
        <Box mb={3}>
          <Typography variant="h6" sx={{ marginBottom: 1 }}><strong>Transactions</strong></Typography>
          
          <TransactionTable 
          //@ts-ignore
          transaction={transactions} />
        </Box>
      )}

     {showTransactionTable && transactions.length === 0 && (
        <Typography variant="body2" color="textSecondary">
          No transactions found for this beneficiary.
        </Typography>
      )}

      {/* Save and Back Buttons */}
      <Grid container spacing={2} sx={{ marginTop: 2 }} display={'flex'}>
      <Grid item xs={12} sm={3}>
          {/* <Button variant="outlined" onClick={handleBack} fullWidth>
            Back to List
          </Button> */}
        </Grid>
        <Grid item xs={12} sm={3}>
          {isEditable && (
            <Button variant="contained" fullWidth onClick={handleSaveChanges}>
              Save Changes
            </Button>
          )}
        </Grid>
        
      </Grid>

      

    </Box>
  );
};

export default BeneficiaryDetailPage;
