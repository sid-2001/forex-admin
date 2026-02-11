// import api1 from './apis/api1'

// export default class ProductConfigService {
 
//   async getByCountryCode(countryCode: string) {
//     try {
//       // Assuming your api1 baseURL handles the 'https://api.impronics.com/api' part
//       const { data } = await api1.get(`/static-table/countryCorridorProduct/getByCountryCode/${countryCode}`)
//       return data
//     } catch (error: any) {
//       console.error('Error in ProductConfigService:', error)
//       return { status: false, data: [], message: error.message }
//     }
//   }


// }
import api1 from './apis/api1'

export default class ProductConfigService {
  async getByCountryCode(countryCode: string): Promise<any> {
    try {
      const { data } = await api1.get(`/api/static-table/countryCorridorProduct/getByCountryCode/${countryCode}`)
      return data
    } catch (error: any) {
      return { status: false, data: [], message: error.message }
    }
  }
}