import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Typography,
  TextField,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
} from '@mui/material'
//@ts-nocheck
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { TransactionService } from '@/services/transaction.service'
import { isNull } from 'util'
import { useRecoilState } from 'recoil'
import { useNavigate } from 'react-router-dom'

import { alertState, alertTextState, alertTypeState, loaderState, loaderStateNew } from '@/states/state'
import { LocalDrink } from '@mui/icons-material'
import { theme } from '@/contants/theme'

const ReconPage = () => {
  const [selectedRows, setSelectedRows] = useState<Record<string, string>>({})
  const [globalTransactionId, setGlobalTransactionId] = useState('')
  const [rows, setRows] = useState()
  const navigate = useNavigate()

  const [filteredRows, setFilteredRows] = useState([])
  const [startDate, setStartDate] = useState<Dayjs | null>(null)
  const [endDate, setEndDate] = useState<Dayjs | null>(null)
  const [selectAll, setSelectAll] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [allreconData, setallRecondData] = useState([])
  const [reconciliation, setReconciliation] = useState({
    reconId: '',
    reconDate: dayjs(),
    from_transactionDate: dayjs(),
    to_transactionDate: dayjs(),
    reported_bankName: '',
    reconStatus: '',
    principalAmount: '',
    settlementAmount: '',
    UTR_Id: '',
  })

  const [text, setText] = useRecoilState(alertTextState)
  const [type, setType] = useRecoilState(alertTypeState)
  const [open, setOpen] = useRecoilState(alertState)
  const [commonloader, setcommonloader] = useRecoilState(loaderStateNew)

  const [reconid, setReconID] = useState('')

  const handleCheckboxChange = (rowId: string, isChecked: boolean) => {
    setSelectedRows((prev) => {
      const updated = { ...prev }
      if (isChecked) {
        updated[rowId] = '' // Initialize with an empty string
      } else {
        delete updated[rowId]
      }
      return updated
    })
  }

  let transaction_service = new TransactionService()

  useEffect(() => {
    setcommonloader(true)
    transaction_service.gettransactions().then((data) => {
      if (data && data.transactionDetailsList) {
        //@ts-ignore

        setallRecondData(data.transactionDetailsList)

        const all_data = data.transactionDetailsList

          .map((e) => {
            if (!e?.transactionOutward?.reconId) {
              // Check for undefined or null reconId
              return {
                id: e.transactionOutward?.transactionNumber || '',
                destination: e.transactionOutward?.receiveCountry || '',
                value: e.transactionOutward?.principalAmount || 0,
                currency:
                  e.transactionOutward?.principalAmount && e.transactionOutward?.exchangeRates
                    ? e.transactionOutward.principalAmount * e.transactionOutward.exchangeRates
                    : '0', // Ensuring safe multiplication
                settlement: e.transactionOutward?.owCreatedDate || new Date(),
                destinationBank: e.transactionOutward?.destinationBankBicCode || '',
                reconid: e.transactionOutward?.reconId ? e.transactionOutward.reconId : null,
              }
            }
            return null // This will be filtered out later
          })
          .filter(Boolean) // Removes all null values from the array

        //@ts-ignore
        setRows(all_data)
        //@ts-ignore
        setFilteredRows(all_data)
        setcommonloader(false)
      }
    })
  }, [])

  const handleTextFieldChange = (rowId: string, value: string) => {
    setSelectedRows((prev) => ({
      ...prev,
      [rowId]: value,
    }))
  }
  const handleSelectAll = (isChecked: boolean) => {
    setSelectAll(isChecked)
    if (isChecked) {
      const allSelected = Object.fromEntries(
        //@ts-ignore

        rows.map((row) => [row.id, '']),
      )
      setSelectedRows(allSelected)
    } else {
      setSelectedRows({})
    }
  }

  const handleCopyToAll = () => {
    if (globalTransactionId) {
      setSelectedRows((prev) => {
        const updated = { ...prev }
        Object.keys(updated).forEach((rowId) => {
          updated[rowId] = globalTransactionId // Assign the global value
        })
        return updated
      })
    }
  }

  const handleSave = () => {
    const payload = Object.keys(selectedRows).map((rowId) => ({
      transactionId: rowId,
      reconId: selectedRows[rowId],
    }))
    console.log('Payload:', payload)
    transaction_service.createRecons(payload).then((response) => {
      console.log(response)
      if (response?.status == 200) {
        setcommonloader(true)
        setTimeout(() => {
          setcommonloader(false)
          window.location.reload()
        }, 2000)
      }
    })
    // Call your API here with the payload
  }

  const handleDateFilter = () => {
    if (startDate && endDate) {
      //@ts-ignore
      const filtered = rows.filter((row: any) =>
        //@ts-ignore
        dayjs(row.settlement).isBetween(
          startDate,
          endDate,
          'day',
          '[]', // Inclusive of start and end date
        ),
      )
      setFilteredRows(filtered)
    } else {
      //@ts-ignore
      setFilteredRows(rows) // Reset to original rows if no date range is selected
    }
  }

  const handleOpenModal = () => {
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleReconciliationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setReconciliation((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleReconciliationSubmit = () => {
    console.log('Reconciliation Data:', reconciliation)
    // Call API to save reconciliation data here
    handleCloseModal()
  }

  const columns: GridColDef[] = [
    {
      field: 'checkbox',
      headerName: '',
      width: 50,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Checkbox
          //@ts-ignore
          checked={selectedRows[params.row.id]}
          onChange={(e) => handleCheckboxChange(params.row.id, e.target.checked)}
        />
      ),
    },
    { field: 'id', headerName: 'Transaction ID', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'destination', headerName: 'Destination', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'value', headerName: ' Principal Amount', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'currency', headerName: 'Settlement Amount', flex: 1, headerClassName: 'super-app-theme--header' },
    // { field: 'settlement', headerName: 'Settlement', flex: 1 },
    { field: 'destinationBank', headerName: 'Destination Bank', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'textField',
      headerName: 'Recon Id',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) =>
        selectedRows[params.row.id] !== undefined ? (
          <TextField
            value={selectedRows[params.row.id]}
            onChange={(e) => {
              console.log()

              handleTextFieldChange(params.row.id, e.target.value)
            }}
            size="small"
          />
        ) : (
          <>{params.row.reconid ? params.row.reconid : '-----'}</>
        ),
    },
  ]

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}> <Typography variant="h4" sx={{ fontWeight: 'bold' }}> Recon Transactions </Typography> <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} > Back </Button> </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 2,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {/* Start Date Picker */}
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(newDate) => setStartDate(newDate)}
          //@ts-ignore
          renderInput={(params) => <TextField {...params} />}
        />

        {/* End Date Picker */}
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={(newDate) => setEndDate(newDate)}
          //@ts-ignore
          renderInput={(params) => <TextField {...params} />}
        />

        <IconButton
          onClick={() => {
            setStartDate(null)
            setEndDate(null)

            setFilteredRows(
              //@ts-ignore
              rows,
            )
          }}
        >
          <RestartAltIcon></RestartAltIcon>
        </IconButton>

        {/* Apply Filter Button */}
        <Button variant="contained" color="primary" onClick={handleDateFilter}>
          Apply Filter
        </Button>

        {/* Global Transaction ID Input */}
        <TextField label="Recon Id" value={globalTransactionId} onChange={(e) => setGlobalTransactionId(e.target.value)} size="small" />

        <TextField
          label="Recon ID"
          variant="outlined"
          value={reconid}
          onChange={(v) => {
            setReconID(v.target.value)
            console.log(v.target.value)
            var all_data = allreconData
              .map((e: any) => {
                if (
                  //@ts-ignore
                  e?.transactionOutward?.reconId == v.target.value
                ) {
                  // Check for undefined or null reconId
                  return {
                    //@ts-ignore
                    id: e.transactionOutward?.transactionNumber || '',
                    //@ts-ignore
                    destination: e.transactionOutward?.receiveCountry || '',
                    //@ts-ignore
                    value: e.transactionOutward?.principalAmount || 0,
                    //@ts-ignore
                    currency:
                      e.transactionOutward?.principalAmount && e.transactionOutward?.exchangeRates
                        ? e.transactionOutward.principalAmount * e.transactionOutward.exchangeRates
                        : '0', // Ensuring safe multiplication
                    settlement: e.transactionOutward?.owCreatedDate || new Date(),
                    destinationBank: e.transactionOutward?.destinationBankBicCode || '',
                    reconid: e.transactionOutward?.reconId ? e.transactionOutward.reconId : null,
                  }
                }
                return null // This will be filtered out later
              })
              .filter(Boolean)
            console.log(all_data)
            //@ts-ignore
            setRows(all_data)
            //@ts-ignore
            setFilteredRows(all_data)
          }}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    var all_data = allreconData
                      .map((e: any) => {
                        if (!e?.transactionOutward?.reconId) {
                          // Check for undefined or null reconId
                          return {
                            id: e.transactionOutward?.transactionNumber || '',
                            destination: e.transactionOutward?.receiveCountry || '',
                            value: e.transactionOutward?.principalAmount || 0,
                            currency:
                              e.transactionOutward?.principalAmount && e.transactionOutward?.exchangeRates
                                ? e.transactionOutward.principalAmount * e.transactionOutward.exchangeRates
                                : '0', // Ensuring safe multiplication
                            settlement: e.transactionOutward?.owCreatedDate || new Date(),
                            destinationBank: e.transactionOutward?.destinationBankBicCode || '',
                            reconid: e.transactionOutward?.reconId ? e.transactionOutward.reconId : null,
                          }
                        }
                        return null // This will be filtered out later
                      })
                      .filter(Boolean)
                    console.log(all_data)
                    //@ts-ignore
                    setRows(all_data)
                    //@ts-ignore
                    setFilteredRows(all_data)
                  }}
                  edge="end"
                >
                  <LocalDrink />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Copy to All Button */}
        <Button variant="contained" color="primary" onClick={handleCopyToAll} disabled={!globalTransactionId}>
          Copy to All
        </Button>

        {/* Save Button */}
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>

        {/* Add Reconciliation Button */}
        {/* <Button
            variant="contained"
            color="success"
            onClick={handleOpenModal}
          >
            Add Reconciliation
          </Button> */}
      </Box>

      <Box
        marginTop={2}
        sx={{
          width: '80vw',
          height: '60vh', // fixed height for the table
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          checkboxSelection={false}
          //@ts-ignore
          disableSelectionOnClick
          sx={{
            width: '100%',
            height: '100%',  // fills parent Box
          }}
        />
      </Box>


      {/* Add Reconciliation Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{ padding: 4, maxWidth: 400, margin: 'auto', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Add Reconciliation
          </Typography>

          <TextField
            label="Reconciliation ID"
            name="reconId"
            value={reconciliation.reconId}
            onChange={handleReconciliationChange}
            fullWidth
            sx={{ marginBottom: 2 }}
          />

          <DatePicker
            label="Reconciliation Date"
            value={reconciliation.reconDate}
            //@ts-ignore
            onChange={(newDate) => setReconciliation((prev) => ({ ...prev, reconDate: newDate }))}
            //@ts-ignore
            renderInput={(params) => <TextField {...params} fullWidth sx={{ marginBottom: 2 }} />}
          />

          <DatePicker
            label="From Transaction Date"
            value={reconciliation.from_transactionDate}
            onChange={(newDate) => setReconciliation((prev: any) => ({ ...prev, from_transactionDate: newDate }))}
            //@ts-ignore
            renderInput={(params) => <TextField {...params} fullWidth sx={{ marginBottom: 2 }} />}
          />

          <DatePicker
            label="To Transaction Date"
            value={reconciliation.to_transactionDate}
            onChange={(newDate) => setReconciliation((prev: any) => ({ ...prev, to_transactionDate: newDate }))}
            //@ts-ignore
            renderInput={(params) => <TextField {...params} fullWidth sx={{ marginBottom: 2 }} />}
          />

          <TextField
            label="Reported Bank Name"
            name="reported_bankName"
            value={reconciliation.reported_bankName}
            onChange={handleReconciliationChange}
            fullWidth
            sx={{ marginBottom: 2 }}
          />

          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>Reconciliation Status</InputLabel>
            <Select
              label="Reconciliation Status"
              name="reconStatus"
              value={reconciliation.reconStatus}
              //@ts-ignore
              onChange={handleReconciliationChange}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Principal Amount"
            name="principalAmount"
            value={reconciliation.principalAmount}
            onChange={handleReconciliationChange}
            fullWidth
            sx={{ marginBottom: 2 }}
          />

          <TextField
            label="Settlement Amount"
            name="settlementAmount"
            value={reconciliation.settlementAmount}
            onChange={handleReconciliationChange}
            fullWidth
            sx={{ marginBottom: 2 }}
          />

          <TextField
            label="UTR ID"
            name="UTR_Id"
            value={reconciliation.UTR_Id}
            onChange={handleReconciliationChange}
            fullWidth
            sx={{ marginBottom: 2 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" color="primary" onClick={handleReconciliationSubmit}>
              Submit
            </Button>
          </Box>
        </Box>
      </Modal>
    </LocalizationProvider >
  )
}

export default ReconPage
