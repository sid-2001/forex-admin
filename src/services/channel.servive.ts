import { BaseService } from './base.service'
import api1 from './apis/api1'

export interface Channel {
  channel_code: string
  country_code: string
  channel_description: string
  active: boolean
  effective_from_date: string
  effective_to_date: string
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
const url = '/api/bop/channel/getAllchannels'

export default class ChannelService extends BaseService {
  /**
   * Get Channel List
   */
  async getChannelList(): Promise<{
    success: boolean
    count: number
    data: Channel[]
  }> {
    // const url = '/api/bop/channel/getAllchannels'
    const url = '/api/bop/channel/getAllchannels'
    try {
      const { data } = await api1.get(url)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Create Channel
   */
  async createChannel(payload: {
    applicant_id: string
    channel_code: string
    country_code: string
    channel_description: string
    active: boolean
    effective_from_date: string
    effective_to_date: string
  }): Promise<{
    status: boolean
    message: string
  }> {
    // const url = '/api/bop/channel/create'
    const url = '/api/bop/channel/create'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Update Channel
   */
  async updateChannel(payload: { applicant_id: string; channel_code: string; country_code: string; channel_description: string }): Promise<{
    status: boolean
    message: string
  }> {
    const url = '/api/bop/channel/update'
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Delete Channel
   */
  async deleteChannel(payload: { channel_code: string; country_code: string }): Promise<{
    status: boolean
    message: string
  }> {
    // const url = '/api/bop/channel/delete'
    const url = '/api/bop/channel/delete'
    try {
      const { data } = await api1.del(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  /**
   * Toggle Channel Active Status (optional – if API exists)
   */
  async toggleChannelActive(payload: { channel_code: string; country_code: string; activeStatus: boolean }): Promise<{
    status: boolean
    message: string
  }> {
    const url = '/api/bop/channel/active-toggle'
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }
}
