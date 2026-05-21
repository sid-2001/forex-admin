import { BaseService } from './base.service'
import api1 from './apis/api1'
import { Customer } from '@/types/customer.type'

export class KycService extends BaseService {
  async verifyDocument(doccode: string, kycid: string) {
    const url = `/api/kyc/documents/${kycid}/${doccode}/verify`
    try {
      const payload = {
        kycId: kycid, // KYC ID for this document
        documentCode: doccode, // Document Code
      }
      const { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async unverifyDocument(doccode: string, kycid: string) {
    const url = `/api/kyc/documents/${kycid}/${doccode}/unVerify`
    try {
      const payload = {
        kycId: kycid, // KYC ID for this document
        documentCode: doccode, // Document Code
      }
      const { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async changeKycStatus(status: string, kycid: string) {
    const url = `/api/kyc/kyc/kycId/${kycid}/kycStatus/${status}`
    try {
      const { data } = await api1.post(url, {})
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async createComment(payload: any) {
    const url = `/api/kyc/comments`
    try {
      const { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  //@ts-ignore

  async getComment(kyc_id: any): Promise<
    Array<{
      commentId: string
      commentText: string
      commentDate: string // ISO format
      user: string
      kycId: string
    }>
  > {
    const url = `/api/kyc/comments`
    try {
      const data = api1.get(url)
      return data
    } catch (err) {
      console.log(err)
      return null as any
    }
  }

  async getKycById(kyc_id: string): Promise<Customer> {
    const url = `/api/kyc/kyc/${kyc_id}`
    try {
      const data = await api1.get(url)
      return data // Now returns a full Customer object
    } catch (err) {
      console.error('Error in getKYCbyid:', err)
      throw err
    }
  }

  //@ts-ignore
  async getCharges(sourceCountry, destinationCountry, amount, segment, applicatnId) {
    const url = `/api/charges/service/filterByApplicantId?sendingCountry=${sourceCountry}&receivingCountry=${destinationCountry}&amount=${amount}&marketSegment=02&applicantId=${applicatnId}`
    try {
      const data = await api1.get(url)
      return data as any
    } catch (err) {
      console.log(err)
    }
  }

  async getReferralCreditedTransactions(referrerApplicantId: string) {
    const url = `api/kyc/referral-transaction/transactions/${referrerApplicantId}`
    try {
      const data = await api1.get(url)
      return data as any
    } catch (err) {
      console.log(err)
    }
  }

  async getReferralRedeemedTransactions(applicantId: string) {
    const url = `/api/kyc/referral-transaction/redeemed/${applicantId}`
    try {
      const data = await api1.get(url)
      return data as any
    } catch (err) {
      console.log(err)
    }
  }

  async getRedeemedReferralsByApplicantId(applicantId: string) {
    const url = `/api/kyc/lulu/referral-redeem/web-panel/history/${applicantId}`
    try {
      const data = await api1.get(url)
      return data as any
    } catch (err) {
      console.log(err)
    }
  }

  async getAllReferrals() {
    const url = `/api/kyc/lulu/referral-redeem/web-panel/all`
    try {
      const data = await api1.get(url)
      return data as any
    } catch (err) {
      console.log(err)
    }
  }

  async handleReferralAction(payload: any) {
    // const url = `/api/kyc/lulu/referral-redeem/web-panel/action/${payload?.id}`
    const url = `/api/transactions/loyalty-wallet/combined-action/${payload?.id}`
    try {
      delete payload.id
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }
}
