import React, { useEffect, useState } from 'react'
import { Box, Grid, TextField, Typography, Button } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { BeneficiaryService } from '@/services/beneficiary.service'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { HelperService } from '@/helpers/helper'
const beneficiary_service = new BeneficiaryService()
const local_service = new LocalStorageService()
const helper_service = new HelperService()

const BeneficiaryDetailPage = () => {
  const navigate = useNavigate()
  const { beneficiaryId } = useParams()

  const [beneficiaryData, setBeneficiaryData] = useState<any>({})

  const fetchBeneficiaryData = async () => {
    if (!beneficiaryId) {
      return
    }
    try {
      const data = await beneficiary_service.getBeneficiaryDetailsByBeneficiaryId(beneficiaryId)
      setBeneficiaryData(data)
    } catch (err) {
      console.error('Error fetching data')
    }
  }

  useEffect(() => {
    fetchBeneficiaryData()
  }, [beneficiaryId])

  const renderBeneficiaryfullName = () => {
    const { beneficiaryLastName, beneficiaryFirstName } = beneficiaryData
    return beneficiaryData?.beneficiaryMiddleName
      ? `${beneficiaryFirstName} ${beneficiaryData?.beneficiaryMiddleName} ${beneficiaryLastName}`
      : `${beneficiaryFirstName} ${beneficiaryLastName}`
  }

  return (
    <HasPermission module={local_service.get_modules()?.BENEFICIARY} permission={'canRead'}>
      <Box sx={{ width: '80vw' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Beneficiary Details
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate(`/sendmoney?applicantId=${beneficiaryData?.applicant}`)}
            disabled={!helper_service.checkUserHasPermission(local_service.get_modules()?.TRANSACTION_OUTWARD, 'canCreate')}
          >
            Add Transaction +
          </Button>
        </Box>
        {/* Beneficiary Information Form */}
        <Box mt={2}>
          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={4}>
              <TextField label="Applicant ID" size="small" variant="filled" name="applicantId" fullWidth value={beneficiaryData?.applicant || ''} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography
                variant="body1"
                sx={{
                  backgroundColor: 'primary.main',
                  p: '12px',
                  color: 'white',
                }}
              >
                Beneficiary Id - {beneficiaryId}
              </Typography>
            </Grid>
          </Grid>

          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={2.3}>
              <TextField
                label="Beneficiary First Name"
                variant="filled"
                name="beneficiaryFirstName"
                fullWidth
                size="small"
                value={beneficiaryData?.beneficiaryFirstName || ''}
              />
            </Grid>
            <Grid item xs={12} sm={2.3}>
              <TextField
                label="Beneficiary Middle Name"
                variant="filled"
                name="beneficiaryMiddleName"
                size="small"
                fullWidth
                value={beneficiaryData?.beneficiaryMiddleName || ''}
              />
            </Grid>
            <Grid item xs={12} sm={2.3}>
              <TextField
                label="Beneficiary Last Name"
                variant="filled"
                name="beneficiaryLastName"
                size="small"
                fullWidth
                value={beneficiaryData?.beneficiaryLastName || ''}
              />
            </Grid>
            <Grid item xs={12} sm={2.3}>
              <TextField label="Nationality" size="small" variant="filled" name="nationality" fullWidth value={beneficiaryData?.nationality || ''} />
            </Grid>
            <Grid item xs={12} sm={2.3}>
              <TextField
                label="Resident Country"
                size="small"
                variant="filled"
                name="residenceCountry"
                fullWidth
                value={beneficiaryData?.residenceCountry || ''}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Address Section */}
        <Box mb={3}>
          <Typography variant="subtitle1" sx={{ color: 'grey', marginBottom: 2 }}>
            <strong>Address</strong>
          </Typography>
          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                fullWidth
                variant="filled"
                label="Address Line 1"
                name="physicalAddressLine1"
                value={beneficiaryData?.physicalAddressLine1 || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="filled"
                size="small"
                fullWidth
                label="Address Line 2"
                name="addressLine2"
                value={beneficiaryData?.physicalAddressLine2 || ''}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={2.3}>
              <TextField variant="filled" size="small" fullWidth label="Suburb" name="suburb" value={beneficiaryData?.suburb || ''} />
            </Grid>
            <Grid item xs={12} sm={2.3}>
              <TextField variant="filled" size="small" fullWidth label="City" name="city" value={beneficiaryData?.city || ''} />
            </Grid>
            <Grid item xs={12} sm={2.3}>
              <TextField
                variant="filled"
                size="small"
                fullWidth
                label="State/Province"
                name="state"
                value={beneficiaryData?.beneficiaryState || ''}
              />
            </Grid>
            <Grid item xs={12} sm={2.3}>
              <TextField variant="filled" size="small" fullWidth label="ZipCode" name="postCode" value={beneficiaryData?.postCode || ''} />
            </Grid>
            <Grid item xs={12} sm={2.3}>
              <TextField variant="filled" size="small" fullWidth label="Country" name="country" value={beneficiaryData?.country || ''} />
            </Grid>
          </Grid>
        </Box>

        {/* Bank Account Section */}
        <Box>
          <Typography variant="subtitle1" sx={{ color: 'grey', marginBottom: 2 }}>
            <strong>Bank Details</strong>
          </Typography>
          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                variant="filled"
                size="small"
                fullWidth
                label="Account Holder Name"
                name="beneficiaryName"
                value={renderBeneficiaryfullName()}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                variant="filled"
                size="small"
                fullWidth
                label="Account Number"
                name="accountNumber"
                value={beneficiaryData?.accountNumber || ''}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField variant="filled" size="small" fullWidth label="Bank Name" name="bankName" value={beneficiaryData?.bankName || ''} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                variant="filled"
                size="small"
                fullWidth
                label="BIC Code/ IFSC Code"
                name="bankBicCode"
                value={beneficiaryData?.bankBicCode || ''}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                variant="filled"
                size="small"
                fullWidth
                label="Bank Location"
                name="bankLocation"
                value={beneficiaryData?.bankLocation || ''}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </HasPermission>
  )
}

export default BeneficiaryDetailPage
