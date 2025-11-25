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

const countryCodes = {
  India: 'IN',
  'South Africa': 'ZA',
  IN: 'IN',
  ZA: 'ZA',
}

const genderArry = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
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
  const theme = useTheme()
  const local_service = new LocalStorageService()
  const helper = new HelperService()
  const bopService = new BopService()
  const transaction_Service = new TransactionService()
  const [isEditing, setIsEditing] = useState(false)

  const parseData = local_service.get_staff_access()
  const disableFormFieldsViaStatus =
    stpErrors?.length === 0 &&
    formData.transaction_status === 'RELEASED' &&
    helper.checkUserHasPermission(local_service.get_modules()?.BOP, 'canUpdate')
  // &&
  // formData.status === 'Pending'

  //@ts-ignore
  const userLoggedInCountry = countryCodes[parseData?.staffCountry]

  const validateForm = (formData: any) => {
    const errors: any = {}

    for (const [key, value] of Object.entries(formData)) {
      // find eleemt in array
      const validRule = validationRules.find((item: any) => {
        return item.fieldName === fieldNamesMapping[key]
      })
      if (validRule) {
        const pattern = validRule.specialCharacterList.slice(1, -1) // remove slashes
        const regex = new RegExp(pattern)
        // required fields check
        if (requiredFormFields.includes(key) && value === '') {
          errors[key] = `Field is required.`
        }
        //@ts-ignore
        else if (value !== '' && (value.length < validRule.minLength || value.length > validRule.maxLength)) {
          errors[key] = `Must be between ${validRule.minLength} and ${validRule.maxLength} characters.`
        }
        //@ts-ignore
        else if (value !== '' && !regex.test(value)) {
          errors[key] = validRule.errorMessage
        }
      }
    }
    return errors // empty object if no errors
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
        // suburb: formData?.suburb,
        // city: formData?.city,
        // postcode: formData?.postcode,
        postalAddressLine1: formData?.postal_address_line1,
        postalAddressLine2: formData?.postal_address_line1,
        // postalSuburb: formData?.postal_suburb,
        // postalCity: formData?.postal_city,
        // postalPostcode: formData?.postal_postcode,
        // postalCountry: formData?.postal_country,
        // idType: formData?.id_type,
        // idDetails: formData?.id_details,
        contactType: formData?.contact_type,
        contactDetails: formData?.contact_details,
        // dob: formData?.dob,
        // residenceCountry: formData?.residence_country,
        // residenceState: formData?.residence_state,
        // postalState: formData?.postal_state,
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
        const stpResponse = await bopService.validateAndUpdateStpRules(stp_validation_payload)
        const response = await bopService.updateBopData(payload, formData.id)
        window.location.reload()
      } catch (error) {
        console.error(error)
      }
    } else {
      return
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: any; value: any }>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }))
  }
  // need to check zero stp rules and trx should be released means funds collected.
  const handleReleaseBopData = async () => {
    const payload = {
      ...bopData,
      ...bopCat,
    }
    try {
      const response = await bopService.releaseBopData(payload)
      window.location.reload()
    } catch (error) {
      console.error(error)
    }
  }
  // need to update this api
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
      const reponse = await bopService.cancelReplaceBop(payload)
      window.location.reload()
    } catch (error) {
      console.error(error)
    }
  }

  const fetchBopBetailById = async () => {
    try {
      const data = await bopService.getBopDetailByTransactionId(transactionId, transaction_attempt)
      setBopData(data)
      const userName = data?.name.replace(/\s+/g, ' ')
      setFormData({
        ...data,
        first_name: userName.split(' ')[0],
        middle_name: userName.split(' ').length === 3 ? userName.split(' ')[1] : '',
        last_name: userName.split(' ').length === 3 ? userName.split(' ')[2] : userName.split(' ')[1],
        dob: dayjs(data.dob).format('YYYY-MM-DD'),
      })
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const fetchBopCategoryDataById = async () => {
    try {
      const response = await bopService.getBopCategoryDetailByTransactionId(transactionId, transaction_attempt)
      setbopCat({
        ...response,
        principal_amount: helper.roundToTwoFixed(response?.principal_amount) || 0,
        settlement_amount: helper.roundToTwoFixed(response?.settlement_amount) || 0,
      })

      if (response?.bop_category) {
        fetchStaticBopMapping(response.bop_category)
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
    }
  }

  const fetchStaticBopMapping = async (bopCategoryValue: string) => {
    //@ts-ignore
    const countryCode = countryCodes[parseData?.staffCountry]

    try {
      const { data } = await bopService.getStaticTableBopData(countryCode)
      //Mapping of bop data

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

      // if (data.key2 === userLoggedInCountry && data.value1 === bopCategoryValue) {
      //   setbopCat((prev: any) => ({
      //     ...prev,
      //     bop_category: data.value2,
      //   }))
      // }
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

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.BOP}>
      <Box style={{ width: '80vw', height: '80vh', overflowY: 'scroll', padding: '10px 20px' }}>
        <Box sx={{ textAlign: 'right', marginBottom: '10px' }}>
          <Button variant="contained" sx={{ marginRight: '0.8%' }} onClick={() => setIsEditing(true)} disabled={isEditing}>
            Edit
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
                helper.checkUserHasPermission(local_service.get_modules()?.BOP, 'canUpdate') &&
                formData.status === 'Pending'
              )
            }
          >
            Release
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ marginLeft: '10px' }}
            disabled={!(bopData?.sap_status === 'Nack')}
            onClick={() => handleCancelReplaceBopFunc()}
          >
            Cancel Replace
          </Button>
        </Box>

        {stpErrors?.length > 0 && (
          <Box mb={2} border={'1px solid'} borderRadius={2} padding={'6px'}>
            <Typography
              variant="h5"
              gutterBottom
              // @ts-ignore
            >
              STP Errors
            </Typography>
            <Typography variant="body1" color={'red'}>
              Note: These errors need to be fixed before releasing a transaction.
            </Typography>
            {stpErrors.map((item: any) => (
              <Typography variant="body2" key={item.id}>
                * Field[{item.fieldName}] : {item.errorMessage}
              </Typography>
            ))}
          </Box>
        )}
        <Box>
          <Typography
            variant="h5"
            gutterBottom
            //@ts-ignore
          >
            Reporting Details
          </Typography>
        </Box>

        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <Grid container spacing={2} mt={1}>
            <Grid item xs={2.3}>
              <TextField
                size="small"
                label="Transaction Number"
                variant="outlined"
                name="transaction_number"
                value={formData.transaction_number || ''}
                disabled
                fullWidth
              />
            </Grid>
            <Grid item xs={2.3}>
              <TextField
                size="small"
                label="Transaction Attempt"
                variant="outlined"
                name="transaction_attempt"
                value={formData.transaction_attempt || 0}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={2.3}>
              <TextField
                size="small"
                label="Transaction Status"
                disabled
                variant="outlined"
                name="transaction_status"
                value={formData.transaction_status || ''}
                fullWidth
              />
            </Grid>
            <Grid item xs={2.3}>
              <TextField size="small" label="Bop Status" disabled variant="outlined" name="status" value={formData.status || ''} fullWidth />
            </Grid>
            <Grid item xs={2.3}>
              <TextField size="small" label="Sarb Status" disabled variant="outlined" name="sap_status" value={formData.sap_status || ''} fullWidth />
            </Grid>
          </Grid>

          <Box mt={3}>
            <Typography
              variant="h5"
              gutterBottom
              // @ts-ignore
            >
              {userLoggedInCountry === 'IN'||"NG" ? 'Purpose Code Details' : 'Bop Category Details'}
            </Typography>
          </Box>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={3}>
              <FormControl fullWidth>
                <InputLabel>{userLoggedInCountry === 'IN' ? 'Purpose Code' : 'Bop Category'}</InputLabel>
                <Select
                  label={userLoggedInCountry === 'IN' ? 'Purpose Code' : 'Bop Category'}
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
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <TextField
                size="small"
                label="Sub Category"
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
                label="Category Description"
                variant="outlined"
                name="bop_description"
                value={bopCat?.bop_description || ''}
                disabled
                fullWidth
              />
            </Grid>

            <Grid item xs={3}>
              <TextField
                size="small"
                label="Principal Amount"
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
                label="Principal Currency"
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
                label="Settlement Amount"
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
                label="Settlement Currency"
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
                    label="Excon Ruling Indicator"
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
                    label="Excon Ruling Section"
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
                    label="Adhoc Subject"
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
                    label="Subject Description"
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
            <Typography
              variant="h5"
              gutterBottom
              //@ts-ignore
            >
              Resident Details
            </Typography>

            <Grid container spacing={2} mt={1}>
              <Grid item xs={2.3}>
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    label="First Name"
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
                    label="Middle Name"
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
                    label="Last Name"
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
                  <InputLabel>Gender</InputLabel>
                  <Select
                    label="Gender"
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
                    label="Date Of Birth"
                    //@ts-ignore
                    format="YYYY-MM-DD"
                    value={formData.dob ? dayjs(formData.dob) : null}
                    onChange={(newDate: any) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        dob: newDate.format('YYYY-MM-DD'),
                      }))
                    }}
                    disabled={disableFormFieldsViaStatus || !isEditing}
                    slotProps={{ textField: { size: 'small' } }}
                    //@ts-ignore
                    renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={2}>
                <TextField
                  size="small"
                  label="Id Type"
                  variant="outlined"
                  name="id_type"
                  fullWidth
                  value={formData.id_type || ''}
                  onChange={handleChange}
                  error={Boolean(formErrors.id_type)}
                  helperText={formErrors.id_type}
                  disabled={disableFormFieldsViaStatus || !isEditing}
                />
              </Grid>
              <Grid item xs={2.5}>
                <TextField
                  size="small"
                  label="Id Details"
                  variant="outlined"
                  name="id_details"
                  fullWidth
                  value={formData.id_details || ''}
                  onChange={handleChange}
                  error={Boolean(formErrors.id_details)}
                  helperText={formErrors.id_details}
                  disabled={disableFormFieldsViaStatus || !isEditing}
                />
              </Grid>
              <Grid item xs={1.5}>
                <TextField
                  size="small"
                  label="Contact Type"
                  variant="outlined"
                  name="contact_type"
                  fullWidth
                  value={formData.contact_type || ''}
                  onChange={handleChange}
                  error={Boolean(formErrors.contact_type)}
                  helperText={formErrors.contact_type}
                  disabled={disableFormFieldsViaStatus || !isEditing}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  size="small"
                  type="number"
                  label="Contact Details"
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
                <TextField size="small" label="Email" variant="outlined" name="email" fullWidth value={formData.email || ''} disabled />
              </Grid>
              {userLoggedInCountry === 'ZA' && (
                <Grid item xs={2}>
                  <TextField
                    size="small"
                    label="Account Identifier"
                    variant="outlined"
                    name="account_identifier"
                    fullWidth
                    value={formData?.account_identifier || ''}
                    disabled
                  />
                </Grid>
              )}
            </Grid>

            <Box mt={3}>
              <Typography
                variant="h6"
                gutterBottom
                //@ts-ignore
              >
                Physical Address
              </Typography>
            </Box>

            <Grid container spacing={2} mt={1}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <TextField
                    label="Address Line 1"
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
                    label="Address Line 2"
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
                    label="Suburb"
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
                  label="City"
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
                  label="State/Province"
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
                  label="Postal Code"
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
                  label="Country"
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
                Postal Address
              </Typography>
            </Box>

            <Grid container spacing={2} mt={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    label="Postal Address Line 1"
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
                    label="Postal Address Line 2"
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
                    label="Postal Suburb"
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
                  label="Postal City"
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
                  label="Postal State/Province"
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
                  label="Postal Zipcode"
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
                  label="Postal Country"
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
          </Box>

          <Box mt={3}>
            <Typography
              variant="h5"
              gutterBottom
              //@ts-ignore
            >
              Non Resident Details
            </Typography>
          </Box>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={2.3}>
              <TextField
                size="small"
                label="Non Resident first Name"
                variant="outlined"
                name="benificiary_first_name"
                value={formData.benificiary_first_name || ''}
                disabled
                fullWidth
              />
            </Grid>
            <Grid item xs={2.3}>
              <TextField
                size="small"
                label="Non Resident Middle Name"
                variant="outlined"
                name="benificiary_middle_name"
                value={formData.benificiary_middle_name || ''}
                disabled
                fullWidth
              />
            </Grid>
            <Grid item xs={2.3}>
              <TextField
                size="small"
                label="Non Resident Last Name"
                variant="outlined"
                name="benificiary_last_name"
                value={formData.benificiary_last_name || ''}
                disabled
                fullWidth
              />
            </Grid>
            <Grid item xs={2.3}>
              <TextField
                label="Address Line 1"
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
                label="Address Line 2"
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
                label="City"
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
                label="State/Province"
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
                label="Postal Code"
                size="small"
                fullWidth
                name="benificiary_post_code"
                variant="outlined"
                value={formData.benificiary_post_code || ''}
                disabled
              />
            </Grid>
            <Grid item xs={2.3}>
              <TextField
                label="Country"
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
                  label="Non Resident Account Identifier"
                  variant="outlined"
                  name="non_resident_identifier"
                  fullWidth
                  value={formData.non_resident_identifier || ''}
                  disabled
                />
              </Grid>
            )}
          </Grid>

          <Box mt={3}>
            <Button variant="contained" color="primary" type="submit" disabled={disableFormFieldsViaStatus}>
              Save
            </Button>
          </Box>
        </form>
      </Box>

      <ConfirmationModal
        message="You want to Release the transaction?"
        handleClose={() => {
          setConfirmReleaseModal(!confirmReleaseModal)
        }}
        handleConfirm={() => {
          handleReleaseBopData()
        }}
        showIcon={false}
        confirmBtnText={'Release'}
        isOpen={confirmReleaseModal}
      />
    </HasPermission>
  )
}

export default BopScreen
