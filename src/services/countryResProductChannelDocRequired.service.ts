// services/countryResProductChannelDocRequired.service.ts
import api1 from './apis/api1'
import { BaseService } from './base.service'

export interface CreateDocRequiredPayload {
  countryCode: string
  residenceTypeCode: string
  productCode: string
  channelCode: string
  kycDocCode: string
  docRequirementType: string
  docSequence: number
  bfa: string
  documentUpload: boolean
  documentNumberRequired: boolean
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string
}

export interface UpdateDocRequiredPayload {
  reqDocCode: string
  countryCode: string
  residenceTypeCode: string
  productCode: string
  channelCode: string
  kycDocCode: string
  docRequirementType: string
  docSequence: number
  bfa: string
  documentUpload: boolean
  documentNumberRequired: boolean
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  modifiedBy: string
}

export interface UpdateStatusPayload {
  id: string
  active: boolean
  modifiedBy: string
}

export interface DocRequiredData {
  reqDocCode: string
  countryCode: string
  residenceTypeCode: string
  productCode: string
  channelCode: string
  kycDocCode: string
  docRequirementType: string
  bfa: string
  documentUpload: boolean
  documentNumberRequired: boolean
  docSequence: number
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string
  modifiedBy: string | null
  createdLocalDateTime: string
  createdTimezone: string
  createdOffset: string
  modifiedLocalDateTime: string | null
  modifiedTimezone: string | null
  modifiedOffset: string | null
  createdUtcDatetime: string
  modifiedUtcDatetime: string | null
}

export class CountryResProductChannelDocRequiredService extends BaseService {
  private baseUrl = '/api/static-table/country-res-product-channel-doc-required'
  private getAllUrl = '/api/static-table/country-res-product-channel-doc-required/getAll'

  /**
   * Create a new document requirement
   */
  async createDocRequired(payload: CreateDocRequiredPayload): Promise<any> {
    try {
      const response = await api1.post(this.baseUrl, payload)
      return response.data
    } catch (err) {
      console.error('Error creating document requirement:', err)
      throw new Error('Unable to create document requirement. Please try again.')
    }
  }

  /**
   * Get all document requirements
   */
  async getAllDocRequired(): Promise<DocRequiredData[]> {
    try {
      const response = await api1.get(this.getAllUrl)
      return response.data || []
    } catch (err) {
      console.error('Error fetching document requirements:', err)
      throw new Error('Unable to fetch document requirements. Please try again.')
    }
  }

  /**
   * Get document requirement by code
   */
  async getDocRequiredByCode(code: string): Promise<any> {
    try {
      const response = await api1.get(`${this.baseUrl}/${code}`)
      return response.data
    } catch (err) {
      console.error('Error fetching document requirement:', err)
      throw new Error('Unable to fetch document requirement. Please try again.')
    }
  }

  /**
   * Update document requirement
   */
  async updateDocRequired(code: string, payload: UpdateDocRequiredPayload): Promise<any> {
    try {
      const response = await api1.put(`${this.baseUrl}/${code}`, payload)
      return response.data
    } catch (err) {
      console.error('Error updating document requirement:', err)
      throw new Error('Unable to update document requirement. Please try again.')
    }
  }

  /**
   * Update status (activate/deactivate)
   */
  async updateStatus(id: string, active: boolean, modifiedBy: string): Promise<any> {
    try {
      const payload: UpdateStatusPayload = {
        id: id,
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

  /**
   * Get requirements by country
   */
  async getByCountry(countryCode: string): Promise<DocRequiredData[]> {
    try {
      const response = await api1.get(`${this.baseUrl}/country/${countryCode}`)
      return response.data?.data || []
    } catch (err) {
      console.error('Error fetching by country:', err)
      throw new Error('Unable to fetch by country. Please try again.')
    }
  }

  /**
   * Get requirements by product
   */
  async getByProduct(productCode: string): Promise<DocRequiredData[]> {
    try {
      const response = await api1.get(`${this.baseUrl}/product/${productCode}`)
      return response.data?.data || []
    } catch (err) {
      console.error('Error fetching by product:', err)
      throw new Error('Unable to fetch by product. Please try again.')
    }
  }
}