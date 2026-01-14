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
  IconButton,
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
import RexPay from "../../helpers/rexpay";

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
    const [userCurrency, setUserCurrency] = useRecoilState(userCurrencyState)
    //@ts-ignore
  const [sourceCountry, setSourceCountry] = useState(userCurrency?.currencyCode)
  const [gatewayCharge, setGatewayCharge] = useState(0)
  const [selectedBenficary, setSelectedBenificary] = useState({})
  const [userlist, setUserList] = useState([])
  const [gifsuccess, setGifSuccess] = useState(false)
  const [sendCountry, setsendCountry] = useState('')
  const [commonloader, setcommonloader] = useRecoilState(loaderStateNew)

  const [selectedTimeChange, setSelectedTimeCharge] = useState<number>(0)
  const [selectedUser, setSelectedUser] = useState<{ name: string; accountNumber: string; profilePhoto: string; applicantId: string } | null>(null)
  const [category, setCategory] = useState<string>('')
  const[loyalityamout,setloyalityamount]=useState(0)
  const [selectedCountry, setSelectedCountry] = useState<string>('')
    const [isSecondTabEnabled, setIsSecondTabEnabled] = useState(false);
    const [error, setError] = useState(false);
    const[finalcharges,setfinalcharges]=useState(0);

  const [currency, setCurrency] = useState<string>('')
  const [forexRate, setForexRate] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [selectedTransferMethod, setSelectedTransferMethod] = useState('Bank Transfer')
  const[gatewayId,setgatewayId]=useState(null)
  const [countries, setCountries] = useRecoilState(countyState)
   const [included, setIncluded] = useState(false);
   const[live ,islive]=useState(false)
   

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
  const [availableLimit, setAvailablelimit] = useState('')

  const [url, seturl] = useState<string>('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const applicantId = searchParams.get('applicantId')
  const beneficiaryId = searchParams.get('beneficiaryId')

  const TimechargesRows: GridRowsProp = [
    { id: 1, time: '2 hours', charges: 10, total: 200 },
    { id: 2, time: '8 hours', charges: 5, total: 200 },
    { id: 3, time: '2 days', charges: 0.5, total: 200 },
  ]


 const [state, setState] = useState({
    amount: "",
    loading: false,
    transactions: [],
  });
  function OnClickPayButton() {
    let transactionId = "Test" + Math.floor(Math.random() * 1000000);
    setState({ ...state, loading: true });
    const rex = new RexPay();
    // rex.apiUrl=
    try {
      // rex.apiUrl="https://checkout-dev.globalaccelerex.com/pay/17642458VziKSogBww"
      //   rex.testUrl="https://checkout-dev.globalaccelerex.com/pay/17642458VziKSogBww"
      rex.initializePayment({
        reference: transactionId,
        amount: 100,
        currency: "NGN",
        userId: "test@gmail.com",
        callbackUrl: "https://webhook.site/16fd3edc-f043-4a2b-b475-2825b56fc80c",
        mode: "Debug",
        metadata: {
          email: "test@gmail.com",
          customerName: "Test User",
        },
      }).then((response) => {
        console.log(response);
        //@ts-ignore
        if (response.success) {
          setState({ ...state, loading: false });
          sessionStorage.setItem("tranId", transactionId); // it can be saved to Database.
          //@ts-ignore
          sessionStorage.setItem("reference", response.data?.reference); // it can be saved to Database
          //@ts-ignore
          window.location.href = response.data?.authorizeUrl;
        } else {
          setState({ ...state, loading: false });
          //@ts-ignore
          window.location.href = response.data?.authorizeUrl;
        }
      });
    } catch (error) {
      //handle error
      console.log(error);
    }
  }

  function VerifyPayment() {
    try {
      const tranId =
        localStorage.getItem("tranId") === null
          ? ""
          : localStorage.getItem("tranId");
     const rex = new RexPay();
     //@ts-ignore
      rex.VerifyPayment({
        transactionReference: tranId,

      }).then(
        //@ts-ignore
        (response) => {
        let amount = response?.data?.amount;
        if (amount) {
          setState({ ...state, amount, transactions: response.data.history });
        } else {
          setState({ ...state, amount: "" });
        }
      });
    } catch (error) {
      //handle error
      setState({ ...state, amount: "" });
    }
  }
  useEffect(() => {
    // or ComponentDidMount if you are using class component
    VerifyPayment();
  }, []);




  const getCharges = (principla_amount:any) => {
    kyc_service.getCharges(userCountry, sendCountry, principla_amount, 0, selectedUser?.applicantId).then(({ data }) => {
      console.log(data)
      setloyalityamount(data?.loyaltyDiscountAmt)
      
      if (data) {
        setSelectedTimeCharge(data?.calculatedCharge)
        setfinalcharges(data?.finalCharges)


          //    applicantId: selectedUser?.applicantId,
          //  receiveCountry:selectedCountry,
          //      sendCountry:selectedCountry,
             

          //@ts-ignore
        transaction_service.getTransactionReferalsPoints( selectedUser?.applicantId, userCountry === 'ZA' ? 'ZAR' : 'INR',(data?.calculatedCharge)).then(referaldata=>{

//  setloyalityamount((referaldata?.data)?(referaldata?.data):0);
        })
       
      } else {
        setSelectedTimeCharge(0)
      }
    })
  }
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

            kyc_service.getCharges(userCountry, sendCountry, amount, params?.row?.id, selectedUser?.applicantId).then(({ data }) => {
              console.log(data)
              if (data) {
                setSelectedTimeCharge(data.minimumCharges)
                   setloyalityamount((data?.loyaltyDiscountAmt)?(data?.loyaltyDiscountAmt):0);
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
      const data: any = await applicant_service.searchByApplicantId(applicantId)
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
      if (beneficiaryId) {
        const selectedBen = data.beneficiaryList.find((b: any) => beneficiaryId === b.beneficiaryId)
        setSelectedBenificary({
          accountHolderName: selectedBen?.beneficiaryMiddleName
            ? `${selectedBen.beneficiaryFirstName} ${selectedBen.beneficiaryMiddleName} ${selectedBen.beneficiaryLastName}`
            : `${selectedBen.beneficiaryFirstName} ${selectedBen.beneficiaryLastName}`,
          accountNumber: selectedBen?.accountNumber,
          bank: selectedBen?.bankName,
          ifscCode: selectedBen?.ifscCode,
          benificaryId: beneficiaryId,
          name: selectedBen?.beneficiaryMiddleName
            ? `${selectedBen.beneficiaryFirstName} ${selectedBen.beneficiaryMiddleName} ${selectedBen.beneficiaryLastName}`
            : `${selectedBen.beneficiaryFirstName} ${selectedBen.beneficiaryLastName}`,
        })
      }
      //@ts-ignore
      setSelectedUser({
        //@ts-ignore
        applicantId: data?.applicant?.applicantId,
        //@ts-ignore
        id: data?.applicant?.applicantId,
        //@ts-ignore
        name: data.applicant?.firstName,
        //@ts-ignore
        nationality: data?.applicant?.nationality,
        //@ts-ignore
        lastname: data?.applicant?.lastName,
        //@ts-ignore
        accountNumber: data.applicant.applicantId,
        profilePhoto: 'https://randomuser.me/api/portraits/women/4.jpg',
        benificary: benificiary_list,
      })
      //@ts-ignore
      setSearchText(data.applicant?.firstName) // Set selected user's name in TextField
      setFilteredUsers([])
      return
    } catch (error) {
      console.error('Error fetching applicant data:', error)
    }
  }

  const fetchBopList = async () => {
    try {
      const { data } = await transaction_service.getBop(userCountry)
      setRemittanceList(data || [])
    } catch (err) {
      console.log(err)
    }
  }

  const fetchComplianceLimitData = async (userId: any) => {
    if (!userId) {
      return
    }
    try {
      const response = await applicant_service.getCompliance(userId)
      setAvailablelimit(response?.availableLimit)
    } catch (error) {
      console.error('Error fetching applicant data:', error)
    }
  }

  useEffect(() => {
    setcommonloader(true)
    if (applicantId) {
      fetchApplicantData()
      fetchComplianceLimitData(applicantId)
    } else {
      applicant_service.getApplicantDetalis().then((data) => {
        let users = data.map((e) => {
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
            lastname: e.applicant?.lastName,
            //@ts-ignore

            nationality: e.applicant?.nationality,
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
    console.log('selected', selected)

    static_service.getCountryCurrency(selected?.countryCode).then((data) => {
      //@ts-ignore

      console.log(data)
      //@ts-ignore
      setCurrency(data?.currencyCode)

      if (selected) {
        console.log(userCurrency)
        console.log(data)
        transaction_service
          .getForexRate(
            //@ts-ignore
            userCurrency?.currencyCode,
            //@ts-ignore
            data?.currencyCode,
          )
          .then((data) => {
            console.log(data)
            setForexRate(data)
          })
        //@ts-ignore
        // setCurrency(selected.currency)
        //@ts-ignore
        
        setsendCountry(selected.countryCode)
        //@ts-ignore
        setSourceCountry(userCurrency?.currencyCode)
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
    console.log(local_service?.get_staff_country())

    // Filter users based on the search text for name or ID
    if (value.trim() === '') {
      setFilteredUsers([])
      setSelectedUser(null)
    } else {
      console.log(value)
      const filtered = userlist.filter(
        (user) =>
          //@ts-ignore

          (user?.name?.toLowerCase().includes(value.toLowerCase()) ||
            //@ts-ignore
            user?.lastName?.toLowerCase().includes(value.toLowerCase()) ||
            //@ts-ignore
            user?.id?.toString().includes(value) ||
            //@ts-ignore
            user?.lastname?.toLowerCase().includes(value.toLowerCase())) &&
          //@ts-ignore
          user?.nationality?.toLowerCase() == local_service?.get_staff_country()?.toLowerCase(),
      )
      setFilteredUsers(filtered)
    }
  }

  const getGatewaysListByCountry = async () => {
    const gatewayslistResponse = await transaction_service.fetchGatewaysByCountry(userCountry)
    setGatewaysList(gatewayslistResponse || [])
  }

  const transactionPayload = {
   

    // amount: amount,
    // fcmToken: "",
    //@ts-ignore
  

  
    //  bopId: 79,
 
  


 
    // forex: forexRate?forexRate:4.5,
   
   
    // selectedTimeMethod: {
    //   time: '2 hours',
    //   charges: selectedTimeChange,
    //   total: Number(amount) + Number(selectedTimeChange) + Number(gatewayCharge),
    // },
   

    // sourceCountry: userCountry,
    // //@ts-ignore
    // timecharge: selectedTime?.time,
    // totalpaybleamount: Number(amount) + Number(selectedTimeChange) + Number(gatewayCharge),


    transferMethod: selectedTransferMethod,
    //@ts-ignore
      receiverId: selectedBenficary?.benificaryId,
         applicantId: selectedUser?.applicantId,
           receiveCountry:selectedCountry,
               sendCountry:userCountry,
             
     principalAmount: helper.roundToTwoFixed( (Number(amount)-Number(selectedTimeChange)) * Number(forexRate)),

    principalCurrency: currency,
       settlementCurrency: sourceCountry,
        settlementAmount: Number(amount) ,
          

    gatewayStatus: 'Success',


      rewardPoints: 23.7,
     exchangeRates: helper.roundToTwoFixed(forexRate),
  vatCharges: 50.0,
    
    bopId: category,

 gatewayId: 'IMPGW009',
    charges: finalcharges,
      loyaltyDiscountAmt:loyalityamout,
     
//@ts-nocheck
//@ts-ignore
     finalCharges: finalcharges,
    // transactionId: "ZAOWRM250814IN2524",
  }

  const dealCoverPayload = {
    sourceCurrency: userCountry === 'ZA' ? 'ZAR' : 'INR',
    destinationCurrency: userCountry === 'ZA' ? 'INR' : 'ZAR',
    destinationCountry: userCountry === 'ZA' ? 'IN' : 'ZA',
    applicantId: selectedUser?.applicantId as any,
    rate: Number(forexRate),
  }

  const handleZapperPaymentGateway = async () => {
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

      let zapper_trans = await transaction_service.createZaphierTransaction({
        //@ts-ignore
        amount: transactionPayload?.principalAmount,
        currencyISOCode: 'ZAR',
        transactionNumber: txnResponse?.data,
      })

      setcommonloader(false)

      console.log(zapper_trans?.data?.redirectUrl)

      window.location.href = zapper_trans?.data?.redirectUrl

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
  
      }
     

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
     

      const { data } = await transaction_service.createDealcover(dealCoverPayload)

      if (data?.dealNumber) {
        const txnResponse = await transaction_service.createTransaction(transactionPayload)
        if (txnResponse?.status) {
          setCommonLoader(true)
          if (txnResponse?.data) {
            settype('success')
            setText('Transaction Redicect Success')
          } else {
            settype('error')
            setText('Failed to Redircet Transaction')
          }
          setOpen(true)
          setcommonloader(false)
          // navigate('/transaction')


          //@ts-ignore
          const response = await transaction_service.createOrder({ amount: transactionPayload?.amount, transactionId: txnResponse?.data })
          const { payment_session_id } = response.data

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
        }
      }
    } catch (error) {
      console.error('Payment initiation failed:', error)
      alert('Payment failed. Please try again.')
    }
  }

  const handleAdumoPaymentClick = async () => {
    try {
      const { data } = await transaction_service.createDealcover(dealCoverPayload)

      if (data?.dealNumber) {
        const txnResponse = await transaction_service.createTransaction(transactionPayload)
        if (txnResponse?.status) {
          setCommonLoader(true)
          if (txnResponse?.data) {
            settype('success')
            setText('Transaction Redicect Success')
          } else {
            settype('error')
            setText('Failed to Redircet Transaction')
          }
          setOpen(true)
          setcommonloader(false)
          // navigate('/transaction')


          //@ts-ignore
          const response = await transaction_service.createAdumoOrder({ amount: transactionPayload?.principalAmount, transactionId: txnResponse?.data })
          const { data } = response

          console.log(data)

          if (!data) {
            alert('Failed to get session ID')
            return
          }
          window.location.replace((data)?.url)

         
        }
      }
    } catch (error) {
      console.error('Payment initiation failed:', error)
      alert('Payment failed. Please try again.')
    }
  }


    const handleSquadPaymentClick = async () => {
    try {
      const { data } = await transaction_service.createDealcover(dealCoverPayload)

      if (data?.dealNumber) {
        const txnResponse = await transaction_service.createTransaction({...transactionPayload,gatewayId:"IMPGW009"


        })
        if (txnResponse?.status) {
          setCommonLoader(true)
          if (txnResponse?.data) {
            settype('success')
            setText('Transaction Redicect Success')
          } else {
            settype('error')
            setText('Failed to Redircet Transaction')
          }
          setOpen(true)
          setcommonloader(false)
          // navigate('/transaction')


          //@ts-ignore
          const response = await transaction_service.createSquadOrder({ amount: amount, transactionNumber: txnResponse?.data })
          const { data } = response

          console.log(data)

          // if (!data) {
          //   alert('Failed to get session ID')
          //   return
          // }
          window.location.replace((data)?.checkout_url)

         
        }
      }
    } catch (error) {
      console.error('Payment initiation failed:', error)
      alert('Payment failed. Please try again.')
    }
  }

  const RexPaymentClick = async () => {
    try {
      const { data } = await transaction_service.createDealcover(dealCoverPayload)

      if (data?.dealNumber) {
        const txnResponse = await transaction_service.createTransaction({...transactionPayload,gatewayId:'IMPGW010'
        })
        if (txnResponse?.status) {
          setCommonLoader(true)
          if (txnResponse?.data) {
            settype('success')
            setText('Transaction Redirect Success')
          } else {
            settype('error')
            setText('Failed to Redircet Transaction')
          }
          setOpen(true)
          setcommonloader(false)
          // navigate('/transaction')


          //@ts-ignore
          const response = await transaction_service.createRexoayOrder({ amount: amount, transactionNumber: txnResponse?.data })
          const { data } = response

          console.log(data)
OnClickPayButton()
          // if (!data) {
          //   alert('Failed to get session ID')
          //   return
          // }
          // window.location.replace((data)?.checkout_url)

         
        }
      }
    } catch (error) {
      console.error('Payment initiation failed:', error)
      alert('Payment failed. Please try again.')
    }
  }

  const payfastCredentials = {
  payUrlSandbox: "https://sandbox.payfast.co.za/eng/process",
  payUrlLive: "https://www.payfast.co.za/eng/process",
  merchant_id: "10000100",
  merchant_key: "46f0cd694581a",
  m_payment_id: "01AB",
  return_url: `${VITE_APP_URL}/transaction/response&status=success&payfastdata=${
JSON.stringify({...transactionPayload,gatewayStatus:"Success"})

  }`,
  cancel_url: `${VITE_APP_URL}/transaction/response&status=fail&payfastdata=${
JSON.stringify({...transactionPayload,gatewayStatus:"Fail"})
  }`,
  notify_url: "https://example.com/notify",
};

 const handlePayfast = () => {
    const payfastURL ="https://sandbox.payfast.co.za/eng/process"

    console.log(JSON.stringify({...transactionPayload,gatewayStatus:"Success"})
)

    const payfastForm = `
      <html>
        <body onload="document.forms[0].submit()">
          <form action="${payfastURL}" method="post">
            <input type="hidden" name="merchant_id" value="${payfastCredentials.merchant_id}" />
            <input type="hidden" name="merchant_key" value="${payfastCredentials.merchant_key}" />
            <input type="hidden" name="amount" value="${amount}" />
            <input type="hidden" name="m_payment_id" value="${payfastCredentials.m_payment_id}" />
            <input type="hidden" name="item_name" value="panakajtomar" />
            <input type="hidden" name="item_description" value="This is a test item." />
            <input type="hidden" name="name_first" value="siddhant" />
            <input type="hidden" name="name_last" value="kauhsij" />
            <input type="hidden" name="email_address" value="siddhant@gmail.com" />
            <input type="hidden" name="cell_number" value="+27831231234" />
            <input type="hidden" name="return_url" value=${ VITE_APP_URL}/transaction/response?status=success&payfastdata=${encodeURIComponent(
JSON.stringify(( {...transactionPayload,gatewayStatus:"Success"})))
  } />

<input
  type="hidden"
  name="cancel_url"
  value=${VITE_APP_URL}/transaction/response?status=cancelled&payfastdata=${encodeURIComponent(JSON.stringify({ ...transactionPayload, gatewayStatus: "Failed" }))}
/>




            <input type="hidden" name="notify_url" value="${payfastCredentials.notify_url}" />
          </form>
        </body>
      </html>
    `;

    // Open the form in a new tab and auto-submit
    // const document = window.open("", "_blank");
    // newWindow.document.write(payfastForm);
    // newWindow.document.close();
    document.open();
document.write(payfastForm);
document.close();

  };


  const handleUserSelect = (user: { name: string; accountNumber: string; profilePhoto: string; applicantId: string }) => {
    setSelectedUser(user)
    setSearchText(user.name) // Set selected user's name in TextField
    setFilteredUsers([])
    fetchComplianceLimitData(user?.applicantId)
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
            <Tab label="Pay Now" value="2" disabled={!(selectedUser?.applicantId && userCountry && category)}></Tab> 
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
                            alt={selectedUser.name + '' + selectedUser.lastname}
                            style={{ marginRight: '8px' }}
                          >
                            {/* {JSON.stringify( selectedUser)} */}
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
                                user.name + ' ' + user.lastname
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
      mr: 3,
      color: 'green',
    }}
  />
  {selectedUser.name +
    ' ' +
    //@ts-ignore
    selectedUser?.lastname}{' '}
  (Account: {selectedUser.applicantId})
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
                        {
                          //(userCountry === 'IN' ? countries : countries)
                          countries
                            ?.filter((item) => item.status === 'A' && item.countryCode !== userCountry)
                            .map((country) => (
                              <MenuItem
                                //@ts-ignore
                                key={country?.countryCode}
                                value={country.countryCode}
                              >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography>{country?.countryName}</Typography>
                                </div>
                              </MenuItem>
                            ))
                        }
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Amount Input */}
             <Grid item xs={12} md={3}>
  <TextField
    type="number"
    //@ts-ignore
    label={`Amount In ${userCurrency?.currencyCode ?? ""}`}
    variant="filled"
    fullWidth
    inputProps={{ min: 1 }}
    value={amount ?? ""}
    onChange={(e) => {
      let rawValue = e.target.value;

      // ✅ allow clearing
      if (rawValue === "") {
        //@ts-ignore
        setAmount(null);
        setError(false);
        return;
      }

      // ⛔ remove leading zeros (0, 01, 0005 → 5)
      rawValue = rawValue.replace(/^0+/, "");

      // if only zeros were entered → clear input
      if (rawValue === "") {
        //@ts-ignore
        setAmount(null);
        return;
      }

      const value = Number(rawValue);

      // ⛔ block negative or invalid
      if (isNaN(value) || value < 0) return;

      setAmount(value);

      if (value < 100) {
        setError(true);
      } else {
        setError(false);
        setSelectedTimeCharge(0);
        getCharges(value);
      }
    }}
  />

  {error && (
    <Typography variant="body2" color="error" sx={{ mt: 0.5, ml: 1 }}>
      Amount must be at least 100
    </Typography>
  )}
</Grid>

                  {/* Currency (Auto-populated and Disabled) */}
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Principal Currency"
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
                beneficiaryId={beneficiaryId || ''}
                choosedBenificiary={ selectedBenficary }
                //@ts-ignore
                beneficiaries={beneficiaryId ? [] : selectedUser?.benificary}
                handleSetBenificiaryData={(record: any) => {
                  setSelectedBenificary(record)
              
                }}
              />

              <Divider sx={{ marginY: 2 }} />

              <Typography variant="h6" gutterBottom>
            {userCountry=="Ng"||"In"?" Purpose Code":"BOP Category"}     
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

                  <Typography variant="body2" >
                  Platform Fees: {selectedTimeChange ? selectedTimeChange : 0 + ' ' + sourceCountry}  <i style={{
                    fontSize:'100'
                  }}>(VAT Inclusive)</i>
                </Typography>
                       <Typography variant="body2" >
          Loyalty Discount: {loyalityamout ? loyalityamout : 0 + ' ' + sourceCountry}
                </Typography>
               
                 <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          Final Charges: {finalcharges ? finalcharges : 0 + ' ' + sourceCountry}
                </Typography>

                
  <br></br>

                {/* <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Settlement Amount: {Number(amount) + Number(selectedTimeChange) + ' ' + sourceCountry}
                </Typography> */}

                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Net Payable Amount (Settlement Amount): {Number(amount) + ' ' + sourceCountry} 
                </Typography>

                <Typography variant="body1" sx={{ fontWeight: 'bold' }} >
            Beneficiary will Receive (Principal Amount): {helper.roundToTwoFixed( (Number(amount)-Number(selectedTimeChange)) * Number(forexRate)) + ' ' + currency}
                </Typography>
                {/* <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Base Amount: {amount + ' ' + sourceCountry}
                </Typography> */}
                {/* <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
        Gateway Fee: {  gatewayCharge +" " +sourceCountry }
      </Typography> */}
              


         

                 {/* <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
        Referal Amount Available: {loyalityamout ? loyalityamout : 0} {sourceCountry}
      </Typography>

      <IconButton
        size="small"
        color={included ? 'error' : 'primary'}
        onClick={() => setIncluded(!included)}
      >
        {included ? <RemoveCircleOutlineIcon /> : <AddCircleOutlineIcon />}
      </IconButton>

      <Typography variant="body2" sx={{ color: included ? 'green' : 'gray' }}>
        {included ? 'Included' : 'Excluded'}
      </Typography>
    </Stack> */}

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (amount < Number(availableLimit)) {
                      setTabValue('2')
                    } else {
                      setOpen(true)
                      settype('error')
                      setText('Please enter an amount less than the available limit.')
                      return
                    }
                  }}
                  // disabled={!helper.checkUserHasPermission(local_service.get_modules()?.TRANSACTION_OUTWARD, 'canCreate')}
                  sx={{ marginTop: '10px' }}
                  disabled={!(selectedUser?.applicantId && userCountry && category)}
                >
                  {/*    amount: amount,
    // fcmToken: "",
    //@ts-ignore

    benificaryId: selectedBenficary?.benificaryId,
    bopId: category,
    //  bopId: 79,
       applicantId:selectedUser?.applicantId, 
    destinationCountry: selectedCountry,
    destinationCurrency: userCountry === 'ZA' ? 'INR' : 'ZAR',
    forex: forexRate,

    gatewayId: 'IMPGW004',
    gatewayStatus: 'Pending',
    selectedTimeMethod: {
        "time": "2 hours",
        "charges": 50,
        "total": 200
    },
    sourceCurrency: userCountry === 'ZA' ? 'ZAR' : 'INR',
    sourceCountry: userCountry,
    //@ts-ignore
    timecharge: selectedTime?.time,
    totalpaybleamount: Number(amount) + Number(selectedTimeChange) + Number(gatewayCharge),
    transferMethod: selectedTransferMethod, */}
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
                      <TableCell>Principal Amount</TableCell>
                      <TableCell align="right">
   {helper.roundToTwoFixed( (Number(amount)-Number(selectedTimeChange)) * Number(forexRate)) + ' ' + currency}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>Settlement Amount</TableCell>
                      <TableCell align="right">{helper.roundToTwoFixed(amount) + ' ' + sourceCountry}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Platform Charges</TableCell>
                      <TableCell align="right">{finalcharges ? finalcharges : 0 + ' ' + sourceCountry}</TableCell>
                    </TableRow>
                  
                    <TableRow>
                      <TableCell>
                        <strong>Net Payable</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{Number(amount)  +" "+ sourceCountry}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              {userCountry === 'ZA' ? (
                <>
              

                  <ConfirmAndPayButton
                    imgUrl="https://media.licdn.com/dms/image/v2/D4D0BAQFafwhXng3fkQ/company-logo_200_200/company-logo_200_200/0/1730292941961/adumo_online_logo?e=2147483647&v=beta&t=agng3yUCjdKlMYt76saZvTJHFC3Tx1BC9uaGlVTLh4c"
                    handleClick={() => handleAdumoPaymentClick()}
                  />
                  

                  <ConfirmAndPayButton
                    imgUrl="https://zapper.gitbook.io/zapper-platform/~gitbook/image?url=https%3A%2F%2F3889691800-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-M4tIVi0eT23PM2ng2_g%252Ficon%252Ffg6xU4qKsy5lQJ83OvI0%252FRounded.svg%3Falt%3Dmedia%26token%3D28b1c6cc-492e-43da-a8d8-230b9ac27b70&width=32&dpr=4&quality=100&sign=9960cbd3&sv=2"
                    handleClick={() => handleZapperPaymentGateway()}
                  />
                    <ConfirmAndPayButton
                    imgUrl="https://media.licdn.com/dms/image/v2/D4E0BAQEz9WJPKYSK0A/company-logo_200_200/B4EZpNyegnKsAI-/0/1762241671815?e=1764806400&v=beta&t=09XanxAnaCDQCwm9VDqNzu0_IpVEAWGqFzGDf_74O8E"
                    handleClick={() => handlePayfast()}
                  />
                </>
              ) : (
                
                (userCountry === 'NG')?
                
                <>
                   <ConfirmAndPayButton
                    imgUrl="https://squadco.com/assets/squadbyhabari.svg"
                    handleClick={() => handleSquadPaymentClick()}
                  />
                     <ConfirmAndPayButton
                    imgUrl="https://www.myrexpay.com/assets/landingimages/App-Logo.svg"
                    handleClick={() => RexPaymentClick()}
                  />


                </>:<>
                
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
