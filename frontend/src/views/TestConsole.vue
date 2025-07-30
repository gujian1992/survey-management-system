<template>
  <div class="test-console">
    <div class="console-header">
      <h2>API测试控制台</h2>
      <p>用于测试答题记录相关API的连接和数据</p>
    </div>

    <div class="test-section">
      <h3>API连接测试</h3>
      <div class="test-buttons">
        <el-button type="primary" @click="testMySessionList" :loading="loading.sessions">
          测试获取我的答题记录
        </el-button>
        <el-button type="success" @click="testMyStats" :loading="loading.stats">
          测试获取统计数据
        </el-button>
        <el-button type="warning" @click="testWithParams" :loading="loading.params">
          测试带参数查询
        </el-button>
        <el-button type="danger" @click="clearConsole">
          清空控制台
        </el-button>
      </div>
    </div>

    <div class="console-output">
      <h3>控制台输出</h3>
      <div class="output-area" ref="outputArea">
        <div v-for="(log, index) in logs" :key="index" :class="['log-item', log.type]">
          <span class="log-time">[{{ log.time }}]</span>
          <span class="log-type">[{{ log.type.toUpperCase() }}]</span>
          <span class="log-message">{{ log.message }}</span>
          <pre v-if="log.data" class="log-data">{{ JSON.stringify(log.data, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <div class="api-info">
      <h3>API信息</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="后端地址">{{ baseURL }}</el-descriptions-item>
        <el-descriptions-item label="答题记录API">/api/answer-session/my-sessions</el-descriptions-item>
        <el-descriptions-item label="统计API">/api/answer-session/my-stats</el-descriptions-item>
        <el-descriptions-item label="当前时间">{{ currentTime }}</el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { answerSessionApi } from '@/api/answerSession.js'

defineOptions({
  name: 'TestConsole'
})

const logs = ref([])
const outputArea = ref(null)
const loading = ref({
  sessions: false,
  stats: false,
  params: false
})

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const currentTime = ref(new Date().toLocaleString())

// 添加日志
const addLog = (type, message, data = null) => {
  logs.value.push({
    type,
    message,
    data,
    time: new Date().toLocaleTimeString()
  })
  
  nextTick(() => {
    if (outputArea.value) {
      outputArea.value.scrollTop = outputArea.value.scrollHeight
    }
  })
}

// 清空控制台
const clearConsole = () => {
  logs.value = []
  addLog('info', '控制台已清空')
}

// 测试获取我的答题记录
const testMySessionList = async () => {
  loading.value.sessions = true
  addLog('info', '开始测试获取我的答题记录API...')
  
  try {
    const params = {
      current: 1,
      size: 10
    }
    
    addLog('info', '请求参数:', params)
    
    const response = await answerSessionApi.getMySessionList(params)
    
    addLog('success', 'API调用成功！')
    addLog('info', '响应数据:', response)
    
    if (response && response.data) {
      if (response.data.records) {
        addLog('success', `获取到 ${response.data.records.length} 条记录，总计 ${response.data.total} 条`)
        
        if (response.data.records.length > 0) {
          addLog('info', '第一条记录示例:', response.data.records[0])
        }
      } else if (Array.isArray(response.data)) {
        addLog('success', `获取到 ${response.data.length} 条记录（数组格式）`)
      } else {
        addLog('warning', '响应数据格式异常')
      }
    } else {
      addLog('error', '响应数据为空或格式错误')
    }
    
    ElMessage.success('API测试成功')
  } catch (error) {
    addLog('error', 'API调用失败:', error)
    addLog('error', '错误详情:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method
    })
    
    ElMessage.error('API测试失败: ' + error.message)
  } finally {
    loading.value.sessions = false
  }
}

// 测试获取统计数据
const testMyStats = async () => {
  loading.value.stats = true
  addLog('info', '开始测试获取统计数据API...')
  
  try {
    const response = await answerSessionApi.getMyStats()
    
    addLog('success', '统计API调用成功！')
    addLog('info', '统计数据:', response)
    
    ElMessage.success('统计API测试成功')
  } catch (error) {
    addLog('error', '统计API调用失败:', error)
    addLog('error', '错误详情:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    })
    
    ElMessage.error('统计API测试失败: ' + error.message)
  } finally {
    loading.value.stats = false
  }
}

// 测试带参数查询
const testWithParams = async () => {
  loading.value.params = true
  addLog('info', '开始测试带参数查询...')
  
  try {
    const params = {
      current: 1,
      size: 5,
      status: 2 // 只查询已完成的记录
    }
    
    addLog('info', '请求参数（筛选已完成）:', params)
    
    const response = await answerSessionApi.getMySessionList(params)
    
    addLog('success', '带参数查询成功！')
    addLog('info', '筛选结果:', response)
    
    ElMessage.success('参数查询测试成功')
  } catch (error) {
    addLog('error', '参数查询失败:', error)
    
    ElMessage.error('参数查询测试失败: ' + error.message)
  } finally {
    loading.value.params = false
  }
}

// 更新当前时间
const updateTime = () => {
  currentTime.value = new Date().toLocaleString()
}

onMounted(() => {
  addLog('info', 'API测试控制台已加载')
  addLog('info', `后端服务地址: ${baseURL}`)
  
  // 每秒更新时间
  setInterval(updateTime, 1000)
})
</script>

<style scoped>
.test-console {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.console-header {
  text-align: center;
  margin-bottom: 30px;
}

.console-header h2 {
  color: #303133;
  margin-bottom: 10px;
}

.console-header p {
  color: #606266;
  font-size: 14px;
}

.test-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.test-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
}

.test-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.console-output {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.console-output h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
}

.output-area {
  background: #1e1e1e;
  border-radius: 4px;
  padding: 15px;
  height: 400px;
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
}

.log-item {
  margin-bottom: 8px;
  word-wrap: break-word;
}

.log-item.info {
  color: #409eff;
}

.log-item.success {
  color: #67c23a;
}

.log-item.warning {
  color: #e6a23c;
}

.log-item.error {
  color: #f56c6c;
}

.log-time {
  color: #909399;
  margin-right: 8px;
}

.log-type {
  font-weight: bold;
  margin-right: 8px;
}

.log-message {
  margin-right: 8px;
}

.log-data {
  background: #2d2d2d;
  border-radius: 3px;
  padding: 8px;
  margin-top: 5px;
  margin-left: 20px;
  color: #e4e7ed;
  font-size: 12px;
  overflow-x: auto;
}

.api-info {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.api-info h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-console {
    padding: 10px;
  }
  
  .test-buttons {
    flex-direction: column;
  }
  
  .test-buttons .el-button {
    width: 100%;
  }
  
  .output-area {
    height: 300px;
    font-size: 12px;
  }
}
</style> 