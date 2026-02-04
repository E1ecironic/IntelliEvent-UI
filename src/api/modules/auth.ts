import request from './request'
import type { ApiResponse } from '@/types/api'

/**
 * 认证相关接口
 */
export const authApi = {
  /**
   * 获取验证码
   */
  getCaptcha(): Promise<ApiResponse<{ uuid: string; img: string }>> {
    return request.get('/captcha')
  },

  /**
   * 用户登录
   */
  login(data: any): Promise<ApiResponse<{ token: string; user: any }>> {
    return request.post('/login', data)
  },

  /**
   * 退出登录
   */
  logout(): Promise<ApiResponse<void>> {
    return request.post('/logout.do')
  }
}

export default authApi
