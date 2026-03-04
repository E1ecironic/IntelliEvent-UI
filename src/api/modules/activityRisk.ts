import request from './request'
import type { ApiResponse } from '@/types/api'

export interface ActivityRisk {
  id?: string
  activityId: string
  riskType: string
  description: string
  level: string
  probability?: string
  impact?: string
  emergencyPlan?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

const baseUrl = '/activity-risks'

const activityRiskApi = {
  // 根据活动ID查询风险列表
  ApiGetByActivityId: async (activityId: string): Promise<ApiResponse<ActivityRisk[]>> => {
    return await request.get(`${baseUrl}/activity/${activityId}`)
  },
  // 新增风险
  ApiSave: async (params: ActivityRisk): Promise<ApiResponse<boolean>> => {
    return await request.post(baseUrl, params)
  },
  // 修改风险
  ApiUpdate: async (params: ActivityRisk): Promise<ApiResponse<boolean>> => {
    return await request.put(baseUrl, params)
  },
  // 更新应急预案
  ApiUpdateEmergencyPlan: async (riskId: string, emergencyPlan: string): Promise<ApiResponse<boolean>> => {
    return await request.put(`${baseUrl}/${riskId}/emergency-plan`, null, { params: { emergencyPlan } })
  },
  // 更新风险状态
  ApiUpdateStatus: async (riskId: string, status: string): Promise<ApiResponse<boolean>> => {
    return await request.put(`${baseUrl}/${riskId}/status`, null, { params: { status } })
  },
  // 删除风险
  ApiDelete: async (id: string): Promise<ApiResponse<boolean>> => {
    return await request.delete(`${baseUrl}/${id}`)
  }
}

export default activityRiskApi
