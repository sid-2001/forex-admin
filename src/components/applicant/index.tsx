import React, { useState } from 'react'
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridFilterModel,
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
import { KycService } from '@/services/kyc.service'

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
  const kyc_service = new KycService()
  const userCountry = local_service?.get_staff_country()
  const navigate = useNavigate()

  // Rows
  const rows = data.map((item) => ({
    id: item.applicant.applicantId,
    ...item.applicant,
    email: item?.applicantContactDetails?.find((contactItem: any) => contactItem.contactType === 'email')?.contactDetails,
    phone: item?.applicantContactDetails?.find((contactItem: any) => contactItem.contactType === 'phone')?.contactDetails,
  }))

  // 🧹 Filter model state
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })

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

        {/* Reset Filters */}
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<FindReplaceIcon />}
          onClick={() => setFilterModel({ items: [] })}
          sx={{ ml: 1 }}
        >
          Reset Filters
        </Button>
      </GridToolbarContainer>
    )
  }

  // 🗂️ Columns
  const columns: GridColDef[] = [
    {
      field: 'applicantId',
      headerName: 'Customer ID',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(`/customer-details/${params.value}`)}>
          {params.value}
        </span>
      ),
    },
    { field: 'platformReferenceId', headerName: 'Lulu Customer ID', flex: 1, headerClassName: 'super-app-theme--header' },

    { field: 'firstName', headerName: 'First Name', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'lastName', headerName: 'Last Name', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'username', headerName: 'Username', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'gender',
      headerName: 'Gender',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      valueGetter: (_value, row) => {
        if (row.gender === 'M') return 'Male'
        if (row.gender === 'F') return 'Female'
        return ''
      },
    },
    { field: 'dob', headerName: 'DOB', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'phone',
      headerName: 'Phone No',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'active',
      headerName: 'Active/Inactive',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (params.row.activeStatus ? 'Active' : 'Inactive'),
    },
    {
      field: 'kycStatus',
      headerName: 'KYC Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => convertStrToTitleCase(params.row.kycStatus),
    },
    {
      field: 'amlKycStatus',
      headerName: 'AML Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => convertStrToTitleCase(params.row.amlKycStatus),
    },
  ]

  const filteredColumns = userCountry !== 'UAE' ? columns.filter((item) => item.field !== 'platformReferenceId') : columns

  const changeBetaStatus = async (id: any) => {
    const response = await kyc_service.updateBetaStatus(id)

    setTimeout(() => {
      window.location.reload()
    }, 3000)
    console.log(response)
  }

  return (
    <Box
      sx={{
        height: '70vh',
        '& .super-app-theme--header': {
          backgroundColor: '#005099',
          color: 'white',
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={filteredColumns}
        filterModel={filterModel}
        onFilterModelChange={(model) => setFilterModel(model)}
        initialState={{
          pagination: { paginationModel: { pageSize: 20, page: 0 } },
        }}
        pageSizeOptions={[10, 20, 50]}
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
