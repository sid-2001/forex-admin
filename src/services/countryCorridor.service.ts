//@ts-check
import {
  CountryCorridorData,
  //@ts-ignore
  CountryCorridorFormData,
  CountryCorridorResponse,
  CreateCorridorPayload,
  UpdateCorridorPayload,
  CorridorStats,
  ApiTransaction,
} from '@/types/countryCorridor.types'
import api1 from './apis/api1'
import { BaseService } from './base.service'

class CountryCorridorService extends BaseService {
  // ============ GET Operations ============

  /**
   * Get all country corridors
   */
  async getAllCorridors(): Promise<Array<CountryCorridorData>> {
    const url = `/api/static-table/country-corridor-master/getAll`
    try {
      //@ts-ignore
      const { data } = await api1.get(url)
      return data?.data || data
    } catch (err) {
      throw new Error('Unable to fetch corridors. Please try again.')
    }
  }

  /**
   * Get corridor by code
   */
  async getCorridorByCode(corridorCode: string): Promise<CountryCorridorData> {
    const url = `/api/static-table/country-corridor-master/${corridorCode}`
    try {
      const { data } = await api1.get(url)
      return data?.data?.[0] || data?.data || data
    } catch (err) {
      throw new Error(`Unable to fetch corridor ${corridorCode}. Please try again.`)
    }
  }

  /**
   * Get corridors by country code
   */
  async getCorridorsByCountry(countryCode: string): Promise<Array<CountryCorridorData>> {
    const url = `/api/static-table/country-corridor-master/country/${countryCode}`
    try {
      const { data } = await api1.get(url)
      return data?.data || data
    } catch (err) {
      throw new Error(`Unable to fetch corridors for country ${countryCode}. Please try again.`)
    }
  }

  /**
   * Get active corridors
   */
  async getActiveCorridors(): Promise<Array<CountryCorridorData>> {
    const url = `/api/static-table/country-corridor-master/active/true`
    try {
      const { data } = await api1.get(url)
      return data?.data || data
    } catch (err) {
      throw new Error('Unable to fetch active corridors. Please try again.')
    }
  }

  /**
   * Get inactive corridors
   */
  async getInactiveCorridors(): Promise<Array<CountryCorridorData>> {
    const url = `/static-table/country-corridor-master/active/false`
    try {
      const { data } = await api1.get(url)
      return data?.data || data
    } catch (err) {
      throw new Error('Unable to fetch inactive corridors. Please try again.')
    }
  }

  /**
   * Get corridor statistics
   */
  async getCorridorStats(): Promise<CorridorStats> {
    const url = `api/static-table/country-corridor-master/stats`
    try {
      const { data } = await api1.get(url)
      return data?.data || data
    } catch (err) {
      // Calculate stats from all corridors if stats endpoint doesn't exist
      try {
        const corridors = await this.getAllCorridors()
        const activeCount = corridors.filter((c) => c.active).length
        const countries = [...new Set(corridors.map((c) => c.countryCode))]

        return {
          total: corridors.length,
          active: activeCount,
          inactive: corridors.length - activeCount,
          countries: countries.length,
          countryList: countries,
        }
      } catch (statsErr) {
        throw new Error('Unable to fetch corridor statistics. Please try again.')
      }
    }
  }

  /**
   * Get unique countries list
   */
  async getUniqueCountries(): Promise<Array<string>> {
    const url = `/static-table/country-corridor-master/countries`
    try {
      const { data } = await api1.get(url)
      return data?.data || data
    } catch (err) {
      // Extract from all corridors if countries endpoint doesn't exist
      try {
        const corridors = await this.getAllCorridors()
        const countries = [...new Set(corridors.map((c) => c.countryCode))]
        return countries
      } catch (countriesErr) {
        throw new Error('Unable to fetch countries. Please try again.')
      }
    }
  }

  /**
   * Get corridor history/audit trail
   */
  async getCorridorHistory(corridorCode: string): Promise<Array<CountryCorridorData>> {
    const url = `/api/static-table/country-corridor-master/${corridorCode}/history`
    try {
      const { data } = await api1.get(url)
      return data?.data || data
    } catch (err) {
      throw new Error(`Unable to fetch history for corridor ${corridorCode}. Please try again.`)
    }
  }

  /**
   * Search corridors by various criteria
   */
  async searchCorridors(searchTerm: string): Promise<Array<CountryCorridorData>> {
    const url = `/static-table/country-corridor-master/search?q=${encodeURIComponent(searchTerm)}`
    try {
      const { data } = await api1.get(url)
      return data?.data || data
    } catch (err) {
      throw new Error('Unable to search corridors. Please try again.')
    }
  }

  /**
   * Filter corridors by date range
   */
  async getCorridorsByDateRange(fromDate: string, toDate: string): Promise<Array<CountryCorridorData>> {
    const url = `/static-table/country-corridor-master/date-range?from=${fromDate}&to=${toDate}`
    try {
      const { data } = await api1.get(url)
      return data?.data || data
    } catch (err) {
      throw new Error('Unable to fetch corridors by date range. Please try again.')
    }
  }

