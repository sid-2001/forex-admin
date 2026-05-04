import api1 from './apis/api1'
import { BaseService } from './base.service'

export interface Staff {
  email: string
  roleDescription: string
  roleId: number
  staffAddressLine1: string
  staffAddressLine2: string
  staffBranch: string
  staffCity: string
  staffContactNumber: string
  staffCountry: string
  staffFirstName: string
  staffId: string
  staffIdNumber: string
  staffIdType: string
  staffLastName: string
  staffPostalCode: string
  staffSuburb: string
  username: string
}

export interface Modules {
  moduleId: number
  moduleName: string
  moduleDescription: string
  moduleStatus: string
  moduleLink: string
  // moduleStatus:string
}

export class UserService extends BaseService {
  async createModule(payload: any, staffId: any): Promise<any> {
    let url = `/api/staff/staff-modules/staff/${staffId}/modules`
    try {
      let { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async getAllStaffList(): Promise<Array<Staff>> {
    let url = '/api/staff/staff-details/getAllStaff'
    try {
      let data = await api1.get(url)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async getAllModulesData(): Promise<Array<Modules>> {
    let url = '/api/staff/staff-modules'
    try {
      let data = await api1.get(url)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async getAllRolesData(): Promise<any> {
    let url = '/api/staff/staff-roles/getAll'
    try {
      let data = await api1.get(url)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async getStaffDetailsById(staffId: string): Promise<any> {
    let url = `/api/staff/staff-details/staff/${staffId}`
    try {
      let data = await api1.get(url)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async createStaff(payload: any): Promise<any> {
    let url = '/api/staff/staff-details/add'
    try {
      console.log(payload)
      let data = await api1.post(url, payload)
      return data
    } catch (err) {
      console.log(err)
      throw new Error(err as any)
    }
  }

  async editStaff(payload: any, staffId: string): Promise<any> {
    let url = `/api/staff/staff-details/update/staff/${staffId}`
    try {
      let { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async deleteModule(id: number, staffId: any): Promise<any> {
    let url = `/api/staff/staff-modules/staff/${staffId}/deleteModule/${id}`
    try {
      let data = await api1.del(url, {})
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async updateModule(payload: any, staffId: number): Promise<any> {
    let url = `/api/staff/staff-modules/updateModule/${staffId}`
    try {
      let { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async getRole(roleId: string): Promise<any> {
    let url = `/api/staff/staff-roles/${roleId}`
    try {
      let { data } = await api1.get(url)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async addRole(payload: any, staffId: any): Promise<any> {
    let url = `/api/staff/staff-roles/staff/${staffId}/add`
    try {
      let data = await api1.post(url, payload)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async getRolesList(): Promise<any> {
    let url = `/api/staff/staff-roles/getAll`
    try {
      let data = await api1.get(url)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async editRoles(staffId: string, payload: any): Promise<any> {
    const url = `/api/staff/staff-roles/update/${staffId}`
    try {
      const { data } = await api1.post(url, payload)
      return data // This will contain { status: true, message: "...", data: "..."}
    } catch (err: any) {
      if (err.response && err.response.data) {
        throw err.response.data // Pass API error response forward
      }
      throw err // Fallback generic error
    }
  }

  async getCountriesList() {
    let url = '/api/static-table/forex/getAllCountry'
    try {
      let data = await api1.get(url)
      return data
    } catch (e) {
      throw new Error(e as any)
    }
  }
  async BranchList(countryCode: string) {
    let url = `/api/static-table/forex-branch-code/listByCountryCode?countryCode=${countryCode}`
    try {
      let data = await api1.get(url)
      return data
    } catch (e) {
      throw new Error(e as any)
    }
  }

  //   async getSuburbList() {
  //   const url = '/api/static-table/states/ZA';
  //   try {
  //     const { data } = await api1.get(url);
  //     return data;
  //   } catch (error) {
  //     throw new Error(error as any);
  //   }
  // }
}
