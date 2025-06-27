<template>
  <div class="api-test">
    <h2>API连接测试</h2>
    
    <div class="test-section">
      <h3>用户状态</h3>
      <p>Token: {{ userStore.token ? '已设置' : '未设置' }}</p>
      <p>用户信息: {{ userStore.userInfo ? JSON.stringify(userStore.userInfo) : '未获取' }}</p>
      <p>用户角色: {{ userStore.role || '未知' }}</p>
      <p>是否管理员: {{ userStore.isAdmin ? '是' : '否' }}</p>
    </div>

    <div class="test-section">
      <h3>API测试</h3>
      <el-button @click="testUserInfo">测试用户信息</el-button>
      <el-button @click="testAdminAccess">测试管理员权限</el-button>
      <el-button @click="testQuestionnaireApi">测试问卷API</el-button>
      <el-button @click="testRecordsApi">测试记录API</el-button>
      <el-button @click="testStatisticsApi">测试统计API</el-button>
      <el-button @click="testDirectBackend">测试直接后端连接</el-button>
      <el-button @click="testProxyConnection">测试代理连接</el-button>
      <el-button @click="createTestData" type="warning">创建测试数据</el-button>
      
      <div v-if="testResults.length > 0" class="test-results">
        <h4>测试结果:</h4>
        <div v-for="(result, index) in testResults" :key="index" class="test-result">
          <p><strong>{{ result.name }}:</strong></p>
          <p :class="result.success ? 'success' : 'error'">
            {{ result.success ? '成功' : '失败' }} - {{ result.message }}
          </p>
          <pre v-if="result.data">{{ JSON.stringify(result.data, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { questionnaireApi } from '@/api/questionnaire'
import { recordsApi } from '@/api/records'
import request from '@/utils/request'

const userStore = useUserStore()
const testResults = ref([])

const addTestResult = (name, success, message, data = null) => {
  testResults.value.push({
    name,
    success,
    message,
    data,
    timestamp: new Date().toLocaleTimeString()
  })
}

const testUserInfo = async () => {
  try {
    const response = await request({
      url: '/debug/user-info',
      method: 'get'
    })
    addTestResult('用户信息调试', true, '请求成功', response.data)
  } catch (error) {
    addTestResult('用户信息调试', false, error.message, error.response?.data)
  }
}

const testAdminAccess = async () => {
  try {
    const response = await request({
      url: '/debug/test-admin',
      method: 'get'
    })
    addTestResult('管理员权限测试', true, '请求成功', response.data)
  } catch (error) {
    addTestResult('管理员权限测试', false, error.message, error.response?.data)
  }
}

const testQuestionnaireApi = async () => {
  try {
    const response = await questionnaireApi.getList({ page: 1, size: 10 })
    addTestResult('问卷API', true, '请求成功', response)
  } catch (error) {
    addTestResult('问卷API', false, error.message, error.response?.data)
  }
}

const testRecordsApi = async () => {
  try {
    const response = await recordsApi.getRecords({ page: 1, size: 10 })
    addTestResult('记录API', true, '请求成功', response)
  } catch (error) {
    addTestResult('记录API', false, error.message, error.response?.data)
  }
}

const testStatisticsApi = async () => {
  try {
    const response = await recordsApi.getStatistics()
    addTestResult('统计API', true, '请求成功', response)
  } catch (error) {
    addTestResult('统计API', false, error.message, error.response?.data)
  }
}

const testDirectBackend = async () => {
  try {
    // 直接访问后端，不通过代理
    const response = await fetch('http://localhost:8080/api/questionnaire', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    addTestResult('直接后端连接', response.ok, `状态码: ${response.status}`, data)
  } catch (error) {
    addTestResult('直接后端连接', false, error.message, null)
  }
}

const testProxyConnection = async () => {
  try {
    // 通过代理访问
    const response = await fetch('/api/questionnaire', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    addTestResult('代理连接测试', response.ok, `状态码: ${response.status}`, data)
  } catch (error) {
    addTestResult('代理连接测试', false, error.message, null)
  }
}

const createTestData = async () => {
  try {
    const response = await request({
      url: '/debug/create-test-data',
      method: 'get'
    })
    addTestResult('创建测试数据', true, '创建成功', response.data)
  } catch (error) {
    addTestResult('创建测试数据', false, error.message, error.response?.data)
  }
}
</script>

<style scoped>
.api-test {
  padding: 20px;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.test-results {
  margin-top: 20px;
}

.test-result {
  margin-bottom: 15px;
  padding: 10px;
  border-left: 4px solid #ccc;
  background-color: #f9f9f9;
}

.success {
  color: #67c23a;
}

.error {
  color: #f56c6c;
}

pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style> 