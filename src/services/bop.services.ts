import { BaseService } from './base.service'
import api1 from './apis/api1'
import axios from 'axios'

export class BopService extends BaseService {
  async getBopListing(): Promise<any> {
    const url = '/api/bop/getAll'
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async getBopDetailByTransactionId(transactionId: any, transaction_attempt: any): Promise<any> {
    const url = `/api/bop/${transactionId}/${transaction_attempt}`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async getBopCategoryDetailByTransactionId(transactionId: any, transaction_attempt: any): Promise<any> {
    const url = `/api/bop/bopCategory/${transactionId}/${transaction_attempt}`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async getStaticTableBopData(countryCode: any): Promise<any> {
    const url = `/api/static-table/static-data/key1/Bop%20Mapping/countryCode/${countryCode}`
    try {
      const data = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async getBopMatrixCategoriesListing(userLoggedInCountry: any): Promise<any> {
    const url = `api/static-table/forex-bop/by-country?country=${userLoggedInCountry}`
    try {
      const data = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async updateBopData(payload: any, id: any): Promise<any> {
    const url = `/api/bop/${id}`
    try {
      const data = await api1.put(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async releaseBopData(payload: any): Promise<any> {
    const url = '/api/bop/release-bopdata'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async cancelReplaceBop(payload: any): Promise<any> {
    const url = '/api/bop/cancelReplaceTransaction'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async validateAndUpdateStpRules(payload: any): Promise<any> {
    const url = '/api/transactions/transaction-outward/updateStpErrorStatus'
    try {
      const data = await api1.put(url, payload)
      return data
    } catch (err) {
      console.log(err)
    }
  }
}
