import { BaseService } from './base.service'
import api1 from './apis/api1'

export interface Gender {
  gendercode: string
  description: string
  countrycode: string
  active: boolean
  effectivefromdate: string
  effectivetodate: string
  createdby: string | null
  created_loc: string | null
  created_time: string | null
  created_off: string | null
  modifiedby: string | null
  modified_loc: string | null
  modified_time: string | null
  modified_off: string | null
  utcdatetime: string | null
}

export default class GenderService extends BaseService {
  /**
   * Get Gender List
   *
   */

  async getGenderList(): Promise<{
    success: boolean
    count: number
    data: Gender[]
  }> {
    const url = '/api/bop/gender/getGenderList'
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Create Gender
   */
  async createGender(payload: {
    applicant_id: string
    gendercode: string
    description: string
    countrycode: string
    active: boolean
    effectivefromdate: string
    effectivetodate: string
  }): Promise<{
    status: boolean
    message: string
  }> {
    const url = '/api/bop/gender/create'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Update Gender
   */
  async updateGender(payload: { username: string; gendercode: string; countrycode: string; description: string }): Promise<{
    status: boolean
    message: string
  }> {
    const url = '/api/bop/gender/update'
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Delete Gender
   */
  async deleteGender(payload: { gendercode: string; countrycode: string }): Promise<{
    status: boolean
    message: string
  }> {
    const url = '/api/bop/gender/delete'
    try {
      const { data } = await api1.del(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }
}
