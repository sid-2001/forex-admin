import { BaseService } from './base.service'
import api1 from './apis/api1'

/**
 * Bank Master Interface
 */
export interface BankMaster {
  bankMasterCode: string
  countryCode: string
  currencyCode: string
  bankCode: string
  bankName: string
  bankBranchCode: string
  bankIfscBicCode: string | null
  bankAddress1: string
  bankAddress2: string
  bankAddress3: string
  bankStateProvinceCode: string
  bankCity: string
  bankPostalCode: string
  active: boolean
  effective_from_date: string
  effective_to_date: string
  created_by: string | null
  modified_by: string | null
  utcdatetime: string | null
}

/**
 * Bank Master Service
 */
export default class BankMasterService extends BaseService {

  /**
   * Get Bank Master List
   */
  async getBankList(): Promise<{
    status: boolean
    message: string
    data: BankMaster[]
  }> {
    const url = '/api/static-table/bank-master/getBankData'
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Create Bank
   */
  async createBank(payload: {
    countryCode: string
    currencyCode: string
    bankCode: string
    bankName: string
    bankBranchCode: string
    bankIfscBicCode: string | null
    bankAddress1: string
    bankAddress2: string
    bankAddress3: string
    bankStateProvinceCode: string
    bankCity: string
    bankPostalCode: string
    active: boolean
    effective_from_date: string
    effective_to_date: string
    created_by: string
  }): Promise<{
    status: boolean
    message: string
  }> {
    const url = '/api/static-table/bank-master/createBank'
    try {
      const { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Update Bank
   */
  async updateBank(
    bankMasterCode: string,
    payload: {
      countryCode: string
      currencyCode: string
      bankCode: string
      bankName: string
      bankBranchCode: string
      bankIfscBicCode: string | null
      bankAddress1: string
      bankAddress2: string
      bankAddress3: string
      bankStateProvinceCode: string
      bankCity: string
      bankPostalCode: string
      active: boolean
      effective_from_date: string
      effective_to_date: string
      created_by: string
      modified_by: string
    }
  ): Promise<{
    status: boolean
    message: string
  }> {
    const url = `/api/static-table/bank-master/${bankMasterCode}`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Delete / Deactivate Bank
   */
  async deleteBank(
    bankMasterCode: string,
    active: boolean
  ): Promise<{
    status: boolean
    message: string
  }> {
    const url = `/api/static-table/bank-master/${bankMasterCode}/${active}`
    try {
      const { data } = await api1.del(url)
      return data
    } catch (err) {
      return err as any
    }
  }
}
