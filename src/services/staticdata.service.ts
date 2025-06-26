import { BaseService } from './base.service'
import axios from 'axios'

import api1 from './apis/api1'
const { VITE_APP_BACKEND, VITE_APP_URL, VITE_APP_APPLICANT, VITE_APP_KYC, VITE_APP_STATIC } = import.meta.env

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
