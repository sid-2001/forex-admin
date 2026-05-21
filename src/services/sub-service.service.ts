import { BaseService } from './base.service'
import api1 from './apis/api1'

export default class SubServiceService extends BaseService {
  protected readonly baseUrl = '/api/static-table/subServiceMaster'

  private mandatoryHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-device-ip': '127.0.0.1',
      'x-device-name': 'WEB_CLIENT',
      timezone: 'Asia/Kolkata',
      offset: '+05:30',
      localdatetime: new Date().toISOString().split('.')[0],
    }
  }

  async getSubServiceList() {
    const url = '/api/static-table/subServiceMaster/getAll'
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      return err as any
    }
  }

  async createSubService(payload: any) {
    const url = `${this.baseUrl}/createSubService`
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async updateSubService(id: string, payload: any) {
    const url = `/api/static-table/subServiceMaster/update/${id}`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async deleteSubService(id: string) {
    console.log('Dummy Delete for:', id)
    return { status: true }
  }
}
