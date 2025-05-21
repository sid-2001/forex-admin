import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, TextField, Typography, Button, Switch, FormControlLabel, Dialog, DialogActions, DialogContent, DialogTitle, Tabs, Tab, Avatar, FormControl, Select, InputLabel, MenuItem, colors } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import TransactionTable from '../transaction-table';
import DocumentComponent from '../document-tab';
import { ApplicantService } from '@/services/applicant.service';
import BeneficiaryTable from '@/components/beneficiary-table';
import { BeneficiaryService } from '@/services/beneficiary.service';
import chuks from '../../assets/images/chuks.jpg'
import { PieChart } from '@mui/x-charts/PieChart/PieChart';
import { HelperService } from '@/helpers/helper';
import { Label } from '@mui/icons-material';
import GradientDivider from '@/components/divider';
import { DataGrid } from '@mui/x-data-grid';

const applicant_service = new ApplicantService();
const beneficiary_service = new BeneficiaryService();

const UserAdd = () => {


  const responsibilities = [
    'Dashboard',
    'Users',
    'Reports',
    'Settings',
  ];
  const initialPermissions = responsibilities.map((res, index) => ({
    id: index,
    responsibility: res,
    create: false,
    read: false,
    update: false,
    view: false,
  }));
  //@ts-ignore
  const handleToggleChangePermisson = (id, field) => {
    setPermissions((prev) =>
      prev.map((row) =>
          //@ts-ignore

        row.id === id ? { ...row, [field]: !row[field] } : row
      )
    );
  };

  const columns = [
    { field: 'responsibility',
       headerClassName: 'super-app-theme--header'
 ,     
      headerName: 'Responsibility', flex: 1 },
    ...['create', 'read', 'update', 'view'].map((field) => ({
      field,
      headerName: field.charAt(0).toUpperCase() + field.slice(1),
        headerClassName: 'super-app-theme--header',
      width: 100,
       //@ts-ignore

      renderCell: (params) => (
        <Switch
          checked={params.row[field]}
          onChange={() => handleToggleChangePermisson(params.row.id, field)}
        />
      ),
    })),
  ];


  const navigate = useNavigate();
  const rolesData = ['Admin', 'User', 'Manager'];

  const [countrieslist] = useState(['USA', 'Canada', 'India']);
  const [flows] = useState(['Onboarding', 'Approval', 'Checkout']);
  const [roles] = useState(rolesData);
  const [selectedRole, setSelectedRole] = useState('');
  const [permissions, setPermissions] = useState(initialPermissions);

  // Define separate states for each field
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [nationality, setNationality] = useState('');
  const [residenceCountry, setResidenceCountry] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [suburb, setSuburb] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const[password,setPassword]=useState('')


  const [physicalAddressLine1, setPhysicalAddressLine1] = useState('');
  const [physicalAddressLine2, setPhysicalAddressLine2] = useState('');
  const [physicalAddressLine3, setPhysicalAddressLine3] = useState('');
  const [residenceSuburb, setResidenceSuburb] = useState('');
  const [residenceCity, setResidenceCity] = useState('');
  const [residenceState, setResidenceState] = useState('');
  const [residencePostalCode, setResidencePostalCode] = useState('');

  const [isEditable, setIsEditable] = useState(true);
  const [isChanged, setIsChanged] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);


  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [zipCode, setZipCode] = useState("");




  const [postalAddressLine1, setPostalAddressLine1] = useState('');
  const [postalAddressLine2, setPostalAddressLine2] = useState('');
  const [postalAddressLine3, setPostalAddressLine3] = useState('');


  const [postalselectedCountry, setPostalSelectedCountry] = useState("");
  const [postalselectedState, setPostalSelectedState] = useState("");
  const [postalselectedCity, setPostalSelectedCity] = useState("");
  const [postalzipCode, setPostalZipCode] = useState("");
  const [utilizedLimit, setutilizedLimit] = useState(0)
  const [availableLimit, setAvailableLimit] = useState(0)
  const [maxlimit, setMaxlimit] = useState(0)






  
 






  //postal


  // Address Fields (Physical)




  // Handlers for Dropdowns

  const countries = [
    { code: "IN", name: "India" },
    { code: "ZA", name: "South Africa" }
  ];

  const states = {
    IN: ["Maharashtra", "Delhi", "Karnataka"],
    ZA: ["Gauteng", "Western Cape", "KwaZulu-Natal"]
  };

  const cities = {
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
    Delhi: ["New Delhi", "Noida", "Gurgaon"],
    Karnataka: ["Bangalore", "Mysore", "Mangalore"],
    Gauteng: ["Johannesburg", "Pretoria", "Soweto"],
    "Western Cape": ["Cape Town", "Stellenbosch", "Paarl"],
    "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Richards Bay"]
  };

  const zipCodes: Record<string, string> = {
    Mumbai: "400001",
    Pune: "411001",
    Nagpur: "440001",
    "New Delhi": "110001",
    Noida: "201301",
    Gurgaon: "122001",
    Bangalore: "560001",
    Mysore: "570001",
    Mangalore: "575001",
    Johannesburg: "2000",
    Pretoria: "0002",
    Soweto: "1804",
    "Cape Town": "8001",
    Stellenbosch: "7600",
    Paarl: "7646",
    Durban: "4001",
    Pietermaritzburg: "3201",
    "Richards Bay": "3900"
  };


  function LimitPieChart() {

    const utilized = Math.abs(utilizedLimit);
    const available = Math.abs(availableLimit);

  return (
    <Box>



      <PieChart
        series={[
          {
            data: [
              {
                id: 0,
                value: utilized,
                label: 'Utilized Limit',
                color: '#FF6B6B',
              },
              {
                id: 1,
                value: available,
                label: 'Available Limit',
                color: '#4ECDC4',
              },
            ],
            innerRadius: 35, // donut shape
            outerRadius: 50,
          },
        ]}
        width={400}
        height={100}
      />
      {/* <Typography
        variant="subtitle2"
        sx={{
          position: 'absolute',
          top: '17.5%',
          right:"-20.5%",
          
          // transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          fontWeight: 'bold',
          color:"pink",
          fontSize:"0.5em"
        }}
      >
      

        Max Limit
        <br />
        {maxlimit.toLocaleString()}
      
      </Typography> */}
      </Box>
    );
  }


  useEffect(() => {
    // Fetch compliance data with testing data appended
    applicant_service.getCompliance(
      applicantId,
    ).then(comp_data => {
      console.log("Compliance Data:", comp_data); // Log the compliance data

      setutilizedLimit(comp_data?.utilizedLimit)
      setAvailableLimit(comp_data?.availableLimit)
      // setAvailableLimit(comp_data?.maxlimit)


    })
    fetchBeneficiaries();


  }, [])


  const handleCountryChange = (event: any) => {
    setSelectedCountry(event.target.value);
    setSelectedState("");
    setSelectedCity("");
    setZipCode("");
  };

  const handlePostalCountryChange = (event: any) => {
    setPostalSelectedCountry(event.target.value);
    setPostalSelectedState("");
    setPostalSelectedCity("");
    setPostalZipCode("");
  };

  const handleStateChange = (event: any) => {
    setSelectedState(event.target.value);
    setSelectedCity("");
    setZipCode("");
  };

  const handlePostalStateChange = (event: any) => {
    setPostalSelectedState(event.target.value);
    setPostalSelectedCity("");
    setPostalZipCode("");
  };

  const handleCityChange = (event: any) => {
    const city = event.target.value;
    setSelectedCity(city);
    setZipCode(zipCodes[city] || ""); // Auto-fill Zip Code
  };



  const handlePostalCityChange = (event: any) => {
    const city = event.target.value;
    setPostalSelectedCity(city);
    setPostalZipCode(zipCodes[city] || ""); // Auto-fill Zip Code
  };


  const { applicantId } = useParams();

  useEffect(() => {
    const fetchApplicantData = async () => {
      if (!applicantId) {
        console.error("Applicant ID is missing in the URL");
        return;
      }

      try {
        const data = await applicant_service.searchByApplicantId(applicantId);
        //@ts-ignore
        setFirstName(data?.data?.applicant?.firstName || '');
        //@ts-ignore
        setMiddleName(data?.data?.applicant?.middleName || '');
        //@ts-ignore
        setLastName(data?.data?.applicant?.lastName || '');
        updateApplicantName();
        //@ts-ignore
        setNationality(data?.data?.applicant?.nationality || '');
        //@ts-ignore
        setResidenceCountry(data?.data?.applicant?.residenceCountry || '');
        //@ts-ignore
        setEmail(data?.data?.applicantContactDetails?.[1]?.contactDetails || '');
        //@ts-ignore
        setPhone(data?.data?.applicantContactDetails?.[0]?.contactDetails || '');
        //@ts-ignore
        setPostalAddressLine1(data?.data?.applicant?.postalAddressLine1 || '');
        //@ts-ignore
        setPostalAddressLine2(data?.data?.applicant?.postalAddressLine2 || '');
        //@ts-ignore
        setPostalAddressLine3(data?.data?.applicant?.postalAddressLine3 || '');
        //@ts-ignore
        setSuburb(data?.data?.applicant?.suburb || '');
        //@ts-ignore


        setResidenceState(data?.data?.applicant?.residenceState || '');
        //@ts-ignore
        setCity(data?.data?.applicant?.city || '');
        //@ts-ignore
        setState(data?.data?.applicant?.state || '');
        //@ts-ignore
        setPostalCode(data?.data?.applicant?.postalCode || '');
        //@ts-ignore
        setCountry(data?.data?.applicant?.country || '');
        //@ts-ignore
        setState(data?.data?.applicant?.applicantState || '');
        //@ts-ignore
        setPhysicalAddressLine1(data?.data?.applicant?.physicalAddressLine1 || '');
        //@ts-ignore
        setPhysicalAddressLine2(data?.data?.applicant?.physicalAddressLine2 || '');
        //@ts-ignore
        setPhysicalAddressLine3(data?.data?.applicant?.physicalAddressLine3 || '');
        //@ts-ignore
        setResidenceSuburb(data?.data?.applicant?.residenceSuburb || '');
        //@ts-ignore
        setResidenceCity(data?.data?.applicant?.residenceCity || '');
        //@ts-ignore
        setResidenceState(data?.data?.applicant?.residenceState || '');
        //@ts-ignore
        setResidencePostalCode(data?.data?.applicant?.residencePostalCode || '');
        //@ts-ignore
        setResidenceCountry(data?.data?.applicant?.residenceCountry || '');
      } catch (error) {
        console.error("Error fetching applicant data:", error);
      }
    };

    fetchApplicantData();  // Fetch data when the component mounts or applicantId changes
  }, [applicantId]);

  const updateApplicantName = () => {
    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
    setApplicantName(fullName);
  };

  let helper=new HelperService()

  const fetchBeneficiaries = useCallback(async () => {
    if (!applicantId) return;

    try {
      const data = await beneficiary_service.searchByApplicantId(applicantId);
      console.log("data is coming")
      console.log("data is here=>", data)
      const beneficiaryArray = Array.isArray(data) ? data : [data];
      console.log(beneficiaryArray)
      //@ts-ignore
      const formattedData = data?.map((beneficiary: any, index: number) => ({
        id: index + 1,
        beneficiaryId: beneficiary?.beneficiaryId,
        beneficiaryName: beneficiary?.beneficiaryName,
        accountNumber: beneficiary?.accountNumber,
        bankName: beneficiary?.bankName,
        bankBicCode: beneficiary?.bankBicCode,
        idType: beneficiary?.idType,
      }))


      console.log(formattedData)


      setBeneficiaries(formattedData || []);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
    }
  }, [applicantId]);

  const fetchTransactions = useCallback(async () => {

    if (!applicantId) return;

    try {

      console.log("getting trx for applicant Id", applicantId)
      const data = await applicant_service.getTransactionsByApplicantId(applicantId);
      const transactionArray = Array.isArray(data) ? data : [data];
     
      const formattedData = data?.map((transaction: any, index: number) => ({

        ...transaction?.transactionOutward,
        ...transaction?.beneficiary,
        ...transaction?.transactionInwardList,
        ...transaction?.applicant,
        id: index + 1,
        transactionNumber: transaction?.transactionOutward?.transactionNumber,
        sendCountry: transaction?.transactionOutward?.sendCountry,
        receiveCountry: transaction?.transactionOutward?.receiveCountry,
        beneficiaryName: transaction?.beneficiary?.beneficiaryName,
        amount: transaction?.transactionOutward?.principalAmount,
        transactionStatus: transaction?.transactionOutward?.transactionStatus,

     
        destination: transaction?.transactionOutward?.receiveCountry,
        value: transaction?.transactionOutward?.principalAmount,
        currency: transaction?.transactionOutward?.settlementCurrency,
        settlement: helper.roundToTwoFixed(transaction?.transactionOutward?.principalAmount * transaction?.transactionOutward?.exchangeRates),
        destinationBank: transaction?.transactionOutward?.destinationBankBicCode,
        forex: helper.roundToTwoFixed(transaction?.transactionOutward?.exchangeRates),
        date: transaction?.transactionOutward?.owCreatedDate,
        reporting: transaction?.transactionOutward?.reportingStatus,
        status: transaction?.transactionOutward?.transactionStatus,
        final_amount: helper.roundToTwoFixed(transaction?.transactionOutward?.exchangeRates * transaction?.transactionOutward?.principalAmount),
        applicant: transaction?.applicant,
        //@ts-ignore
        inid: transaction?.transactionInwardNumber
      



      }));


      
      
       
      setTransactions(formattedData || []);
      console.log(formattedData)
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [applicantId]);

  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<any>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setIsChanged(true);
  };

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setIsEditable(true);
    } else {
      if (isChanged) {
        setOpenConfirmationDialog(true);
      } else {
        setIsEditable(false);
      }
    }
  };

  const handleSaveChanges = () => {
    if (isChanged) {
      setOpenSaveDialog(true); // Show save confirmation dialog
    } else {
      alert('No changes made to save!');
    }
  };

  const handleSaveConfirm = () => {
    setOpenSaveDialog(false);
    setIsEditable(false);
    console.log("Saved applicant data");


  };

  const handleDiscardChanges = () => {
    setOpenConfirmationDialog(false);
    setIsEditable(false);
    console.log("Changes discarded");
  };

  const handleCancelEdit = () => {
    setOpenConfirmationDialog(false);
  };

  const handleTabChange = async (

    //@ts-ignore
    event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
    if (newValue === 0) {
      await fetchBeneficiaries();
    }
    else if (newValue === 1) {
      await fetchTransactions();
    }
  };

  const handleBack = () => {
    navigate('/applicant');
  };

  return (
    <Box sx={{ width: "50vw" }}>
      <Box  display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', }}>
        User Details
      </Typography>
      {/* <FormControlLabel
        control={<Switch  disabled  checked={isEditable} onChange={handleToggleChange} />}
        label="Edit Mode"
      /> */}
    
      </Box>
      <Box mb={1} display="flex" justifyContent="space-between" alignItems="center">
      

      </Box>

      {/* Applicant Information Form */}
      <Box sx={{ width: '70vw' }}>
        <Grid container spacing={2} mb={2} alignItems="flex-start" justifyContent="space-between">
     
          <Grid item xs={12} sm={8}>
            <Grid container spacing={2} marginBottom={1}>
              <Grid item xs={12} sm={4}>
                <label style={{color:"black",textDecoration:"bold",fontWeight:800,fontStyle:"bold"}}> <b>
                Full Name
                  </b></label>
                <TextField
                  // label="Applicant first Name"
                
                  value={firstName}
                  onChange={handleFieldChange(setFirstName)}
                  fullWidth
                  InputProps={{ readOnly: !isEditable }}
               
                />
              </Grid>
        
              <Grid item xs={12} sm={4}>
              <label style={{color:"black",textDecoration:"bold",fontWeight:800,fontStyle:"bold"}}> <b>
             Nationality
                  </b></label>
              <TextField
                
                  
                  value={nationality}
                  onChange={handleFieldChange(setNationality)}
                  fullWidth
                  InputProps={{ readOnly: !isEditable }}
                />
              </Grid>


              <Grid item xs={12} sm={4}>
              <label style={{color:"black",textDecoration:"bold",fontWeight:800,fontStyle:"bold"}}> <b>
             Residence Country
                  </b></label>
                  <TextField
                  
               
                  value={residenceCountry}
                  onChange={handleFieldChange(setResidenceCountry)}
                  fullWidth
                  InputProps={{ readOnly: !isEditable }}
                />
              </Grid>
       
              <Grid item xs={12} sm={6}>
              <label style={{color:"black",textDecoration:"bold",fontWeight:800,fontStyle:"bold"}}> <b>
          Phone
                  </b></label>
                <TextField
                 
              
                  value={phone}
                  onChange={handleFieldChange(setPhone)}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
              <label style={{color:"black",textDecoration:"bold",fontWeight:800,fontStyle:"bold"}}> <b>
            Email
                  </b></label>
                <TextField
                 
                 
                  value={email}
                  onChange={handleFieldChange(setEmail)}
                  fullWidth
                  InputProps={{ readOnly: !isEditable }}
                />
              </Grid>
            </Grid>
          </Grid>


        
        </Grid>
      </Box>

      {/* Permanent Address Section */}
      <Box sx={{ width: "80vw" }}>
        {/* <Typography variant="subtitle1" sx={{ color: 'grey', marginBottom: 1 }}><strong>Postal Address</strong></Typography> */}
        <Grid container spacing={2} marginBottom={2}>
          <Grid item xs={12} sm={6}>

          <label style={{color:"black",textDecoration:"bold",fontWeight:800,fontStyle:"bold"}}> <b>
            Address Line 1
                  </b></label>
            <TextField
              fullWidth
             
              value={postalAddressLine1}
              onChange={handleFieldChange(setPostalAddressLine1)}
              InputProps={{ readOnly: !isEditable }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>

          <label style={{color:"black",textDecoration:"bold",fontWeight:800,fontStyle:"bold"}}> <b>
            Address Line 2
                  </b></label>
            <TextField
              fullWidth
            
              value={postalAddressLine2}
              onChange={handleFieldChange(setPostalAddressLine2)}
              InputProps={{ readOnly: !isEditable }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} marginBottom={2}>
          {/* <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Address Line 3"
              value={postalAddressLine3}
              onChange={handleFieldChange(setPostalAddressLine3)}
              InputProps={{ readOnly: !isEditable }}
            />
          </Grid> */}
          <Grid item xs={12} sm={2}>


          <label style={{color:"black",textDecoration:"bold",fontWeight:800,fontStyle:"bold"}}> <b>
         Suburb
                  </b></label>
            <TextField
            
              label="Suburb"
              value={suburb}
              //@ts-ignore
              onChange={handleFieldChange(suburb)}
              InputProps={{ readOnly: !isEditable }}
            />
          </Grid>

          {/* City Dropdown */}
          <Grid item xs={12} sm={2}>
            {isEditable ? <>
              <FormControl fullWidth disabled={!postalselectedState || !isEditable}>
                {/* <InputLabel>City</InputLabel> */}
                <label style={{color:"black",textDecoration:"bold",fontWeight:800,fontStyle:"bold"}}> <b>
         City
                  </b></label>
                <Select value={postalselectedCity} onChange={handlePostalCityChange}>
                  {
                    //@ts-ignore
                    cities[postalselectedState]?.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </> : <>
              <TextField
                fullWidth
                label="city"
                value={city}
                contentEditable="false"
                //@ts-ignore
                onChange={handleFieldChange(suburb)}
                InputProps={{ readOnly: !isEditable }}
              />
            </>}
          </Grid>

          {/* State Dropdown */}
          <Grid item xs={12} sm={2}>
            {isEditable ? (<>
              <FormControl fullWidth disabled={!postalselectedCountry || !isEditable}>
              <label style={{color:"black",textDecoration:"bold",fontWeight:800,fontStyle:"bold"}}> <b>
        State/provience
                  </b></label>
                <Select value={postalselectedState} onChange={handlePostalStateChange}>
                  {
                    //@ts-ignore
                    states[postalselectedCountry]?.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </>) : <>
              <TextField
                fullWidth
                label="State"
                value={state}
                contentEditable="false"
                //@ts-ignore
                onChange={handleFieldChange(suburb)}
                InputProps={{ readOnly: !isEditable }}
              />
            </>
            }
          </Grid>

          <Grid item xs={12} sm={1.5}>
          <label style={{color:"black",textDecoration:"bold",fontWeight:800,fontStyle:"bold"}}> <b>
         Postal Code
                  </b></label>
            <TextField
              fullWidth
              label="Postal Code"
              value={postalCode}
              onChange={handleFieldChange(setPostalCode)}
              InputProps={{ readOnly: !isEditable }}
            />
          </Grid>
          {/* Country Dropdown */}
          <Grid item xs={12} sm={2}>
            {isEditable ? (<FormControl fullWidth>
              <label style={{color:"black",textDecoration:"bold",fontWeight:800,fontStyle:"bold"}}> <b>
         Country
                  </b></label>
              <Select value={postalselectedCountry} onChange={handlePostalCountryChange} disabled={!isEditable}>
                {countries.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>) : (<>
              <TextField
                fullWidth
                label="Country"
                value={country}
                contentEditable="false"
                //@ts-ignore
                onChange={handleFieldChange(suburb)}
                InputProps={{ readOnly: !isEditable }}
              />
            </>)
            }
          </Grid>
        </Grid>

        {/* Physical Address Section */}


        <GradientDivider 
          gradient='#1C58F2,white'
            //@ts-ignore

          width='20'
          ></GradientDivider>






          
        <Grid container spacing={2} marginBottom={2}>
          {/* <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Address Line 3"
            value={physicalAddressLine3}
            onChange={(e) => setPhysicalAddressLine3(e.target.value)}
            InputProps={{ readOnly: !isEditable }}
          />
        </Grid> */}
        
          <Grid item xs={12} sm={2}>

          <label style={{color:"black",textDecoration:"bold",fontWeight:800,fontStyle:"bold"}}> <b>
         Password
                  </b></label>
            <TextField
              fullWidth
            
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{ readOnly: !isEditable }}
            />
          </Grid>

          {/* Zip Code Auto-Filled */}
          <Grid item xs={12} sm={2}>


          <label style={{color:"black",textDecoration:"bold",fontWeight:800,fontStyle:"bold"}}> <b>
         Phone
                  </b></label>
                  <TextField
              fullWidth
            
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              InputProps={{ readOnly: !isEditable }}
            />
          </Grid>


    
     

         
        </Grid>
      </Box>

      <GradientDivider 
          gradient='#1C58F2,white'
            //@ts-ignore

          width='20'
          ></GradientDivider>
      {/* Tab Component */}

      <Grid container spacing={2}>
      {/* Role Select */}
      <Grid item xs={12} sm={4}>
      <TextField
            select
            label="Select Role"
            fullWidth
            variant="filled"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            sx={{
              '& .MuiFilledInput-root': {
                backgroundColor: 'white',
              },
            }}
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
      </Grid>

      {/* Country Select */}
      <Grid item xs={12} sm={4}>
        <TextField
          select
          label="Select Country"
          fullWidth
          sx={{
            '& .MuiFilledInput-root': {
              backgroundColor: 'white',
            },
          }}
        variant="filled"
          defaultValue=""
        >
          {countrieslist.map((country) => (
            <MenuItem key={country} value={country}>
              {country}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* Flow Select */}
      <Grid item xs={12} sm={4}>
        <TextField
          select
          label="Select Flow"
          fullWidth
          variant="filled"
          defaultValue=""
          sx={{
            '& .MuiFilledInput-root': {
              backgroundColor: 'white',
            },
          }}
        >
          {flows.map((flow) => (
            <MenuItem key={flow} value={flow}>
              {flow}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </Grid>


    <Box p={2}>


      {/* DataGrid Appears When a Role Is Selected */}
      {selectedRole && (
        <Box mt={4} height={400} width="80vw">
          <DataGrid
            rows={permissions}
            columns={columns}
            disableRowSelectionOnClick
            hideFooter
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0
                ? 'even-row'
                : 'odd-row'
            }
            sx={{
              '& .even-row': {
                backgroundColor: '#e3f2fd', // Light blue
              },
              '& .odd-row': {
                backgroundColor: '#ffffff',
              },

              '& .super-app-theme--header': {
                backgroundColor: '#005099',
                color: 'white',
              },
            }}
          />
        </Box>
      )}
    </Box>


    
    
    </Box>
  );
};

export default UserAdd;
