import { ConsoleLogger } from '@/helpers/logger'
import api1 from './apis/api1'
import { BaseService } from './base.service'

export interface Drivers {
  uid: string
  name: string
  transaction_count: number
  description: string
  is_Active: boolean
  updated_at: string
}
export interface Logs {
  uid: string
  driver_name: string
  transaction_count: number
  reason_of_abend: string
  raised_at: string // or Date if you parse it as a Date object
  fixed_at: string // or Date if you parse it as a Date object
  status: 'open' | 'closed'
  attending_person: string
}

export class DriverService extends BaseService {
  async getClientToken() {
    let url = '/transaction/token'
    try {
      let data = await api1.get(url)
      return data
    } catch (e) {
      throw new Error(e as any)
    }
  }

  async getDriverList(): Promise<Array<Drivers>> {
    let url = '/drivers'
    try {
      let data = await api1.get(url)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }
  async refreshDriverList(): Promise<Array<Drivers>> {
    let url = '/drivers/refresh'
    try {
      let data = await api1.get(url)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }
  async addDriver(payload: { name: String; transaction_count: Number; description: String; is_active: Boolean }): Promise<Drivers> {
    let url = '/drivers'
    try {
      let { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async updateDriver(payload: { name: String; transaction_count: Number; description: String; is_active: Boolean }, uid: string): Promise<Drivers> {
    let url = `/drivers/${uid}`
    try {
      let { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }
  async deleteDriver(uid: string): Promise<Drivers> {
    let url = `/drivers/remove/${uid}`

    try {
      let payload = {}
      let { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async logsList(): Promise<Array<Logs>> {
    let url = '/alerts'
    try {
      let data = await api1.get(url)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }
  async logsopenList(): Promise<Array<Logs>> {
    let url = '/alerts/open'
    try {
      let data = await api1.get(url)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async addLog(payload: { name: String; transaction_count: Number; description: String; is_active: Boolean }): Promise<Drivers> {
    let url = '/drivers'
    try {
      let { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }
}
