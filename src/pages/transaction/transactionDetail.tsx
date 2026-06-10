import React, { useEffect, useState } from 'react'
import { Box, Typography, TextField, Grid, Chip, useTheme, Divider } from '@mui/material'
import { TransactionService } from '@/services/transaction.service'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { useParams } from 'react-router-dom'
import { HelperService } from '@/helpers/helper'

const TransactionDetailScreen = () => {
  const transaction_Service = new TransactionService()
  const [transactionDetails, setTransactionDetails] = useState<any>(null)
  const theme = useTheme()
  const local_service = new LocalStorageService()
  const helper = new HelperService()
  const userCountry = local_service?.get_staff_country()
  const { transactionId } = useParams()

  const renderTransactionStatus = (transStatus: string) => (transStatus === 'IN_PROGRESS' ? 'IN PROGRESS' : transStatus)

  const fetchTransactionDetailById = async () => {
    if (!transactionId) {
      console.error('Transaction ID is missing in the URL')
      return
    }
    try {
      const response = await transaction_Service.getTransactionDatabyId(transactionId)
      setTransactionDetails(response[0])
    } catch (error) {
      console.error('Error fetching transaction data:', error)
    }
  }

  useEffect(() => {
    fetchTransactionDetailById()
  }, [])

  const renderfullName = () => {
    return transactionDetails && transactionDetails?.middleName
      ? `${transactionDetails?.firstName} ${transactionDetails?.middleName} ${transactionDetails?.lastName}`
      : `${transactionDetails?.firstName} ${transactionDetails?.lastName}`
  }

  return (
    <Box>
      {transactionDetails && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                backgroundColor: theme.palette.primary.main,
                p: '1%',
                color: 'white',
                // marginBottom: 2,
                // width: '40%',
              }}
            >
              TRANSACTION ID : {transactionDetails?.transactionNumber}
            </Typography>
            <Chip label={renderTransactionStatus(transactionDetails?.transactionStatus?.toUpperCase())} color="warning" />
          </Box>

          {/* Transaction Details Section */}
          <Typography variant="subtitle1" fontWeight="bold" sx={{ margin: '10px 0' }}>
            Transaction Details
          </Typography>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Destination"
                variant="filled"
                fullWidth
                //@ts-ignore
                defaultValue={transactionDetails.receiveCountry}
                size="small"
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Transaction Date"
                variant="filled"
                fullWidth
                //@ts-ignore
                defaultValue={helper.convertDateAndTime(transactionDetails.createdLocalDateTime)}
                size="small"
                disabled
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Receiver's Currency"
                variant="filled"
                fullWidth
                //@ts-ignore
                defaultValue={transactionDetails?.principalCurrency}
                size="small"
                disabled
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Receiver's Amount"
                variant="filled"
                fullWidth
                //@ts-ignore
                defaultValue={transactionDetails.principalAmount?.toFixed(2)}
                size="small"
                disabled
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Sender's Currency"
                variant="filled"
                fullWidth
                //@ts-ignore
                defaultValue={transactionDetails.settlementCurrency}
                size="small"
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Sender's Amount"
                variant="filled"
                fullWidth
                //@ts-ignore
                defaultValue={transactionDetails.settlementAmount}
                size="small"
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Charges"
                variant="filled"
                fullWidth
                //@ts-ignore
                defaultValue={transactionDetails.charges}
                size="small"
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Vat charges"
                variant="filled"
                fullWidth
                //@ts-ignore
                defaultValue={transactionDetails.vatCharges}
                size="small"
                disabled
              />
            </Grid>
          </Grid>
          {/* Beneficiary Details Section */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight="bold" sx={{ marginBottom: 2 }}>
            Beneficiary Details
          </Typography>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Account Number" variant="filled" fullWidth defaultValue={transactionDetails?.accountNumber} size="small" disabled />
            </Grid>
            {userCountry !== 'UAE' && (
              <Grid item xs={12} md={6}>
                <TextField label="Bank" variant="filled" fullWidth defaultValue={transactionDetails?.bankName} size="small" disabled />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <TextField
                label="Bank Code"
                variant="filled"
                fullWidth
                defaultValue={transactionDetails?.receiveCountry === 'IN' ? transactionDetails?.ifscCode : transactionDetails?.bankBicCode}
                size="small"
                disabled
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Account Holder Name"
                variant="filled"
                fullWidth
                defaultValue={
                  transactionDetails?.beneficiaryMiddleName
                    ? `${transactionDetails.beneficiaryFirstName} ${transactionDetails.beneficiaryMiddleName} ${transactionDetails.beneficiaryLastName}`
                    : `${transactionDetails.beneficiaryFirstName} ${transactionDetails.beneficiaryLastName}`
                }
                size="small"
                disabled
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight="bold" sx={{ marginBottom: 2 }}>
            Applicant Details
          </Typography>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Applicant Id" variant="filled" fullWidth defaultValue={transactionDetails?.applicantId} size="small" disabled />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Applicant Name" variant="filled" fullWidth defaultValue={renderfullName()} size="small" disabled />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  )
}
export default TransactionDetailScreen
