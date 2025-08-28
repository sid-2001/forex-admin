import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Box, Card, CardContent, Typography, Grid, Avatar, Stack, CardMedia, Switch, IconButton, Skeleton } from '@mui/material'
import { AttachMoney, People, TrendingUp } from '@mui/icons-material'
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useTheme } from '@mui/material/styles'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import { TransactionService } from '@/services/transaction.service'
import { PaymentGateway } from '@/types/static.type'
import staticdataService from '@/services/staticdata.service'
import { useRecoilState } from 'recoil'
import { selectedAppState, alertState, alertTextState, alertTypeState, loaderState, availableBalanceState } from '@/states/state'
import { LocalStorageService } from '@/helpers/local-storage-service'
import TransactionPanel from '@/components/transaction-panel'
import { HelperService } from '@/helpers/helper'
import { Link, useNavigate } from 'react-router-dom'
import { AgChartOptions } from "ag-charts-community";
import TransactionModal from '@/components/transaction-panel'
import { DataGrid } from '@mui/x-data-grid'
import { ApplicantService } from '@/services/applicant.service'

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
  const [openModal, setOpenModal] = useState<any>(false)

  const [applicatnData, setapplicantData] = useState<
    Array<{
      applicantId: String
      applicantName: String
      numberOfTransactions: Number
    }>
  >([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [recentTransaction, setrecentTransaction] = useState<any>([])
  const [cards, setCards] = useState<Array<PaymentGateway>>([])
  const [balance, setBalance] = useRecoilState(availableBalanceState)
  const [loader, setLoader] = useRecoilState(loaderState)
  const [enabled, setEnabled] = useState(true)
  const [consumersData, setConsumersData] = useState<any>(null)
  const Service = new ApplicantService()
  const transaction_service = new TransactionService()
  const static_service = new staticdataService()
  const local_service = new LocalStorageService()
  const helper = new HelperService()
  const userCountry = local_service?.get_staff_country()
  const trx_service = new TransactionService()

  const [selectedApp, setSelectedApp] = useRecoilState(selectedAppState)
  const navigate = useNavigate()
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const getGatewayList = () => {
    static_service.getStaticPaymentGateway(local_service?.get_staff_country()).then((data: any) => {
      setCards(data?.data?.sort((e: any) => e.costFee))
    })
  }


  const getOutwardTransactionsList = useCallback(async () => {
    const data = await transaction_service.getOutwardAllTransaction(userCountry)
    setrecentTransaction(data || [])
    setIsLoading(false)
  }, [])

  const fetchConsumersData = async () => {
    try {
      const data = await Service.getConsumersData()
      setConsumersData(data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  useEffect(() => {
    getGatewayList()
    fetchConsumersData()
    setIsLoading(true)
    getOutwardTransactionsList()
    setSelectedApp('Dashboard')
    transaction_service.getTransactionSummary(userCountry).then((data) => {
      setapplicantData(data?.data)
    })
  }, [])

  const bankAccounts = [
    {
      name: 'ICICI ',
      balance,
      image_url:
        'https://media.licdn.com/dms/image/v2/C510BAQGqZH7vVbVzWw/company-logo_200_200/company-logo_200_200/0/1630606529683/hdfc_bank_logo?e=1756944000&v=beta&t=RoXmSn8fKd4SYGMdrAyOpeIuy5mFu6NRFNwOBl8szHg',
      country: 'India',
    },
    {
      name: 'HDFC ',
      balance: 18020.75,
      image_url:
        'https://media.licdn.com/dms/image/v2/C510BAQGqZH7vVbVzWw/company-logo_200_200/company-logo_200_200/0/1630606529683/hdfc_bank_logo?e=1756944000&v=beta&t=RoXmSn8fKd4SYGMdrAyOpeIuy5mFu6NRFNwOBl8szHg',
      country: 'India',
    },
    {
      name: 'SBI ',
      balance: 50400,
      image_url:
        'https://media.licdn.com/dms/image/v2/C4D0BAQHKjQFwtVCmSg/company-logo_200_200/company-logo_200_200/0/1660627573367/state_bank_of_india_logo?e=1756944000&v=beta&t=F_jA5pDKnBTp7RqEQk4odT2kQ0o3ciooaD4bnNzur0Y',
      country: 'India',
    },
    {
      name: 'HSBC',
      balance: 2500.9,
      image_url:
        'https://media.licdn.com/dms/image/v2/D4E0BAQGF7uhTJxFBvQ/img-crop_100/img-crop_100/0/1717419425342?e=1756944000&v=beta&t=hVuOkKTkoY_puNtx-0XR9P65wEW5WkvVt1dpi6GURQs',
      country: 'South Africa',
    },
  ]

  useEffect(() => {
    trx_service.getBalanceEnquiry().then((data) => {
      setBalance(data as any)
    })

    setTimeout(() => {
      setLoader(false)
    }, 2000)
  }, [loader])

  const [barOptions] = useState<AgChartOptions>({
    title: { text: "Monthly Volume" },
    data: [
      { month: "Jan", volume: 4000 },
      { month: "Feb", volume: 3000 },
      { month: "Mar", volume: 2000 },
      { month: "Apr", volume: 2780 },
      { month: "May", volume: 1890 },
      { month: "Jun", volume: 2390 },
    ],
    series: [
      {
        //@ts-ignore
        type: "column",
        xKey: "month",
        yKey: "volume",
        yName: "Transaction Volume",
      },
    ],
  });


  const [lineOptions] = useState<AgChartOptions>({
    title: { text: "Monthly Transactions" },
    data: [
      { month: "Jan", transactions: 240 },
      { month: "Feb", transactions: 139 },
      { month: "Mar", transactions: 980 },
      { month: "Apr", transactions: 390 },
      { month: "May", transactions: 480 },
      { month: "Jun", transactions: 380 },
    ],
    series: [
      {
        type: "line",
        xKey: "month",
        yKey: "transactions",
        yName: "Transactions",
      },
    ],
  });


  // 🔝 Put this at the top of your file (before the component)
  const RECENT_TRANSACTIONS_COLUMNS = [
    { field: 'sno', headerName: 'Sno.', flex: 0.5 },
    { field: 'transactionId', headerName: 'Transaction ID', flex: 1 },
    { field: 'sentFrom', headerName: 'Sent From', flex: 1 },
    { field: 'receivedIn', headerName: 'Received In', flex: 1 },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 1,
      renderCell: (params: any) => (
        <Typography sx={{ color: 'green', fontWeight: 'bold' }}>{params.value}</Typography>
      ),
    },
    { field: 'reported', headerName: 'Reported', flex: 0.8 },
    { field: 'date', headerName: 'Date & Time', flex: 1 },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      renderCell: (params: any) => (
        <Link to={`/transaction?flow=outwards&id=${params.value}`}>
          <Typography sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
            View more
          </Typography>
        </Link>
      ),
    },
  ];

  const BankBalanceCarousel = () => {
    const scrollRef = React.useRef<HTMLDivElement>(null)

    const scroll = (offset: number) => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
      }
    }


    return (
      <Box position="relative" width="100%">
        {/* Scroll Buttons */}

        <IconButton
          onClick={() => scroll(-300)}
          sx={{
            position: 'absolute',
            top: '30%',
            left: 0,
            zIndex: 1,
            backgroundColor: 'transparent',
          }}
        >
          <ArrowLeftIcon sx={{ color: 'black' }} />
        </IconButton>
        <IconButton
          onClick={() => scroll(300)}
          sx={{
            position: 'absolute',
            top: '30%',
            right: 0,
            zIndex: 1,
            // backgroundColor: 'primary.light',
          }}
        >
          <ArrowRightIcon sx={{ color: 'black' }} />
        </IconButton>

        <Box>
          {bankAccounts.map((bank, index) => (
            <Box
              key={index}
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

  const handleToggle = (id: string, newStatus: boolean) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, activeStatus: newStatus } : card
      )
    );
    static_service.paymentGatewayStatus(id, newStatus).catch(() => {
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === id ? { ...card, activeStatus: !newStatus } : card
        )
      );
    });
  };


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
          p: 1.2,
          height: '104%',
          borderRadius: 3,
          boxShadow: 3,
          opacity: status ? 1 : 0.5, // dim when disabled
          pointerEvents: status ? 'auto' : 'auto', // disable interactions
          border: '1px solid',
          borderColor: 'primary.light',
        }}
      >
        <CardMedia component="img" image={image_url} alt={title} sx={{ width: '10vw', height: '3vh', borderRadius: 2 }} />
        <CardContent sx={{ ml: 2, flexGrow: 1 }}>
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

    const handleToggle = () => {
      setEnabled((prev) => !prev)
    }

    return (
      <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1.2,
          borderRadius: 3,
          height: '90%',
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

  //@ts-ignore
  const BankCards: React.FC<BankCardsProps> = ({ image_url, title }) => {
    return (
      <Card
        sx={{
          border: '1px solid',
          borderColor: 'primary.light',
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <CardMedia
          component="img"
          image={image_url}
          alt={title}
          sx={{ height: 70, objectFit: 'contain', mt: 1 }}
        />
        <CardContent sx={{ p: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            {title}
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
            // backgroundColor: 'primary.light',
          }}
        >
          <ArrowLeftIcon sx={{ color: 'black' }} />
        </IconButton>
        <IconButton
          onClick={() => scroll(300)}
          sx={{
            position: 'absolute',
            top: '30%',
            right: 0,
            zIndex: 1,
          }}
        >
          <ArrowRightIcon sx={{ color: 'black' }} />
        </IconButton>
        {/* Carousel Container */}
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            padding: '1%',
            gap: 2,
            paddingTop: '0.3%',
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
  return (
    <Box sx={{ width: '85vw', overflowX: 'hidden', height: '85vh' }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ mt: 0, mb: 1 }}
      >
        <b>Dashboard </b>
      </Typography>

      <Grid container spacing={2}>
        {/* LEFT SIDE (Balances + Consumers + Volume + Recent Transactions) */}
        <Grid item xs={12} md={9}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              {/* Available Balances */}
              <Card sx={{ border: '2px solid', borderColor: '#79CBF0', mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={800} gutterBottom>
                    Available Balances
                  </Typography>

                  <Grid container spacing={2}>
                    {bankAccounts.map((bank, index) => {
                      const colors = ['green', 'red', 'goldenrod']; // cycle
                      const borderColor = colors[index % colors.length];
                      const isActive = bank.name.toLowerCase().includes("icici");

                      return (
                        <Grid item xs={6} key={index} sx={{ px: 1 }}>
                          <Box
                            sx={{
                              border: `3px solid ${borderColor}`,
                              borderRadius: 2,
                              p: 2,
                              mb: 0,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              opacity: isActive ? 1 : 0.5,
                              pointerEvents: isActive ? "auto" : "none",
                            }}
                          >
                            {/* Left side: Country + Bank */}
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                sx={{ color: 'primary.main' }}
                              >
                                {bank.country}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {bank.name}
                              </Typography>
                            </Box>
                            {/* Right side: Balance */}
                            <Typography fontWeight="bold" variant="body1">
                              {bank.balance.toLocaleString('en-IN')}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>

              {/* Consumers */}
              <Card sx={{ border: '2px solid', borderColor: '#79CBF0' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Consumers
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ background: 'linear-gradient(to bottom,#FFEB99,rgb(172, 169, 65))', borderRadius: 2, p: 2, textAlign: 'center', color: 'black' }}>
                        <Typography variant="h6" fontWeight={700}>
                          {consumersData?.signup ?? 0}
                        </Typography>
                        <Typography variant="body2">users</Typography>
                        <Typography variant="caption" fontWeight="bold">Sign-ups</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ background: 'linear-gradient(to bottom, #64B5F6,rgb(21, 103, 171))', borderRadius: 2, p: 2, textAlign: 'center', color: 'black' }}>
                        <Typography variant="h6" fontWeight={700}>
                          {consumersData?.kycVerified ?? 0}
                        </Typography>
                        <Typography variant="body2">users</Typography>
                        <Typography variant="caption" fontWeight="bold">KYC Verified</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ background: 'linear-gradient(to bottom, #81C784,rgb(40, 124, 44))', borderRadius: 2, p: 2, textAlign: 'center', color: 'black' }}>
                        <Typography variant="h6" fontWeight={700}>
                          {consumersData?.active ?? 0}
                        </Typography>
                        <Typography variant="body2">users</Typography>
                        <Typography variant="caption" fontWeight="bold">Active</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

            </Grid>

            {/* Volume */}
            <Grid item xs={12} md={7}>
              <Card sx={{ border: '2px solid', borderColor: '#79CBF0', height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Volume
                  </Typography>
                  <TransactionPanel />
                </CardContent>
              </Card>
            </Grid>

          </Grid>


          {/* Recent Transactions */}

          <Grid item xs={12} md={12}>
            <Box sx={{ mt: 0, mb: 1, marginTop: '20px' }}>
              <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                Recent Transactions
              </Typography>

              <Box sx={{ height: 400, width: '100%' }}>
                {isLoading ? (
                  <>
                    <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
                  </>
                ) : recentTransaction?.length === 0 ? (
                  <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                    No data found
                  </Typography>
                ) : (
                  <DataGrid
                    rows={recentTransaction.map((transaction: any, index: number) => ({
                      id: index + 1,
                      sno: index + 1,
                      transactionId: transaction?.transactionOutward?.transactionNumber,
                      sentFrom: `${transaction?.transactionOutward?.sendCountry} | ${transaction?.transactionOutward?.settlementCurrency}`,
                      receivedIn: `${transaction?.transactionOutward?.receiveCountry} | ${transaction?.transactionOutward?.principalCurrency}`,
                      amount: `${transaction?.transactionOutward?.settlementAmount} ${transaction?.transactionOutward?.settlementCurrency}`,
                      reported:
                        transaction?.transactionOutward?.reportingStatus === 'Completed'
                          ? 'Yes'
                          : transaction?.transactionOutward?.reportingStatus,
                      date: helper.convertDateAndTime(transaction?.transactionOutward?.owCreatedDate),
                      action: transaction?.transactionOutward?.transactionNumber,
                      status: transaction?.transactionOutward?.reportingStatus,
                    }))}
                    columns={RECENT_TRANSACTIONS_COLUMNS}
                    pageSizeOptions={[5, 10]}
                    disableRowSelectionOnClick
                    sx={{
                      '& .MuiDataGrid-cell': { borderBottom: '1px solid #e0e0e0' },
                      '& .MuiDataGrid-columnHeaders': { fontWeight: 'bold', borderBottom: '2px solid #1976d2' },
                    }}
                    getRowClassName={(params) =>
                      params.row.status === 'Error' ? 'error-row' : ''
                    }
                  />)}
              </Box>
            </Box>
          </Grid>
        </Grid>


        {/* RIGHT SIDE (Active Channels + Integrations) */}
        <Grid item xs={12} md={3}>
          {/* Active Channels */}
          <Grid item xs={12} md={12}>
            {/* Active Channels */}
            <Box sx={{ mt: 0, mb: 1 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Active Channels
              </Typography>

              {/* IND → ZA */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1,
                  mb: 1,
                  border: "1px solid #79CBF0",
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                {/* Left */}
                <Box sx={{ width: "90px" }}>
                  <Typography fontWeight={600}>IND (INR)</Typography>
                  <Typography variant="caption">India</Typography>
                </Box>

                {/* Middle (Arrows) */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "40px" }}>
                  <ArrowBackIcon sx={{ color: "green" }} />
                  <ArrowForwardIcon sx={{ color: "green" }} />
                </Box>

                {/* Right */}
                <Box sx={{ width: "110px", textAlign: "right" }}>
                  <Typography fontWeight={600}>ZA (ZAR)</Typography>
                  <Typography variant="caption">South Africa</Typography>
                </Box>
              </Box>

              {/* IND → UK */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1,
                  mb: 1,
                  border: "1px dashed grey",
                  borderRadius: 2,
                  boxShadow: 1,
                  opacity: 0.5,

                }}
              >
                <Box sx={{ width: "90px" }}>
                  <Typography fontWeight={600}>IND (INR)</Typography>
                  <Typography variant="caption">India</Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "40px" }}>
                  <ArrowBackIcon sx={{ color: "red" }} />
                  <ArrowForwardIcon sx={{ color: "red" }} />
                </Box>

                <Box sx={{ width: "110px", textAlign: "right" }}>
                  <Typography fontWeight={600}>UK (GBP)</Typography>
                  <Typography variant="caption">United Kingdom</Typography>
                </Box>
              </Box>

              {/* ZA → UK (Disabled) */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1,
                  mb: 1,
                  border: "1px dashed grey",
                  borderRadius: 2,
                  opacity: 0.5,
                }}
              >
                <Box sx={{ width: "90px" }}>
                  <Typography fontWeight={600}>ZA (ZAR)</Typography>
                  <Typography variant="caption">South Africa</Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "40px" }}>
                  <ArrowBackIcon sx={{ color: "grey" }} />
                  <ArrowForwardIcon sx={{ color: "grey" }} />
                </Box>

                <Box sx={{ width: "110px", textAlign: "right" }}>
                  <Typography fontWeight={600}>UK (GBP)</Typography>
                  <Typography variant="caption">United Kingdom</Typography>
                </Box>
              </Box>

              {/* NIG → ZA (Disabled) */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1,
                  mb: 1,
                  border: "1px dashed grey",
                  borderRadius: 2,
                  opacity: 0.5,
                }}
              >
                <Box sx={{ width: "90px" }}>
                  <Typography fontWeight={600}>NIG (KLS)</Typography>
                  <Typography variant="caption">Nigeria</Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "40px" }}>
                  <ArrowBackIcon sx={{ color: "grey" }} />
                  <ArrowForwardIcon sx={{ color: "grey" }} />
                </Box>

                <Box sx={{ width: "110px", textAlign: "right" }}>
                  <Typography fontWeight={600}>ZA (ZAR)</Typography>
                  <Typography variant="caption">South Africa</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>



          {/* Active Integrations */}
          <Box sx={{ p: 2 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Active Integrations
            </Typography>

            {/* KYC Section */}
            <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>KYC</Typography>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Box sx={{ border: '1px solid green', borderRadius: 2, p: 1, display: 'flex', justifyContent: 'center' }}>
                  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJ8AAACUCAMAAAC6AgsRAAAA51BMVEX///8AK2////4CKm////z///oALG3l7fA/SIAAAGHS1uEAAF/8//8AAEsAKmcAKnEnNXPe3eCyvdDHz9PL1t7I1dkAJHLu8fQAIWcAAFUAF2FVYY9gYYRebZQAEGaEkqqrssKzvMkAHmkAEFkAAFAVNWkAFWcAG2oAKHMZLWuapbcAC1oAB2MAHl4AF1xgYYpxf5pGWIIySngjP27AxtFQVXk7RXQtO3JETndXX3zX5OkAKmGOmat8g5ZXa4w9T3NrdYoxOmUIGk8XK1kAAEEpMGIAADsAADSlp61cZHk+QmcAAG64wMNlrKfcAAANvUlEQVR4nO1ca3uayhaGYRhqnDC1srm1ohADBC/FxGokxiRn7+7Tc07//+85awbv12w1MR98+8QaFHxZs+6zjCSdccYZZ5xxxhlnnLEAdLIPRgirGGEsSRQh/mt+EA5jzH/nb8IU4RMxBBaYswACqoRVSq05UIoFSwo4DT3ghVVVBeFpRtdPqumoc3t7LXB3+7WSVpNaN7PEfbw3Mzx91Izk+UevH0RhGAW2bccAExAEQRi6Sv9+UPU1mr8ZvRtTWDIkWRe/q3eXdS+IGYsVohNCZJkRXYDI/Bg8mGHh8uHZL1mgAe9mK1ii5er3z8XQloGXLMs6YXEcNYtOvV53LutOMzRNxhQAvEQU17v5PsyopL61/Lg1SJLVTRvFyIwZyAt+iKzYrt77liZdQwPTAHVM0kHv4cpW4EUQIgH2ZlTs14AiaO3Yso8NMEfK1cgY3hdDBtKR+fqBdFjk3Fa7JTq+g/zDaVYedpwQuMkKvweQpFLUHw2hg2+zzJgba3mkR6aSgy+sLofKqLvsQsDhwAPNqn3PloUGAAiogP3UpW+1yli1/IETwMfN+DGz/WxI3MksEYR/woiSp4KpyBMQEjird3MMbvyhPGgHipwTyz9NDq+7XO3XSARxv4w4w3ZIxC3x98NPZI8yOAUc+DEJqmrpqxOxqeA4GHOfLS687bBS1yTzdxVcDi3w7cfkp+LkxgU9X+AXO4+gTDuUHWI0rd3Ys7N0sKqrHxfHdDZYyu49uO4SP7e6OyKAOwHZa52Qjc8Caya6YroJPZoVY8m/tsncEuUfFIys150PCYSV2mSmufweG4+Q2RwltUE0acDV5QV+8Hs7w+qrrk9VMIeOvcBPZt7IOoYOAoNqMV5cWIHmcHF156iiPM5MDoM3zEbBovwg8Hh9C+80rp1QpaTAFoiN1UjJFt4HayXyU572UbCJ8dIJTy2V+xFbugA4G2+gIXSgm1HR0FllB/yidMnN8lza0kolzVpIVEAHrGqdMEVZ5kdI8/5wCV7Y8Tp+cpis3Ik1HNz2+73vaZLxX8f8pKzSZLKyjl/cfDxQfNi6jpevnMP0F9+J1OzlyoSkRrGDqNFLLJ5QcEn6bgjWsIafrBAGd3kAQfCtw5CsYwcL3F26EylpihQ1t87iLY8RELIfG/GyZU0vocimbuxPD1x86SYma68t24vyAztIvCk/RY6j8L6LpOzOVdhmfpCbDQ7gB66lqevLlpcvj11bfCeWtEFB0ScfDVmpWRzWWqZMyKryTQkS5vnSAQlrK96wvKQ1XHmzlhajcZKiiE+Himk9sdll9HhgYbSvDhrOWuEBYruzJrplo88NqN7Y5KY2CW4mQZ05vrQnPyQNvY1Xjhsrmg0+WS0lt/WIxdtZLfCLRvuvbxpsvDKLOsuFBHwM7xhkaS8KY57V7xAeB2jCJd3bR3/bqD+wck1/fXjHkuWnN4WIkQ26uwRnfxezlZ/9kq09iYdcVUvu29HrltlbtbTXYmBu4Se7PW3dSbzw4JGj/NhvgqWQHTYCkXzvgvMx2sJPYW5H21J+8PqSV8D6DjM293fR3eLGuxafGbhbikXefqOPN97G+JaDmN/2pYeou0mFRL0ox2Y4FATXeAje+wNbMb46kD5u4xfvzQ+jpLmaOC/IkEUPXIRb0iSa2LG8XLzMA/RvX6gWlA0br53X3LEz6m5pQoKllH9GW/gp4d72C47z4l+boxQch4xFlyNl4G9Vw/KLvUV+zh/7hl8K//w2bzRuyo9k3jtTiFm/S0qSaEJTdcWioTx62MAObjBu7W5BbAGqNUx5m4sQ+kl05+W5K7is1t2wDF+K8dpoAjHGq0qHlMEqvvgZbctExgYUx0HRrZbompobZIqrnryOH1z0oXRIDcfLxSwtQnHNtkZTRdQ7BVKpWaLbRRdoQnFyw2voldOIHKR8J2JvfpJIUmr9SNmQ5y9IkrEo/LOqoXzvY+EaabjOTxH5Zm2M/GdQJa3a8uSd+Qi3F0VvPADD5c4HMuprdaSeHKPbizEtpVftXQmdcDigimHfXy4bVctdrTGhih5Zh7c4OOAmtWqvGRBOQNkcVPhhYOgsiQVh2glWTmF2TzsOPUlECM3vXBZMtosf/6+1qFZQYaTR8ikkuswk9YjdaE4xGdx5UaxscjjjwyT6vXzuY7jcQLQ/G5CBH2t7c9JNpEYtfXCaAW9qkZjJJK8oJ0smSBDFWcytEcJz8sufBFcGT7XfYPsV04tk0L+JvNDMmwPgWUjePMj7mG5rqXsEydatOc+PkOjWOKT3sg0ixGpGbZh2rhvFZhjYPAjzPgGLo7DpXKfGck2GNUdZkF/jq/ZW9MbXhXWhYrOtOnq6bjU4rlz9KU0MDW5goZ0KD0kh56eIZqftpdo77wvz7fP1r/D4pfXHaT5fWtnlDvJonmU3eDgTP2g5sAmAGQxdc+yfSWw6afae7ATGcwYri8bZqlLXiXl05vzi8Kks8cGA1zX/j0NutrG6tFMIIqUIZy2TQYrPN4yda8hwBLV3H0tYC6RCBtmD/F5+IEpg/0ys1QT7lADdM24i8NiMNYuVmgh7JxvZmYeYjJF4fUlaJFYC7zIt8+0Eit5/4GQtsIphbY0nRzEb7d6z/8rduveCiNdZqhQKf91WyxkVO12nJjUDhJZS7enn/SDpWlD/YOF5TrWwll+rZfPCoVbJMHyfi00apyiTn1NA++Q6Plr2Gx/DDDi0T6Tgr3hmjBY68ydUPu2TXviy1KYQG67zwVjFVKLvGNTmsI7fKrp15+/Su/BZxmv4IdVwlcvSSQT4OvkZ9ea/SydRw1fJD2u/ar+0txle24FXyY976b13AjcBLTeX+Hju9NlEFq/iBxfCs1Gt/Fx+tYMEykdgc79GNxCe8PNXjo5ZTd4OV8J4Ms2L+GQyHEEHptH87tT5ORy8wA9N+BHnNxI7CktAnNX4KSc0O5cPUkro0PIcmGVGNvexaxUI+BW7616YI7r4hC+vlRkluhIV/xlo7abddtuVbKJdtDKqlMV+h1EZpSWUjxl/0s1OOkqrhjYlwgsmmvG56JHG8xeaVCqVkTZ+GWGj03a9Rj+hB4hQ1SoOnxpW3IfuhJ/TbtZEE7x82VYu8IQfs4PIdeu9L1MJ86mmejEMIycTdjsqBNHfJfEqn7m74iNnhDiptTc/LKUNXQ5tO5BjebxLS5sk8IX8ykX588VUfnzuJYiZ6U47L1i7D2NGWnbOj448wiB+SKKhb7gxMW0lMtnV857sYA2yOjP7idGtuHL0lKsO9XJ+SCoXyBy/uJNWKrcNPXa6ue9Q6SgkrE2+Vp7z9R1+1VldxDfgd22ToONfDK9NdnmxL0EpaZoPXdAP7TkidU0oCg0Vm/PDwE+Z41eoUcvSkobijvIZYpy1Zb0wMqZtD2q0lbH8sFaXoxGv5WoBC/ff/x3Z0TO/Xaz140JuoPP82Iwf5H9IRYimkf4XzT14UiRhZW54VjXacs4PS38UmN7l3kX6ER+w//tNCavgYhCmfbP4ZQc/iXvbWvRQt/JvA1RDOb7g453jdhc2wrH+qcAv/lzmc3jSKDiA33cT+Amt+0/nHhaa76ResWANPxHfYP1rgVy0cpFVPfurhad7wwgZ7lh+kvRHkd1wg6NSJdh/fxr4eUPRaeKpLxXB6Z/zG2MTP/sgfuFQEEDALh8l/mD8zHvehhVtPUpfwy8izngocjs/5Rj8fphKMLAWGia7+JnAj+9uoXX8lBk/+aZ8MD9U+tmSwztNGMYx+MlH5icZfZtEA20uQn4kfoCLl4AEdxaaZnYfjJ+U3YfEe8qkSdfzg/HDUtYL5OhWQ8fgd2T7EJeVtB7kGtcZPgK/N1hfSehgHDxp+IPyw9h6CZh5Zb0qfpxAfqCDAzsufhGlKm0zPvr8YfQvh/YiF/Ksnrbj1hfRqv0w8uNG8l/Zm/Kzax9rfTl6djPnJ7XiYPhB+GFL0yws0paeMl5faRCZPyze81jDD0N+pTtW/h3Gt+dHH+97w7ww/6QAAZHHJAW9UeOs9uB3bPsYhP+rCn70hRXH/LQ/FbnIpx828CPvJz/p2Qz+I4qd0g3hda3YTxt6RHkyJLTEz+e9IJq25Dp9N36JFys+H05KAwJlWT7aZw08YrcSq7tYv/H613psy+FovBXzDvw0h8V21fcrHvEqUm4pEJAHDUaawSd7Xn5mr9O5tT0W6xcqQlN+s8TxDfQPS6nzoId2GJHgc4ZVmm97Uyt1AkV+YPPyk3XbtOGhkUgqna3vrHvG+/dk0r+f8EOC395dX5VWG1FMSNy4nR/iV6XuKGja8YzfS7EJ8IpXne60f1V1ih1rvnNh1L3x/gcy/ipclcXTjlMY7NvfoGCR3dGVc6mnC7t/kAta5WQUTfsvlp/UBMrarJvXTRJ/fi8fa0ntVy5QlP1K8q107CfJ7737a3knRdP4N7nm1gDnY83OtL82a/nNvjYLp6rSAj+VHxAvC0LiqSj+913e/L746SqaXwMQEQQQwwH5jXtpOf2FvQ3+5yWWF27W5EXrjh4PCFNcLrK+MRaFepp9v81AVBp6U37oJLtCW8Db433Geh9s5mGMUrfbfXRsVqidmsl6VC+LBY/86d0f7zvkR8WwQHQ98p6PMFr9Jhi2r6/7ldqp/jDOLiBV/AWfo++VHgv5H/ZR6fFmg48NkUDRDzWvdMYZZ5xxxhlnnPFR8H+Kn1XlMZ9v9wAAAABJRU5ErkJggg==" alt="Sybrin" width={60} />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ border: '1px solid green', borderRadius: 2, p: 1, display: 'flex', justifyContent: 'center', height: '100%' }}>
                  <img src="data:image/png;base64,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" alt="Paysprint" width={60} />
                </Box>
              </Grid>
            </Grid>

            {/* Payment Gateway Section */}
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Payment Gateway
            </Typography>

            <Grid container spacing={1} sx={{ mb: 2 }}>
              {cards.map((card) => (
                <Grid item xs={6} key={card.id}>
                  <Box
                    sx={{
                      border: `1px solid ${card.activeStatus ? 'green' : 'red'}`,
                      borderRadius: 2,
                      p: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 120, // keeps height fixed
                    }}
                  >
                    <img src={card.imageUrl} alt={card.company} width={80} />
                    <Switch
                      checked={card.activeStatus}
                      onChange={() => handleToggle(card.id, !card.activeStatus)}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>



            {/* Banking Partners Section */}
            <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 2 }}>
              Banking Partners
            </Typography>

            <Grid container spacing={2}>
              {bankAccounts.map((bank) => (
                <Grid item xs={6} key={bank.name}>
                  <BankCards image_url={bank.image_url} title={bank.name} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box >
  )
}


export default Dashboard
