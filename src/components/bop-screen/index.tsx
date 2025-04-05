import React, { useEffect, useState } from 'react'
import { Typography, Grid, Box, TextField, Select, FormControl, InputLabel, MenuItem, Button } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { useParams } from 'react-router-dom'

const { VITE_FOREX_NODE_APP_URL } = import.meta.env

// const backendUrl = VITE_FOREX_NODE_APP_URL
const backendUrl = VITE_FOREX_NODE_APP_URL

const disableFormFieldsViaStatus = 'Released'
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
  const [bopCat, setbopCat] = useState<any>(null)

  const validateForm = () => {
    // const newErrors: any = {};
    // let isValid = true;
    // Object.keys(formData).forEach((field:any) => {
    //   //@ts-ignore
    //   if (!formData[field]) {
    //     newErrors[field] = 'This field is required';
    //     isValid = false;
    //   }
    // });
    // // Specific validation for email format
    // if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
    //   newErrors.email = 'Please enter a valid email address';
    //   isValid = false;
    // }
    // setErrors(newErrors);
    // return isValid;
  }

  const handleSubmit = async () => {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')

    const resp = JSON.stringify({
      ...formData,
      name: `${formData.first_name} ${formData.middle_name} ${formData.last_name}`,
    })

    console.log(resp, 'resp')
    const requestOptions: any = {
      method: 'PUT',
      headers: myHeaders,
      body: resp,
      redirect: 'follow',
    }

    fetch(`${backendUrl}/bop/${formData.id}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result, 'payal')
        window.location.reload()
      })
      .catch((error) => console.error(error))

    // const isValid = validateForm();
    // if (!isValid) return;
    // console.log("Dattttaaa",formData);
    // try {
    //   const response = await applicant_service.submitApplicantForm(formData);
    //   //@ts-ignore
    //   if (response.status == 200) {
    //     console.log("200", formData);
    //     setText('Applicant Successfully Added');
    //     setType('success');
    //     setOpen(true);
    //     alert("Applicant created successfully!");
    //     navigate('/applicant');
    //   } else {
    //     console.log("errorororororo");
    //     setText('Unable to Submit Applicant');
    //     setType('error');
    //     setOpen(true);
    //   }
    // } catch (error) {
    //   console.error('Error submitting form:', error);
    //   setText('Error while submitting form');
    //   setType('error');
    //   setOpen(true);
    // }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: any; value: any }>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }))
  }

  // const handleBopCategoryChange = (e: React.ChangeEvent<HTMLInputElement | { name?: any; value: any }>) => {
  //   const { name, value } = e.target
  //   setbopCat((prev: any) => ({
  //     ...prev,
  //     [name]: value,
  //   }))
  // }

  const handleReleaseBopData = () => {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')

    const payload = JSON.stringify({
      transaction_attempt: Number(transaction_attempt),
      transaction_number: transactionId,
      sap_status: 'Released',
    })

    const requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      body: payload,
      redirect: 'follow',
    }

    fetch(`${backendUrl}/bop/release-bopdata`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result, 'payal')
        // window.location.reload()
      })
      .catch((error) => console.error(error))
  }

  const handleCancelReplaceBopFunc = () => {
    console.log(formData, 'formdata')
    console.log(bopCat, 'bop category data')

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

    console.log(payload, 'final payload')

    const requestOptions: any = {
      method: 'POST',
      headers: myHeaders,
      body: payload,
      redirect: 'follow',
    }

    fetch(`${backendUrl}/bop/cancelReplaceTransaction`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result, 'payal')
        window.location.reload()
      })
      .catch((error) => console.error(error))
  }

  const fetchBopBetailById = async () => {
    fetch(`${backendUrl}/bop/${transactionId}`, {
      method: 'GET', // The HTTP method (GET by default, so this is optional)
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((result) => {
        setBopData({ ...result.data })
        const { data } = result
        setFormData({
          ...data,
          first_name: data.name.split(' ')[0],
          middle_name: data?.name.split(' ').length === 3 ? data?.name.split(' ')[1] : '',
          last_name: data.name.split(' ').length === 3 ? data.name.split(' ')[2] : data.name.split(' ')[1],
          dob: dayjs(data.dob).format('MM/DD/YYYY'),
        })
      })
      .catch((error) => console.error(error))
  }

  const fetchBopCategoryDataById = async () => {
    fetch(`${backendUrl}/bopCategory/${transactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((result) => {
        setbopCat(result.data)
      })
      .catch((error) => console.error(error))
  }

  useEffect(() => {
    if (transactionId) {
      fetchBopBetailById()
      fetchBopCategoryDataById()
    }
  }, [])

  return (
    <Box style={{ width: '80vw' }}>
      <Box sx={{ textAlign: 'right' }}>
        <Button variant="outlined" color="primary" onClick={() => handleReleaseBopData()} disabled={formData.sap_status === 'Released'}>
          Release
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{ marginLeft: '10px' }}
          disabled={!(bopData?.sap_status === 'Nack')}
          onClick={() => handleCancelReplaceBopFunc()}
        >
          Cancel Replace Bop
        </Button>
      </Box>
      <Box>
        <Typography variant="h5">Bop Details</Typography>
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
          <TextField size="small" label="Sap Status" disabled variant="outlined" name="sap_status" value={formData.sap_status || ''} fullWidth />
        </Grid>
      </Grid>

      <Box mt={3}>
        <Typography variant="h5">Bop Category Details</Typography>
      </Box>

      <Grid container spacing={2} mt={1}>
        <Grid item xs={3}>
          <TextField
            size="small"
            label="Bop Category"
            variant="outlined"
            name="bop_category"
            value={bopCat?.bop_category || '401'}
            fullWidth
            // onChange={handleBopCategoryChange}
            disabled
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            size="small"
            label="Bop Sub Category"
            variant="outlined"
            name="bop_subcategory"
            value={bopCat?.bop_subcategory || '00'}
            fullWidth
            // onChange={handleBopCategoryChange}
            disabled
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            size="small"
            label="Category Description"
            variant="outlined"
            name="bop_description"
            value={bopCat?.bop_description || ''}
            fullWidth
            // onChange={handleBopCategoryChange}
            disabled
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

        <Grid item xs={6}>
          <TextField
            size="small"
            label="Excon Ruling Indicator"
            variant="outlined"
            name="excon_ruling_indicator"
            value={bopCat?.excon_ruling_indicator || ''}
            fullWidth
            disabled
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            size="small"
            label="Excon Ruling Section"
            variant="outlined"
            name="excon_ruling_section"
            value={bopCat?.excon_ruling_section || ''}
            fullWidth
            disabled
          />
        </Grid>

        {/* <Grid item xs={3}>
          <TextField
            size="small"
            label="Transaction Purpose"
            variant="outlined"
            name="transaction_purpose"
            value={bopCat?.transaction_purpose || ''}
            disabled
            fullWidth
          />
        </Grid> */}
        <Grid item xs={6}>
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
        <Grid item xs={6}>
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
      </Grid>

      <Box mt={3}>
        <Typography variant="h5">Resident Details</Typography>

        <Grid container spacing={2} mt={1}>
          <Grid item xs={2.2}>
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
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={2.2}>
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
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={2.2}>
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
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={2.2}>
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
                disabled={bopData?.sap_status === disableFormFieldsViaStatus}
              >
                {genderArry.map((item, ind) => (
                  <MenuItem key={ind} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2.2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date Of Birth"
                //@ts-ignore
                value={formData.dob ? dayjs(formData.dob) : null}
                onChange={(newDate: any) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    dob: newDate.format('MM/DD/YYYY'),
                  }))
                }}
                disabled={bopData?.sap_status === disableFormFieldsViaStatus}
                slotProps={{ textField: { size: 'small' } }}
                //@ts-ignore
                renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={2.2}>
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
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={2.2}>
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
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={2.2}>
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
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={2.2}>
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
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={2.2}>
            <TextField
              size="small"
              label="Account Identifier"
              variant="outlined"
              name="account_identifier"
              fullWidth
              value={formData.account_identifier || ''}
              disabled
            />
          </Grid>
        </Grid>

        <Box mt={3}>
          <Typography variant="h6">Physical Address</Typography>
        </Box>

        <Grid container spacing={2} mt={1}>
          <Grid item xs={4}>
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
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={4}>
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
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Address Line 3"
              fullWidth
              size="small"
              name="physical_address_line3"
              variant="outlined"
              value={formData.physical_address_line3 || ''}
              onChange={handleChange}
              error={Boolean(errors.physical_address_line3)}
              helperText={errors.physical_address_line3}
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>

          <Grid item xs={2.2}>
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
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={2.2}>
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
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={2.2}>
            <TextField
              label="State/Provance"
              fullWidth
              size="small"
              name="residence_state"
              variant="outlined"
              value={formData.residence_state || ''}
              onChange={handleChange}
              error={Boolean(errors.residence_state)}
              helperText={errors.residence_state}
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={2.2}>
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
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={2.2}>
            <TextField
              label="Country"
              size="small"
              fullWidth
              name="residence_country"
              variant="outlined"
              value={formData.residence_country || ''}
              onChange={handleChange}
              error={Boolean(errors.residence_country)}
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
              helperText={errors.residence_country}
            />
          </Grid>
        </Grid>

        <Box mt={3}>
          <Typography variant="h6">Postal Address</Typography>
        </Box>

        <Grid container spacing={2} mt={2}>
          <Grid item xs={4}>
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
            />
          </Grid>
          <Grid item xs={4}>
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
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Postal Address Line 3"
              fullWidth
              size="small"
              name="postal_address_line3"
              variant="outlined"
              value={formData.postal_address_line3 || ''}
              onChange={handleChange}
              error={Boolean(errors.postal_address_line3)}
              helperText={errors.postal_address_line3}
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>

          <Grid item xs={2.2}>
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
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={2.2}>
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
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={2.2}>
            <TextField
              label="Postal State/Postal Provance"
              fullWidth
              size="small"
              name="postal_state"
              variant="outlined"
              value={formData.postal_state || ''}
              onChange={handleChange}
              error={Boolean(errors.postal_state)}
              helperText={errors.postal_state}
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={2.2}>
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
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
          <Grid item xs={2.2}>
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
              disabled={bopData?.sap_status === disableFormFieldsViaStatus}
            />
          </Grid>
        </Grid>
      </Box>

      <Box mt={3}>
        <Typography variant="h5">Non Resident Details</Typography>
      </Box>

      <Grid container spacing={2} mt={1}>
        <Grid item xs={3}>
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
        <Grid item xs={3}>
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
        <Grid item xs={3}>
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
        <Grid item xs={3}>
          <TextField
            label="Address Line 3"
            fullWidth
            size="small"
            name="benificiary_physical_address_line3"
            variant="outlined"
            value={formData.benificiary_physical_address_line3 || ''}
            disabled
          />
        </Grid>
        <Grid item xs={2}>
          <TextField
            label="Suburb"
            fullWidth
            size="small"
            name="benificiary_suburb"
            variant="outlined"
            value={formData.benificiary_suburb || ''}
            disabled
          />
        </Grid>
        <Grid item xs={2}>
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
        <Grid item xs={2}>
          <TextField
            label="State/Provance"
            fullWidth
            size="small"
            name="benificiary_state"
            variant="outlined"
            value={formData.benificiary_state || ''}
            disabled
          />
        </Grid>
        <Grid item xs={2}>
          <TextField
            label="Zipcode"
            size="small"
            fullWidth
            name="benificiary_postcode"
            variant="outlined"
            value={formData.benificiary_postcode || ''}
            disabled
          />
        </Grid>
        <Grid item xs={2}>
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
        <Grid item xs={2}>
          <TextField
            size="small"
            label="Non Resident Account Identifier"
            variant="outlined"
            name="beneficiary_account_identifier"
            fullWidth
            value={'12345678'}
            disabled
          />
        </Grid>
      </Grid>

      <Box mt={3}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Box>
    </Box>
  )
}

export default BopScreen
