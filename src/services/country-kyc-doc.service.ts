import { BaseService } from './base.service'
import api1 from './apis/api1'

export default class CountryKycDocService extends BaseService {
  protected readonly baseUrl = '/api/static-table/country-kyc-document-master'

  async getDocList() {
    const url = `${this.baseUrl}/getAll`
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      return err as any
    }
  }

  async createDoc(payload: any) {
    const url = `${this.baseUrl}`
    try {
      const response = await api1.post(url, payload)
      return response
    } catch (err: any) {
      return err as any
    }
  }

  async updateDoc(id: string, payload: any) {
    const url = `${this.baseUrl}/${id}`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }
}
