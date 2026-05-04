import { BaseService } from './base.service'
import api1 from './apis/api1'
import { BaseResponse, CustomerResponse, LoginResponse, Loginreq, StaffResponse } from '@/types/auth.type'

import { LocalStorageService } from '../helpers/local-storage-service'
import axios, { AxiosResponse } from 'axios'

import ENV from '../envioronments/environment.developement.json'
import { AxiosInstance } from 'axios'
import { BaseError } from '../types/error.type'

let local_service = new LocalStorageService()

class AuthService extends BaseService {
  async login(logindata: Loginreq, role: string): Promise<LoginResponse> {
    let url = '/admin/login'

    try {
      switch (role.split(' ').join('')) {
        case 'admin':
          url = `/admin/login`
          break
        case 'branch-owner':
          url = '/branch/login'
          break
        case 'student':
          url = '/student/login'
          break

        case 'tutor':
          url = '/tutor/login'
          break

        default:
          url = '/admin/login'
      }

      let { data } = await api1.post(url, logindata)

      if (data?.success == true) {
        local_service.set_accesstoken(data?.token)
        if (data?.user?._id) {
          data.user.id = data.user._id
        }
        local_service.set_user(data?.user)
        local_service.set_role(data?.role)
        data.role = data?.role
        return data as LoginResponse
      } else {
        throw new Error("Can't Verify your Identiy")
      }
    } catch (err) {
      //  console.log(err)
      throw err
    }
  }

  async loginAdmin(payload: { username: String; password: String }): Promise<CustomerResponse> {
    let url = '/api/kyc/auth/login'
    try {
      let { data } = await api1.post(url, payload)
      return data
    } catch (err) {
      throw new Error("Can't Verify your Identiy")
    }
  }

  async loginStaff(payload: { value: String; password: String; usernameOrEmailOrPhone: String }): Promise<StaffResponse> {
    let url = '/api/staff/staff-details/login'
    try {
      let data = await api1.post(url, payload)
      return data
    } catch (err) {
      throw new Error("Can't Verify your Identiy")
    }
  }

  async sendVerifcation(email: string): Promise<BaseResponse> {
    let url = '/admin/verify-email'
    try {
      let { data }: any = await api1.post(url, { email: email })

      if (data?.success == true) {
        local_service.set_accesstoken(data?.token)

        return data as BaseResponse
      } else {
        throw new Error("Can't Verify your Identiy")
      }
    } catch (err) {
      throw err
    }
  }

  async verifyOtp(inputdata: { email: string; otp: string }): Promise<BaseResponse> {
    let url = '/admin/verify-otp'
    try {
      let { data }: any = await api1.post(url, inputdata)

      if (data?.success == true) {
        local_service.set_resetpasswordtoken(data?.token)
        return data as BaseResponse
      } else {
        throw new Error("Can't Verify your Identiy")
      }
    } catch (err) {
      throw err
    }
  }

  async updatePassword(inputdata: { password: string }): Promise<BaseResponse> {
    let url = '/admin/reset-password'
    try {
      const token = (local_service.get_resetpasswordtoken() as any)?.replaceAll(`"`, '')

      if (token) {
        const BaseUrl = ENV.BASE_ADMIN_API_URL + '/api/v1'

        const baseUrl = BaseUrl

        const instance: AxiosInstance = axios.create({
          baseURL: baseUrl,
          responseType: 'json',
        })

        instance.interceptors.request.use(
          (config: any) => {
            if (token) {
              config.headers['Authorization'] = 'Bearer ' + token
              //   config.headers["ngrok-skip-browser-warning"] = "69420";
            }

            return config
          },
          (error: any) => {
            // Handle request error

            return Promise.reject(error)
          },
        )
        instance.interceptors.response.use(
          (response: AxiosResponse) => {
            // Modify the response data
            // For example, you can perform data transformations or error handling

            return response
          },
          (error: any) => {
            // Handle response error
            if (error.response.status === 401) {
              //   redirect("/");
              return Promise.reject(error)
            } else {
              const err = new BaseError()
              err.error_message = error?.response?.data ? error?.response?.data : 'Bad Response'
              err.error_code = String(error.response.status)
              //   logger.error("Response Interceptor Error:", err);
              return Promise.reject(err)
            }
          },
        )

        const { data } = await instance.put(url, inputdata)

        if (data?.success == true) {
          return data as BaseResponse
        } else {
          throw new Error("Can't Verify your Identiy")
        }
      } else {
        throw new Error('Not Authorized')
      }
    } catch (err) {
      throw new Error("Can't Verify your Identiy")
    }
  }
}

export { AuthService }
