// 检查原始数据结构
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/intellievent'

async function checkRawData() {
  console.log('检查原始数据...')
  
  try {
    const response = await axios.get(`${API_BASE_URL}/organizations/page`, {
      params: {
        pageNum: 1,
        pageSize: 10
      }
    })
    
    console.log('完整响应:', JSON.stringify(response.data, null, 2))
    
    const records = response.data.data.records
    if (records && records.length > 0) {
      console.log('第一条记录:', JSON.stringify(records[0], null, 2))
      
      // 检查有哪些字段可以用于搜索
      const firstRecord = records[0]
      console.log('可用字段:', Object.keys(firstRecord))
      
      // 测试用实际数据搜索
      if (firstRecord.orgName) {
        console.log('测试用 orgName 搜索:', firstRecord.orgName)
        const searchResponse = await axios.get(`${API_BASE_URL}/organizations/page`, {
          params: {
            pageNum: 1,
            pageSize: 10,
            keyword: firstRecord.orgName
          }
        })
        console.log('用真实数据搜索结果:', searchResponse.data.data.total)
      }
    } else {
      console.log('没有记录返回')
    }
    
  } catch (error) {
    console.error('检查失败:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
  }
}

checkRawData()