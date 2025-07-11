import React, { useEffect, useState } from 'react'
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

const countryCodes = {
  'India': 'IN',
  'South Africa': 'ZA',
  'IN': 'IN',
  'ZA': 'ZA'
}

const { VITE_FOREX_NODE_APP_URL, VITE_APP_BACKEND } = import.meta.env

const backendUrl = VITE_FOREX_NODE_APP_URL
const baseUrl = VITE_APP_BACKEND
const local_service = new LocalStorageService();

const disableFormFieldsViaStatus = 'RELEASED'
const genderArry = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  // {label: 'Other', value: 'Other'},
]

const BopScreen: React.FC = () => {
  const { transactionId, transaction_attempt } = useParams()
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<any>({})
  const [bopData, setBopData] = useState<any>({})
  const [bopCat, setbopCat] = useState<any>({})
  const [bopCategory, setBopCategory] = useState<any>([])
  const [confirmReleaseModal,setConfirmReleaseModal] = useState<boolean>(false);
  const theme = useTheme()
  // const [bopCategoryStaticData, setBopCategoryStaticData] = useState<any>([])

  const storedLocalData = localStorage.getItem('staff_access') || "";
  const parseData = JSON.parse(storedLocalData);
  const helper = new HelperService()
  //@ts-ignore
  const userLoggedInCountry = countryCodes[parseData?.staffCountry]

  const validateForm = () => {
    // const newErrors: any = {};
    // let isValid = true;
    // Object.keys(formData).forEach((field: any) => {
    //   //@ts-ignore
    //   if (!formData[field]) {
    //     newErrors[field] = 'This field is required';
    //     isValid = false;
    //   }
    // });
    // Specific validation for email format
    // if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
    //   newErrors.email = 'Please enter a valid email address';
    //   isValid = false;
    // }
    // setErrors(newErrors);
    // return isValid;
  }

  const handleSubmit = async () => {
    // const isValid = validateForm();
    // console.log(isValid, "---------------", formData)
    // if (!isValid) return;
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')

    const resp = JSON.stringify({
      bopData: {
        ...formData,
        name: `${formData.first_name} ${formData.middle_name} ${formData.last_name}`,
      },
      bopCategoryData: {
        bop_category: bopCat.bop_category,
        bop_sub_category: bopCat.bop_sub_category,
        bop_description: bopCat.bop_description,
        id: bopCat.id
      }
    })

    const requestOptions: any = {
      method: 'PUT',
      headers: myHeaders,
      body: resp,
      redirect: 'follow',
    }

    fetch(`${backendUrl}/bop/${formData.id}`, requestOptions)
      .then((response) => response.json())
      .then(() => {
         window.location.reload()
      })
      .catch((error) => console.error(error))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: any; value: any }>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleReleaseBopData = () => {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')

    const payload = JSON.stringify({
      transaction_attempt: Number(transaction_attempt),
      transaction_number: transactionId,
    })

    const requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      body: payload,
      redirect: 'follow',
    }

    fetch(`${backendUrl}/bop/release-bopdata`, requestOptions)
      .then((response) => response.json())
      .then(() => window.location.reload())
      .catch((error) => console.error(error))
  }

  const handleCancelReplaceBopFunc = () => {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')

    delete formData.id
    delete bopCat.id

    const payload = JSON.stringify({
      newBopData: {
        ...formData,
        name: `${formData.first_name} ${formData.middle_name} ${formData.last_name}`,
        sap_status: 'Pending',
      },
      newbopCategoryData: { ...bopCat },
    })

    const requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      body: payload,
      redirect: 'follow',
    }

    fetch(`${backendUrl}/bop/cancelReplaceTransaction`, requestOptions)
      .then((response) => response.json())
      .then(() => window.location.reload())
      .catch((error) => console.error(error))
  }

  const fetchBopBetailById = async () => {
    fetch(`${backendUrl}/bop/${transactionId}/${transaction_attempt}`, {
      method: 'GET', // The HTTP method (GET by default, so this is optional)
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((result) => {
        setBopData({ ...result.data })
        const { data } = result
        const userName = data?.name.replace(/\s+/g, ' ')
        setFormData({
          ...data,
          first_name: userName.split(' ')[0],
          middle_name: userName.split(' ').length === 3 ? userName.split(' ')[1] : '',
          last_name: userName.split(' ').length === 3 ? userName.split(' ')[2] : userName.split(' ')[1],
          dob: dayjs(data.dob).format('YYYY-MM-DD'),
        })
      })
      .catch((error) => console.error(error))
  }

  const fetchBopCategoryDataById = async () => {
    const response = await fetch(`${backendUrl}/bopCategory/${transactionId}/${transaction_attempt}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const { data } = await response.json();

    setbopCat({
      ...data,
      principal_amount: helper.roundToTwoFixed(data.principal_amount),
      settlement_amount: helper.roundToTwoFixed(data.settlement_amount)
    })

    if (data.bop_category) {
      fetchStaticBopMapping(data.bop_category)
    }

  }

  const fetchStaticBopMapping = async (bopCategoryValue: string) => {
    //@ts-ignore
    const countryCode = countryCodes[parseData?.staffCountry]
    const url = `${baseUrl}/api/static-table/static-data/key1/Bop%20Mapping/countryCode/ZA`
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      //Mapping of bop data
      if ((data.key2 === userLoggedInCountry) && (data.value1 === bopCategoryValue)) {
        setbopCat((prev: any) => ({
          ...prev,
          bop_category: data.value2
        }))
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  // const fetchBopStaticData = async () => {
  //   try {
  //     const countryCode = parseData?.citizenship === 'India' ? 'IN' : 'ZA'
  //     const response = await fetch(`${baseUrl}/api/static-table/forex-static-data/by-country?countryCode=${countryCode}`);

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     setBopCategoryStaticData(data);
  //     const account_identifier_text = data.find((item: any) => item.moduleName === 'Account Identifier')
  //     const non_resident_Acc_identifier_text = data.find((item: any) => item.moduleName === 'Non Resident Account Identifier')

  //     setAccountIdentifierValue(account_identifier_text.keyValue)
  //     setBeneficiaryAccountIdentifierValue(non_resident_Acc_identifier_text.keyValue)

  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //   }
  // }

  const fetchBopMatrixCategoriesListing = async () => {
    const url = `${baseUrl}/api/static-table/forex-bop/by-country?country=${userLoggedInCountry}`
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const { data } = await response.json();
      setBopCategory(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    if (transactionId) {
      console.log("hello here")
      fetchBopBetailById()
      fetchBopCategoryDataById()
      fetchBopMatrixCategoriesListing()
      // fetchStaticBopMapping()
    }
  }, [])

  return (
    <HasPermission permission={'canRead'} module={local_service.get_modules()?.BOP}>
    <Box style={{ width: '80vw', height: '80vh', overflowY: 'scroll', padding: '10px' }}>
      <Box sx={{ textAlign: 'right' }}>
        <Button variant="outlined" color="primary"
          onClick={() => {setConfirmReleaseModal(!confirmReleaseModal)}} 
          disabled={formData.status === 'RELEASED' || !helper.checkUserHasPermission(local_service.get_modules()?.BOP,'canUpdate')}>
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
      <Box>
        <Typography variant="h5" gutterBottom
        //@ts-ignore
        color={theme.palette.secondary.main} >Reporting Details</Typography>
        
      </Box>

      <Grid container spacing={2} mt={1}>
        <Grid item xs={3}>
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
        <Grid item xs={3}>
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
        <Grid item xs={3}>
          <TextField size="small" label="Status" disabled variant="outlined" name="status" value={formData.status || ''} fullWidth />
        </Grid>
        <Grid item xs={3}>
          <TextField size="small" label="Sarb Status" disabled variant="outlined" name="sap_status" value={formData.sap_status || ''} fullWidth />
        </Grid>
      </Grid>

      <Box mt={3}>
        <Typography variant="h5" gutterBottom
        // @its-ignore
        color={theme.palette.secondary.main}>
          {userLoggedInCountry === 'IN' ? "Purpose Code Details" : "Bop Category Details"}
        </Typography>
      </Box>

      <Grid container spacing={2} mt={1}>
        <Grid item xs={3}>
          <FormControl fullWidth>
            <InputLabel>{userLoggedInCountry === 'IN' ? "Purpose Code" : "Bop Category"}</InputLabel>
            <Select
              label={userLoggedInCountry === 'IN' ? "Purpose Code" : "Bop Category"}
              variant="outlined"
              name="bop_category"
              value={bopCat?.bop_category || ''}
              size="small"
              disabled={bopData?.status === disableFormFieldsViaStatus}
              onChange={(e) => {
                const { value } = e.target
                const bopItem = bopCategory.find((item: any) => item.bopCategoryCd === value)
                setbopCat((prev: any) => ({
                  ...prev,
                  bop_category: value,
                  bop_sub_category: bopItem.bopSubCategoryCd,
                  bop_description: bopItem.categoryDescription
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
            disabled
            fullWidth
          />
          {/* <FormControl fullWidth>
            <InputLabel>Sub Category</InputLabel>
            <Select
              label="Sub Category"
              variant="outlined"
              name="bop_sub_category"
              value={bopCat?.bop_sub_category || ''}
              size="small"
              disabled
            >
              {bopCategory.map((item: any, ind: any) => (
                <MenuItem key={ind} value={item.bopSubCategoryCd}>
                  {item.bopSubCategoryCd}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
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
          {/* <FormControl fullWidth>
            <InputLabel>Category Description</InputLabel>
            <Select
              label="Category Description"
              variant="outlined"
              name="bop_description"
              value={bopCat?.bop_description || ''}
              size="small"
              disabled
            >
              {bopCategory.map((item: any, ind: any) => (
                <MenuItem key={ind} value={item.categoryDescription}>
                  {item.categoryDescription}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
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
          {/* <FormControl fullWidth>
            <InputLabel>Excon Ruling Indicator</InputLabel>
            <Select
              label="Excon Ruling Indicator"
              variant="outlined"
              name="excon_ruling_indicator"
              disabled
              value={bopCat?.excon_ruling_indicator || ''}
              size="small"
            >
              {bopCategoryStaticData.filter((item: any) => item.moduleName === "Excon Ruling Indicator").map((mItem: any, ind: any) => (
                <MenuItem key={ind} value={mItem.keyValue}>
                  {mItem.keyValue}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
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
          {/* <FormControl fullWidth>
            <InputLabel>Excon Ruling Section</InputLabel>
            <Select
              label="Excon Ruling Section"
              variant="outlined"
              name="excon_ruling_section"
              value={bopCat?.excon_ruling_section || ''}
              size="small"
              disabled
            >
              {bopCategoryStaticData.filter((item: any) => item.moduleName === "Excon Ruling Section").map((mItem: any, ind: any) => (
                <MenuItem key={ind} value={mItem.keyValue}>
                  {mItem.keyValue}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
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
          {/* <FormControl fullWidth>
            <InputLabel>Adhoc Subject</InputLabel>
            <Select
              label="Adhoc Subject"
              variant="outlined"
              name="adhoc_subject"
              value={bopCat?.adhoc_subject || ''}
              size="small"
              disabled
            >
              {bopCategoryStaticData.filter((item: any) => item.moduleName === "Adhoc Subject").map((mItem: any, ind: any) => (
                <MenuItem key={ind} value={mItem.keyValue}>
                  {mItem.keyValue}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
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
          {/* <FormControl fullWidth>
            <InputLabel>Subject Description</InputLabel>
            <Select
              label="Subject Description"
              variant="outlined"
              name="subject_description"
              value={bopCat?.subject_description || ''}
              size="small"
              disabled
            >
              {bopCategoryStaticData.filter((item: any) => item.moduleName === "Subject Description").map((mItem: any, ind: any) => (
                <MenuItem key={ind} value={mItem.keyValue}>
                  {mItem.keyValue}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
        </Grid>
      </Grid>

      <Box mt={3}>
        <Typography variant="h5" gutterBottom 
        //@ts-ignore
        color = {theme.palette.secondary.main}>Resident Details</Typography>

        <Grid container spacing={2} mt={1}>
          <Grid item xs={2.3}>
            <TextField
              size="small"
              label="First Name"
              variant="outlined"
              name="first_name"
              fullWidth
              value={formData.first_name || ''}
              onChange={handleChange}
              error={Boolean(errors.first_name)}
              helperText={errors.first_name}
              disabled={bopData?.status === disableFormFieldsViaStatus}
              // required={true}
            />
          </Grid>
          <Grid item xs={2.3}>
            <TextField
              size="small"
              label="Middle Name"
              variant="outlined"
              name="middle_name"
              fullWidth
              value={formData.middle_name || ''}
              onChange={handleChange}
              error={Boolean(errors.middle_name)}
              helperText={errors.middle_name}
              disabled={bopData?.status === disableFormFieldsViaStatus}
              // required={true}
            />
          </Grid>
          <Grid item xs={2.3}>
            <TextField
              size="small"
              label="Last Name"
              variant="outlined"
              name="last_name"
              fullWidth
              value={formData.last_name || ''}
              onChange={handleChange}
              error={Boolean(errors.last_name)}
              helperText={errors.last_name}
              disabled={bopData?.status === disableFormFieldsViaStatus}
              // required={true}
            />
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
                disabled={bopData?.status === disableFormFieldsViaStatus}
                // required={true}
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
                format='YYYY-MM-DD'
                value={formData.dob ? dayjs(formData.dob) : null}
                onChange={(newDate: any) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    dob: newDate.format('YYYY-MM-DD'),
                  }))
                }}
                disabled={bopData?.status === disableFormFieldsViaStatus}
                slotProps={{ textField: { size: 'small' } }}
                //@ts-ignore
                renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={2.3}>
            <TextField
              size="small"
              label="Id Type"
              variant="outlined"
              name="id_type"
              fullWidth
              value={formData.id_type || ''}
              onChange={handleChange}
              error={Boolean(errors.id_type)}
              helperText={errors.id_type}
              disabled={bopData?.status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={2.3}>
            <TextField
              size="small"
              label="Id Details"
              variant="outlined"
              name="id_details"
              fullWidth
              value={formData.id_details || ''}
              onChange={handleChange}
              error={Boolean(errors.id_details)}
              helperText={errors.id_details}
              disabled={bopData?.status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={2.3}>
            <TextField
              size="small"
              label="Contact Type"
              variant="outlined"
              name="contact_type"
              fullWidth
              value={formData.contact_type || ''}
              onChange={handleChange}
              error={Boolean(errors.contact_type)}
              helperText={errors.contact_type}
              disabled={bopData?.status === disableFormFieldsViaStatus}
              // required={true}
            />
          </Grid>
          <Grid item xs={2.3}>
            <TextField
              size="small"
              label="Contact Details"
              variant="outlined"
              name="contact_details"
              fullWidth
              value={formData.contact_details || ''}
              onChange={handleChange}
              error={Boolean(errors.contact_details)}
              helperText={errors.contact_details}
              disabled={bopData?.status === disableFormFieldsViaStatus}
              // required={true}
            />
          </Grid>
          <Grid item xs={2.3}>
            <TextField
              size="small"
              label="Account Identifier"
              variant="outlined"
              name="account_identifier"
              fullWidth
              value={formData?.account_identifier || ""}
              disabled
            />
          </Grid>
        </Grid>

        <Box mt={3}>
          <Typography variant="h6" gutterBottom 
          //@its-ignore
          color = {theme.palette.secondary.main}>Physical Address</Typography>
        </Box>

        <Grid container spacing={2} mt={1}>
          <Grid item xs={6}>
            <TextField
              label="Address Line 1"
              fullWidth
              size="small"
              name="physical_address_line1"
              variant="outlined"
              value={formData.physical_address_line1 || ''}
              onChange={handleChange}
              error={Boolean(errors.physical_address_line1)}
              helperText={errors.physical_address_line1}
              disabled={bopData?.status === disableFormFieldsViaStatus}
              // required={true}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Address Line 2"
              fullWidth
              size="small"
              name="physical_address_line2"
              variant="outlined"
              value={formData.physical_address_line2 || ''}
              onChange={handleChange}
              error={Boolean(errors.physical_address_line2)}
              helperText={errors.physical_address_line2}
              disabled={bopData?.status === disableFormFieldsViaStatus}
              // required={true}
            />
          </Grid>

          <Grid item xs={2.3}>
            <TextField
              label="Suburb"
              fullWidth
              size="small"
              name="suburb"
              variant="outlined"
              value={formData.suburb || ''}
              onChange={handleChange}
              error={Boolean(errors.suburb)}
              helperText={errors.suburb}
              disabled={bopData?.status === disableFormFieldsViaStatus}
              // required={true}
            />
          </Grid>
          <Grid item xs={2.3}>
            <TextField
              label="City"
              size="small"
              fullWidth
              name="city"
              variant="outlined"
              value={formData.city || ''}
              onChange={handleChange}
              error={Boolean(errors.city)}
              helperText={errors.city}
              disabled={bopData?.status === disableFormFieldsViaStatus}
              // required={true}
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
              error={Boolean(errors.residence_state)}
              helperText={errors.residence_state}
              disabled={bopData?.status === disableFormFieldsViaStatus}
              // required={true}
            />
          </Grid>
          <Grid item xs={2.3}>
            <TextField
              label="Zipcode"
              size="small"
              fullWidth
              name="postcode"
              variant="outlined"
              value={formData.postcode || ''}
              onChange={handleChange}
              error={Boolean(errors.postcode)}
              helperText={errors.postcode}
              disabled={bopData?.status === disableFormFieldsViaStatus}
              // required={true}
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
              error={Boolean(errors.residence_country)}
              disabled={bopData?.status === disableFormFieldsViaStatus}
              helperText={errors.residence_country}
              // required={true}
            />
          </Grid>
        </Grid>

        <Box mt={3}>
          <Typography variant="h6" gutterBottom 
          //@its-ignore
          color = {theme.palette.secondary.main}>Postal Address</Typography>
        </Box>

        <Grid container spacing={2} mt={2}>
          <Grid item xs={6}>
            <TextField
              size="small"
              label="Postal Address Line 1"
              fullWidth
              name="postal_address_line1"
              variant="outlined"
              value={formData.postal_address_line1 || ''}
              onChange={handleChange}
              error={Boolean(errors.postal_address_line1)}
              helperText={errors.postal_address_line1}
              disabled={bopData?.status === disableFormFieldsViaStatus} 
              //required={true}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Postal Address Line 2"
              fullWidth
              size="small"
              name="postal_address_line2"
              variant="outlined"
              value={formData.postal_address_line2 || ''}
              onChange={handleChange}
              error={Boolean(errors.postal_address_line2)}
              helperText={errors.postal_address_line2}
              disabled={bopData?.status === disableFormFieldsViaStatus}
              // required={true}
            />
          </Grid>

          <Grid item xs={2.3}>
            <TextField
              label="Postal Suburb"
              fullWidth
              size="small"
              name="postal_suburb"
              variant="outlined"
              value={formData.postal_suburb || ''}
              onChange={handleChange}
              error={Boolean(errors.postal_suburb)}
              helperText={errors.postal_suburb}
              disabled={bopData?.status === disableFormFieldsViaStatus}
              // required={true}
            />
          </Grid>
          <Grid item xs={2.3}>
            <TextField
              label="Postal City"
              fullWidth
              size="small"
              name="postal_city"
              variant="outlined"
              value={formData.postal_city || ''}
              onChange={handleChange}
              error={Boolean(errors.postal_city)}
              helperText={errors.postal_city}
              disabled={bopData?.status === disableFormFieldsViaStatus} 
              //required={true}
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
              error={Boolean(errors.postal_state)}
              helperText={errors.postal_state}
              disabled={bopData?.status === disableFormFieldsViaStatus} 
              //required={true}
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
              error={Boolean(errors.postal_postcode)}
              helperText={errors.postal_postcode}
              disabled={bopData?.status === disableFormFieldsViaStatus}
              // required={true}
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
              error={Boolean(errors.postal_country)}
              helperText={errors.postal_country}
              disabled={bopData?.status === disableFormFieldsViaStatus} 
              //required={true}
            />
          </Grid>
        </Grid>
      </Box>

      <Box mt={3}>
        <Typography variant="h5" gutterBottom 
        //@its-ignore 
        color ={theme.palette.secondary.main}>Non Resident Details</Typography>
      </Box>

      <Grid container spacing={2} mt={1}>
        <Grid item xs={4}>
          <TextField
            size="small"
            label="Non Resident Name"
            variant="outlined"
            name="benificiary_name"
            value={formData.benificiary_name || ''}
            disabled
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
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
        <Grid item xs={4}>
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
        {/* <Grid item xs={3}>
          <TextField
            label="Address Line 3"
            fullWidth
            size="small"
            name="benificiary_physical_address_line3"
            variant="outlined"
            value={formData.benificiary_physical_address_line3 || ''}
            disabled
          />
        </Grid> */}
        {/* <Grid item xs={2}>
          <TextField
            label="Suburb"
            fullWidth
            size="small"
            name="benificiary_suburb"
            variant="outlined"
            value={formData.benificiary_suburb || ''}
            disabled
          />
        </Grid> */}
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
            label="Zipcode"
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
        <Grid item xs={2.3}>
          <TextField
            size="small"
            label="Non Resident Account Identifier"
            variant="outlined"
            name="non_resident_account_identifier"
            fullWidth
            value={formData.non_resident_account_identifier || ""}
            disabled
          />
        </Grid>
      </Grid>

      <Box mt={3}>
        <Button variant="contained" color="primary"
         disabled={formData?.status === 'RELEASED'||!helper.checkUserHasPermission(local_service.get_modules()?.BOP,'canUpdate')}
         onClick={handleSubmit}>
          Save
        </Button>
      </Box>
    </Box >

    <ConfirmationModal message='You want to Release the transaction?' 
    handleClose={()=>{setConfirmReleaseModal(!confirmReleaseModal)}} 
    handleConfirm={()=>{handleReleaseBopData()}}
    showIcon={false}
    confirmBtnText={'Release'}
     isOpen={confirmReleaseModal}/>
    </HasPermission>
  )
}

export default BopScreen
