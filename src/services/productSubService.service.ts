// services/productSubService.service.ts
import api1 from './apis/api1'
import { BaseService } from './base.service'

export interface ProductSubServiceData {
  productServiceMapCode: string
  countryCode: string
  productCode: string
  productMaster?: {
    countryProductCode: string
    productCode: string
    productName: string
    active: boolean
    effectiveFromDate: string
    effectiveToDate: string
  }
  serviceCode?: string | null
  serviceDescription?: string | null
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
  createdUtcDateTime: string
  modifiedUtcDateTime: string | null
  effectiveDateValid: boolean
}

export class ProductSubServiceService extends BaseService {
  private baseUrl = '/api/static-table/productSubService'

  /**
   * Get all product sub services
   *
   *
   *
   */

  async getAllProductSubServices(): Promise<ProductSubServiceData[]> {
    const url = `${this.baseUrl}/getAll`
    try {
      const { data } = await api1.get(url)
      return data || []
    } catch (err) {
      console.error('Error fetching product sub services:', err)
      throw new Error('Unable to fetch product sub services. Please try again.')
    }
  }

  /**
   * Get active product sub services only
   */
  async getActiveProductSubServices(): Promise<ProductSubServiceData[]> {
    try {
      const services = await this.getAllProductSubServices()
      return services.filter((s) => s.active === true)
    } catch (err) {
      console.error('Error fetching active product sub services:', err)
      throw new Error('Unable to fetch active product sub services. Please try again.')
    }
  }

  /**
   * Get product sub services by product code
   */
  async getByProductCode(productCode: string): Promise<ProductSubServiceData[]> {
    try {
      const services = await this.getAllProductSubServices()
      return services.filter((s) => s.productCode === productCode && s.active === true)
    } catch (err) {
      console.error('Error fetching product sub services by product:', err)
      throw new Error('Unable to fetch product sub services. Please try again.')
    }
  }

  /**
   * Get product sub service by map code
   */
  async getByMapCode(mapCode: string): Promise<ProductSubServiceData | undefined> {
    try {
      const services = await this.getAllProductSubServices()
      return services.find((s) => s.productServiceMapCode === mapCode)
    } catch (err) {
      console.error('Error fetching product sub service by map code:', err)
      throw new Error('Unable to fetch product sub service. Please try again.')
    }
  }

  async getAll(): Promise<Array<any>> {
    const url = `${this.baseUrl}/getAll`
    try {
      const { data } = await api1.get(url)
      return data || []
    } catch (err) {
      console.error('Error fetching product sub services:', err)
      throw new Error('Unable to fetch product sub services')
    }
  }

  /**
   * Get product sub service by map code
   */
  async getByCode(mapCode: string): Promise<any> {
    const url = `${this.baseUrl}/${mapCode}`
    try {
      const { data } = await api1.get(url)
      return data?.data
    } catch (err) {
      console.error('Error fetching product sub service:', err)
      throw new Error('Unable to fetch product sub service')
    }
  }
  async getAllServices(): Promise<Array<any>> {
    const url = `${this.baseUrl}/getAll`
    try {
      const { data } = await api1.get(url)
      return data?.data || []
    } catch (err) {
      console.error('Error fetching services:', err)
      throw new Error('Unable to fetch services')
    }
  }

  /**
   * Create product sub service
   */
  async create(payload: {
    countryCode: string
    productCode: string
    serviceMapCode: string
    effectiveFromDate: string
    effectiveToDate: string
    createdBy: string
  }): Promise<{
    status: boolean
    message: string
    data?: any
  }> {
    const url = `${this.baseUrl}/createService`
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      console.error('Error creating product sub service:', err)
      throw new Error('Unable to create product sub service')
    }
  }

  /**
   * Update product sub service
   */
  async update(
    mapCode: string,
    payload: {
      serviceCodeGenerated?: string
      countryCode: string
      serviceCode: string
      serviceDescription: string
      effectiveFromDate: string
      effectiveToDate: string
      active: boolean
      modifiedBy: string
    },
  ): Promise<{
    status: boolean
    message: string
    data?: any
  }> {
    const url = `${this.baseUrl}/update/${mapCode}`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      console.error('Error updating product sub service:', err)
      throw new Error('Unable to update product sub service')
    }
  }

  /**
   * Get active product sub services only
   */
  async getActiveOnly(): Promise<Array<any>> {
    try {
      const all = await this.getAll()
      return all.filter((item) => item.active === true)
    } catch (err) {
      console.error('Error fetching active product sub services:', err)
      throw new Error('Unable to fetch active product sub services')
    }
  }

  /**
   * Get product sub services by product code
   */
  // async getByProductCode(productCode: string): Promise<Array<ProductSubService>> {
  //   try {
  //     const all = await this.getAll()
  //     return all.filter(item => item.productCode === productCode)
  //   } catch (err) {
  //     console.error('Error fetching product sub services by product:', err)
  //     throw new Error('Unable to fetch product sub services by product')
  //   }
  // }

  /**
   * Get product sub services by country
   */
  async getByCountry(countryCode: string): Promise<Array<ProductSubServiceData>> {
    try {
      const all = await this.getAll()
      return all.filter((item) => item.countryCode === countryCode)
    } catch (err) {
      console.error('Error fetching product sub services by country:', err)
      throw new Error('Unable to fetch product sub services by country')
    }
  }
}
