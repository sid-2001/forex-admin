import { useCallback, useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { ApplicantService } from '@/services/applicant.service' // Assuming you have this service
import ApplicantDataGrid from '@/components/applicant'
import HasPermission from '@/components/permissionWrapper'
import { LocalStorageService } from '@/helpers/local-storage-service'

const applicant_service = new ApplicantService()
const local_service = new LocalStorageService()

const ApplicantEnquiry = () => {
  const [applicantList, setapplicantList] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const staffCountry = local_service?.get_staff_country()

  const getApplicantListByCountry = useCallback(async () => {
    try {
      setIsLoading(true)
      const data: any = await applicant_service.getApplicantDetalisByCountry(staffCountry)
      setapplicantList(data)
      setIsLoading(false)
    } catch (error) {
      console.log(error)
    }
  }, [])

  useEffect(() => {
    getApplicantListByCountry()
  }, [])

  return (
    <Box sx={{ width: '80vw', height: '70vh' }}>
      <HasPermission permission={'canRead'} module={local_service.get_modules()?.APPLICANT}>
        <Typography variant="h4" gutterBottom>
          <strong>All Users</strong>
        </Typography>
        <ApplicantDataGrid data={applicantList} loading={isLoading} />
      </HasPermission>
    </Box>
  )
}

export default ApplicantEnquiry
