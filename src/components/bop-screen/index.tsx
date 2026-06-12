import React, { useCallback, useEffect, useState } from 'react'
import { Typography, Grid, Box, TextField, Select, FormControl, InputLabel, MenuItem, Button } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { useParams } from 'react-router-dom'
import { HelperService } from '@/helpers/helper'
import { LocalStorageService } from '@/helpers/local-storage-service'
import HasPermission from '../permissionWrapper'
import ConfirmationModal from '../logout/logout.component'
import { useTheme } from '@emotion/react'
import { BopService } from '@/services/bop.services'
import { TransactionService } from '@/services/transaction.service'
import { FieldValidationService } from '@/services/fieldvalidstion.service'
import { CountryLabelData, CountryReportingLabelDTO } from '@/types/field.validation.type'

const genderArry = [
  { label: 'Male', value: 'M' },
  { label: 'Female', value: 'F' },
]

const fieldNamesMapping: any = {
  first_name: 'name',
  last_name: 'name',
  middle_name: 'name',
  contact_details: 'phoneNumber',
  email: 'email',
  physical_address_line1: 'address',
  physical_address_line2: 'address',
  postal_address_line1: 'address',
  postal_address_line2: 'address',
}

const requiredFormFields = [
  'first_name',
  'last_name',
  'email',
  'physical_address_line1',
  'physical_address_line2',
  'postal_address_line1',
  'postal_address_line2',
  'contact_details',
]

