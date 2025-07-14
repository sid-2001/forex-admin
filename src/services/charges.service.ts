import axios from 'axios'
import api1 from './apis/api1'
import { BaseService } from './base.service'
import { threadId } from 'worker_threads'
const { VITE_APP_BACKEND, VITE_APP_URL, VITE_APP_APPLICANT, VITE_APP_KYC, VITE_APP_STATIC } = import.meta.env

export interface Charge {
  id: number
  sendingCountry: string
  receivingCountry: string
  productCode: string
  speed: string
  speedCodeForCountry: string
  lowerSlab: number
  upperSlab: number
  minimumCharges: number
  percentageCutOffAmount: number
  percentageToBeApplied: number
  effectiveStartDate: string // Can be changed to Date if needed
  effectiveEndDate: string // Can be changed to Date if needed
  marketSegment: string
}

export class ChargesService extends BaseService {
  async GetCharges(): Promise<Array<Charge>> {
    let url = `${VITE_APP_STATIC}/charges`
    try {
      const { data } = await axios.get(url)

      return data as any
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async getBop(country: any): Promise<Array<Charge>> {
    let url = `${VITE_APP_STATIC}/api/static-table/forex-bop/by-country?country=${country}`
    try {
      const { data } = await axios.get(url)
      return data as any
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async AddCharges(payload: any): Promise<any> {
    let url = `${VITE_APP_STATIC}/charges`
    try {
      const { data } = await axios.post(url, payload)
      return data
    } catch (err) {}
  }
}
