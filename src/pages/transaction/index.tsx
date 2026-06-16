import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Typography, Chip, ToggleButton, ToggleButtonGroup, useTheme, IconButton, Modal } from '@mui/material'
import { DataGrid, GridColumnVisibilityModel, GridToolbarColumnsButton, GridToolbarFilterButton } from '@mui/x-data-grid'
import { useNavigate, useLocation } from 'react-router-dom'
import { TransactionInward, TransactionOutward } from '@/types/transaction.type'
import { PreviewOutlined } from '@mui/icons-material'
import { useRecoilState } from 'recoil'
import { alertState, loaderStateNew } from '@/states/state'
import CompliancTool from '@/components/compliance-tool'
import { HelperService } from '@/helpers/helper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { TransactionService } from '@/services/transaction.service'
import { ApplicantService } from '@/services/applicant.service'
import { statusColors } from '@/contants/utils'
import LoaderUI from '@/components/loader/loader'
import { GridToolbarContainer } from '@mui/x-data-grid'
import DownloadIcon from '@mui/icons-material/Download'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import React from 'react'
import { GridColDef, GridPaginationModel, GridFilterModel } from '@mui/x-data-grid'
import VisibilityIcon from '@mui/icons-material/Visibility'

const applicant_service = new ApplicantService()
const transaction_Service = new TransactionService()
const helper = new HelperService()
const local_service = new LocalStorageService()
const transaction_service = new TransactionService()
const userCountry = local_service?.get_staff_country()

