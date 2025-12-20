// 测试搜索功能的简单脚本
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/intellievent'

async function testSearch() {
  try {
    console.log('测试搜索功能...')
    
    // 测试基本请求
    const basicResponse = await axios.get(`${API_BASE_URL}/organizations/page`, {
      params: {
        pageNum: 1,
        pageSize: 10
      }
    })
    
    console.log('基本请求响应:', {
      status: basicResponse.status,
      data: basicResponse.data
    })
    
    // 测试带搜索关键词的请求
    const searchResponse = await axios.get(`${API_BASE_URL}/organizations/page`, {
      params: {
        pageNum: 1,
        pageSize: 10,
        keyword: '测试'
      }
    })
    
    console.log('搜索请求响应:', {
      status: searchResponse.status,
      data: searchResponse.data
    })
    
  } catch (error) {
    console.error('测试失败:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      params: error.config?.params
    })
  }
}

testSearch()