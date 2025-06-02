import React, { useEffect, useState } from 'react';
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
import { ApplicantService } from '@/services/applicant.service';
import { TransactionService } from '@/services/transaction.service';
import TransactionTable from '../transaction-table';
import { HelperService } from '@/helpers/helper';

const UtilizationEnquiryForm: React.FC = () => {
  const [apiType, setApiType] = useState('');
  const [enquiryType, setEnquiryType] = useState('');
  const [searchBy, setSearchBy] = useState<'applicantId' | 'nationalId'>('applicantId');
  const [applicantId, setApplicantId] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [showResults, setShowResults] = useState(false);
  const[applicantData,setapplicantData]=useState<any>({})
  const[limitData,setLimitData]=useState<any>({})
  const[transactionData,setTranactiondata]=useState([])

  let appilicant_service=new ApplicantService()
  let transaction_service=new TransactionService()
let helper=new HelperService()






  
   



  const handleSubmit = (e: React.FormEvent) => {

 appilicant_service.getTransactionsByApplicantId(applicantId).then(data=>{
console.log("Get Transaction Applicant")

appilicant_service.getCompliance(applicantId).then(data=>{
  console.log("I m in the Compliance data")
console.log(data)
setLimitData(data)


})


const formattedData:any = data?.map((transaction: any, index: number) => ({

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
console.log(formattedData)


setTranactiondata(formattedData || []);


  console.log(data)
  // setapplicantData(data)

 })
 appilicant_service.searchByApplicantId(applicantId).then((data:any)=>{
console.log("get Serch by apllicant id")
  console.log(data?.data?.applicant)
  setapplicantData(data?.data?.applicant)

 })
  
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
      <Typography variant="h4" gutterBottom fontWeight="bold" textAlign="left">
        Limit Utilization Enquiry
      </Typography>

      <Grid container spacing={2}>
        {/* Left side: Form */}
        <Grid item xs={12} md={4} sx={{width:"80vw"}} >

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
                <MenuItem value="type1">SDA</MenuItem>
                <MenuItem value="type2">FIA</MenuItem>
                <MenuItem value="type2">FN</MenuItem>
              </Select>
            </FormControl>

       
            <FormControl component="fieldset" margin="normal">
              <RadioGroup
                row
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value as 'applicantId' | 'nationalId')}
              >
                <FormControlLabel value="applicantId" control={<Radio />} label="Applicant ID" />
                <FormControlLabel value="nationalId" disabled={true} control={<Radio />} label="National ID" />
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
                    <Typography variant="h6"><b>Applicant Info</b></Typography>
                    <Typography>Name: {applicantData?.firstName?(applicantData?.firstName):"No Data Found"}</Typography>
              
                    <Typography>Gender: {applicantData?.gender?(applicantData?.gender):("No Data Found")}</Typography>
                    <Typography>Country: {applicantData?.residenceCountry?(applicantData?.residenceCountry):("No Data Foiund")}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6"> <b>Limits</b></Typography>
                    <Typography>Max Limit: {limitData?.maxLimit?(limitData?.maxLimit):("No Data Found")}</Typography>
                    <Typography>Utilized Limit: {limitData?.utilizedLimit?(limitData?.utilizedLimit):("No Data Found")}</Typography>
                    <Typography>Available Limit {limitData?.availableLimit?(limitData?.availableLimit):"No Data Found"}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  <b>  Transactions</b>
                
                </Typography>
                <Box sx={{ height: "40vh", width: '60vw' }}>

<TransactionTable 
//@ts-ignore
transaction={transactionData}  applicantId={applicantId} availabledata={(applicantData?.firstName)?true:false} ></TransactionTable>

                  {/* <DataGrid
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
                  /> */}
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
