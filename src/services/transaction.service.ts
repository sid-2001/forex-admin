import { TransactionDetailsResponse, TransactionInward } from '@/types/transaction.type'
import api1 from './apis/api1'
import { BaseService } from './base.service'
import axios from 'axios'
const { VITE_FOREX_APP_CREDENTIALS } = import.meta.env

export class TransactionService extends BaseService {
  static getBankAccounts() {
    throw new Error('Method not implemented.')
  }
  static cdiTransaction() {
    throw new Error('Method not implemented.')
  }
  async gettransactions(): Promise<TransactionDetailsResponse> {
    const url = '/api/transactions/transaction-details'
    try {
      const data = await api1.get(url)
      return data as any
    } catch (e) {
      throw new Error(e as any)
    }
  }

  async getOutwardAllTransaction(sendCountry: any, page: any, size: any): Promise<Array<TransactionInward>> {
    const url = `/api/transactions/transaction-outward/sendCountry/${sendCountry}?page=${page}&size=${size}`
    try {
      const data = await api1.get(url)
      return data.data as any
    } catch (e) {
      throw new Error(e as any)
    }
  }

  async getInwardTransaction(receving_country: any): Promise<Array<TransactionInward>> {
    try {
      const url = `/api/transactions/transaction-inward/receivingCountry/${receving_country}`
      const response = await api1.get(url)
      return response?.data || []
    } catch (e) {
      throw new Error(e as any)
    }
  }

  async getInwardTransactionFilted(page: any, size: any, receving_country: any): Promise<Array<TransactionInward>> {
    try {
      const url = `/api/transactions/transaction-inward/receivingCountry/${receving_country}?page=${page}&size=${size}`
      const response = await api1.get(url)
      return response?.data || []
    } catch (e) {
      throw new Error(e as any)
    }
  }

  async getTransactionReferalsPoints(applicantID: String, countryCode: String, charges: Number): Promise<any> {
    try {
      const url = `/api/kyc/totalReferral/get-referral-point`
      const response = await api1.post(url, {
        applicantId: applicantID,
        countryCode: countryCode,
        charges: charges,
      })
      return response?.data || []
    } catch (e) {
      throw new Error(e as any)
    }
  }

