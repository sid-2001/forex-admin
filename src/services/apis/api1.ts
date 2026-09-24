/* eslint-disable no-useless-catch */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders, AxiosProgressEvent, AxiosError } from 'axios'
import { redirect } from 'react-router-dom'
import { LocalStorageService } from '../../helpers/local-storage-service'
import { publicIpv4 } from 'public-ip'

const { VITE_APP_BACKEND } = import.meta.env

interface AdaptAxiosRequestConfig extends AxiosRequestConfig {
  headers: AxiosRequestHeaders
}

const BaseUrl = VITE_APP_BACKEND

const baseUrl = BaseUrl

const instance: AxiosInstance = axios.create({
  baseURL: baseUrl,
  responseType: 'json',
})
const generateDeviceUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // Fallback for browsers/environments without crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const localStorageService = new LocalStorageService()

// Fetch device info with fallback
export async function getDeviceInfo(): Promise<{ ip: string; deviceName: string }> {
  let ip = 'unknown'
  try {
    ip = (await publicIpv4()) || 'unknown'
  } catch (err) {
    console.warn('Failed to fetch public IP:', err)
  }

  // Get device name (OS + browser info)
  const deviceName = `${navigator.platform} - ${navigator.userAgent}`

  return { ip, deviceName }
}

const forceLogout = () => {
  localStorage.clear()
  sessionStorage.clear()
  window.location.replace('/login')
}

instance.interceptors.request.use(
  async (config: AdaptAxiosRequestConfig) => {
    const { ip, deviceName } = await getDeviceInfo()
    const token = (localStorageService.get_accesstoken() as any)?.replaceAll(`"`, '')

    const now = new Date()

    // 1. Standard Offset (e.g., +05:30)
    const offsetMinutes = -now.getTimezoneOffset()
    const sign = offsetMinutes >= 0 ? '+' : '-'
    const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0')
    const minutes = String(Math.abs(offsetMinutes) % 60).padStart(2, '0')
    const offset = `${sign}${hours}:${minutes}`

    // 2. Standard Timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

    // 3. Local DateTime with HH:mm:ss.SSS
    // Subtracting timezoneOffset ensures the ISO string reflects the user's LOCAL time
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().replace('Z', '') // Result: "2026-03-09T12:45:00.783"

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
      config.headers['Content-Type'] = 'application/json'

      // Required by backend
      config.headers['X-User-Id'] = localStorageService.get_staff_id?.() || localStorage.getItem('staffId') || 'admin'

      config.headers['X-Time-Zone'] = 'Asia/Dubai'

      // Existing headers
      config.headers['timezone'] = timezone
      config.headers['offset'] = offset
      config.headers['localdatetime'] = localDateTime

      config.headers['X-Device-IP'] = ip
      config.headers['X-Device-Name'] = deviceName
      config.headers['ngrok-skip-browser-warning'] = 'true'
    } else if (!token) {
      if (sessionStorage.getItem('deviceUUID')) {
        config.headers['x-device-id'] = sessionStorage.getItem('deviceUUID')
      } else {
        const deviceUUID = generateDeviceUUID();
        sessionStorage.setItem('deviceUUID', deviceUUID)
        config.headers['x-device-id'] = deviceUUID
      }
    }

    return config
  },
  (error: any) => {
    return Promise.reject(error)
  },
)

instance.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const status = error.response?.status
    const data: any = error.response?.data

    console.log('INTERCEPTOR ERROR:', status, data)

    // ✅ Handle 401 (token refresh)
    //@ts-ignore
    if (status === 401 && !error.config?._retry) {
      try {
        //@ts-ignore
        error.config._retry = true
        const newToken = await refreshToken()

        if (!newToken) {
          forceLogout()
          return Promise.reject(error)
        }

        if (error.config) {
          error.config.headers = error.config.headers || {}
          error.config.headers['Authorization'] = `Bearer ${newToken}`

          return instance.request(error.config)

          // error.config.headers['Authorization'] = 'Bearer ' + newToken
          // return instance.request(error.config)
        }
      } catch (refreshError) {
        forceLogout()
        return Promise.reject(refreshError)
      }
    }

    // ✅ Build clean error
    const customError = {
      status: data.status,
      message: data?.message || data?.error || JSON.stringify(data) || 'Something went wrong',
    }

    return Promise.reject(customError) // ✅ no BaseError needed
  },
)

const refreshToken = async () => {
  try {
    const response = await axios.get(`${BaseUrl}/auth/refresh-token`, {
      headers: {
        Authorization: 'Bearer ' + localStorageService.get_accesstoken(),
      },
    })
    if (typeof response?.data === 'string' && response?.data.trim().startsWith('<!DOCTYPE html')) {
      throw new Error('Refresh token API returned HTML instead of an access token')
    }

    const newAccessToken = typeof response?.data === 'string' ? response?.data : response.data?.accessToken || response.data?.access_token

    if (!newAccessToken) {
      throw new Error('No access token returned from refresh API')
    }

    localStorageService.set_accesstoken(newAccessToken)

    return newAccessToken

    // const newAccessToken = response?.data as any

    // localStorageService.set_accesstoken(newAccessToken) // update token in storage
    // return newAccessToken
  } catch (error) {
    console.error('Refresh token failed:', error)

    localStorage.clear()
    sessionStorage.clear()

    window.location.replace('/login')

    return Promise.reject(error)
    // redirect('/')
    // return Promise.reject(error)
  }
}

const get = async (url: string) => {
  try {
    const { data } = await instance.get(url)
    return data
  } catch (error) {
    throw error
  }
}

const post = async (url: string, payload: any) => {
  const res = await instance.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return res.data
}

const put = async (url: string, object: any) => {
  try {
    const data = await instance.put(url, object)
    return data
  } catch (error) {
    throw error
  }
}

const patch = async (url: string, object: any) => {
  try {
    console.log('i hav alld data1', url, object)

    const { data } = await instance.patch(url, object)
    console.log('i hav alld data', url, object)
    return data
  } catch (error) {
    throw error
  }
}

const del = async (url: string, object?: any) => {
  try {
    const { data } = await instance.delete(url, {
      data: object, // 👈 body goes here
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return data
  } catch (error) {
    throw error
  }
}

const upload = async (url: string, formData: any, onUploadProgress: (progressEvent: AxiosProgressEvent) => void) => {
  try {
    const { data } = await instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    })
    return data
  } catch (error) {
    throw error
  }
}

const api1 = {
  baseUrl,
  instance,
  get,
  post,
  put,
  del,
  upload,
  patch,
}

export default api1
