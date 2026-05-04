import { BaseService } from './base.service'
import api1 from './apis/api1'

export default class WhatsappTemplateService extends BaseService {
  protected readonly baseUrl = '/api/static-table/whatsapp-template-master'

  async getTemplateList() {
    const url = `${this.baseUrl}/getAll`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      return err as any
    }
  }

  async createTemplate(payload: any) {
    const url = `${this.baseUrl}/create`
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async updateTemplate(id: string, payload: any) {
    const url = `${this.baseUrl}/update/${id}`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async deleteTemplate(id: string, active: boolean = false) {
    const url = `${this.baseUrl}/delete/${id}?active=${active}`
    try {
      const { data } = await api1.del(url)
      return data
    } catch (err) {
      return err as any
    }
  }
}
