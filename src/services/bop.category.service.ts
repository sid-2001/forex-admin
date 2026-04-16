import api1 from './apis/api1'

export default class BopCategoryService {
  async getAll() {
    const { data } = await api1.get('/api/static-table/bop-purpose-category-master/getAll')
    return data
  }
  async getCategoryType() {
    const { data } = await api1.get('/api/static-table/bop-purpose-category-type-master/getAll')
    return data
  }

  async create(payload: any) {
    const data = await api1.post('/api/static-table/bop-purpose-category-master/create', payload)
    return data
  }

  async update(payload: any) {
    const { data } = await api1.put(`/api/static-table/bop-purpose-category-master/${payload?.bopPurposeCategoryCode}`, payload)
    return data
  }

  async delete(payload: any) {
    const { data } = await api1.del('/api/static-table/bop-purpose-category-master/delete', payload)
    return data
  }
}
