import api1 from "./apis/api1";

export default class VendorApiConfigService {
  private getHeaders() {
    return {
      'timezone': 'Asia/Kolkata',
      'offset': '+05:30',
      'localdatetime': new Date().toISOString().split('.')[0], 
      'Content-Type': 'application/json'
    };
  }

  async getAll() {
    const response = await api1.get("/api/static-table/vendor-api/getAll");
    console.log("Full API Response:", response.data);
    return  response.data ||[];
  }

  async create(payload: any) {
    // Note: URL params required as per your CURL: ?vendorCode=...&urlCode=...
    const url = `/api/static-table/vendor-api/create?vendorCode=${payload.vendorCode}&urlCode=${payload.urlCode}`;
    return await api1.post(url, payload,);
  }

  async update(id: number | string, payload: any) {
    return await api1.put(`/api/static-table/vendor-api/update/${id}`, payload, );
  }
}