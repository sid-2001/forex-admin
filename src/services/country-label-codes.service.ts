import api1 from './apis/api1'
import { CountryBusinessPayoutPartner } from '../services/countryBusinessPayoutPartner.service'

export interface CountryLabelCode {
  countryLabelCode?: string
  countryCode: string
  railPayoutMappingCode: string
  countryReportingCode: string
  channel: string
  active: boolean
  createdBy: string
  modifiedBy?: string
  effectiveFromDate: string
  effectiveToDate: string
  createdLocalDateTime?: string
  createdTimeZone?: string
  createdOffset?: string
  createdUtcDatetime?: string | null
  modifiedLocalDateTime?: string | null
  modifiedTimeZone?: string | null
  modifiedOffset?: string | null
  modifiedUtcDatetime?: string | null
}

export interface CombinedCountryLabelOption {
  countryLabelCode: string
  countryCode: string
  railPayoutMappingCode: string
  countryReportingCode: string
  channel: string
  displayName: string
  businessTypeCode?: string
  payoutPartner?: string
}

export default class CountryLabelCodesService {
  async getAll(): Promise<CountryLabelCode[]> {
    try {
      const { data } = await api1.get('/api/static-table/country-label-codes/getAll')
      return data || []
    } catch (err) {
      console.error('Error fetching country label codes:', err)
      return []
    }
  }

  async create(payload: Omit<CountryLabelCode, 'countryLabelCode'>): Promise<{
    status: boolean
    message: string
    data?: any
  }> {
    try {
      const response = await api1.post('/api/static-table/country-label-codes', payload)
      return response
    } catch (err: any) {
      console.error('Error creating country label code:', err)
      return {
        status: false,
        message: err.response?.data?.message || 'Failed to create country label code',
      }
    }
  }

  async update(
    payload: CountryLabelCode,
    id: any,
  ): Promise<{
    status: boolean
    message: string
    data?: any
  }> {
    try {
      const response = await api1.put(`/api/static-table/country-label-codes/${id}`, payload)
      return response.data
    } catch (err: any) {
      console.error('Error updating country label code:', err)
      return {
        status: false,
        message: err.response?.data?.message || 'Failed to update country label code',
      }
    }
  }

  async delete(countryLabelCode: string): Promise<{
    status: boolean
    message: string
  }> {
    try {
      const response = await api1.del(`/api/static-table/country-label-codes/${countryLabelCode}`)
      return response.data
    } catch (err: any) {
      console.error('Error deleting country label code:', err)
      return {
        status: false,
        message: err.response?.data?.message || 'Failed to delete country label code',
      }
    }
  }

  // Helper method to combine data from multiple sources
  async getCombinedOptions(countryBusinessPayoutPartners: CountryBusinessPayoutPartner[]): Promise<CombinedCountryLabelOption[]> {
    try {
      const countryLabelCodes = await this.getAll()

      return countryLabelCodes.map((code) => {
        // Find matching business payout partner
        const matchingPartner = countryBusinessPayoutPartners.find(
          (partner) => partner.countryBusinessPayoutPartnerCode === code.railPayoutMappingCode,
        )

        const businessInfo = matchingPartner ? ` (${matchingPartner.businessTypeCode}/${matchingPartner.payoutPartner})` : ''

        return {
          countryLabelCode: code.countryLabelCode!,
          countryCode: code.countryCode,
          railPayoutMappingCode: code.railPayoutMappingCode,
          countryReportingCode: code.countryReportingCode,
          channel: code.channel,
          displayName: `${code.countryCode} - ${code.railPayoutMappingCode}${businessInfo} - ${code.countryReportingCode} (${code.channel})`,
          businessTypeCode: matchingPartner?.businessTypeCode,
          payoutPartner: matchingPartner?.payoutPartner,
        }
      })
    } catch (err) {
      console.error('Error combining options:', err)
      return []
    }
  }
}
