import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Box, Card, CardContent, Typography, Grid, Avatar, Stack, CardMedia, Switch, IconButton, Skeleton } from '@mui/material'
import { AttachMoney, People, TrendingUp } from '@mui/icons-material'
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import { useTheme } from '@mui/material/styles'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import { TransactionService } from '@/services/transaction.service'
import { PaymentGateway } from '@/types/static.type'
import staticdataService from '@/services/staticdata.service'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState, selectedCountryState } from '@/states/state'
import { LocalStorageService } from '@/helpers/local-storage-service'
import TransactionPanel from '@/components/transaction-panel'
import { HelperService } from '@/helpers/helper'
import { useNavigate } from 'react-router-dom'

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
  const [userCountry, setuserCounty] = useRecoilState(selectedCountryState)
  const [applicatnData, setapplicantData] = useState<
    Array<{
      applicantId: String
      applicantName: String
      numberOfTransactions: Number
    }>
  >([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [recentTransaction, setrecentTransaction] = useState<any>([])
  const [filterType, setFilterType] = useState('monthly')
  const [cards, setCards] = useState<Array<PaymentGateway>>([])
  const [dateRange, setDateRange] = useState({
    start: '2023-01-01',
    end: '2023-06-30',
  })
  const transaction_service = new TransactionService()
  const static_service = new staticdataService()
  const local_service = new LocalStorageService()
  const helper = new HelperService()
  const navigate = useNavigate()
  const [open, setOpen] = useRecoilState(alertState);
  const [text, setText] = useRecoilState(alertTextState);
  const [type, settype] = useRecoilState(alertTypeState);
  const getGatewayList = () => {
    static_service.getStaticPaymentGateway(local_service?.get_staff_country()).then((data: any) => {
      setCards(data?.data?.sort((e: any) => e.costFee))
    })
  }

  const getOutwardTransactionsList = useCallback(async () => {
    const data = await transaction_service.getOutwardTransaction()
    setrecentTransaction(data?.transactionDetailsList)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    getGatewayList()
    setIsLoading(true)
    getOutwardTransactionsList()
    transaction_service.getTransactionSummary(userCountry).then((data) => {
      setapplicantData(data?.data)
    })
  }, [])


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

    useEffect(() => {
      const interval = setInterval(() => {
        const el = scrollRef.current;
        if (el) {
          if (el.scrollLeft + el.clientWidth >= el.scrollWidth) {
            el.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            el.scrollBy({ left: 1, behavior: 'smooth' });
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }, []);


    const scroll = (offset: number) => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
      }
    }

    return (
      <Box
        position="relative"
        width="100%"
      >
        {/* Scroll Buttons */}

        {/* <IconButton
          onClick={() => scroll(-300)}
          sx={{
            position: 'absolute',
            top: '30%',
            left: 0,
            zIndex: 1,
            backgroundColor: 'transparent',
          }}
        >
          <ArrowLeftIcon 
          sx={{color:'black'}} />
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
        </IconButton> */}

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

  const handleToggle = async (id: String, status: boolean) => {
    try {
      const data = await static_service.paymentGatewayStatus(id, status)
      getGatewayList()
    } catch (error) {
      setText("Error fetching data ")
      setOpen(true)
      settype("error")
      console.log(error)
    }
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

    useEffect(() => {
      const interval = setInterval(() => {
        const el = scrollRef.current
        if (el) {
          if (el.scrollLeft + el.clientWidth >= el.scrollWidth) {
            el.scrollTo({ left: 0, behavior: 'smooth' }) // Loop back to start
          } else {
            el.scrollBy({ left: 1, behavior: 'smooth' }) // Scroll forward
          }
        }
      }, 1000) // Adjust speed (higher = slower)

      return () => clearInterval(interval)
    }, [])

    const scroll = (offset: number) => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
      }
    }

    return (
      <Box position="relative" width="100%" padding="0px" margin="0px">
        {/* Scroll Buttons
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
        </IconButton> */}



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
      >
        <b>Dashboard Overview</b>{' '}
        <ShowChartIcon
          sx={{
            //@ts-ignore
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
                  {isLoading ? (
                    <Skeleton variant="text" width={80} height={36} />
                  ) : (
                    <Typography variant="h4" component="div">
                      {recentTransaction.length}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} >
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
                  {isLoading ? (
                    <Skeleton variant="text" width={80} height={36} />
                  ) : (
                    <Typography variant="h4" component="div">
                      {applicatnData.length}
                    </Typography>
                  )}
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
                  {isLoading ? (
                    <Skeleton variant="text" width={80} height={36} />
                  ) : (
                    <Typography variant="h4" component="div">
                      ${dashboardData.totalProfit.toLocaleString()}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={9}>
          <HorizontalCardCarousel></HorizontalCardCarousel>
        </Grid>
      </Grid>

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
                  backgroundColor: 'pimary.main', // kept your original typo as per request
                }}
              >
                <b> Recent Transactions</b>
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {isLoading ? (
                  <>
                    <Skeleton variant="rectangular" height={50} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={50} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={50} sx={{ mb: 2 }} />
                  </>
                ) : recentTransaction.length === 0 ? (
                  <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                    No data found
                  </Typography>
                ) : (
                  recentTransaction.map((transaction: any) => (
                    <Box key={transaction.id} sx={{ mb: 2, p: 1, borderBottom: '1px solid ', borderColor: 'primary.light' }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontWeight="bold">{`${transaction?.applicant?.firstName} ${transaction?.applicant?.lastName}`}</Typography>
                        <Typography color="text.secondary">
                          {transaction?.transactionOutward?.settlementCurrency} {transaction?.transactionOutward?.settlementAmount}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" mt={1}>
                        <Typography variant="body2" color="text.secondary">
                          {helper.convertDateAndTime(transaction?.transactionOutward?.owCreatedDate)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={
                            transaction?.transactionOutward?.reportingStatus === 'Completed'
                              ? 'success.main'
                              : transaction?.transactionOutward?.reportingStatus === 'Pending'
                                ? 'warning.main'
                                : 'error.main'
                          }
                        >
                          {transaction?.transactionOutward?.reportingStatus}
                        </Typography>
                      </Stack>
                    </Box>
                  ))
                )}
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
                {isLoading ? (
                  <>
                    <Skeleton variant="rectangular" height={50} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={50} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={50} sx={{ mb: 2 }} />
                  </>
                ) : recentTransaction.length === 0 ? (
                  <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                    No data found
                  </Typography>
                ) : (
                  applicatnData.map((customer) => (
                    <Box
                      //@ts-ignore
                      key={customer?.applicantId}
                      sx={{ mb: 2, p: 1, borderBottom: '1px solid #eee' }}
                    >
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontWeight="bold">{customer?.applicantName}</Typography>
                        <Typography color="text.secondary">{String(customer?.numberOfTransactions)} transaction</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Applicant Id:{' '}
                        <span style={{ color: '#1976d2', cursor: 'pointer' }} onClick={() => navigate(`/applicant-details/${customer?.applicantId}`)}>
                          {customer?.applicantId}
                        </span>
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TransactionPanel
        //@ts-ignore
        open={openModal}
        onClose={() => {
          setOpenModal(false)
        }}
      />
    </Box>
  )
}

export default Dashboard
