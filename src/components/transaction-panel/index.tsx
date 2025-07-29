import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import { Close, ArrowBack } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import staticdataService from '@/services/staticdata.service';


const TransactionModal = ({ open, onClose }) => {
  const [year, setYear] = useState(2025);
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'
  let static_service=new staticdataService()
  // Fetch monthly data when year changes
  useEffect(() => {
    if (open) {
      fetchMonthlyData();
    }
  }, [year, open]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    setError(null);



    try {
  static_service.getTransactionYearlyData("ZA",year).then(data=>{
  console.log(data)
    setMonthlyData(data?.data);
})
  
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyData = async (month:string) => {
    setLoading(true);
    setError(null);
    try {
        static_service.getTransactionMonthlyData("ZA",month.toUpperCase(),year).then(data=>{

              setDailyData(data.data);
        setSelectedMonth(month);
        })
    
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMonths = () => {
    setSelectedMonth(null);
    setDailyData([]);
    setViewMode('table');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-ZA', options);
  };

  // Prepare chart data
  const monthlyChartData = monthlyData.map(month => ({
    name: month.dayOrMonth.slice(0, 3),
    transactions: month.totalCount,
    amount: month.totalAmount
  }));

  const dailyChartData = dailyData.map(day => ({
    name: new Date(day.date).getDate().toString(),
    transactions: day.transactionCount,
    amount: day.totalAmount
  }));

  return (
    <Modal open={open} onClose={()=>{

        
    }}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 1200,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            {selectedMonth ? `${selectedMonth} ${year} Transactions` : `Transaction Summary - ${year}`}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {selectedMonth && (
              <Button 
                startIcon={<ArrowBack />}
                onClick={handleBackToMonths}
                sx={{ mb: 2 }}
              >
                Back to Months
              </Button>
            )}

            <Tabs 
              value={viewMode} 
              onChange={(e, newValue) => setViewMode(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="Table View" value="table" />
              <Tab label="Chart View" value="chart" />
            </Tabs>

            {viewMode === 'table' ? (
              selectedMonth ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Transaction Count</TableCell>
                        <TableCell align="right">Total Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dailyData.map((day) => (
                        <TableRow key={day.date}>
                          <TableCell>{formatDate(day.date)}</TableCell>
                          <TableCell align="right">{day.transactionCount}</TableCell>
                          <TableCell align="right">{formatCurrency(day.totalAmount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={year}
                      label="Year"
                      onChange={(e) => setYear(e.target.value)}
                    >
                      <MenuItem value={2023}>2023</MenuItem>
                      <MenuItem value={2024}>2024</MenuItem>
                      <MenuItem value={2025}>2025</MenuItem>
                    </Select>
                  </FormControl>

                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Month</TableCell>
                          <TableCell align="right">Transaction Count</TableCell>
                          <TableCell align="right">Total Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {monthlyData.map((month:any) => (
                          <TableRow 
                            key={month.dayOrMonth}
                            hover
                            onClick={() => fetchDailyData(month.dayOrMonth)}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                          >
                            <TableCell>{month.dayOrMonth}</TableCell>
                            <TableCell align="right">{month.totalCount}</TableCell>
                            <TableCell align="right">{formatCurrency(month.totalAmount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )
            ) : (
              <Box sx={{ height: 500 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={selectedMonth ? dailyChartData : monthlyChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'transactions' ? value : formatCurrency(value),
                        name === 'transactions' ? 'Transaction Count' : 'Total Amount'
                      ]}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="transactions" 
                      name="Transaction Count" 
                      fill="#8884d8" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="amount" 
                      name="Total Amount" 
                      fill="#82ca9d" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </>
        )}
      </Box>
    </Modal>
  );
};

export default TransactionModal;