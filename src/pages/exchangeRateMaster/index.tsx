import { useEffect, useState, useMemo } from 'react'
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import ExchangeRateService, { IExchangeRate } from '@/services/exchangerate.service'
import VendorApiService from '@/services/vendor.api.service'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import DownloadIcon from '@mui/icons-material/Download'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'

export default function ExchangeRateMasterScreen() {
  const rate_service = new ExchangeRateService()
  const vendor_service = new VendorApiService()
  const local_service = new LocalStorageService()

  const [vendorsList, setVendorsList] = useState([])
  const [dropdownValues, setDropdownValues] = useState({ sourceCountry: [], sourceCurrency: [], targetCountry: [], targetCurrency: [] })
  const [filters, setFilters] = useState({
    sourceCountry: '',
    sourceCurrency: '',
    targetCountry: '',
    targetCurrency: '',
    vendorCode: '',
    fromDate: null,
    toDate: null,
  })
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<any>({})

  const isFilterEmpty =
    !filters.sourceCountry &&
    !filters.sourceCurrency &&
    !filters.targetCountry &&
    !filters.targetCurrency &&
    !filters.vendorCode &&
    !filters.fromDate &&
    !filters.toDate

  const [rows, setRows] = useState<IExchangeRate[]>([])
  const [loading, setLoading] = useState(false)
  const [vendorNamesMapping, setVendorNamesMapping] = useState<any>({})

  const fetchVendorsByType = async () => {
    const res: any = await vendor_service.getExchangeRateVendorsList()
    const vendorNames = res.reduce((acc: any, vendor: any) => {
      //@ts-ignore
      acc[vendor.vendorCode] = vendor.vendorName
      return acc
    }, {})
    console.log(vendorNames, 'names')
    setVendorsList(res || [])
    setVendorNamesMapping(vendorNames)
  }

  const fetchFilterValues = async () => {
    const res: any = await rate_service.getDistinctDropdownValues()
    setDropdownValues(res || {})
  }

  const fetchRateListingData = async (filterValue: string) => {
    const data = await rate_service.getExchangeRateList(filterValue)
    setRows(data || [])
  }

  useEffect(() => {
    fetchVendorsByType()
    fetchRateListingData('')
    fetchFilterValues()
  }, [])

  const handleFilterValueChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSearch = async () => {
    const payload = {
      ...filters,
      fromDate: filters.fromDate ? dayjs(filters.fromDate).format('YYYY-MM-DD HH:mm:ss.SSS') : '',
      toDate: filters.toDate ? dayjs(filters.toDate).format('YYYY-MM-DD HH:mm:ss.SSS') : '',
    }
    const queryString = new URLSearchParams(Object.fromEntries(Object.entries(payload).filter(([_, v]) => v))).toString()
    try {
      setLoading(true)
      await fetchRateListingData(queryString)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setFilters({
      sourceCountry: '',
      sourceCurrency: '',
      targetCountry: '',
      targetCurrency: '',
      vendorCode: '',
      fromDate: null,
      toDate: null,
    })
    fetchRateListingData('')
  }

  const columns: GridColDef[] = [
    {
      field: 'vendorName',
      headerName: 'Vendor Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <span>
          {vendorNamesMapping[params.row.vendorCode]} {params.row.vendorCode ? `(${params.row.vendorCode})` : ''}
        </span>
      ),
    },
    { field: 'sourceCountry', headerName: 'Source Country', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'sourceCurrency', headerName: 'Source Currency', flex: 0.6, headerClassName: 'super-app-theme--header' },
    { field: 'targetCountry', headerName: 'Target Country', flex: 0.6, headerClassName: 'super-app-theme--header' },
    { field: 'targetCurrency', headerName: 'Target Currency', flex: 0.6, headerClassName: 'super-app-theme--header' },
    { field: 'rate', headerName: 'Rate', flex: 0.6, headerClassName: 'super-app-theme--header' },
    {
      field: 'createdLocaldatetime',
      headerName: 'Created Date',
      flex: 0.6,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (params.row?.createdLocaldatetime ? dayjs(params.row?.createdLocaldatetime).format('YYYY-MM-DD') : ''),
    },
  ]

  const handleExportCSV = () => {
    const visibleCols = columns.filter((col) => columnVisibilityModel[col.field] !== false)
    const headers = visibleCols.map((col) => col.headerName).join(',')
    //@ts-ignore
    const mappedRows = rows.map((row) => visibleCols.map((col) => row[col.field] ?? '').join(','))
    const csv = [headers, ...mappedRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'ExchangeRate.csv')
    link.click()
  }

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={2} sx={{ width: '85vw' }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.02em',
            display: 'grid',
            placeItems: 'center',
            mb: 5,
            color: '#0061B1',
          }}
        >
          Exchange Rate List
        </Typography>

        <Box
          mb={2}
          display="flex"
          gap={1}
          alignItems="center"
          flexWrap="wrap"
          sx={{
            background: '#fff',
            padding: 2,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <FormControl sx={{ minWidth: 160 }} size="small">
            <InputLabel id="vendor-label">Select Vendor</InputLabel>
            <Select
              labelId="vendor-label"
              value={filters?.vendorCode}
              //@ts-ignore
              onChange={(e) => handleFilterValueChange('vendorCode', e.target.value)}
              label="Select Vendor"
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
              {vendorsList &&
                vendorsList.length > 0 &&
                //@ts-ignore
                vendorsList.map((item: any, index: number) => (
                  <MenuItem key={index} value={item.vendorCode}>
                    {item.vendorName} ({item.vendorCode})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 210 }} size="small">
            <InputLabel id="source-country-label">Select Source Country</InputLabel>
            <Select
              labelId="source-country-label"
              value={filters?.sourceCountry}
              //@ts-ignore
              onChange={(e) => handleFilterValueChange('sourceCountry', e.target.value)}
              label="Select Source Country"
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
              {dropdownValues &&
                dropdownValues?.sourceCountry &&
                //@ts-ignore
                dropdownValues?.sourceCountry.map((item: any, index: number) => (
                  <MenuItem key={index} value={item}>
                    {item}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 210 }} size="small">
            <InputLabel id="target-country-label">Select Target Country</InputLabel>
            <Select
              labelId="target-country-label"
              value={filters?.targetCountry}
              //@ts-ignore
              onChange={(e) => handleFilterValueChange('targetCountry', e.target.value)}
              label="Select Target Country"
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
              {dropdownValues &&
                dropdownValues?.targetCountry &&
                //@ts-ignore
                dropdownValues?.targetCountry.map((item: any, index: number) => (
                  <MenuItem key={index} value={item}>
                    {item}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 210 }} size="small">
            <InputLabel id="source-currency-label">Select Source Currency</InputLabel>
            <Select
              labelId="source-currency-label"
              value={filters?.sourceCurrency}
              //@ts-ignore
              onChange={(e) => handleFilterValueChange('sourceCurrency', e.target.value)}
              label="Select Source Currency"
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
              {dropdownValues &&
                dropdownValues?.sourceCurrency &&
                //@ts-ignore
                dropdownValues?.sourceCurrency.map((item: any, index: number) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 210 }} size="small">
            <InputLabel id="target-country-label">Select Target Currency</InputLabel>
            <Select
              labelId="target-currency-label"
              value={filters?.targetCurrency}
              //@ts-ignore
              onChange={(e) => handleFilterValueChange('targetCurrency', e.target.value)}
              label="Select Target Currency"
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
              {dropdownValues &&
                dropdownValues?.targetCurrency &&
                //@ts-ignore
                dropdownValues?.targetCurrency.map((item: any, index: number) => (
                  <MenuItem key={index} value={item}>
                    {item}
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

          <Button variant="contained" onClick={handleSearch} disabled={isFilterEmpty || loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>

          <Button disabled={loading} variant="outlined" onClick={handleClear}>
            Clear
          </Button>

          <Button variant="outlined" color="primary" size="small" startIcon={<DownloadIcon />} onClick={handleExportCSV}>
            Export
          </Button>

          <Box
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          ></Box>
        </Box>

        <DataGrid
          rows={rows}
          getRowId={(row) => row.id}
          columns={columns}
          autoHeight
          pageSizeOptions={[5]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5, // Default to 5
              },
            },
          }}
        />
      </Box>
    </HasPermission>
  )
}
