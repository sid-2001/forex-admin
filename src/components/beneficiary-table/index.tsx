import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import HasPermission from '../permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { HelperService } from '@/helpers/helper'
import LoaderUI from '../loader/loader'
import FindReplaceIcon from '@mui/icons-material/FindReplace'
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridFilterModel } from '@mui/x-data-grid'

const local_service = new LocalStorageService()
const helper = new HelperService()

const BeneficiaryTable = ({ beneficiary }: { beneficiary: any }) => {
  const navigate = useNavigate()
  const userCountry = local_service?.get_staff_country()
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] })

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

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer sx={{ justifyContent: 'flex-start', gap: 1, py: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />

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
      field: userCountry === 'UAE' ? 'ifscCode' : 'bankBicCode',
      headerName: userCountry === 'UAE' ? 'Bank Code' : 'BIC Code',
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

  const filteredColumns = userCountry === 'UAE' ? columns.filter((col) => col.field !== 'idType' && col.field !== 'bankName') : columns

  return (
    <>
      <HasPermission permission={'canRead'} module={local_service.get_modules()?.BENEFICIARY}>
        {beneficiary.length > 0 ? (
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
            columns={filteredColumns}
            rows={beneficiary}
            getRowId={(row) => row.beneficiaryId}
            initialState={{
              pagination: { paginationModel: { pageSize: 20, page: 0 } },
            }}
            pageSizeOptions={[10, 20, 50]}
            slots={{
              loadingOverlay: LoaderUI.LoadingOverlay,
              toolbar: CustomToolbar, // 👈 Toolbar with reset filters
            }}
            disableColumnMenu
            filterModel={filterModel}
            onFilterModelChange={(model) => setFilterModel(model)}
          />
        ) : (
          <p>No beneficiaries found</p>
        )}
      </HasPermission>
    </>
  )
}

export default BeneficiaryTable
