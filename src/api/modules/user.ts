import request from './request'
import type { ApiResponse, PageResponse } from '@/types/api'
import type { User } from '@/views/admin/user-manage/config'

const baseUrl = '/users'

export const userApi = {
  ApiPageList: async function (params: any): Promise<ApiResponse<PageResponse<User>>> {
    console.log('用户分页API请求参数:', params)
    // 构建请求参数，过滤空字符串
    const requestParams: any = { ...params }
    Object.keys(requestParams).forEach(key => {
      if (requestParams[key] === '' || requestParams[key] === null || requestParams[key] === undefined) {
        delete requestParams[key]
      }
    })
    
    return await request.post(`${baseUrl}/page`, requestParams)
  },

  ApiSaveOrUpdate: async function (params: User): Promise<ApiResponse<User>> {
    if (params.id) {
      return await request.put(`${baseUrl}`, params)
    } else {
      return await request.post(`${baseUrl}`, params)
    }
  },

  ApiDelete: async function (id: number | string): Promise<ApiResponse<void>> {
    return await request.delete(`${baseUrl}/${id}`)
  },

  // 批量接口后端暂不支持，已移除
  // ApiBatchDelete: async function (ids: number[]): Promise<ApiResponse<void>> { ... }

  ApiUpdateStatus: async function (id: number | string, status: number): Promise<ApiResponse<void>> {
    // 修改为 query 参数传递，由于封装的 request.put 不支持 config 参数，这里拼接到 URL
    return await request.put(`${baseUrl}/status?userId=${id}&status=${status}`)
  },

  // 批量接口后端暂不支持，已移除
  // ApiBatchUpdateStatus: async function (ids: number[], status: number): Promise<ApiResponse<void>> { ... }

  ApiResetPassword: async function (id: number | string): Promise<ApiResponse<void>> {
    return await request.post(`${baseUrl}/reset-password`, [id])
  },

  ApiGetById: async function (id: number | string): Promise<ApiResponse<User>> {
    return await request.get(`${baseUrl}/${id}`)
  }
}

export default userApi
