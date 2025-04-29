import React, { useEffect, useState } from 'react';
import { Box, Grid, TextField, Typography, Button, useTheme, InputAdornment, Avatar, Paper, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BeneficiaryFormData, BeneficiaryFormErrors } from '@/types/beneficiary.type';
import { BeneficiaryService } from '@/services/beneficiary.service';
import { ApplicantService } from '@/services/applicant.service';
import { useRecoilState } from 'recoil';
import { loaderState, loaderStateNew } from '@/states/state';

import { useParams } from 'react-router-dom';
const beneficiary_service = new BeneficiaryService();
const AddBeneficiary = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [text, setText] = useState('');
  const [type, setType] = useState('');
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showList, setShowList] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [commonloader, setcommonloader] = useRecoilState(loaderStateNew)
  const [userList, setUserList] = useState([])

  const { id } = useParams();

  let applicant_service = new ApplicantService()

  useEffect(() => {
    setcommonloader(true)
    applicant_service.getApplicantDetalis().then(data => {
      console.log(data)
      let users = data.map((e) => {
        let benificiary_list = e.beneficiaryList.map((b) => {
          return (
            {
              "benificaryId": b.beneficiaryId,
              "name": b.beneficiaryName,
              "accountHolderName": b.beneficiaryName,
              "accountNumber": b.bankBicCode,
              "bank": b.bankName,
              "ifscCode": b.bankBicCode
            })
        })

        return ({
          "applicantId": e.applicant.applicantId,
          id: e.applicant.applicantId,
          //@ts-ignore
          name: e.applicant?.firstName,
          accountNumber: '**********789',
          profilePhoto: 'https://randomuser.me/api/portraits/women/4.jpg',
          benificary: benificiary_list

        })
      })


   let seletex_user= users.filter((e)=>e.id==id)
console.log("the selecte duser ",seletex_user)
  setSelectedUser(seletex_user[0]
  )


      setUserList(users as any)
      setcommonloader(false)

    })


  

    

    // console.log(se)

  }, [])


  const handleUserSelect = async (user: any) => {


  


    console.log(user)

    setSelectedUser(user);
    setSearchText(user.name);
    setShowList(false);
    setUserDetails(null);

    try {
      let applicant_service = new ApplicantService();

      console.log("Selected User:", user);

      // Fetch compliance data with testing data appended
      let comp_data = await applicant_service.getCompliance({
        applicantId: user.applicantId,
        //@ts-ignore
        ...testData, // Appending test data
      });

      console.log("Compliance Data:", comp_data); // Log the compliance data

      // Fetch user details with testing data appended
      //@ts-ignore
      const response = []

      // Merge compliance data into userDetails state
      setUserDetails({
        //@ts-ignore
        ...response,
        //@ts-ignore
        complianceLimit: comp_data?.limit || testData.mockData.complianceLimit, // Extract compliance limit or use test data
        //@ts-ignore
        message: comp_data?.message || testData.mockData.message,
      });

    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };


  // Initial state for form data and errors
  const [formData, setFormData] = useState<BeneficiaryFormData>({
    beneficiaryName: '',
    nationality: '',
    residentCountry: '',
    phone: '',
    email: '',
    idType: '',
    physicalAddressLine1: '',
    physicalAddressLine2: '',
    physicalAddressLine3: '',
    suburb: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    bankBicCode: '',
    applicant: '',
    bankLocation: '',
    ifscCode: ''
  });
  //@ts-ignore
  const [formErrors, setFormErrors] = useState<BeneficiaryFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const filteredUsers = userList.filter((b) =>

    //@ts-ignore
    b.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    //@ts-ignore

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
      applicant: selectedUser?.applicantId
    }));
  };

  // Form validation
  const validateForm = () => {
    //@ts-ignore
    const errors: BeneficiaryFormErrors = {};
    if (!formData.applicant) errors.applicant = 'Applicant ID is required';
    if (!formData.beneficiaryName) errors.beneficiaryName = 'Beneficiary Name is required';
    if (!formData.nationality) errors.nationality = 'Nationality  is required';
    if (!formData.country) errors.residentCountry = 'Country is required';
    if (!formData.phone) errors.phone = 'Phone number is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.idType) errors.idType = 'ID Type is required';
    if (!formData.physicalAddressLine1) errors.physicalAddressLine1 = 'Address Line 1 is required';
    if (!formData.suburb) errors.physicalAddressLine1 = 'Suburb is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.state) errors.state = 'State is required';
    if (!formData.zipCode) errors.zipCode = 'ZipCode is required';
    if (!formData.country) errors.country = 'Country is required';
    if (!formData.accountHolderName) errors.accountHolderName = 'Account Holder is required';
    if (!formData.accountNumber) errors.accountNumber = 'Account Number is required';
    if (!formData.bankName) errors.bankName = 'Bank Name is required';
    if (!formData.bankBicCode) errors.bankBicCode = 'Bank Code is required';
    if (!formData.bankLocation) errors.bankLocation = 'Bank Location is required';
    if (!formData.ifscCode) errors.ifscCode = 'IFSC Code is required';

    return errors;
  };

  const handleSubmit = async (e: any) => {
    console.log("added neficary")
    e.preventDefault();
    setIsSubmitting(true);
    const errors = validateForm();
    console.log(Object.keys(errors))
    if (Object.keys(errors).length > 1) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }
    // setfilterdUsers(filteredUsers)
    // Simulate form submission
    console.log(selectedUser)
    console.log('Form submitted:', formData);
    setIsSubmitting(false);
    // Navigate to another page after successful submission

    try {
      //@ts-ignore
      console.log(formData);
      setcommonloader(true)
      const response = await beneficiary_service.submitBeneficiaryForm(formData);
      //@ts-ignore
      if (response.status == 200) {
        setText('Beneficiary Successfully Added');
        setType('success');
        setOpen(true);
        // alert("Beneficiary created successfully");
        navigate('/beneficiary');
      } else {
        setText('Unable to Submit Beneficiary');
        setType('error');
        setOpen(true);
      }
      setcommonloader(false)
    } catch (error) {
      console.error('Error submitting form:', error);
      setText('Error while submitting form');
      setType('error');
      setOpen(true);
      setcommonloader(false)
    }
  };

  return (
    <Box sx={{ width: "80vw" }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', marginBottom: 2 }}>
        Add Beneficiary
      </Typography>

      {/* Applicant ID Section */}
      {/* <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography
          variant="body1"
          sx={{
            backgroundColor: theme.palette.primary.main,
            p: '0.5%',
            color: 'white',
            paddingBlock: 1,
            paddingInline: 2,
          }}
        >
          Beneficiary ID - ________
        </Typography>
      </Box> */}

      {/* Applicant Information Fields */}
      <Box sx={{ width: '50vw' }}>
        <Grid container spacing={2} marginBottom={1}>
          <Grid item xs={12} sm={4}>
         

            <TextField
              variant="filled"
              fullWidth
              value={searchText}
              onChange={(e) => {
                if (e.target.value !== "") {
                  setShowList(true);
                } else {
                  setShowList(false);
                  setSelectedUser(null)
                }
                setSearchText(e.target.value);
              }}
              placeholder={(selectedUser?.name)?(selectedUser?.name):(selectedUser?.name)}
              InputProps={{
                startAdornment: selectedUser && (
                  <InputAdornment position="start">

                    { selectedUser?(<>
                      <Avatar alt={selectedUser.name} >
                    {selectedUser.name[0]}

                    </Avatar>
                    </>):<>
                    </>}
                   
                  </InputAdornment>
                ),
              }}
            />

            {/* User List */}
            {showList && filteredUsers.length > 0 && (
              <Paper elevation={3} sx={{ mt: 2 }}>
                <List>
                  {filteredUsers.map((b) => (
                    <ListItem
                      //@ts-ignore
                      key={b.benificaryId}
                      divider
                      button
                      onClick={() => handleUserSelect(b)}
                    >
                      <ListItemAvatar>
                    

<Avatar
                                                    // src={
                                                    //   //@ts-ignore
                                                    //   user.profilePhoto
                                                    // }
                                                    //@ts-ignore
                                                    // alt={user.name}
                                                  >
                                                    {
                                                      //@ts-ignore
                                                           selectedUser?  (selectedUser?.name[0]):<></>

                                                    
                                                    }
                                                  </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        //@ts-ignore
                        primary={b.name}
                        //@ts-ignore
                        secondary={`ID: ${b.benificaryId} | Account: ${b.accountNumber}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Grid>
        </Grid>

        <Grid container spacing={2} marginBottom={1}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Beneficiary Name"
              variant="filled"
              name="beneficiaryName"
              fullWidth
              value={formData.beneficiaryName}
              onChange={handleChange}
              error={!!formErrors.beneficiaryName}
              helperText={formErrors.beneficiaryName}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Nationality"
              variant="filled"
              name="nationality"
              fullWidth
              value={formData.nationality}
              onChange={handleChange}
              error={!!formErrors.nationality}
              helperText={formErrors.nationality}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Resident Country"
              variant="filled"
              name="residentCountry"
              fullWidth
              value={formData.residentCountry}
              onChange={handleChange}
              error={!!formErrors.residentCountry}
              helperText={formErrors.residentCountry}
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
              value={formData.phone}
              onChange={handleChange}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Email"
              variant="filled"
              name="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="ID Type"
              variant="filled"
              name="idType"
              fullWidth
              value={formData.idType}
              onChange={handleChange}
              error={!!formErrors.idType}
              helperText={formErrors.idType}
            />
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ width: '20%', background: 'linear-gradient(to right, #3b82f6 40%, #60a5fa 50%, #ffffff 100%)', height: '3px', marginY: 2 }} />
      {/* Address Section */}
      <Box mb={3}>
        <Typography variant="subtitle1" sx={{ color: 'grey', marginBottom: 1 }}><strong>Address</strong></Typography>
        <Grid container spacing={2} marginBottom={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Address Line 1"
              name="physicalAddressLine1"
              value={formData.physicalAddressLine1}
              onChange={handleChange}
              error={!!formErrors.physicalAddressLine1}
              helperText={formErrors.physicalAddressLine1}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Address Line 2 (Optional)"
              name="physicalAddressLine2"
              value={formData.physicalAddressLine2}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} marginBottom={2}>
          {/* <Grid item xs={12} sm={4.5}>
            <TextField
              fullWidth
              label="Address Line 3 (Optional)"
              name="physicalAddressLine3"
              value={formData.physicalAddressLine3}
              onChange={handleChange}
            />
          </Grid> */}
          <Grid item xs={12} sm={1.5}>
            <TextField
              fullWidth
              label="Suburb"
              name="suburb"
              value={formData.suburb}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              error={!!formErrors.city}
              helperText={formErrors.city}
            />
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <TextField
              fullWidth
              label="State/Province"
              name="state"
              value={formData.state}
              onChange={handleChange}
              error={!!formErrors.state}
              helperText={formErrors.state}
            />
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <TextField
              fullWidth
              label="Zip Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              error={!!formErrors.zipCode}
              helperText={formErrors.zipCode}
            />
          </Grid>
          <Grid item xs={12} sm={1.5}>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              error={!!formErrors.country}
              helperText={formErrors.country}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ width: '20%', background: 'linear-gradient(to right, #3b82f6 40%, #60a5fa 50%, #ffffff 100%)', height: '3px', marginY: 2 }} />
      {/* Bank Information Section */}
      <Box mb={3}>
        <Typography variant="subtitle1" sx={{ color: 'grey', marginBottom: 1 }}><strong>Bank Information</strong></Typography>
        <Grid container spacing={2} marginBottom={2}>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Account Holder Name"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              error={!!formErrors.accountHolderName}
              helperText={formErrors.accountHolderName}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Account Number"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              error={!!formErrors.accountNumber}
              helperText={formErrors.accountNumber}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              error={!!formErrors.bankName}
              helperText={formErrors.bankName}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Bic Code"
              name="bankBicCode"
              value={formData.bankBicCode}
              onChange={handleChange}
              error={!!formErrors.bankBicCode}
              helperText={formErrors.bankBicCode}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} marginBottom={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Bank Location"
              name="bankLocation"
              value={formData?.bankLocation || ''}
              onChange={handleChange}
              error={!!formErrors.bankLocation}
              helperText={formErrors.bankLocation}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="IFSC Code"
              name="ifscCode"
              value={formData?.ifscCode || ''}
              onChange={handleChange}
              error={!!formErrors.ifscCode}
              helperText={formErrors.ifscCode}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Transaction Section */}
      {/* <Box mb={3}>
        <Typography variant="h6" sx={{  marginBottom: 1 }}><strong>Transactions</strong></Typography>
        <Grid container spacing={2} marginBottom={1}>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Transaction ID"
              name="transactionId"
              variant='standard'
              value={formData.transactionId}
              onChange={handleChange}
              error={!!formErrors.transactionId}
              helperText={formErrors.transactionId}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Sender Transaction Id"
              name="senderTransactionId"
              variant='standard'
              value={formData.senderTransactionId}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Value"
              name="value"
              variant='standard'
              value={formData.value}
              onChange={handleChange}
              error={!!formErrors.value}
              helperText={formErrors.value}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="Transaction Date"
              name="transactionDate"
              variant='standard'
              value={formData.transactionDate}
              onChange={handleChange}
              error={!!formErrors.transactionDate}
              helperText={formErrors.transactionDate}
            />
          </Grid>
        </Grid>
      </Box> */}

      {/* Buttons */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={2}>
          <Button variant="contained" fullWidth onClick={handleSubmit} disabled={isSubmitting}>
            Submit
          </Button>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button variant="outlined" onClick={() => navigate('/applicant')} fullWidth>
            Cancel
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddBeneficiary;
