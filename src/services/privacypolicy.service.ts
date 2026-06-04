// services/privacy-policy.service.ts
import { BaseService } from './base.service'
import api1 from './apis/api1'

export default class PrivacyPolicyService extends BaseService {
  private baseUrl = '/api/static-table/privacy-policy'

  async getAll() {
    const { data } = await api1.get(`${this.baseUrl}/getAll`)
    return data
  }

  async getById(policyCode: string) {
    const { data } = await api1.get(`${this.baseUrl}/${policyCode}`)
    return data
  }

  async create(payload: any) {
    const data = await api1.post(this.baseUrl + '/create', payload)
    return data
  }

  async update(privacyCode: string, payload: Partial<any>) {
    const { data } = await api1.put(`${this.baseUrl}/update/${privacyCode}`, payload)
    return data
  }

  async updateStatus(payload: { id: string; active: boolean; modifiedBy: string }) {
    const { data } = await api1.del(`${this.baseUrl}/updateStatus`, payload)
    return data
  }
}
