import { BaseService } from './base.service'
import api1 from './apis/api1'

export interface StateMaster {
  statecode: string
  statedescription: string
  countrycode: string
  active: boolean
  effectivefromdate: string
  effectivetodate: string
  createdby: string | null
  modifiedby: string | null
  utcdatetime: string | null
}

export default class StateService extends BaseService {
  /**
   * Get State List
   */
  async getStateList(): Promise<{
    success: boolean
    count: number
    data: StateMaster[]
  }> {
    const url = '/api/bop/state/getAllStates'
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Create State
   */
  async createState(payload: {
    statecode: string
    statedescription: string
    countrycode: string
    active: boolean
    effectivefromdate: string
    effectivetodate: string
  }): Promise<{ status: boolean; message: string }> {
    const url = '/api/bop/state/create'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Update State
   */
  async updateState(payload: {
    applicant_id: string
    statecode: string
    statedescription: string
    countrycode: string
  }): Promise<{ status: boolean; message: string }> {
    const url = '/api/bop/state/update'
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Delete State
   */
  async deleteState(payload: { statecode: string; countrycode: string }): Promise<{ status: boolean; message: string }> {
    const url = '/api/bop/state/delete'
    try {
      //@ts-ignore
      const { data } = await api1.del(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }
}
