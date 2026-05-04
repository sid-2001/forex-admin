import { BaseService } from './base.service'
import api1 from './apis/api1'

export interface ProductBusinessCountryMapping {
  businessMapCode: string
  productCode: string
  recipientCountry: string
  paymentRail: string
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string | null
  modifiedBy: string | null
  createdLocalDateTime: string | null
  createdTimeZone: string | null
  createdOffset: string | null
  modifiedLocalDateTime: string | null
  modifiedTimeZone: string | null
  modifiedOffset: string | null
  createdUtcDateTime: string | null
  modifiedUtcDateTime: string | null
}

export default class ProductBusinessCountryMappingService extends BaseService {
  /**
   * Get Product Business Country Mapping List
   */
  async getList(): Promise<Array<ProductBusinessCountryMapping>> {
    const url = '/api/static-table/product-business-country-mapping/getData'
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Create Product Business Country Mapping
   */
  async create(payload: {
    productCode: string
    recipientCountry: string
    paymentRail: string
    active: boolean
    effectiveFromDate: string
    effectiveToDate: string
    createdBy: string
    modifiedBy?: string
  }): Promise<{
    status: boolean
    message: string
  }> {
    const url = '/api/static-table/product-business-country-mapping/create'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Update Product Business Country Mapping
   */
  async update(
    businessMapCode: string,
    payload: {
      productCode: string
      recipientCountry: string
      paymentRail: string
      active: boolean
      effectiveFromDate: string
      effectiveToDate: string
      modifiedBy: string
    },
  ): Promise<{
    status: boolean
    message: string
  }> {
    const url = `/api/static-table/product-business-country-mapping/${businessMapCode}`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }
}
