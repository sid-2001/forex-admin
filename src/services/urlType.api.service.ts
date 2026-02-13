import api1 from "./apis/api1";

export interface IUrlType {
  urlCode: string;
  urlType: string;
  urlDescription: string;
  active: boolean;
  effectiveFromDate: string | null;
  effectiveToDate: string | null;
}

export default class UrlTypeApiService {
  private getHeaders() {
    return {
      'timezone': 'Asia/Kolkata',
      'offset': '+05:30',
      'localdatetime': new Date().toISOString().split('.')[0],
      'Content-Type': 'application/json'
    };
  }

  async getAll(): Promise<IUrlType[]> {
    try {
      const response = await api1.get("/api/static-table/url-type/getAll");
      console.log(response.data,'jsdbcyvhv')
      return  response.data || [];
    } catch (error) {
      return [];
    }
  }

  async create(payload: IUrlType) {
    return await api1.post("/api/static-table/url-type/create", payload,);
  }

  async update(urlCode: string, payload: IUrlType) {
    return await api1.put(`/api/static-table/url-type/update/${urlCode}`, payload,);
  }

  async delete(urlCode: string) {
    return await api1.del(`/api/static-table/url-type/delete/${urlCode}`, {
      params: { active: false },
      headers: this.getHeaders()
    });
  }
}