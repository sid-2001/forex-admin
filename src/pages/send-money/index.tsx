import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Grid,
  Tab,
  Tabs,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  LinearProgress,
  Radio,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  InputAdornment,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { DataGrid, GridColDef, GridRenderCellParams, GridRowsProp } from '@mui/x-data-grid'
import VerifiedIcon from '@mui/icons-material/Verified'
import PaymentMethodsTable from '@/components/paymentmethod'
import BeneficiaryForm from '@/components/benificeary'
import { ApplicantService } from '@/services/applicant.service'
import { Beneficiary } from '@/types/transaction.type'
import { TransactionService } from '@/services/transaction.service'
import GifModal from '@/components/successModal'
import { KycService } from '@/services/kyc.service'
import PaymentPopup from '@/components/payment-popup'
import BobCategoryDropdown from '@/components/bob-matrix'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState, loaderStateNew, selectedCountryState } from '@/states/state'
import { Segment } from '@mui/icons-material'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import CashfreePayment from '@/components/cashfree'
import { HelperService } from '@/helpers/helper'
const { VITE_APP_BACKEND, VITE_APP_URL, VITE_APP_APPLICANT, VITE_APP_KYC, VITE_APP_TRANSACTION } = import.meta.env

let cashfree;


const users = [
  {
    id: 1,
    name: 'John Doe',
    accountNumber: '12345678',
    profilePhoto: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: 2,
    name: 'Jane Smith',
    accountNumber: '87654321',
    profilePhoto: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: 3,
    name: 'Jack Johnson',
    accountNumber: '11223344',
    profilePhoto: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: 4,
    name: 'Jill Brown',
    accountNumber: '44332211',
    profilePhoto: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
  {
    id: 5,
    name: 'James Dean',
    accountNumber: '55667788',
    profilePhoto: 'https://randomuser.me/api/portraits/men/5.jpg',
  },
]
const countries = [
  { code: 'IN', name: 'India', currency: 'INR', forexRate: '4.57', flag: 'https://flagcdn.com/in.svg' },

  // { code: 'ZA', name: 'South Africa', currency: 'ZAR', forexRate: '4.7', flag: 'https://flagcdn.com/za.svg' }, // Added South Africa
]
const countries_in = [

  { code: 'ZA', name: 'South Africa', currency: 'ZAR', forexRate: '4.7', flag: 'https://flagcdn.com/za.svg' }, // Added South Africa
]

const paymentGateways = [
  {
    id: 1,
    name: 'PayPal',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Paypal.svg',
  },
  {
    id: 2,
    name: 'Stripe',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Stripe_logo.png',
  },
  {
    id: 3,
    name: 'Square',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Square_logo.svg',
  },
  {
    id: 4,
    name: 'Razorpay',
    avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Razorpay_logo.png',
  },
]

const SendMoneyPage = () => {

  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const [commonLoader, setCommonLoader] = useRecoilState(loaderStateNew)
  const [checkoutId, setCheckoutId] = useState("");
  const [searchText, setSearchText] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [tabValue, setTabValue] = useState('1')
  const [selectedTime, setSelectedTime] = useState({})
  const [selectedTimeTableRow, setSelectedTimeTableRow] = useState<number | null>(null)
  const [finalamount, setFinalAmount] = useState(0)
  const [countrySelected, setCountrySelected] = useRecoilState(selectedCountryState)
  const [sourceCountry, setSourceCountry] = useState(countrySelected == "IN" ? "INR" : "ZAR")
  const [gatewayCharge, setGatewayCharge] = useState(0)
  const [selectedBenficary, setSelectedBenificary] = useState({})
  const [userlist, setUserList] = useState([])
  const [benficiary, setbenificiary] = useState<Array<any>>([])
  const [gifsuccess, setGifSuccess] = useState(false)
  const [sendCountry, setsendCountry] = useState('')
  const [commonloader, setcommonloader] = useRecoilState(loaderStateNew)
  const [selectedCountryoption, setSelectedCountryOption] = useRecoilState(selectedCountryState)

  //   const[selected ]

  const [selecteTimeChange, setSelectedTimeCharge] = useState<number | null>(null)

  const [selectedUser, setSelectedUser] = useState<{ name: string; accountNumber: string } | null>(null)
  //   const [selected]

  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [currency, setCurrency] = useState<string>('')
  const [forexRate, setForexRate] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [selectedTransferMethod, setSelectedTransferMethod] = useState('BankTransfer')

  const [url, seturl] = useState<string>('')

  let applicant_service = new ApplicantService()
  let transaction_service = new TransactionService()


  const helper = new HelperService()
  useEffect(() => {
    setcommonloader(true)
    applicant_service.getApplicantDetalis().then((data) => {
      let users = data.map((e) => {
        let benificiary_list = e.beneficiaryList.map((b) => {
          return {
            benificaryId: b.beneficiaryId,
            name: b.beneficiaryName,
            accountHolderName: b.beneficiaryName,
            accountNumber: b.bankBicCode,
            bank: b.bankName,
            ifscCode: b.bankBicCode,
          }
        })

        return {
          applicantId: e.applicant.applicantId,
          id: e.applicant.applicantId,
          //@ts-ignore
          name: e.applicant?.firstName,
          accountNumber: e.applicant.applicantId,
          profilePhoto: 'https://randomuser.me/api/portraits/women/4.jpg',
          benificary: benificiary_list,
        }
      })

      setUserList(users as any)
      setcommonloader(false)
    })

    // console.log(se)
  }, [])


  useEffect(() => {
    setSelectedTimeTableRow(null)
    // kyc_service.getCharges('SA', sendCountry, amount,1).then(data => {
    //   console.log(data)
    //   if (data?.length > 0) {
    //     console.log()
    //     setSelectedTimeCharge(data[0].minimumCharges)

    //   }
    //   else{

    //     setSelectedTimeCharge(0)
    //   }
    // })

  }, [amount])
  let kyc_service = new KycService()

  const handleCountryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const countryCode = event.target.value as string
    setSelectedCountry(countryCode)

    // Find the selected country
    // const selected = countries.find((country) => country.code === countryCode)
    console.log((countrySelected == "IN" ? countries_in : countries))

    const selected = (countrySelected == "IN" ? countries_in : countries).find(
      (country) => country.code === countryCode
    );

    if (selected) {
      transaction_service.getForexRate(selected?.currency, countrySelected).then((data) => {
        console.log(data)
        setForexRate(data)
      })
      setCurrency(selected.currency)
      setsendCountry(selected.code)
      setSourceCountry(countrySelected == "IN" ? "INR" : "ZAR")
    }
  }
  const handleRadioChange = (row: any) => {
    setSelectedTime(row)
    setSelectedTimeTableRow(row.id)
    // setSelectedTimeCharge(row.charges)
  }
  const handleChange = (
    //@ts-ignore
    event,
    //@ts-ignore
    newValue,
  ) => {
    setTabValue(newValue)
  }

  const TimechargesRows: GridRowsProp = [
    { id: 1, time: '2 hours', charges: 10, total: 200, segment: 1 },
    { id: 2, time: '8 hours', charges: 5, total: 200, segment: 2 },
    { id: 3, time: '2 days', charges: 0.5, total: 200, Segment: 3 },
  ]
  const chargesTableColumns: GridColDef[] = [
    {
      field: 'select',
      headerName: 'select',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Radio
          checked={selectedTimeTableRow === params.row.id}
          onChange={() => {
            handleRadioChange(params.row)

            let data = kyc_service.getCharges('SA', sendCountry, amount, params?.row?.id).then(data => {
              console.log(data)
              if (data?.length > 0) {
                setSelectedTimeCharge(data[0].minimumCharges)

              } else {

                setSelectedTimeCharge(0)
              }



            })
          }}
          value={params.row.id}
          inputProps={{ 'aria-label': `Select row ${params.row.id}` }}
        />
      ),

      sortable: false,
      filterable: false,
      headerClassName: 'super-app-theme--header',
    },
    { field: 'time', headerName: 'Time', flex: 1, headerClassName: 'super-app-theme--header' },
  ]

  const calculateProgress = () => {
    switch (tabValue) {
      case '1':
        return 33
      case '2':
        return 66
      case '3':
        return 100
      default:
        return 0
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchText(value)

    // Filter users based on the search text for name or ID
    if (value.trim() === '') {
      setFilteredUsers([])
    } else {
      const filtered = userlist.filter(
        (user) =>
          //@ts-ignore
          user?.name?.toLowerCase().includes(value.toLowerCase()) || user.id.toString().includes(value),
      )
      setFilteredUsers(filtered)
    }
  }
  let navigate = useNavigate()

  const handlePayment = async () => {
    try {
      let payload = {
        benificary: selectedBenficary,
        transferMethod: selectedTransferMethod,
        destinationCountry: selectedCountry,
        selectedTimeMethod: selectedTime,
        gateway: selectedGateway,
        amount: amount,
        applicant: selectedUser,
        forex: forexRate,
        //@ts-ignore
        timecharge: selectedTime?.time,
        sourceCurrency: "ZAR",
        sourceCountry: "SA",
        destinationCurrency: currency,
        totalpaybleamount:
          Number(amount) + Number(selecteTimeChange) + Number(gatewayCharge),
      };

      // Create transaction
      await transaction_service.createDealcover({
        sourceCurrency: selectedCountryoption == "SA" ? "ZAR" : "INR",
        destinationCurrency: selectedCountryoption == 'SA' ? "INR" : "ZAR",
        destinationCountry: selectedCountryoption == 'SA' ? "INR" : "ZAR",
        applicantId: selectedUser as any,
        rate: Number(forexRate)
      })

      const transactionResponse = await transaction_service.createTransaction(
        payload
      );

      // Call Peach Payments API
      const peachResponse = await axios.post(
        "https://test.oppwa.com/v1/checkouts",
        new URLSearchParams({
          entityId: "8ac7a4c99568514401956b1180e80671",
          amount: `${Number(amount)}`,
          currency: "ZAR",
          paymentType: "DB",
        }),
        {
          headers: {
            Authorization:
              "Bearer OGFjN2E0Yzk5NTY4NTE0NDAxOTU2YjExNWY3NDA2NTR8akI9RFUjK0Z0ZTZjYkYya2ZVISM=",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const checkoutId = peachResponse.data.id;
      setCheckoutId(checkoutId);

      window.open(
        `https://test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };


  const handlePaymentClick = async () => {
    try {
      // Call Peach Payments API

      setcommonloader(true)
      const response = await fetch("https://test.oppwa.com/v1/checkouts", {
        method: "POST",
        headers: {
          Authorization:
            "Bearer OGFjN2E0Yzk5NTY4NTE0NDAxOTU2YjExNWY3NDA2NTR8akI9RFUjK0Z0ZTZjYkYya2ZVISM=",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          entityId: "8ac7a4c99568514401956b1180e80671",
          amount: "100",
          currency: "ZAR",
          paymentType: "DB",
        }),
      });

      const data = await response.json();
      let payload = {
        //@ts-ignore
        benificary: { "benificaryId": selectedBenficary?.benificaryId },
        transferMethod: selectedTransferMethod,
        destinationCountry: selectedCountry,
        selectedTimeMethod: selectedTime,
        gatewayStatus: selectedGateway,
        amount: amount,
        applicant: selectedUser,
        forex: forexRate,
        gatewayId: '13122',
        //@ts-ignore
        timecharge: selectedTime?.time,
        sourceCurrency: selectedCountryoption == "SA" ? "ZAR" : "INR",

        sourceCountry: selectedCountryoption == 'SA' ? "ZA" : "IN",
        destinationCurrency: selectedCountryoption == 'SA' ? "INR" : "ZAR",
        totalpaybleamount: (Number(amount) + Number(selecteTimeChange) + Number(gatewayCharge))

      }




      await transaction_service.createDealcover({
        sourceCurrency: selectedCountryoption == "SA" ? "ZAR" : "INR",
        destinationCurrency: selectedCountryoption == 'SA' ? "INR" : "ZAR",
        destinationCountry: selectedCountryoption == 'SA' ? "INR" : "ZAR",
        applicantId: selectedUser as any,
        rate: Number(forexRate)



      })



      transaction_service.createTransaction(payload).then(data => {
        setCommonLoader(true)

        if (data) {

          settype('success')
          setText("Tnansaction created Succesfully")
        }
        else {

          settype('error')
          setText("Tnansaction created false")
        }
        setOpen(true)
        setcommonloader(false)

        navigate('/transaction')
        //   transaction_service.createPayfastTransaction(data?.data,((Number(amount)+  Number(selecteTimeChange)+ Number(gatewayCharge)))).then((res)=>{
        //     console.log(res)
        //  seturl(res.url)

        //  if(res){
        //   settype('success')
        //   setText("Tnansaction created Succesfully")

        //  }else{
        //   settype('error')
        //   setText("Tnansaction created false")

        //  }

        //  setOpen(true)
        // setcommonloader(false)

        // window.open(JSON.parse(res.data)?.url, "_blank", "noopener,noreferrer");


        // })
      })

      //  if (data.id) {
      //   // HTML content for the new window
      //   const htmlContent = `
      //     <!DOCTYPE html>
      //     <html lang="en">
      //     <head>
      //         <meta charset="UTF-8">
      //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
      //         <title>Peach Payments</title>
      //         <script src="https://test.oppwa.com/v1/paymentWidgets.js?checkoutId=${data.id}"></script>
      //     </head>
      //     <body>
      //         <h2>Complete Your Payment</h2>
      //         <form action=${VITE_APP_URL}/transaction/create class="paymentWidgets">
      //             VISA MASTER
      //         </form>
      //         <button id="closeBtn">Close</button>
      //         <script>
      //           document.getElementById('closeBtn').addEventListener('click', function() {
      //             window.close();
      //           });
      //         </script>
      //     </body>
      //     </html>
      //   `;

      //   // Open a new window and write the HTML content
      //   const paymentWindow = window.open("", "_blank", "width=600,height=800");
      //   if (paymentWindow) {
      //     paymentWindow.document.open();
      //     paymentWindow.document.write(htmlContent);
      //     paymentWindow.document.close();

      //     // Check if the window is closed
      //     const interval = setInterval(() => {
      //       if (paymentWindow.closed) {
      //         clearInterval(interval);
      //         navigate('/transaction/create'); // Navigate when the window is closed

      //       }

      //     }, 50);



      //   } else {
      //     alert("Popup blocked! Please allow popups for this site.");
      //   }
      // }



      if (data.id) {
        // HTML content for the current tab
        document.open();
        document.write(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Peach Payments</title>
              <script src="https://test.oppwa.com/v1/paymentWidgets.js?checkoutId=${data.id}"></script>
          </head>
          <body>
              <h2>Complete Your Payment</h2>
              <form action="${VITE_APP_URL}/transaction/create" class="paymentWidgets">
                  VISA MASTER
              </form>
              <button id="closeBtn">Close</button>
              <script>
                document.getElementById('closeBtn').addEventListener('click', function() {
                  window.location.href = '/transaction/create'; // Navigate when closing
                });
              </script>
          </body>
          </html>
        `);
        document.close();
      }


    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Error processing payment!");
    }
  };
  const handleUserSelect = (user: { name: string; accountNumber: string }) => {
    setSelectedUser(user)
    setSearchText(user.name) // Set selected user's name in TextField
    setFilteredUsers([]) // Clear th
  }

  const selectedPaymentMethod = {
    method: 'Bank Transfer',
    exchangeRate: '1 USD = 74 INR',
    amountReceivable: '₹7,400',
    charges: '₹100',
    totalAmount: '₹7,500',
    time: '1-2 Days',
  }
  const paymentMethods = [
    {
      method: 'Bank Transfer',
      exchangeRate: ' 4.21',
      amountReceivable: '₹7,400',
      charges: '₹100',
      totalAmount: '₹7,500',
      time: '1-2 Days',
    },
    {
      method: 'PayPal',
      exchangeRate: '4.21',
      amountReceivable: '₹7,300',
      charges: '₹150',
      totalAmount: '₹7,450',
      time: 'Instant',
    },
    {
      method: 'Western Union',
      exchangeRate: '4.21',
      amountReceivable: '₹7,200',
      charges: '₹200',
      totalAmount: '₹7,400',
      time: 'Same Day',
    },
  ]

  const [selectedGateway, setSelectedGateway] = React.useState('')

  return (
    <Box
      sx={{
        width: '80vw',
      }}
    >
      <Typography variant="h5" gutterBottom>
        <strong>Send Money </strong>
      </Typography>

      <LinearProgress variant="determinate" value={calculateProgress()} sx={{ marginBottom: 2 }} />

      <TabContext value={tabValue}>
        <Tabs value={tabValue} onChange={handleChange} sx={{ marginBottom: 3 }}>
          <Tab label="Create Transaction" value="1" />
          {/* <Tab label="Select Beneficiary" value="2" /> */}
          <Tab label="Pay Now" value="3" />
        </Tabs>
        <TabPanel value="1">
          <Box>
            <Grid container spacing={2} marginBottom={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  //   label="Select User"
                  variant="filled"
                  fullWidth
                  value={searchText}
                  onChange={handleSearchChange}
                  placeholder="Type a  User name or ID..."
                  InputProps={{
                    startAdornment: selectedUser && (
                      <InputAdornment sx={{ marginBottom: '10px' }} position="start">
                        <Avatar
                          //@ts-ignore
                          // src={selectedUser.profilePhoto}
                          alt={selectedUser.name}
                          style={{ marginRight: '8px' }}
                        >{selectedUser.name[0]}</Avatar>
                      </InputAdornment>
                    ),
                  }}
                />

                {filteredUsers.length > 0 && (
                  <Paper elevation={3} style={{ marginTop: '10px' }}>
                    <List>
                      {filteredUsers.map((user) => (
                        // {user}
                        <ListItem
                          //@ts-ignore
                          key={user.id}
                          divider
                          button
                          onClick={() => handleUserSelect(user)}
                        >
                          <ListItemAvatar>
                            <Avatar
                              // src={
                              //   //@ts-ignore
                              //   user.profilePhoto
                              // }
                              //@ts-ignore
                              alt={user.name}
                            >
                              {
                                //@ts-ignore
                                user.name[0]
                              }
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              //@ts-ignore
                              user.name
                            }
                            //@ts-ignore
                            secondary={`ID: ${user.id} `}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {selectedUser && (
                  <Typography style={{ marginTop: '20px', textAlign: 'center', color: 'grey' }}>
                    <VerifiedIcon
                      sx={{
                        color: 'green',
                      }}
                    />
                    {selectedUser.name} (Account: {selectedUser.accountNumber})
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Box>
              <Grid container spacing={2} marginBottom={2}>
                {/* Destination Country Dropdown */}
                <Grid item xs={12} md={3}>
                  <FormControl variant="filled" fullWidth>
                    <InputLabel>Destination Country</InputLabel>
                    <Select
                      value={selectedCountry}
                      //@ts-ignore
                      onChange={handleCountryChange}
                      displayEmpty
                    >
                      {(selectedCountryoption === "IN" ? countries_in : countries).map((country) => (
                        <MenuItem key={country.code} value={country.code}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar src={country.flag} alt={country.name} sx={{ width: 24, height: 24, marginRight: '8px' }} />
                            <Typography>{country.name}</Typography>
                          </div>
                        </MenuItem>
                      ))}


                    </Select>
                  </FormControl>
                </Grid>

                {/* Amount Input */}
                <Grid item xs={12} md={3}>
                  <TextField
                    label={` Amount `}
                    variant="filled"
                    fullWidth
                    onChange={(e) => {



                      setAmount(e.target.value as any)

                      setSelectedTimeCharge(0)
                    }}
                  />
                </Grid>

                {/* Currency (Auto-populated and Disabled) */}
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Destination Currency"
                    variant="filled"
                    value={currency}
                    InputProps={{
                      readOnly: true,
                    }}
                    fullWidth
                  />
                </Grid>

                {/* Forex Rate (Auto-populated and Disabled) */}
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Forex Rate"
                    variant="filled"
                    value={helper.roundToTwoFixed(forexRate)}
                    InputProps={{
                      readOnly: true,
                    }}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} marginBottom={2}>
                <Grid
                  item
                  xs={12}
                  md={12}
                  sx={{
                    '& .super-app-theme--header': {
                      backgroundColor: '#005099',
                      color: 'white',
                    },
                  }}
                >
                  {selectedCountry && amount > 0 ? (
                    <>
                      <DataGrid
                        rows={TimechargesRows}
                        columns={chargesTableColumns}
                        //@ts-ignore
                        pagination={false}
                        disableSelectionOnClick
                        // hideFooterSelectedRowCount
                        hideFooterPagination={true}
                      />
                    </>
                  ) : (
                    <></>
                  )}
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={12}
                  sx={{
                    '& .super-app-theme--header': {
                      backgroundColor: '#005099',
                      color: 'white',
                    },
                  }}
                >
                  {/* <Paper sx={{ padding: 3, marginBottom: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Select Payment Gateway
                    </Typography>
                    <Autocomplete
                     //@ts-ignore
                      value={selectedGateway}
                      onChange={
                         //@ts-ignore
                        (event, newValue) =>
                         //@ts-ignore
                        setSelectedGateway(newValue)}
                      options={paymentGateways}
                      getOptionLabel={(option) => option.name}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          <Grid container alignItems="center">
                            <Avatar src={option.avatarUrl} alt={option.name} sx={{ marginRight: 2 }} />
                            <Typography>{option.name}</Typography>
                          </Grid>
                        </li>
                      )}
                      renderInput={(params) => <TextField {...params} label="Payment Gateway" variant="filled" fullWidth />}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                    />
                  </Paper> */}
                </Grid>

                {selectedGateway ? (
                  <>
                    <Grid
                      item
                      xs={12}
                      md={12}
                      sx={{
                        '& .super-app-theme--header': {
                          backgroundColor: '#005099',
                          color: 'white',
                        },
                      }}
                    >
                      <PaymentMethodsTable
                        //@ts-ignore
                        amount={amount}
                        timecharge={selecteTimeChange}
                        setFinalRate={setFinalAmount}
                        setGatewayCharge={setGatewayCharge}
                        currency={sourceCountry}
                        setSelectedTransferMethod={setSelectedTransferMethod}
                      />
                    </Grid>
                  </>
                ) : (
                  <></>
                )}
              </Grid>
            </Box>


            <Typography variant="h6" gutterBottom>
              Beneficiary
            </Typography>
       
            <BeneficiaryForm
              selectedBenificary={selectedBenficary}
              setselectedBenficiary={setSelectedBenificary}
              //@ts-ignore
              beneficiaries={selectedUser?.benificary}
            ></BeneficiaryForm>

            <Divider sx={{ marginY: 2 }} />

            <Typography variant="h6" gutterBottom>
              BOP Category
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <BobCategoryDropdown amount={amount}></BobCategoryDropdown>
              </Grid>

              
            </Grid>



            <Box sx={{ textAlign: 'left', marginTop: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Principal Amount: {helper.roundToTwoFixed(amount * Number(forexRate)) + ' ' + currency}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Settlement Amount: {Number(amount) + Number(selecteTimeChange) + ' ' + sourceCountry}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Base Amount: {amount + ' ' + sourceCountry}
              </Typography>
              {/* <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
        Gateway Fee: {  gatewayCharge +" " +sourceCountry }
      </Typography> */}
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Platform Charges: {selecteTimeChange ? selecteTimeChange : 0 + ' ' + sourceCountry}
              </Typography>

              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setTabValue('3')
                }}
              >
                Continue
              </Button>
            </Box>
          </Box>
        </TabPanel>
        <TabPanel value="2">
          <Box>
            <Typography variant="h5" gutterBottom>
              Transaction Details
            </Typography>

            <Grid container spacing={2} marginBottom={2}>
              <Grid item xs={12} md={6}>
                {/* <TextField label="Destination Country" variant="filled" fullWidth defaultValue={selectedCountry} disabled /> */}
                <FormControl variant="filled" fullWidth disabled>
                  <InputLabel>Destination Country</InputLabel>
                  <Select
                    value={selectedCountry}
                    //@ts-ignore

                    onChange={handleCountryChange}
                    displayEmpty
                  >
                    {(selectedCountryoption === "IN" ? countries_in : countries).map((country) => (
                      <MenuItem key={country.code} value={country.code}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar src={country.flag} alt={country.name} sx={{ width: 24, height: 24, marginRight: '8px' }} />
                          <Typography>{country.name}</Typography>
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Amount"
                  variant="filled"
                  fullWidth
                  defaultValue={amount}
                  disabled
                  onChange={(e) => {
                    setAmount(e.target.value as any)
                  }}
                />
                {/* <TextField label="Amount" variant="filled" fullWidth defaultValue="1000 USD" disabled /> */}
              </Grid>
              {/* <Grid item xs={12} md={6}>
                <TextField label="Payment Method" variant="filled" fullWidth defaultValue={selectedTransferMethod} disabled />
              </Grid> */}
            </Grid>

            <Divider sx={{ marginY: 2 }} />

            <Typography variant="h6" gutterBottom>
              Customer
            </Typography>
            <Grid container spacing={2} marginBottom={2}>
              <Grid item xs={12} md={6}>
                <Grid item xs={12} md={6}>
                  <TextField
                    disabled
                    //   label="Select User"
                    variant="filled"
                    fullWidth
                    value={searchText}
                    onChange={handleSearchChange}
                    placeholder="Type a  User name or ID..."
                    InputProps={{
                      startAdornment: selectedUser && (
                        <InputAdornment position="start" sx={{
                          marginBottom: '10px'
                        }}>
                          <Avatar
                            //@ts-ignore
                            // src={selectedUser.profilePhoto}
                            alt={selectedUser.name}
                            style={{ marginRight: '8px' }}
                          >{selectedUser.name[0]}</Avatar>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {filteredUsers.length > 0 && (
                    <Paper elevation={3} style={{ marginTop: '10px' }}>
                      <List>
                        {filteredUsers.map((user) => (
                          <ListItem
                            //@ts-ignore
                            key={user.id}
                            divider
                            button
                            onClick={() => handleUserSelect(user)}
                          >
                            <ListItemAvatar>
                              <Avatar
                                //@ts-ignore
                                src={user.profilePhoto}
                                //@ts-ignore
                                alt={user.name}
                              >
                                {
                                  //@ts-ignore
                                  user.name[0]
                                }
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              //@ts-ignore
                              primary={user.name}
                              //@ts-ignore
                              secondary={`ID: ${user.id} | Account: ${user.accountNumber}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Grid>
                {/* <TextField label="Customer ID" variant="filled" fullWidth placeholder="Enter Customer ID" /> */}
              </Grid>
            </Grid>

            <Divider sx={{ marginY: 2 }} />

            <Typography variant="h6" gutterBottom>
              Beneficiary
            </Typography>
       
            <BeneficiaryForm
              selectedBenificary={selectedBenficary}
              setselectedBenficiary={setSelectedBenificary}
              //@ts-ignore
              beneficiaries={selectedUser?.benificary}
            ></BeneficiaryForm>

            <Divider sx={{ marginY: 2 }} />

            <Typography variant="h6" gutterBottom>
              BOP Category
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <BobCategoryDropdown amount={amount}></BobCategoryDropdown>
              </Grid>

              
            </Grid>

            <Button
              variant="contained"
              color="primary"
              sx={{ marginTop: 3 }}
              onClick={() => {
                setTabValue('3')
              }}
            >
              Continue
            </Button>
          </Box>
        </TabPanel>
        <TabPanel value="3">
          <Box>
            <Typography variant="h5" gutterBottom>
              Review & Confirm
            </Typography>

            <Grid container spacing={2} marginBottom={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>Destination Country:</strong> {selectedCountry}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>Amount:</strong> {amount + '  ' + sourceCountry}
                </Typography>
              </Grid>
              {/* <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>Payment Method:</strong> {selectedTransferMethod}
                </Typography>
              </Grid> */}
            </Grid>

            <Divider sx={{ marginY: 2 }} />

            <Typography variant="h6" gutterBottom>
              Transaction Summary
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Description</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Amount</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Settlement Amount</TableCell>
                    <TableCell align="right">
                      {
                        //@ts-ignore
                        helper.roundToTwoFixed(amount * forexRate) + ' ' + currency
                      }
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Amount</TableCell>
                    <TableCell align="right">{helper.roundToTwoFixed(amount) + ' ' + sourceCountry}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Platfrom Charges</TableCell>
                    <TableCell align="right">{selecteTimeChange + ' ' + sourceCountry}</TableCell>
                  </TableRow>
                  {/* <TableRow>
                    <TableCell>Gateway Charges</TableCell>
                    <TableCell align="right">{ gatewayCharge +" " +sourceCountry}</TableCell>
                  </TableRow> */}
                  <TableRow>
                    <TableCell>
                      <strong>Net Payable</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{sourceCountry + ' ' + (Number(amount) + Number(selecteTimeChange) + Number(gatewayCharge))}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>



            {

              selectedCountryoption == "SA" ? <>
                <Button variant="outlined" color="primary" sx={{ marginTop: 3, display: "flex", alignItems: "center", gap: 1, padding: "6px 16px" }} onClick={() => {
                  setcommonloader(true)

                  let payload = {
                    //@ts-ignore
                    benificary: { "benificaryId": selectedBenficary?.benificaryId },
                    transferMethod: selectedTransferMethod,
                    destinationCountry: selectedCountry,
                    selectedTimeMethod: selectedTime,
                    gatewayStatus: selectedGateway,
                    amount: amount,
                    applicant: selectedUser,
                    forex: forexRate,
                    gatewayId: '13122',
                    //@ts-ignore
                    timecharge: selectedTime?.time,



                    sourceCurrency: selectedCountryoption == "SA" ? "ZAR" : "INR",

                    sourceCountry: selectedCountryoption == 'SA' ? "ZA" : "IN",
                    destinationCurrency: selectedCountryoption == 'SA' ? "INR" : "ZAR",
                    totalpaybleamount: (Number(amount) + Number(selecteTimeChange) + Number(gatewayCharge))

                  }



                  transaction_service.createDealcover({
                    sourceCurrency: selectedCountryoption == "SA" ? "ZAR" : "INR",
                    destinationCurrency: selectedCountryoption == 'SA' ? "INR" : "ZAR",
                    destinationCountry: selectedCountryoption == 'SA' ? "INR" : "ZAR",
                    applicantId: selectedUser as any,
                    rate: Number(forexRate)



                  }).then(
                    //@ts-ignore
                    data => {

                      transaction_service.createTransaction(payload).then(data => {

                        console.log(data.data)

                      })


                    })




                  setGifSuccess(true)

                  setcommonloader(false)
                  navigate('/transaction')





                }}>


                  <img
                    src="https://cdn.prod.website-files.com/6282d4840afd19e1afa62e70/6491490c213c45a9d600d387_ozow_small_xs.png"
                    alt="Ozow"
                    style={{ height: "20px" }}
                  />
                  Confirm & Pay

                </Button>





                <Button variant="outlined" color="primary" sx={{ marginTop: 3, display: "flex", alignItems: "center", gap: 1, padding: "6px 16px" }} onClick={handlePaymentClick}>

                  <img
                    src="https://www.peachpayments.com/hubfs/peachpayments-logo.svg"
                    alt="Ozow"
                    style={{ height: "20px" }}
                  />

                  Confirm & Pay
                </Button>
              </> : <>
                <CashfreePayment data={{
                  //@ts-ignore
                  benificary: { "benificaryId": selectedBenficary?.benificaryId },
                  transferMethod: selectedTransferMethod,
                  destinationCountry: selectedCountry,
                  selectedTimeMethod: selectedTime,
                  gatewayStatus: "Success",
                  amount: amount,
                  applicant: selectedUser,
                  forex: forexRate,
                  gatewayId: '13122',
                  //@ts-ignore
                  timecharge: selectedTime?.time,
                  sourceCurrency: selectedCountryoption == "SA" ? "ZAR" : "INR",

                  sourceCountry: selectedCountryoption == 'SA' ? "ZA" : "IN",
                  destinationCurrency: selectedCountryoption == 'SA' ? "INR" : "ZAR",
                  totalpaybleamount: (Number(amount) + Number(selecteTimeChange) + Number(gatewayCharge))


                }} amount={(Number(amount) + Number(selecteTimeChange) + Number(gatewayCharge))} />
              </>
            }






          </Box>
        </TabPanel>
        ,
      </TabContext>

      {/* <GifModal 
      
       //@ts-ignore
      open={gifsuccess} setOpen={setGifSuccess}></GifModal> */}

      <PaymentPopup
        //@ts-ignore
        open={gifsuccess}
        setOpen={setGifSuccess}
        url={url}
      ></PaymentPopup>
    </Box>
  )
}

export default SendMoneyPage