const BopScreen: React.FC = () => {
  const { transactionId, transaction_attempt } = useParams()
  const [formData, setFormData] = useState<any>({})
  const [formErrors, setFormErrors] = useState<any>({})
  const [bopData, setBopData] = useState<any>({})
  const [bopCat, setbopCat] = useState<any>({})
  const [bopCategory, setBopCategory] = useState<any>([])
  const [confirmReleaseModal, setConfirmReleaseModal] = useState<boolean>(false)
  const [stpErrors, setStpErrors] = useState<any>([])
  const [validationRules, setValidationRules] = useState<any>([])
  const local_service = new LocalStorageService()
  const helper = new HelperService()
  const bopService = new BopService()
  const transaction_Service = new TransactionService()
  const validation = new FieldValidationService()
  const [isEditing, setIsEditing] = useState(false)
  const [bopCategorySelected, setBopCategorySelected] = useState(null)

  // Field validation states
  const [fieldValidations, setFieldValidations] = useState<CountryLabelData>()
  const [fieldLabels, setFieldLabels] = useState<Record<string, string>>({})
  const [fieldMessages, setFieldMessages] = useState<Record<string, string>>({})

  const parseData = local_service.get_staff_access()
  const disableFormFieldsViaStatus =
    stpErrors?.length === 0 &&
    formData.transaction_status === 'RELEASED' &&
    helper.checkUserHasPermission(local_service.get_modules()?.PAYMENT_INFORMATION, 'canUpdate')
  //@ts-ignore
  const userLoggedInCountry = parseData?.staffCountry
  const userCountry = local_service?.get_staff_country()
  const hideForUAE = userCountry === 'UAE'

  // Helper function to get label by field name
  const getLabel = (fieldName: string): string => {
    return fieldLabels[fieldName] || fieldName.replace(/_/g, ' ')
  }

  // Helper function to get validation message by field name
  const getValidationMessage = (fieldName: string): string => {
    return fieldMessages[fieldName] || ''
  }

  // Fetch field validations from API
  useEffect(() => {
    const fetchFieldValidations = async () => {
      try {
        const response = await validation.getScreenFieldvalidation('BOP', local_service.get_staff_country(), 'W')

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

  const validateForm = (formData: any) => {
    const errors: any = {}

    for (const [key, value] of Object.entries(formData)) {
      const validRule = validationRules.find((item: any) => {
        return item.fieldName === fieldNamesMapping[key]
      })
      if (validRule) {
        const pattern = validRule.specialCharacterList.slice(1, -1)
        const regex = new RegExp(pattern)

        if (requiredFormFields.includes(key) && value === '') {
          errors[key] = getValidationMessage(key) || `Field is required.`
        }
        //@ts-ignore
        else if (value !== '' && (value.length < validRule.minLength || value.length > validRule.maxLength)) {
          errors[key] = `${getLabel(key)} must be between ${validRule.minLength} and ${validRule.maxLength} characters.`
        }

        //@ts-ignore
        else if (value !== '' && !regex.test(value)) {
          errors[key] = validRule.errorMessage
        }
      }
    }
    return errors
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const errors = validateForm(formData)
    setFormErrors(errors)

    if (Object.keys(errors).length === 0) {
      const stp_validation_payload = {
        transactionNumber: transactionId,
        applicantName: formData?.middle_name
          ? `${formData.first_name} ${formData.middle_name} ${formData.last_name}`
          : `${formData.first_name} ${formData.last_name}`,
        physicalAddressLine1: formData?.physical_address_line1,
        physicalAddressLine2: formData?.physical_address_line2,
        postalAddressLine1: formData?.postal_address_line1,
        postalAddressLine2: formData?.postal_address_line1,
        contactType: formData?.contact_type,
        contactDetails: formData?.contact_details,
      }

      const payload = {
        bopData: {
          ...formData,
          name: formData?.middle_name
            ? `${formData.first_name} ${formData.middle_name} ${formData.last_name}`
            : `${formData.first_name} ${formData.last_name}`,
        },
        bopCategoryData: {
          bop_category: bopCat.bop_category,
          bop_sub_category: bopCat.bop_sub_category,
          bop_description: bopCat.bop_description,
          id: bopCat.id,
        },
        staffId: local_service.get_staff_id(),
      }

      try {
        await bopService.validateAndUpdateStpRules(stp_validation_payload)
        await bopService.updateBopData(payload, formData.id)
        window.location.reload()
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: any; value: any }>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleReleaseBopData = async () => {
    const payload = {
      ...bopData,
      ...bopCat,
    }
    try {
      await bopService.releaseBopData(payload)
      window.location.reload()
    } catch (error) {
      console.error(error)
    }
  }

  const handleCancelReplaceBopFunc = async () => {
    delete formData.id
    delete bopCat.id
    const payload = {
      newBopData: {
        ...formData,
        name: `${formData.first_name} ${formData.middle_name} ${formData.last_name}`,
        sap_status: 'Pending',
      },
      newbopCategoryData: { ...bopCat },
    }
    try {
      await bopService.cancelReplaceBop(payload)
      window.location.reload()
    } catch (error) {
      console.error(error)
    }
  }

  const fetchBopBetailById = async () => {
    try {
      const data = await bopService.getBopDetailByTransactionId(transactionId, transaction_attempt)
      setBopData(data[0])
      const userName = data[0]?.name.replace(/\s+/g, ' ')
      setFormData({
        ...data[0],
        first_name: userName.split(' ')[0],
        middle_name: userName.split(' ').length === 3 ? userName.split(' ')[1] : '',
        last_name: userName.split(' ').length === 3 ? userName.split(' ')[2] : userName.split(' ')[1],
        dob: dayjs(data[0].dob).format('YYYY-MM-DD'),
      })
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const fetchBopCategoryDataById = async () => {
    try {
      const response = await bopService.getBopCategoryDetailByTransactionId(transactionId, transaction_attempt)
      setbopCat({
        ...response[0],
        principal_amount: helper.roundToTwoFixed(response[0]?.principal_amount) || 0,
        settlement_amount: helper.roundToTwoFixed(response[0]?.settlement_amount) || 0,
      })

      setBopCategorySelected(response?.bop_category)

      if (response?.bop_category) {
        fetchStaticBopMapping(bopCat.bop_category)
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const fetchStaticBopMapping = async (bopCategoryValue: string) => {
    try {
      const { data } = await bopService.getStaticTableBopData(parseData?.staffCountry)

      if (userLoggedInCountry === data.countryCode) {
        setbopCat((prev: any) => ({
          ...prev,
          bop_category: data.value1,
        }))
      } else {
        setbopCat((prev: any) => ({
          ...prev,
          bop_category: bopCategoryValue,
        }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchBopMatrixCategoriesListing = async () => {
    try {
      const { data } = await bopService.getBopMatrixCategoriesListing(userLoggedInCountry)
      setBopCategory(data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchStpErrorList = async () => {
    try {
      const { data } = await transaction_Service.getStpRules(transactionId)
      setStpErrors(data)
    } catch (error) {
      console.log('err', error)
    }
  }

  const getLocalStorageData = useCallback(() => {
    setValidationRules(local_service.get_validations() || [])
  }, [])

  useEffect(() => {
    if (transactionId) {
      fetchBopBetailById()
      fetchBopCategoryDataById()
      fetchBopMatrixCategoriesListing()
      fetchStpErrorList()
      getLocalStorageData()
    }
  }, [])

  const renderStatus = (status: string) => (status === 'IN_PROGRESS' ? 'IN PROGRESS' : status)

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.PAYMENT_INFORMATION}>
      <Box style={{ width: '80vw', height: '80vh', overflowY: 'scroll', padding: '10px 20px' }}>
        {!hideForUAE && (
          <Box sx={{ textAlign: 'right', marginBottom: '10px' }}>
            <Button variant="contained" sx={{ marginRight: '0.8%' }} onClick={() => setIsEditing(true)} disabled={isEditing}>
              {getLabel('Edit') || 'Edit'}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setConfirmReleaseModal(!confirmReleaseModal)
              }}
              disabled={
                !(
                  stpErrors?.length === 0 &&
                  formData.transaction_status === 'RELEASED' &&
                  helper.checkUserHasPermission(local_service.get_modules()?.PAYMENT_INFORMATION, 'canUpdate') &&
                  formData.status === 'Pending'
                )
              }
            >
              {getLabel('Release') || 'Release'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ marginLeft: '10px' }}
              disabled={!(bopData?.sap_status === 'Nack')}
              onClick={() => handleCancelReplaceBopFunc()}
            >
              {getLabel('Cancel_Replace') || 'Cancel Replace'}
            </Button>
          </Box>
        )}
        {stpErrors?.length > 0 && (
          <Box mb={2} border={'1px solid'} borderRadius={2} padding={'6px'}>
            <Typography variant="h5" gutterBottom>
              {getLabel('STP_Errors') || 'STP Errors'}
            </Typography>
            <Typography variant="body1" color={'red'}>
              {getLabel('STP_Error_Note') || 'Note: These errors need to be fixed before releasing a transaction.'}
            </Typography>
            {stpErrors.map((item: any) => (
              <Typography variant="body2" key={item.id}>
                * {getLabel('Field') || 'Field'}[{item.fieldName}] : {item.errorMessage}
              </Typography>
            ))}
          </Box>
        )}

        <Box>
          <Typography variant="h5" gutterBottom>
            {getLabel('Reporting_Details') || 'Reporting Details'}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <Grid container spacing={2} mt={1}>
            <Grid item xs={2.3}>
              <TextField
                size="small"
                label={getLabel('Transaction_No.') || 'Transaction Number'}
                variant="outlined"
                name="transaction_number"
                value={formData.transaction_number || ''}
                disabled
                fullWidth
              />
            </Grid>
            {!hideForUAE && (
              <Grid item xs={2.3}>
                <TextField
                  size="small"
                  label={getLabel('Transaction_Attempt_No') || 'Transaction Attempt'}
                  variant="outlined"
                  name="transaction_attempt"
                  value={formData.transaction_attempt || 0}
                  fullWidth
                  disabled
                />
              </Grid>
            )}
            <Grid item xs={2.3}>
              <TextField
                size="small"
                label={getLabel('Transaction_Status') || 'Transaction Status'}
                disabled
                variant="outlined"
                name="transaction_status"
                value={renderStatus(formData.transaction_status) || ''}
                fullWidth
              />
            </Grid>
            {!hideForUAE && (
              <Grid item xs={2.3}>
                <TextField
                  size="small"
                  label={getLabel('SARB_Status') || 'Reserve Bank Status'}
                  disabled
                  variant="outlined"
                  name="sap_status"
                  value={formData.sap_status || ''}
                  fullWidth
                />
              </Grid>
            )}
          </Grid>

          <Box mt={3}>
            <Typography variant="h5" gutterBottom>
              {userLoggedInCountry === 'IN' || userLoggedInCountry === 'NG'
                ? getLabel('Purpose_Code_Details') || 'Purpose Code Details'
                : getLabel('BOP_Category_Details') || 'BOP Category Details'}
            </Typography>
          </Box>

          <Grid container spacing={2} mt={1}>
            {hideForUAE && (
              <>
                {/* <Grid item xs={6}>
                  <TextField
                    size="small"
                    label={'Source of Income'}
                    variant="outlined"
                    name="bop_description"
                    value={bopCat?.bop_description || ''}
                    disabled
                    fullWidth
                  />
                </Grid> */}

                <Grid item xs={6}>
                  <TextField
                    size="small"
                    label={'Purpose of Transaction'}
                    variant="outlined"
                    name="bop_description"
                    value={bopCat?.bop_category || ''}
                    disabled
                    fullWidth
                  />
                </Grid>
              </>
            )}
            {!hideForUAE && (
              <>
                <Grid item xs={3}>
                  <FormControl fullWidth>
                    {bopCategorySelected ? (
                      <TextField
                        size="small"
                        label={
                          userLoggedInCountry === 'IN' || userLoggedInCountry === 'NG'
                            ? getLabel('Purpose_Code') || 'Purpose Code'
                            : getLabel('BOP_Category') || 'BOP Category'
                        }
                        disabled
                        value={bopCategorySelected}
                      />
                    ) : (
                      <Select
                        label={userLoggedInCountry === 'IN' ? getLabel('Purpose_Code') || 'Purpose Code' : getLabel('BOP_Category') || 'BOP Category'}
                        variant="outlined"
                        name="bop_category"
                        value={bopCat?.bop_category || ''}
                        size="small"
                        disabled={disableFormFieldsViaStatus || !isEditing}
                        onChange={(e) => {
                          const { value } = e.target
                          const bopItem = bopCategory.find((item: any) => item.bopCategoryCd === value)
                          setbopCat((prev: any) => ({
                            ...prev,
                            bop_category: value,
                            bop_sub_category: bopItem.bopSubCategoryCd,
                            bop_description: bopItem.categoryDescription,
                          }))
                        }}
                      >
                        {bopCategory.map((item: any, ind: any) => (
                          <MenuItem key={ind} value={item.bopCategoryCd}>
                            {item.bopCategoryCd}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    size="small"
                    label={getLabel('Sub_Category') || 'Sub Category'}
                    variant="outlined"
                    name="bop_sub_category"
                    value={bopCat?.bop_sub_category || ''}
                    disabled={!isEditing}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    size="small"
                    label={getLabel('Category_Description') || 'Category Description'}
                    variant="outlined"
                    name="bop_description"
                    value={bopCat?.bop_description || ''}
                    disabled
                    fullWidth
                  />
                </Grid>
              </>
            )}

            <Grid item xs={3}>
              <TextField
                size="small"
                label={getLabel('Principal_Amount') || 'Principal Amount'}
                variant="outlined"
                name="principal_amount"
                value={bopCat?.principal_amount || ''}
                disabled
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                size="small"
                label={getLabel('Principal_Currency') || 'Principal Currency'}
                variant="outlined"
                name="principal_currency"
                value={bopCat?.principal_currency || ''}
                disabled
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                size="small"
                label={getLabel('Settlement_Amount') || 'Settlement Amount'}
                variant="outlined"
                name="settlement_amount"
                value={bopCat?.settlement_amount || ''}
                disabled
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                size="small"
                label={getLabel('Settlement_Currency') || 'Settlement Currency'}
                variant="outlined"
                name="settlement_currency"
                value={bopCat?.settlement_currency || ''}
                disabled
                fullWidth
              />
            </Grid>

            {userLoggedInCountry === 'ZA' && (
              <>
                <Grid item xs={3}>
                  <TextField
                    size="small"
                    label={getLabel('Excon_Ruling_Indicator') || 'Excon Ruling Indicator'}
                    variant="outlined"
                    name="excon_ruling_indicator"
                    value={bopCat?.excon_ruling_indicator || ''}
                    disabled
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    size="small"
                    label={getLabel('Excon_Ruling_Section') || 'Excon Ruling Section'}
                    variant="outlined"
                    name="excon_ruling_section"
                    value={bopCat?.excon_ruling_section || ''}
                    disabled
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    size="small"
                    label={getLabel('Adhoc_Subject') || 'Adhoc Subject'}
                    variant="outlined"
                    name="adhoc_subject"
                    value={bopCat?.adhoc_subject || ''}
                    disabled
                    fullWidth
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    size="small"
                    label={getLabel('Subject_Description') || 'Subject Description'}
                    variant="outlined"
                    name="subject_description"
                    value={bopCat?.subject_description || ''}
                    disabled
                    fullWidth
                  />
                </Grid>
              </>
            )}
          </Grid>

          <Box mt={3}>
            <Typography variant="h5" gutterBottom>
              {getLabel('Resident_Details') || 'Resident Details'}
            </Typography>

            <Grid container spacing={2} mt={1}>
              <Grid item xs={2.3}>
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    label={getLabel('First_Name') || 'First Name'}
                    variant="outlined"
                    name="first_name"
                    value={formData.first_name || ''}
                    onChange={handleChange}
                    error={Boolean(formErrors.first_name)}
                    helperText={formErrors.first_name}
                    disabled={disableFormFieldsViaStatus || !isEditing}
                    required={true}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={2.3}>
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    label={getLabel('Middle_Name') || 'Middle Name'}
                    variant="outlined"
                    name="middle_name"
                    value={formData.middle_name || ''}
                    onChange={handleChange}
                    error={Boolean(formErrors.middle_name)}
                    helperText={formErrors.middle_name}
                    disabled={disableFormFieldsViaStatus || !isEditing}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={2.3}>
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    label={getLabel('Last_Name') || 'Last Name'}
                    variant="outlined"
                    name="last_name"
                    value={formData.last_name || ''}
                    onChange={handleChange}
                    error={Boolean(formErrors.last_name)}
                    helperText={formErrors.last_name}
                    disabled={disableFormFieldsViaStatus || !isEditing}
                    required={true}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={2.3}>
                <FormControl fullWidth>
                  <InputLabel>{getLabel('Gender') || 'Gender'}</InputLabel>
                  <Select
                    label={getLabel('Gender') || 'Gender'}
                    variant="outlined"
                    name="gender"
                    value={formData.gender || ''}
                    size="small"
                    onChange={(e) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }}
                    disabled={disableFormFieldsViaStatus || !isEditing}
                  >
                    {genderArry.map((item, ind) => (
                      <MenuItem key={ind} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2.3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label={getLabel('Date_Of_Birth') || 'Date Of Birth'}
                    format="YYYY-MM-DD"
                    value={formData.dob ? dayjs(formData.dob) : null}
                    onChange={(newDate: any) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        dob: newDate.format('YYYY-MM-DD'),
                      }))
                    }}
                    disabled={disableFormFieldsViaStatus || !isEditing}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={2}>
                <TextField
                  size="small"
                  type="number"
                  label={getLabel('Phone_Number') || 'Phone Number'}
                  variant="outlined"
                  name="contact_details"
                  fullWidth
                  value={formData.contact_details || ''}
                  onChange={handleChange}
                  error={Boolean(formErrors.contact_details)}
                  helperText={formErrors.contact_details}
                  disabled={disableFormFieldsViaStatus || !isEditing}
                  required={true}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  size="small"
                  label={getLabel('Email_Address') || 'Email Address'}
                  variant="outlined"
                  name="email"
                  fullWidth
                  value={formData.email || ''}
                  disabled
                />
              </Grid>
              {userLoggedInCountry === 'ZA' && (
                <Grid item xs={2}>
                  <TextField
                    size="small"
                    label={getLabel('Account_Identifier') || 'Account Identifier'}
                    variant="outlined"
                    name="account_identifier"
                    fullWidth
                    value={formData?.account_identifier || ''}
                    disabled
                  />
                </Grid>
              )}
            </Grid>

            {!hideForUAE && (
              <>
                {' '}
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    {getLabel('Physical_Address') || 'Physical Address'}
                  </Typography>
                </Box>
                <Grid container spacing={2} mt={1}>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <TextField
                        label={getLabel('Address_Line_1') || 'Address Line 1'}
                        size="small"
                        name="physical_address_line1"
                        variant="outlined"
                        value={formData.physical_address_line1 || ''}
                        onChange={handleChange}
                        error={Boolean(formErrors.physical_address_line1)}
                        helperText={formErrors.physical_address_line1}
                        disabled={disableFormFieldsViaStatus || !isEditing}
                        required={true}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <TextField
                        label={getLabel('Address_Line_2') || 'Address Line 2'}
                        size="small"
                        name="physical_address_line2"
                        variant="outlined"
                        value={formData.physical_address_line2 || ''}
                        onChange={handleChange}
                        error={Boolean(formErrors.physical_address_line2)}
                        helperText={formErrors.physical_address_line2}
                        disabled={disableFormFieldsViaStatus || !isEditing}
                        required={true}
                      />
                    </FormControl>
                  </Grid>
                  {userLoggedInCountry === 'ZA' && (
                    <Grid item xs={2.3}>
                      <TextField
                        label={getLabel('Suburb') || 'Suburb'}
                        fullWidth
                        size="small"
                        name="suburb"
                        variant="outlined"
                        value={formData.suburb || ''}
                        onChange={handleChange}
                        error={Boolean(formErrors.suburb)}
                        helperText={formErrors.suburb}
                        disabled={disableFormFieldsViaStatus || !isEditing}
                      />
                    </Grid>
                  )}
                  <Grid item xs={2.3}>
                    <TextField
                      label={getLabel('City') || 'City'}
                      size="small"
                      fullWidth
                      name="city"
                      variant="outlined"
                      value={formData.city || ''}
                      onChange={handleChange}
                      error={Boolean(formErrors.city)}
                      helperText={formErrors.city}
                      disabled={disableFormFieldsViaStatus || !isEditing}
                    />
                  </Grid>
                  <Grid item xs={2.3}>
                    <TextField
                      label={getLabel('State_Province') || 'State/Province'}
                      fullWidth
                      size="small"
                      name="residence_state"
                      variant="outlined"
                      value={formData.residence_state || ''}
                      onChange={handleChange}
                      error={Boolean(formErrors.residence_state)}
                      helperText={formErrors.residence_state}
                      disabled={disableFormFieldsViaStatus || !isEditing}
                    />
                  </Grid>
                  <Grid item xs={2.3}>
                    <TextField
                      label={getLabel('Postal_Code') || 'Postal Code'}
                      size="small"
                      fullWidth
                      name="postcode"
                      variant="outlined"
                      value={formData.postcode || ''}
                      onChange={handleChange}
                      error={Boolean(formErrors.postcode)}
                      helperText={formErrors.postcode}
                      disabled={disableFormFieldsViaStatus || !isEditing}
                    />
                  </Grid>
                  <Grid item xs={2.3}>
                    <TextField
                      label={getLabel('Country') || 'Country'}
                      size="small"
                      fullWidth
                      name="residence_country"
                      variant="outlined"
                      value={formData.residence_country || ''}
                      onChange={handleChange}
                      error={Boolean(formErrors.residence_country)}
                      disabled={disableFormFieldsViaStatus || !isEditing}
                      helperText={formErrors.residence_country}
                    />
                  </Grid>
                </Grid>
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    {getLabel('Residential_Address') || 'Residential Address'}
                  </Typography>
                </Box>
                <Grid container spacing={2} mt={2}>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        label={getLabel('Address_Line_1') || 'Address Line 1'}
                        name="postal_address_line1"
                        variant="outlined"
                        value={formData.postal_address_line1 || ''}
                        onChange={handleChange}
                        error={Boolean(formErrors.postal_address_line1)}
                        helperText={formErrors.postal_address_line1}
                        disabled={disableFormFieldsViaStatus || !isEditing}
                        required={true}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <TextField
                        label={getLabel('Address_Line_2') || 'Address Line 2'}
                        size="small"
                        name="postal_address_line2"
                        variant="outlined"
                        value={formData.postal_address_line2 || ''}
                        onChange={handleChange}
                        error={Boolean(formErrors.postal_address_line2)}
                        helperText={formErrors.postal_address_line2}
                        disabled={disableFormFieldsViaStatus || !isEditing}
                        required={true}
                      />
                    </FormControl>
                  </Grid>

                  {userLoggedInCountry === 'ZA' && (
                    <Grid item xs={2.3}>
                      <TextField
                        label={getLabel('Suburb') || 'Suburb'}
                        fullWidth
                        size="small"
                        name="postal_suburb"
                        variant="outlined"
                        value={formData.postal_suburb || ''}
                        onChange={handleChange}
                        error={Boolean(formErrors.postal_suburb)}
                        helperText={formErrors.postal_suburb}
                        disabled={disableFormFieldsViaStatus || !isEditing}
                      />
                    </Grid>
                  )}
                  <Grid item xs={2.3}>
                    <TextField
                      label={getLabel('City') || 'City'}
                      fullWidth
                      size="small"
                      name="postal_city"
                      variant="outlined"
                      value={formData.postal_city || ''}
                      onChange={handleChange}
                      error={Boolean(formErrors.postal_city)}
                      helperText={formErrors.postal_city}
                      disabled={disableFormFieldsViaStatus || !isEditing}
                    />
                  </Grid>
                  <Grid item xs={2.3}>
                    <TextField
                      label={getLabel('State_Province') || 'State/Province'}
                      fullWidth
                      size="small"
                      name="postal_state"
                      variant="outlined"
                      value={formData.postal_state || ''}
                      onChange={handleChange}
                      error={Boolean(formErrors.postal_state)}
                      helperText={formErrors.postal_state}
                      disabled={disableFormFieldsViaStatus || !isEditing}
                    />
                  </Grid>
                  <Grid item xs={2.3}>
                    <TextField
                      label={getLabel('Zip_Code') || 'Zip Code'}
                      fullWidth
                      size="small"
                      name="postal_postcode"
                      variant="outlined"
                      value={formData.postal_postcode || ''}
                      onChange={handleChange}
                      error={Boolean(formErrors.postal_postcode)}
                      helperText={formErrors.postal_postcode}
                      disabled={disableFormFieldsViaStatus || !isEditing}
                    />
                  </Grid>
                  <Grid item xs={2.3}>
                    <TextField
                      label={getLabel('Country') || 'Country'}
                      fullWidth
                      size="small"
                      name="postal_country"
                      variant="outlined"
                      value={formData.postal_country || ''}
                      onChange={handleChange}
                      error={Boolean(formErrors.postal_country)}
                      helperText={formErrors.postal_country}
                      disabled={disableFormFieldsViaStatus || !isEditing}
                    />
                  </Grid>
                </Grid>
              </>
            )}
          </Box>

          <Box mt={3}>
            <Typography variant="h5" gutterBottom>
              {getLabel('Beneficiary_Details') || 'Beneficiary Details'}
            </Typography>
          </Box>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={2.3}>
              <TextField
                size="small"
                label={getLabel('Non_Resident_First_Name') || 'Non Resident First Name'}
                variant="outlined"
                name="benificiary_first_name"
                value={formData.benificiary_first_name || ''}
                disabled
                fullWidth
              />
            </Grid>
            {formData.benificiary_middle_name && (
              <Grid item xs={2.3}>
                <TextField
                  size="small"
                  label={getLabel('Non_Resident_Middle_Name') || 'Non Resident Middle Name'}
                  variant="outlined"
                  name="benificiary_middle_name"
                  value={formData.benificiary_middle_name || ''}
                  disabled
                  fullWidth
                />
              </Grid>
            )}
            <Grid item xs={2.3}>
              <TextField
                size="small"
                label={getLabel('Non_Resident_Last_Name') || 'Non Resident Last Name'}
                variant="outlined"
                name="benificiary_last_name"
                value={formData.benificiary_last_name || ''}
                disabled
                fullWidth
              />
            </Grid>
            {!hideForUAE && (
              <>
                <Grid item xs={2.3}>
                  <TextField
                    label={getLabel('Address_Line_1') || 'Address Line 1'}
                    fullWidth
                    size="small"
                    name="benificiary_physical_address_line1"
                    variant="outlined"
                    value={formData.benificiary_physical_address_line1 || ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={2.3}>
                  <TextField
                    label={getLabel('Address_Line_2') || 'Address Line 2'}
                    fullWidth
                    size="small"
                    name="benificiary_physical_address_line2"
                    variant="outlined"
                    value={formData.benificiary_physical_address_line2 || ''}
                    disabled
                  />
                </Grid>

                <Grid item xs={2.3}>
                  <TextField
                    label={getLabel('City') || 'City'}
                    size="small"
                    fullWidth
                    name="benificiary_city"
                    variant="outlined"
                    value={formData.benificiary_city || ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={2.3}>
                  <TextField
                    label={getLabel('State_Province') || 'State/Province'}
                    fullWidth
                    size="small"
                    name="benificiary_state"
                    variant="outlined"
                    value={formData.benificiary_state || ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={2.3}>
                  <TextField
                    label={getLabel('Postal_Code') || 'Postal Code'}
                    size="small"
                    fullWidth
                    name="benificiary_post_code"
                    variant="outlined"
                    value={formData.benificiary_post_code || ''}
                    disabled
                  />
                </Grid>
              </>
            )}

            <Grid item xs={2.3}>
              <TextField
                label={getLabel('Country') || 'Country'}
                size="small"
                fullWidth
                name="benificiary_country"
                variant="outlined"
                value={formData.benificiary_country || ''}
                disabled
              />
            </Grid>
            {userLoggedInCountry === 'ZA' && (
              <Grid item xs={2.3}>
                <TextField
                  size="small"
                  label={getLabel('Non_Resident_Identifier') || 'Non Resident Account Identifier'}
                  variant="outlined"
                  name="non_resident_identifier"
                  fullWidth
                  value={formData.non_resident_identifier || ''}
                  disabled
                />
              </Grid>
            )}
          </Grid>

          {!hideForUAE && (
            <Box mt={3}>
              <Button variant="contained" color="primary" type="submit" disabled={disableFormFieldsViaStatus}>
                {getLabel('Save') || 'Save'}
              </Button>
            </Box>
          )}
        </form>
      </Box>

      <ConfirmationModal
        message={getLabel('Release_Confirmation') || 'You want to Release the transaction?'}
        handleClose={() => {
          setConfirmReleaseModal(!confirmReleaseModal)
        }}
        handleConfirm={() => {
          handleReleaseBopData()
        }}
        showIcon={false}
        confirmBtnText={getLabel('Release') || 'Release'}
        isOpen={confirmReleaseModal}
      />
    </HasPermission>
  )
}

export default BopScreen
