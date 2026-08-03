import React, { useEffect, useState } from 'react'
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridFilterModel } from '@mui/x-data-grid'
import { Box, Typography, Button, Stack, IconButton } from '@mui/material'
import { HelperService } from '@/helpers/helper'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import LoaderUI from '@/components/loader/loader'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useRecoilState } from 'recoil'
import { alertState, alertTextState, alertTypeState } from '@/states/state'
import EditIcon from '@mui/icons-material/Edit'
import MasterService from '@/services/master.service'
import FAQHeadDialog from '@/components/faq-head-dialog'
import { styled } from '@mui/material/styles'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionSummary, { AccordionSummaryProps, accordionSummaryClasses } from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import DeleteIcon from '@mui/icons-material/Delete'

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}))

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />} {...props} />
))(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]: {
    transform: 'rotate(90deg)',
  },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1),
  },
  ...theme.applyStyles('dark', {
    backgroundColor: 'rgba(255, 255, 255, .05)',
  }),
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}))

const Faq: React.FC = () => {
  const [faqData, setfaqData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const helper = new HelperService()
  const local_service = new LocalStorageService()
  const masterService = new MasterService()
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>({})
  const apiRef = React.useRef<any>(null)

  const [openFaqHeadModal, setOpenFaqHeadModal] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [, setOpen] = useRecoilState(alertState)
  const [, setText] = useRecoilState(alertTextState)
  const [, setType] = useRecoilState(alertTypeState)

  const [expanded, setExpanded] = React.useState<string | false>('panel1')

  const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    console.log(event, '===========')
    setExpanded(newExpanded ? panel : false)
  }

  const showAlert = (t: 'success' | 'error', m: string) => {
    setType(t)
    setText(m)
    setOpen(true)
  }

  useEffect(() => {
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      setIsLoading(true)
      const response = await masterService.getAllFaq()
      setfaqData(response?.data)
      setIsLoading(false)
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const columns = [
    {
      field: 'faqHeadCode',
      headerName: 'FAQ Head Code',
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'faqChannel',
      headerName: 'Channel',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'faqQuestion',
      headerName: 'FAQ Question',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'faqSectionDescription',
      headerName: 'FAQ Section Description',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'faqSectionLabelName',
      headerName: 'FAQ Section Label Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'faqSubSectionDescription',
      headerName: 'FAQ Sub Section Description',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'faqSubSectionLabelName',
      headerName: 'FAQ Sub Section Label Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'faqType',
      headerName: 'FAQ Type',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'countryCode',
      headerName: 'Country Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'createdLocalDateTime',
      headerName: 'Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return helper.convertDateAndTime(params.row.createdLocalDateTime)
      },
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 120,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            color="primary"
            onClick={() => {
              setEditData(params.row)
              setOpenFaqHeadModal(true)
            }}
            disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canUpdate')}
          >
            <EditIcon />
          </IconButton>
        </Stack>
      ),
    },
  ]

  const getVisibleFilteredRows = () => {
    const visibleCols = columns.filter((col) => columnVisibilityModel[col.field] !== false && col.field !== 'action')

    const filteredRows = faqData.filter((row: any) =>
      filterModel.items.every((filter) => {
        if (!filter.value) return true
        const cellValue = row[filter.field]?.toString().toLowerCase() || ''
        return cellValue.includes(filter.value.toLowerCase())
      }),
    )

    return { visibleCols, filteredRows }
  }

  const handleExportCSV = () => {
    const { visibleCols, filteredRows } = getVisibleFilteredRows()

    if (!filteredRows.length) {
      alert('No matching rows to export!')
      return
    }

    const headers = visibleCols.map((col) => col.headerName).join(',')
    const rows = filteredRows.map((row: any) => visibleCols.map((col) => `"${row[col.field] || ''}"`).join(','))

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'faq.csv')
    link.click()
  }

  const handleExportPDF = () => {
    const { visibleCols, filteredRows } = getVisibleFilteredRows()

    if (!filteredRows.length) {
      alert('No matching rows to export!')
      return
    }

    const headers = visibleCols.map((col) => col.headerName)
    const data = filteredRows.map((row: any) => visibleCols.map((col) => row[col.field] || ''))

    const doc = new jsPDF({ unit: 'pt' })
    doc.setFontSize(14)
    doc.text('FAQ Report', 40, 40)
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 60,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [0, 80, 153], textColor: 255 },
    })
    doc.save('Faq.pdf')
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

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.MASTER_DATA}>
      <Box p={3} sx={{ width: '90vw', height: '80vh' }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0061B1', textAlign: 'center' }}>
            FAQ LISTING
          </Typography>

          <Box>
            <Button
              variant="contained"
              onClick={() => {
                setEditData(null)
                setOpenFaqHeadModal(true)
              }}
              sx={{ ml: 2 }}
              disabled={!helper.checkUserHasPermission(local_service.get_modules()?.MASTER_DATA, 'canCreate')}
            >
              Add
            </Button>
          </Box>
        </Stack>

        {/* <div>
          {faqData.map((faqItem: any, index: any) => (
            <Accordion key={index} expanded={expanded === faqItem.faqHeadCode} onChange={handleChange(faqItem.faqHeadCode)}>
              <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                <Box sx={{ direction: 'row', display: 'flex' }}>
                  <Typography variant="body1">{faqItem?.faqSectionLabelName}</Typography>
                  <Typography variant="body1">{faqItem?.faqSubSectionDescription}</Typography>
                  <Typography variant="body1">{faqItem?.faqQuestionCount}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {faqItem?.faqDetailMasters.map((faqDetail: any, ind: any) => (
                  <Box key={ind}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {faqDetail?.faqQuestion}
                    </Typography>
                    <Typography>{faqDetail?.faqAnswer}</Typography>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </div> */}
        <div className="faq-container">
          {faqData.map((faqItem: any, index: any) => (
            <Accordion
              key={index}
              expanded={expanded === faqItem.faqHeadCode}
              onChange={handleChange(faqItem.faqHeadCode)}
              sx={{
                marginBottom: '12px',
                boxShadow: 'none',
                border: '1px solid #e5e7eb',
                borderRadius: '8px !important',
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  borderColor: '#d1d5db',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                },
              }}
            >
              <AccordionSummary
                sx={{
                  padding: '14px 20px',
                  minHeight: 'auto',
                  '& .MuiAccordionSummary-content': {
                    margin: '0',
                    alignItems: 'center',
                  },
                  '& .MuiAccordionSummary-expandIconWrapper': {
                    color: '#6b7280',
                    marginLeft: '8px',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        fontSize: '15px',
                        color: '#111827',
                      }}
                    >
                      {faqItem?.faqSectionLabelName}
                    </Typography>

                    {faqItem?.faqSubSectionDescription && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#6b7280',
                          fontSize: '12px',
                          backgroundColor: '#f3f4f6',
                          padding: '2px 12px',
                          borderRadius: '12px',
                        }}
                      >
                        {faqItem?.faqSubSectionDescription}
                      </Typography>
                    )}

                    <Typography
                      variant="caption"
                      sx={{
                        color: '#6b7280',
                        fontSize: '12px',
                        backgroundColor: '#f3f4f6',
                        padding: '2px 12px',
                        borderRadius: '12px',
                      }}
                    >
                      {faqItem?.faqQuestionCount} Q&A
                    </Typography>
                  </Box>

                  {/* Edit Button */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle edit action here
                        console.log('Edit FAQ:', faqItem.faqHeadCode)
                      }}
                      sx={{
                        color: '#6b7280',
                        padding: '4px',
                        '&:hover': {
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                        },
                      }}
                    >
                      <EditIcon sx={{ fontSize: '18px' }} />
                    </IconButton>

                    {/* Optional: Delete button */}
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails
                sx={{
                  padding: '4px 20px 20px 20px',
                }}
              >
                {faqItem?.faqDetailMasters.map((faqDetail: any, ind: any) => (
                  <Box
                    key={ind}
                    sx={{
                      padding: '14px 0',
                      borderBottom: ind !== faqItem.faqDetailMasters.length - 1 ? '1px solid #f3f4f6' : 'none',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#111827',
                            marginBottom: '6px',
                          }}
                        >
                          {faqDetail?.faqQuestion}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: '#4b5563',
                            fontSize: '13px',
                            lineHeight: 1.7,
                          }}
                        >
                          {faqDetail?.faqAnswer}
                        </Typography>
                      </Box>

                      {/* Edit button for individual FAQ */}
                      {/* <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('Edit question:', faqDetail)
                        }}
                        sx={{
                          color: '#9ca3af',
                          padding: '4px',
                          marginLeft: '12px',
                          flexShrink: 0,
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                          },
                        }}
                      >
                        <EditIcon sx={{ fontSize: '16px' }} />
                      </IconButton> */}
                    </Box>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </div>

        <FAQHeadDialog
          open={openFaqHeadModal}
          editData={editData}
          onClose={() => setOpenFaqHeadModal(false)}
          refreshList={fetchFaqs}
          showAlert={showAlert}
        />
      </Box>
    </HasPermission>
  )
}

export default Faq
