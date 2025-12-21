import request from './request'

export default {
  /**
   * 分页获取用户列表
   * @param {number} pageNum - 页码
   * @param {number} pageSize - 每页条数
   * @param {string} username - 用户名搜索
   * @param {string} realName - 真实姓名搜索
   * @param {string} email - 邮箱搜索
   * @param {string} phone - 手机号搜索
   * @param {number} status - 状态筛选
   * @param {number} organizationId - 组织ID筛选
   * @returns {Promise} 返回用户分页数据
   */
  getUserPage(pageNum = 1, pageSize = 10, username = '', realName = '', email = '', phone = '', status = null, organizationId = null) {
    const data = {
      pageNum,
      pageSize
    }
    
    // 添加搜索参数（只有当值不为空时才添加）
    if (username && username.trim() !== '') {
      data.username = username.trim()
    }
    if (realName && realName.trim() !== '') {
      data.realName = realName.trim()
    }
    if (email && email.trim() !== '') {
      data.email = email.trim()
    }
    if (phone && phone.trim() !== '') {
      data.phone = phone.trim()
    }
    if (status !== null && status !== undefined && status !== '') {
      data.status = status
    }
    if (organizationId !== null && organizationId !== undefined && organizationId !== '') {
      data.organizationId = organizationId
    }
    
    console.log('用户分页API请求参数:', data)
    return request.post('/users/page', data)
  },

  /**
   * 根据ID获取用户信息
   * @param {number} id - 用户ID
   * @returns {Promise} 返回用户详情
   */
  getUserById(id) {
    return request.get(`/users/${id}`)
  },

  /**
   * 创建新用户
   * @param {Object} userData - 用户数据
   * @returns {Promise} 返回创建结果
   */
  createUser(userData) {
    return request.post('/users', userData)
  },

  /**
   * 更新用户信息
   * @param {number} id - 用户ID
   * @param {Object} userData - 用户数据
   * @returns {Promise} 返回更新结果
   */
  updateUser(id, userData) {
    return request.put(`/users/${id}`, userData)
  },

  /**
   * 删除用户
   * @param {number} id - 用户ID
   * @returns {Promise} 返回删除结果
   */
  deleteUser(id) {
    return request.delete(`/users/${id}`)
  },

  /**
   * 批量删除用户
   * @param {Array} ids - 用户ID数组
   * @returns {Promise} 返回批量删除结果
   */
  batchDeleteUsers(ids) {
    return request.delete('/users/batch', { data: { ids } })
  },

  /**
   * 重置用户密码
   * @param {number} id - 用户ID
   * @param {string} newPassword - 新密码
   * @returns {Promise} 返回重置结果
   */
  resetPassword(id, newPassword) {
    return request.put(`/users/${id}/password`, { newPassword })
  },

  /**
   * 更新用户状态
   * @param {number} id - 用户ID
   * @param {number} status - 状态值 (0:禁用, 1:正常, 2:待激活)
   * @returns {Promise} 返回更新结果
   */
  updateUserStatus(id, status) {
    return request.put(`/users/${id}/status`, { status })
  },

  /**
   * 批量更新用户状态
   * @param {Array} ids - 用户ID数组
   * @param {number} status - 状态值
   * @returns {Promise} 返回批量更新结果
   */
  batchUpdateStatus(ids, status) {
    return request.put('/users/batch/status', { ids, status })
  },

  /**
   * 上传用户头像
   * @param {FormData} formData - 包含头像文件的FormData
   * @returns {Promise} 返回上传结果和URL
   */
  uploadAvatar(formData) {
    return request.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 获取用户角色列表
   * @param {number} userId - 用户ID
   * @returns {Promise} 返回用户角色列表
   */
  getUserRoles(userId) {
    return request.get(`/users/${userId}/roles`)
  },

  /**
   * 分配用户角色
   * @param {number} userId - 用户ID
   * @param {Array} roleIds - 角色ID数组
   * @returns {Promise} 返回分配结果
   */
  assignRoles(userId, roleIds) {
    return request.put(`/users/${userId}/roles`, { roleIds })
  },

  /**
   * 获取用户组织信息
   * @param {number} userId - 用户ID
   * @returns {Promise} 返回用户组织信息
   */
  getUserOrganization(userId) {
    return request.get(`/users/${userId}/organization`)
  },

  /**
   * 导出用户数据
   * @param {Object} params - 导出参数
   * @returns {Promise} 返回文件下载
   */
  exportUsers(params = {}) {
    return request.post('/users/export', params, {
      responseType: 'blob'
    })
  },

  /**
   * 导入用户数据
   * @param {FormData} formData - 包含Excel文件的FormData
   * @returns {Promise} 返回导入结果
   */
  importUsers(formData) {
    return request.post('/users/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 上传用户头像
   * @param {FormData} formData - 包含头像文件的FormData
   * @returns {Promise} 返回上传结果
   */
  uploadAvatar(formData) {
    return request.post('/users/avatar/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}