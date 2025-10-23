import { BaseService } from './base.service'
import api1 from './apis/api1'

export class FieldValidationService extends BaseService {
  async getFieldValidationListing(countryCode: string): Promise<any> {
    const url = `api/transactions/field-validations/listOfFieldValidation/countryCode/${countryCode}`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }

  async createFieldvalidation(payload: any): Promise<any> {
    let url = '/api/transactions/field-validations/add'
    try {
      let { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async updateFieldvalidation(payload: any, id: string): Promise<any> {
    let url = `/api/transactions/field-validations/edit/${id}`
    try {
      let { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async deleteFieldvalidation(id: number): Promise<any> {
    let url = `/api/transactions/field-validations/delete/${id}`
    try {
      let data = await api1.del(url, {})
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }
}
