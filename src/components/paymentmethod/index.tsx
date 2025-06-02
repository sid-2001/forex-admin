import React, { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Paper, FormControlLabel, Radio } from '@mui/material'

const paymentMethods = [
  { id: 1, method: 'Credit Card', amountReceivable: '100 USD', charges: 5, totalAmount: '105 USD', time: '2 hours' },
  { id: 2, method: 'Bank Transfer', amountReceivable: '200 USD', charges: 10, totalAmount: '210 USD', time: '5 hours' },
  { id: 3, method: 'PayPal', amountReceivable: '150 USD', charges: 7, totalAmount: '157 USD', time: '3 hours' },
]

const PaymentMethodsTable: React.FC = (
   //@ts-ignore
  { amount, timecharge, setFinalRate, currency, setSelectedTransferMethod, setGatewayCharge }) => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null)

  const handleRowSelection = (row: any) => {
  
    setSelectedRow(row.id)
    setFinalRate(Number(amount) + Number(timecharge) + Number(row.charges))
    setSelectedTransferMethod(row.method)
    setSelectedRow(row.id)
    setGatewayCharge(row.charges)
  }
  useEffect(() => {})
  const columns = [
    {
      field: 'select',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      headerName: ' Select',
      renderCell: (params: any) => (
         //@ts-ignore
        <FormControlLabel
          control={
            <Radio
              checked={selectedRow === params.row.id}
              onChange={() => handleRowSelection(params.row)}
              value={params.row.id}
              name="paymentMethod"
            />
          }
        />
      ),
      width: 120,
    },
    { field: 'method', headerName: 'Method', flex: 1, headerClassName: 'super-app-theme--header' },

    {
      field: 'charges',
      headerName: 'Fees',
      flex: 1,
      headerClassName: 'super-app-theme--header',

      renderCell: (params: any) => <span>{params.row.charges + ' ' + currency}</span>,
    },
    {
      field: 'totalAmount',
      headerName: 'Total Amount',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => (
        // return ()

        <span>
          {amount +
            ' +' +
            timecharge +
            ' ( Timecharge) +' +
            params.row.charges +
            ' ( Gateway Fee) = ' +
            (Number(amount) + Number(timecharge) + Number(params.row.charges) + ' ' + currency)}
        </span>
      ),
    },
  ]

  return (
    <Paper sx={{ marginBottom: 3 }}>
      <DataGrid rows={paymentMethods} columns={columns}
      
       //@ts-ignore
      pageSize={5} rowsPerPageOptions={[5]} disableSelectionOnClick autoHeight />
    </Paper>
  )
}

export default PaymentMethodsTable
