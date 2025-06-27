import { DataGrid } from '@mui/x-data-grid';
import {  Box } from '@mui/material';

const ReferralTransactions = ({
    //@ts-ignore
    referralRecords,referralHeader
}) => {

    const ReferralColumns = [
    {
      field: 'countryCode',
      headerName: 'Country Code',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'transactionNumber',
      headerName: 'Transaction Number',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'rewardRedeemed',
      headerName: referralHeader,
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
    {
      field: 'referrerApplicantId',
      headerName: 'Referrer Id',
      flex: 1,
      headerClassName: 'super-app-theme--header',
    },
  ]

    return (
        <Box>
            {referralRecords && referralRecords.length > 0 ? <DataGrid
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
                columns={ReferralColumns}
                rows={referralRecords || []}
                //@ts-ignore
                pageSize={5}
                rowsPerPageOptions={[5]}
            /> : <p>No Referral Found</p>}
        </Box>

    );
};

export default ReferralTransactions;
