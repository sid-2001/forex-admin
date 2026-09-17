import React, { useState, useMemo } from 'react'
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridLogicOperator,
  GridFilterModel,
  GridFilterItem,
} from '@mui/x-data-grid'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Tooltip, Switch } from '@mui/material'
import LoaderUI from '@/components/loader/loader'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import 'jspdf-autotable'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { convertStrToTitleCase } from '@/contants/utils'
import { HelperService } from '@/helpers/helper'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

interface Applicant {
  applicantId: string
  firstName: string
  lastName: string
  gender: string
  dob: string
  residenceCountry: string
  applicantCreatedDate: string
  email: string
  phone: string
}
interface ContactDetails {
  applicant: string
  applicantContactDetailsId: string
  contactCountryCode: string
  contactDetails: string
  contactType: string
}

interface Props {
  data: {
    applicant: Applicant
    applicantContactDetails: ContactDetails[]
  }[]
  loading: boolean
}

const ApplicantDataGrid: React.FC<Props> = ({ data, loading }) => {
  const local_service = new LocalStorageService()
  const helper = new HelperService()
  const userCountry = local_service?.get_staff_country()
  const navigate = useNavigate()

  const [dateFilters, setDateFilters] = useState<{
    fromDate: dayjs.Dayjs | null
    toDate: dayjs.Dayjs | null
  }>({
    fromDate: null,
    toDate: null,
  })

  const [gridFilters, setGridFilters] = useState<GridFilterModel>({
    items: [],
    logicOperator: GridLogicOperator.And,
  })

  // Rows
  const rows = data.map((item) => ({
    id: item.applicant.applicantId,
    ...item.applicant,
    email: item?.applicantContactDetails?.find((contactItem: any) => contactItem.contactType === 'email')?.contactDetails,
    phone: item?.applicantContactDetails?.find((contactItem: any) => contactItem.contactType === 'phone')?.contactDetails,
  }))

  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    logicOperator: GridLogicOperator.And,
  })

  // 📂 CSV Export
  const downloadCSV = () => {
    if (!rows || rows.length === 0) return

    const headers = columns.map((col: any) => col.headerName)
    const csvRows = [headers.join(','), ...rows.map((row: any) => columns.map((col: any) => `"${row[col.field] || ''}"`).join(','))].join('\n')

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'applicants.csv')
    link.click()
  }

  // 📄 PDF Export
  const downloadPDF = () => {
    if (!rows || rows.length === 0) return

    // 🔹 Headers (DataGrid ke columns)
    const headers = columns.map((col) => col.headerName || col.field)

    // 🔹 Body
    const body: any = rows.map((row) => columns.map((col) => row[col.field as keyof typeof row]))

    const title = 'Applicants'
    const doc = new jsPDF({ unit: 'pt' })
    doc.setFontSize(14)
    doc.text(`${title} Report`, 40, 40)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 56)

    autoTable(doc, {
      head: [headers],
      body,
      startY: 72,
      margin: { left: 40, right: 40, top: 40, bottom: 40 },
      styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak' },
      headStyles: { fillColor: [0, 80, 153], textColor: 255 },
      didDrawPage: () => {
        const w = doc.internal.pageSize.getWidth()
        const h = doc.internal.pageSize.getHeight()
        doc.setFontSize(9)
        doc.text(`Page ${doc.getNumberOfPages()}`, w - 60, h - 20)
      },
    })

    doc.save(`applicants_${title}_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  const buildDateFilters = (fromDate: dayjs.Dayjs | null, toDate: dayjs.Dayjs | null): GridFilterItem[] => {
    const filters: GridFilterItem[] = []

    if (fromDate) {
      filters.push({
        id: 'date-from',
        field: 'createdLocalDateTime',
        operator: 'onOrAfter',
        value: fromDate.startOf('day').toISOString(),
      })
    }

    if (toDate) {
      filters.push({
        id: 'date-to',
        field: 'createdLocalDateTime',
        operator: 'before',
        value: toDate.add(1, 'day').startOf('day').toISOString(),
      })
    }

    return filters
  }

  const combinedFilterModel = useMemo<GridFilterModel>(() => {
    const dateFilterItems = buildDateFilters(dateFilters.fromDate, dateFilters.toDate)

    return {
      items: [...gridFilters.items, ...dateFilterItems],
      logicOperator: GridLogicOperator.And,
    }
  }, [gridFilters, dateFilters.fromDate, dateFilters.toDate])

  const handleFromDateChange = (value: dayjs.Dayjs | null) => {
    setDateFilters((prev) => ({
      ...prev,
      fromDate: value,
    }))
  }

  const handleToDateChange = (value: dayjs.Dayjs | null) => {
    setDateFilters((prev) => ({
      ...prev,
      toDate: value,
    }))
  }

  // 🛠️ Custom Toolbar
  const CustomToolbar = () => {
    return (
      <GridToolbarContainer sx={{ justifyContent: 'flex-start', gap: 1, py: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        {/* Export CSV */}
        <Button variant="outlined" color="primary" size="small" startIcon={<DownloadIcon />} onClick={downloadCSV} sx={{ ml: 1 }}>
          CSV
        </Button>
        {/* Export PDF */}
        <Button variant="outlined" color="primary" size="small" startIcon={<PictureAsPdfIcon />} onClick={downloadPDF} sx={{ ml: 1 }}>
          PDF
        </Button>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="From Date"
            format="YYYY-MM-DD"
            value={dateFilters.fromDate}
            onChange={handleFromDateChange}
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: 150 },
              },
            }}
          />

          <DatePicker
            label="To Date"
            format="YYYY-MM-DD"
            value={dateFilters.toDate}
            minDate={dateFilters.fromDate ?? undefined}
            onChange={handleToDateChange}
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: 150 },
              },
            }}
          />
        </LocalizationProvider>
        {/* Reset Filters */}
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<FindReplaceIcon />}
          //  onClick={() => setFilterModel({ items: [] })}
          onClick={resetFilters}
          sx={{ ml: 1 }}
        >
          Reset Filters
        </Button>
      </GridToolbarContainer>
    )
  }

  const resetFilters = () => {
    setDateFilters({
      fromDate: null,
      toDate: null,
    })

    setGridFilters({
      items: [],
      logicOperator: GridLogicOperator.And,
    })
  }

  // 🗂️ Columns
  const columns: GridColDef[] = [
    {
      field: 'applicantId',
      headerName: 'Customer ID',
      width: 200,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(`/customer-details/${params.value}`)}>
          {params.value}
        </span>
      ),
    },
    {
      field: 'platformReferenceId',
      headerName: 'Lulu Customer ID',
      headerClassName: 'super-app-theme--header',
      width: 200,
    },

    {
      field: 'firstName',
      headerName: 'First Name',
      headerClassName: 'super-app-theme--header',
      width: 150,
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      headerClassName: 'super-app-theme--header',
      width: 150,
    },
    {
      field: 'username',
      headerName: 'Username',
      headerClassName: 'super-app-theme--header',
      width: 120,
    },
    {
      field: 'gender',
      headerName: 'Gender',
      headerClassName: 'super-app-theme--header',
      valueGetter: (_value, row) => {
        if (row.gender === 'M') return 'Male'
        if (row.gender === 'F') return 'Female'
        return ''
      },
      width: 100,
    },
    {
      field: 'dob',
      headerName: 'DOB',
      headerClassName: 'super-app-theme--header',
      width: 100,
    },
    {
      field: 'email',
      headerName: 'Email',
      headerClassName: 'super-app-theme--header',
      width: 250,
    },
    {
      field: 'phone',
      headerName: 'Phone No',
      headerClassName: 'super-app-theme--header',
      width: 150,
    },
    {
      field: 'nationality',
      headerName: 'Nationality',
      headerClassName: 'super-app-theme--header',
      width: 150,
    },

    {
      field: 'active',
      headerName: 'Active/Inactive',
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (params.row.activeStatus ? 'Active' : 'Inactive'),
      width: 100,
    },
    {
      field: 'kycStatus',
      headerName: 'KYC Status',
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => convertStrToTitleCase(params.row.kycStatus),
      width: 100,
    },
    {
      field: 'amlKycStatus',
      headerName: 'AML Status',
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => convertStrToTitleCase(params.row.amlKycStatus),
      width: 100,
    },
    {
      // field: 'createdLocalDateTime',
      // headerName: 'Date',
      // width: 150,
      // headerClassName: 'super-app-theme--header',
      // valueGetter: (_value, row) => helper.convertDateAndTime(row?.createdLocalDateTime),

      field: 'createdLocalDateTime',
      headerName: 'Date',
      width: 180,
      //type: 'dateTime',
      headerClassName: 'super-app-theme--header',

      valueGetter: (_value, row) => {
        if (!row.createdLocalDateTime) {
          return null
        }

        return new Date(row.createdLocalDateTime)
      },

      valueFormatter: (value) => {
        if (!value) {
          return ''
        }

        return helper.convertDateAndTime(value)
      },
    },
  ]

  const filteredColumns = userCountry !== 'UAE' ? columns.filter((item) => item.field !== 'platformReferenceId') : columns

  return (
    <Box height={'75vh'}>
      <DataGrid
        rows={rows}
        columns={filteredColumns}
        filterModel={combinedFilterModel}
        onFilterModelChange={(model) => {
          setGridFilters({
            ...model,
            items: model.items.filter((item) => item.field !== 'createdLocalDateTime'),
          })
        }}
        initialState={{
          pagination: { paginationModel: { pageSize: 20, page: 0 } },
        }}
        pageSizeOptions={[10, 20, 50, 100]}
        loading={loading}
        slots={{
          loadingOverlay: LoaderUI.LoadingOverlay,
          toolbar: CustomToolbar, // 👈 Toolbar with reset filters
        }}
        disableColumnMenu
      />
    </Box>
  )
}

export default ApplicantDataGrid
