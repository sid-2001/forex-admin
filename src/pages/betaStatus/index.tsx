import { useCallback, useEffect, useState } from 'react'
import { Box, Typography, Button, Switch } from '@mui/material'
import { ApplicantService } from '@/services/applicant.service' // Assuming you have this service
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridFilterModel,
} from '@mui/x-data-grid'
import 'jspdf-autotable'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import { convertStrToTitleCase } from '@/contants/utils'
import { KycService } from '@/services/kyc.service'
import { useNavigate } from 'react-router-dom'
import LoaderUI from '@/components/loader/loader'
import ConfirmationModal from '@/components/logout/logout.component'

const BetaStatus = () => {
  const [applicantList, setapplicantList] = useState([])
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [openConfirmModal, setOpenConfirmModal] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const applicant_service = new ApplicantService()
  const local_service = new LocalStorageService()
  const kyc_service = new KycService()
  const navigate = useNavigate()
  const userCountry = local_service?.get_staff_country()

  const getApplicantListByCountry = useCallback(async () => {
    try {
      setIsLoading(true)
      const data: any = await applicant_service.getApplicantDetalisByCountry(userCountry)

      const rows = data.map((item: any) => ({
        id: item?.applicant?.applicantId,
        ...item?.applicant,
        email: item?.applicantContactDetails?.find((contactItem: any) => contactItem.contactType === 'email')?.contactDetails,
        phone: item?.applicantContactDetails?.find((contactItem: any) => contactItem.contactType === 'phone')?.contactDetails,
        betaStatus: item?.betaStatus,
      }))
      setapplicantList(rows)
      setIsLoading(false)
    } catch (error) {
      console.log(error)
    }
  }, [])

  useEffect(() => {
    getApplicantListByCountry()
  }, [])

  // 📂 CSV Export
  const downloadCSV = () => {
    if (!applicantList || applicantList.length === 0) return

    const headers = columns.map((col: any) => col.headerName)
    const csvRows = [headers.join(','), ...applicantList.map((row: any) => columns.map((col: any) => `"${row[col.field] || ''}"`).join(','))].join(
      '\n',
    )

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'applicants.csv')
    link.click()
  }

  // 📄 PDF Export
  const downloadPDF = () => {
    if (!applicantList || applicantList.length === 0) return

    // 🔹 Headers (DataGrid ke columns)
    const headers = columns.map((col) => col.headerName || col.field)

    // 🔹 Body
    const body: any = applicantList.map((row) => columns.map((col) => row[col.field as keyof typeof row]))

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
    {
      field: 'betaStatus',
      headerName: 'Beta Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Switch
          checked={params.value}
          onChange={() => {
            setOpenConfirmModal(true)
            setSelectedRow(params.row)
          }}
        />
      ),
    },
  ]

  const filteredColumns = userCountry !== 'UAE' ? columns.filter((item) => item.field !== 'platformReferenceId') : columns

  const changeBetaStatus = async (id: any) => {
    try {
      const response = await kyc_service.updateBetaStatus(id)
      console.log(response, '99999')
      if (response?.status === 200) {
        setOpenConfirmModal(false)
        window.location.reload()
      }
    } catch (err) {
      console.log(err)
    }
  }

  const mapConfirmMessage = () => {
    return selectedRow?.betaStatus ? 'Do you want to Inactivate beta status of the customer?' : 'Do you want to Activate beta status of the customer?'
  }

  return (
    <Box sx={{ width: '90vw', height: '70vh' }}>
      <HasPermission permission={'canRead'} module={local_service.get_modules()?.CUSTOMER}>
        <Typography variant="h4" gutterBottom>
          <strong>Allow Customers To Become Beta Tester</strong>
        </Typography>

        <DataGrid
          rows={applicantList}
          columns={filteredColumns}
          filterModel={filterModel}
          onFilterModelChange={(model) => setFilterModel(model)}
          initialState={{
            pagination: { paginationModel: { pageSize: 20, page: 0 } },
          }}
          pageSizeOptions={[10, 20, 50]}
          loading={isLoading}
          slots={{
            loadingOverlay: LoaderUI.LoadingOverlay,
            toolbar: CustomToolbar, // 👈 Toolbar with reset filters
          }}
          disableColumnMenu
        />

        {openConfirmModal && (
          <ConfirmationModal
            message={mapConfirmMessage()}
            handleClose={() => {
              setOpenConfirmModal(!openConfirmModal)
            }}
            handleConfirm={() => {
              changeBetaStatus(selectedRow?.id)
            }}
            showIcon={false}
            confirmBtnText={selectedRow?.betaStatus ? 'Inactivate' : 'Activate'}
            isOpen={openConfirmModal}
          />
        )}
      </HasPermission>
    </Box>
  )
}

export default BetaStatus
