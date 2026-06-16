import { BaseService } from './base.service'
import api1 from './apis/api1'

export default class CouponService extends BaseService {
  async getAllCoupons(): Promise<any> {
    const url = '/api/bop/gender/getCouponList'
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      return err as any
    }
  }

  async createCoupon(payload: Partial<any>): Promise<any> {
    const url = '/api/bop/gender/coupon/create'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async updateCoupon(payload: Partial<any>): Promise<any> {
    const url = `/api/bop/gender/coupon/update`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }
}
