import api1 from './apis/api1'
export interface IVendor {
  vendorCode: string
  vendorName: string
  countryCode: string | null
  currencyCode: string | null
  vendorAddress1: string | null
  vendorAddress2: string | null
  vendorAddress3?: string | null
  vendorCountry: string | null
  vendorState: string | null
  vendorZipCode: string | null
  vendorMobile: string | null
  vendorAlternateMobile?: string | null
  vendorEmail: string | null
  vendorAlternateEmail?: string | null
  vendorReferred?: string | null
  vendorType: string | null
  active: boolean
  effectiveFromDate: string | null
  effectiveToDate: string | null
  createdLocalDateTime?: string | null
  utcDateTime?: string | null
}

export interface IVendorType {
  active: boolean
  countryCode: string | null
  createdBy: string | null
  createdLocalDateTime: string | null
  createdOffset: string | null
  createdTimezone: string | null
  createdUtcDateTime: string | null
  effectiveFromDate: string | null
  effectiveToDate: string | null
  modifiedBy: string | null
  modifiedLocalDateTime: string | null
  modifiedOffset: string | null
  modifiedTimezone: string | null
  modifiedUtcDateTime: string | null
  vendorType: string | null
  vendorTypeCode: string | null
}

export default class VendorApiService {
  private getHeaders() {
    return {
      timezone: 'Asia/Kolkata',
      offset: '+05:30',
      localdatetime: new Date().toISOString().split('.')[0], // 2026-02-11T10:00:00
      'Content-Type': 'application/json',
    }
  }

  async getAll(): Promise<IVendor[]> {
    try {
      const { data } = await api1.get('/api/static-table/vendor/getAll')
      return Array.isArray(data) ? data : data?.data || []
    } catch (error) {
      console.error('Fetch Error:', error)
      return []
    }
  }

  async create(payload: IVendor): Promise<any> {
    const { data } = await api1.post('/api/static-table/vendor/create', payload)
    return data
  }

  async update(vendorCode: string, payload: IVendor): Promise<any> {
    const { data } = await api1.put(
      `/api/static-table/vendor/update/${vendorCode}`,
      payload,
      //  { headers: this.getHeaders()}
    )
    return data
  }

  async delete(vendorCode: string): Promise<any> {
    // Matches your DELETE curl: /delete/VC015?active=false
    const { data } = await api1.del(`/api/static-table/vendor/delete/${vendorCode}`, {
      params: { active: false },
      headers: this.getHeaders(),
    })
    return data
  }

  async getExchangeRateVendorsList(): Promise<IVendor[]> {
    try {
      const { data } = await api1.get(`/api/static-table/vendor/getExchangeRateVendors`)
      return Array.isArray(data) ? data : data?.data || []
    } catch (error) {
      console.error('Fetch Error:', error)
      return []
    }
  }

  async getVendorTypeData(): Promise<IVendorType[]> {
    try {
      const { data } = await api1.get(`/api/static-table/vendor-type-master/getAll`)
      return Array.isArray(data) ? data : data?.data || []
    } catch (error) {
      console.error('Fetch Error:', error)
      return []
    }
  }
}
