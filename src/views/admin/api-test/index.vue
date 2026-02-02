<template>
  <div class="api-test">
    <h2>API测试页面</h2>
    <el-row :gutter="16" style="margin-bottom: 20px;">
      <el-col :span="8">
        <el-button @click="runTest" type="primary" style="width: 100%;">运行组织架构API测试</el-button>
      </el-col>
      <el-col :span="8">
        <el-button @click="checkBackend" type="success" style="width: 100%;">检查后端状态</el-button>
      </el-col>
      <el-col :span="8">
        <el-button @click="clearResults" type="info" style="width: 100%;">清空结果</el-button>
      </el-col>
    </el-row>
    
    <div v-if="testResult" class="test-result">
      <h3>测试结果：</h3>
      <pre>{{ testResult }}</pre>
    </div>
    <div v-if="error" class="error-result">
      <h3>错误信息：</h3>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import testApi from '../../api/test'

const testResult = ref('')
const error = ref('')

const runTest = async () => {
  try {
    error.value = ''
    testResult.value = '正在测试...'
    
    // 测试组织架构API
    const result = await testApi.testOrganizationAPI()
    
    if (result.success) {
      testResult.value = JSON.stringify({
        success: true,
        message: result.message,
        data: result.data
      }, null, 2)
    } else {
      error.value = JSON.stringify({
        success: false,
        error: result.error,
        code: result.code,
        details: result.details
      }, null, 2)
    }
    
  } catch (err) {
    error.value = JSON.stringify({
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    }, null, 2)
  }
}

// 检查后端状态
const checkBackend = async () => {
  try {
    error.value = ''
    testResult.value = '正在检查后端状态...'
    
    const status = await testApi.checkBackendStatus()
    testResult.value = JSON.stringify(status, null, 2)
    
  } catch (err) {
    error.value = JSON.stringify({
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    }, null, 2)
  }
}

// 清空结果
const clearResults = () => {
  testResult.value = ''
  error.value = ''
}
</script>

<style scoped>
.api-test {
  padding: 20px;
}

.test-result, .error-result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
}

.test-result {
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
}

.error-result {
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
}

pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  white-space: pre-wrap;
}
</style>