  /**
   * Get corridors created by user
   */
  async getCorridorsByCreator(createdBy: string): Promise<Array<CountryCorridorData>> {
    const url = `/static-table/country-corridor-master/creator/${createdBy}`
    try {
      const { data } = await api1.get(url)
      return data?.data || data
    } catch (err) {
      throw new Error(`Unable to fetch corridors created by ${createdBy}. Please try again.`)
    }
  }

  // ============ CREATE Operations ============

  /**
   * Create new country corridor
   */
  async createCorridor(payload: CreateCorridorPayload): Promise<CountryCorridorResponse> {
    const url = `/api/static-table/country-corridor-master`
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      console.error('Error creating corridor:', err)
      throw new Error('Unable to create corridor. Please try again.')
    }
  }

  /**
   * Bulk create corridors
   */
  async bulkCreateCorridors(corridors: Array<CreateCorridorPayload>): Promise<Array<CountryCorridorResponse>> {
    const url = `/static-table/country-corridor-master/bulk`
    try {
      const { data } = await api1.post(url, corridors)
      return data?.data || data
    } catch (err) {
      throw new Error('Unable to create corridors in bulk. Please try again.')
    }
  }

  // ============ UPDATE Operations ============

  /**
   * Update existing country corridor
   */
  async updateCorridor(corridorCode: string, payload: UpdateCorridorPayload): Promise<CountryCorridorResponse> {
    const url = `/api/static-table/country-corridor-master/${corridorCode}`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      throw new Error(`Unable to update corridor ${corridorCode}. Please try again.`)
    }
  }

  /**
   * Update corridor active status
   */
  // async updateActiveStatus(corridorCode: string, active: boolean): Promise<CountryCorridorResponse> {
  //   const url = `/static-table/country-corridor-master/${corridorCode}/active/${active}`
  //   try {
  //     const { data } = await api1.del(url,{})
  //     return data
  //   } catch (err) {
  //     console.error(`Error updating status for corridor ${corridorCode}:`, err)
  //     throw new Error(`Unable to ${active ? 'activate' : 'deactivate'} corridor. Please try again.`)
  //   }
  // }
  async updateActiveStatus(id: string, active: boolean, staffId: string, fromDate: string, toDate: string) {
    const url = `/api/static-table/country-corridor-master/updateStatus`

    // Use the dynamic 'id' passed from your component
    const payload = {
      id: id,
      active: active,
      modifiedBy: staffId,
      effectiveFromDate: fromDate,
      effectiveToDate: toDate,
    }

    try {
      const { data } = await api1.del(url, payload)
      return data
    } catch (err) {
      console.error('Payload sent that caused failure:', payload)
      throw err
    }
  }
  /**
   * Bulk update corridor status
   */
  async bulkUpdateStatus(corridorCodes: Array<string>, active: boolean, modifiedBy: string): Promise<Array<CountryCorridorResponse>> {
    const url = `/static-table/country-corridor-master/bulk/status`
    try {
      const { data } = await api1.patch(url, { corridorCodes, active, modifiedBy })
      return data?.data || data
    } catch (err) {
      throw new Error(`Unable to ${active ? 'activate' : 'deactivate'} corridors in bulk. Please try again.`)
    }
  }

  /**
   * Update corridor effective dates
   */
  async updateEffectiveDates(
    corridorCode: string,
    effectiveFromDate: string,
    effectiveToDate: string,
    modifiedBy: string,
  ): Promise<CountryCorridorResponse> {
    const url = `/static-table/country-corridor-master/${corridorCode}/dates`
    try {
      const { data } = await api1.patch(url, { effectiveFromDate, effectiveToDate, modifiedBy })
      return data
    } catch (err) {
      throw new Error(`Unable to update dates for corridor ${corridorCode}. Please try again.`)
    }
  }

  // ============ DELETE Operations ============

  /**
   * Deactivate corridor (soft delete)
   */
  async deactivateCorridor(corridorCode: string, modifiedBy: string): Promise<CountryCorridorResponse> {
    const url = `/static-table/country-corridor-master/${corridorCode}/deactivate`
    try {
      const { data } = await api1.patch(url, { modifiedBy })
      return data
    } catch (err) {
      throw new Error(`Unable to deactivate corridor ${corridorCode}. Please try again.`)
    }
  }

  /**
   * Delete corridor permanently (admin only)
   */
  async deleteCorridorPermanently(corridorCode: string): Promise<any> {
    const url = `/static-table/country-corridor-master/${corridorCode}`
    try {
      const { data } = await api1.del(url)
      return data
    } catch (err) {
      throw new Error(`Unable to delete corridor ${corridorCode}. Please try again.`)
    }
  }

  // ============ VALIDATION Operations ============

  /**
   * Validate corridor data before submission
   */
  async validateCorridor(payload: CreateCorridorPayload | UpdateCorridorPayload): Promise<{ valid: boolean; errors?: Array<string> }> {
    const url = `/static-table/country-corridor-master/validate`
    try {
      const { data } = await api1.post(url, payload)
      return data?.data || data
    } catch (err) {
      throw new Error('Unable to validate corridor data. Please try again.')
    }
  }

  /**
   * Check if corridor code exists
   */
  async checkCorridorCodeExists(corridorCode: string): Promise<boolean> {
    const url = `/static-table/country-corridor-master/check-code/${corridorCode}`
    try {
      const { data } =
        await //@ts-ignore
        api1.get(url)
      return data?.data?.exists || false
    } catch (err) {
      return false
    }
  }

  // ============ EXPORT Operations ============

  /**
   * Export corridors to CSV
   */
  async exportCorridorsToCSV(countryCode?: string): Promise<Blob> {
    let url = `/static-table/country-corridor-master/export/csv`
    if (countryCode) {
      url += `?countryCode=${countryCode}`
    }
    try {
      const response = await api1.get(url)
      return response.data
    } catch (err) {
      throw new Error('Unable to export corridors. Please try again.')
    }
  }

  /**
   * Export corridors to Excel
   */
  async exportCorridorsToExcel(countryCode?: string): Promise<Blob> {
    let url = `/static-table/country-corridor-master/export/excel`
    if (countryCode) {
      url += `?countryCode=${countryCode}`
    }
    try {
      const response = await api1.get(url)
      return response.data
    } catch (err) {
      throw new Error('Unable to export corridors to Excel. Please try again.')
    }
  }

  // ============ UTILITY Operations ============

  /**
   * Generate corridor code based on country
   */
  generateCorridorCode(countryCode: string): string {
    const prefix = 'CCC'
    const timestamp = Date.now().toString().slice(-4)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')
    return `${prefix}${countryCode}${timestamp}${random}`.slice(0, 10)
  }

  /**
   * Format date for API
   */
  formatDateForAPI(date: Date): string {
    return date.toISOString().split('.')[0]
  }

  /**
   * Get default effective to date
   */
  getDefaultEffectiveToDate(): string {
    return '9999-12-31T00:00:00'
  }

  /**
   * Get default effective from date
   */
  getDefaultEffectiveFromDate(): string {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 1)
    date.setMonth(0, 1)
    date.setHours(0, 0, 0, 0)
    return this.formatDateForAPI(date)
  }

  /**
   * Get corridor by ID (alias for getCorridorByCode)
   */
  getCorridorDetailsById(corridorCode: string) {
    return api1
      .get(`/static-table/country-corridor-master/${corridorCode}`)
      .then((res) => res.data?.data?.[0] || res.data?.data || res.data)
      .catch((err) => {
        console.error('Error fetching corridor details:', err)
        return null
      })
  }

  /**
   * Get document by corridor code
   */
  async getDocumentByCorridorCode(corridorCode: string): Promise<any> {
    const url = `/static-table/country-corridor-master/${corridorCode}/documents`
    try {
      const response = await api1.get(url)
      console.log(response)
      return response?.data?.data
    } catch (err) {
      throw new Error('Unable to fetch documents by corridor code. Please try again.')
    }
  }

  /**
   * Get corridors data with overview
   */
  async getCorridorsOverview(user_country?: string): Promise<any> {
    let url = `/static-table/country-corridor-master/overview`
    if (user_country) {
      url += `?country=${user_country}`
    }
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      throw new Error(err as any)
    }
  }

  /**
   * Search by corridor code
   */
  async searchByCorridorCode(corridorCode: string): Promise<CountryCorridorData> {
    const url = `/static-table/country-corridor-master/search/code/${corridorCode}`
    try {
      const { data } = await api1.get(url)
      return data?.data?.[0] || data?.data || data
    } catch (err) {
      throw new Error('Unable to fetch corridor by code. Please try again.')
    }
  }

  /**
   * Search by country code
   */
  async searchByCountryCode(countryCode: string): Promise<Array<CountryCorridorFormData>> {
    const url = `/static-table/country-corridor-master/country/${countryCode}`
    try {
      const { data } = await api1.get(url)
      return data?.data || data
    } catch (err) {
      throw new Error('Unable to fetch corridors by country code. Please try again.')
    }
  }

  /**
   * Search by corridor code and country
   */
  async searchByCorridorCodeAndCountry(corridorCode: string, countryCode: string): Promise<CountryCorridorFormData> {
    const url = `/static-table/country-corridor-master/search?corridorCode=${corridorCode}&country=${countryCode}`
    try {
      const { data } = await api1.get(url)
      return data?.data?.[0] || data?.data || data
    } catch (err) {
      throw new Error('Unable to fetch corridors by both criteria. Please try again.')
    }
  }

  /**
   * Get consumers data by country
   */
  async getConsumersData(user_country: string): Promise<any> {
    const url = `/static-table/country-corridor-master/consumers?country=${user_country}`
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      throw new Error(err as any)
    }
  }
}

export { CountryCorridorService }
