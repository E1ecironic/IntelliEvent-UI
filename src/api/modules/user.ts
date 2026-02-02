import request from './request'
import type { ApiResponse, PageResponse } from '@/types/api'
import type { User } from '@/views/admin/user-manage/config'

export default {
  /**
   * 分页获取用户列表
   * @param pageNum - 页码
   * @param pageSize - 每页条数
   * @param username - 用户名搜索
   * @param realName - 真实姓名搜索
   * @param email - 邮箱搜索
   * @param phone - 手机号搜索
   * @param status - 状态筛选
   * @param organizationId - 组织ID筛选
   * @returns 返回用户分页数据
   */

  /**
   * 分页获取用户列表
   * @param pageNum - 页码
   * @param pageSize - 每页条数
   * @param params - 用户查询参数
   * @returns 返回用户分页数据
   */
  getUserPage(pageNum: number = 1, pageSize: number = 10, params: Partial<User> = {}): Promise<ApiResponse<PageResponse<User>>> {
    const data = {
      pageNum,
      pageSize,
      ...params
    }
    
    console.log('用户分页API请求参数:', data)
    return request.post('/users/page', data)
  },

  /**
   * 根据ID获取用户信息
   * @param id - 用户ID
   * @returns 返回用户详情
   */
  getUserById(id: number): Promise<ApiResponse<User>> {
    return request.get(`/users/${id}`)
  },

  /**
   * 创建新用户
   * @param userData - 用户数据
   * @returns 返回创建结果
   */
  createUser(userData: User): Promise<ApiResponse<User>> {
    return request.post('/users', userData)
  },

  /**
   * 更新用户信息
   * @param userData - 用户数据
   * @returns 返回更新结果
   */
  updateUser(userData: User): Promise<ApiResponse<User>> {
    return request.put(`/users`, userData)
  },

  /**
   * 删除用户
   * @param id - 用户ID
   * @returns 返回删除结果
   */
  deleteUser(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/users/${id}`)
  },

  /**
   * 批量删除用户
   * @param ids - 用户ID数组
   * @returns 返回批量删除结果
   */
  batchDeleteUsers(ids: number[]): Promise<ApiResponse<void>> {
    return request.delete('/users/batch', { data: { ids } })
  },

  /**
   * 重置用户密码
   * @param id - 用户ID
   * @param newPassword - 新密码（可选，如果不传则由后端生成随机密码）
   * @returns 返回重置结果
   */
  resetPassword(id: number, newPassword?: string): Promise<ApiResponse<void>> {
    return request.put(`/users/${id}/password`, { newPassword })
  },

  /**
   * 更新用户状态
   * @param id - 用户ID
   * @param status - 状态值 (0:禁用, 1:正常, 2:待激活)
   * @returns 返回更新结果
   */
  updateUserStatus(id: number, status: number): Promise<ApiResponse<void>> {
    return request.put(`/users/${id}/status`, { status })
  },

  /**
   * 批量更新用户状态
   * @param ids - 用户ID数组
   * @param status - 状态值
   * @returns 返回批量更新结果
   */
  batchUpdateStatus(ids: number[], status: number): Promise<ApiResponse<void>> {
    return request.put('/users/batch/status', { ids, status })
  },


  /**
   * 获取用户角色列表
   * @param userId - 用户ID
   * @returns 返回用户角色列表
   */
  getUserRoles(userId: number): Promise<ApiResponse<any[]>> {
    return request.get(`/users/${userId}/roles`)
  },

  /**
   * 分配用户角色
   * @param userId - 用户ID
   * @param roleIds - 角色ID数组
   * @returns 返回分配结果
   */
  assignRoles(userId: number, roleIds: number[]): Promise<ApiResponse<void>> {
    return request.put(`/users/${userId}/roles`, { roleIds })
  },

  /**
   * 获取用户组织信息
   * @param userId - 用户ID
   * @returns 返回用户组织信息
   */
  getUserOrganization(userId: number): Promise<ApiResponse<any>> {
    return request.get(`/users/${userId}/organization`)
  },

}