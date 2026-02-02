import api1 from "./apis/api1";

export default class BopCategoryTypeService {
  async getAll() {
    
    const { data } = await api1.get(
      "/api/static-table/bop-purpose-category-type-master/getAll"
    );
    return data;
  }

  async create(payload: any) {
    const { data } = await api1.post(
      "/api/static-table/bop-purpose-category-type-master/create",
      payload
    );
    return data;
  }

  async update(code: string, payload: any) {
    const { data } = await api1.put(
      `/api/static-table/bop-purpose-category-type-master/${code}`,
      payload
    );
    return data;
  }

  async delete(code: string) {
    const { data } = await api1.del(
      `/api/static-table/bop-purpose-category-type-master/${code}`
    );
    return data;
  }
}
