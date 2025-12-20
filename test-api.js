// API测试脚本
import testApi from '../src/api/test.js'

console.log('开始API测试...')

async function runTests() {
  try {
    // 测试1: 检查后端状态
    console.log('\n=== 测试1: 检查后端状态 ===')
    const status = await testApi.checkBackendStatus()
    console.log('后端状态:', JSON.stringify(status, null, 2))
    
    // 测试2: 测试组织架构API
    console.log('\n=== 测试2: 测试组织架构API ===')
    const orgResult = await testApi.testOrganizationAPI()
    console.log('组织架构API测试结果:', JSON.stringify(orgResult, null, 2))
    
    // 总结
    console.log('\n=== 测试总结 ===')
    if (status.status === 'connected') {
      console.log('✅ 后端连接正常')
    } else {
      console.log('❌ 后端连接异常:', status.error)
    }
    
    if (orgResult.success) {
      console.log('✅ 组织架构API正常')
      console.log(`   总记录数: ${orgResult.data.total}`)
      console.log(`   当前页记录数: ${orgResult.data.records}`)
    } else {
      console.log('❌ 组织架构API异常:', orgResult.error)
    }
    
  } catch (error) {
    console.error('测试过程出错:', error)
  }
}

runTests()