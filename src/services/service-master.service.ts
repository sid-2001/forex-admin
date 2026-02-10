
import { BaseService } from './base.service';
import api1 from './apis/api1';

export default class ServiceMasterService extends BaseService {
  protected readonly baseUrl = '/api/static-table/serviceMaster';

  private mandatoryHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-device-ip': '127.0.0.1',
      'x-device-name': 'WEB_CLIENT',
      'timezone': 'Asia/Kolkata',
      'offset': '+05:30',
      'localdatetime': new Date().toISOString().split('.')[0]
    };
  }

  async getServiceList() {
    const url = `${this.baseUrl}/getAll`;
    try {
      const { data } = await api1.get(url);
      return data;
    } catch (err) { return err as any; }
  }

  async createService(payload: any) {
    const url = `${this.baseUrl}/createService`;
    try {
      const { data } = await api1.post(url, payload);
      return data;
    } catch (err) { return err as any; }
  }

  async updateService(id: string, payload: any) {
    const url = `${this.baseUrl}/update/${id}`;
    try {
      const { data } = await api1.put(url, payload);
      return data;
    } catch (err) { return err as any; }
  }

  async deleteService(id: string, active: boolean = false) {
    const url = `${this.baseUrl}/delete/${id}?active=${active}`;
    try {
      const { data } = await api1.del(url);
      return data;
    } catch (err) { return err as any; }
  }
}
