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
    const url = '/api/bop/gender/createcoupon'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async updateCoupon(payload: Partial<any>): Promise<any> {
    const url = `/api/bop/gender/updatecoupon`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async bulkUploadCoupons(payload: any) {
    const url = '/api/bop/gender/bulk-upload'
    try {
      console.log(payload, '--------------')

      //@ts-ignore
      const { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      console.error('Error uploading file:', err)
      return err
    }
  }

  async exportCouponsList() {
    const url = '/api/bop/gender/export-coupons'
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      return err as any
    }
  }

  async bulkUploadCouponCodes(file: File) {
    const url = '/api/bop/gender/coupon-codes/bulk-upload'
    try {
      const formData = new FormData()
      formData.append('file', file)
      //@ts-ignore
      const { data } = await api1.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return data
    } catch (err) {
      console.error('Error uploading file:', err)
      return err
    }
  }
}
