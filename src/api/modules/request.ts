import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080/intellievent', // 基础URL
  timeout: 5000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('API请求:', {
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data
    })
    // 可以在这里添加token等认证信息
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`
    // }
    return config
  },
  (error: AxiosError) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    console.log('API响应数据:', res)
    
    // 根据后端返回的code进行处理
    if (res.code !== 200) {
      console.error('API返回错误:', res)
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  (error: AxiosError) => {
    console.error('响应错误:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    })
    
    let message = '网络错误'
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          // 可以在这里跳转到登录页面
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = '网络错误'
      }
    } else if (error.request) {
      message = '网络连接失败，请检查网络'
    } else {
      message = error.message || '网络错误'
    }
    
    ElMessage({
      message: message,
      type: 'error',
      duration: 5 * 1000
    })
    
    return Promise.reject(error)
  }
)

// 请求方法类型定义
interface RequestMethods {
  get<T = any>(url: string, params?: Record<string, any>): Promise<T>
  post<T = any>(url: string, data?: any): Promise<T>
  put<T = any>(url: string, data?: any): Promise<T>
  delete<T = any>(url: string, params?: Record<string, any>): Promise<T>
  upload<T = any>(url: string, formData: FormData): Promise<T>
}

// 封装请求方法
const request: RequestMethods = {
  get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    return service.get(url, { params })
  },
  
  post<T = any>(url: string, data?: any): Promise<T> {
    return service.post(url, data)
  },
  
  put<T = any>(url: string, data?: any): Promise<T> {
    return service.put(url, data)
  },
  
  delete<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    return service.delete(url, { params })
  },

  upload<T = any>(url: string, formData: FormData): Promise<T> {
    return service.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default request