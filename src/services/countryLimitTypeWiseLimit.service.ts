// services/countryLimitTypeWiseLimit.service.ts
import api1 from './apis/api1'
import { BaseService } from './base.service'

interface CreateCountryLimitPayload {
  countryCode: string
  limitTypeCode: string
  limitAmount: number
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string
}

interface UpdateCountryLimitPayload {
  countryCode: string
  limitTypeCode: string
  limitAmount: number
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

export class CountryLimitTypeWiseLimitService extends BaseService {
  private baseUrl = '/api/static-table/country-limit-type-wise-limit'

  /**
   * Create a new country limit
   * @param payload - The country limit data to create
   * @returns Promise with the created country limit response
   */
  async createCountryLimit(payload: CreateCountryLimitPayload): Promise<any> {
    try {
      const response = await api1.post(this.baseUrl, payload)
      return response.data
    } catch (err) {
      console.error('Error creating country limit:', err)
      throw new Error('Unable to create country limit. Please try again.')
    }
  }

  /**
   * Get all country limits
   * @returns Promise with array of all country limits
   */
  async getAllCountryLimits(): Promise<any[]> {
    try {
      const response = await api1.get(`${this.baseUrl}/getAll`)
      return response.data || []
    } catch (err) {
      console.error('Error fetching country limits:', err)
      throw new Error('Unable to fetch country limits. Please try again.')
    }
  }

  /**
   * Get country limit by code
   * @param code - The country limit code
   * @returns Promise with the country limit data
   */
  async getCountryLimitByCode(code: string): Promise<any> {
    try {
      const response = await api1.get(`${this.baseUrl}/${code}`)
      return response.data
    } catch (err) {
      console.error('Error fetching country limit:', err)
      throw new Error('Unable to fetch country limit. Please try again.')
    }
  }

  /**
   * Update country limit
   * @param code - The country limit code to update
   * @param payload - The updated country limit data
   * @returns Promise with the update response
   */
  async updateCountryLimit(code: string, payload: UpdateCountryLimitPayload): Promise<any> {
    try {
      const response = await api1.put(`${this.baseUrl}/${code}`, payload)
      return response.data
    } catch (err) {
      console.error('Error updating country limit:', err)
      throw new Error('Unable to update country limit. Please try again.')
    }
  }

  /**
   * Update country limit status (activate/deactivate)
   * @param id - The country limit ID
   * @param active - New active status
   * @param modifiedBy - User performing the action
   * @returns Promise with the status update response
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
   * Get country limits by country
   * @param countryCode - The country code
   * @returns Promise with array of country limits
   */
  async getLimitsByCountry(countryCode: string): Promise<any[]> {
    try {
      const response = await api1.get(`${this.baseUrl}/country/${countryCode}`)
      return response.data?.data || []
    } catch (err) {
      console.error('Error fetching limits by country:', err)
      throw new Error('Unable to fetch limits by country. Please try again.')
    }
  }

  /**
   * Get country limits by limit type
   * @param limitTypeCode - The limit type code
   * @returns Promise with array of country limits
   */
  async getLimitsByLimitType(limitTypeCode: string): Promise<any[]> {
    try {
      const response = await api1.get(`${this.baseUrl}/limit-type/${limitTypeCode}`)
      return response.data?.data || []
    } catch (err) {
      console.error('Error fetching limits by limit type:', err)
      throw new Error('Unable to fetch limits by limit type. Please try again.')
    }
  }
}