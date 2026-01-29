import { BaseService } from './base.service';
import api1 from './apis/api1';

export interface Screen {
  screencode: string;
  screendescription: string;
  countrycode: string;
  active: boolean;
  applicant_id?: string;
}

export default class ScreenService extends BaseService {
  async getScreenList(): Promise<Screen[]> {
    const url = '/api/bop/screen/getAllscreens'; 
    try {
      const { data } = await api1.get(url);
      return data.data || data; 
    } catch (err) {
      return [];
    }
  }

  async createScreen(payload: Screen) {
    const url = '/api/bop/screen/create';
    try {
      const { data } = await api1.post(url, payload);
      return data;
    } catch (err) { return err; }
  }

  async updateScreen(payload: Screen) {
    const url = '/api/bop/screen/update';
    try {
      const { data } = await api1.put(url, payload);
      return data;
    } catch (err) { return err; }
  }

  async deleteScreen(payload: { screencode: string; countrycode: string }) {
    const url = '/api/bop/screen/delete';
    try {
      const { data } = await api1.del(url, { ... payload }); // Ensure DELETE sends body if required
      return data;
    } catch (err) { return err; }
  }
// async deleteScreen(payload: { screencode: string; countrycode: string }) {
//     const url = '/api/bop/screen/delete';
//     try {
//       // We pass an object with a 'data' property as the second argument
//       const response = await api1.del(url, { 
//         data: {
//           screencode: payload.screencode,
//           countrycode: payload.countrycode
//         }
//       });
//       return response.data || response; 
//     } catch (err) { 
//       console.error("Delete call failed:", err);
//       return err; 
//     }
//   }
}