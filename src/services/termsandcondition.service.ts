// services/terms-conditions.service.ts
import { BaseService } from './base.service'
import api1 from './apis/api1'

export interface TermsConditions {
  termsCode?: string
  countryCode: string
  channel: string
  screen: string
  headerSectionCount?: number
  contentCount?: number
  version: string
  active: boolean
  jsonContent: any
  createdBy?: string
  modifiedBy?: string
  effectiveFromDate: string
  effectiveToDate: string
}

export default class TermsConditionsService extends BaseService {
  private baseUrl = '/api/static-table/terms-conditions'

  async getAll() {
    const { data } = await api1.get(`${this.baseUrl}/getAll`)
    return data
  }

  async getById(termsCode: string) {
    const { data } = await api1.get(`${this.baseUrl}/${termsCode}`)
    return data
  }

  async create(payload: TermsConditions) {
    const data = await api1.post(this.baseUrl, payload)
    return data
  }

  async update(termsCode: string, payload: Partial<TermsConditions>) {
    const { data } = await api1.put(`${this.baseUrl}/${termsCode}`, payload)
    return data
  }

  async updateStatus(payload: { id: string; active: boolean; modifiedBy: string }) {
    const { data } = await api1.del(`${this.baseUrl}/updateStatus`, payload)
    return data
  }
}
