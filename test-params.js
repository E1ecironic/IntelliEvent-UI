// 测试不同参数格式的搜索功能
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/intellievent'

async function testDifferentParams() {
  console.log('测试不同参数格式...')
  
  // 测试1: 使用 keyword 参数
  try {
    const response1 = await axios.get(`${API_BASE_URL}/organizations/page`, {
      params: {
        pageNum: 1,
        pageSize: 10,
        keyword: '测试'
      }
    })
    console.log('✓ keyword 参数:', response1.data.data.total)
  } catch (error) {
    console.log('✗ keyword 参数失败:', error.response?.status, error.response?.statusText)
  }
  
  // 测试2: 使用 search 参数
  try {
    const response2 = await axios.get(`${API_BASE_URL}/organizations/page`, {
      params: {
        pageNum: 1,
        pageSize: 10,
        search: '测试'
      }
    })
    console.log('✓ search 参数:', response2.data.data.total)
  } catch (error) {
    console.log('✗ search 参数失败:', error.response?.status, error.response?.statusText)
  }
  
  // 测试3: 使用 name 参数
  try {
    const response3 = await axios.get(`${API_BASE_URL}/organizations/page`, {
      params: {
        pageNum: 1,
        pageSize: 10,
        name: '测试'
      }
    })
    console.log('✓ name 参数:', response3.data.data.total)
  } catch (error) {
    console.log('✗ name 参数失败:', error.response?.status, error.response?.statusText)
  }
  
  // 测试4: 使用 status 参数
  try {
    const response4 = await axios.get(`${API_BASE_URL}/organizations/page`, {
      params: {
        pageNum: 1,
        pageSize: 10,
        status: 1
      }
    })
    console.log('✓ status 参数:', response4.data.data.total)
  } catch (error) {
    console.log('✗ status 参数失败:', error.response?.status, error.response?.statusText)
  }
  
  // 测试5: 使用 level 参数
  try {
    const response5 = await axios.get(`${API_BASE_URL}/organizations/page`, {
      params: {
        pageNum: 1,
        pageSize: 10,
        level: 1
      }
    })
    console.log('✓ level 参数:', response5.data.data.total)
  } catch (error) {
    console.log('✗ level 参数失败:', error.response?.status, error.response?.statusText)
  }
}

testDifferentParams()