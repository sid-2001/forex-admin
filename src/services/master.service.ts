import { BaseService } from './base.service'
import api1 from './apis/api1'

export default class MasterService extends BaseService {
  // sidebar menu apis
  async getAllMenus(): Promise<any> {
    const url = '/api/staff/menu-items/getAll'
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      return err as any
    }
  }

  async createMenuItem(payload: Partial<any>): Promise<any> {
    const url = '/api/staff/menu-items/createMenuItems'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async getAllSideBarMenus(countryCode: string, roleId: number): Promise<any> {
    const url = `/api/staff/menu-items/permissions?countryCode=${countryCode}&roleId=${roleId}`
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      return err as any
    }
  }

  //   async updateMenuItem(payload: Partial<any>): Promise<any> {
  //     const url = `/api/bop/gender/updatecoupon`
  //     try {
  //       const { data } = await api1.put(url, payload)
  //       return data
  //     } catch (err) {
  //       return err as any
  //     }
  //   }

  // faq apis
  async getAllFaq(): Promise<any> {
    const url = 'api/static-table/faq_head_master/getAll'
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      return err as any
    }
  }

  async createFaq(payload: Partial<any>): Promise<any> {
    const url = 'api/static-table/faq_head_master/create'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async getAllDetailFaqs(): Promise<any> {
    const url = 'api/static-table/faq_detail_master/getAll'
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      return err as any
    }
  }

  // async updateFaqHead(payload: Partial<any>): Promise<any> {
  //   const url = `/api/bop/gender/updatecoupon`
  //   try {
  //     const { data } = await api1.put(url, payload)
  //     return data
  //   } catch (err) {
  //     return err as any
  //   }
  // }
}
