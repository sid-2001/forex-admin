import { BaseService } from './base.service';
import api1 from './apis/api1';

export default class VerificationPartnerService extends BaseService {
  protected readonly baseUrl = '/api/static-table/verification-partner-master';

  async getPartnerList() {
    const url = `${this.baseUrl}/getAll`;
    try {
      const { data } = await api1.get(url);
      return data;
    } catch (err) { return err as any; }
  }

  async createPartner(payload: any) {
    const url = `${this.baseUrl}/create`;
    try {
      const { data } = await api1.post(url, payload);
      return data;
    } catch (err) { return err as any; }
  }

  async updatePartner(id: string, payload: any) {
    const url = `${this.baseUrl}/update/${id}`;
    try {
      const { data } = await api1.put(url, payload);
      return data;
    } catch (err) { return err as any; }
  }
}