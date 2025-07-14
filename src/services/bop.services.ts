import { BaseService } from './base.service'
import api1 from './apis/api1'

export class BopService extends BaseService {
  async getBopListing(): Promise<any> {
    let url = '/api2/bob/bop/getAll'
    try {
      const data = await api1.get(url)
      return data
    } catch (err) {
      console.log(err)
    }
  }
}
