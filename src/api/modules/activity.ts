import request from './request'
import type { ApiResponse, PageResponse } from '@/types/api'
import type { Activity } from '@/types/activity'

const baseUrl = '/activities'

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
