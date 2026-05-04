import { BaseService } from './base.service'
import api1 from './apis/api1'

export interface SequenceMaster {
  sequenceId: number
  countryCode: string
  productCode: string
  vendorCode: string
  vendorTypeCode: string
  moduleFeatureCode: string
  prefix: string | null
  intermediate: string | null
  suffix: string | null
  maxLimitDigit: number
  docSeq: string
  flag: boolean
  startSeqNumber: number
  currentSeqNumber: number
  sequenceNumber: string
  active: boolean
  effectiveFromDate: string | null
  effectiveToDate: string | null
  // Audit fields
  createdBy: string | null
  modifiedBy: string | null
  createdLocalDateTime: string | null
  createdTimeZone: string | null
  createdOffset: string | null
}

export default class SequenceApiService extends BaseService {
  async getAll(): Promise<any> {
    const url = '/api/static-table/generate-sequence'
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      return err as any
    }
  }

  async create(payload: Partial<SequenceMaster>): Promise<{ status: boolean; message: string }> {
    const url = '/api/static-table/generate-sequence/create'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async update(id: number | string, payload: Partial<SequenceMaster>): Promise<{ status: boolean; message: string }> {
    const url = `/api/static-table/generate-sequence/${id}`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async delete(id: number | string): Promise<{ status: boolean; message: string }> {
    const url = `/api/static-table/generate-sequence/delete/${id}`
    try {
      const { data } = await api1.del(url)
      return data
    } catch (err) {
      return err as any
    }
  }

  async getModuleTypeList(): Promise<any[]> {
    try {
      const { data } = await api1.get(`/api/static-table/module-feature-master/getAll`)
      return Array.isArray(data) ? data : data?.data || []
    } catch (error) {
      console.error('Fetch Error:', error)
      return []
    }
  }

  async getActiveCountryCorridors(): Promise<any[]> {
    try {
      const { data } = await api1.get(`/api/static-table/forex/active-country-currency`)
      return Array.isArray(data) ? data : data?.data || []
    } catch (error) {
      console.error('Fetch Error:', error)
      return []
    }
  }

  async createBulkSequence(payload: any): Promise<{ status: boolean; message: string }> {
    const url = '/api/static-table/generate-sequence/create/bulk'
    try {
      const { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }
}
