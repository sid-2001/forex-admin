import React, { useState } from 'react';
import { 
  Box, Grid, Paper, Typography, Avatar, Chip, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  createTheme, ThemeProvider, CssBaseline, 
  TextField,
  Button
} from '@mui/material';
import { 
  TrendingUp, Users, Globe, Wallet, CheckCircle, 
  ArrowUpRight, ArrowDownLeft, AlertCircle, LucideIcon 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { Filter1Outlined } from '@mui/icons-material';

// --- INTERFACES ---
interface Transaction {
  id: string;
  type: 'Inbound' | 'Outbound';
  route: string;
  amount: string;
  status: 'completed' | 'processing' | 'failed';
  time: string;
}

// --- EXPANDED SAMPLE DATA ---
const trendData = [
  { name: 'Jan', transactions: 4000, successful: 3800, failed: 200 },
  { name: 'Feb', transactions: 5100, successful: 4900, failed: 200 },
  { name: 'Mar', transactions: 6800, successful: 6500, failed: 300 },
  { name: 'Apr', transactions: 7200, successful: 7000, failed: 200 },
  { name: 'May', transactions: 9000, successful: 8700, failed: 300 },
  { name: 'Jun', transactions: 9800, successful: 9400, failed: 400 },
  { name: 'Jul', transactions: 11200, successful: 10800, failed: 400 },
  { name: 'Aug', transactions: 10500, successful: 10100, failed: 400 },
  { name: 'Sep', transactions: 12100, successful: 11800, failed: 300 },
  { name: 'Oct', transactions: 13800, successful: 13200, failed: 600 },
  { name: 'Nov', transactions: 15200, successful: 14800, failed: 400 },
  { name: 'Dec', transactions: 15842, successful: 15200, failed: 642 },
 
];

const valueData = [
  { name: 'Jan', inbound: 1200000, outbound: 800000 },
  { name: 'Mar', inbound: 1800000, outbound: 1200000 },
  { name: 'May', inbound: 2200000, outbound: 1900000 },
  { name: 'Jul', inbound: 3100000, outbound: 2500000 },
  { name: 'Sep', inbound: 3800000, outbound: 2900000 },
  { name: 'Nov', inbound: 4500000, outbound: 3500000 },
  { name: 'Dec', inbound: 5450000, outbound: 4100000 },
];

const userDistData = [
  { name: 'KYC Verified', value: 12450, color: '#10b981' },
  { name: 'Active Users', value: 8230, color: '#3b82f6' },
  { name: 'Pending', value: 3180, color: '#f59e0b' },
  { name: 'Recently Onboarded', value: 2650, color: '#8b5cf6' },
  { name: 'Unverified', value: 1840, color: '#ef4444' },
];

const currencyData = [
  { name: 'USD', volume: 45000, value: 18 },
  { name: 'EUR', volume: 55000, value: 15 },
  { name: 'GBP', volume: 32000, value: 11 },
  { name: 'JPY', volume: 38000, value: 8 },
  { name: 'AUD', volume: 22000, value: 7 },
  { name: 'CAD', volume: 18000, value: 6 },
  { name: 'CHF', volume: 15000, value: 5 },
  { name: 'CNY', volume: 12000, value: 4 },
];

const transactionList: Transaction[] = [
  { id: 'TX00145', type: 'Outbound', route: 'USA → India', amount: 'USD 15,420', status: 'completed', time: '2 mins ago' },
  { id: 'TX00144', type: 'Inbound', route: 'UK → Canada', amount: 'GBP 8,750', status: 'completed', time: '5 mins ago' },
  { id: 'TX00143', type: 'Outbound', route: 'Germany → Japan', amount: 'EUR 22,100', status: 'processing', time: '12 mins ago' },
  { id: 'TX00142', type: 'Inbound', route: 'Australia → USA', amount: 'AUD 31,200', status: 'completed', time: '18 mins ago' },
  { id: 'TX00141', type: 'Outbound', route: 'Canada → Mexico', amount: 'CAD 5,680', status: 'completed', time: '23 mins ago' },
  { id: 'TX00140', type: 'Inbound', route: 'Switzerland → France', amount: 'CHF 18,900', status: 'failed', time: '35 mins ago' },
  { id: 'TX00139', type: 'Outbound', route: 'USA → Brazil', amount: 'USD 12,450', status: 'completed', time: '42 mins ago' },
];

// --- THEME ---
const theme = createTheme({
  palette: {
    background: { default: '#f9fafb' },
    primary: { main: '#6366f1' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h6: { fontWeight: 700, color: '#111827' },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 12, boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' } } },
  },
});

// --- SUB-COMPONENTS ---
const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <Paper sx={{ p: 2.5, height: '100%' }}>
    <Box display="flex" justifyContent="space-between">
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>{title}</Typography>
        <Typography variant="h4" fontWeight={800} sx={{ my: 0.5 }}>{value}</Typography>
        <Typography variant="caption" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TrendingUp size={14} /> ↑ {change} <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>vs last month</Box>
        </Typography>
      </Box>
      <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, borderRadius: 2 }}>
        <Icon size={20} />
      </Avatar>
    </Box>
  </Paper>
);

