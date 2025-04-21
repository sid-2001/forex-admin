import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Transaction {
  id: number;
  transactionNumber: string;
  sendCountry: string;
  receiveCountry: string;
  amount: string;
  transactionStatus: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
}
//@ts-ignore
const TransactionTable: React.FC<TransactionTableProps> = ({ transaction, applicantId }) => {
  let navigate = useNavigate()
  const columns = [
    {
      field: 'id',
      headerName: 'S. No',
      flex: 0.5,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'transactionNumber',
      headerName: 'Transaction No.',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      // renderCell: (params: any) => (
      //   <span
      //     // style={{
      //     //   textDecoration: 'underline',
      //     //   cursor: 'pointer',
      //     // }}
      //   >
      //     {params.row.transactionNumber}
      //   </span>
      // ),
    },
    {
      field: 'sendCountry',
      headerName: 'Send Country',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'receiveCountry',
      headerName: 'Receive Country',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'beneficiaryName',
      headerName: 'Beneficiary Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'amount',
      headerName: 'Amount',
      flex: 0.5,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'transactionStatus',
      headerName: 'Transaction Status',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
  ];

  return (
    <Box sx={{ width: '70vw' }}>
      <Button
        variant="outlined"
        onClick={() => {
          const url = applicantId ? `/sendmoney?applicantId=${applicantId}` : '/sendmoney'
          navigate(url)
        }}
        sx={{
          marginBottom: "3%"
        }}
      >
        Add Transaction +
      </Button>

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
        columns={columns}
        rows={transaction}
        //@ts-ignore
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row: any) => row.id} // Ensure proper row ID handling
      />
    </Box>
  );
};

export default TransactionTable;
