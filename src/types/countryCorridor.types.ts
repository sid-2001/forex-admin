export interface CountryCorridorData {
  countryCorridorCode: string
  countryCode: string
  countryName?: string
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
  createdUtcDatetime: string | null
  modifiedUtcDatetime: string | null
}

export interface CountryCorridorFormData {
  countryCorridorCode: string
  countryCode: string
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string
  modifiedBy?: string
}

export interface CountryCorridorResponse {
  status: boolean
  message: string
  data: CountryCorridorData | CountryCorridorData[] | null
}

export interface CreateCorridorPayload {
  countryCode: string
  active: boolean
  createdBy: string
  effectiveFromDate: string
  effectiveToDate?: string
}

export interface UpdateCorridorPayload {
  countryCode?: string
  active?: boolean
  modifiedBy: string
  effectiveFromDate?: string
  effectiveToDate?: string
}

export interface CorridorStats {
  total: number
  active: number
  inactive: number
  countries: number
  countryList: string[]
  activeByCountry?: Record<string, number>
}

export interface ApiTransaction {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  endpoint: string
  payload?: any
  status: number
  error?: string
  timestamp: string
}