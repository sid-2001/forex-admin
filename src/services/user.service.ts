import api1 from './apis/api1'
import { BaseService } from './base.service'

export interface User {
  id: string
  user_code: string
  first_name: string
  last_name: string
  email: string
  phone: string
  created_at: string // If needed, you could use Date type instead and convert from string when parsing
  role: 'user' | 'admin' | 'moderator' // Adjust roles as needed if more role types exist
  notification_token: string
  is_active: boolean
}

export interface Schedule {
  uid: string
  start_date: string
  end_date: string
  environment: string
  created_at: string
  users: Array<User>
  shift: string
}

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

export interface Roles {

}

export class UserService extends BaseService {
  async getClientToken() {
    let url = '/transaction/token'
    try {
      let data = await api1.get(url)
      return data
    } catch (e) {
      throw new Error(e as any)
    }
  }

  async getUserList(): Promise<Array<User>> {
    let url = '/users/all'
    try {
      let data = await api1.get(url)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async addUser(payload: {
    user_code: String
    first_name: String
    last_name: String
    email: String
    password: String
    phone: String
    notification_token: String
  }): Promise<User> {
    let url = '/users/new'
    try {
      let { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async editUser(
    id: String,
    payload: {
      user_code: String
      first_name: String
      last_name: String
      email: String
      password: String
      phone: String
      notification_token: String
    },
  ): Promise<User> {
    let url = `/users/${id}`
    try {
      let { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async deleteUser(id: String): Promise<User> {
    let url = `/users/${id}`
    try {
      let { data } = await api1.del(url, {})
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async getAvailableUser(startDate: string, endDate: string, shift: string): Promise<User[]> {
    let url = `/schedules/user?start_date=${startDate}&end_date=${endDate}&shift=${shift}`
    try {
      // Fetch the list of all users
      let all_user = await this.getUserList()

      console.log(all_user)

      // Fetch the data for available users
      let data = await api1.get(url)
      let availableUsers = data as User[]
      // Filter out users from all_user that are in availableUsers
      let filteredUsers = all_user.filter((user) => !availableUsers.some((availableUser) => availableUser.id === user.id))

      return filteredUsers
    } catch (err) {
      console.error(err) // Log the error for debugging
      throw new Error(err as any) // Throw the error to the caller
    }
  }

  async createSchedule(payload: { start_date: string; end_date: string; environment: string; users: Array<string> }): Promise<Schedule> {
    let url = '/schedules'
    try {
      let { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async updateSchedule(payload: { start_date: string; end_date: string; environment: string; users: Array<string> }, id: string): Promise<Schedule> {
    let url = `/schedules/${id}`
    try {
      let { data } = await api1.put(url, payload)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async deleteSchedule(id: string): Promise<Schedule> {
    let url = `/schedules/${id}`
    try {
      let data = await api1.del(url, {})
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async deleteParticularScheduleUser(id: string, user_id: string): Promise<Schedule> {
    let url = `/schedules/${id}/user/${user_id}`
    try {
      let data = await api1.del(url, {})
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async getScheduleList(): Promise<Array<Schedule>> {
    let url = '/schedules'
    try {
      let data = await api1.get(url)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async createModule(payload: any): Promise<any> {
    let url = '/api/staff/staff-modules'
    try {
      let { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async getAllStaffList(): Promise<Staff> {
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

  async getAllRolesData(): Promise<Roles> {
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
      let { data } = await api1.post(url, payload)
      return data
    } catch (err) {
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

  async deleteModule(id: number): Promise<any> {
    let url = `/api/staff/staff-modules/deleteModule/${id}`
    try {
      let data = await api1.del(url, {})
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async updateModule(payload: any, moduleId: number): Promise<any> {
    let url = `/api/staff/staff-modules/updateModule/${moduleId}`
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
      let  {data}  = await api1.get(url)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }

  async addRole(payload: any): Promise<any> {
    let url = `/api/staff/staff-roles/add`
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

  async editRoles(roleId: string, payload: any): Promise<any> {
    let url = `/api/staff/staff-roles/update/${roleId}`
    try {
      let data = await api1.post(url, payload)
      return data
    } catch (err) {
      throw new Error(err as any)
    }
  }
}
