import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Box, Card, CardContent, Typography, Grid, CardMedia, Switch, Skeleton, Button } from '@mui/material'
import { TransactionService } from '@/services/transaction.service'
import { PaymentGateway } from '@/types/static.type'
import staticdataService from '@/services/staticdata.service'
import { useRecoilState } from 'recoil'
import { selectedAppState, alertState, alertTextState, alertTypeState, loaderState, availableBalanceState } from '@/states/state'
import { LocalStorageService } from '@/helpers/local-storage-service'
import TransactionPanel from '@/components/transaction-panel'
import { HelperService } from '@/helpers/helper'
import { Link, useNavigate } from 'react-router-dom'
import { AgChartOptions } from 'ag-charts-community'
import TransactionModal from '@/components/transaction-panel'
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridFilterModel } from '@mui/x-data-grid'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ApplicantService } from '@/services/applicant.service'
import CompactLocationBar from '@/components/location'
import ProductConfigService from '@/services/product.config.service'

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
  const [enabled, setEnabled] = useState(true)
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

  const [selectedApp, setSelectedApp] = useRecoilState(selectedAppState)
  const navigate = useNavigate()
  const [open, setOpen] = useRecoilState(alertState)
  const [text, setText] = useRecoilState(alertTextState)
  const [type, settype] = useRecoilState(alertTypeState)
  const service = new ProductConfigService()

  const getGatewayList = () => {
    static_service.getStaticPaymentGateway(local_service?.get_staff_country()).then((data: any) => {
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

  const fetchConsumersData = async () => {
    try {
      const data = await applicant_service.getConsumersData(local_service?.get_staff_country())
      setConsumersData(data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  useEffect(() => {
    // commented out for uae corridor
    //  getGatewayList()
    // fetchProductConfig('IN')
    fetchConsumersData()
    setIsLoading(true)
    getOutwardTransactionsList()
    setSelectedApp('Dashboard')
    // transaction_service.getTransactionSummary(userCountry).then((data) => {
    //   setapplicantData(data?.data)
    // })
  }, [])

  const bankAccounts = [
    {
      name: 'ICICI ',
      balance,
      image_url: 'https://pbs.twimg.com/profile_images/1477924435969462272/ZQADGPv5_400x400.png  ',
      country: 'In',
    },
    {
      name: 'SB ',
      balance: 'No Data',
      image_url:
        'https://media.licdn.com/dms/image/v2/C4D0BAQEMo-EgURgpnA/company-logo_200_200/company-logo_200_200/0/1630561374295/standard_bank_group_logo?e=1763596800&v=beta&t=SA9TooJjIAO9AO3sO0Y_bMebCjTauJ4XnBz2gI8JTtI',
      country: 'In',
    },

    {
      name: 'SA ',
      balance: 'No Data',
      image_url:
        'https://media.licdn.com/dms/image/v2/C4D0BAQEMo-EgURgpnA/company-logo_200_200/company-logo_200_200/0/1630561374295/standard_bank_group_logo?e=1763596800&v=beta&t=SA9TooJjIAO9AO3sO0Y_bMebCjTauJ4XnBz2gI8JTtI',
      country: 'SA',
    },
    {
      name: 'Standard Bank ',
      balance: 'No Data',
      image_url:
        'https://media.licdn.com/dms/image/v2/C4D0BAQEMo-EgURgpnA/company-logo_200_200/company-logo_200_200/0/1630561374295/standard_bank_group_logo?e=1763596800&v=beta&t=SA9TooJjIAO9AO3sO0Y_bMebCjTauJ4XnBz2gI8JTtI',
      country: 'NG',
    },
    {
      name: 'Tatum Bank ',
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
      renderCell: (params: any) => <span style={{ color: 'green', fontWeight: 'bold' }}>{params.value}</span>,
    },
    { field: 'reported', headerName: 'Reported', flex: 0.8 },
    { field: 'date', headerName: 'Date & Time', flex: 1 },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      renderCell: (params: any) => (
        <Link to={`/transaction-detail/${params?.row?.transactionId}`}>
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>View detail</span>
        </Link>
      ),
    },
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
        sentFrom: `${transaction?.transactionOutward?.sendCountry} | ${transaction?.transactionOutward?.settlementCurrency}`,
        receivedIn: `${transaction?.transactionOutward?.receiveCountry} | ${transaction?.transactionOutward?.principalCurrency}`,
        amount: `${transaction?.transactionOutward?.settlementAmount} ${transaction?.transactionOutward?.settlementCurrency}`,
        //  reported: transaction?.transactionOutward?.reportingStatus === 'Completed' ? 'Yes' : transaction?.transactionOutward?.reportingStatus,
        date: helper.convertDateAndTime(transaction?.transactionOutward?.createdLocaldatetime),
        status: transaction?.transactionOutward?.reportingStatus,
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
        sentFrom: `${transaction?.transactionOutward?.sendCountry} | ${transaction?.transactionOutward?.settlementCurrency}`,
        receivedIn: `${transaction?.transactionOutward?.receiveCountry} | ${transaction?.transactionOutward?.principalCurrency}`,
        amount: `${transaction?.transactionOutward?.settlementAmount} ${transaction?.transactionOutward?.settlementCurrency}`,
        //  reported: transaction?.transactionOutward?.reportingStatus === 'Completed' ? 'Yes' : transaction?.transactionOutward?.reportingStatus,
        date: helper.convertDateAndTime(transaction?.transactionOutward?.createdLocaldatetime),
        status: transaction?.transactionOutward?.reportingStatus,
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
      hidden: userCountry === 'UAE',
    },
    {
      background: 'linear-gradient(to bottom, #81C784,rgb(40, 124, 44))',
      subLabel: 'Active',
      count: consumersData?.active ?? 0,
      label: 'Users',
      hidden: false,
    },
  ]
  const visibleAnalytics = userAnalytics.filter((p) => !p.hidden)

  return (
    <Box sx={{ width: '85vw', overflowX: 'hidden', height: '85vh' }}>
      <Typography variant="h4" gutterBottom sx={{ mt: 0, mb: 1 }}>
        <b>Dashboard </b>
      </Typography>
      <CompactLocationBar />
      <Grid container spacing={2}>
        {/* LEFT SIDE (Balances + Consumers + Volume + Recent Transactions) */}
        <Grid item xs={12} md={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
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
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    User Analytics
                  </Typography>
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
            </Grid>

            <Grid item xs={12} md={7}>
              <Card sx={{ border: '2px solid', borderColor: '#79CBF0', height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700}>
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
                        transaction?.transactionOutward?.reportingStatus === 'Completed' ? 'Yes' : transaction?.transactionOutward?.reportingStatus,
                      date: helper.convertDateAndTime(transaction?.transactionOutward?.createdLocalDateTime),
                      status: transaction?.transactionOutward?.reportingStatus,
                    }))}
                    columns={filteredRecentTransColumns}
                    filterModel={filterModel}
                    onFilterModelChange={(model) => setFilterModel(model)}
                    columnVisibilityModel={columnVisibilityModel}
                    onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10, page: 0 } },
                    }}
                    pageSizeOptions={[5, 10, 20]}
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
                    }}
                    disableColumnMenu
                  />
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* RIGHT SIDE (Active Channels + Integrations) */}
      </Grid>
    </Box>
  )
}

export default Dashboard
