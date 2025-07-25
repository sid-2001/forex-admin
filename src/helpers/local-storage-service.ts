import { User } from '@/types/auth.type'

class LocalStorageService {
  constructor() {}

  get(key: string) {
    return localStorage.getItem(key)
  }

  delete_eaccestoke() {
    localStorage.removeItem('access_token')
  }
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  get_accesstoken() {
    return this.get('access_token')
  }
  get_role() {
    return this.get('role')
  }
  set_role(role: string) {
    return this.set('role', role)
  }
  set_accesstoken(access_token: string) {
    return this.set('access_token', access_token)
  }
  set_user(admin: any) {
    return this.set('user', admin)
  }

  get_staff_access() {
    let staff_record: any = this.get('staff_access')
    return JSON.parse(staff_record)
  }
  get_staff_country() {
    let staff_record: any = this.get('staff_access')
    return JSON.parse(staff_record)?.staffCountry
  }

  get_modules() {
    let modules_record: any = this.get('modules')
    return JSON.parse(modules_record)
  }

  set_staff_access(staff_data: any) {
    return this.set('staff_access', staff_data)
  }

  get_user(): User | null {
    let admin = this.get('user')
    let admin_parsed: User | null = null
    if (admin != undefined) {
      admin_parsed = JSON.parse(admin)
    }
    return admin_parsed
  }
  set_resetpasswordtoken(accessToken: string) {
    this.set('reset_password_token', accessToken)
  }

  get_resetpasswordtoken() {
    return this.get('reset_password_token')
  }
}

export { LocalStorageService }
