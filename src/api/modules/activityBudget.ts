import request from './request'
import type { ApiResponse } from '@/types/api'

export interface ActivityBudget {
  id?: string
  activityId: string
  category: string
  item: string
  quantity?: number
  unitPrice: number
  total?: number
  supplierId?: string
  supplierName?: string
  status?: string
  remark?: string
  createdAt?: string
  updatedAt?: string
}

export interface BudgetStatistics {
  totalAllocated: number
  confirmedAmount: number
  categoryStats: Record<string, number>
  itemCount: number
}

const baseUrl = '/activity-budgets'

const activityBudgetApi = {
  // 根据活动ID查询预算列表
  ApiGetByActivityId: async (activityId: string): Promise<ApiResponse<ActivityBudget[]>> => {
    return await request.get(`${baseUrl}/activity/${activityId}`)
  },
  // 获取预算统计信息
  ApiGetStatistics: async (activityId: string): Promise<ApiResponse<BudgetStatistics>> => {
    return await request.get(`${baseUrl}/activity/${activityId}/statistics`)
  },
  // 获取已确认预算总额
  ApiGetTotal: async (activityId: string): Promise<ApiResponse<number>> => {
    return await request.get(`${baseUrl}/activity/${activityId}/total`)
  },
  // 新增预算项
  ApiSave: async (params: ActivityBudget): Promise<ApiResponse<boolean>> => {
    return await request.post(baseUrl, params)
  },
  // 修改预算项
  ApiUpdate: async (params: ActivityBudget): Promise<ApiResponse<boolean>> => {
    return await request.put(baseUrl, params)
  },
  // 删除预算项
  ApiDelete: async (id: string): Promise<ApiResponse<boolean>> => {
    return await request.delete(`${baseUrl}/${id}`)
  }
}

export default activityBudgetApi
