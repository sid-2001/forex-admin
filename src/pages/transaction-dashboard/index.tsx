import { Box, Typography, Grid, Card, CardContent } from '@mui/material'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import CancelIcon from '@mui/icons-material/Cancel'
import { useEffect, useState } from 'react'
import { TransactionService } from '@/services/transaction.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { AgCharts } from 'ag-charts-react'
import {
  MenuItem,
  TextField,
  Button,
   Autocomplete
} from '@mui/material'
import TransactionWorldMap from '@/components/TransactionWorldMap'
const TransactionDashboard = () => {
const transactionService = new TransactionService()
const localService = new LocalStorageService()

const [fromDate, setFromDate] = useState('')
const [toDate, setToDate] = useState('')
const [statusFilter, setStatusFilter] = useState('ALL')
const [selectedTransaction, setSelectedTransaction] =
  useState('')
const [transactionSearch, setTransactionSearch] = useState('')
const [quickFilter, setQuickFilter] =
  useState('ALL')
const [destinationCountryFilter, setDestinationCountryFilter] =
  useState('ALL')
const [sourceCountryFilter, setSourceCountryFilter] =
  useState('ALL')
const [summaryData, setSummaryData] = useState<any>(null)
const [transactions, setTransactions] = useState<any[]>([])
const [selectedCountry, setSelectedCountry] =
  useState<string | null>(null)
const userCountry = localService.get_staff_country()
const transactionNumbers = [
  'ALL',
  ...new Set(
    transactions
      .map(
        (item: any) =>
          item?.transactionGatewayDTO
            ?.transactionNumber
      )
      .filter(Boolean)
  ),
]
const destinationCountries = [
  'ALL',
  ...new Set(
    transactions
      .map(
        (item: any) =>
          item?.transactionGatewayDTO?.receiveCountry
      )
      .filter(Boolean)
  ),
]
const sourceCountries = [
  'ALL',
  ...new Set(
    transactions
      .map(
        (item: any) =>
          item?.transactionGatewayDTO?.sendCountry
      )
      .filter(Boolean)
  ),
]
console.log('USER COUNTRY =>', userCountry)
const filteredTransactions = transactions.filter((item) => {
  const transactionDate =
    item?.transactionGatewayDTO?.createdLocalDateTime

    const transaction =
  new Date(transactionDate)

const today = new Date()

let matchesQuickFilter = true

if (quickFilter === 'TODAY') {
  matchesQuickFilter =
    transaction.toDateString() ===
    today.toDateString()
}

if (quickFilter === '7D') {
  const sevenDaysAgo =
    new Date()

  sevenDaysAgo.setDate(
    today.getDate() - 7
  )

  matchesQuickFilter =
    transaction >= sevenDaysAgo
}

if (quickFilter === '30D') {
  const thirtyDaysAgo =
    new Date()

  thirtyDaysAgo.setDate(
    today.getDate() - 30
  )

  matchesQuickFilter =
    transaction >= thirtyDaysAgo
}

if (quickFilter === 'MONTH') {
  matchesQuickFilter =
    transaction.getMonth() ===
      today.getMonth() &&
    transaction.getFullYear() ===
      today.getFullYear()
}

  const status =
    item?.transactionGatewayDTO?.transactionStatus

    
    const transactionNumber =
  item?.transactionGatewayDTO?.transactionNumber || ''
    const destinationCountry =
  item?.transactionGatewayDTO?.receiveCountry
    const sourceCountry =
  item?.transactionGatewayDTO?.sendCountry

 const matchesStatus =
  statusFilter === 'ALL'
    ? true
    : statusFilter === 'SUCCESS'
    ? ['SUCCESS', 'COMPLETED'].includes(status)
    : statusFilter === 'PENDING'
    ? ['PENDING', 'IN_PROGRESS'].includes(status)
    : status === statusFilter

  const matchesFrom =
    !fromDate
      ? true
      : new Date(transactionDate) >= new Date(fromDate)

  const matchesTo =
    !toDate
      ? true
      : new Date(transactionDate) <= new Date(toDate)

    const matchesSearch =
  !selectedTransaction ||
  selectedTransaction === 'ALL'
    ? true
    : transactionNumber
        .toLowerCase()
        .includes(
          selectedTransaction.toLowerCase()
        )

      const matchesSourceCountry =
  sourceCountryFilter === 'ALL'
    ? true
    : sourceCountry === sourceCountryFilter

    const matchesDestinationCountry =
  destinationCountryFilter === 'ALL'
    ? true
    : destinationCountry ===
      destinationCountryFilter

  return (
  matchesStatus &&
  matchesFrom &&
  matchesTo &&
  matchesSourceCountry &&
  matchesDestinationCountry  &&
  matchesQuickFilter  &&
  matchesSearch 
)
})

const totalTransactions = filteredTransactions.length

const statusCounts = filteredTransactions.reduce(
  (acc: any, item: any) => {
    const status =
      item?.transactionGatewayDTO?.transactionStatus

    acc[status] = (acc[status] || 0) + 1

    return acc
  },
  {}
)

const trendData = filteredTransactions.reduce((acc: any, item: any) => {

    
  const date = item?.transactionGatewayDTO?.createdLocalDateTime

  if (!date) return acc

  const day = new Date(date).toLocaleDateString()

  const existing = acc.find((x: any) => x.date === day)

  if (existing) {
    existing.count += 1
    existing.amount +=
      Number(
        item?.transactionGatewayDTO?.settlementAmount || 0
      )
  } else {
    acc.push({
      date: day,
      count: 1,
      amount: Number(
        item?.transactionGatewayDTO?.settlementAmount || 0
      ),
    })
  }

  return acc
}, [])


const trendOptions: any = {
  title: {
    text: 'Transaction Volume',
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

const successfulTransactions = filteredTransactions.filter(
  (item) =>
    item?.transactionGatewayDTO?.transactionStatus === 'SUCCESS' ||
    item?.transactionGatewayDTO?.transactionStatus === 'COMPLETED'
).length




const pendingTransactions = filteredTransactions.filter(
  (item) =>
    item?.transactionGatewayDTO?.transactionStatus === 'PENDING' ||
    item?.transactionGatewayDTO?.transactionStatus === 'IN_PROGRESS'
).length

const failedTransactions = filteredTransactions.filter(
  (item) =>
    item?.transactionGatewayDTO?.transactionStatus === 'FAILED'
).length

const totalVolume = filteredTransactions.reduce(
  (sum, item: any) =>
    sum +
    Number(
      item?.transactionGatewayDTO?.settlementAmount || 0
    ),
  0
)

const totalRevenue = filteredTransactions.reduce(
  (sum, item: any) =>
    sum +
    Number(
      item?.transactionGatewayDTO?.charges || 0
    ),
  0
)
const successRate =
  totalTransactions > 0
    ? (
        (successfulTransactions /
          totalTransactions) *
        100
      ).toFixed(1)
    : 0

const avgTicketSize =
  totalTransactions > 0
    ? (
        totalVolume /
        totalTransactions
      ).toFixed(2)
    : 0

const peakDay =
  trendData.length > 0
    ? trendData.reduce(
        (max: any, current: any) =>
          current.amount > max.amount
            ? current
            : max
      )
    : null

console.log(
  'SUCCESS RATE =>',
  successRate
)


const topCorridors = Object.values(
  filteredTransactions.reduce((acc: any, item: any) => {
    const sendCountry =
      item?.transactionGatewayDTO?.sendCountry

    const receiveCountry =
      item?.transactionGatewayDTO?.receiveCountry

    const amount = Number(
      item?.transactionGatewayDTO?.settlementAmount || 0
    )

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
  }, {})
)
  .sort((a: any, b: any) => b.volume - a.volume)
  .slice(0, 5)


  const topDestinations = Object.values(
  filteredTransactions.reduce((acc: any, item: any) => {
    const country =
      item?.transactionGatewayDTO?.receiveCountry

    const amount = Number(
      item?.transactionGatewayDTO?.settlementAmount || 0
    )

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
  }, {})
)
  .sort((a: any, b: any) => b.volume - a.volume)
  .slice(0, 5)

  const topSources = Object.values(
  filteredTransactions.reduce(
    (acc: any, item: any) => {
      const country =
        item?.transactionGatewayDTO?.sendCountry

      const amount = Number(
        item?.transactionGatewayDTO
          ?.settlementAmount || 0
      )

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
    },
    {}
  )
)
  .sort(
    (a: any, b: any) =>
      b.volume - a.volume
  )
  .slice(0, 5)

  const mapData = topDestinations.map((item: any) => ({
  country: item.country,
  volume: item.volume,
  transactions: item.transactions,
}))
console.log(
  'TOP DESTINATIONS =>',
  topDestinations
)

const highestCorridor : any =
  topCorridors.length > 0
    ? topCorridors[0]
    : null


console.log('TOP CORRIDORS saksham =>', topCorridors)

console.log('TOTAL REVENUE =>', totalRevenue)

console.log('TOTAL VOLUME =>', totalVolume)

console.log(
  'AMOUNT & CHARGES CHECK',
  filteredTransactions.map((item: any) => ({
    settlementAmount:
      item?.transactionGatewayDTO?.settlementAmount,
    charges:
      item?.transactionGatewayDTO?.charges,
  }))
)

const pieData = [
  {
    status: 'Successful',
    value: successfulTransactions,
    percentage:
      totalTransactions > 0
        ? ((successfulTransactions / totalTransactions) * 100).toFixed(1)
        : 0,
  },
  {
    status: 'Pending',
    value: pendingTransactions,
    percentage:
      totalTransactions > 0
        ? ((pendingTransactions / totalTransactions) * 100).toFixed(1)
        : 0,
  },
  {
    status: 'Failed',
    value: failedTransactions,
    percentage:
      totalTransactions > 0
        ? ((failedTransactions / totalTransactions) * 100).toFixed(1)
        : 0,
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

      fills: [
        '#2e7d32',
        '#ed6c02',
        '#d32f2f',
      ],

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
  title: 'Total Volume',
  value: `${totalVolume.toFixed(2)} AED`,
  icon: <ReceiptLongIcon fontSize="large" />,
  color: '#9c27b0',
},
{
  title: 'Revenue Generated',
  value: `${totalRevenue.toFixed(2)} AED`,
  icon: <ReceiptLongIcon fontSize="large" />,
  color: '#00a76f',
},
{
  title: 'Success Rate',
  value: `${successRate}%`,
  icon: <CheckCircleIcon fontSize="large" />,
  color: '#00c853',
},

{
  title: 'Avg Ticket Size',
  value: `${Number(avgTicketSize).toLocaleString()} AED`,
  icon: <ReceiptLongIcon fontSize="large" />,
  color: '#7c4dff',
},

{
  title: 'Peak Day',
  value: peakDay?.date || '-',
  icon: <ReceiptLongIcon fontSize="large" />,
  color: '#ff9800',
},
{
  title: 'Best Corridor',
  value:
    (highestCorridor as any)?.corridor || '-',
  icon: <ReceiptLongIcon fontSize="large" />,
  color: '#ff9800',
}
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

useEffect(() => {
     fetchSummary() 
  transactionService
    .getOutwardAllTransaction(userCountry, 0, 5000)
    .then((data) => {
      console.log('OUTWARD TRANSACTIONS')
      console.log(data)

      console.log('FIRST TRANSACTION')
      console.log(data?.[0])
   console.log(
  'TRANSACTION GATEWAY DTO',
  (data?.[0] as any)?.transactionGatewayDTO
)

console.log(
  'ALL DTO KEYS',
  Object.keys(
    (data?.[0] as any)?.transactionGatewayDTO || {}
  )
)

      setTransactions(data || [])
    })
    .catch((err) => {
      console.log(err)
    })
}, [userCountry])

  return (
    <Box sx={{ width: '80vw', minHeight: '70vh' }}>
      <Typography  gutterBottom>
        <strong>Transaction Dashboard</strong>
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
  <Grid item xs={12} md={3}>
    <TextField
      fullWidth
      type="date"
      label="From Date"
      InputLabelProps={{ shrink: true }}
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
    />
  </Grid>


  <Grid item xs={12} md={3}>
    <TextField
      fullWidth
      type="date"
      label="To Date"
      InputLabelProps={{ shrink: true }}
      value={toDate}
      onChange={(e) => setToDate(e.target.value)}
    />
  </Grid>

  <Grid item xs={12} md={3}>
    <TextField
      select
      fullWidth
      label="Status"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <MenuItem value="ALL">All</MenuItem>
      <MenuItem value="SUCCESS">Success</MenuItem>
      <MenuItem value="PENDING">Pending</MenuItem>
      <MenuItem value="FAILED">Failed</MenuItem>
    </TextField>
  </Grid>


  <Grid item xs={12} md={3}>
  <TextField
    select
    fullWidth
    label="Destination Country"
    value={destinationCountryFilter}
    onChange={(e) =>
      setDestinationCountryFilter(
        e.target.value
      )
    }
  >
    {destinationCountries.map(
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
</Grid>

<Grid item xs={12} md={4}>
  <Autocomplete
    freeSolo
    options={transactionNumbers}
    value={selectedTransaction}
    onInputChange={(_, value) => {
      setSelectedTransaction(value)
      setTransactionSearch(value)
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Transaction Number"
        fullWidth
      />
    )}
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
    gap: 1,
    mb: 3,
    flexWrap: 'wrap',
  }}
>
  <Button
    variant={
      quickFilter === 'TODAY'
        ? 'contained'
        : 'outlined'
    }
    onClick={() =>
      setQuickFilter('TODAY')
    }
  >
    Today
  </Button>

  <Button
    variant={
      quickFilter === '7D'
        ? 'contained'
        : 'outlined'
    }
    onClick={() =>
      setQuickFilter('7D')
    }
  >
    Last 7 Days
  </Button>

  <Button
    variant={
      quickFilter === '30D'
        ? 'contained'
        : 'outlined'
    }
    onClick={() =>
      setQuickFilter('30D')
    }
  >
    Last 30 Days
  </Button>

  <Button
    variant={
      quickFilter === 'MONTH'
        ? 'contained'
        : 'outlined'
    }
    onClick={() =>
      setQuickFilter('MONTH')
    }
  >
    This Month
  </Button>

  <Button
    variant={
      quickFilter === 'ALL'
        ? 'contained'
        : 'outlined'
    }
    onClick={() =>
      setQuickFilter('ALL')
    }
  >
    Reset
  </Button>
</Box>
      

    
      <Grid container spacing={3} sx={{ mb: 4 }}>
  {summaryCards.map((card, index) => (
    <Grid item xs={12} sm={6} md={2}key={index}>
      <Card
  sx={{
    borderRadius: 3,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: '0.3s',

    height: 170,            // sab cards same height
    display: 'flex',
    alignItems: 'center',

    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
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
          color: 'text.secondary',
          minHeight: 44,
          fontWeight: 500,
        }}
      >
        {card.title}
      </Typography>

      <Typography
        sx={{
          fontSize: '1.7rem',
    fontWeight: 700,
    lineHeight: 1.2,
    mt: 1,
    whiteSpace: 'nowrap',
        }}
      >
        {card.value}
      </Typography>
    </Box>

    <Box
      sx={{
        width: 56,
        height: 56,
        minWidth: 56,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: `${card.color}15`,
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
  <Grid item xs={12} md={8}>
    <Card
      sx={{
        borderRadius: 3,
        height: 350,
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={600}>
          Transaction Trend
        </Typography>

       <Box
  sx={{
    height: 280,
    width: '100%',
  }}
>
  <AgCharts
    options={{
      ...trendOptions,
      height: 280,
    }}
  />
</Box>
      </CardContent>
    </Card>
  </Grid>

  <Grid item xs={12} md={4}>
    <Card
      sx={{
        borderRadius: 3,
        height: 350,
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={600}>
          Status Distribution
        </Typography>

        <Box
  sx={{
    height: 260,
    width: '100%',
  }}
>
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
</Grid>

<Grid container spacing={3}>
  <Grid item xs={12} md={6}>
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
        Top Corridors
      </Typography>

      {topCorridors.map((item: any, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            py: 1.5,
            borderBottom:
              index !== topCorridors.length - 1
                ? '1px solid #eee'
                : 'none',
          }}
        >
          <Box>
            <Typography fontWeight={600}>
              {item.corridor}
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
            color="primary"
          >
            {Number(item.volume).toLocaleString()} AED
          </Typography>
        </Box>
      ))}
    </Card>
  </Grid>


  <Grid item xs={12} md={6}>
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
      Top Source Countries
    </Typography>

    {topSources.map(
      (item: any, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            py: 1.5,
            borderBottom:
              index !== topSources.length - 1
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
            {Number(
              item.volume
            ).toLocaleString()} AED
          </Typography>
        </Box>  
      )
    )}
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
      <Typography
        variant="h6"
        fontWeight={600}
        mb={2}
      >
        Global Transaction Volume
      </Typography>

      <TransactionWorldMap
  data={mapData}
  selectedCountry={selectedCountry}
/>
    </Card>
  </Grid>

  <Grid item xs={12} md={4}>
    <Card
      sx={{
        borderRadius: 3,
        p: 2,
        height: 500,
      }}
    >
      <Typography
        variant="h6"
        fontWeight={600}
        mb={2}
      >
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
  <Typography fontWeight={700}>
    Country
  </Typography>

  <Typography fontWeight={700}>
    Volume (AED)
  </Typography>
</Box>

      {topDestinations.map(
        (item: any, index) => (
          <Box
            key={index}
             onClick={() =>
           setSelectedCountry(item.country)
      } 
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
            <Typography>
              {item.country}
            </Typography>

            <Typography
              fontWeight={600}
            >
              {Number(
                item.volume
              ).toLocaleString()} AED
            </Typography>
          </Box>
        )
      )}
    </Card>
  </Grid>
</Grid>

    </Box>
  )
}

export default TransactionDashboard