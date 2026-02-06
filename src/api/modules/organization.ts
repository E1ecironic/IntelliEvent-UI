import request from './request'
import type { ApiResponse, PageResponse} from '@/types/api'
import type { Organization } from '@/views/admin/organization-manage/config'

// 组织管理API
const organizationApi = {
  /**
   * 获取组织架构列表（分页）
   */
  getOrganizationList(pageNum: number = 1, pageSize: number = 100, keyword: string = '', status: string = '', level: string = ''): Promise<ApiResponse<PageResponse<Organization>>> {
    const params = {
      pageNum,
      pageSize
    }
    
    // 注意：后端可能不支持搜索参数，暂时只发送基本分页参数
    // 如果需要搜索功能，后端需要实现相应的逻辑
    console.log('API请求参数:', params)
    return request.get('/organizations/page', { params })
  },

  /**
   * 分页获取组织架构（支持搜索和筛选）
   */
  getOrganizationPage(pageNum: number = 1, pageSize: number = 10, name: string = '', level: number | null = null, status: number | null = null, code: string = ''): Promise<ApiResponse<PageResponse<Organization>>> {
    const data: any = {
      pageNum,
      pageSize,
      name,
      level,
      status,
      code
    }
    
    // 如果提供了搜索名称，添加到参数中
    if (name && name.trim() !== '') {
      data.name = name.trim()
    }
    
    // 如果提供了搜索编码，添加到参数中
    if (code && code.trim() !== '') {
      data.code = code.trim()
    }
    
    // 如果提供了状态，添加到参数中
    if (status !== null && status !== undefined) {
      data.status = status
    }
    
    // 清理空字符串和 null/undefined 参数
    Object.keys(data).forEach(key => {
      if (data[key] === '' || data[key] === null || data[key] === undefined) {
        delete data[key]
      }
    })
    
    console.log('API请求参数:', data)
    // 使用POST请求，参数通过JSON传递
    return request.post('/organizations/page', data)
  },

  /**
   * 分页获取组织架构（标准接口，支持对象参数）
   */
  ApiPageList(params: any): Promise<ApiResponse<PageResponse<Organization>>> {
    // 确保参数中有 pageNum 和 pageSize
    const requestParams = {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      ...params
    }
    
    // 清理空字符串和 null/undefined 参数
    Object.keys(requestParams).forEach(key => {
      if (requestParams[key] === '' || requestParams[key] === null || requestParams[key] === undefined) {
        delete requestParams[key]
      }
    })
    
    return request.post('/organizations/page', requestParams)
  },

  /**
   * 创建组织架构
   */
  createOrganization(data: Partial<Organization>): Promise<ApiResponse<Organization>> {
    return request.post('/organizations', data)
  },

  /**
   * 更新组织架构
   */
  updateOrganization(data: Partial<Organization> & { id: number }): Promise<ApiResponse<Organization>> {
    return request.put('/organizations', data)
  },

  /**
   * 删除组织架构
   */
  deleteOrganization(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/organizations/${id}`)
  },

  /**
   * 切换组织状态
   */
  toggleOrganizationStatus(id: number, status: number): Promise<ApiResponse<Organization>> {
    return request.put('/organizations', {
      id,
      status: status === 1 ? 0 : 1
    })
  },

  /**
   * 获取组织成员列表
   */
  getOrgUsers(orgId: number): Promise<ApiResponse<any[]>> {
    return request.get(`/user-organization/list-users-by-org/${orgId}`)
  },

  /**
   * 添加组织成员
   */
  addOrgUser(orgId: number, userId: number): Promise<ApiResponse<void>> {
    return request.post(`/organizations/${orgId}/users/${userId}`)
  },

  /**
   * 移除组织成员
   */
  removeOrgUser(orgId: number, userId: number): Promise<ApiResponse<void>> {
    return request.delete(`/organizations/${orgId}/users/${userId}`)
  }
}

export default organizationApi