export default function EnhancedDashboard() {

const [dateRange, setDateRange] = useState({ start: '', end: '' });

const handleDateChange = (field:any) => (event:any) => {
  setDateRange({ ...dateRange, [field]: event.target.value });
};
    const handleApplyFilter = () => {
  console.log("Applying Filter for:", dateRange.start, "to", dateRange.end);
  // Trigger your API call or data filtering logic here
};
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box  sx={{width:"85vw" ,overflow:"hidden"}}>
        
        {/* Header */}
<Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
    {/* Left Side: Title */}
    <Box>
      {/* <Typography variant="h5" fontWeight={800}>Cross-Border Payments Dashboard</Typography>
      <Typography variant="body2" color="text.secondary">Admin Portal - Real-time Analytics</Typography> */}
    </Box>

    {/* Right Side: Filters & Metadata */}
    <Box display="flex" alignItems="center" gap={2}>
      
      {/* Date Range Inputs */}
      <Box 
        display="flex" 
        alignItems="center" 
        gap={1} 
        sx={{ border: '1px solid #e0e0e0', p: '2px 8px', borderRadius: 2, bgcolor: '#fff' }}
      >
        <TextField
          type="date"
          size="small"
          variant="standard"
          value={dateRange.start}
          onChange={handleDateChange('start')}
          InputProps={{ disableUnderline: true }}
          sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
        />
        <Typography variant="caption" color="text.secondary">to</Typography>
        <TextField
          type="date"
          size="small"
          variant="standard"
          value={dateRange.end}
          onChange={handleDateChange('end')}
          InputProps={{ disableUnderline: true }}
          sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
        />
      </Box>

      {/* Apply Button */}
      <Button 
        variant="contained" 
        disableElevation
        size="small"
        onClick={handleApplyFilter}
        startIcon={<Filter1Outlined sx={{ fontSize: '1rem !important' }} />}
        sx={{ 
          textTransform: 'none', 
          borderRadius: 2, 
          height: '32px',
          bgcolor: '#a855f7', // Matching your Avatar theme
          '&:hover': { bgcolor: '#9333ea' } 
        }}
      >
        Apply
      </Button>

    
      
       </Box>
  </Box>

        <Grid container spacing={3}>
          {/* Main Stat Cards */}
          <Grid item xs={12} md={4}><StatCard title="Total Account Balance" value="$24.8M" change="12.5%" icon={Wallet} color="primary" /></Grid>
          <Grid item xs={12} md={4}><StatCard title="Transaction Volume" value="15,842" change="8.3%" icon={TrendingUp} color="secondary" /></Grid>
          <Grid item xs={12} md={4}><StatCard title="Transaction Value" value="$5.45M" change="15.2%" icon={CheckCircle} color="success" /></Grid>
          
          <Grid item xs={12} md={4}><StatCard title="Active Users" value="8,230" change="6.7%" icon={Users} color="info" /></Grid>
          <Grid item xs={12} md={4}><StatCard title="KYC Verified Users" value="12,450" change="4.2%" icon={CheckCircle} color="success" /></Grid>
          <Grid item xs={12} md={4}><StatCard title="Countries Served" value="87" change="3.1%" icon={Globe} color="error" /></Grid>

          {/* Charts Row */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Transaction Volume Trends</Typography>
              <Box height={300}>
                <ResponsiveContainer>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="transactions" stroke="#6366f1" strokeWidth={3} dot={{r: 4, fill: '#6366f1'}} />
                    <Line type="monotone" dataKey="successful" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Transaction Value (Inbound vs Outbound)</Typography>
              <Box height={300}>
                <ResponsiveContainer>
                  <AreaChart data={valueData}>
                    <defs>
                      <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                      <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="inbound" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" />
                    <Area type="monotone" dataKey="outbound" stroke="#f59e0b" fillOpacity={1} fill="url(#colorOut)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Distributions */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">User Status Distribution</Typography>
              <Box height={300} display="flex" flexDirection="column" alignItems="center">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={userDistData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {userDistData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
                  {userDistData.map(item => (
                    <Box key={item.name} display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography variant="caption">{item.name}: {((item.value/28350)*100).toFixed(0)}%</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6">Currency Distribution</Typography>
              <Box height={340}>
                <ResponsiveContainer>
                  <BarChart data={currencyData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="volume" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Transactions Table */}
          <Grid item xs={12}>
            <Paper>
              <Box p={3} borderBottom="1px solid #f3f4f6">
                <Typography variant="h6">Recent Transactions</Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#f9fafb' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Transaction ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Route</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactionList.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{row.id}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {row.type === 'Outbound' ? <ArrowUpRight size={16} color="orange" /> : <ArrowDownLeft size={16} color="green" />}
                            {row.type}
                          </Box>
                        </TableCell>
                        <TableCell>{row.route}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{row.amount}</TableCell>
                        <TableCell>
                          <Chip 
                            label={row.status} 
                            size="small" 
                            color={row.status === 'completed' ? 'success' : row.status === 'failed' ? 'error' : 'warning'}
                            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell color="text.secondary">{row.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Bottom Summary Chips */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2.5, bgcolor: '#3b82f6', color: 'white' }}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Average Transaction Value</Typography>
              <Typography variant="h5" fontWeight={800}>$344</Typography>
              <Typography variant="caption">+$23 from last month</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2.5, bgcolor: '#10b981', color: 'white' }}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Success Rate</Typography>
              <Typography variant="h5" fontWeight={800}>96.5%</Typography>
              <Typography variant="caption">+1.2% from last month</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2.5, bgcolor: '#8b5cf6', color: 'white' }}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Pending Verifications</Typography>
              <Typography variant="h5" fontWeight={800}>3,180</Typography>
              <Typography variant="caption">-450 from last week</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2.5, bgcolor: '#f59e0b', color: 'white' }}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Avg. Processing Time</Typography>
              <Typography variant="h5" fontWeight={800}>2.3s</Typography>
              <Typography variant="caption">-0.5s improvement</Typography>
            </Paper>
          </Grid>

        </Grid>
      </Box>
    </ThemeProvider>
  );
}