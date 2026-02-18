// services/kycLimitType.service.ts
import api1 from './apis/api1'
import { BaseService } from './base.service'

interface CreateLimitTypePayload {
  limitCode: string
  limitDescription: string
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string
}

interface UpdateLimitTypePayload {
  limitCode: string
  limitDescription: string
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  modifiedBy: string
}

interface UpdateStatusPayload {
  id: string
  active: boolean
  modifiedBy: string
}

export class KycLimitTypeService extends BaseService {
  
  async createLimitType(payload: CreateLimitTypePayload): Promise<any> {
    try {
      const response = await api1.post('/api/static-table/kyc-limit-type-master', payload)
      return response.data
    } catch (err) {
      console.error('Error creating limit type:', err)
      throw new Error('Unable to create limit type. Please try again.')
    }
  }

  async getAllLimitTypes(): Promise<any[]> {
    try {
      const response = await api1.get('/api/static-table/kyc-limit-type-master/getAll')
      return response.data || []
    } catch (err) {
      console.error('Error fetching limit types:', err)
      throw new Error('Unable to fetch limit types. Please try again.')
    }
  }

  async getLimitTypeById(id: string): Promise<any> {
    try {
      const response = await api1.get(`/api/static-table/kyc-limit-type-master/${id}`)
      return response.data
    } catch (err) {
      console.error('Error fetching limit type:', err)
      throw new Error('Unable to fetch limit type. Please try again.')
    }
  }

  async updateLimitType(id: string, payload: UpdateLimitTypePayload): Promise<any> {
    try {
      const response = await api1.put(`/api/static-table/kyc-limit-type-master/${id}`, payload)
      return response.data
    } catch (err) {
      console.error('Error updating limit type:', err)
      throw new Error('Unable to update limit type. Please try again.')
    }
  }

  async updateStatus(payload: UpdateStatusPayload): Promise<any> {
    try {
      const response = await api1.put('/api/static-table/kyc-limit-type-master/updateStatus', payload)
      return response.data
    } catch (err) {
      console.error('Error updating status:', err)
      throw new Error('Unable to update status. Please try again.')
    }
  }
}