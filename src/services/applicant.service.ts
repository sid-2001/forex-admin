import {
  ApplicantData,
  //@ts-ignore
  ApplicantFormData,
  ApplicantResponse,
  KYCData,
} from '@/types/applicant.type'
import api1 from './apis/api1'
import { BaseService } from './base.service'

class ApplicantService extends BaseService {
  async submitApplicantForm(): Promise<ApplicantResponse> {
    try {
      const { data } = await api1.get('/api/kyc')
      return data
    } catch (err) {
      throw new Error('Unable to submit applicant form. Please try again.')
    }
  }
  async getCompliance(id: any): Promise<any> {
    const url = `/api/compliance/limits/check?applicantId=${id}`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      throw new Error('Please try again.')
    }
  }

  async getApplicantDetalis(): Promise<Array<ApplicantData>> {
    const url = `/api/applicant/applicant-all-details`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      throw new Error('Unable to submit applicant form. Please try again.')
    }
  }
  async getKycById(kycId: string) {
    return api1
      .get(`/api/kyc/kyc/${kycId}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error('Error fetching KYC by ID:', err)
      })
  }

  async getApplicantDetalisByCountry(country: any): Promise<Array<ApplicantData>> {
    const url = `/api/applicant/applicant-all-details/residenceCountry/${country}`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      throw new Error('Unable to submit applicant form. Please try again.')
    }
  }

  async getTransactionsByApplicantId(applicantId: string): Promise<Array<ApplicantData>> {
    const url = `/api/transactions/transaction-details/applicant/id/${applicantId}`
    try {
      const data = await api1.get(url)
      return data.transactionDetailsList
    } catch (err) {
      throw new Error('Unable to submit applicant form. Please try again.')
    }
  }

  async getApplicantKyc(country: any): Promise<Array<KYCData>> {
    const url = `/api/kyc/kyc/kycCountry/${country}`
    try {
      const data = await api1.get(url)
      return data
    } catch (err) {
      throw new Error('Unable to submit applicant form. Please try again.')
    }
  }

  async searchByApplicantId(applicantId: string): Promise<any> {
    const url = `/api/applicant/applicant-all-details/applicantId/${applicantId}`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      throw new Error('Unable to fetch applicant by ID. Please try again.')
    }
  }

  async searchByCountryCode(nationality: string): Promise<ApplicantFormData> {
    const url = `/applicant-all-details/nationality/${nationality}`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      throw new Error('Unable to fetch applicants by country code. Please try again.')
    }
  }

  async searchByApplicantIdAndCountry(applicantId: string, residenceCountry: string): Promise<ApplicantFormData> {
    const url = `/api/applicants/search?applicantId=${applicantId}&country=${residenceCountry}`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      throw new Error('Unable to fetch applicants by both criteria. Please try again.')
    }
  }

  async getDocumentByApplicantId(applicantId: string): Promise<any> {
    const url = `/api/kyc/kyc/document-status/${applicantId}`
    try {
      const data  = await api1.get(url)
      console.log(data)
      return data?.data
    } catch (err) {
      throw new Error('Unable to fetch documents by applicant ID. Please try again.')
    }
  }

  async getConsumersData(user_country:any): Promise<any> {
    const url = `/api/applicant/applicant/overview?country=${user_country}`
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      throw new Error(err as any)
    }
  }

  getApplicantDetailsById(applicantId: string) {
    return api1
      .get(`/api/applicant/applicant-all-details/applicantId/${applicantId}`)
      .then((res) => res.data)
      .catch((err) => {
        console.error('Error fetching applicant details:', err)
        return null
      })
  }
}
export { ApplicantService }
