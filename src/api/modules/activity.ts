import request from './request'
import type { ApiResponse, PageResponse } from '@/types/api'
import type { Activity } from '@/types/activity'
import type { ActivityTask } from './activityTask'
import type { ActivityBudget } from './activityBudget'
import type { ActivityParticipant } from './activityParticipant'
import type { ActivitySupplier } from './activitySupplier'
import type { ActivityRisk } from './activityRisk'
import type { ActivitySchedule } from './activitySchedule'

const baseUrl = '/activities'

export interface ActivityDetailData {
  activity: Activity
  schedules: ActivitySchedule[]
  tasks: ActivityTask[]
  budgets: ActivityBudget[]
  participants: ActivityParticipant[]
  suppliers: ActivitySupplier[]
  risks: ActivityRisk[]
}

const activityApi = {
  ApiPageList: async (params: Activity & { pageNum?: number; pageSize?: number }): Promise<ApiResponse<PageResponse<Activity>>> => {
    const requestParams: any = {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      ...params
    }
    Object.keys(requestParams).forEach(key => {
      if (requestParams[key] === '' || requestParams[key] === null || requestParams[key] === undefined) {
        delete requestParams[key]
      }
    })
    return await request.post(`${baseUrl}/page`, requestParams)
  },
  ApiGetById: async (id: string): Promise<ApiResponse<Activity>> => {
    return await request.get(`${baseUrl}/${id}`)
  },
  // 获取活动详情（包含所有关联数据）
  ApiGetDetail: async (id: string): Promise<ApiResponse<ActivityDetailData>> => {
    return await request.get(`${baseUrl}/${id}/detail`)
  },
  ApiSaveOrUpdate: async (params: Activity): Promise<ApiResponse<boolean>> => {
    if (params.id) {
      return await request.put(baseUrl, params)
    }
    return await request.post(baseUrl, params)
  },
  ApiDelete: async (id: string): Promise<ApiResponse<boolean>> => {
    return await request.delete(`${baseUrl}/${id}`)
  }
}

export default activityApi
