import { BaseService } from './base.service'
import api1 from './apis/api1'

export interface CountryBusinessPayoutPartner {
  countryBusinessPayoutPartnerCode: string
  countryCorridorBusinessMapCode: string
  businessTypeCode: string
  payoutPartner: string
  active: boolean
  effective_from_date: string
  effective_to_date: string
  created_by: string | null
  modified_by: string | null
  createdLocalDateTime: string | null
  createdTimeZone: string | null
  createdOffset: string | null
  modifiedLocalDateTime: string | null
  modifiedTimeZone: string | null
  modifiedOffset: string | null
  createdUtcDateTime: string | null
  modifiedUtcDateTime: string | null
}

export default class CountryBusinessPayoutPartnerService extends BaseService {
  /**
   * Get Country Business Payout Partner List
   */
  async getAll(): Promise<{
    status: boolean
    message: string
    data: CountryBusinessPayoutPartner[]
  }> {
    const url = '/api/static-table/country-business-payout-partner/getAll'
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Create Country Business Payout Partner
   */
  async create(payload: {
    countryCorridorBusinessMapCode: string
    businessTypeCode: string
    payoutPartner: string
    active: boolean
    effective_from_date: string
    effective_to_date: string
    created_by: string
  }): Promise<{
    status: boolean
    message: string
  }> {
    const url = '/api/static-table/country-business-payout-partner/create'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Update Country Business Payout Partner
   */
  async update(
    countryBusinessPayoutPartnerCode: string,
    payload: {
      countryCorridorBusinessMapCode: string
      businessTypeCode: string
      payoutPartner: string
      active: boolean
      effective_from_date: string
      effective_to_date: string
      modified_by: string
    },
  ): Promise<{
    status: boolean
    message: string
  }> {
    const url = `/api/static-table/country-business-payout-partner/${countryBusinessPayoutPartnerCode}`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }
}
