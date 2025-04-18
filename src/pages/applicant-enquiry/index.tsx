import React, { useEffect, useState } from 'react';
import { Box, Grid, TextField, Typography, Button } from '@mui/material';
import ApplicantTable from '@/components/applicant-table'; // Ensure this component is already set up
import { useNavigate } from 'react-router-dom';
import { ApplicantService } from '@/services/applicant.service'; // Assuming you have this service
import { PieChart } from '@mui/x-charts/PieChart/PieChart';
import { useRecoilState } from 'recoil';
import { applicantView, selectedCountryState } from '@/states/state';
import ApplicantList from '@/components/applicant-list';
import ApplicantDataGrid from '@/components/applicant';

const applicant_service = new ApplicantService();

const ApplicantEnquiry = () => {
  const navigate = useNavigate();
  const [nationality, setNationality] = useState('');
  const [applicantId, setApplicantId] = useState('');

  const [viewapplicatn,setViewApplicant]=useRecoilState(applicantView)




  const [ utilizedLimit, setutilizedLimit ] = useState(0)
  const [availableLimit,setAvailableLimit]=useState(0)
  const[ maxlimit,setMaxlimit]=useState(0)
  const[applicantList,setapplicantList]=useState([])
  const[selectedCountryoption,setselectedCountryoption]=useRecoilState(selectedCountryState)




  useEffect(()=>{
    setViewApplicant(true)
    applicant_service.getApplicantDetalisByCountry(selectedCountryoption=="SA"?"ZA":"IN").then(data=>{
    
      // console.log(data)
//@ts-ignore
      setapplicantList(data)
    
    
    })
    
      },[])
  function LimitPieChart() {
  
    const utilized = Math.abs(utilizedLimit);
    const available = Math.abs(availableLimit);
  
    return (
      <Box sx={{  width: 400, height: 100, }}>
        <PieChart
          series={[
            {
              data: [
                {
                  id: 0,
                  value: utilized,
                  label: 'Utilized Limit',
                  color: '#FF6B6B',
                },
                {
                  id: 1,
                  value: available,
                  label: 'Available Limit',
                  color: '#4ECDC4',
                },
              ],
              innerRadius: 50, // donut shape
              outerRadius: 100,
            },
          ]}
          width={400}
          height={200}
        />
        <Typography
          variant="subtitle2"
          sx={{
            position: 'absolute',
            top: '60%',
            left: '40%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          ₹{maxlimit.toLocaleString()}
          <br />
          Max Limit
        </Typography>
      </Box>
    );
  }




  const [errors, setErrors] = useState({
    nationality: '',
    applicantId: '',
  });
  const [showTable, setShowTable] = useState(false);
  const [filteredApplicants, setFilteredApplicants] = useState([]);





  const handleSearch = async () => {
    setErrors({ nationality: '', applicantId: '' });

    try {
      let data;

      // Call the respective API based on search fields
      if (applicantId && nationality) {
        data = await applicant_service.searchByApplicantIdAndCountry(applicantId, nationality);
        console.log("data=>",data)
      } else if (applicantId) {
        data = await applicant_service.searchByApplicantId(applicantId);
      } else if (nationality) {
        data = await applicant_service.searchByCountryCode(nationality);
      }

      console.log('API Response:', data);

      const applicantsArray = Array.isArray(data) ? data : [data];

      const formattedData = applicantsArray.map((applicant, index) => ({
        id: index + 1,
        applicantId: applicant.data.applicant.applicantId,
        applicantName: applicant.data.applicant.firstName,
        nationality: applicant.data.applicant.nationality,
        residenceCountry: applicant.data.applicant.residenceCountry,
      }));

    //@ts-ignore
      setFilteredApplicants(formattedData);
      setShowTable(true);

    } catch (error) {
      console.error('Error searching applicants:', error);
    }
  };

  const handleAddApplicantDetails = () => {
    navigate("/add-applicant");
  };

  const handleCountryCodeChange = (e:any) => {
    const value = e.target.value.toUpperCase();
    setNationality(value);
  };

  const handleApplicantIdChange = (e:any) => {
    const value = e.target.value.toUpperCase();
    setApplicantId(value);
  };

  return (
    <Box padding={2} sx={{ width: '70vw'}}>
      <Typography variant="h4" gutterBottom>
        <strong>Applicant </strong>
      </Typography>
      

      <Grid container spacing={3} marginBottom={2} alignItems="center" >
        <Grid item xs={3}> {/* Both fields have equal width */}
          {/* <TextField
            variant="standard"
            fullWidth
            label="Applicant ID"
            value={applicantId}
            onChange={handleApplicantIdChange}
            helperText={errors.applicantId || ' '}
            FormHelperTextProps={{
              sx: {
                color: 'red',
              },
            }}
          /> */}
        </Grid>
        {/* <Grid marginInline={4}>
          <strong>OR</strong>
        </Grid> */}

        {/* <Grid item xs={3}> 
          <TextField
            variant="standard"
            fullWidth
            label="Country Code"
            value={nationality}
            onChange={handleCountryCodeChange}
            inputProps={{ maxLength: 3 }}
            helperText={errors.nationality || ' '}
            FormHelperTextProps={{
              sx: {
                color: 'red',
              },
            }}
          />
        </Grid> */}

        {/* <Grid item xs={4} container spacing={2}>
          <Grid item xs={4}>
            <Button variant="contained" fullWidth sx={{ padding: '4px 20px' }} onClick={handleSearch}>
              Search
            </Button>
          </Grid>
         
        </Grid> */}
      </Grid>


<ApplicantDataGrid data={applicantList}/>

      {showTable && <ApplicantTable applicants={filteredApplicants} />}
    </Box>
  );
};

export default ApplicantEnquiry;
