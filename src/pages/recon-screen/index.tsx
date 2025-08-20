import React, { useEffect, useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Divider,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { TransactionService } from '@/services/transaction.service';
import { useTheme } from '@emotion/react';
import StatusDropdown from "../../components/status-recon"
import { useRecoilState } from 'recoil';
import { alertState, alertTextState, alertTypeState } from '@/states/state';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

// Define types
interface TransactionRow {
  id: number;
  applicantTranNumber: string;
  captureTimestamp: string;
  releaseTimestamp: string;
  senderCountry: string;
  senderCurrency: string;
  senderAmount: number;
  receiversCountry: string;
  receiversCurrency: string;
  receiversAmount: number;
  coverNumber: string;
  exchangeRateUsed: number;
  gatewayUsed: string;
  gatewayPercentage: number | null;
  gatewayCharges: number | null;
  platformCharges1: number;
  senderCtryPymtStatus: string | null;
  senderCtryGatewaySettlInd: string | null;
  senderCorrBankName: string;
  senderCorrBankBic: string;
  senderCorrBankSortCode: string;
  rcvCorrBankName: string;
  rcvCorrBankBic: string;
  rcvCorrBankSortCode: string;
  finalBankRecipientName: string | null;
  finalRcptBankName: string | null;
  finalRcptBranchSortCode: string | null;
  finalRcptBankBic: string | null;
  finalRcptBankAcctNum: string | null;
  finalBankMoneyReleasedInd: string | null;
  toCtryBulkMoneyReleasedInd: string | null;
  toCtryBulkMoneyReleaseTxnNum: string | null;
  beneficiaryMoneyReceivedInd: string;
  utrFinalTrn: string;
  senderCtryTransId: string | null;
  rcvCtryTransId: string | null;
  reconStatus: string | null;
  beneficiaryBankTransactionStatus: string | null;
  settlementBankTransactionStatus: string | null;
  settlementTransDate: string | null;
  settlementTransBankName: string | null;
  settlementTransBankSortCode: string | null;
  settlementTransBicCode: string | null;
}


interface TransactionDetails {
  id: number;
  applicantTranNumber: string;
  captureTimestamp: string;
  releaseTimestamp: string;
  senderCountry: string;
  senderCurrency: string;
  senderAmount: number;
  receiversCountry: string;
  receiversCurrency: string;
  receiversAmount: number;
  coverNumber: string;
  exchangeRateUsed: number;
  gatewayUsed: string;
  gatewayPercentage: number;
  gatewayCharges: number;
  platformCharges1: number;
  senderCtryPymtStatus: string;
  senderCtryGatewaySettlInd: string | null;
  senderCorrBankName: string;
  senderCorrBankBic: string;
  senderCorrBankSortCode: string;
  rcvCorrBankName: string;
  rcvCorrBankBic: string;
  rcvCorrBankSortCode: string;
  finalBankRecipientName: string;
  finalRcptBankName: string;
  finalRcptBranchSortCode: string;
  finalRcptBankBic: string;
  finalRcptBankAcctNum: string;
  finalBankMoneyReleasedInd: boolean | null;
  toCtryBulkMoneyReleasedInd: string | null;
  toCtryBulkMoneyReleaseTxnNum: string | null;
  beneficiaryMoneyReceivedInd: string;
  utrFinalTrn: string;
  senderCtryTransId: string;
  rcvCtryTransId: string;
  reconStatus: string;
  beneficiaryBankTransactionStatus: string;
  settlementBankTransactionStatus: string;
  settlementTransDate: string;
  settlementTransBankName: string;
  settlementTransBankSortCode: string;
  settlementTransBicCode: string;
}


export default function TransactionPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
  const [sourcebankTransaction, setsourcebankTransaction] = useState("")
  const [beneficaryTransaction, setbeneficaryTransaction] = useState("")
  const [settlementTransaction, setsettlementTransaction] = useState("")
  const [text, setText] = useRecoilState(alertTextState)
  const [type, setType] = useRecoilState(alertTypeState)
  const [open, setOpen] = useRecoilState(alertState)
  const [reconStatus, setreconStatus] = useState("")
  const navigate = useNavigate();


  // error, processed, settled
  function getStatusColor(
    //@ts-ignore
    status) {
    switch (status?.toLowerCase()) {
      case 'error':
        return 'red';
      case 'processed':
        return 'blue';
      case 'settled':
        return 'green';
      default:
        return 'gray'; // fallback color for unknown statuses
    }
  }

  const handleSave = () => {

    let payload = {
      "beneficiaryBankTransactionStatus": beneficaryTransaction,
      "settlementBankTransactionStatus": settlementTransaction,
      "reconStatus": reconStatus,
      "senderCtryPymtStatus": sourcebankTransaction
    }

    trx_service.updateReconTrxId(
      //@ts-ignore
      transactionDetails?.id, payload).then(data => {

        console.log(data)

        if (data?.id) {



          setText("Update Succesfull")
          setType("success")
        } else {


          setText("Update  UnSuccesfull")
          setType("error")
        }
        setOpen(true)
      })
    //@ts-ignore
    handleViewMore(transactionDetails?.id)

  }

  const [rows, setRows] = useState<Partial<Pick<
    TransactionRow,
    'id' | 'gatewayUsed' | 'senderCtryTransId' | 'rcvCtryTransId' | 'senderCtryGatewaySettlInd' | 'reconStatus'
  >>[]>([])
  let trx_service = new TransactionService()
  const theme: any = useTheme()

  const handleViewMore = async (id: number) => {
    // Simulating API call with sample data
    console.log(id)
    trx_service.getReconTrxId(id).then((data: any) => {
      console.log(data)
      //@ts-ignore
      setTransactionDetails(data?.forexReconTransaction)
      setsourcebankTransaction((data?.forexReconTransaction as TransactionDetails).senderCtryPymtStatus)
      setsettlementTransaction((data?.forexReconTransaction as TransactionDetails).settlementBankTransactionStatus)
      setbeneficaryTransaction((data?.forexReconTransaction as TransactionDetails).beneficiaryBankTransactionStatus)
      setreconStatus((data?.forexReconTransaction as TransactionDetails).reconStatus)


      console.log((data?.forexReconTransaction as TransactionDetails).senderCtryPymtStatus)
      console.log((data?.forexReconTransaction as TransactionDetails).settlementBankTransactionStatus)
      console.log((data?.forexReconTransaction as TransactionDetails).beneficiaryBankTransactionStatus)
    })





    // setTransactionDetails(sampleDetails);
    setDrawerOpen(true);

  };

  useEffect(() => {
    trx_service.getReconTrx().then(data => {

      console.log(data)
      setRows(data)

    })


  }, [])

  // Sample data for the DataGrid
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Transaction ID', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'gatewayUsed', headerName: 'Gateway/Channel', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'senderCtryTransId', headerName: 'Source Bank Trx ID', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'rcvCtryTransId', headerName: 'Destination Bank Trx ID', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'senderCtryGatewaySettlInd', headerName: 'Settlement Trx ID', flex: 1, headerClassName: 'super-app-theme--header' },
    { field: 'reconStatus', headerName: 'Status', flex: 1, headerClassName: 'super-app-theme--header' },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Action',
      flex: 1,
      headerClassName: 'super-app-theme--header',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="View More"
          onClick={() => handleViewMore(params.row.id)}
        />,
      ],
    },
  ];

  return (
    // <Box sx={{ height: 600, width: '80vw',  '& .super-app-theme--header': {
    //         backgroundColor: '#005099',
    //         color: 'white',
    //       }, }}>
    //   <Box>


    //   </Box>

    //   <DataGrid rows={rows} columns={columns}
    //   //@ts-ignore
    //   pageSize={5} />

    <Box
      sx={{
        height: 600,
        width: '80vw',
        '& .super-app-theme--header': {
          backgroundColor: '#005099',
          color: 'white',
        },
        '& .MuiDataGrid-row:nth-of-type(even)': {
          backgroundColor: '#e3f2fd',
        }

      }}
    >
      {/* Heading */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
          }}
        >
          Reconciliation
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)} 
        >
          Back
        </Button>
      </Box>

      {/* Data Grid */}
      <DataGrid
        rows={rows}
        columns={columns}
        //@ts-ignore
        pageSize={5}
      />

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>



        <Box sx={{ width: "50vw", p: 3 }}>
          <Box display="flex" gap={2}>
            <Box flex={1} sx={{
              backgroundColor: theme.palette.primary.main,
              color: "white",

              width: "30%",
              fontWeight: "300",
              padding: "2%"


            }}>
              TRX ID  {transactionDetails?.applicantTranNumber}


            </Box>

            <Box flex={0.1} sx={{
              backgroundColor: getStatusColor(transactionDetails?.reconStatus),
              color: "white",
            
              textAlign: "center",
              fontWeight: "900",
              alignContent: "center",
              padding: "1%"


            }}>
              {transactionDetails?.reconStatus}
            </Box>


          </Box>
          <Typography variant="h6" sx={{
            fontWeight: "500"

          }} gutterBottom>
            <b> Transaction Details</b>
          </Typography>
          {transactionDetails && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <TextField fullWidth label="Applicant Id" value={transactionDetails?.applicantTranNumber || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Destination" value={transactionDetails?.receiversCountry || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Settlement Amount" value={transactionDetails?.receiversAmount || ''} disabled />
                </Grid>

                <Grid item xs={3}>
                  <TextField fullWidth label="Principal Amount" value={transactionDetails?.senderAmount || ''} disabled />
                </Grid>


                <Grid item xs={3}>
                  <TextField fullWidth label="Cover" value={transactionDetails?.coverNumber || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Sender Currency" value={transactionDetails?.senderCurrency || ''} disabled />
                </Grid>

                <Grid item xs={3}>
                  <TextField fullWidth label="Reciver Currency" value={transactionDetails?.receiversCurrency || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Gateway" value={transactionDetails?.gatewayUsed || ''} disabled />
                </Grid>

                <Grid item xs={3}>
                  <TextField fullWidth label="Charges" value={transactionDetails?.gatewayCharges || ''} disabled />
                </Grid>


              </Grid>



              <Typography variant="h6" sx={{
                fontWeight: "500"

              }} gutterBottom>
                <b> Beneficary Details </b>
              </Typography>
              <Grid container spacing={2}>

                <Grid item xs={3}>
                  <TextField fullWidth label="Account Holder Name" value={transactionDetails?.gatewayCharges || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Account Holder" value={transactionDetails?.gatewayCharges || ''} disabled />
                </Grid>

                <Grid item xs={3}>
                  <TextField fullWidth label="Beneficay Id" value={transactionDetails?.beneficiaryMoneyReceivedInd || ''} disabled />
                </Grid>



                <Grid item xs={3}>
                  <TextField fullWidth label="Bank" value={transactionDetails?.rcvCorrBankName || ''} disabled />
                </Grid>


                <Grid item xs={3}>
                  <TextField fullWidth label="IFSC Code" value={transactionDetails?.rcvCorrBankBic || ''} disabled />
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{
                fontWeight: "500"

              }} gutterBottom>
                <b> Source Bank Transaction ID </b> <span style={{
                  backgroundColor: theme.palette.primary.main,
                  padding: '1%',

                  color: "white"


                }}>

                  {(transactionDetails?.senderCtryTransId) ? (transactionDetails?.senderCtryTransId) : "NOT DATA AVAILABLE"}

                </span>
                <span style={{
                  marginLeft: "4%"
                }}>

                  <StatusDropdown value={sourcebankTransaction} onChange={setsourcebankTransaction}></StatusDropdown>
                </span>
              </Typography>



              <Grid container spacing={2} mt={1}>

                <Grid item xs={3}>
                  <TextField fullWidth label="Date" value={transactionDetails.captureTimestamp || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Sender Bank Name" value={transactionDetails.senderCorrBankName || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Sender Bank BIC" value={transactionDetails.senderCorrBankBic || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Sender Sort Code" value={transactionDetails.senderCorrBankSortCode || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Amount Settled" value={transactionDetails?.senderAmount || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="County /Region" value={transactionDetails?.senderCountry || ''} disabled />
                </Grid>



              </Grid>



              <Typography variant="h6" sx={{
                fontWeight: "500"

              }} gutterBottom>
                <b> Beneficary Transacation ID</b> <span style={{
                  backgroundColor: theme.palette.primary.main,
                  padding: '1%',

                  color: "white"


                }}>

                  {(transactionDetails?.rcvCtryTransId) ? (transactionDetails?.rcvCtryTransId) : "NO DATA AVAILABLE"}
                </span>
                <span style={{
                  marginLeft: "4%"
                }}>

                  <StatusDropdown value={beneficaryTransaction} onChange={setbeneficaryTransaction}></StatusDropdown>
                </span>
              </Typography>






              <Grid container spacing={2} mt={1}>

                <Grid item xs={3}>
                  <TextField fullWidth label="Date" value={transactionDetails.captureTimestamp || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label=" Bank Name" value={transactionDetails.rcvCorrBankName || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label=" Bank BIC Code" value={transactionDetails.rcvCorrBankBic || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Bank Sort Code" value={transactionDetails.rcvCorrBankSortCode || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Amount Settled" value={transactionDetails?.receiversAmount || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="County /Region" value={transactionDetails?.receiversCountry || ''} disabled />
                </Grid>



              </Grid>




              <Typography variant="h6" sx={{
                fontWeight: "500"

              }} gutterBottom>
                <b> Settlement Transaction ID</b> <span style={{
                  backgroundColor: theme.palette.primary.main,
                  padding: '1%',
               
                  color: "white"


                }}>

                  {(transactionDetails?.utrFinalTrn) ? (transactionDetails?.utrFinalTrn) : "NO DATA AVAILABLE"}

                </span>
                <span style={{
                  marginLeft: "4%"
                }}>

                  <StatusDropdown value={settlementTransaction} onChange={setsettlementTransaction}></StatusDropdown>
                </span>
              </Typography>



              <Grid container spacing={2} mt={1}>

                <Grid item xs={3}>
                  <TextField fullWidth label="Date" value={transactionDetails.settlementTransDate || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label=" Bank Name" value={transactionDetails.settlementTransBankName || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label=" Bank BIC" value={transactionDetails.settlementTransBicCode || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Sort Code" value={transactionDetails.settlementTransBankSortCode || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="Amount Settled" value={transactionDetails?.receiversAmount || ''} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField fullWidth label="County /Region" value={transactionDetails?.receiversCountry || ''} disabled />
                </Grid>



              </Grid>


              <Box mt={4}>

                <Button variant='outlined' onClick={handleSave}>Save</Button>
              </Box>


            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
