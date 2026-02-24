import { BaseService } from './base.service'
import api1 from './apis/api1'

/**
 * Bank Business Type Interface
 */
export interface BankBusinessType {
  business_type_code: string
  country_code: string
  business_currency_code: string
  bank_business_name: string
  active: boolean
  effective_from_date: string
  effective_to_date: string
  created_by: string | null
  modified_by: string | null
  businessTypeCode:string|null
}

/**
 * Bank Business Type Master Service
 */
export default class BankBusinessTypeService extends BaseService {

  /**
   * Get Bank Business Type List
   */
  async getList(): Promise<{
    status: boolean
    message: string
    data: BankBusinessType[]
  }> {
    const url = '/api/static-table/bank-business-type-master/getBankBusinessTypeData'
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Create Bank Business Type
   */
  async create(payload: {
    countryCode: string
    businessCurrencyCode: string
    bankBusinessName: string
    active: boolean
    effective_from_date: string
    effective_to_date: string
    created_by: string
  }): Promise<{
    status: boolean
    message: string
  }> {
    const url = '/api/static-table/bank-business-type-master/createBankBusinessType'
    try {
      const { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Update Bank Business Type
   */
  async update(
    businessTypeCode: string,
    payload: {
      countryCode: string
      businessCurrencyCode: string
      bankBusinessName: string
      active: boolean
      effective_from_date: string
      effective_to_date: string
      modified_by: string
    }
  ): Promise<{
    status: boolean
    message: string
  }> {
    const url = `/api/static-table/bank-business-type-master/${businessTypeCode}`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Delete / Deactivate Bank Business Type
   */
  async delete(
    businessTypeCode: string,
    active: boolean
  ): Promise<{
    status: boolean
    message: string
  }> {
    const url = `/api/static-table/bank-business-type-master/${businessTypeCode}/${active}`
    try {
      const { data } = await api1.del(url)
      return data
    } catch (err) {
      return err as any
    }
  }
}
