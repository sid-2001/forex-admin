import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Modal,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Avatar,
  Stack,
  CardMedia,
  Switch,
  IconButton,
} from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AttachMoney, People, AssignmentInd, TrendingUp, CalendarToday, DateRange } from '@mui/icons-material'
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import { useTheme } from '@emotion/react'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import { TransactionService } from '@/services/transaction.service'
import { ApplicantService } from '@/services/applicant.service'
import { PaymentGateway } from '@/types/static.type'
import staticdataService from '@/services/staticdata.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { AnyAaaaRecord } from 'node:dns'
import { Id } from 'react-flags-select'
import TransactionPanel from '@/components/transaction-panel'
import { useRecoilState } from 'recoil'
import { selectedCountryState } from '@/states/state'
import { HelperService } from '@/helpers/helper'

const Dashboard = () => {
  // Sample dashboard data
  const theme = useTheme()
  const dashboardData = {
    totalTransactions: 1245,
    totalActiveCustomers: 843,
    totalApplicants: 312,
    totalProfit: 125600,
    monthlyGrowth: 4.5,
  }

  // Modal state
  const [openModal, setOpenModal] = useState(false)
  const [activeCustomer, setAvtiveCustomers] = useState(false)
  const [userCountry, setuserCounty] = useRecoilState(selectedCountryState)
  const[totalTransaction,setTotalTransaction]=useState('')
  const[applicatnData,setapplicantData]=useState<Array<{
applicantId:String,
applicantName:String,
numberOfTransactions:Number
  }>>([])

  const [recentTransaction, setrecentTransaction] = useState([])
  const [filterType, setFilterType] = useState('monthly')
  const [cards, setCards] = useState<Array<PaymentGateway>>([])
  const [dateRange, setDateRange] = useState({
    start: '2023-01-01',
    end: '2023-06-30',
  })
  const transaction_service = new TransactionService()
  const applicant_service = new ApplicantService()
  const static_service = new staticdataService()
  const local_service = new LocalStorageService()
  const helper = new HelperService()

  const getGatewayList = () => {
    static_service.getStaticPaymentGateway(local_service?.get_staff_country()).then((data: any) => {
      setCards(data?.data?.sort((e: any) => e.costFee))
    })
  }

  useEffect(() => {
    getGatewayList()
    transaction_service.getOutwardTransaction().then((data) => {
      let trx_list = data.transactionDetailsList.map((e) => {
   
        return {
          id: e.transactionOutward.transactionNumber,
          customer: `${e.applicant.firstName} ${e.applicant.lastName}`,
          amount: e.transactionOutward.settlementAmount,
          date: e.transactionOutward.owCreatedDate,
          status: e.transactionOutward.reportingStatus,
          settlementCurrency:e.transactionOutward.settlementCurrency
          
        }
      })

      setrecentTransaction(trx_list as any)
    })
    applicant_service.getApplicantDetalis().then((data: any) => {
      console.log(data)
      //@ts-ignore
    })
    transaction_service.getTransactionSummary(userCountry).then(data=>{
      setapplicantData(data?.data)
      
    })
    //@ts-ignore
  }, [])
  // Sample transaction data for different time periods

  // Sample recent transactions
  const recentTransactions = [
    { id: 1, customer: 'John Doe', amount: 125.5, date: '2023-06-15', status: 'Completed' },
    { id: 2, customer: 'Jane Smith', amount: 89.99, date: '2023-06-14', status: 'Completed' },
    { id: 3, customer: 'Robert Johnson', amount: 245.0, date: '2023-06-13', status: 'Pending' },
    { id: 4, customer: 'Emily Davis', amount: 67.3, date: '2023-06-12', status: 'Failed' },
  ]

  // Sample active customers
  
  const activeCustomers = [
    { id: 1, name: 'John Doe', joinDate: '2021-03-15', purchases: 12 },
    { id: 2, name: 'Jane Smith', joinDate: '2022-01-10', purchases: 8 },
    { id: 3, name: 'Michael Brown', joinDate: '2020-11-22', purchases: 21 },
    { id: 4, name: 'Sarah Wilson', joinDate: '2023-02-05', purchases: 3 },
  ]



  const bankAccounts = [
    {
      name: 'ICICI ',
      balance: 35400.25,
      image_url:
        'https://media.licdn.com/dms/image/v2/C510BAQGqZH7vVbVzWw/company-logo_200_200/company-logo_200_200/0/1630606529683/hdfc_bank_logo?e=1756944000&v=beta&t=RoXmSn8fKd4SYGMdrAyOpeIuy5mFu6NRFNwOBl8szHg',
    },
    {
      name: 'HDFC ',
      balance: 18020.75,
      image_url:
        'https://media.licdn.com/dms/image/v2/C510BAQGqZH7vVbVzWw/company-logo_200_200/company-logo_200_200/0/1630606529683/hdfc_bank_logo?e=1756944000&v=beta&t=RoXmSn8fKd4SYGMdrAyOpeIuy5mFu6NRFNwOBl8szHg',
    },
    {
      name: 'SBI ',
      balance: 50400,
      image_url:
        'https://media.licdn.com/dms/image/v2/C4D0BAQHKjQFwtVCmSg/company-logo_200_200/company-logo_200_200/0/1660627573367/state_bank_of_india_logo?e=1756944000&v=beta&t=F_jA5pDKnBTp7RqEQk4odT2kQ0o3ciooaD4bnNzur0Y',
    },
    {
      name: 'HSBC',
      balance: 2500.9,
      image_url:
        'https://media.licdn.com/dms/image/v2/D4E0BAQGF7uhTJxFBvQ/img-crop_100/img-crop_100/0/1717419425342?e=1756944000&v=beta&t=hVuOkKTkoY_puNtx-0XR9P65wEW5WkvVt1dpi6GURQs',
    },
  ]

  const BankBalanceCarousel = () => {
    const scrollRef = React.useRef<HTMLDivElement>(null)

    const scroll = (offset: number) => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
      }
    }

    return (
      <Box
        position="relative"
        width="100%"
        sx={{
          paddingTop: '-500px',
        }}
      >
        {/* Scroll Buttons */}

        <IconButton
          onClick={() => scroll(-300)}
          sx={{
            position: 'absolute',
            top: '30%',
            left: 0,
            zIndex: 1,
            backgroundColor: 'primary.light',
          }}
        >
          <ArrowLeftIcon />
        </IconButton>
        <IconButton
          onClick={() => scroll(300)}
          sx={{
            position: 'absolute',
            top: '30%',
            right: 0,
            zIndex: 1,
            backgroundColor: 'primary.light',
          }}
        >
          <ArrowRightIcon />
        </IconButton>

        {/* Scrollable Bank Cards */}

        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: 2,
            py: 0,
            px: 6,
            padding: '1%',
            scrollSnapType: 'x mandatory',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {bankAccounts.map((bank, index) => (
            <Box
              key={index}
              sx={{
                flex: '0 0 auto',
                width: {
                  xs: '82%',
                  sm: '46%',
                  md: '50%',
                },
                scrollSnapAlign: 'start',
              }}
            >
              <BankCard
                //@ts-ignore
                description=""
                title={bank?.name}
                balance={bank?.balance}
                image_url={bank?.image_url}
              ></BankCard>
            </Box>
          ))}
        </Box>
      </Box>
    )
  }

  const handleToggle = (id: String, status: boolean) => {
    static_service.paymentGatewayStatus(id, status).then((data) => {
      console.log(data)
      getGatewayList()
    })

    // setEnabled((prev) => !prev)
  }

  const HorizontalCard = ({
    //@ts-ignore
    image_url,
    //@ts-ignore
    id,
    //@ts-ignore
    title,
    //@ts-ignore
    status,
    //@ts-ignore
    description,
  }) => {
    return (
      <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1,
          height: '90%',
          borderRadius: 3,
          boxShadow: 3,
          opacity: status ? 1 : 0.5, // dim when disabled
          pointerEvents: status ? 'auto' : 'auto', // disable interactions
          border: '1px solid',
          borderColor: 'primary.light',
        }}
        // sx={{ border: '1px solid', borderColor: 'primary.light' }}
      >
        <CardMedia component="img" image={image_url} alt={title} sx={{ width: '10vw', height: '3vh', borderRadius: 2 }} />
        <CardContent sx={{ ml: 2, flexGrow: 1 }}>
          {/* <Typography variant="h6">{title}</Typography> */}
          <Typography variant="body2" color="text.secondary">
            <Switch
              checked={status}
              value={status}
              onChange={(e: any) => {
                console.log(e)
                handleToggle(id, !status)
              }}
            />
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const BankCard = ({
    //@ts-ignore
    image_url,
    //@ts-ignore
    title,
    //@ts-ignore
    description,
    //@ts-ignore
    balance,
  }) => {
    const [enabled, setEnabled] = useState(true)

    const handleToggle = () => {
      setEnabled((prev) => !prev)
    }

    return (
      <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1,
          borderRadius: 3,
          height: '80%',
          boxShadow: 3,
          border: '1px solid',
          borderColor: 'primary.light',
          opacity: enabled ? 1 : 0.5, // dim when disabled
          pointerEvents: enabled ? 'auto' : 'none', // disable interactions
        }}
      >
        <CardMedia component="img" image={image_url} alt={title} sx={{ width: '50vw', height: '7vh', borderRadius: 2 }} />
        <CardContent sx={{ ml: 2, flexGrow: 1 }}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            ${balance}
            {/* <Switch checked={enabled} onChange={handleToggle} /> */}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const HorizontalCardCarousel = () => {
    const scrollRef = React.useRef<HTMLDivElement>(null)

    const scroll = (offset: number) => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
      }
    }

    return (
      <Box position="relative" width="100%" padding="0px" margin="0px">
        {/* Scroll Buttons */}
        <IconButton
          onClick={() => scroll(-300)}
          sx={{
            position: 'absolute',
            top: '30%',
            left: 0,
            zIndex: 1,
            backgroundColor: 'primary.light',
          }}
        >
          <ArrowLeftIcon />
        </IconButton>
        <IconButton
          onClick={() => scroll(300)}
          sx={{
            position: 'absolute',
            top: '30%',
            right: 0,
            zIndex: 1,
            backgroundColor: 'primary.light',
          }}
        >
          <ArrowRightIcon />
        </IconButton>

        {/* Carousel Container */}
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            padding:"1%",
            gap: 2,
         paddingTop:"0.3%",
            // px: 0,
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {cards?.map((card, index) => (
            <Box
              key={index}
              sx={{
                flex: '0 0 auto',
                width: {
                  xs: '80%',
                  sm: '45%',
                  md: '30%',
                  
                },
                scrollSnapAlign: 'start',
              }}
            >
              <HorizontalCard
                id={card?.id}
                title={card?.company}
                description=""
                status={card?.activeStatus}
                image_url={card?.imageUrl}
                //@ts-ignore
                status={card?.activeStatus}
              />
            </Box>
          ))}
        </Box>
      </Box>
    )
  }

  const scrollRef = React.useRef<HTMLDivElement>(null)

  const scroll = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  const handleFilterApply = () => {
    // In a real app, you would fetch data based on filters here
    console.log('Applying filters:', { filterType, dateRange })
    setOpenModal(false)
  }

  return (
    <Box sx={{ width: '80vw' }}>
      <Typography
        variant="h4"
        gutterBottom
        color={
          //@ts-ignore
          theme.palette.secondary.main
        }
      >
        <b>Dashboard Overview</b>{' '}
        <ShowChartIcon
          sx={{
            //@ts-ignore
            color: theme.palette.primary,
            fontSize: '5vh',
            marginBottom: '0px',
            //@ts-ignore

            color: theme.palette.primary.light,
            '&:hover': {
              //@ts-ignore
              color: theme.palette.primary.main, // Change the color to blue on hover
            },
          }}
        />
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 }, border: '1px solid', borderColor: 'primary.light' }}
            onClick={() => setOpenModal(true)}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AttachMoney />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Transactions
                  </Typography>
                  <Typography variant="h4" component="div">
                    {

                    
             recentTransaction.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid', borderColor: 'primary.light' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Customers
                  </Typography>
                  <Typography variant="h4" component="div">
                    {applicatnData.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* 
        <Grid item xs={12} sm={6} md={2}>
          <HorizontalCard
            title={'OZOW'}
            description={''}
            image_url={
              'https://media.licdn.com/dms/image/v2/D4E0BAQHUsPmIf1k4pQ/company-logo_200_200/company-logo_200_200/0/1699544024463?e=1756944000&v=beta&t=hE-p5BDhrQR6Ll3UBcg_L9S8_54uAUNAaJwvD5osmBU'
            }
          ></HorizontalCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <HorizontalCard
            title={'Cahfree'}
            description={''}
            image_url={
              'https://media.licdn.com/dms/image/v2/C560BAQF4u3uIRgM6Cg/company-logo_100_100/company-logo_100_100/0/1632367052546/cashfree_logo?e=1756944000&v=beta&t=hb2EwepUiLkgmWpX9LD0u9Q23gJ6dmrZNV2b-IiEu_Y'
            }
          ></HorizontalCard>
        </Grid> */}

        <Grid item xs={12} sm={6} md={6} mt="0px" p="0px">
          <BankBalanceCarousel></BankBalanceCarousel>
        </Grid>

     

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: '1px solid', borderColor: 'primary.light' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Profit
                  </Typography>
                  <Typography variant="h4" component="div">
                    ${dashboardData.totalProfit.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={9}>
          <HorizontalCardCarousel></HorizontalCardCarousel>
        </Grid>
      </Grid>

      {/* Transaction Filter Modal */}
      {/* <Modal open={openModal} onClose={() => setOpenModal(false)} aria-labelledby="transaction-filter-modal">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 600 },
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 1,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <Typography id="transaction-filter-modal" variant="h6" component="h2" mb={2}>
            Transaction Filters
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="filter-type-label">Filter Type</InputLabel>
                <Select labelId="filter-type-label" value={filterType} label="Filter Type" onChange={(e) => setFilterType(e.target.value)}>
                  <MenuItem value="yearly">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarToday fontSize="small" />
                      <span>Yearly</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="monthly">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <DateRange fontSize="small" />
                      <span>Monthly</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ height: 300, mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Transaction Overview ({filterType})
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      //@ts-ignore
                      transactionData[filterType]
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="transactions" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="outlined" sx={{ mr: 2 }} onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleFilterApply}>
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal> */}

      {/* Additional Data Sections */}
      <Grid container spacing={3}>
        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid', borderColor: 'primary.light' }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  backgroundColor: 'pimary.main',
                }}
              >
                <b> Recent Transactions</b>
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {recentTransaction.map((transaction: any) => (
                  <Box key={transaction.id} sx={{ mb: 2, p: 1, borderBottom: '1px solid ', borderColor: 'primary.light' }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight="bold">{transaction.customer}</Typography>
                      <Typography color="text.secondary">{transaction?.settlementCurrency} {transaction.amount}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" mt={1}>
                      <Typography variant="body2" color="text.secondary">
                        {helper.convertDateAndTime(transaction.date)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={transaction.status === 'Completed' ? 'success.main' : transaction.status === 'Pending' ? 'warning.main' : 'error.main'}
                      >
                        {transaction.status}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Customers */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid', borderColor: 'primary.light' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <b> Active Customers</b>
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {applicatnData.map((customer) => (
                  <Box 
                  //@ts-ignore
                  key={customer?.applicantId} sx={{ mb: 2, p: 1, borderBottom: '1px solid #eee' }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight="bold">{customer?.applicantName}</Typography>
                      <Typography color="text.secondary">{ String(customer?.numberOfTransactions)} transaction</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Applicant Id: {customer?.applicantId}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

         <TransactionPanel
         //@ts-ignore
         open={openModal}  onClose={()=>{
          setOpenModal(false)
          
         }}/>
   
    </Box>
  )
}

export default Dashboard
