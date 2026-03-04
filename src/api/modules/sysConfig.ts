import request from './request'
import type { ApiResponse, PageResponse } from '@/types/api'
import type { SysConfig, SysConfigModule } from '@/types/sysConfig'

const baseUrl = '/sys-config'

export const sysConfigApi = {
  /**
   * 分页获取系统配置
   */
  ApiPageList: async function (params: any): Promise<ApiResponse<PageResponse<SysConfig>>> {
    return await request.get(`${baseUrl}/page`, params)
  },

  ApiModuleList: async function (params: any): Promise<ApiResponse<SysConfigModule[]>> {
    return await request.get(`${baseUrl}/modules`, params)
  },

  /**
   * 保存或更新系统配置
   */
  ApiSaveOrUpdate: async function (params: SysConfig): Promise<ApiResponse<SysConfig>> {
    return await request.post(`${baseUrl}`, params)
  },

  /**
   * 根据键获取配置
   */
  ApiGetByKey: async function (key: string): Promise<ApiResponse<SysConfig>> {
    return await request.get(`${baseUrl}/${key}`)
  },

  /**
   * 删除系统配置
   */
  ApiDelete: async function (key: string): Promise<ApiResponse<void>> {
    return await request.delete(`${baseUrl}/${key}`)
  },

  /**
   * 批量删除系统配置
   */
  ApiBatchDelete: async function (ids: (number | string)[]): Promise<ApiResponse<void>> {
    return await request.delete(`${baseUrl}/batch`, { data: { ids } })
  }
}

export default sysConfigApi
