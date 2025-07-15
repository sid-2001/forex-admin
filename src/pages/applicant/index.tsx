import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, TextField, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, Tabs, Tab, Avatar, FormControl, Select, InputLabel, MenuItem, useTheme, Paper } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import TransactionTable from '../transaction-table';
import DocumentComponent from '../document-tab';
import { ApplicantService } from '@/services/applicant.service';
import BeneficiaryTable from '@/components/beneficiary-table';
import { BeneficiaryService } from '@/services/beneficiary.service';
import { PieChart } from '@mui/x-charts/PieChart/PieChart';
import { HelperService } from '@/helpers/helper';
import { LocalStorageService } from '@/helpers/local-storage-service';
import HasPermission from '@/components/permissionWrapper';
import { KycService } from '@/services/kyc.service';
import ReferralTransactions from '@/components/referralTransactionTable';
import { DataGrid } from '@mui/x-data-grid';
import {Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,} from '@mui/material';

import { IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';


const applicant_service = new ApplicantService();
const beneficiary_service = new BeneficiaryService();
const helper = new HelperService()
const local_service = new LocalStorageService
const kyc_service = new KycService();

const ApplicantPage = () => {

  const navigate = useNavigate();
  const { applicantId } = useParams();

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
  const theme = useTheme()
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  const [physicalAddressLine1, setPhysicalAddressLine1] = useState('');
  const [physicalAddressLine2, setPhysicalAddressLine2] = useState('');
  const [physicalAddressLine3, setPhysicalAddressLine3] = useState('');
  const [residenceSuburb, setResidenceSuburb] = useState('');
  const [residenceCity, setResidenceCity] = useState('');
  const [residenceState, setResidenceState] = useState('');
  const [residencePostalCode, setResidencePostalCode] = useState('');

  const [isEditable, setIsEditable] = useState(false);
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
  const [referralRedeemTransaction, setReferralRedeemTransaction] = useState<any>([])
  const [referralCreditedTransaction, setReferralCreditedTransaction] = useState<any>([])
  const [applicantImage, setApplicantImage] = useState<string>("")
  const [applicantDocuments, setApplicantDocuments] = useState<any[]>([]);

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


const [openDialog, setOpenDialog] = useState(false);
const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);

const handleViewDocument = (url: string) => {
  setSelectedDocUrl(url);
  setOpenDialog(true);
};

const handleCloseDialog = () => {
  setOpenDialog(false);
  setSelectedDocUrl(null);
};

  function LimitPieChart() {

    const utilized = Math.abs(utilizedLimit);
    const available = Math.abs(availableLimit);

    const applicantDataGridStyle = {
      '& .MuiDataGrid-row:nth-of-type(even)': {
        backgroundColor: '#e3f2fd',
      },
      '& .MuiDataGrid-row:hover': {
        backgroundColor: '#bbdefb',
      },
    };


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

  useEffect(() => {
    // Fetch compliance data with testing data appended
    applicant_service.getCompliance(
      applicantId,
    ).then(comp_data => {
      setutilizedLimit(comp_data?.utilizedLimit)
      setAvailableLimit(comp_data?.availableLimit)
    })
    fetchBeneficiaries();
    fetchReferralRedeemedTransactions();
    fetchReferralCreditedTransactions();
    getdocumentDataByApplicantId()
  }, [])


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


  const fetchBeneficiaries = useCallback(async () => {
    if (!applicantId) return;

    try {
      const data = await beneficiary_service.searchByApplicantId(applicantId);
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

  const fetchReferralRedeemedTransactions = useCallback(async () => {
    if (!applicantId) return;

    try {
      const data = await kyc_service.getReferralRedeemedTransactions(applicantId);
      setReferralRedeemTransaction(data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [applicantId])

  const fetchReferralCreditedTransactions = useCallback(async () => {
    if (!applicantId) return;
    try {
      const { data } = await kyc_service.getReferralCreditedTransactions(applicantId);
      setReferralCreditedTransaction(data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [applicantId])


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
  };

  const handleDiscardChanges = () => {
    setOpenConfirmationDialog(false);
    setIsEditable(false);
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

  // const getdocumentDataByApplicantId = async () => {
  //   if (!applicantId) return;

  //   try {
  //     const { data } = await applicant_service.getDocumentByApplicantId(applicantId);
  //     if (data.length > 0) {
  //       const record = data.find((doc: any) => doc.documentName === 'image')
  //       setApplicantImage(record?.docUrl || "")
  //     }
  //   } catch (error) {
  //     console.error('Error fetching documents:', error);
  //   }
  // }
  const getdocumentDataByApplicantId = async () => {
  if (!applicantId) return;

  try {
    const { data } = await applicant_service.getDocumentByApplicantId(applicantId);
    if (data.length > 0) {
      const imageRecord = data.find((doc: any) => doc.documentName === 'image');
      setApplicantImage(imageRecord?.docUrl || "");

      setApplicantDocuments(data); // ✅ store all documents
    }
  } catch (error) {
    console.error('Error fetching documents:', error);
  }
};



  return (

    <HasPermission permission={'canRead'} module={local_service.get_modules()?.APPLICANT}>
      <Box sx={{ width: "50vw" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" gutterBottom color={theme.palette.secondary.main} sx={{ fontWeight: 'bold', }}>
            Applicant Details
          </Typography>
          {/* <FormControlLabel
        control={<Switch  disabled  checked={isEditable} onChange={handleToggleChange} />}
        label="Edit Mode"/>
         */}
        </Box>

        <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="body1" mb={1}
            sx={{
              backgroundColor: 'primary.main',
              p: '0.5%',
              color: 'white',
              paddingBlock: 1,
              paddingInline: 1
            }}
          >
            Applicant Id - {applicantId}
          </Typography>

        </Box>

        {/* Applicant Information Form */}
        <Box sx={{ width: '80vw' }}>
          <Grid container spacing={2} mb={2} alignItems="flex-start" justifyContent="space-between">
            <Grid item xs={12} sm={2} display="flex" flexDirection="column"
              alignItems="center" justifyContent="center">
              {/* <Typography mt={2}>Applicant Picture</Typography> */}
              <Box
                width={150}
                height={150}
                border='4px solid green'
                borderRadius="50%"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Avatar src={applicantImage}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}>{firstName[0] + "" + lastName[0]}</Avatar>
              </Box>
            </Grid>
            <Grid item xs={12} sm={7}>
              <Grid container spacing={2} marginBottom={1}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Applicant first Name"
                    variant="filled"
                    value={firstName}
                    onChange={handleFieldChange(setFirstName)}
                    fullWidth
                    InputProps={{ readOnly: !isEditable }}
                  />
                </Grid>
                {middleName && <Grid item xs={12} sm={4}>
                  <TextField
                    label="Applicant Middle Name"
                    variant="filled"
                    value={middleName}
                    onChange={handleFieldChange(setMiddleName)}
                    fullWidth
                    InputProps={{ readOnly: !isEditable }}
                  />
                </Grid>}

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Applicant Last Name"
                    variant="filled"
                    value={lastName}
                    onChange={handleFieldChange(setLastName)}
                    fullWidth
                    InputProps={{ readOnly: !isEditable }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nationality"
                    variant="filled"
                    value={nationality}
                    onChange={handleFieldChange(setNationality)}
                    fullWidth
                    InputProps={{ readOnly: !isEditable }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Residence Country"
                    variant="filled"
                    value={residenceCountry}
                    onChange={handleFieldChange(setResidenceCountry)}
                    fullWidth
                    InputProps={{ readOnly: !isEditable }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    variant="filled"
                    value={phone}
                    onChange={handleFieldChange(setPhone)}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    variant="filled"
                    value={email}
                    onChange={handleFieldChange(setEmail)}
                    fullWidth
                    InputProps={{ readOnly: !isEditable }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} sm={3} sx={{ alignContent: "top" }}>
              <LimitPieChart></LimitPieChart>
            </Grid>
          </Grid>
        </Box>

        {/* Permanent Address Section */}
        <Box sx={{ width: "80vw" }}>
          <Typography variant="subtitle1" sx={{ color: 'grey', marginBottom: 1 }}><strong>Postal Address</strong></Typography>
          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={postalAddressLine1}
                onChange={handleFieldChange(setPostalAddressLine1)}
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address Line 2"
                value={postalAddressLine2}
                onChange={handleFieldChange(setPostalAddressLine2)}
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
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
                  <InputLabel>City</InputLabel>
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
                  <InputLabel>State/Province</InputLabel>
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
                <InputLabel>Country</InputLabel>
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
          <Typography variant="subtitle1" sx={{ color: "grey", marginBottom: 1 }}>
            <strong>Physical Address</strong>
          </Typography>

          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={physicalAddressLine1}
                onChange={(e) => setPhysicalAddressLine1(e.target.value)}
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Address Line 2"
                value={physicalAddressLine2}
                onChange={(e) => setPhysicalAddressLine2(e.target.value)}
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} marginBottom={2}>

            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Suburb"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                InputProps={{ readOnly: !isEditable }}
              />
            </Grid>

            {/* City Dropdown */}
            <Grid item xs={12} sm={2}>

              {
                isEditable ? (<>
                  <FormControl fullWidth disabled={!selectedState || !isEditable}>
                    <InputLabel>City</InputLabel>
                    <Select value={selectedCity} onChange={handleCityChange}>
                      {
                        //@ts-ignore
                        cities[selectedState]?.map((city) => (
                          <MenuItem key={city} value={city}>
                            {city}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </>) : <>
                  <TextField
                    fullWidth
                    label="City"
                    value={residenceCity}
                    onChange={(e) => (e.target.value)}
                    InputProps={{ readOnly: !isEditable }}
                  />
                </>
              }

            </Grid>
            {/* State Dropdown */}
            <Grid item xs={12} sm={2}>

              {isEditable ? <>
                <FormControl fullWidth disabled={!selectedCountry || !isEditable}>
                  <InputLabel>State/Province</InputLabel>
                  <Select value={selectedState} onChange={handleStateChange}>

                    {
                      //@ts-ignore
                      states[selectedCountry]?.map((state) => (
                        <MenuItem key={state} value={state}>
                          {state}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

              </> : <>
                <TextField
                  fullWidth
                  label="State"
                  value={residenceState}
                  onChange={(e) => (e.target.value)}
                  InputProps={{ readOnly: !isEditable }}
                />
              </>
              }

            </Grid>

            {/* Zip Code Auto-Filled */}
            <Grid item xs={12} sm={2}>
              <TextField fullWidth label="Zip Code" value={residencePostalCode} InputProps={{ readOnly: true }} />
            </Grid>

            {/* Country Dropdown */}

            <Grid item xs={12} sm={2}>
              {isEditable ? <>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select value={selectedCountry} onChange={handleCountryChange} disabled={!isEditable}>
                    {countries.map((country) => (
                      <MenuItem key={country.code} value={country.code}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

              </> : <>
                <TextField
                  fullWidth
                  label="Country"
                  value={residenceCountry}
                  onChange={(e) => (e.target.value)}
                  InputProps={{ readOnly: !isEditable }}
                />
              </>
              }

            </Grid>
          </Grid>
        </Box>
        {/* Tab Component */}
        <Tabs sx={{ marginBottom: '10px' }} value={selectedTab} onChange={handleTabChange} aria-label="Customer data tabs" >
          <Tab label="Documents" sx={{ marginRight: '2px' }} />
          <Tab label="Beneficiaries" sx={{ marginRight: '2px' }} />
          <Tab label="Transactions" sx={{ marginRight: '2px' }} />
          <Tab label="Referral Redeemed Transactions" sx={{ marginRight: '2px' }} />
          <Tab label="Referral Credited Transactions" sx={{ marginRight: '2px' }} />
        </Tabs>

        {/* { Tab Content */}
        
         
{selectedTab === 0 && (
      <>
        {/* ✅ Uploaded Documents Section */}
        <Box sx={{ width: '80vw', height: '30vh', mt: 4 , paddingBottom:4}}>
          <Typography variant="h6" gutterBottom color="primary">
            <strong>Uploaded Documents</strong>
          </Typography>
          <DataGrid
            rows={applicantDocuments}
            columns={[
              {
                field: 'documentName',
                headerName: 'Document Name',
                flex: 1,
                headerClassName: 'super-app-theme--header',
              },
              {
                field: 'status',
                headerName: 'Status',
                flex: 1,
                headerClassName: 'super-app-theme--header',
                renderCell: () => <div style={{ color: 'green' }}>Uploaded</div>,
              },
              {
                field: 'actions',
                headerName: 'View',
                flex: 0.5,
                headerClassName: 'super-app-theme--header',
                renderCell: (params: any) => (
                  <IconButton onClick={() => handleViewDocument(params.row.docUrl)} color="primary">
                    <VisibilityIcon />
                  </IconButton>
                ),
              },
            ]}
            getRowId={(row) => row.id || row.documentName + Math.random()}
           
           
            sx={{
              backgroundColor: 'white',
              '& .MuiDataGrid-columnHeaders': {
                '& .super-app-theme--header': {
                  backgroundColor: '#005099',
                  color: 'white',
                  fontWeight: 'bold',
                },
              },
              '& .MuiDataGrid-row:nth-of-type(even)': {
                backgroundColor: '#f9f9f9',
              },
            }}
          />

          {/* ✅ Document Viewer Modal */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>Document Preview</DialogTitle>
            <DialogContent>
              {selectedDocUrl ? (
                selectedDocUrl.endsWith('.pdf') ? (
                  <iframe
                    src={selectedDocUrl}
                    width="100%"
                    height="600px"
                    title="PDF Viewer"
                    style={{ border: 'none' }}
                  />
                ) : (
                  <img
                    src={selectedDocUrl}
                    alt="Document"
                    style={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }}
                    onError={(e) => (e.currentTarget.src = '')}
                  />
                )
              ) : (
                <Typography>No document selected.</Typography>
              )}
            </DialogContent>
          </Dialog>
        </Box>
      </>
    )}
        {selectedTab === 1 && helper.checkUserHasPermission(local_service.get_modules()?.TRANSACTION_OUTWARD, 'canRead') && <TransactionTable
          //@ts-ignore
          applicantId={applicantId || ""}
          //@ts-ignore
          transaction={transactions} />}

        {selectedTab === 2 && <ReferralTransactions
          referralRecords={referralRedeemTransaction || []} referralType={'Redeemed'} />}
        {selectedTab === 3 && <ReferralTransactions
          referralRecords={referralCreditedTransaction || []}
          referralType={'Credited'} />}





        {/* Action Buttons */}
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} sm={3}>
            <Button variant="outlined" onClick={handleBack} fullWidth>
              Back to Applicant List
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            {isEditable && (
              <Button variant="contained" fullWidth onClick={handleSaveChanges}>
                Save Changes
              </Button>
            )}
          </Grid>

        </Grid>

        {/* Confirmation Dialogs */}
        <Dialog open={openConfirmationDialog} onClose={handleCancelEdit}>
          <DialogTitle>Confirm Discard</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to discard your changes?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDiscardChanges} color="primary">Yes</Button>
            <Button onClick={handleCancelEdit} color="secondary">No</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
          <DialogTitle>Confirm Save</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to save the changes?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSaveConfirm} color="primary">Yes</Button>
            <Button onClick={() => setOpenSaveDialog(false)} color="secondary">No</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </HasPermission>
  );
};

export default ApplicantPage;