  async getLoyaltyMasterData(): Promise<any> {
    const url = '/api/transactions/loyalty-master'
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async createLoyaltyTier(data: any): Promise<any> {
    const url = '/api/transactions/loyalty-master'
    try {
      const response = await api1.post(url, data)
      return response
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async cdiTransactions(): Promise<any[]> {
    const url = '/api/transactions/transaction-details/unmatchedTransactionList'
    try {
      const response = await api1.get(url)
      return response
    } catch (error) {
      console.error('API error:', error)
      throw error
    }
  }

  async cdiCards(): Promise<any[]> {
    const url = '/api/transactions/transaction-details/unmatchedTransactionList/overview'
    try {
      const response = await api1.get(url)
      return response
    } catch (error: any) {
      console.error('API error:', error)
      throw new Error(error?.response?.data?.message || 'API call failed')
    }
  }

  async updateTransactionMapping(referenceNumber: string, transactionNumber: string): Promise<any> {
    const url = '/api/transactions/transaction-details/forex/unmatchedTransactionList'
    try {
      const { data } = await api1.put(url, {
        transactionNumber,
        referenceNumber,
      })
      return data
    } catch (error: any) {
      console.error('Mapping update failed:', error?.response?.data || error.message)
      throw error
    }
  }

  async getBalanceEnquiry(): Promise<Array<TransactionInward>> {
    const url = `/api/transactions/transaction-details/balanceEnquiry`
    try {
      const data = await api1.get(url)
      return data
    } catch (e) {
      throw new Error(e as any)
    }
  }

  async getOutwardTransaction(): Promise<TransactionDetailsResponse> {
    const url = `/api/transactions/transaction-details`
    try {
      const data = await api1.get(url)
      return data as any
    } catch (e) {
      throw new Error(e as any)
    }
  }

  async createTransaction(payload: any) {
    const url = `/api/transactions/transaction-outward/create`
    try {
      const { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async getBop(country: any) {
    const url = `/api/static-table/forex-bop/by-country?country=${country}`
    try {
      const data = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }
  async updateLoyaltyTier(id: number, data: any): Promise<any> {
    const url = `/api/transactions/loyalty-master/${id}`
    try {
      const response = await api1.put(url, data)

      return response as any
    } catch (err) {
      console.log(err)
    }
  }
  async createDealcover(payload: {
    sourceCurrency: String
    destinationCurrency: String
    destinationCountry: String
    applicantId: String
    rate: Number
  }) {
    const url = `/api/transactions/deal/bookCover`
    try {
      const { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async createZaphierTransaction(payload: { amount: any; currencyISOCode: any; transactionNumber: any }) {
    const url = `/api/transactions/zapper/create-session`
    try {
      const { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async createPayfastTransaction(transaction: any, amount: any) {
    const url = `/api/transactions/transaction-outward/ozow?amount=${amount}&transactionId=${transaction}`
    try {
      const data = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async createRecons(payload: any) {
    const url = `/api/transactions/recon-transactions/create`
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async getForexRate(base_currency: String, sourc_currency: String) {
    let urlpath = `/api/transactions/exchange-rate/sourceCurrency/${base_currency}/targetCurrency/${sourc_currency}`

    const url = `https://data.fixer.io/api/latest?access_key=${VITE_FOREX_APP_CREDENTIALS}&base=${base_currency}&symbols=${sourc_currency}`
    try {
      // const { data } = await axios.get(url)
      const { data } = await api1.get(urlpath)
      //@ts-ignore
      console.log(data)
      return data.rate
      // return data.rates[sourc_currency]
    } catch (err) {
      console.log(err)
    }
  }
  async getReconTrx(): Promise<any> {
    const url = `/api/transactions/recon/reconList`
    try {
      const data = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async getReconTrxId(id: number): Promise<any> {
    const url = `/api/transactions/recon/reconId/${id}`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async updateReconTrxId(id: number, payload: any): Promise<any> {
    const url = `/api/transactions/recon/updateRecon/reconId/${id}`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async createOrder(payload: any) {
    const url = `/api/transactions/cashfree/create-order`
    try {
      const { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async createAdumoOrder(payload: any) {
    const url = `/api/transactions/adumo/token/new`
    try {
      const { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async createSquadOrder(payload: any) {
    const url = `/api/transactions/squad/transaction/initiate`
    try {
      const { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }
  async createRexoayOrder(payload: any) {
    const url = `/api/transactions/rexpay/createPayment`
    try {
      const { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async fetchGatewaysByCountry(countryCode: string): Promise<any> {
    const url = `api/static-table/forex-gateway/by-country?countryCode=${countryCode}`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async getStpRules(transactionId: any) {
    const url = `/api/transactions/stp-error/transactionNo/${transactionId}`
    try {
      const data = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async getTransactionSummary(country: any) {
    const url = `/api/transactions/transaction-outward/transaction-summary?countryCode=${country}`
    try {
      const data = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async getAllValidationsList(country: any) {
    const url = `api/transactions/field-validations/listOfFieldValidation/countryCode/${country}`
    try {
      const data = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async getTransactionbyquery(query: any, country: any) {
    const url = `/api/transactions/transaction-outward/search/sendCountry/${country}?query=${query}`
    try {
      const data = await api1.get(url)
      return data?.data
    } catch (err) {
      console.log(err)
    }
  }
  async createTransactionSeesionSummary(
    //@ts-ignore
    trnasaction_id: String,
    body: {
      amount: String
      currencyISOCode: String
      transactionNumber: String
    },
  ) {
    const url = `api/zapper/create-session`
    try {
      const { data } = await api1.post(url, body)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async getTransactionDatabyId(id: string) {
    const url = `api/transactions/transaction-outward/getByTransactionNumber/${id}`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }
}