const TransactionListing = () => {
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({})
  const [modalOpen, setmodalOpen] = useState(false)
  const [transactionType, setTransactionType] = useState('outwards')
  const [inboundTransaction, setInboundTransaction] = useState<Array<TransactionInward>>([])
  const [outboundTransaction, setOutboundTransaction] = useState<Array<TransactionOutward>>([])
  const [toolopen, setToolOpen] = useState(false)
  const [transactionData, setTransactionData] = useState(inboundTransaction)
  const [commonloader, setcommonloader] = useRecoilState(loaderStateNew)
  const [userList, setUserList] = useState([])
  const [stpErrors, setStpErrors] = useState<any>([])
  const [isLoading, setIsLoading] = useState(false)
  // pagination state
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: 0,
    pageSize: 100,
  })
  const [paginationInwardModel, setPaginationInwardModel] = React.useState<GridPaginationModel>({
    page: 1,
    pageSize: 100,
  })
  // filter state
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [],
  })

  const theme = useTheme()
  const navigate = useNavigate()
  const { search } = useLocation()
  const queryParams = new URLSearchParams(search)
  const flow = queryParams.get('flow')

  const columnHeaderMap: any = {
    UAE: 'Payment Details',
    DEFAULT: 'BOP',
  }

  const renderTransactionStatus = (transStatus: string) => {
    if (transStatus === 'IN_PROGRESS') {
      return 'IN PROGRESS'
    } else {
      return transStatus
    }
  }

  const columns_outward = [
    {
      field: 'id',
      headerName: 'Transaction ID',
      width: 200,
      sortable: false,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <span
          onClick={() => handleNavigation(`/transaction-detail/${params.value}`)}
          style={{
            cursor: 'pointer',
            color: theme.palette.text.primary,
            textDecoration: 'underline',
          }}
        >
          {params?.value}
        </span>
      ),
    },

    {
      field: 'transactionInwardNumber',
      headerName: 'Inward ID',
      width: 200,
      sortable: false,
      headerClassName: 'super-app-theme--header',
    },

    {
      field: 'destination',
      headerName: 'Destination',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'value',
      headerName: 'Principal Amount',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => params?.value?.toFixed(2),
    },
    {
      field: 'principalCurrency',
      headerName: 'Principal Currency',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'settlementAmount',
      headerName: 'Settlement Amount',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        if (!isNaN(params?.value)) {
          return params?.value?.toFixed(2)
        } else {
          return 0
        }
      },
    },
    {
      field: 'settlementCurrency',
      headerName: 'Settlement Currency',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'applicant',
      headerName: 'Applicant',
      width: 200,
      minWidth: 200,
      maxWidth: 200,
      sortable: false,
      resizable: false,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const nameOrId = params.value?.name || params.value?.applicantId || 'N/A'
        return (
          <span
            onClick={() => handleNavigation(`/applicant-details/${params.value?.applicantId}`)}
            style={{
              cursor: 'pointer',
              color: theme.palette.text.primary,
              textDecoration: 'underline',
            }}
          >
            {nameOrId}
          </span>
        )
      },
    },

    {
      field: 'forex',
      headerName: 'Exchange Rate',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'charges',
      headerName: 'Charges (Inc Vat)',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => params.row.charges + params.row.vatCharges,
    },
    // {
    //   field: 'vatCharges',
    //   headerName: 'Vat Charges',
    //   flex: 1,
    //   headerClassName: 'super-app-theme--header',
    // },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => helper.convertDateAndTime(params?.row?.date),
    },
    {
      field: 'gateway_status',
      headerName: 'Gateway Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const value = params?.row?.gateway_status?.toUpperCase()
        if (!value) return null
        return (
          <Chip
            label={value}
            sx={{
              backgroundColor: statusColors[value] || 'grey',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '8px',
            }}
          />
        )
      },
    },
    {
      field: 'status',
      headerName: 'Transaction Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const value = renderTransactionStatus(params?.row?.status?.toUpperCase())
        if (!value) return null
        return (
          <Chip
            label={value}
            sx={{
              backgroundColor: statusColors[value] || 'grey',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '8px',
            }}
          />
        )
      },
    },
    {
      field: 'stpError',
      headerName: 'STP',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <Chip
          label={params.value === 'Y' ? 'Error' : 'No Error'}
          color={params.value === 'Y' ? 'error' : 'success'}
          onClick={() => {
            if (params.value === 'Y') {
              setmodalOpen(true)
              fetchStpErrorList(params?.row?.id)
            }
          }}
        />
      ),
    },
    {
      field: 'bopAction',
      headerName: columnHeaderMap[userCountry] || columnHeaderMap.DEFAULT,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <IconButton
          onClick={() => {
            handleNavigation(`/bop-details/${params.row.transactionNumber}/${params.row.tran_bop_attempt}`)
          }}
        >
          <VisibilityIcon
            style={{
              cursor: 'pointer',
            }}
          />
        </IconButton>
      ),
    },
  ]
  // --- export helpers ---
  const esc = (v: any) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  // Build headers + rows from current tab
  const rowsForExport = () => {
    const isInwards = transactionType === 'inwards'
    const rows = isInwards ? inboundTransaction || [] : outboundTransaction || []
    const allCols: GridColDef[] = (isInwards ? filteredInwardColumns : filteredOutwardColumns) as any

    // keep order from the grid; visible if not explicitly false
    const visibleCols = allCols.filter((col) => columnVisibilityModel[col.field] !== false && col.field !== 'bopAction')

    const headers = visibleCols?.map((c) => c.headerName ?? c.field)

    const valueFor = (r: any, field: string) => {
      const v = r?.[field]
      if (typeof v === 'number') return v?.toFixed(2)
      if (field === 'applicant') return r?.applicant?.firstName ?? r?.applicant?.applicantId ?? ''
      if (field === 'stpError') return v === 'Y' ? 'Error' : 'No Error'
      if (field === 'status' || field === 'transactionStatus') return (v ? renderTransactionStatus(v) : '').toString().toUpperCase()
      if (field === 'date' || /Date$/i.test(field)) return v ? helper.convertDateAndTime(v) : ''
      if (field === 'charges') return isInwards ? r.charges + r.vatCharges : r.transactionOutward.charges + r.transactionOutward.vatCharges
      return v ?? ''
    }

    const body = rows.map((r) => visibleCols.map((c) => valueFor(r, c.field)))
    return { headers, body, title: isInwards ? 'inwards' : 'outwards' }
  }

  const downloadCSV = () => {
    const { headers, body, title } = rowsForExport()
    if (!body.length) return
    const csv = [headers.map(esc).join(','), ...body.map((r) => r.map(esc).join(','))].join('\n')
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${title}_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    const { headers, body, title } = rowsForExport()
    if (!body.length) return
    const doc = new jsPDF({ unit: 'pt' })
    doc.setFontSize(14)
    doc.text(`Transactions (${title})`, 40, 40)
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
        const w = doc.internal.pageSize.getWidth(),
          h = doc.internal.pageSize.getHeight()
        doc.setFontSize(9)
        doc.text(`Page ${doc.getNumberOfPages()}`, w - 60, h - 20)
      },
    })

    doc.save(`transactions_${title}_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  const inward_columns = [
    { field: 'transactionNumberIw', headerName: 'Transaction Number IW', width: 200, headerClassName: 'super-app-theme--header' },
    { field: 'owTransactionNumber', headerName: 'OW Transaction Number', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'sendingCountry', headerName: 'Sending Country', width: 130, headerClassName: 'super-app-theme--header' },
    { field: 'receivingCountry', headerName: 'Receiving Country', width: 130, headerClassName: 'super-app-theme--header' },
    { field: 'settlementCurrency', headerName: 'Settlement Currency', width: 150, headerClassName: 'super-app-theme--header' },
    // { field: 'principalCurrency', headerName: 'Principal Currency', width: 150, headerClassName: 'super-app-theme--header' },

    // { field: 'gatewayId', headerName: 'Gateway Id', width: 100, headerClassName: 'super-app-theme--header' },

    { field: 'gatewayStatus', headerName: 'Gateway Status', width: 100, headerClassName: 'super-app-theme--header' },
    {
      field: 'settlementAmount',
      headerName: 'Settlement Amount',
      type: 'number',
      width: 150,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'createdLocaldatetime',
      headerName: 'Created Date',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        console.log(params)
        return helper.convertDateAndTime(params?.row?.createdLocaldatetime)
      },
    },
    // {
    //   field: 'vatCharges',
    //   headerName: 'Vat Charges',
    //   flex: 1,
    //   headerClassName: 'super-app-theme--header',
    // },
    {
      // field: 'charges',
      // headerName: 'Charges',
      // flex: 1,
      // headerClassName: 'super-app-theme--header',
      field: 'charges',
      headerName: 'Charges (Inc Vat)',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => params.row.charges + params.row.vatCharges,
    },

    {
      field: 'transactionStatus',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        const value = renderTransactionStatus(params?.row?.transactionStatus?.toUpperCase())
        if (!value) return null
        return (
          <Chip
            label={value}
            sx={{
              backgroundColor: statusColors[value] || 'grey',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '8px',
            }}
          />
        )
      },
    },
    {
      field: 'stpError',
      headerName: 'STP',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <Chip
          label={params.value === 'Y' ? 'Error' : 'No Error'}
          color={params.value === 'Y' ? 'error' : 'success'}
          onClick={() => {
            if (params.value === 'Y') {
              setmodalOpen(true)
              fetchStpErrorList(params?.row?.id)
            }
          }}
        />
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        <IconButton
          onClick={() => {
            handleNavigation(`/bop-details/${params.row.owTransactionNumber}/${params.row.tranBopAttempt}`)
          }}
        >
          <PreviewOutlined />
        </IconButton>
      ),
    },
  ]

  const StpColumns = [
    {
      field: 'transactionNo',
      headerName: 'Transaction No.',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'fieldName',
      headerName: 'Field',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'errorMessage',
      headerName: 'Error Message',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
  ]

  // Fetch API whenever pagination or filter changes
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { page, pageSize } = paginationModel

        // build filter query (basic example: single filter only)
        let filterQuery = ''
        if (filterModel.items.length > 0) {
          const f = filterModel.items[0]
          if (f.value) {
            filterQuery = `&filterField=${f.field}&filterValue=${f.value}`
          }
        }
        getAllTransactions(page, pageSize, filterQuery)
      } catch (err) {
        console.error('Failed to fetch transactions', err)
      } finally {
        // setLoading(false);
      }
    }

    fetchData()
  }, [paginationModel, filterModel])

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { page, pageSize } = paginationInwardModel

        // build filter query (basic example: single filter only)
        let filterQuery = ''
        if (filterModel.items.length > 0) {
          const f = filterModel.items[0]
          if (f.value) {
            filterQuery = `&filterField=${f.field}&filterValue=${f.value}`
          }
        }

        getInwardTransactionListFilterd(page, pageSize)
      } catch (err) {
        console.error('Failed to fetch transactions', err)
      } finally {
        // setLoading(false);
      }
    }

    fetchData()
  }, [paginationInwardModel, filterModel])

  // handle page or pageSize change
  const handlePaginationChange = (newModel: GridPaginationModel) => {
    setPaginationModel(newModel)
  }
  const handleInwardPaginationChange = (newModel: GridPaginationModel) => {
    setPaginationInwardModel(newModel)
  }

  // handle filter changes
  const handleFilterChange = (newFilterModel: GridFilterModel) => {
    const filter = newFilterModel.items[0]
    if (filter.field == 'id' && filter.value) {
      try {
        getAllTransactions(0, 10, filter.value)
      } catch (err) {}
    }
    console.log(filter)
    // setFilterModel(newFilterModel);
  }

  const handleResetFilter = () => {
    setFilterModel({ items: [] })
    getAllTransactions(0, 10, '')
  }

  // Load default data on mount

  interface CustomToolbarProps {
    downloadCSV: () => void
    downloadPDF: () => void
  }
  const CustomToolbar: React.FC<CustomToolbarProps> = ({ downloadCSV, downloadPDF }) => (
    <GridToolbarContainer sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1, p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={downloadCSV}
        size="small"
        sx={{ ml: 1, textTransform: 'none', fontWeight: 500 }}
      >
        CSV
      </Button>
      <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={downloadPDF} size="small" sx={{ textTransform: 'none', fontWeight: 500 }}>
        PDF
      </Button>

      <Button variant="outlined" startIcon={<FindReplaceIcon />} onClick={handleResetFilter} size="small">
        Reset Filters
      </Button>
    </GridToolbarContainer>
  )

  const fetchStpErrorList = useCallback(async (transactionId: string) => {
    try {
      const { data } = await transaction_Service.getStpRules(transactionId)
      setStpErrors(data || [])
    } catch (error) {
      console.log('err', error)
    }
  }, [])

  const getApplicantDetails = useCallback(async () => {
    try {
      const data = await applicant_service.getApplicantDetalis()

      const users: any = data.map((e) => {
        const benificiary_list = e.beneficiaryList.map((b) => {
          return {
            benificaryId: b.beneficiaryId,
            name: b?.beneficiaryMiddleName
              ? `${b.beneficiaryFirstName} ${b.beneficiaryMiddleName} ${b.beneficiaryLastName}`
              : `${b.beneficiaryFirstName} ${b.beneficiaryLastName}`,
            accountHolderName: b?.beneficiaryMiddleName
              ? `${b.beneficiaryFirstName} ${b.beneficiaryMiddleName} ${b.beneficiaryLastName}`
              : `${b.beneficiaryFirstName} ${b.beneficiaryLastName}`,
            accountNumber: b.bankBicCode,
            bank: b.bankName,
            ifscCode: b.bankBicCode,
          }
        })

        return {
          applicantId: e.applicant.applicantId,
          id: e.applicant.applicantId,
          //@ts-ignore
          name: e.applicant?.firstName,
          accountNumber: '**********789',
          profilePhoto: 'https://randomuser.me/api/portraits/women/4.jpg',
          benificary: benificiary_list,
        }
      })
      setUserList(users)
    } catch (error) {
      console.log(error)
    }
  }, [])

  const getInwardTransactionListFilterd = useCallback(
    async (page: any, size: any) => {
      try {
        const transactions = await transaction_Service.getInwardTransactionFilted(page, size, userCountry)
        setInboundTransaction(transactions) // transactions is already the array
      } catch (error) {
        console.log(error)
      }
    },
    [userCountry],
  )

  const getAllTransactions = useCallback(
    async (
      page: number,
      size: number,
      //@ts-ignore
      filterQuery: string = '',
    ) => {
      try {
        setIsLoading(true)
        var data: any
        if (filterQuery.length > 0) {
          data = await transaction_Service.getTransactionbyquery(filterQuery, userCountry)
        } else {
          data = await transaction_Service.getOutwardAllTransaction(userCountry, page, size)
        }

        const outbound: Array<TransactionOutward> | any = data
          ?.map((e: any) => {
            return {
              ...e.transactionGatewayDTO,
              ...e.beneficiary,
              ...e.applicant,
              stages: e?.stages,

              id: e?.transactionGatewayDTO?.transactionNumber,
              destination: e?.transactionGatewayDTO?.receiveCountry,
              value: e?.transactionGatewayDTO?.principalAmount,
              currency: e?.transactionGatewayDTO?.settlementCurrency,
              settlement: helper.roundToTwoFixed(e?.transactionGatewayDTO?.principalAmount * e?.transactionGatewayDTO?.exchangeRates),
              destinationBank: e?.transactionGatewayDTO?.destinationBankBicCode,
              forex: helper.roundToTwoFixed(e?.transactionGatewayDTO?.exchangeRates),
              date: e?.transactionGatewayDTO?.createdLocalDateTime,

              reporting: e?.transactionGatewayDTO?.reportingStatus,
              status: e?.transactionGatewayDTO?.transactionStatus,
              final_amount: helper.roundToTwoFixed(e?.transactionGatewayDTO?.exchangeRates * e?.transactionGatewayDTO?.principalAmount),
              applicant: e?.applicant,
              gateway_name: e?.transactionGatewayDTO?.forexPaymentGateway?.company,
              gateway_status: e?.transactionGatewayDTO?.gatewayStatus,
              //@ts-ignore
              inid: e?.transactionInwardNumber,
            }
          })
          ?.filter((transaction: any) => {
            if (queryParams.get('id') != null) {
              return transaction?.id == queryParams.get('id')
            }

            if (userCountry === 'IN') {
              return transaction.destination?.toLowerCase() !== 'in'
            } else if (userCountry === 'ZA') {
              return transaction.destination?.toLowerCase() !== 'za'
            }
            return true
          })
        setOutboundTransaction(outbound)

        setcommonloader(false)
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    },
    [transactionType, userCountry],
  )

  useEffect(() => {
    if (flow) setTransactionType(flow)
    if (userCountry !== 'UAE') getApplicantDetails()
  }, [])

  //@ts-ignore
  const handleToggleTransactionType = (event: any, newType: string) => {
    if (newType) {
      setTransactionType(newType)
      //@ts-ignore
      setTransactionData(newType === 'inwards' ? inboundTransaction : outboundTransaction)
      navigate(`/transaction?flow=${newType}`)
    }
  }

  const handleNavigation = (url: string) => {
    navigate(url)
  }

  const getTransactionPermission = () => {
    return transactionType === 'inwards' ? local_service.get_modules()?.TRANSACTION_INWARD : local_service.get_modules()?.TRANSACTION_OUTWARD
  }

  const getLoadingState = () => {
    return commonloader
  }

  const filteredOutwardColumns =
    userCountry === 'UAE' ? columns_outward.filter((col) => col.field !== 'gateway_status' && col.field !== 'stpError') : columns_outward

  const filteredInwardColumns =
    userCountry === 'UAE'
      ? inward_columns.filter((col) => col.field !== 'gatewayStatus' && col.field !== 'action' && col.field !== 'stpError')
      : inward_columns

  return (
    <Box sx={{ width: '80vw', height: '70vh' }}>
      <Typography variant="h4" gutterBottom>
        <strong>Transactions</strong>
      </Typography>

      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} sx={{ width: '80vw' }}>
        <Box>
          <ToggleButtonGroup value={transactionType} color="primary" exclusive onChange={handleToggleTransactionType} sx={{ mb: 2 }}>
            <ToggleButton id="imp-inward-button" value="inwards">
              Inwards
            </ToggleButton>

            <ToggleButton id="imp-outward-button" value="outwards">
              Outwards
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {userCountry !== 'UAE' && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Left group: text-style buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 3 }}>
              <Button
                variant="text"
                sx={{
                  textTransform: 'none',
                  borderBottom: '1px solid transparent',
                  borderRadius: 0,
                  color: 'text.primary',
                  '&:hover': {
                    borderBottomColor: 'primary.main',
                    fontWeight: 'bold',
                    backgroundColor: 'transparent',
                  },
                }}
                onClick={() => handleNavigation('/recon-trx')}
              >
                Reconciliation
              </Button>

              <Button
                variant="text"
                sx={{
                  textTransform: 'none',
                  borderBottom: '1px solid transparent',
                  borderRadius: 0,
                  color: 'text.primary',
                  '&:hover': {
                    borderBottomColor: 'primary.main',
                    fontWeight: 'bold',
                    backgroundColor: 'transparent',
                  },
                }}
                // disabled={!helper.checkUserHasPermission(local_service.get_modules()?.COMPLIANCE_MONITOR, 'canRead')}
                onClick={() => handleNavigation('/utilization')}
              >
                Utilization Limit
              </Button>

              <Button
                variant="text"
                sx={{
                  textTransform: 'none',
                  borderBottom: '1px solid transparent',
                  borderRadius: 0,
                  color: 'text.primary',
                  '&:hover': {
                    borderBottomColor: 'primary.main',
                    fontWeight: 'bold',
                    backgroundColor: 'transparent',
                  },
                }}
                // disabled={!helper.checkUserHasPermission(local_service.get_modules()?.RECONCILLATION, 'canRead')}
                onClick={() => handleNavigation('/recon')}
              >
                Settlement
              </Button>
            </Box>

            {/* Right: Transaction button */}
            <Button
              variant="contained"
              disabled={!helper.checkUserHasPermission(local_service.get_modules()?.TRANSACTION_OUTWARD, 'canCreate')}
              onClick={() => handleNavigation('/sendmoney')}
            >
              + Transaction
            </Button>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          width: '80vw',
          height: '65vh',
          '& .super-app-theme--header': {
            backgroundColor: '#005099',
            color: 'white',
          },
        }}
      >
        {helper.checkUserHasPermission(getTransactionPermission(), 'canRead') &&
          (transactionType == 'inwards' ? (
            <>
              <DataGrid
                rows={transactionType === 'inwards' ? inboundTransaction : outboundTransaction || []}
                //@ts-ignore
                columns={transactionType === 'inwards' ? filteredInwardColumns : filteredOutwardColumns}
                getRowId={(row: any) => (transactionType === 'inwards' ? row?.transactionNumberIw : row.id)}
                pageSizeOptions={[10, 20, 50]}
                // paginationMode="server"
                // filterMode="server"
                // paginationModel={paginationInwardModel}
                // onPaginationModelChange={handleInwardPaginationChange}
                // filterModel={filterModel}
                // onFilterModelChange={handleFilterChange}
                disableColumnMenu // ✅ Removes the 3-dot column menu icon globally
                disableRowSelectionOnClick
                loading={getLoadingState() || isLoading}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={setColumnVisibilityModel}
                slots={{
                  loadingOverlay: LoaderUI.LoadingOverlay,
                  toolbar: () => <CustomToolbar downloadCSV={downloadCSV} downloadPDF={downloadPDF} />,
                }}
                sx={{
                  '& .MuiDataGrid-root': {
                    border: '1px solid blue', // ✅ Fixed typo ('1 px' → '1px')
                  },
                  '& .MuiDataGrid-cell': {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f5f5f5', // optional: better header visibility
                  },
                }}
              />
            </>
          ) : (
            <>
              <DataGrid
                rows={transactionType === 'inwards' ? inboundTransaction : outboundTransaction || []}
                //@ts-ignore
                columns={transactionType === 'inwards' ? filteredInwardColumns : filteredOutwardColumns}
                getRowId={(row: any) => (transactionType === 'inwards' ? row?.transactionNumberIw : row.id)}
                pageSizeOptions={[10, 20, 50]}
                // paginationMode="server"
                // filterMode="server"
                // paginationModel={paginationModel}
                // onPaginationModelChange={handlePaginationChange}
                // filterModel={filterModel}
                // onFilterModelChange={handleFilterChange}
                // rowCount={1000}
                disableColumnMenu
                disableRowSelectionOnClick
                loading={getLoadingState()}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={setColumnVisibilityModel}
                //@ts-ignore
                loading={isLoading}
                disableColumnMenu
                slots={{
                  loadingOverlay: LoaderUI.LoadingOverlay,
                  toolbar: () => <CustomToolbar downloadCSV={downloadCSV} downloadPDF={downloadPDF} />,
                }}
                disableRowSelectionOnClick
                sx={{
                  '& .MuiDataGrid-root': {
                    border: '1 px solid blue',
                  },
                  '& .MuiDataGrid-cell': {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                }}
              />
            </>
          ))}
      </Box>

      <CompliancTool open={toolopen} setOpen={setToolOpen} userList={userList} fetchUserDetails={() => {}} />

      <Modal open={modalOpen} onClose={() => setmodalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 1000,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            STP Errors List
          </Typography>
          <DataGrid
            sx={{
              width: '100%',
              '& .MuiDataGrid-columnHeaders': {
                '& .super-app-theme--header': {
                  backgroundColor: '#005099',
                  color: 'white',
                },
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-cell': {
                fontSize: '14px',
              },
              '& .MuiDataGrid-row:nth-of-type(even)': {
                backgroundColor: '#f0f8ff',
              },
              '& .MuiDataGrid-row:nth-of-type(odd)': {
                backgroundColor: '#ffffff',
              },
              '& .super-app-theme--header': {
                fontSize: '16px',
              },
            }}
            columns={StpColumns}
            rows={stpErrors || []}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 20, page: 0 },
              },
            }}
            loading={stpErrors?.length > 0 ? false : true}
            slots={{
              loadingOverlay: LoaderUI.LoadingOverlay,
            }}
            filterMode="server"
            onFilterModelChange={handleFilterChange}
            pageSizeOptions={[10]}
            getRowId={(row: any) => row.id} // Ensure proper row ID handling
          />
          <Button variant="outlined" onClick={() => setmodalOpen(false)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  )
}

export default TransactionListing
