import react, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';

//@ts-ignore
const ReferralDataGrid = ({ rows, columns, width }) => {
    return (<DataGrid
        sx={{
            width: width,
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
        rows={rows || []}
        //@ts-ignore
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
    />)
}


const ReferralTransactions = ({
    //@ts-ignore
    referralRecords, referralType
}) => {
    const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false);
    const [transactionList, setTransactionList] = useState<any>([]);
    const navigate = useNavigate();

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
            headerName: referralType === 'Credited' ? 'Reward Credited' : 'Reward Redeemed',
            flex: 1,
            headerClassName: 'super-app-theme--header',
        },
        {
            field: 'referrerApplicantId',
            headerName: 'Applicant Id',
            flex: 1,
            headerClassName: 'super-app-theme--header',
            // renderCell: (params: any) => (
            //     <span
            //         style={{ color: '#1976d2', cursor: 'pointer' }}
            //         onClick={() => navigate(`/applicant-details/${params.value}`)}
            //     >
            //         {params.value}
            //     </span>
            // ),
        },

    ]
    const ReferralCreditedColumns = [
        {
            field: 'countryCode',
            headerName: 'Country Code',
            flex: 1,
            headerClassName: 'super-app-theme--header',
        },
        {
            field: 'transactions',
            headerName: 'Transactions Count',
            flex: 1,
            headerClassName: 'super-app-theme--header',
            renderCell: (params: any) => (
                <span style={{
                    cursor: 'pointer',
                    color: '#1976d2'
                }} onClick={() => {
                    setShowTransactionModal(!showTransactionModal)
                    setTransactionList(params.row.transactions)
                }}>{params.row.transactions.length}
                </span>
            ),
        },
        {
            field: 'totalReward',
            headerName: 'Total Reward',
            flex: 1,
            headerClassName: 'super-app-theme--header',
        },
        {
            field: 'referrerApplicantId',
            headerName: 'Applicant Id',
            flex: 1,
            headerClassName: 'super-app-theme--header',
            // renderCell: (params: any) => (
            //     <span
            //         style={{ color: '#1976d2', cursor: 'pointer' }}
            //         onClick={() => navigate(`/applicant-details/${params.value}`)}
            //     >
            //         {params.value}
            //     </span>
            // ),
        },
    ]

    const mapGroupedData = (data: any) => {
        //@ts-ignore
        const grouped: any = {};
        data.forEach((item: any, index: any) => {
            const key = item.referrerApplicantId;
            const reward = parseFloat(item.rewardRedeemed);

            if (!grouped[key]) {
                grouped[key] = {
                    countryCode: item.countryCode,
                    referrerApplicantId: item.referrerApplicantId,
                    totalReward: 0,
                    transactions: [],
                    id: index
                };
            }

            grouped[key].totalReward += reward;
            grouped[key].transactions.push(item);
        });

        const result = Object.values(grouped);
        return result;
    }

    const handleModalClose = () => {
        setShowTransactionModal(!setShowTransactionModal)
    }

    return (
        <Box>
            {referralRecords && referralRecords.length > 0 ? <ReferralDataGrid
                rows={referralType === 'Credited' ? mapGroupedData(referralRecords) : referralRecords}
                columns={referralType === 'Credited' ? ReferralCreditedColumns : ReferralColumns}
                width={'70vw'} /> : <p>No Referral Found</p>}

            <Dialog open={showTransactionModal} onClose={handleModalClose} fullWidth maxWidth="md">
                <DialogTitle>All Transactions</DialogTitle>
                <DialogContent>
                    <div style={{ height: 400, width: '800', marginTop: 16 }}>
                        <ReferralDataGrid rows={transactionList}
                            width={'600'}
                            columns={ReferralColumns} />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleModalClose}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>

    );
};

export default ReferralTransactions;
