import { BaseService } from './base.service'
import api1 from './apis/api1'

export default class NotificationService extends BaseService {
  async getAll(): Promise<any> {
    const url = '/api/static-table/notification-master/getNotificationData'
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      return err as any
    }
  }

  async createNotification(payload: Partial<any>): Promise<{ status: boolean; message: string }> {
    const url = '/api/static-table/notification-master/createNotification'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async updateNotification(notificationCode: string, payload: Partial<any>): Promise<{ status: boolean; message: string }> {
    const url = `/api/static-table/notification-master/${notificationCode}`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async getAllNotificationCampaign(): Promise<any> {
    const url = '/api/notifications/campaigns'
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      return err as any
    }
  }

  async createNotificationCampaign(payload: Partial<any>): Promise<{ status: boolean; message: string }> {
    const url = '/api/notifications/campaigns'
    try {
      const data = await api1.post(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async updateNotificationCampaign(campaignId: number, payload: Partial<any>): Promise<{ status: boolean; message: string }> {
    const url = `/api/notifications/campaigns/${campaignId}`
    try {
      const { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      return err as any
    }
  }

  async getAllCampaignDeliveries(campaignId: any): Promise<any> {
    const url = `/api/notifications/campaigns/${campaignId}/deliveries`
    try {
      const response = await api1.get(url)
      return response
    } catch (err) {
      return err as any
    }
  }
}
