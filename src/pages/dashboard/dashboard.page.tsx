import React, { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CardMedia,
  Switch,
  Skeleton,
  Button,
  Tooltip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormControlLabel,
} from '@mui/material'
import { TransactionService } from '@/services/transaction.service'
import { PaymentGateway } from '@/types/static.type'
import staticdataService from '@/services/staticdata.service'
import { useRecoilState } from 'recoil'
import { selectedAppState, loaderState, availableBalanceState } from '@/states/state'
import { LocalStorageService } from '@/helpers/local-storage-service'
import TransactionPanel from '@/components/transaction-panel'
import { HelperService } from '@/helpers/helper'
import { useNavigate } from 'react-router-dom'
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridFilterModel } from '@mui/x-data-grid'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ApplicantService } from '@/services/applicant.service'
import CompactLocationBar from '@/components/location'
import ProductConfigService from '@/services/product.config.service'
import { renderTransactionStatus } from '@/contants/utils'
import bannerImg1 from '@/assets/Impro_Card_1.jpg'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import SequenceApiService from '@/services/sequence.api.service'

const Dashboard = () => {
  // const [applicatnData, setapplicantData] = useState<
  //   Array<{
  //     applicantId: String
  //     applicantName: String
  //     numberOfTransactions: Number
  //   }>
  // >([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [recentTransaction, setrecentTransaction] = useState<any>([])
  const [cards, setCards] = useState<Array<PaymentGateway>>([])
  const [balance, setBalance] = useRecoilState(availableBalanceState)
  const [loader, setLoader] = useRecoilState(loaderState)
  const [consumersData, setConsumersData] = useState<any>(null)
  const applicant_service = new ApplicantService()
  const transaction_service = new TransactionService()
  const static_service = new staticdataService()
  const local_service = new LocalStorageService()
  const helper = new HelperService()
  const userCountry = local_service?.get_staff_country()
  const trx_service = new TransactionService()
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<{ [key: string]: boolean }>({})
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false)
  const [refreshTime, setRefreshTime] = useState(0)

  const [filters, setFilters] = useState({
    citizenship: '',
    fromDate: null,
    toDate: null,
  })
  const [loading, setLoading] = useState(false)
  const [countryCorridors, setCountryCorridors] = useState([])
  const isFilterEmpty = !filters.citizenship && !filters.fromDate && !filters.toDate

  const [selectedApp, setSelectedApp] = useRecoilState(selectedAppState)
  const navigate = useNavigate()
  const service = new ProductConfigService()
  const seqService = new SequenceApiService()

  const getGatewayList = () => {
    static_service.getStaticPaymentGateway(userCountry).then((data: any) => {
      setCards(data?.data?.sort((e: any) => e.costFee))
    })
  }

  const fetchProductConfig = async (countryCode: string) => {
    try {
      const res = await service.getByCountryCode(countryCode)
      if (res?.status && res?.data?.length > 0) {
        alert(res.data[0])
        localStorage.setItem('countryConfig', JSON.stringify(res.data[0]))
      }
    } catch (error) {
      console.error('Error fetching product config:', error)
    }
  }

  const getOutwardTransactionsList = useCallback(async () => {
    const data = await transaction_service.getOutwardAllTransaction(userCountry, 0, 20)
    setrecentTransaction(data || [])
    setIsLoading(false)
  }, [])

  const getRecipientCountryCorridors = useCallback(async (countryCode: string) => {
    const data: any = await seqService.getActiveRecipientCountryCorridors(countryCode)
    setCountryCorridors(data || [])
    setIsLoading(false)
  }, [])

  const fetchConsumersData = async (valStr: string) => {
    try {
      // valStr = local_service?.get_staff_country();
      const { data } = await applicant_service.getConsumersData(valStr)
      console.log(data, '------------')
      setConsumersData(data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  const fetchStaticData = async () => {
    try {
      const data = await static_service.getRefreshTimeOnDashboard(userCountry)
      console.log(data, '--jgjhgjgj----------')
      setRefreshTime(data.value1)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  useEffect(() => {
    // commented out for uae corridor
    // getGatewayList()
    // fetchProductConfig('IN')

    setIsLoading(true)
    fetchStaticData()
    getOutwardTransactionsList()
    setSelectedApp('Dashboard')
    getRecipientCountryCorridors(userCountry)

    // transaction_service.getTransactionSummary(userCountry).then((data) => {
    //   setapplicantData(data?.data)
    // })
  }, [])

  const isWithinAllowedTime = () => {
    const now = new Date()
    const hour = now.getHours()

    return hour >= 8 && hour < 20
  }

  useEffect(() => {
    // Switch OFF → don't create interval
    if (!isAutoRefreshEnabled) {
      return
    }

    const callApi = async () => {
      // Only between 8 AM and 8 PM
      if (!isWithinAllowedTime()) {
        return
      }

      try {
        await fetchConsumersData('')
      } catch (error) {
        console.error('API error:', error)
      }
    }

    // Optional initial call
    callApi()

    // Create interval only when switch is ON
    const intervalId = setInterval(callApi, refreshTime * 60 * 1000)

    // Switch OFF / component unmount → clear interval
    return () => {
      clearInterval(intervalId)
    }
  }, [isAutoRefreshEnabled])

  const bankAccounts = [
    {
      name: 'ICICI',
      balance,
      image_url: 'https://pbs.twimg.com/profile_images/1477924435969462272/ZQADGPv5_400x400.png  ',
      country: 'In',
    },
    {
      name: 'SB',
      balance: 'No Data',
      image_url:
        'https://media.licdn.com/dms/image/v2/C4D0BAQEMo-EgURgpnA/company-logo_200_200/company-logo_200_200/0/1630561374295/standard_bank_group_logo?e=1763596800&v=beta&t=SA9TooJjIAO9AO3sO0Y_bMebCjTauJ4XnBz2gI8JTtI',
      country: 'In',
    },

    {
      name: 'SA',
      balance: 'No Data',
      image_url:
        'https://media.licdn.com/dms/image/v2/C4D0BAQEMo-EgURgpnA/company-logo_200_200/company-logo_200_200/0/1630561374295/standard_bank_group_logo?e=1763596800&v=beta&t=SA9TooJjIAO9AO3sO0Y_bMebCjTauJ4XnBz2gI8JTtI',
      country: 'SA',
    },
    {
      name: 'Standard Bank',
      balance: 'No Data',
      image_url:
        'https://media.licdn.com/dms/image/v2/C4D0BAQEMo-EgURgpnA/company-logo_200_200/company-logo_200_200/0/1630561374295/standard_bank_group_logo?e=1763596800&v=beta&t=SA9TooJjIAO9AO3sO0Y_bMebCjTauJ4XnBz2gI8JTtI',
      country: 'NG',
    },
    {
      name: 'Tatum Bank',
      balance: 'No Data',
      image_url:
        'https://media.licdn.com/dms/image/v2/C4D0BAQEMo-EgURgpnA/company-logo_200_200/company-logo_200_200/0/1630561374295/standard_bank_group_logo?e=1763596800&v=beta&t=SA9TooJjIAO9AO3sO0Y_bMebCjTauJ4XnBz2gI8JTtI',
      country: 'NG',
    },
  ]

  useEffect(() => {
    if (userCountry !== 'UAE') {
      trx_service.getBalanceEnquiry().then((data) => {
        setBalance(data as any)
      })
    }

    setTimeout(() => {
      setLoader(false)
    }, 2000)
  }, [loader])

  const reformatCountryCurrencyValue = (value: any) =>
    value
      .split('|')
      .map((part: any) => part.trim().replace(/\s*\(.*?\)/, ''))
      .join(' | ')

  const handleNavigation = (url: string) => {
    navigate(url)
  }

  // 🔝 Put this at the top of your file (before the component)
  const RECENT_TRANSACTIONS_COLUMNS = [
    { field: 'sno', headerName: 'Sno.', width: 100 },
    {
      field: 'transactionId',
      headerName: 'Transaction ID',
      width: 250,
      renderCell: (params: any) => (
        <span
          onClick={() => handleNavigation(`/transaction-detail/${params.value}`)}
          style={{
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {params?.value}
        </span>
      ),
    },
    {
      field: 'platformTransactionReferenceId',
      headerName: 'Lulu Transaction Id',
      width: 200,
    },
    {
      field: 'sentFrom',
      headerName: 'Sent From',
      width: 150,
      renderCell: (params: any) => {
        return (
          <Tooltip title={params?.value} placement="top">
            <Box
              component="span"
              sx={{
                cursor: 'pointer',
                color: 'text.primary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {reformatCountryCurrencyValue(params?.value)}
            </Box>
          </Tooltip>
        )
      },
      // renderCell: (params: any) => (params.value ? reformatCountryCurrencyValue(params.value) : '')
    },
    {
      field: 'receivedIn',
      headerName: 'Received In',
      width: 150,
      renderCell: (params: any) => {
        return (
          <Tooltip title={params?.value} placement="top">
            <Box
              component="span"
              sx={{
                cursor: 'pointer',
                color: 'text.primary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {reformatCountryCurrencyValue(params?.value)}
            </Box>
          </Tooltip>
        )
      },
    },
    {
      field: 'amount',
      headerName: `Sender's Amount`,
      width: 200,
      renderCell: (params: any) => {
        return (
          <Tooltip title={params?.value} placement="top">
            <Box
              component="span"
              sx={{
                cursor: 'pointer',
                fontWeight: 'bold',
                color: 'green',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {params?.value?.replace(/\s*\(.*?\)/, '')}
            </Box>
          </Tooltip>
        )
      },
    },

    {
      field: 'principalAmount',
      headerName: `Receiver's Amount`,
      width: 200,
      renderCell: (params: any) => {
        return (
          <Tooltip title={params?.value} placement="top">
            <Box
              component="span"
              sx={{
                cursor: 'pointer',
                fontWeight: 'bold',
                color: 'green',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {params?.value?.replace(/\s*\(.*?\)/, '')}
            </Box>
          </Tooltip>
        )
      },
    },

    { field: 'reported', headerName: 'Reported', width: 100 },
    { field: 'date', headerName: 'Date & Time', width: 180 },
    { field: 'transactionStatus', headerName: 'Transaction Status', width: 200 },
  ]

  const filteredRecentTransColumns =
    userCountry === 'UAE' ? RECENT_TRANSACTIONS_COLUMNS.filter((col) => col.field !== 'reported') : RECENT_TRANSACTIONS_COLUMNS

  // ✅ Custom Toolbar (same as ApplicantDataGrid)
  const handleExportCSV = () => {
    if (!recentTransaction || recentTransaction.length === 0) return

    // Get all column definitions
    // const visibleCols = RECENT_TRANSACTIONS_COLUMNS.filter((col) => columnVisibilityModel[col.field] !== false)
    const visibleCols = filteredRecentTransColumns.filter((col) => columnVisibilityModel[col.field] !== false && col.field !== 'action')

    const headers = visibleCols.map((col) => col.headerName).join(',')

    const rows = recentTransaction.map((transaction: any, index: number) => {
      const rowData: Record<string, any> = {
        sno: index + 1,
        transactionId: transaction?.transactionOutward?.transactionNumber,
        platformTransactionReferenceId: transaction?.transactionOutward?.platformTransactionReferenceId,
        sentFrom: `${transaction?.transactionOutward?.sendCountry} | ${transaction?.transactionOutward?.settlementCurrency}`,
        receivedIn: `${transaction?.transactionOutward?.receiveCountry} | ${transaction?.transactionOutward?.principalCurrency}`,
        amount: `${transaction?.transactionOutward?.settlementAmount} ${transaction?.transactionOutward?.settlementCurrency}`,
        principalAmount: `${transaction?.transactionOutward?.principalAmount} ${transaction?.transactionOutward?.principalCurrency}`,

        //  reported: transaction?.transactionOutward?.reportingStatus === 'Completed' ? 'Yes' : transaction?.transactionOutward?.reportingStatus,
        date: helper.convertDateAndTime(transaction?.transactionOutward?.createdLocaldatetime),
        status: transaction?.transactionOutward?.reportingStatus,
        transactionStatus: renderTransactionStatus(transaction?.transactionOutward?.transactionStatus),
      }

      return visibleCols.map((col) => rowData[col.field]).join(',')
    })

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'Recent_Transactions.csv')
    link.click()
  }

  const handleExportPDF = () => {
    if (!recentTransaction || recentTransaction.length === 0) return

    // const visibleCols = RECENT_TRANSACTIONS_COLUMNS.filter((col) => columnVisibilityModel[col.field] !== false )
    const visibleCols = filteredRecentTransColumns.filter((col) => columnVisibilityModel[col.field] !== false && col.field !== 'action')

    const headers = visibleCols.map((col) => col.headerName)
    const data = recentTransaction.map((transaction: any, index: number) => {
      const rowData: Record<string, any> = {
        sno: index + 1,
        transactionId: transaction?.transactionOutward?.transactionNumber,
        platformTransactionReferenceId: transaction?.transactionOutward?.platformTransactionReferenceId,

        sentFrom: `${transaction?.transactionOutward?.sendCountry} | ${transaction?.transactionOutward?.settlementCurrency}`,
        receivedIn: `${transaction?.transactionOutward?.receiveCountry} | ${transaction?.transactionOutward?.principalCurrency}`,
        amount: `${transaction?.transactionOutward?.settlementAmount} ${transaction?.transactionOutward?.settlementCurrency}`,
        principalAmount: `${transaction?.transactionOutward?.principalAmount} ${transaction?.transactionOutward?.principalCurrency}`,

        //  reported: transaction?.transactionOutward?.reportingStatus === 'Completed' ? 'Yes' : transaction?.transactionOutward?.reportingStatus,
        date: helper.convertDateAndTime(transaction?.transactionOutward?.createdLocaldatetime),
        status: transaction?.transactionOutward?.reportingStatus,
        transactionStatus: renderTransactionStatus(transaction?.transactionOutward?.transactionStatus),
      }

      return visibleCols.map((col) => rowData[col.field])
    })

    const doc = new jsPDF({ unit: 'pt' })
    doc.setFontSize(14)
    doc.text('Recent Transactions Report', 40, 40)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 56)

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 72,
      margin: { left: 40, right: 40 },
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [0, 80, 153], textColor: 255 },
      didDrawPage: () => {
        //@ts-ignore
        const pageCount = doc.internal.getNumberOfPages()
        const pageSize = doc.internal.pageSize
        const w = pageSize.width
        const h = pageSize.height
        doc.text(`Page ${pageCount}`, w - 60, h - 20)
      },
    })

    doc.save(`Recent_Transactions_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ justifyContent: 'flex-start', gap: 1, py: 1 }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />

      <Button variant="outlined" color="primary" size="small" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
        CSV
      </Button>

      <Button variant="outlined" color="primary" size="small" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF}>
        PDF
      </Button>

      <Button variant="outlined" color="primary" size="small" startIcon={<FindReplaceIcon />} onClick={() => setFilterModel({ items: [] })}>
        Reset Filters
      </Button>
    </GridToolbarContainer>
  )

  const handleToggle = (id: string, newStatus: boolean) => {
    setCards((prevCards) => prevCards.map((card) => (card.id === id ? { ...card, activeStatus: newStatus } : card)))
    static_service.paymentGatewayStatus(id, newStatus).catch(() => {
      setCards((prevCards) => prevCards.map((card) => (card.id === id ? { ...card, activeStatus: !newStatus } : card)))
    })
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
      <Box sx={{ p: 1 }}>
        <Card
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1.2,
            height: '90%',
            borderRadius: 3,
            boxShadow: 3,
            opacity: status ? 1 : 0.5, // dim when disabled
            pointerEvents: status ? 'auto' : 'auto', // disable interactions
            border: '1px solid',
            borderColor: 'primary.light',
          }}
        >
          <CardMedia component="img" image={image_url} alt={title} sx={{ width: 'auto', height: '3vh', borderRadius: 2 }} />
          <CardContent sx={{ ml: 2, flexGrow: 1 }}>
            <Switch
              checked={status}
              value={status}
              onChange={() => {
                handleToggle(id, !status)
              }}
            />
          </CardContent>
        </Card>
      </Box>
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
                scrollSnapAlign: 'start',
              }}
            >
              <HorizontalCard
                id={card?.id}
                title={card?.company}
                description=""
                status={card?.activeStatus}
                image_url={card?.imageUrl
                  ?.replace('http://164.90.252.179/', 'https://api.impronics.com/uat/')
                  .replace('http://64.227.139.142/', 'https://api.impronics.com/')}
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

  const userAnalytics = [
    {
      background: 'linear-gradient(to bottom,#FFEB99,rgb(172, 169, 65))',
      hidden: false,
      subLabel: 'Sign-ups',
      count: consumersData?.signup ?? 0,
      label: 'Users',
    },
    {
      background: 'linear-gradient(to bottom, #64B5F6,rgb(21, 103, 171))',
      subLabel: 'Verified',
      count: consumersData?.kycVerified ?? 0,
      label: 'Users',
      // hidden: userCountry === 'UAE',
    },
    {
      background: 'linear-gradient(to bottom, #81C784,rgb(40, 124, 44))',
      subLabel: 'Active',
      count: consumersData?.active ?? 0,
      label: 'Users',
      hidden: false,
    },
    {
      background: 'linear-gradient(to bottom, #FEF3C7, #D97706)',
      hidden: false,
      subLabel: `Total Amount (${consumersData?.totalTransactionAmount})`,
      count: consumersData?.totalTransactions ?? 0,
      label: 'Total Transactions',
    },
  ]
  const visibleAnalytics = userAnalytics.filter((p) => !p.hidden)

  const handleFilterValueChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSearch = async () => {
    const payload = {
      ...filters,
      fromDate: filters.fromDate ? `${dayjs(filters.fromDate).format('YYYY-MM-DD')}T00:00:00` : '',
      toDate: filters.toDate ? `${dayjs(filters.toDate).format('YYYY-MM-DD')}T00:00:00` : '',
      country: userCountry,
    }
    const queryString = new URLSearchParams(Object.fromEntries(Object.entries(payload).filter(([_, v]) => v))).toString()
    try {
      setLoading(true)
      await fetchConsumersData(queryString)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setFilters({
      citizenship: '',
      fromDate: null,
      toDate: null,
    })
    fetchConsumersData('')
  }

  const handleAutoRefreshChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsAutoRefreshEnabled(event.target.checked)
  }

  return (
    <Box sx={{ width: '90vw', overflowX: 'hidden', height: '85vh' }}>
      <Typography variant="h4" gutterBottom sx={{ mt: 0, mb: 1 }}>
        <b>Dashboard</b>
      </Typography>
      <CompactLocationBar />
      <Grid container spacing={2}>
        {/* LEFT SIDE (Balances + Consumers + Volume + Recent Transactions) */}
        <Grid item xs={12} md={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              {/* Available Balances */}

              {userCountry !== 'UAE' && (
                <Card sx={{ border: '2px solid', borderColor: '#79CBF0', mb: 2, p: 1 }}>
                  <CardContent sx={{}}>
                    <Grid container spacing={2}>
                      <HorizontalCardCarousel />

                      {bankAccounts
                        .filter((e) => e.country == userCountry)
                        .map((bank, index) => {
                          const colors = ['green', 'red', 'goldenrod'] // cycle
                          const borderColor = colors[index % colors.length]
                          const isActive = bank.name.toLowerCase().includes('icici')

                          return (
                            <Grid item xs={6} key={index}>
                              <Box
                                sx={{
                                  border: `3px solid ${borderColor}`,
                                  borderRadius: 2,
                                  p: 2,
                                  mb: 0,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  flexDirection: 'column',
                                  // alignItems: 'center',
                                  opacity: isActive ? 1 : 0.5,
                                  pointerEvents: isActive ? 'auto' : 'none',
                                }}
                              >
                                {/* Left side: Country + Bank */}
                                <Box
                                  sx={{
                                    minWidth: '40%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    flexDirection: 'row',
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">
                                    <strong> {bank.name}</strong>
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold" sx={{ color: 'primary.main' }}>
                                    {bank.country}
                                  </Typography>
                                </Box>

                                <Box>
                                  <Typography fontWeight="bold" variant="body1" sx={{ textAlign: 'center', mt: 1 }}>
                                    {
                                      //@ts-ignore
                                      bank.balance.toLocaleString('en-IN')
                                    }
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                          )
                        })}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Consumers */}
              <Card sx={{ border: '2px solid', borderColor: '#79CBF0' }}>
                <CardContent>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      User Analytics
                    </Typography>
                    <FormControlLabel control={<Switch checked={isAutoRefreshEnabled} onChange={handleAutoRefreshChange} />} label="Auto Refresh" />
                  </Box>

                  <Box mb={2} display="flex" gap={1} alignItems="center" flexWrap="wrap">
                    <FormControl sx={{ minWidth: 180 }} size="small">
                      <InputLabel id="target-country-label">Select Citizenship</InputLabel>
                      <Select
                        labelId="target-country-label"
                        value={filters?.citizenship}
                        size="small"
                        //@ts-ignore
                        onChange={(e) => handleFilterValueChange('citizenship', e.target.value)}
                        label="Select Country"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300, // limit dropdown height if many options
                            },
                          },
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                          },
                          //@ts-ignore
                          getContentAnchorEl: null,
                        }}
                      >
                        {countryCorridors.map((item: any, index: number) => (
                          <MenuItem key={index} value={item.countryCode}>
                            {item.countryCode} ({item.countryName})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="From Date"
                        //@ts-ignore
                        format="YYYY-MM-DD"
                        value={filters?.fromDate}
                        onChange={(newValue: any) => handleFilterValueChange('fromDate', newValue)}
                        slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
                        //@ts-ignore
                        renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                      />

                      <DatePicker
                        label="To Date"
                        value={filters?.toDate}
                        onChange={(newValue: any) => handleFilterValueChange('toDate', newValue)}
                        minDate={filters?.fromDate}
                        format="YYYY-MM-DD"
                        slotProps={{
                          textField: {
                            size: 'small',
                            sx: { width: 150 },
                          },
                        }}
                      />
                    </LocalizationProvider>

                    <Button variant="contained" onClick={handleSearch} sx={{ height: '40px' }} disabled={isFilterEmpty || loading}>
                      {loading ? 'Searching...' : 'Search'}
                    </Button>

                    <Button disabled={loading} variant="outlined" onClick={handleClear} sx={{ height: '40px' }}>
                      Clear
                    </Button>
                  </Box>

                  <Grid container spacing={2}>
                    {visibleAnalytics.map((userItem: any) => (
                      <Grid item xs={Math.floor(12 / visibleAnalytics.length)}>
                        <Box
                          sx={{
                            background: userItem.background,
                            borderRadius: 2,
                            p: 2,
                            textAlign: 'center',
                            color: 'black',
                          }}
                        >
                          <Typography variant="h6" fontWeight={700}>
                            {userItem.count}
                          </Typography>
                          <Typography variant="body2">{userItem.label}</Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {userItem.subLabel}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              {userCountry === 'UAE' && (
                <Box>
                  <img src={bannerImg1} alt="bannerImg" style={{ objectFit: 'contain', width: '100%' }} />
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ border: '2px solid', borderColor: '#79CBF0', height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Volume
                  </Typography>
                  <TransactionPanel />
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Transactions */}

            <Grid item xs={12} md={12}>
              <Box sx={{ mt: 0, mb: 1, marginTop: '20px' }}>
                <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                  Recent Transactions
                </Typography>
                <Box sx={{ height: '400px', width: '100%' }}>
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
                        platformTransactionReferenceId: transaction?.transactionOutward?.platformTransactionReferenceId,
                        sentFrom: `${transaction?.transactionOutward?.sendCountry} | ${transaction?.transactionOutward?.settlementCurrency}`,
                        receivedIn: `${transaction?.transactionOutward?.receiveCountry} | ${transaction?.transactionOutward?.principalCurrency}`,
                        amount: `${transaction?.transactionOutward?.settlementAmount} ${transaction?.transactionOutward?.settlementCurrency}`,
                        principalAmount: `${transaction?.transactionOutward?.principalAmount} ${transaction?.transactionOutward?.principalCurrency}`,

                        reported:
                          transaction?.transactionOutward?.reportingStatus === 'Completed' ? 'Yes' : transaction?.transactionOutward?.reportingStatus,
                        date: helper.convertDateAndTime(transaction?.transactionOutward?.createdLocalDateTime),
                        status: transaction?.transactionOutward?.reportingStatus,
                        transactionStatus: renderTransactionStatus(transaction?.transactionOutward?.transactionStatus),
                      }))}
                      columns={filteredRecentTransColumns}
                      filterModel={filterModel}
                      onFilterModelChange={(model) => setFilterModel(model)}
                      columnVisibilityModel={columnVisibilityModel}
                      onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                      initialState={{
                        pagination: { paginationModel: { pageSize: 10, page: 0 } },
                      }}
                      pageSizeOptions={[10, 20, 100]}
                      disableRowSelectionOnClick
                      slots={{ toolbar: CustomToolbar }}
                      sx={{
                        '& .MuiDataGrid-cell': { borderBottom: '1px solid #e0e0e0' },
                        '& .MuiDataGrid-columnHeaders': {
                          fontWeight: 'bold',
                          borderBottom: '2px solid #1976d2',
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                        },
                        height: '400px',
                      }}
                      disableColumnMenu
                    />
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Grid>

        {/* RIGHT SIDE (Active Channels + Integrations) */}
      </Grid>
    </Box>
  )
}

export default Dashboard
