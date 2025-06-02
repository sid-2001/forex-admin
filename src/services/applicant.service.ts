import { ApplicantData, 
   //@ts-ignore
  ApplicantFormData, ApplicantResponse, KYCData } from '@/types/applicant.type'
import api1 from './apis/api1'
import { BaseService } from './base.service'
import axios from 'axios'
// const { VITE_APP_BACKEND, VITE_APP_URL } = import.meta.env
const { VITE_APP_BACKEND, VITE_APP_URL, VITE_APP_APPLICANT, VITE_APP_KYC, VITE_APP_TRANSACTION } = import.meta.env

class ApplicantService extends BaseService {
  async submitApplicantForm(
     //@ts-ignore
    payload: ApplicantFormData): Promise<ApplicantResponse> {
    let url = VITE_APP_KYC+'/api/kyc'
    try {
      let { data } = await axios.get(url)
      // let response = await api1.post(url, payload)
      //@ts-ignore
      return data
    } catch (err) {
      console.log('error in service file', err)
      throw new Error('Unable to submit applicant form. Please try again.')
    }
  }
  async getCompliance(id:any): Promise<any> {
    let url = `/api/compliance/limits/check?applicantId=${id}`


    // /compliance/limits/check?applicantId=APSIN2025040828909
    try {
      // let { data } = await axios.get(url)
     let {data}=await api1.get(url)
      // let response = await api1.post(url, payload)
      //@ts-ignore
      console.log(data.data)
      return data
    } catch (err) {
      console.log('error in service file', err)
      throw new Error('Unable to submit applicant form. Please try again.')
    }
  }

  async getApplicantDetalis(): Promise<Array<ApplicantData>> {
    let url = `/api/applicant/applicant-all-details`
    try {
      // let { data } = await axios.get(url)
     let {data}=await api1.get(url)
      // let response = await api1.post(url, payload)
      //@ts-ignore
      console.log(data.data)
      return data
    } catch (err) {
      console.log('error in service file', err)
      throw new Error('Unable to submit applicant form. Please try again.')
    }
  }


  async getApplicantDetalisByCountry(country:any): Promise<Array<ApplicantData>> {
    let url = `/api/applicant/applicant-all-details/residenceCountry/${country}`
    try {
      // let { data } = await axios.get(url)
     let {data}=await api1.get(url)
      // let response = await api1.post(url, payload)
      //@ts-ignore
      console.log(data.data)
      return data
    } catch (err) {
      console.log('error in service file', err)
      throw new Error('Unable to submit applicant form. Please try again.')
    }
  }


  async getTransactionsByApplicantId(applicantId: string): Promise<Array<ApplicantData>> {
    let url = `/api/transactions/transaction-details/applicant/id/${applicantId}`
    try {
      let  data  = await api1.get(url)
      // let response = await api1.post(url, payload)
      //@ts-ignore

      console.log("data ios herererer=>",data)
      return data.transactionDetailsList;
    } catch (err) {
      console.log('error in service file', err)
      throw new Error('Unable to submit applicant form. Please try again.')
    }
  }

  async getApplicantKyc(country:any): Promise<Array<KYCData>> {
    let url = `/api/kyc/kyc/kycCountry/${country}`
    try {
      // let { data } = await axios.get(url)
      let data= await api1.get(url)
      //@ts-ignore
      return data
    } catch (err) {
      console.log('error in service file', err)
      throw new Error('Unable to submit applicant form. Please try again.')
    }
  }

  async searchByApplicantId(applicantId: string): Promise<ApplicantResponse> {
    // let url = `/api/applicants/${applicantId}`;
    let url = `/api/applicant/applicant-all-details/applicantId/${applicantId}`
    try {
      let data = await api1.get(url)
      // let {data} = await axios.get(url)
      return data
    } catch (err) {
      console.log('Error in service file:', err)
      throw new Error('Unable to fetch applicant by ID. Please try again.')
    }
  }

  async searchByCountryCode(nationality: string): Promise<ApplicantFormData> {
    let url = VITE_APP_APPLICANT+`/applicant-all-details/nationality/${nationality}`
    try {
      let {data} = await axios.get(url)
      return data
    } catch (err) {
      console.log('Error in service file:', err)
      throw new Error('Unable to fetch applicants by country code. Please try again.')
    }
  }

  async searchByApplicantIdAndCountry(applicantId: string, residenceCountry: string): Promise<ApplicantFormData> {
    let url = VITE_APP_APPLICANT+`/api/applicants/search?applicantId=${applicantId}&country=${residenceCountry}`
    try {
      let {data} = await api1.get(url)
      return data
    } catch (err) {
      console.log('Error in service file:', err)
      throw new Error('Unable to fetch applicants by both criteria. Please try again.')
    }
  }
}
export { ApplicantService }
