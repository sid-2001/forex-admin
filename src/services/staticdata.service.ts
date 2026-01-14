import { BaseService } from './base.service'
import api1 from './apis/api1'
import { CountryData, PaymentGateway } from '@/types/static.type'

export interface Gender {
  gendercode: string
  description: string
  active?: boolean
}
export default class staticdataService extends BaseService {

  async staticData(
    url: '',
    payload: any,
  ): Promise<{
    data: any
    status: Boolean
    message: 'Created successfully'
  }> {
    try {
      const { data } = await api1.post(url, payload)
      return data as any
    } catch (err) {
      return err as any
    }
  }

  async getCountryList(): Promise<Array<CountryData>> {
    const url = '/api/static-table/forex/getAllCountry'
    try {
      const data = await api1.get(url)
      return data as Array<CountryData>
    } catch (err) {
      return err as any
    }
  }

  async getCountryCurrency(country: any): Promise<String> {
    const url = `/api/static-table/forex/country-currency/countryCode/${country}`
    try {
      const data = await api1.get(url)
      return data as String
    } catch (err) {
      return err as any
    }
  }

  async paymentGatewayStatus(id: any, status: boolean): Promise<Array<any>> {
    const url = `/api/static-table/forex-gateway/disablePaymentGateway/id/${id}/status/${status}`
    try {
      const { data } = await api1.put(url, {})
      return data as Array<any>
    } catch (err) {
      return err as any
    }
  }

  async getStaticPaymentGateway(country: any): Promise<Array<PaymentGateway>> {
    const url = `/api/static-table/forex-gateway/by-country?countryCode=${country}`
    try {
      const data = await api1.get(url)
      return data as Array<PaymentGateway>
    } catch (err) {
      return err as any
    }
  }

  async getTransactionYearlyData(country: any, year: any) {
    const url = `/api/transactions/transaction-outward/summary/month?countryCode=${country}&year=${year}`

    try {
      const data = await api1.get(url)
      return data
    } catch (err) {}
  }
  async getTransactionMonthlyData(country: any, month: any, year: any) {
    const url = `/api/transactions/transaction-outward/summary/days?countryCode=${country}&year=${year}&month=${month}`

    try {
      const data = await api1.get(url)
      return data
    } catch (err) {}
  }


  async getGenderList(): Promise<{
    success: boolean
    count: number
    data: Gender[]
  }> {
    const url = '/api/gender/list'
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Create Gender
   */
  async createGender(payload: {
    username: string
    gendercode: string
    description: string
    countrycode: string
    active: boolean
    effectivefromdate: string
    effectivetodate: string
  }): Promise<{
    status: boolean
    message: string
  }> {
    const url = '/api/gender/create'
    try {
      const { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Update Gender
   */
  async updateGender(payload: {
    username: string
    gendercode: string
    countrycode: string
    description: string
  }): Promise<{
    status: boolean
    message: string
  }> {
    const url = '/api/gender/update'
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Delete Gender
   */
  async deleteGender(payload: {
    gendercode: string
    countrycode: string
  }): Promise<{
    status: boolean
    message: string
  }> {
    const url = '/api/gender/delete'
    try {
      const { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }
}
