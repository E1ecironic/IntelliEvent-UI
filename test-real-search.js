// 测试实际的搜索参数
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/intellievent'

async function testRealSearch() {
  console.log('测试实际的搜索参数...')
  
  // 获取一些真实数据
  const basicResponse = await axios.get(`${API_BASE_URL}/organizations/page`, {
    params: {
      pageNum: 1,
      pageSize: 10
    }
  })
  
  const records = basicResponse.data.data.records
  if (records.length > 0) {
    const testName = records[0].name
    const testCode = records[0].code
    const testLevel = records[0].level
    const testStatus = records[0].status
    
    console.log('使用真实数据测试搜索:')
    console.log('名称:', testName)
    console.log('编码:', testCode)
    console.log('层级:', testLevel)
    console.log('状态:', testStatus)
    
    // 测试各种可能的参数组合
    const testCases = [
      { name: testName },
      { code: testCode },
      { level: testLevel },
      { status: testStatus },
      { name: testName, level: testLevel },
      { keyword: testName },
      { search: testName },
      { q: testName }
    ]
    
    for (const testParams of testCases) {
      try {
        const response = await axios.get(`${API_BASE_URL}/organizations/page`, {
          params: {
            pageNum: 1,
            pageSize: 10,
            ...testParams
          }
        })
        
        if (response.data.data.total > 0) {
          console.log(`✓ 参数 ${JSON.stringify(testParams)} 有效，返回 ${response.data.data.total} 条记录`)
        } else {
          console.log(`- 参数 ${JSON.stringify(testParams)} 返回 0 条记录`)
        }
      } catch (error) {
        console.log(`✗ 参数 ${JSON.stringify(testParams)} 失败:`, error.response?.status)
      }
    }
  }
}

testRealSearch()