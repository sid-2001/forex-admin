// services/forex-country.service.ts
import { BaseService } from './base.service'
import api1 from './apis/api1'

export interface ForexCountry {
  countryCode: string
  countryName: string
  status: string
  countryFlag: string
  countryFlagUrl: string
  countryPhoneCode: string
  active?: boolean
  effectiveFromDate: string
  effectiveToDate: string
}

export default class ForexCountryService extends BaseService {
  private baseUrl = '/api/static-table/forex-country'

  async getAll() {
    const { data } = await api1.get(`${this.baseUrl}/getAll`)
    return data
  }

  async getById(countryCode: string) {
    const { data } = await api1.get(`${this.baseUrl}/${countryCode}`)
    return data
  }

  async create(payload: any) {
    const { data } = await api1.post(this.baseUrl, payload)
    return data
  }

  async update(countryCode: string, payload: any) {
    const { data } = await api1.put(`${this.baseUrl}/${countryCode}`, payload)
    return data
  }

  async delete(countryCode: string) {
    const { data } = await api1.del(`${this.baseUrl}/${countryCode}`)
    return data
  }
}
