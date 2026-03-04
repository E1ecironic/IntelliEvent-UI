import request from './request'
import type { ApiResponse } from '@/types/api'

export interface ActivityParticipant {
  id?: string
  activityId: string
  userId?: string
  name: string
  department?: string
  role?: string
  contact?: string
  email?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

const baseUrl = '/activity-participants'

const activityParticipantApi = {
  // 根据活动ID查询参与人员列表
  ApiGetByActivityId: async (activityId: string): Promise<ApiResponse<ActivityParticipant[]>> => {
    return await request.get(`${baseUrl}/activity/${activityId}`)
  },
  // 新增参与人员
  ApiSave: async (params: ActivityParticipant): Promise<ApiResponse<boolean>> => {
    return await request.post(baseUrl, params)
  },
  // 修改参与人员
  ApiUpdate: async (params: ActivityParticipant): Promise<ApiResponse<boolean>> => {
    return await request.put(baseUrl, params)
  },
  // 更新参与人员状态
  ApiUpdateStatus: async (participantId: string, status: string): Promise<ApiResponse<boolean>> => {
    return await request.put(`${baseUrl}/${participantId}/status`, null, { params: { status } })
  },
  // 删除参与人员
  ApiDelete: async (id: string): Promise<ApiResponse<boolean>> => {
    return await request.delete(`${baseUrl}/${id}`)
  }
}

export default activityParticipantApi
