import { BaseService } from './base.service'
import api1 from './apis/api1'

export default class MasterService extends BaseService {
  // sidebar menu apis
  async getAllMenus(queryParams?: string): Promise<any> {
    const url = `/api/staff/menu-items/getAll${queryParams ? `${queryParams}` : ''}`
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      return err as any
    }
  }

  async createMenu(payload: Partial<any>): Promise<any> {
    const url = '/api/staff/menu-items/createMenuItems'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async getAllSideBarMenus(countryCode: string, roleId: number, staffId: string): Promise<any> {
    const url = `/api/staff/menu-items/permissions?countryCode=${countryCode}&roleId=${roleId}&staffId=${staffId}`
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      return err as any
    }
  }

  async updateMenu(payload: Partial<any>, parentId: any): Promise<any> {
    const url = `/api/staff/menu-items/updateMenuItems/${parentId}`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  // faq apis
  // async getAllFaq(): Promise<any> {
  //   const url = 'api/static-table/faq_head_master/getAll'
  //   try {
  //     const response = await api1.get(url)
  //     return response
  //   } catch (err) {
  //     return err as any
  //   }
  // }

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
  // In master.service.ts

  async updateFaqDetail(faqDetailCode: string, payload: any): Promise<any> {
    const url = `api/static-table/faq_detail_master/update/${faqDetailCode}`
    try {
      const response = await api1.put(url, payload)
      console.log('Update response:', response)
      return response
    } catch (err) {
      console.error('Error updating FAQ detail:', err)
      return err as any
    }
  }
  async updateFaqHead(faqHeadCode: string, payload: any): Promise<any> {
    const url = `api/static-table/faq_head_master/update/${faqHeadCode}`
    try {
      const response = await api1.put(url, payload)
      console.log('Update response:', response)
      return response
    } catch (err) {
      console.error('Error updating FAQ head:', err)
      return err as any
    }
  }

  // Create new FAQ detail for existing FAQ Head
  async createFaqDetail(payload: any) {
    try {
      const response = await api1.post('/static-table/faq_detail_master/create', payload)
      return response.data
    } catch (error) {
      console.error('Error creating FAQ detail:', error)
      throw error
    }
  }
  async getAllFaq(queryParams?: string): Promise<any> {
    const url = queryParams ? `api/static-table/faq_head_master/getAll${queryParams}` : 'api/static-table/faq_head_master/getAll'
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      return err as any
    }
  }

  // group apis
  async getAllGroups(): Promise<any> {
    const url = '/api/staff/group-master/getAll'
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      return err as any
    }
  }

  async createGroup(payload: Partial<any>): Promise<any> {
    const url = '/api/staff/group-master/create'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }
  async updateGroup(code: string, payload: any) {
    try {
      const response = await api1.put(`/api/staff/group-master/${code}`, payload)
      return response.data
    } catch (error) {
      console.error('Error updating group detail:', error)
      throw error
    }
  }

  // email reports api
  async createEmailDetail(payload: Partial<any>): Promise<any> {
    const url = '/api/static-table/country-module-report-email-head/createAll'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async updateEmailDetail(code: string, payload: any) {
    try {
      const response = await api1.put(`/api/static-table/country-module-report-email-head/updateAll/${code}`, payload)
      return response.data
    } catch (error) {
      console.error('Error updating group detail:', error)
      throw error
    }
  }

  async getAllDetailEmails(queryParams?: string): Promise<any> {
    const url = queryParams
      ? `api/static-table/country-module-report-email-head/getAll${queryParams}`
      : 'api/static-table/country-module-report-email-head/getAll'

    // const url = '/api/static-table/country-module-report-email-head/getAll?countryCode=UAE'
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      return err as any
    }
  }

  // country corridor exchange rate api
  async createCountryCorridorExchangeRate(payload: Partial<any>): Promise<any> {
    const url = '/api/static-table/country-module-report-email-head/createAll'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async updateCountryCorridorExchangeRate(code: string, payload: any) {
    try {
      const response = await api1.put(`/api/static-table/country-module-report-email-head/updateAll/${code}`, payload)
      return response.data
    } catch (error) {
      console.error('Error updating group detail:', error)
      throw error
    }
  }

  async getAllCountryCorridorExchangeRatesList(): Promise<any> {
    const url = 'api/static-table/corridor-exchange-rate-master/getAll'

    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      return err as any
    }
  }
}
