import { useCallback, useEffect, useState } from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import { ApplicantService } from '@/services/applicant.service' // Assuming you have this service
import { useRecoilState } from 'recoil'
import { selectedCountryState } from '@/states/state'
import ApplicantDataGrid from '@/components/applicant'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'

const applicant_service = new ApplicantService()
const local_service = new LocalStorageService()

const ApplicantEnquiry = () => {
  const [applicantList, setapplicantList] = useState([])
  const theme = useTheme()
  const [selectedCountryoption, setselectedCountryoption] = useRecoilState(selectedCountryState)

  const getApplicantListByCountry = useCallback(async () => {
    try {
      const data: any = await applicant_service.getApplicantDetalisByCountry(selectedCountryoption)
      setapplicantList(data)
    } catch (error) {
      console.log(error)
    }
  }, [])

  useEffect(() => {
    getApplicantListByCountry()
  }, [])

  return (
    <Box padding={2} sx={{ width: '80vw' }}>
      <HasPermission permission={'canRead'} module={local_service.get_modules()?.APPLICANT}>
        <Typography variant="h4" gutterBottom >
          <strong>Applicant </strong>
        </Typography>
        <ApplicantDataGrid data={applicantList} />
      </HasPermission>
    </Box>
  )
}

export default ApplicantEnquiry
