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
import { alertState, alertTextState, alertTypeState, countyState, loaderStateNew, userCurrencyState } from '@/states/state'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useTheme } from '@emotion/react'
import staticdataService from '@/services/staticdata.service'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import {generateZapperSessionIdApi} from "../../helpers/zapper"
const { VITE_APP_URL } = import.meta.env

const helper = new HelperService()
const local_service = new LocalStorageService()
const applicant_service = new ApplicantService()
const transaction_service = new TransactionService()
const kyc_service = new KycService()
const static_service = new staticdataService()

const ConfirmAndPayButton = ({ handleClick = () => {}, imgUrl = '' }) => {
  return (
    <Button
      variant="outlined"
      color="primary"
      sx={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 1, padding: '6px 16px' }}
      disabled={!helper.checkUserHasPermission(local_service.get_modules()?.TRANSACTION_OUTWARD, 'canCreate')}
      onClick={() => handleClick()}
    >
      <img src={imgUrl} alt="Ozow" style={{ height: '20px' }} />
      Confirm & Pay
    </Button>
  )
}

const SendMoneyPage = () => {
  const userCountry = local_service?.get_staff_country()
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const [commonLoader, setCommonLoader] = useRecoilState(loaderStateNew)
  const [checkoutId, setCheckoutId] = useState('')
  const [searchText, setSearchText] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [tabValue, setTabValue] = useState('1')
  const [selectedTime, setSelectedTime] = useState({})
  const [selectedTimeTableRow, setSelectedTimeTableRow] = useState<number | null>(null)
  const [finalamount, setFinalAmount] = useState(0)
  const [sourceCountry, setSourceCountry] = useState(userCountry === 'IN' ? 'INR' : 'ZAR')
  const [gatewayCharge, setGatewayCharge] = useState(0)
  const [selectedBenficary, setSelectedBenificary] = useState({})
  const [userlist, setUserList] = useState([])
  const [gifsuccess, setGifSuccess] = useState(false)
  const [sendCountry, setsendCountry] = useState('')
  const [commonloader, setcommonloader] = useRecoilState(loaderStateNew)
  const [userCurrency, setUserCurrency] = useRecoilState(userCurrencyState)
  const [selectedTimeChange, setSelectedTimeCharge] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<{ name: string; accountNumber: string; profilePhoto: string; applicantId: string } | null>(null)
  const [category, setCategory] = useState<string>('')
  const [selectedCountry, setSelectedCountry] = useState<string>('')

  const [currency, setCurrency] = useState<string>('')
  const [forexRate, setForexRate] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [selectedTransferMethod, setSelectedTransferMethod] = useState('Bank Transfer')
  const [countries, setCountries] = useRecoilState(countyState)

  const [remittanceList, setRemittanceList] = useState<
    {
      id: number
      categoryDescription: string
      purchSaleInd: string
      bopCategoryCd: string
      prpsPymtCd: string
      channelName: string
      bopSubCategoryCd: string
      countryName: string
    }[]
  >([])
  const [selectedGateway, setSelectedGateway] = React.useState('')
  const [gatewaysList, setGatewaysList] = useState([])

  const [url, seturl] = useState<string>('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  

  const applicantId = searchParams.get('applicantId')

  const TimechargesRows: GridRowsProp = [
    { id: 1, time: '2 hours', charges: 10, total: 200 },
    { id: 2, time: '8 hours', charges: 5, total: 200 },
    { id: 3, time: '2 days', charges: 0.5, total: 200 },
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

            let data = kyc_service.getCharges('SA', sendCountry, amount, params?.row?.id).then((data) => {
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
        return 50
      case '2':
        return 100
      default:
        return 0
    }
  }

  const fetchApplicantData = async () => {
    if (!applicantId) {
      console.error('Applicant ID is missing in the URL')
      return
    }

    try {
      console.log('Selected user')
      const data = await applicant_service.searchByApplicantId(applicantId)
      console.log(data, 'data found')
      setcommonloader(false)

      //@ts-ignore
      let benificiary_list = data.beneficiaryList.map((b) => {
        return {
          benificaryId: b.beneficiaryId,
          name: b?.beneficiaryMiddleName
            ? `${b.beneficiaryFirstName} ${b.beneficiaryMiddleName} ${b.beneficiaryLastName}`
            : `${b.beneficiaryFirstName} ${b.beneficiaryLastName}`,
          accountHolderName: b?.beneficiaryMiddleName
            ? `${b.beneficiaryFirstName} ${b.beneficiaryMiddleName} ${b.beneficiaryLastName}`
            : `${b.beneficiaryFirstName} ${b.beneficiaryLastName}`,
          accountNumber: b.accountNumber,
          bank: b.bankName,
          ifscCode: b.bankBicCode,
        }
      })
      //@ts-ignore
      setSelectedUser({
        //@ts-ignore
        applicantId: data?.applicant?.applicantId,
        //@ts-ignore
        id: data?.applicant?.applicantId,
        //@ts-ignore
        name: data.applicant?.firstName,
        //@ts-ignore
        accountNumber: data.applicant.applicantId,
        profilePhoto: 'https://randomuser.me/api/portraits/women/4.jpg',
        benificary: benificiary_list,
      })
      //@ts-ignore
      setSearchText(data.applicant?.firstName) // Set selected user's name in TextField
      fetchBopList()
      setFilteredUsers([]) // Clear th

      return
    } catch (error) {
      console.error('Error fetching applicant data:', error)
    }
  }

  const fetchBopList = () => {
    try {
      transaction_service.getBop().then((data) => {
        setRemittanceList(data as any)
      })
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    setcommonloader(true)
    if (applicantId) {
      fetchApplicantData()
    } else {
      applicant_service.getApplicantDetalis().then((data) => {
        let users

        users = data.map((e) => {
          let benificiary_list = e.beneficiaryList.map((b) => {
            return {
              benificaryId: b.beneficiaryId,
              name: b?.beneficiaryMiddleName
                ? `${b.beneficiaryFirstName} ${b.beneficiaryMiddleName} ${b.beneficiaryLastName}`
                : `${b.beneficiaryFirstName} ${b.beneficiaryLastName}`,
              accountHolderName: b?.beneficiaryMiddleName
                ? `${b.beneficiaryFirstName} ${b.beneficiaryMiddleName} ${b.beneficiaryLastName}`
                : `${b.beneficiaryFirstName} ${b.beneficiaryLastName}`,
              accountNumber: b.accountNumber,
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
    }

    getGatewaysListByCountry()
    fetchBopList()
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

  const handleCountryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const countryCode = event.target.value as string

    setSelectedCountry(countryCode)

    // Find the selected country
    const selected = countries.find((country) => country.countryCode == countryCode)

    static_service.getCountryCurrency(selected?.countryCode).then((data) => {
      //@ts-ignore
      setCurrency(data)

      if (selected) {
        transaction_service
          .getForexRate(
            //@ts-ignore

            userCurrency,
            data,
          )
          .then((data) => {
            console.log(data)
            setForexRate(data)
          })
        //@ts-ignore
        // setCurrency(selected.currency)
        //@ts-ignore
        setsendCountry(selected.code)
        setSourceCountry(userCountry === 'IN' ? 'INR' : 'ZAR')
      }
    })
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

  const getGatewaysListByCountry = async () => {
    const gatewayslistResponse = await transaction_service.fetchGatewaysByCountry(userCountry)
    setGatewaysList(gatewayslistResponse || [])
  }

  const transactionPayload = {
    vatCharges: 0,
    rewardPoints: 23.7,
    amount: amount,
    // fcmToken: "",

    applicant: {
      applicantId: selectedUser?.applicantId,
      accountNumber: selectedUser?.accountNumber,
      name: selectedUser?.name,
      profilePhoto: selectedUser?.profilePhoto,
    },
    benificary: selectedBenficary,
    bopId: category,
    destinationCountry: selectedCountry,
    destinationCurrency: userCountry === 'ZA' ? 'INR' : 'ZAR',
    forex: forexRate,
    // hardcoded Values
    gateway: {
      id: 1,
      name: 'PayPal',
      avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Paypal.svg',
    },
    gatewayId: 'IMPGW004',
    gatewayStatus: 'Processing',
    selectedTimeMethod: selectedTime,
    sourceCurrency: userCountry === 'ZA' ? 'ZAR' : 'INR',
    sourceCountry: userCountry,
    //@ts-ignore
    timecharge: selectedTime?.time,
    totalpaybleamount: Number(amount) + Number(selectedTimeChange) + Number(gatewayCharge),
    transferMethod: selectedTransferMethod,
      // transactionId: "ZAOWRM250814IN2524",
  }

  const dealCoverPayload = {
    sourceCurrency: userCountry === 'ZA' ? 'ZAR' : 'INR',
    destinationCurrency: userCountry === 'ZA' ? 'INR' : 'ZAR',
    destinationCountry: userCountry === 'ZA' ? 'IN' : 'ZA',
    applicantId: selectedUser?.applicantId as any,
    rate: Number(forexRate),
  }


const handleZapperPaymentGateway= async()=>{
    setCommonLoader(true)
  const txnResponse = await transaction_service.createTransaction(transactionPayload)
      if (txnResponse?.status) {
        setCommonLoader(true)
        if (txnResponse?.data) {
          settype('success')
          setText('Transaction created Succesfully')
        } else {
          settype('error')
          setText('Failed to Create Transaction')
        }
        setOpen(true)
      


     let zapper_trans= await transaction_service.createZaphierTransaction({

            amount:transactionPayload?.amount,
            currencyISOCode:"ZAR",
            transactionNumber:txnResponse?.data

                    })


                      setcommonloader(false)
                  
                    console.log(zapper_trans?.data?.redirectUrl)

        window.location.href=zapper_trans?.data?.redirectUrl

        // navigate('/transaction')
      
      }

}

  const handleOzowPaymentClick = async () => {
    try {
      // Call Peach Payments API

      setcommonloader(true)
      const response = await fetch('https://test.oppwa.com/v1/checkouts', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer OGFjN2E0Yzk5NTY4NTE0NDAxOTU2YjExNWY3NDA2NTR8akI9RFUjK0Z0ZTZjYkYya2ZVISM=',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          entityId: '8ac7a4c99568514401956b1180e80671',
          amount: '100',
          currency: 'ZAR',
          paymentType: 'DB',
        }),
      })

      const data = await response.json()
      const deal_data = await transaction_service.createDealcover(dealCoverPayload)

      const txnResponse = await transaction_service.createTransaction(transactionPayload)
      if (txnResponse?.status) {
        setCommonLoader(true)

        if (txnResponse?.data) {
          settype('success')
          setText('Transaction created Succesfully')
        } else {
          settype('error')
          setText('Failed to Create Transaction')
        }
        setOpen(true)
        setcommonloader(false)

        navigate('/transaction')
        //   transaction_service.createPayfastTransaction(data?.data,((Number(amount)+  Number(selectedTimeChange)+ Number(gatewayCharge)))).then((res)=>{
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
      }
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
        document.open()
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
        `)
        document.close()
      }
    } catch (error) {
      console.error('Payment initiation failed:', error)
      alert('Error processing payment!')
    }
  }

  const handlePeachPaymentsClick = async () => {
    setcommonloader(true)
    const { data } = await transaction_service.createDealcover(dealCoverPayload)

    if (data?.dealNumber) {
      const txnResponse = await transaction_service.createTransaction(transactionPayload)
      if (txnResponse?.status) {
        setCommonLoader(true)
        if (txnResponse?.data) {
          settype('success')
          setText('Transaction created Succesfully')
        } else {
          settype('error')
          setText('Failed to Create Transaction')
        }
        setOpen(true)
        setcommonloader(false)
        navigate('/transaction')
      }
    }
  }

  const handleCashfreePaymentClick = async () => {
    try {


        const txnResponse = await transaction_service.createTransaction(transactionPayload)
      if (txnResponse?.status) {
        setCommonLoader(true)
        if (txnResponse?.data) {
          settype('success')
          setText('Transaction created Succesfully')
        } else {
          settype('error')
          setText('Failed to Create Transaction')
        }
        setOpen(true)

      const response = await transaction_service.createOrder({     amount:transactionPayload?.amount,transactionId:txnResponse?.data })
      const { payment_session_id } = response

      console.log(response)

      const { data } = await transaction_service.createDealcover(dealCoverPayload)

      if (data?.dealNumber) {
        const txnResponse = await transaction_service.createTransaction(transactionPayload)
        if (txnResponse?.status) {
          setCommonLoader(true)
          if (txnResponse?.data) {
            settype('success')
            setText('Transaction created Succesfully')
          } else {
            settype('error')
            setText('Failed to Create Transaction')
          }
          setOpen(true)
          setcommonloader(false)
          navigate('/transaction')
        }
      }

      if (!payment_session_id) {
        alert('Failed to get session ID')
        return
      }

      const htmlContent = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cashfree Checkout</title>
          <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
      </head>
      <body>
          <script>
              document.addEventListener("DOMContentLoaded", function () {
                  const cashfree = Cashfree({ mode: "sandbox" });

                  let checkoutOptions = {
                      paymentSessionId: "${payment_session_id}",
                      redirectTarget: "_self",
                  };

                  // Automatically trigger checkout when page loads
                  cashfree.checkout(checkoutOptions);
              });
          </script>
      </body>
      </html>`

      document.open()
      document.write(htmlContent)
      document.close()
  }  } catch (error) {
      console.error('Payment initiation failed:', error)
      alert('Payment failed. Please try again.')
    }
  }

  const handleUserSelect = (user: { name: string; accountNumber: string; profilePhoto: string; applicantId: string }) => {
    setSelectedUser(user)
    setSearchText(user.name) // Set selected user's name in TextField
    setFilteredUsers([])
  }
  const theme: any = useTheme()
  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.TRANSACTION_OUTWARD}>
      <Box
        sx={{
          width: '80vw',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" gutterBottom color={theme.palette.secondary.main} sx={{ fontWeight: 'bold' }}>
            Send Money
          </Typography>

          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Back
          </Button>
        </Box>

        <LinearProgress variant="determinate" value={calculateProgress()} sx={{ marginBottom: 2 }} />

        <TabContext value={tabValue}>
          <Tabs value={tabValue} onChange={handleChange} sx={{ marginBottom: 3 }}>
            <Tab label="Create Transaction" value="1" />
            <Tab label="Pay Now" value="2" />
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
                          >
                            {selectedUser.name[0]}
                          </Avatar>
                        </InputAdornment>
                      ),
                      readOnly: applicantId ? true : false,
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
                      {selectedUser.name} (Account: {selectedUser.applicantId})
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
                        {(userCountry === 'IN' ? countries : countries)?.map((country) => (
                          <MenuItem
                            //@ts-ignore
                            key={country?.countryCode}
                            value={country.countryCode}
                          >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <Typography>{country?.countryName}</Typography>
                            </div>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Amount Input */}
                  <Grid item xs={12} md={3}>
                    <TextField
                      label={`Amount In   ${userCurrency != undefined ? userCurrency : ''} `}
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
                      label="Settlement Currency"
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
                          timecharge={selectedTimeChange}
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
                setselectedBenficiary={setSelectedBenificary}
                //@ts-ignore
                beneficiaries={selectedUser?.benificary}
              />

              <Divider sx={{ marginY: 2 }} />

              <Typography variant="h6" gutterBottom>
                BOP Category
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <BobCategoryDropdown
                    amount={amount}
                    setAmount={setAmount}
                    remittanceList={remittanceList || []}
                    category={category}
                    setCategory={setCategory}
                  />
                </Grid>
              </Grid>
              <Box sx={{ textAlign: 'left', marginTop: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Principal Amount: {helper.roundToTwoFixed(amount * Number(forexRate)) + ' ' + currency}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Settlement Amount: {Number(amount) + Number(selectedTimeChange) + ' ' + sourceCountry}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Base Amount: {amount + ' ' + sourceCountry}
                </Typography>
                {/* <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
        Gateway Fee: {  gatewayCharge +" " +sourceCountry }
      </Typography> */}
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Platform Charges: {selectedTimeChange ? selectedTimeChange : 0 + ' ' + sourceCountry}
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setTabValue('2')
                  }}
                  disabled={!helper.checkUserHasPermission(local_service.get_modules()?.TRANSACTION_OUTWARD, 'canCreate')}
                  sx={{ marginTop: '10px' }}
                >
                  Continue
                </Button>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value="2">
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
                      <TableCell>Platform Charges</TableCell>
                      <TableCell align="right">{selectedTimeChange ? selectedTimeChange : 0 + ' ' + sourceCountry}</TableCell>
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
                        <strong>{Number(amount) + Number(selectedTimeChange) + Number(gatewayCharge) + ' ' + sourceCountry}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              {userCountry === 'ZA' ? (
                <>
                  <ConfirmAndPayButton
                    imgUrl="https://cdn.prod.website-files.com/6282d4840afd19e1afa62e70/6491490c213c45a9d600d387_ozow_small_xs.png"
                    handleClick={() => handleOzowPaymentClick()}
                  />
                  <ConfirmAndPayButton
                    imgUrl="https://www.peachpayments.com/hubfs/peachpayments-logo.svg"
                    handleClick={() => handlePeachPaymentsClick()}
                  />

                     <ConfirmAndPayButton
                    imgUrl="https://zapper.gitbook.io/zapper-platform/~gitbook/image?url=https%3A%2F%2F3889691800-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-M4tIVi0eT23PM2ng2_g%252Ficon%252Ffg6xU4qKsy5lQJ83OvI0%252FRounded.svg%3Falt%3Dmedia%26token%3D28b1c6cc-492e-43da-a8d8-230b9ac27b70&width=32&dpr=4&quality=100&sign=9960cbd3&sv=2"
                    handleClick={() => ( handleZapperPaymentGateway()  )}
                  />
                </>
              ) : (
                <>
                  <ConfirmAndPayButton
                    imgUrl="https://cashfreelogo.cashfree.com/website/landings-cache/landings/logo-lightbg_3x.webp"
                    handleClick={() => handleCashfreePaymentClick()}
                  />


                </>
              )}
            </Box>
          </TabPanel>
        </TabContext>

        {/* <GifModal 
      
       //@ts-ignore
      open={gifsuccess} setOpen={setGifSuccess}></GifModal> */}

        <PaymentPopup
          //@ts-ignore
          open={gifsuccess}
          setOpen={setGifSuccess}
          url={url}
        />
      </Box>
    </HasPermission>
  )
}

export default SendMoneyPage
