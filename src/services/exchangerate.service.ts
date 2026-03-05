import { BaseService } from './base.service'
import api1 from './apis/api1'

export interface IExchangeRate {
  id: number
  base: string | null
  sourceCountry: string | null
  targetCountry: string | null
  sourceCurrency: string | null
  targetCurrency: string | null
  vendorCode: string | null
  createdBy: string | null
  rate: number
  date: string
  createdLocaldatetime: string | null
}

export default class ExchangeRateService extends BaseService {
  async getExchangeRateList(filters: any): Promise<IExchangeRate[]> {
    // const url = '/api/transactions/exchangeRate/filter?sourceCurrency=ZAR'
    const url = `/api/transactions/exchangeRate/filter${filters ? `?${filters}` : ''}`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      return err as any
    }
  }

  async getDistinctDropdownValues(): Promise<any> {
    const url = '/api/transactions/exchangeRate/distinct'
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      return err as any
    }
  }
}
