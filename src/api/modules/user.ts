import request from './request'
import type { ApiResponse, PageResponse } from '@/types/api'
import type { User } from '@/views/admin/user-manage/config'

const baseUrl = '/users'

export const userApi = {
  ApiPageList: async function (params: any): Promise<ApiResponse<PageResponse<User>>> {
    console.log('用户分页API请求参数:', params)
    return await request.post(`${baseUrl}/page`, params)
  },

  ApiSaveOrUpdate: async function (params: User): Promise<ApiResponse<User>> {
    if (params.id) {
      return await request.put(`${baseUrl}`, params)
    } else {
      return await request.post(`${baseUrl}`, params)
    }
  },

  ApiDelete: async function (id: number): Promise<ApiResponse<void>> {
    return await request.delete(`${baseUrl}/${id}`)
  },

  ApiBatchDelete: async function (ids: number[]): Promise<ApiResponse<void>> {
    return await request.delete(`${baseUrl}/batch`, { data: { ids } })
  },

  ApiUpdateStatus: async function (id: number, status: number): Promise<ApiResponse<void>> {
    return await request.put(`${baseUrl}/${id}/status`, { status })
  },

  ApiBatchUpdateStatus: async function (ids: number[], status: number): Promise<ApiResponse<void>> {
    return await request.put(`${baseUrl}/batch/status`, { ids, status })
  },

  ApiResetPassword: async function (id: number, newPassword?: string): Promise<ApiResponse<void>> {
    return await request.put(`${baseUrl}/${id}/password`, { newPassword })
  },

  ApiGetUserRoles: async function (userId: number): Promise<ApiResponse<any[]>> {
    return await request.get(`${baseUrl}/${userId}/roles`)
  },

  ApiGetAllRoles: async function (): Promise<ApiResponse<any[]>> {
    // 这里模拟获取所有角色，实际应调用角色模块API
    return await request.get('/roles/list')
  },

  ApiAssignRoles: async function (userId: number, roleIds: number[]): Promise<ApiResponse<void>> {
    return await request.put(`${baseUrl}/${userId}/roles`, { roleIds })
  },

  ApiGetById: async function (id: number): Promise<ApiResponse<User>> {
    return await request.get(`${baseUrl}/${id}`)
  }
}

export default userApi
