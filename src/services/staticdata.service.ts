import { BaseService } from './base.service'
import api1 from './apis/api1'

export default class staticdataService extends BaseService {
  async staticData(
    url: '',
    payload: any,
  ): Promise<{
    data: any
    status: Boolean
    message: 'Created successfully'
  }> {
    try {
      let { data } = await api1.post(url, payload)
      return data as any
    } catch (err) {
      return err as any
    }
  }
}
