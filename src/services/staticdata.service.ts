import { BaseService } from './base.service'
import api1 from './apis/api1'
import { CountryData, PaymentGateway } from '@/types/static.type'

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

  async getCountryList(): Promise<Array<CountryData>> {
    let url = '/api/static-table/forex/getAllCountry'
    try {
      let  data  = await api1.get(url)
      return data as Array<CountryData>
    } catch (err) {
      return err as any
    }
  }

    async getCountryCurrency(country:any): Promise<String> {
    let url = `/api/static-table/forex/country-currency/countryCode/${country}`
    try {
      let  data  = await api1.get(url)
      return data as String
    } catch (err) {
      return err as any
    }
  }


   async paymentGatewayStatus(id:any,status:boolean): Promise<Array<any>> {
    let url = `/api/static-table/forex-gateway/disablePaymentGateway/id/${id}/status/${status}`
    try {
      let  {data}  = await api1.put(url,{})
      return data as Array<any>
    } catch (err) {
      return err as any
    }
  }

   async getStaticPaymentGateway(country:any): Promise<Array<PaymentGateway>> {
    let url = `/api/static-table/forex-gateway/by-country?countryCode=${country}`
    try {
      let  data  = await api1.get(url)
      return data as Array<PaymentGateway>
    } catch (err) {
      return err as any
    }
  }
}
