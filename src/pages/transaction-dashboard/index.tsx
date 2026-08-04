import { Box, Typography, Grid, Card, CardContent } from '@mui/material'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import CancelIcon from '@mui/icons-material/Cancel'
import { useEffect, useState } from 'react'
import { TransactionService } from '@/services/transaction.service'
import { LocalStorageService } from '@/helpers/local-storage-service'

import { AgCharts } from 'ag-charts-react'
import './TransactionDashboard.css'
import { MenuItem, TextField, Button, Autocomplete, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import TransactionWorldMap from '@/components/TransactionWorldMap'

const TransactionDashboard = () => {
  const transactionService = new TransactionService()
  const localService = new LocalStorageService()

  const today = new Date()

  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(today.getMonth() - 3)

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const [fromDate, setFromDate] = useState(formatDate(threeMonthsAgo))
  const [toDate, setToDate] = useState(formatDate(today))
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedTransaction, setSelectedTransaction] = useState('')
  const [transactionSearch, setTransactionSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState('ALL')
  const [destinationCountryFilter, setDestinationCountryFilter] = useState('ALL')
  const [sourceCountryFilter, setSourceCountryFilter] = useState('ALL')
  const [summaryData, setSummaryData] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const userCountry = localService.get_staff_country()
  const selectedCountryCurrency = localStorage.getItem('staffAccessCurrency')

  const transactionNumbers = ['ALL', ...new Set(transactions.map((item: any) => item?.transactionGatewayDTO?.transactionNumber).filter(Boolean))]

  const destinationCountries = ['ALL', ...new Set(transactions.map((item: any) => item?.transactionGatewayDTO?.receiveCountry).filter(Boolean))]
  const sourceCountries = ['ALL', ...new Set(transactions.map((item: any) => item?.transactionGatewayDTO?.sendCountry).filter(Boolean))]
  console.log('USER COUNTRY =>', userCountry)

  const filteredTransactions = transactions.filter((item) => {
    const transactionDate = item?.transactionGatewayDTO?.createdLocalDateTime

    const transaction = new Date(transactionDate)

    const today = new Date()

    let matchesQuickFilter = true

    if (quickFilter === 'TODAY') {
      matchesQuickFilter = transaction.toDateString() === today.toDateString()
    }

    if (quickFilter === '7D') {
      const sevenDaysAgo = new Date()

      sevenDaysAgo.setDate(today.getDate() - 7)

      matchesQuickFilter = transaction >= sevenDaysAgo
    }

    if (quickFilter === '30D') {
      const thirtyDaysAgo = new Date()

      thirtyDaysAgo.setDate(today.getDate() - 30)

      matchesQuickFilter = transaction >= thirtyDaysAgo
    }

    if (quickFilter === 'MONTH') {
      matchesQuickFilter = transaction.getMonth() === today.getMonth() && transaction.getFullYear() === today.getFullYear()
    }

    const status = item?.transactionGatewayDTO?.transactionStatus

    const transactionNumber = item?.transactionGatewayDTO?.transactionNumber || ''
    const destinationCountry = item?.transactionGatewayDTO?.receiveCountry
    const sourceCountry = item?.transactionGatewayDTO?.sendCountry

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'SUCCESS'
          ? ['SUCCESS', 'COMPLETED', 'ACCEPTED'].includes(status)
          : statusFilter === 'PENDING'
            ? ['PENDING', 'IN_PROGRESS'].includes(status)
            : statusFilter === 'FAILED'
              ? ['FAILED', 'REJECTED'].includes(status)
              : status === statusFilter

    const matchesFrom = !fromDate ? true : new Date(transactionDate) >= new Date(fromDate)

    const matchesTo = !toDate ? true : new Date(transactionDate) <= new Date(toDate)

    const matchesSearch =
      !selectedTransaction || selectedTransaction === 'ALL' ? true : transactionNumber.toLowerCase().includes(selectedTransaction.toLowerCase())

    const matchesSourceCountry = sourceCountryFilter === 'ALL' ? true : sourceCountry === sourceCountryFilter

    const matchesDestinationCountry = destinationCountryFilter === 'ALL' ? true : destinationCountry === destinationCountryFilter

    return matchesStatus && matchesFrom && matchesTo && matchesSourceCountry && matchesDestinationCountry && matchesQuickFilter && matchesSearch
  })

  const totalTransactions = filteredTransactions.length

  const statusCounts = filteredTransactions.reduce((acc: any, item: any) => {
    const status = item?.transactionGatewayDTO?.transactionStatus

    acc[status] = (acc[status] || 0) + 1

    return acc
  }, {})

  const trendData = filteredTransactions.reduce((acc: any, item: any) => {
    const date = item?.transactionGatewayDTO?.createdLocalDateTime

    if (!date) return acc

    const d = new Date(date)

    const day = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
    const existing = acc.find((x: any) => x.date === day)

    if (existing) {
      existing.count += 1
      existing.amount += Number(item?.transactionGatewayDTO?.settlementAmount || 0)
    } else {
      acc.push({
        date: day,
        count: 1,
        amount: Number(item?.transactionGatewayDTO?.settlementAmount || 0),
      })
    }

    return acc
  }, [])

  const amountDistributionData = [
    {
      range: '0-500',
      count: filteredTransactions.filter((item: any) => Number(item?.transactionGatewayDTO?.settlementAmount || 0) < 500).length,
    },
    {
      range: '500-1000',
      count: filteredTransactions.filter((item: any) => {
        const amount = Number(item?.transactionGatewayDTO?.settlementAmount || 0)

        return amount >= 500 && amount < 1000
      }).length,
    },
    {
      range: '1000-5000',
      count: filteredTransactions.filter((item: any) => {
        const amount = Number(item?.transactionGatewayDTO?.settlementAmount || 0)

        return amount >= 1000 && amount < 5000
      }).length,
    },
    {
      range: '5000-10000',
      count: filteredTransactions.filter((item: any) => {
        const amount = Number(item?.transactionGatewayDTO?.settlementAmount || 0)

        return amount >= 5000 && amount < 10000
      }).length,
    },
    {
      range: '10000+',
      count: filteredTransactions.filter((item: any) => Number(item?.transactionGatewayDTO?.settlementAmount || 0) >= 10000).length,
    },
  ]

  const amountDistributionOptions: any = {
    subtitle: {
      text: 'Amount Range Histogram',
    },

    data: amountDistributionData,

    series: [
      {
        type: 'bar',
        xKey: 'range',
        yKey: 'count',
        yName: 'Transactions',
      },
    ],

    axes: [
      {
        type: 'category',
        position: 'bottom',
        title: {
          text: `Amount Range (${selectedCountryCurrency})`,
        },
      },
      {
        type: 'number',
        position: 'left',
        title: {
          text: 'Transaction Count',
        },
      },
    ],
  }
  const trendOptions: any = {
    title: {
      enabled: false,
    },

    subtitle: {
      text: 'Daily Transactions',
    },

    data: trendData,

    series: [
      {
        type: 'line',
        xKey: 'date',
        yKey: 'count',
        yName: 'Transactions',
        marker: {
          enabled: true,
          size: 6,
        },
        strokeWidth: 3,
      },
    ],

    legend: {
      enabled: false,
    },

    axes: [
      {
        type: 'category',
        position: 'bottom',
        label: {
          rotation: 0,
        },
      },
      {
        type: 'number',
        position: 'left',
        title: {
          text: 'Transactions',
        },
      },
    ],
  }

  console.log('STATUS COUNTS =>', statusCounts)

  const successfulTransactions = filteredTransactions.filter((item) =>
    ['SUCCESS', 'COMPLETED', 'ACCEPTED'].includes(item?.transactionGatewayDTO?.transactionStatus),
  ).length

  const pendingTransactions = filteredTransactions.filter(
    (item) => item?.transactionGatewayDTO?.transactionStatus === 'PENDING' || item?.transactionGatewayDTO?.transactionStatus === 'IN_PROGRESS',
  ).length

  const failedTransactions = filteredTransactions.filter((item) =>
    ['FAILED', 'REJECTED'].includes(item?.transactionGatewayDTO?.transactionStatus),
  ).length

  const totalVolume = filteredTransactions.reduce((sum, item: any) => sum + Number(item?.transactionGatewayDTO?.settlementAmount || 0), 0)

  const totalRevenue = filteredTransactions.reduce((sum, item: any) => sum + Number(item?.transactionGatewayDTO?.charges || 0), 0)

  const principalAmount = filteredTransactions.reduce((sum, item: any) => sum + Number(item?.transactionGatewayDTO?.principalAmount || 0), 0)

  const settlementAmount = filteredTransactions.reduce((sum, item: any) => sum + Number(item?.transactionGatewayDTO?.settlementAmount || 0), 0)

  const chargesAmount = filteredTransactions.reduce((sum, item: any) => sum + Number(item?.transactionGatewayDTO?.charges || 0), 0)
  const successRate = totalTransactions > 0 ? ((successfulTransactions / totalTransactions) * 100).toFixed(1) : 0

  const avgTicketSize = totalTransactions > 0 ? (totalVolume / totalTransactions).toFixed(2) : 0

  const peakDay = trendData.length > 0 ? trendData.reduce((max: any, current: any) => (current.amount > max.amount ? current : max)) : null

  console.log('SUCCESS RATE =>', successRate)

  const topCorridors = Object.values(
    filteredTransactions.reduce((acc: any, item: any) => {
      const sendCountry = item?.transactionGatewayDTO?.sendCountry

      const receiveCountry = item?.transactionGatewayDTO?.receiveCountry

      const amount = Number(item?.transactionGatewayDTO?.settlementAmount || 0)

      if (!sendCountry || !receiveCountry) return acc

      const key = `${sendCountry} → ${receiveCountry}`

      if (!acc[key]) {
        acc[key] = {
          corridor: key,
          volume: 0,
          transactions: 0,
        }
      }

      acc[key].volume += amount
      acc[key].transactions += 1

      return acc
    }, {}),
  )
    .sort((a: any, b: any) => b.volume - a.volume)
    .slice(0, 5)

  const topDestinations = Object.values(
    filteredTransactions.reduce((acc: any, item: any) => {
      const country = item?.transactionGatewayDTO?.receiveCountry

      const amount = Number(item?.transactionGatewayDTO?.settlementAmount || 0)

      if (!country) return acc

      if (!acc[country]) {
        acc[country] = {
          country,
          volume: 0,
          transactions: 0,
        }
      }

      acc[country].volume += amount
      acc[country].transactions += 1

      return acc
    }, {}),
  )
    .sort((a: any, b: any) => b.volume - a.volume)
    .slice(0, 5)

  const topSources = Object.values(
    filteredTransactions.reduce((acc: any, item: any) => {
      const country = item?.transactionGatewayDTO?.sendCountry

      const amount = Number(item?.transactionGatewayDTO?.settlementAmount || 0)

      if (!country) return acc

      if (!acc[country]) {
        acc[country] = {
          country,
          volume: 0,
          transactions: 0,
        }
      }

      acc[country].volume += amount
      acc[country].transactions += 1

      return acc
    }, {}),
  )
    .sort((a: any, b: any) => b.volume - a.volume)
    .slice(0, 5)

  const mapData = topDestinations.map((item: any) => ({
    country: item.country,
    volume: item.volume,
    transactions: item.transactions,
  }))
  console.log('TOP DESTINATIONS =>', topDestinations)

  const highestCorridor: any = topCorridors.length > 0 ? topCorridors[0] : null

  const maxCorridorVolume = topCorridors.length > 0 ? Math.max(...topCorridors.map((item: any) => item.volume)) : 1

  console.log('TOP CORRIDORS saksham =>', topCorridors)

  console.log('TOTAL REVENUE =>', totalRevenue)

  console.log('TOTAL VOLUME =>', totalVolume)

  console.log(
    'AMOUNT & CHARGES CHECK',
    filteredTransactions.map((item: any) => ({
      settlementAmount: item?.transactionGatewayDTO?.settlementAmount,
      charges: item?.transactionGatewayDTO?.charges,
    })),
  )

  const pieData = [
    {
      status: 'Successful',
      value: successfulTransactions,
      percentage: totalTransactions > 0 ? ((successfulTransactions / totalTransactions) * 100).toFixed(1) : 0,
    },
    {
      status: 'Pending',
      value: pendingTransactions,
      percentage: totalTransactions > 0 ? ((pendingTransactions / totalTransactions) * 100).toFixed(1) : 0,
    },
    {
      status: 'Failed',
      value: failedTransactions,
      percentage: totalTransactions > 0 ? ((failedTransactions / totalTransactions) * 100).toFixed(1) : 0,
    },
  ]

  const pieOptions: any = {
    data: pieData,

    series: [
      {
        type: 'pie',
        angleKey: 'value',
        calloutLabelKey: 'status',
        sectorLabelKey: 'value',

        fills: ['#2e7d32', '#ed6c02', '#d32f2f'],

        strokeWidth: 0,
      },
    ],

    legend: {
      position: 'bottom',
    },
  }

  const summaryCards = [
    {
      title: 'Total Transactions',
      value: totalTransactions,
      icon: <ReceiptLongIcon fontSize="large" />,
      color: '#1976d2',
    },
    {
      title: 'Successful',
      value: successfulTransactions,
      icon: <CheckCircleIcon fontSize="large" />,
      color: '#2e7d32',
    },
    {
      title: 'Pending',
      value: pendingTransactions,
      icon: <PendingActionsIcon fontSize="large" />,
      color: '#ed6c02',
    },
    {
      title: 'Failed',
      value: failedTransactions,
      icon: <CancelIcon fontSize="large" />,
      color: '#d32f2f',
    },
    {
      title: 'Total Value',
      value: `${totalVolume.toFixed(2)} ${selectedCountryCurrency}`,
      icon: <ReceiptLongIcon fontSize="large" />,
      color: '#9c27b0',
    },
    // {
    //   title: 'Charges(Inc Vat)',
    //   value: `${totalRevenue.toFixed(2)} AED`,
    //   icon: <ReceiptLongIcon fontSize="large" />,
    //   color: '#00a76f',
    // },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      icon: <CheckCircleIcon fontSize="large" />,
      color: '#00c853',
    },

    {
      title: 'Avg Ticket Size',
      value: `${Number(avgTicketSize).toLocaleString()} ${selectedCountryCurrency}`,
      icon: <ReceiptLongIcon fontSize="large" />,
      color: '#7c4dff',
    },

    {
      title: 'Peak Day',
      value: peakDay?.date || '-',
      icon: <ReceiptLongIcon fontSize="large" />,
      color: '#ff9800',
    },
    // {
    //   title: 'Best Corridor',
    //   value:
    //     (highestCorridor as any)?.corridor || '-',
    //   icon: <ReceiptLongIcon fontSize="large" />,
    //   color: '#ff9800',
    // }
  ]

  const fetchSummary = async () => {
    try {
      console.log('COUNTRY', userCountry)

      const response = await transactionService.getTransactionSummary(userCountry)

      console.log('TRANSACTION SUMMARY API RESPONSE for overall ')
      console.log(response)

      setSummaryData(response?.data || response)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchOutwardTransactions = async () => {
    const response = await transactionService.getOutwardAllTransaction(userCountry, 0, 5000)
    console.log(response, '==============')
    setTransactions(response || [])
  }

  useEffect(() => {
    //  fetchSummary()
    fetchOutwardTransactions()
  }, [userCountry])

  return (
    <Box className="transaction-dashboard-page" sx={{ width: '90vw', minHeight: '70vh' }}>
      <Typography gutterBottom>
        <strong>Transaction Dashboard</strong>
      </Typography>

      <Card
        sx={{
          mb: 3,
          borderRadius: 4,
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
        }}
      >
        <CardContent>
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid item xs={12} md={2}>
              <TextField
                size="small"
                fullWidth
                type="date"
                label="From Date"
                InputLabelProps={{ shrink: true }}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="To Date"
                InputLabelProps={{ shrink: true }}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField select fullWidth size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="SUCCESS">Success</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Destination Country"
                value={destinationCountryFilter}
                onChange={(e) => setDestinationCountryFilter(e.target.value)}
              >
                {destinationCountries.map((country: any) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={2.5}>
              <Autocomplete
                freeSolo
                options={transactionNumbers}
                value={selectedTransaction}
                onInputChange={(_, value) => {
                  setSelectedTransaction(value)
                  setTransactionSearch(value)
                }}
                renderInput={(params) => <TextField {...params} label="Transaction Number" fullWidth size="small" />}
              />
            </Grid>

            {/* <Grid item xs={12} md={3}>
  <TextField
    select
    fullWidth
    label="Source Country"
    value={sourceCountryFilter}
    onChange={(e) =>
      setSourceCountryFilter(
        e.target.value
      )
    }
  >
    {sourceCountries.map(
      (country: any) => (
        <MenuItem
          key={country}
          value={country}
        >
          {country}
        </MenuItem>
      )
    )}
  </TextField>
</Grid> */}
          </Grid>

          <Box
            sx={{
              display: 'flex',
              gap: 0.75,
              mb: 2,
              flexWrap: 'wrap',
            }}
          >
            <Button size="small" variant={quickFilter === 'TODAY' ? 'contained' : 'outlined'} onClick={() => setQuickFilter('TODAY')}>
              Today
            </Button>

            <Button variant={quickFilter === '7D' ? 'contained' : 'outlined'} onClick={() => setQuickFilter('7D')}>
              Last 7 Days
            </Button>

            <Button variant={quickFilter === '30D' ? 'contained' : 'outlined'} onClick={() => setQuickFilter('30D')}>
              Last 30 Days
            </Button>

            <Button variant={quickFilter === 'MONTH' ? 'contained' : 'outlined'} onClick={() => setQuickFilter('MONTH')}>
              This Month
            </Button>

            <Button variant={quickFilter === 'ALL' ? 'contained' : 'outlined'} onClick={() => setQuickFilter('ALL')}>
              Reset
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={2} key={index}>
            <Card
              sx={{
                borderRadius: 4,

                borderTop: `4px solid ${card.color}`,

                border: '1px solid #E2E8F0',

                background: 'linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)',

                boxShadow: '0 4px 14px rgba(15,23,42,0.06)',

                transition: 'all 0.3s ease',

                height: 110,

                display: 'flex',
                alignItems: 'center',

                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 12px 28px rgba(15,23,42,0.12)',
                },
              }}
            >
              <CardContent
                sx={{
                  width: '100%',
                  height: '100%',
                  p: 2,
                  '&:last-child': {
                    pb: 2,
                  },
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.9rem',
                        color: '#334155',
                        minHeight: 24,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    >
                      {card.title}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        lineHeight: 1.2,
                        mt: 2,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {card.value}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      minWidth: 42,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: `linear-gradient(135deg, ${card.color}20, ${card.color}08)`,
                      border: `1px solid ${card.color}25`,
                      borderRadius: 2,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Amount Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: 350 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600}>
                Transaction Amount Distribution
              </Typography>

              <Box sx={{ height: 260 }}>
                <AgCharts
                  options={{
                    ...amountDistributionOptions,
                    height: 260,
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction Trend */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, height: 350 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600}>
                Transaction Trend
              </Typography>

              <Box sx={{ height: 260 }}>
                <AgCharts
                  options={{
                    ...trendOptions,
                    height: 260,
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Distribution */}
        {/* <Grid item xs={12} md={4}>
    <Card sx={{ borderRadius: 3, height: 350 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600}>
          Status Distribution
        </Typography>

        <Box sx={{ height: 260 }}>
          <AgCharts
            options={{
              ...pieOptions,
              height: 260,
            }}
          />
        </Box>
      </CardContent>
    </Card>
  </Grid> */}
      </Grid>

      {destinationCountryFilter !== 'ALL' && (
        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Corridor Financial Summary
            </Typography>

            <Typography
              sx={{
                color: '#64748B',
                mb: 2,
              }}
            >
              {userCountry} → {destinationCountryFilter}
            </Typography>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Principal Amount</TableCell>

                  <TableCell sx={{ fontWeight: 700 }}>Settlement Amount</TableCell>

                  <TableCell sx={{ fontWeight: 700 }}>Charges</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                <TableRow>
                  <TableCell>
                    {principalAmount.toLocaleString()} {selectedCountryCurrency}
                  </TableCell>

                  <TableCell>
                    {settlementAmount.toLocaleString()} {selectedCountryCurrency}
                  </TableCell>

                  <TableCell>
                    {chargesAmount.toLocaleString()} {selectedCountryCurrency}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              p: 2,
              height: '100%',
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={2}>
              Top Corridors
            </Typography>

            {topCorridors.map((item: any, index) => {
              const percentage = (item.volume / maxCorridorVolume) * 100

              return (
                <Box
                  key={index}
                  sx={{
                    mb: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography fontWeight={600} fontSize="0.92rem">
                      {item.corridor}
                    </Typography>

                    <Typography fontWeight={700} color="#2563EB" fontSize="0.85rem">
                      {Number(item.volume).toLocaleString()} {selectedCountryCurrency}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      height: 8,
                      borderRadius: 10,
                      bgcolor: '#E2E8F0',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${percentage}%`,
                        height: '100%',
                        borderRadius: 10,
                        background: 'linear-gradient(90deg,#2563EB,#60A5FA)',
                      }}
                    />
                  </Box>

                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#1E293B',
                      mt: 0.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                    }}
                  >
                    {item.transactions} Transactions
                  </Typography>
                </Box>
              )
            })}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 4,
              p: 2,
              height: '100%',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={2}>
              Top Source Countries
            </Typography>

            {topSources.map((item: any, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 1.5,
                  borderBottom: index !== topSources.length - 1 ? '1px solid #eee' : 'none',
                }}
              >
                <Box>
                  <Typography fontWeight={600}>{item.country}</Typography>

                  <Typography variant="body2" color="text.secondary">
                    {item.transactions} Transactions
                  </Typography>
                </Box>

                <Typography fontWeight={700} color="success.main">
                  {Number(item.volume).toLocaleString()} {selectedCountryCurrency}
                </Typography>
              </Box>
            ))}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: 379 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600}>
                Transaction Status
              </Typography>

              <Box sx={{ height: 260 }}>
                <AgCharts
                  options={{
                    ...pieOptions,
                    height: 260,
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* <Grid item xs={12} md={6}>
    <Card
      sx={{
        borderRadius: 3,
        p: 2,
        height: '100%',
      }}
    >
      <Typography
        variant="h6"
        fontWeight={600}
        mb={2}
      >
        Top Destination Countries
      </Typography>
      

      {topDestinations.map((item: any, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            py: 1.5,
            borderBottom:
              index !== topDestinations.length - 1
                ? '1px solid #eee'
                : 'none',
          }}
        >
          <Box>
            <Typography fontWeight={600}>
              {item.country}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {item.transactions} Transactions
            </Typography>
          </Box>

          <Typography
            fontWeight={700}
            color="success.main"
          >
            {Number(item.volume).toLocaleString()} AED
          </Typography>
        </Box>
      ))}
    </Card>
  </Grid> */}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 3,
              p: 2,
              height: 650,
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={2}>
              Global Transaction
            </Typography>

            <TransactionWorldMap data={mapData} selectedCountry={selectedCountry} />
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              p: 2,
              height: 650,
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={2}>
              Top Destination Countries
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                pb: 1,
                mb: 1,
                borderBottom: '2px solid #eee',
              }}
            >
              <Typography fontWeight={700}>Country</Typography>

              <Typography fontWeight={700}>Volume ({selectedCountryCurrency})</Typography>
            </Box>

            {topDestinations.map((item: any, index) => (
              <Box
                key={index}
                onClick={() => setSelectedCountry(item.country)}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 1.5,
                  px: 1,
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',

                  '&:hover': {
                    backgroundColor: '#f5f8ff',
                  },
                }}
              >
                <Typography>{item.country}</Typography>

                <Typography fontWeight={600}>
                  {Number(item.volume).toLocaleString()} {selectedCountryCurrency}
                </Typography>
              </Box>
            ))}
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TransactionDashboard
