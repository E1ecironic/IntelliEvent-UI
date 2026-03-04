import request from './request'
import type { ApiResponse } from '@/types/api'

export interface ActivityTask {
  id?: string
  activityId: string
  name: string
  responsible?: string
  responsibleName?: string
  deadline?: string
  status?: string
  priority?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

const baseUrl = '/activity-tasks'

const activityTaskApi = {
  // 根据活动ID查询任务列表
  ApiGetByActivityId: async (activityId: string): Promise<ApiResponse<ActivityTask[]>> => {
    return await request.get(`${baseUrl}/activity/${activityId}`)
  },
  // 新增任务
  ApiSave: async (params: ActivityTask): Promise<ApiResponse<boolean>> => {
    return await request.post(baseUrl, params)
  },
  // 修改任务
  ApiUpdate: async (params: ActivityTask): Promise<ApiResponse<boolean>> => {
    return await request.put(baseUrl, params)
  },
  // 更新任务状态
  ApiUpdateStatus: async (taskId: string, status: string): Promise<ApiResponse<boolean>> => {
    return await request.put(`${baseUrl}/${taskId}/status`, null, { params: { status } })
  },
  // 删除任务
  ApiDelete: async (id: string): Promise<ApiResponse<boolean>> => {
    return await request.delete(`${baseUrl}/${id}`)
  }
}

export default activityTaskApi
