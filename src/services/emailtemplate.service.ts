import { BaseService } from "./base.service";
import api1 from "./apis/api1";

export default class EmailTemplateService extends BaseService {
  protected readonly baseUrl = "/api/static-table/email-template-master";

  private mandatoryHeaders() {
    return {
      "Content-Type": "application/json",
      "x-device-ip": "127.0.0.1",
      "x-device-name": "WEB_CLIENT",
      timezone: "Asia/Kolkata",
      offset: "+05:30",
      localdatetime: new Date().toISOString().split(".")[0]
    };
  }

  async getEmailTemplateList() {
    const url = `${this.baseUrl}/getAll`;
    try {
      const { data } = await api1.post(url, {});
      return data;
    } catch (err) {
      return err as any;
    }
  }

  async createEmailTemplate(payload: any) {
    const url = `${this.baseUrl}/create`;
    try {
      const { data } = await api1.post(url, payload);
      return data;
    } catch (err) {
      return err as any;
    }
  }

  async updateEmailTemplate(id: string, payload: any) {
    const url = `${this.baseUrl}/update/${id}`;
    try {
      const { data } = await api1.put(url, payload);
      return data;
    } catch (err) {
      return err as any;
    }
  }

  async deleteEmailTemplate(id: string) {
    const url = `${this.baseUrl}/delete/${id}?active=false`;
    try {
      const { data } = await api1.del(url, {
        headers: this.mandatoryHeaders()
      });
      return data;
    } catch (err) {
      return err as any;
    }
  }
}
