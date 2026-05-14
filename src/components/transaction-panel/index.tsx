import React, { useState, useEffect } from 'react'
import { Box, Grid, Button, CircularProgress, Alert } from '@mui/material'
import { AgCharts } from 'ag-charts-react'
import staticdataService from '@/services/staticdata.service'
import { useTheme } from '@mui/material/styles'
import { LocalStorageService } from '@/helpers/local-storage-service'

const TransactionPanel = () => {
  const [year, setYear] = useState(new Date().getFullYear())
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [dailyData, setDailyData] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [yearsData, setYearsData] = useState<any[]>([])
  let static_service = new staticdataService()
  let local_service = new LocalStorageService()
  const theme = useTheme()

  useEffect(() => {
    fetchMonthlyData(year)
  }, [year])

  useEffect(() => {
    console.log(local_service.get_staff_country())
  }, [])
  // ✅ Updated: fetch monthly data for a given year
  const fetchMonthlyData = async (selectedYear: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await static_service.getTransactionYearlyData(local_service.get_staff_country(), selectedYear)
      setMonthlyData(res?.data || [])
      setSelectedMonth(null)
      setYear(selectedYear) // update selected year
    } catch (err: any) {
      setError(err.message || 'Failed to fetch monthly data')
    } finally {
      setLoading(false)
    }
  }

  const fetchDailyData = async (month: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await static_service.getTransactionMonthlyData(local_service.get_staff_country(), month.toUpperCase(), year)
      setDailyData(res?.data || [])
      setSelectedMonth(month)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch daily data')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setSelectedMonth(null)
    setDailyData([])
  }

  // Data shaping for charts
  const chartData = (selectedMonth ? dailyData : monthlyData).map((item: any) => ({
    name: selectedMonth ? new Date(item.date).getDate().toString() : item.dayOrMonth.slice(0, 3),
    transactions: selectedMonth ? item.transactionCount : item.totalCount,
    amount: item.totalAmount,
  }))

  const fetchYearlyData = async () => {
    setLoading(true)
    try {
      const lastYear = new Date().getFullYear() - 1
      const secondLastYear = new Date().getFullYear() - 2
      const currentYear = new Date().getFullYear()

      const res2023 = await static_service.getTransactionYearlyData(local_service.get_staff_country(), secondLastYear)
      const res2024 = await static_service.getTransactionYearlyData(local_service.get_staff_country(), lastYear)
      const res2025 = await static_service.getTransactionYearlyData(local_service.get_staff_country(), currentYear)

      setYearsData([
        {
          year: secondLastYear,
          totalCount: res2023?.data?.reduce((a: any, b: any) => a + b.totalCount, 0),
          totalAmount: res2023?.data?.reduce((a: any, b: any) => a + b.totalAmount, 0),
        },
        {
          year: lastYear,
          totalCount: res2024?.data?.reduce((a: any, b: any) => a + b.totalCount, 0),
          totalAmount: res2024?.data?.reduce((a: any, b: any) => a + b.totalAmount, 0),
        },
        {
          year: currentYear,
          totalCount: res2025?.data?.reduce((a: any, b: any) => a + b.totalCount, 0),
          totalAmount: res2025?.data?.reduce((a: any, b: any) => a + b.totalAmount, 0),
        },
      ])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch yearly data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchYearlyData()
  }, [])

  const barOptions = {
    background: { fill: 'transparent' },
    title: { text: 'Yearly Transactions', color: theme.palette.text.primary },
    data: yearsData,
    series: [
      { type: 'bar', xKey: 'year', yKey: 'totalCount', yName: 'Transactions' },
      { type: 'bar', xKey: 'year', yKey: 'totalAmount', yName: 'Amount' },
    ],
    axes: [
      {
        type: 'category',
        position: 'bottom',
        label: { color: theme.palette.text.primary },
      },
      {
        type: 'number',
        position: 'left',
        label: { color: theme.palette.text.primary },
      },
    ],
  }

  const lineOptions = {
    background: { fill: 'transparent' },
    title: {
      text: selectedMonth ? `${selectedMonth} Daily Trends` : `${year} Monthly Trends`,
      color: theme.palette.text.primary,
    },
    data: chartData,
    series: [
      { type: 'line', xKey: 'name', yKey: 'transactions', yName: 'Transactions' },
      { type: 'line', xKey: 'name', yKey: 'amount', yName: 'Amount' },
    ],
    axes: [
      {
        type: 'category',
        position: 'bottom',
        label: { color: theme.palette.text.primary },
      },
      {
        type: 'number',
        position: 'left',
        label: { color: theme.palette.text.primary },
      },
    ],
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Box sx={{ height: 300 }}>
      {selectedMonth && (
        <Button onClick={handleBack} sx={{ mb: 2 }}>
          Back to Months
        </Button>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ cursor: 'pointer' }}>
            <AgCharts
              options={{
                ...barOptions,
                listeners: {
                  //@ts-ignore
                  nodeClick: (event: any) => {
                    if (event?.datum?.year) {
                      fetchMonthlyData(event.datum.year) // ✅ drill into year → months
                    }
                  },
                },
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 250 }}>
            <AgCharts
              //@ts-ignore
              options={lineOptions}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TransactionPanel
