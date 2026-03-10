// services/countryCorridorProduct.service.ts
import api1 from './apis/api1'
import { BaseService } from './base.service'

export interface CountryCorridorProductData {
  countryCorridorProductCode: string
  countryCorridorCode: string
  productCode: string
  productServiceCode: string
  dateFormat: string
  timeFormat: string
  currencyFormat: string
  decimalPrecision: number
  decimalRoundOff: number
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string
  modifiedBy: string | null
  createdLocalDateTime: string
  createdTimeZone: string
  createdOffset: string
  modifiedLocalDateTime: string | null
  modifiedTimeZone: string | null
  modifiedOffset: string | null
  createdUtcDateTime: string | null
  modifiedUtcDateTime: string | null
  effectiveDateValid: boolean
  countryCorridorMaster?: {
    countryCorridorCode: string
    countryCode: string
    active: boolean
    effectiveFromDate: string
    effectiveToDate: string
  }
}

export interface CreateCountryCorridorProductPayload {
  countryCorridorCode: string
  productCode: string
  productServiceCode: string
  dateFormat: string
  timeFormat: string
  currencyFormat: string
  decimalPrecision: number
  decimalRoundOff: number
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string
}

export interface UpdateCountryCorridorProductPayload {
  productServiceCode: string
  productCode: string
  dateFormat: string
  timeFormat: string
  currencyFormat: string
  decimalPrecision: number
  decimalRoundOff: number
  effectiveFromDate: string
  effectiveToDate: string
  modifiedBy: string
  active: boolean
}

export interface UpdateStatusPayload {
  id: string
  active: boolean
  modifiedBy: string
}

export class CountryCorridorProductService extends BaseService {
  private baseUrl = '/api/static-table/countryCorridorProduct'

  /**
   * Create a new country corridor product
   */
  async createCountryCorridorProduct(payload: CreateCountryCorridorProductPayload): Promise<any> {
    try {
      const response = await api1.post(`${this.baseUrl}/create`, payload)
      return response.data
    } catch (err) {
      console.error('Error creating country corridor product:', err)
      throw new Error('Unable to create country corridor product. Please try again.')
    }
  }

  /**
   * Get all country corridor products
   */
  async getAllCountryCorridorProducts(): Promise<Array<CountryCorridorProductData>> {
    const url = `${this.baseUrl}/getAll`
    try {
      const { data } = await api1.get(url)
      return data || []
    } catch (err) {
      console.error('Error fetching country corridor products:', err)
      throw new Error('Unable to fetch country corridor products. Please try again.')
    }
  }

  /**
   * Get country corridor product by code
   */
  async getCountryCorridorProductByCode(code: string): Promise<CountryCorridorProductData> {
    const url = `${this.baseUrl}/${code}`
    try {
      const { data } = await api1.get(url)
      return data?.data
    } catch (err) {
      console.error('Error fetching country corridor product:', err)
      throw new Error('Unable to fetch country corridor product. Please try again.')
    }
  }

  /**
   * Update country corridor product
   */
  async updateCountryCorridorProduct(
    code: string, 
    payload: UpdateCountryCorridorProductPayload
  ): Promise<any> {
    const url = `${this.baseUrl}/update/${code}`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      console.error('Error updating country corridor product:', err)
      throw new Error('Unable to update country corridor product. Please try again.')
    }
  }

  /**
   * Update status (activate/deactivate)
   */
  async updateStatus(payload: UpdateStatusPayload): Promise<any> {
    const url = `${this.baseUrl}/updateStatus`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      console.error('Error updating status:', err)
      throw new Error('Unable to update status. Please try again.')
    }
  }

  /**
   * Get products by country corridor code
   */
  async getProductsByCountryCorridor(countryCorridorCode: string): Promise<Array<CountryCorridorProductData>> {
    const url = `${this.baseUrl}/countryCorridor/${countryCorridorCode}`
    try {
      const { data } = await api1.get(url)
      return data?.data || []
    } catch (err) {
      console.error('Error fetching products by country corridor:', err)
      throw new Error('Unable to fetch products by country corridor. Please try again.')
    }
  }

  /**
   * Get products by product code
   */
  async getProductsByProductCode(productCode: string): Promise<Array<CountryCorridorProductData>> {
    const url = `${this.baseUrl}/product/${productCode}`
    try {
      const { data } = await api1.get(url)
      return data?.data || []
    } catch (err) {
      console.error('Error fetching products by product code:', err)
      throw new Error('Unable to fetch products by product code. Please try again.')
    }
  }
}