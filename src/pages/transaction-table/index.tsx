import React from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { useNavigate } from 'react-router-dom'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'

const local_service = new LocalStorageService()

interface Transaction {
  id: number
  transactionNumber: string
  sendCountry: string
  receiveCountry: string
  amount: string
  transactionStatus: string
}

interface TransactionTableProps {
  transactions: Transaction[]
}
//@ts-ignore
const TransactionTable: React.FC<TransactionTableProps> = ({ transaction, applicantId }) => {
  let navigate = useNavigate()

  const renderBeneficiaryFullName = (beneficiary: any) => {
    const { beneficiaryFirstName, beneficiaryLastName } = beneficiary
    return beneficiary?.beneficiaryMiddleName
      ? `${beneficiaryFirstName} ${beneficiary?.beneficiaryMiddleName} ${beneficiaryLastName}`
      : `${beneficiaryFirstName} ${beneficiaryLastName}`
  }

  const renderTransactionStatus = (transStatus: string) => (transStatus === 'IN_PROGRESS' ? 'IN PROGRESS' : transStatus)

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
      renderCell: (params: any) => (
        <span
          style={{
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
          onClick={() => navigate(`/transaction-detail/${params?.row?.transactionNumber}`)}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: 'sendCountry',
      headerName: 'Sender Country',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'receiveCountry',
      headerName: 'Receiver Country',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'beneficiaryName',
      headerName: 'Beneficiary Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => <div>{renderBeneficiaryFullName(params?.row)}</div>,
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
      renderCell: (params: any) => <div>{renderTransactionStatus(params?.row?.transactionStatus)}</div>,
    },
  ]

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.TRANSACTION_OUTWARD}>
      {transaction.length > 0 ? (
        <DataGrid
          sx={{
            height: '70vh',
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
            '& .super-app-theme--header': {
              fontSize: '16px',
            },
          }}
          columns={columns}
          rows={transaction}
          //@ts-ignore
          pageSize={5}
          rowsPerPageOptions={[5]}
          getRowId={(row: any) => row.id}
        />
      ) : (
        <p>No Transactions Found</p>
      )}
    </HasPermission>
  )
}

export default TransactionTable
