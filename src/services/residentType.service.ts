// services/residentType.service.ts
import api1 from './apis/api1'
import { BaseService } from './base.service'

interface CreateResidentTypePayload {
  residenceCode: string
  countryCode: string
  residentTypeDescription: string
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string
}

interface UpdateResidentTypePayload {
  residentTypeCode: string
  residenceCode: string
  countryCode: string
  residentTypeDescription: string
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  modifiedBy: string
}

export class ResidentTypeService extends BaseService {
  private baseUrl = '/api/static-table/resident-type-master'

  async createResidentType(payload: CreateResidentTypePayload): Promise<any> {
    try {
      const response = await api1.post(`${this.baseUrl}/create`, payload)
      return response.data
    } catch (err) {
      console.error('Error creating resident type:', err)
      throw new Error('Unable to create resident type. Please try again.')
    }
  }

  async getAllResidentTypes(): Promise<any[]> {
    try {
      const response = await api1.get(this.baseUrl)
      return response.data || []
    } catch (err) {
      console.error('Error fetching resident types:', err)
      throw new Error('Unable to fetch resident types. Please try again.')
    }
  }

  async getResidentTypeByCode(code: string): Promise<any> {
    try {
      const response = await api1.get(`${this.baseUrl}/${code}`)
      return response.data
    } catch (err) {
      console.error('Error fetching resident type:', err)
      throw new Error('Unable to fetch resident type. Please try again.')
    }
  }

  async updateResidentType(code: string, payload: UpdateResidentTypePayload): Promise<any> {
    try {
      const response = await api1.put(`${this.baseUrl}/${code}`, payload)
      return response.data
    } catch (err) {
      console.error('Error updating resident type:', err)
      throw new Error('Unable to update resident type. Please try again.')
    }
  }

  async deleteResidentType(code: string, permanent: boolean = false): Promise<any> {
    try {
      const response = await api1.del(`${this.baseUrl}/${code}/${permanent}`)
      return response.data
    } catch (err) {
      console.error('Error deleting resident type:', err)
      throw new Error('Unable to delete resident type. Please try again.')
    }
  }

  async updateStatus(code: string, active: boolean, modifiedBy: string): Promise<any> {
    try {
      const payload = {
        id: code,
        active: active,
        modifiedBy: modifiedBy
      }
      const response = await api1.put(`${this.baseUrl}/updateStatus`, payload)
      return response.data
    } catch (err) {
      console.error('Error updating status:', err)
      throw new Error('Unable to update status. Please try again.')
    }
  }
}