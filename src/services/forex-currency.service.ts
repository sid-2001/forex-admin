import { BaseService } from "./base.service";
import api1 from "./apis/api1";

export interface ForexCurrency {
  countryCode: string;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  active: boolean;
}

export default class ForexCurrencyService extends BaseService {
  protected readonly baseUrl = "/api/static-table/forex-currency";

  private mandatoryHeaders() {
    return {
      "Content-Type": "application/json",
      timezone: "Asia/Kolkata",
      offset: "+05:30",
      localdatetime: new Date().toISOString().split(".")[0]
    };
  }

  async getAll() {
    try {
      const { data } = await api1.get(`${this.baseUrl}/getAll`);
      return data;
    } catch (err) {
      return err as any;
    }
  }

  async getById(id: string) {
    try {
      const { data } = await api1.get(`${this.baseUrl}/${id}`);
      return data;
    } catch (err) {
      return err as any;
    }
  }

  async create(payload: any) {
    try {
      const { data } = await api1.post(this.baseUrl, payload);
      return data;
    } catch (err) {
      return err as any;
    }
  }

  async update(id: string, payload: any) {
    try {
      const { data } = await api1.put(`${this.baseUrl}/${id}`, payload);
      return data;
    } catch (err) {
      return err as any;
    }
  }

  async updateStatus(payload: any) {
    try {
      const { data } = await api1.del(
        `${this.baseUrl}/updateStatus`,
        {
          headers: this.mandatoryHeaders(),
          data: payload
        }
      );
      return data;
    } catch (err) {
      return err as any;
    }
  }
  async delete(countryCode: string) {
    const { data } = await api1.del(`${this.baseUrl}/${countryCode}`);
    return data;
  }
}
