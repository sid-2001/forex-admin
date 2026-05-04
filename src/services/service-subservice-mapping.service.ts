// services/service-subservice-mapping.service.ts
import { BaseService } from './base.service'
import api1 from './apis/api1'
//@ts-nocheck
//@ts
export interface ServiceSubServiceMapping {
  serviceSubServiceMapCode?: string
  countryCode: string
  serviceCode: string
  subServiceCode: string
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy?: string
  modifiedBy?: string
  createdLocalDateTime?: string
  createdTimeZone?: string
  createdOffset?: string
  modifiedLocalDateTime?: string
  modifiedTimeZone?: string
  modifiedOffset?: string
  createdUtcDateTime?: string
  modifiedUtcDateTime?: string
  effectiveDateValid?: boolean
}

export default class ServiceSubServiceMappingService extends BaseService {
  // Get all service-subservice mappings
  async getAllMappings(): Promise<ServiceSubServiceMapping[]> {
    const url = '/api/static-table/serviceSubServiceMapping/getAll'
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.error('Error fetching mappings:', err)
      return []
    }
  }

  // Get mapping by map code
  async getMappingById(mapCode: string): Promise<ServiceSubServiceMapping | null> {
    const url = `/static-table/serviceSubServiceMapping/${mapCode}`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.error(`Error fetching mapping ${mapCode}:`, err)
      return null
    }
  }

  // Create new service-subservice mapping
  async createMapping(payload: {
    countryCode: string
    serviceCode: string
    subServiceCode: string
    effectiveFromDate: string
    effectiveToDate: string
    createdBy: string
    active: boolean
  }) {
    const url = '/api/static-table/serviceSubServiceMapping/createServiceSubService'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      console.error('Error creating mapping:', err)
      return err
    }
  }

  // Update existing service-subservice mapping
  async updateMapping(
    mapCode: string,
    payload: {
      countryCode?: string
      serviceCode?: string
      subServiceCode?: string
      effectiveFromDate?: string
      effectiveToDate?: string
      modifiedBy: string
      active?: boolean
    },
  ) {
    const url = `/api/static-table/serviceSubServiceMapping/update/${mapCode}`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      console.error(`Error updating mapping ${mapCode}:`, err)
      return err
    }
  }

  // Delete mapping
  async deleteMapping(mapCode: string) {
    const url = `/static-table/serviceSubServiceMapping/delete/${mapCode}`
    try {
      const { data } = await api1.del(url, { mapCode })
      return data
    } catch (err) {
      console.error(`Error deleting mapping ${mapCode}:`, err)
      return err
    }
  }

  // Get mappings by country
  async getMappingsByCountry(countryCode: string): Promise<ServiceSubServiceMapping[]> {
    const url = `/static-table/serviceSubServiceMapping/country/${countryCode}`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.error(`Error fetching mappings for country ${countryCode}:`, err)
      return []
    }
  }

  // Get mappings by service
  async getMappingsByService(serviceCode: string): Promise<ServiceSubServiceMapping[]> {
    const url = `/static-table/serviceSubServiceMapping/service/${serviceCode}`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.error(`Error fetching mappings for service ${serviceCode}:`, err)
      return []
    }
  }

  // Get mappings by sub-service
  async getMappingsBySubService(subServiceCode: string): Promise<ServiceSubServiceMapping[]> {
    const url = `/static-table/serviceSubServiceMapping/subservice/${subServiceCode}`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.error(`Error fetching mappings for sub-service ${subServiceCode}:`, err)
      return []
    }
  }

  // Get active mappings
  async getActiveMappings(): Promise<ServiceSubServiceMapping[]> {
    const url = '/static-table/serviceSubServiceMapping/active'
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.error('Error fetching active mappings:', err)
      return []
    }
  }

  // Get mappings by status
  async getMappingsByStatus(active: boolean): Promise<ServiceSubServiceMapping[]> {
    const url = '/static-table/serviceSubServiceMapping/status'
    try {
      //@ts-ignore
      const { data } = await api1.get(url, { params: { active } })
      return data
    } catch (err) {
      console.error(`Error fetching mappings with status ${active}:`, err)
      return []
    }
  }

  // Get mappings by date range
  async getMappingsByDateRange(fromDate: string, toDate: string): Promise<ServiceSubServiceMapping[]> {
    const url = '/static-table/serviceSubServiceMapping/date-range'
    try {
      //@ts-ignore
      const { data } = await api1.get(url, { params: { fromDate, toDate } })
      return data
    } catch (err) {
      console.error('Error fetching mappings by date range:', err)
      return []
    }
  }

  // Get effective mappings for a specific date
  async getEffectiveMappings(date: string): Promise<ServiceSubServiceMapping[]> {
    const url = '/static-table/serviceSubServiceMapping/effective'
    try {
      //@ts-ignore
      const { data } = await api1.get(url, { params: { date } })
      return data
    } catch (err) {
      console.error(`Error fetching effective mappings for date ${date}:`, err)
      return []
    }
  }

  // Search mappings
  async searchMappings(searchTerm: string): Promise<ServiceSubServiceMapping[]> {
    const url = '/static-table/serviceSubServiceMapping/search'
    try {
      //@ts-ignore
      const { data } = await api1.get(url, { params: { term: searchTerm } })
      return data
    } catch (err) {
      console.error('Error searching mappings:', err)
      return []
    }
  }

  // Get mappings with pagination
  async getPaginatedMappings(page: number, size: number, sortBy?: string, sortDir?: 'asc' | 'desc') {
    const url = '/static-table/serviceSubServiceMapping/paginated'
    try {
      const params: any = { page, size }
      if (sortBy) params.sortBy = sortBy
      if (sortDir) params.sortDir = sortDir
      //@ts-ignore
      const { data } = await api1.get(url, { params })
      return data
    } catch (err) {
      console.error('Error fetching paginated mappings:', err)
      return err
    }
  }

  // Get mapping count
  async getMappingCount(active?: boolean) {
    const url = '/static-table/serviceSubServiceMapping/count'
    try {
      const params: any = {}
      if (active !== undefined) params.active = active
      //@ts-ignore
      const { data } = await api1.get(url, { params })
      return data
    } catch (err) {
      console.error('Error getting mapping count:', err)
      return err
    }
  }

  // Toggle mapping status
  async toggleMappingStatus(mapCode: string, modifiedBy: string) {
    const url = `/static-table/serviceSubServiceMapping/toggle-status/${mapCode}`
    try {
      const { data } = await api1.patch(url, { modifiedBy })
      return data
    } catch (err) {
      console.error(`Error toggling status for mapping ${mapCode}:`, err)
      return err
    }
  }

  // Get mapping history
  async getMappingHistory(mapCode: string) {
    const url = `/static-table/serviceSubServiceMapping/history/${mapCode}`
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.error(`Error fetching history for mapping ${mapCode}:`, err)
      return err
    }
  }

  // Validate mapping
  async validateMapping(countryCode: string, serviceCode: string, subServiceCode: string) {
    const url = '/static-table/serviceSubServiceMapping/validate'
    try {
      //@ts-ignore
      const { data } = await api1.get(url, {
        params: { countryCode, serviceCode, subServiceCode },
      })
      return data
    } catch (err) {
      console.error('Error validating mapping:', err)
      return err
    }
  }

  // Get mappings by multiple countries
  async getMappingsByCountries(countryCodes: string[]): Promise<ServiceSubServiceMapping[]> {
    const url = '/static-table/serviceSubServiceMapping/countries'
    try {
      const { data } = await api1.post(url, { countryCodes })
      return data
    } catch (err) {
      console.error('Error fetching mappings by countries:', err)
      return []
    }
  }

  // Get mappings by multiple services
  async getMappingsByServices(serviceCodes: string[]): Promise<ServiceSubServiceMapping[]> {
    const url = '/static-table/serviceSubServiceMapping/services'
    try {
      const { data } = await api1.post(url, { serviceCodes })
      return data
    } catch (err) {
      console.error('Error fetching mappings by services:', err)
      return []
    }
  }

  // Get mappings by multiple sub-services
  async getMappingsBySubServices(subServiceCodes: string[]): Promise<ServiceSubServiceMapping[]> {
    const url = '/static-table/serviceSubServiceMapping/sub-services'
    try {
      const { data } = await api1.post(url, { subServiceCodes })
      return data
    } catch (err) {
      console.error('Error fetching mappings by sub-services:', err)
      return []
    }
  }

  // Get expiring mappings
  async getExpiringMappings(days: number): Promise<ServiceSubServiceMapping[]> {
    const url = '/static-table/serviceSubServiceMapping/expiring'
    try {
      //@ts-ignore
      const { data } = await api1.get(url, { params: { days } })
      return data
    } catch (err) {
      console.error(`Error fetching mappings expiring in ${days} days:`, err)
      return []
    }
  }

  // Get mappings by creator
  async getMappingsByCreator(createdBy: string): Promise<ServiceSubServiceMapping[]> {
    const url = '/static-table/serviceSubServiceMapping/created-by'
    try {
      //@ts-ignore
      const { data } = await api1.get(url, { params: { createdBy } })
      return data
    } catch (err) {
      console.error(`Error fetching mappings created by ${createdBy}:`, err)
      return []
    }
  }

  // Get mappings by modifier
  async getMappingsByModifier(modifiedBy: string): Promise<ServiceSubServiceMapping[]> {
    const url = '/static-table/serviceSubServiceMapping/modified-by'
    try {
      //@ts-ignore
      const { data } = await api1.get(url, { params: { modifiedBy } })
      return data
    } catch (err) {
      console.error(`Error fetching mappings modified by ${modifiedBy}:`, err)
      return []
    }
  }

  // Get distinct service codes
  async getDistinctServices(): Promise<string[]> {
    const url = '/static-table/serviceSubServiceMapping/distinct-services'
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.error('Error fetching distinct services:', err)
      return []
    }
  }

  // Get distinct sub-service codes
  async getDistinctSubServices(): Promise<string[]> {
    const url = '/static-table/serviceSubServiceMapping/distinct-subservices'
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      console.error('Error fetching distinct sub-services:', err)
      return []
    }
  }

  // Bulk create mappings
  async bulkCreateMappings(
    mappings: Array<{
      countryCode: string
      serviceCode: string
      subServiceCode: string
      effectiveFromDate: string
      effectiveToDate: string
      createdBy: string
      active: boolean
    }>,
  ) {
    const url = '/static-table/serviceSubServiceMapping/bulk-create'
    try {
      const { data } = await api1.post(url, mappings)
      return data
    } catch (err) {
      console.error('Error bulk creating mappings:', err)
      return err
    }
  }

  // Export mappings
  async exportMappings(format: 'csv' | 'excel' = 'csv') {
    const url = '/static-table/serviceSubServiceMapping/export'
    try {
      //@ts-ignore
      const { data } = await api1.get(url, {
        params: { format },
        responseType: 'blob',
      })
      return data
    } catch (err) {
      console.error('Error exporting mappings:', err)
      return err
    }
  }

  // Import mappings
  async importMappings(file: File) {
    const url = '/static-table/serviceSubServiceMapping/import'
    try {
      const formData = new FormData()
      formData.append('file', file)
      //@ts-ignore
      const { data } = await api1.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return data
    } catch (err) {
      console.error('Error importing mappings:', err)
      return err
    }
  }
}
