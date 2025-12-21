import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/intellievent'

// 创建axios实例
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 可以在这里添加认证token
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const { data } = response
    if (data.code === 200) {
      return data // 返回整个响应数据，包含code、message、data
    } else {
      console.error('API错误:', data.message)
      return Promise.reject(new Error(data.message || '请求失败'))
    }
  },
  error => {
    console.error('响应错误:', error)
    if (error.response?.status === 401) {
      // 处理未授权情况
      // router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default {
  /**
   * 获取组织架构列表（分页）
   */
  getOrganizationList(pageNum = 1, pageSize = 100, keyword = '', status = '', level = '') {
    const params = {
      pageNum,
      pageSize
    }
    
    // 注意：后端可能不支持搜索参数，暂时只发送基本分页参数
    // 如果需要搜索功能，后端需要实现相应的逻辑
    console.log('API请求参数:', params)
    return request.get('/organizations/page', params)
  },

  /**
   * 分页获取组织架构（支持搜索和筛选）
   */
  getOrganizationPage(pageNum = 1, pageSize = 10, name = '', level = null, status = null, code = '') {
    const data = {
      pageNum,
      pageSize
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
    if (status !== null && status !== undefined && status !== '') {
      data.status = status
    }
    
    console.log('API请求参数:', data)
    // 使用POST请求，参数通过JSON传递
    return request.post('/organizations/page', data)
  },

  /**
   * 根据ID获取组织架构
   */
  getOrganizationById(id) {
    return request.get(`/organizations/${id}`)
  },

  /**
   * 创建组织架构
   */
  createOrganization(data) {
    return request.post('/organizations', data)
  },

  /**
   * 更新组织架构
   */
  updateOrganization(data) {
    return request.put('/organizations', data)
  },

  /**
   * 删除组织架构
   */
  deleteOrganization(id) {
    return request.delete(`/organizations/${id}`)
  },

  /**
   * 切换组织状态
   */
  toggleOrganizationStatus(id, status) {
    return request.put('/organizations', {
      id,
      status: status === 1 ? 0 : 1
    })
  },

  /**
   * 获取组织成员列表
   */
  getOrgUsers(orgId) {
    return request.get(`/organizations/${orgId}/users`)
  },

  /**
   * 添加组织成员
   */
  addOrgUser(orgId, userId) {
    return request.post(`/organizations/${orgId}/users/${userId}`)
  },

  /**
   * 移除组织成员
   */
  removeOrgUser(orgId, userId) {
    return request.delete(`/organizations/${orgId}/users/${userId}`)
  }
}