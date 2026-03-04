import request from './request'
import type { ApiResponse } from '@/types/api'

export interface ActivitySupplier {
  id?: string
  activityId: string
  name: string
  contact?: string
  phone?: string
  email?: string
  serviceType?: string
  address?: string
  remark?: string
  createdAt?: string
  updatedAt?: string
}

const baseUrl = '/activity-suppliers'

const activitySupplierApi = {
  // 根据活动ID查询供应商列表
  ApiGetByActivityId: async (activityId: string): Promise<ApiResponse<ActivitySupplier[]>> => {
    return await request.get(`${baseUrl}/activity/${activityId}`)
  },
  // 新增供应商
  ApiSave: async (params: ActivitySupplier): Promise<ApiResponse<boolean>> => {
    return await request.post(baseUrl, params)
  },
  // 修改供应商
  ApiUpdate: async (params: ActivitySupplier): Promise<ApiResponse<boolean>> => {
    return await request.put(baseUrl, params)
  },
  // 删除供应商
  ApiDelete: async (id: string): Promise<ApiResponse<boolean>> => {
    return await request.delete(`${baseUrl}/${id}`)
  }
}

export default activitySupplierApi
