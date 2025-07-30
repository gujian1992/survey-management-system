<template>
  <!-- 登录页面不显示布局 -->
  <div v-if="$route.meta.hideLayout">
    <router-view />
  </div>
  
  <!-- 主应用布局 -->
  <div v-else class="app-container">
    <div class="sidebar">
      <div class="logo">
        <h2>问卷系统</h2>
      </div>
      <div class="menu-container">
        <!-- 管理员菜单 -->
        <template v-if="userStore.isAdmin">
          <div 
            class="menu-item" 
            :class="{ active: $route.path === '/dashboard' }"
            @click="navigateTo('/dashboard')"
          >
            仪表盘
          </div>
          <div 
            class="menu-item" 
            :class="{ active: $route.path === '/question-bank' }"
            @click="navigateTo('/question-bank')"
          >
            题库管理
          </div>
          <div 
            class="menu-item" 
            :class="{ active: $route.path === '/answer-sessions' }"
            @click="navigateTo('/answer-sessions')"
          >
            答题会话
          </div>
          <div 
            class="menu-item" 
            :class="{ active: $route.path === '/scoring' }"
            @click="navigateTo('/scoring')"
          >
            评分管理
          </div>
          <div 
            class="menu-item" 
            :class="{ active: $route.path === '/statistics' }"
            @click="navigateTo('/statistics')"
          >
            数据统计
          </div>
          <div 
            class="menu-item" 
            :class="{ active: $route.path === '/test-console' }"
            @click="navigateTo('/test-console')"
          >
            🧪 测试控制台
          </div>
        </template>
        
        <!-- 普通用户菜单 -->
        <template v-else>
          <div 
            class="menu-item" 
            :class="{ active: $route.path === '/start-answer' }"
            @click="navigateTo('/start-answer')"
          >
            开始答题
          </div>
          <div 
            class="menu-item" 
            :class="{ active: $route.path === '/my-answer-records' }"
            @click="navigateTo('/my-answer-records')"
          >
            我的记录
          </div>
        </template>
      </div>
    </div>
    
    <div class="main-container">
      <div class="header">
        <div class="user-info">
          <el-dropdown>
            <span class="user-name">
              <el-icon><User /></el-icon>
              {{ userStore.realName || userStore.username }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <span class="role-badge">{{ userStore.isAdmin ? '系统管理员' : '普通用户' }}</span>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { 
  User, 
  SwitchButton,
  Menu,
  Setting,
  Document,
  Timer,
  DataAnalysis
} from '@element-plus/icons-vue'

import { SimplePremiumDialog } from '@/utils/simplePremiumDialog.js'
import { ElMessage } from 'element-plus'
import { onMounted, nextTick } from 'vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const navigateTo = (path) => {
  if (route.path !== path) {
    router.push(path)
  }
}

const handleLogout = async () => {
  try {
    await SimplePremiumDialog.confirmLogout()
    
    try {
      // 先清除用户状态
      await userStore.logout()
      console.log('退出登录成功')
      
      // 等待下一个tick，确保状态更新完成
      await nextTick()
      
      // 然后再跳转到登录页
      await router.push('/login')
    } catch (error) {
      console.error('退出登录失败:', error)
      ElMessage.error('网络异常，退出失败，请重试')
    }
  } catch (error) {
    // 用户取消退出，不需要处理
  }
}

onMounted(() => {
  console.log('应用已启动')
})
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  background: #304156;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  margin: 0;
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.menu-container {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.menu-item {
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  color: #bfcbd9;
  padding: 0 20px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
  white-space: nowrap;
}

.menu-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.menu-item.active {
  color: white;
  background: #1890ff;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header {
  height: 64px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24px;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
}

.user-name:hover {
  background: #f5f7fa;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: #f0f2f5;
  position: relative;
}

/* Element Plus 覆盖样式 */
:deep(.el-dropdown-menu) {
  padding: 4px !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1) !important;
}

:deep(.el-dropdown-menu__item) {
  padding: 8px 16px !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
}

:deep(.el-dropdown-menu__item:not(.is-disabled):hover) {
  background: #f5f7fa !important;
  color: #1890ff !important;
}

:deep(.el-dropdown-menu__item i) {
  margin-right: 8px !important;
  font-size: 16px !important;
}
</style>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

#app {
  height: 100vh;
}
</style> 