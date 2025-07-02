import React, { useState } from 'react'
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

const Dashboard = () => {
  // Sample dashboard data
  const dashboardData = {
    totalTransactions: 1245,
    totalActiveCustomers: 843,
    totalApplicants: 312,
    totalProfit: 125600,
    monthlyGrowth: 4.5,
  }

  // Modal state
  const [openModal, setOpenModal] = useState(false)
  const [filterType, setFilterType] = useState('monthly')
  const [dateRange, setDateRange] = useState({
    start: '2023-01-01',
    end: '2023-06-30',
  })

  // Sample transaction data for different time periods
  const transactionData = {
    yearly: [
      { name: '2020', transactions: 1800 },
      { name: '2021', transactions: 2400 },
      { name: '2022', transactions: 3200 },
      { name: '2023', transactions: 2100 },
    ],
    monthly: [
      { name: 'Jan', transactions: 120 },
      { name: 'Feb', transactions: 190 },
      { name: 'Mar', transactions: 150 },
      { name: 'Apr', transactions: 200 },
      { name: 'May', transactions: 180 },
      { name: 'Jun', transactions: 210 },
    ],
    weekly: [
      { name: 'Week 1', transactions: 45 },
      { name: 'Week 2', transactions: 60 },
      { name: 'Week 3', transactions: 55 },
      { name: 'Week 4', transactions: 70 },
    ],
  }

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

  const cards = [
    {
      title: 'OZOW',
      image_url:
        'https://media.licdn.com/dms/image/v2/D4E0BAQHUsPmIf1k4pQ/company-logo_200_200/company-logo_200_200/0/1699544024463?e=1756944000&v=beta&t=hE-p5BDhrQR6Ll3UBcg_L9S8_54uAUNAaJwvD5osmBU',
    },
    {
      title: 'Cashfree',
      image_url:
        'https://media.licdn.com/dms/image/v2/C560BAQF4u3uIRgM6Cg/company-logo_100_100/company-logo_100_100/0/1632367052546/cashfree_logo?e=1756944000&v=beta&t=hb2EwepUiLkgmWpX9LD0u9Q23gJ6dmrZNV2b-IiEu_Y',
    },

    {
      title: 'OZOW',
      image_url:
        'https://media.licdn.com/dms/image/v2/D4E0BAQHUsPmIf1k4pQ/company-logo_200_200/company-logo_200_200/0/1699544024463?e=1756944000&v=beta&t=hE-p5BDhrQR6Ll3UBcg_L9S8_54uAUNAaJwvD5osmBU',
    },
    {
      title: 'Cashfree',
      image_url:
        'https://media.licdn.com/dms/image/v2/C560BAQF4u3uIRgM6Cg/company-logo_100_100/company-logo_100_100/0/1632367052546/cashfree_logo?e=1756944000&v=beta&t=hb2EwepUiLkgmWpX9LD0u9Q23gJ6dmrZNV2b-IiEu_Y',
    },
    {
      title: 'OZOW',
      image_url:
        'https://media.licdn.com/dms/image/v2/D4E0BAQHUsPmIf1k4pQ/company-logo_200_200/company-logo_200_200/0/1699544024463?e=1756944000&v=beta&t=hE-p5BDhrQR6Ll3UBcg_L9S8_54uAUNAaJwvD5osmBU',
    },
    {
      title: 'Cashfree',
      image_url:
        'https://media.licdn.com/dms/image/v2/C560BAQF4u3uIRgM6Cg/company-logo_100_100/company-logo_100_100/0/1632367052546/cashfree_logo?e=1756944000&v=beta&t=hb2EwepUiLkgmWpX9LD0u9Q23gJ6dmrZNV2b-IiEu_Y',
    },
    // Add more cards as needed
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
      <Box position="relative" width="100%" mt={1}>
        {/* Scroll Buttons */}
        <IconButton
          onClick={() => scroll(-300)}
          sx={{
            position: 'absolute',
            top: '50%',
            left: 0,
            zIndex: 1,
            backgroundColor: '#fff',
          }}
        >
          <ArrowLeftIcon />
        </IconButton>
        <IconButton
          onClick={() => scroll(300)}
          sx={{
            position: 'absolute',
            top: '50%',
            right: 0,
            zIndex: 1,
            backgroundColor: '#fff',
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
            py: 3,
            px: 6,
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

  const HorizontalCard = ({
    //@ts-ignore
    image_url,
    //@ts-ignore
    title,
    //@ts-ignore
    description,
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
          boxShadow: 3,
          opacity: enabled ? 1 : 0.5, // dim when disabled
          pointerEvents: enabled ? 'auto' : 'none', // disable interactions
        }}
      >
        <CardMedia component="img" image={image_url} alt={title} sx={{ width: '50vw', height: '7vh', borderRadius: 2 }} />
        <CardContent sx={{ ml: 2, flexGrow: 1 }}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            <Switch checked={enabled} onChange={handleToggle} />
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
          boxShadow: 3,
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
      <Box position="relative" width="100%">
        {/* Scroll Buttons */}
        <IconButton onClick={() => scroll(-300)} sx={{ position: 'absolute', top: '50%', left: 0, zIndex: 1, backgroundColor: '#fff' }}>
          <ArrowLeftIcon />
        </IconButton>
        <IconButton onClick={() => scroll(300)} sx={{ position: 'absolute', top: '50%', right: 0, zIndex: 1, backgroundColor: '#fff' }}>
          <ArrowRightIcon />
        </IconButton>

        {/* Carousel Container */}
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            gap: 2,
            py: 3,
            px: 6,
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {cards.map((card, index) => (
            <Box
              key={index}
              sx={{
                flex: '0 0 auto',
                width: {
                  xs: '80%',
                  sm: '45%',
                  md: '40%',
                },
                scrollSnapAlign: 'start',
              }}
            >
              <HorizontalCard title={card.title} description="" image_url={card.image_url} />
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
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }} onClick={() => setOpenModal(true)}>
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
                    {dashboardData.totalTransactions.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
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
                    {dashboardData.totalActiveCustomers.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <AssignmentInd />
                </Avatar>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Applicants
                  </Typography>
                  <Typography variant="h4" component="div">
                    {dashboardData.totalApplicants.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
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
        <Grid item xs={12} sm={6} md={6}>
          <BankBalanceCarousel></BankBalanceCarousel>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <HorizontalCardCarousel></HorizontalCardCarousel>
        </Grid>
      </Grid>

      {/* Transaction Filter Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} aria-labelledby="transaction-filter-modal">
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
      </Modal>

      {/* Additional Data Sections */}
      <Grid container spacing={3}>
        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {recentTransactions.map((transaction) => (
                  <Box key={transaction.id} sx={{ mb: 2, p: 1, borderBottom: '1px solid #eee' }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight="bold">{transaction.customer}</Typography>
                      <Typography color="text.secondary">${transaction.amount}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" mt={1}>
                      <Typography variant="body2" color="text.secondary">
                        {transaction.date}
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
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Customers
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {activeCustomers.map((customer) => (
                  <Box key={customer.id} sx={{ mb: 2, p: 1, borderBottom: '1px solid #eee' }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight="bold">{customer.name}</Typography>
                      <Typography color="text.secondary">{customer.purchases} purchases</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Member since: {customer.joinDate}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
