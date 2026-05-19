import React, { useEffect, useState } from 'react'
import { Box, Grid, TextField, Typography, Button } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { BeneficiaryService } from '@/services/beneficiary.service'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import { HelperService } from '@/helpers/helper'
import { FieldValidationService } from '@/services/fieldvalidstion.service'
import { CountryLabelData, CountryReportingLabelDTO } from '@/types/field.validation.type'

const BeneficiaryDetailPage = () => {
  const navigate = useNavigate()
  const { beneficiaryId } = useParams()

  const beneficiary_service = new BeneficiaryService()
  const local_service = new LocalStorageService()
  const helper_service = new HelperService()
  const validation = new FieldValidationService()
  const userCountry = local_service?.get_staff_country()

  const [beneficiaryData, setBeneficiaryData] = useState<any>({})

  // Field validation states
  const [fieldValidations, setFieldValidations] = useState<CountryLabelData>()
  const [fieldLabels, setFieldLabels] = useState<Record<string, string>>({})
  const [fieldMessages, setFieldMessages] = useState<Record<string, string>>({})

  // Helper function to get label by field name
  const getLabel = (fieldName: string): string => {
    return fieldLabels[fieldName] || fieldName.replace(/_/g, ' ')
  }

  // Fetch field validations from API
  useEffect(() => {
    const fetchFieldValidations = async () => {
      try {
        const response = await validation.getScreenFieldvalidation('BENEFICIARY', local_service.get_staff_country(), 'W')

        if (response?.data) {
          setFieldValidations(response.data)

          // Create lookup maps for labels and messages
          const labelsMap: Record<string, string> = {}
          const messagesMap: Record<string, string> = {}

          response.data.countryReportingLabelDTO?.forEach((item: CountryReportingLabelDTO) => {
            const fieldName = item.countryLabelFieldNameAndValidation?.fieldName?.trim()
            if (fieldName) {
              labelsMap[fieldName] = item.countryLabelFieldNameAndValidation?.label
              messagesMap[fieldName] = item.countryLabelFieldNameAndValidation?.validationMessageMandatory
            }
          })

          setFieldLabels(labelsMap)
          setFieldMessages(messagesMap)
        }
      } catch (error) {
        console.error('Error fetching field validations:', error)
      }
    }

    fetchFieldValidations()
  }, [])

  const fetchBeneficiaryData = async () => {
    if (!beneficiaryId) {
      return
    }
    try {
      const response: any = await beneficiary_service.getBeneficiaryDetailsByBeneficiaryId(beneficiaryId)
      setBeneficiaryData({ ...response.data, kycStatus: response?.kycStatus || '' })
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
            {getLabel('Beneficiaries') || 'Beneficiary Details'}
          </Typography>
          {beneficiaryData?.kycStatus === 'v' && (
            <Button
              variant="outlined"
              onClick={() => navigate(`/sendmoney?applicantId=${beneficiaryData?.applicant}&beneficiaryId=${beneficiaryId}`)}
              disabled={!helper_service.checkUserHasPermission(local_service.get_modules()?.TRANSACTION_OUTWARD, 'canCreate')}
            >
              {getLabel('Add_Beneficiary') || 'Add Transaction +'}
            </Button>
          )}
        </Box>

        {/* Beneficiary Information Form */}
        <Box mt={2}>
          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label={getLabel('Applicant_ID') || 'Applicant ID'}
                InputProps={{
                  readOnly: true,
                }}
                size="small"
                variant="filled"
                name="applicantId"
                fullWidth
                value={beneficiaryData?.applicantId || ''}
              />
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
                {getLabel('Beneficiary_ID') || 'Beneficiary Id'} - {beneficiaryId}
              </Typography>
            </Grid>
          </Grid>

          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={2.3}>
              <TextField
                label={getLabel('First_Name_As_Per_The_Bank') || 'Beneficiary First Name'}
                variant="filled"
                name="beneficiaryFirstName"
                fullWidth
                size="small"
                value={beneficiaryData?.beneficiaryFirstName || ''}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            {beneficiaryData?.beneficiaryMiddleName && (
              <Grid item xs={12} sm={2.3}>
                <TextField
                  label={getLabel('Middle_Name') || 'Beneficiary Middle Name'}
                  variant="filled"
                  name="beneficiaryMiddleName"
                  size="small"
                  fullWidth
                  value={beneficiaryData?.beneficiaryMiddleName || ''}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={2.3}>
              <TextField
                label={getLabel('Last_Name_As_Per_The_Bank') || 'Beneficiary Last Name'}
                variant="filled"
                name="beneficiaryLastName"
                size="small"
                fullWidth
                value={beneficiaryData?.beneficiaryLastName || ''}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            {userCountry != 'UAE' && (
              <Grid item xs={12} sm={2.3}>
                <TextField
                  label={getLabel('Nationality') || 'Nationality'}
                  size="small"
                  variant="filled"
                  InputProps={{
                    readOnly: true,
                  }}
                  name="nationality"
                  fullWidth
                  value={beneficiaryData?.nationality || ''}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={2.3}>
              <TextField
                label={getLabel('Country_Of_Residence') || 'Resident Country'}
                size="small"
                variant="filled"
                name="residenceCountry"
                fullWidth
                value={beneficiaryData?.residenceCountry || ''}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Address Section */}
        {userCountry !== 'UAE' && (
          <Box mb={3}>
            <Typography variant="subtitle1" sx={{ color: 'grey', marginBottom: 2 }}>
              <strong>{getLabel('Beneficiary_Address_Details') || 'Address'}</strong>
            </Typography>
            <Grid container spacing={2} marginBottom={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  size="small"
                  fullWidth
                  variant="filled"
                  label={getLabel('Address_Line_1') || 'Address Line 1'}
                  name="physicalAddressLine1"
                  value={beneficiaryData?.physicalAddressLine1 || ''}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="filled"
                  size="small"
                  fullWidth
                  label={getLabel('Address_Line_2') || 'Address Line 2'}
                  name="addressLine2"
                  value={beneficiaryData?.physicalAddressLine2 || ''}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} marginBottom={2}>
              <Grid item xs={12} sm={2.3}>
                <TextField
                  variant="filled"
                  size="small"
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  label={getLabel('Suburb') || 'Suburb'}
                  name="suburb"
                  value={beneficiaryData?.suburb || ''}
                />
              </Grid>
              <Grid item xs={12} sm={2.3}>
                <TextField
                  variant="filled"
                  size="small"
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  label={getLabel('City') || 'City'}
                  name="city"
                  value={beneficiaryData?.city || ''}
                />
              </Grid>
              <Grid item xs={12} sm={2.3}>
                <TextField
                  variant="filled"
                  size="small"
                  fullWidth
                  label={getLabel('Province_State') || 'State/Province'}
                  InputProps={{
                    readOnly: true,
                  }}
                  name="state"
                  value={beneficiaryData?.beneficiaryState || ''}
                />
              </Grid>
              <Grid item xs={12} sm={2.3}>
                <TextField
                  variant="filled"
                  InputProps={{
                    readOnly: true,
                  }}
                  size="small"
                  fullWidth
                  label={getLabel('ZIP_PIN_Code') || 'ZipCode'}
                  name="postCode"
                  value={beneficiaryData?.postCode || ''}
                />
              </Grid>
              <Grid item xs={12} sm={2.3}>
                <TextField
                  variant="filled"
                  InputProps={{
                    readOnly: true,
                  }}
                  size="small"
                  fullWidth
                  label={getLabel('Country') || 'Country'}
                  name="country"
                  value={beneficiaryData?.country || ''}
                />
              </Grid>
            </Grid>
          </Box>
        )}
        {/* Bank Account Section */}
        <Box>
          <Typography variant="subtitle1" sx={{ color: 'grey', marginBottom: 2 }}>
            <strong>{getLabel('Beneficiary_Bank_Details') || 'Bank Details'}</strong>
          </Typography>
          <Grid container spacing={2} marginBottom={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                variant="filled"
                size="small"
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                label={getLabel('Account_Holder_Name') || 'Account Holder Name'}
                name="beneficiaryName"
                value={renderBeneficiaryfullName()}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                variant="filled"
                size="small"
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                label={getLabel('Account_Number') || 'Account Number'}
                name="accountNumber"
                value={beneficiaryData?.accountNumber || ''}
              />
            </Grid>
            {userCountry != 'UAE' && (
              <Grid item xs={12} sm={4}>
                <TextField
                  variant="filled"
                  InputProps={{
                    readOnly: true,
                  }}
                  size="small"
                  fullWidth
                  label={getLabel('Bank_Name') || 'Bank Name'}
                  name="bankName"
                  value={beneficiaryData?.bankName || ''}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={4}>
              <TextField
                variant="filled"
                size="small"
                fullWidth
                label={getLabel('IFSC_BIC') || 'BIC Code/IFSC Code'}
                InputProps={{
                  readOnly: true,
                }}
                name="bankBicCode"
                value={beneficiaryData?.ifscCode || ''}
              />
            </Grid>
            {userCountry !== 'UAE' && (
              <Grid item xs={12} sm={8}>
                <TextField
                  variant="filled"
                  size="small"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                  label={getLabel('Bank_Location') || 'Bank Location'}
                  name="bankLocation"
                  value={beneficiaryData?.bankLocation || ''}
                />
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </HasPermission>
  )
}

export default BeneficiaryDetailPage
