import { BeneficiaryFormData, BeneficiaryResponse } from '@/types/beneficiary.type'
import api1 from './apis/api1'
import { BaseService } from './base.service'

class BeneficiaryService extends BaseService {
  async getBeneficiaryDetailsByBeneficiaryId(beneficiaryId: string): Promise<BeneficiaryFormData> {
    const url = `/api/applicant/beneficiary/${beneficiaryId}`
    try {
      const data = await api1.get(url)
      return data
    } catch (err) {
      console.error('Error fetching  data:', err)
      throw new Error('Unable to fetch applicant data. Please try again.')
    }
  }
}
export { BeneficiaryService }
