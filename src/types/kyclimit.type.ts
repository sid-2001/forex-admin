export interface KycLimitTypeData {
  kycLimitTypeCode: string
  limitCode: string
  limitDescription: string
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string
  modifiedBy: string
  createdLocalDateTime: string
  createdTimezone: string
  createdOffset: string
  modifiedLocalDateTime: string
  modifiedTimezone: string
  modifiedOffset: string
  createdUtcDatetime: string
  modifiedUtcDatetime: string
}

export interface CreateLimitTypePayload {
  limitCode: string
  limitDescription: string
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  createdBy: string
}

export interface UpdateLimitTypePayload {
  limitCode: string
  limitDescription: string
  active: boolean
  effectiveFromDate: string
  effectiveToDate: string
  modifiedBy: string
}

export interface UpdateStatusPayload {
  id: string
  active: boolean
  modifiedBy: string
}

export interface ApiResponse<T> {
  status: boolean
  message: string
  data: T
}

interface Stats {
  total: number
  active: number
  inactive: number
}

