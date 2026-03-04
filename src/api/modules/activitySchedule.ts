import request from './request'
import type { ApiResponse } from '@/types/api'

export interface ActivitySchedule {
  id?: string
  activityId: string
  scheduleDate?: string
  startTime: string
  endTime?: string
  title: string
  description?: string
  location?: string
  responsible?: string
  responsibleName?: string
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

const baseUrl = '/activity-schedules'

const activityScheduleApi = {
  // 根据活动ID查询日程列表
  ApiGetByActivityId: async (activityId: string): Promise<ApiResponse<ActivitySchedule[]>> => {
    return await request.get(`${baseUrl}/activity/${activityId}`)
  },
  // 新增日程
  ApiSave: async (params: ActivitySchedule): Promise<ApiResponse<boolean>> => {
    return await request.post(baseUrl, params)
  },
  // 修改日程
  ApiUpdate: async (params: ActivitySchedule): Promise<ApiResponse<boolean>> => {
    return await request.put(baseUrl, params)
  },
  // 更新排序
  ApiUpdateSortOrder: async (scheduleId: string, sortOrder: number): Promise<ApiResponse<boolean>> => {
    return await request.put(`${baseUrl}/${scheduleId}/sort`, null, { params: { sortOrder } })
  },
  // 删除日程
  ApiDelete: async (id: string): Promise<ApiResponse<boolean>> => {
    return await request.delete(`${baseUrl}/${id}`)
  }
}

export default activityScheduleApi
