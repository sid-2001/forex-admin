import { DataGrid } from '@mui/x-data-grid'
import { useNavigate } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import HasPermission from '../permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { HelperService } from '@/helpers/helper'

const local_service = new LocalStorageService()
const helper = new HelperService()

const BeneficiaryTable = ({ beneficiary }: { beneficiary: any }) => {
  const navigate = useNavigate()

  const handleBeneficiaryIdClick = (
    //@ts-ignore
    beneficiaryId,
  ) => {
    navigate(`/beneficiary-details/${beneficiaryId}`)
  }

  const renderBeneficiaryFullName = (row: any) => {
    const { beneficiaryFirstName, beneficiaryLastName } = row
    return row?.beneficiaryMiddleName
      ? `${beneficiaryFirstName} ${row?.beneficiaryMiddleName} ${beneficiaryLastName}`
      : `${beneficiaryFirstName} ${beneficiaryLastName}`
  }

  const columns = [
    {
      field: 'beneficiaryId',
      headerName: 'Beneficiary ID',
      flex: 1.3,
      headerClassName: 'super-app-theme--header',
      renderCell: (
        //@ts-ignore
        params,
      ) => (
        <span
          style={{
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
          onClick={() => handleBeneficiaryIdClick(params.row.beneficiaryId)}
        >
          {params.row.beneficiaryId}
        </span>
      ),
    },
    {
      field: 'beneficiaryName',
      headerName: 'Beneficiary Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      renderCell: (params: any) => {
        return <div>{renderBeneficiaryFullName(params?.row)}</div>
      },
    },
    {
      field: 'bankName',
      headerName: 'Bank Name',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'bankBicCode',
      headerName: 'BIC Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'accountNumber',
      headerName: 'Beneficiary Account Number',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'idType',
      headerName: 'ID Type',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
  ]

  return (
    <>
      <HasPermission permission={'canRead'} module={local_service.get_modules()?.BENEFICIARY}>
        {beneficiary.length > 0 ? (
          <DataGrid
            sx={{
              width: '70vw',
              height: '30vh',
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
            rows={beneficiary}
            getRowId={(row) => row.beneficiaryId}
            //@ts-ignore
            pageSize={5}
            rowsPerPageOptions={[5]}
          />
        ) : (
          <p>No beneficiaries found</p>
        )}
      </HasPermission>
    </>
  )
}

export default BeneficiaryTable
