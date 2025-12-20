import request from './request'

/**
 * API测试工具
 */
export default {
  /**
   * 测试组织架构API
   */
  async testOrganizationAPI() {
    try {
      console.log('开始测试组织架构API...')
      
      // 测试获取组织列表
      const listResponse = await request.get('/organizations/page', {
        pageNum: 1,
        pageSize: 10
      })
      
      console.log('组织列表API响应:', listResponse)
      
      if (listResponse.code === 200) {
        return {
          success: true,
          data: {
            total: listResponse.data?.total || 0,
            records: listResponse.data?.records?.length || 0,
            currentPage: listResponse.data?.current || 1,
            pageSize: listResponse.data?.size || 10,
            firstRecord: listResponse.data?.records?.[0] || null
          },
          message: 'API测试成功'
        }
      } else {
        return {
          success: false,
          error: listResponse.message || 'API返回错误',
          code: listResponse.code
        }
      }
    } catch (error) {
      console.error('API测试失败:', error)
      return {
        success: false,
        error: error.message || '网络请求失败',
        details: {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        }
      }
    }
  },

  /**
   * 检查后端服务状态
   */
  async checkBackendStatus() {
    try {
      const response = await request.get('/organizations/page', {
        pageNum: 1,
        pageSize: 1
      })
      
      return {
        status: 'connected',
        code: response.code,
        message: response.message,
        hasData: response.data && response.data.records && response.data.records.length > 0
      }
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        details: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        }
      }
    }
  }
}