import { BaseService } from './base.service'
import api1 from './apis/api1'

export default class ProductService extends BaseService {
  protected readonly baseUrl = '/api/static-table/product-master'

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

  async getProductsData() {
    const url = '/api/static-table/countryCorridorProduct/getAll'
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      return err as any
    }
  }

  async getProductList() {
    const url = `${this.baseUrl}/getProductData`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      return err as any
    }
  }

  async createProduct(payload: any) {
    const url = `${this.baseUrl}/createProduct`
    try {
      const { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async updateProduct(id: string, payload: any) {
    const url = `${this.baseUrl}/update/${id}`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async deleteProduct(id: string, active: boolean = false) {
    const url = `${this.baseUrl}/delete/${id}?active=${active}`
    try {
      const { data } = await api1.del(url)
      return data
    } catch (err) {
      console.error('Delete failed', err)
      return err as any
    }
  }
}
