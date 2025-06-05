import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, IconButton } from '@mui/material';
import { BeneficiaryService } from '@/services/beneficiary.service';
import HasPermission from '../permissionWrapper';
import { LocalStorageService } from '@/helpers/local-storage-service';
import { HelperService } from '@/helpers/helper';

const beneficiary_service= new BeneficiaryService();
const local_service = new LocalStorageService();
const helper =  new HelperService();

const BeneficiaryTable = ({ 
  //@ts-ignore
  beneficiary,deleteBeneficiary ,applicantId
}) => {
  const navigate = useNavigate();

  const handleBeneficiaryIdClick = (
    //@ts-ignore
    beneficiaryId
  ) => {
    navigate(`/beneficiary-details/${beneficiaryId}`);
  };

  const handleDelete = async(beneficiaryId: string) => {
    try {
      //@ts-ignore
      await beneficiary_service.deleteBeneficiaryById(beneficiaryId);
      deleteBeneficiary(beneficiaryId); 
    } catch (error) {
      console.error('Error deleting beneficiary:', error);
    }
  };

  const columns = [
    {
      field: 'id',
      headerName: 'SNo',
      flex: 0.5,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'beneficiaryId',
      headerName: 'Beneficiary ID',
      flex: 1.3,
      headerClassName: 'super-app-theme--header',
      renderCell: (
        //@ts-ignore
        params
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
      field: 'idType',
      headerName: 'ID Type',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    // {
    //   field: 'action',
    //   headerName: 'Actions',
    //   flex: 1,
    //   headerClassName: 'super-app-theme--header',
    //   renderCell: (params:any) => (
    //     <IconButton
    //       onClick={() => handleDelete(params.row.beneficiaryId)}
    //       color="error"
    //     >
    //       <DeleteIcon />
    //     </IconButton>
    //   ),
    // },
  ];

  const rows = Array.isArray(beneficiary) ? beneficiary : [];

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.BENEFICIARY}>
    <Button
          variant="outlined"
          onClick={() => navigate(`/add-beneficiary/${applicantId}`)}
          sx={{
    
            marginBottom:"3%"
          }}
          disabled={!helper.checkUserHasPermission(local_service.get_modules()?.BENEFICIARY, 'canCreate')}
        >
         ADD Beneficary
        </Button>
      {rows.length > 0 ? (
        <DataGrid
          sx={{
            width: '70vw',
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
          rows={beneficiary}
          //@ts-ignore
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      ) : (
        <p>No beneficiaries found</p>
      )}
    </HasPermission>
  );
};

export default BeneficiaryTable;
